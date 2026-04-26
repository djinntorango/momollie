import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import * as admin from "firebase-admin";
import {
  shippoPost,
  shippoValidateAddress,
  ShippoAddress,
  ShippoParcel,
  ShippoShipmentResponse,
  ShippoTransactionResponse,
  ShippoAddressValidation,
} from "./shippoClient.js";

const shippoApiKey = defineSecret("SHIPPO_API_KEY");

interface FirestoreOrder {
  customer: {
    name: string;
    email?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  shippingTier?: "standard" | "priority";
  items?: Array<{quantity: number; weightLb?: number}>;
  addressVerified?: boolean;
  addressIssues?: string[];
}

interface FirestoreSettings {
  name?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  email?: string;
  phone?: string;
}

const ALLOWED_ORIGINS = ["https://momollie.web.app", "https://momollie.me"];

export const verifyOrderAddresses = onCall(
  {secrets: [shippoApiKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {orderIds} = request.data as {orderIds: string[]};
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new HttpsError("invalid-argument", "orderIds must be a non-empty array");
    }

    const db = admin.firestore();
    const apiKey = shippoApiKey.value();

    const results: Record<string, {isValid: boolean; issues: string[]}> = {};

    await Promise.all(
      orderIds.map(async (orderId) => {
        const orderSnap = await db.collection("orders").doc(orderId).get();
        if (!orderSnap.exists) {
          results[orderId] = {isValid: false, issues: ["Order not found"]};
          return;
        }

        const order = orderSnap.data() as FirestoreOrder;
        const addr = order.customer.address;

        try {
          const validation = await shippoValidateAddress(apiKey, {
            name: order.customer.name,
            street1: addr.line1,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            country: addr.country || "US",
            ...(addr.line2 ? {street2: addr.line2} : {}),
          });

          const issues = validation.messages
            .filter((m) => m.type === "warning" || m.type === "error")
            .map((m) => m.text);

          results[orderId] = {isValid: validation.isValid, issues};

          await db.collection("orders").doc(orderId).update({
            addressVerified: validation.isValid,
            addressIssues: issues,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          results[orderId] = {isValid: false, issues: [`Verification failed: ${msg}`]};
          await db.collection("orders").doc(orderId).update({
            addressVerified: false,
            addressIssues: [`Verification failed: ${msg}`],
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      })
    );

    return results;
  }
);

export const validateAddress = onCall(
  {secrets: [shippoApiKey], cors: ALLOWED_ORIGINS},
  async (request): Promise<ShippoAddressValidation> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {name, line1, line2, city, state, zip, country} = request.data as {
      name: string; line1: string; line2?: string;
      city: string; state: string; zip: string; country?: string;
    };

    const apiKey = shippoApiKey.value();
    return shippoValidateAddress(apiKey, {
      name,
      street1: line1,
      ...(line2 ? {street2: line2} : {}),
      city,
      state,
      zip,
      country: country || "US",
    });
  }
);

const PRIORITY_KEYWORDS = ["priority"];
const STANDARD_KEYWORDS = ["ground", "parcel", "first class", "media"];

// Packaging dimensions (own packaging)
const PACKAGING = {length: "12", width: "9", height: "6", distance_unit: "in", mass_unit: "lb"};
const PACKAGING_TARE_LB = 0.5;
const DEFAULT_ITEM_WEIGHT_LB = 0.5;

export const createShippingLabel = onCall(
  {secrets: [shippoApiKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {orderId} = request.data as {orderId: string};
    if (!orderId) {
      throw new HttpsError("invalid-argument", "orderId is required");
    }

    const db = admin.firestore();

    const [orderSnap, settingsSnap] = await Promise.all([
      db.collection("orders").doc(orderId).get(),
      db.collection("settings").doc("shipping").get(),
    ]);

    if (!orderSnap.exists) {
      throw new HttpsError("not-found", `Order ${orderId} not found`);
    }
    const order = orderSnap.data() as FirestoreOrder;

    if (order.addressVerified === false) {
      const issues = order.addressIssues?.length
        ? ` Issues: ${order.addressIssues.join("; ")}`
        : "";
      throw new HttpsError(
        "failed-precondition",
        `Address failed USPS verification.${issues} Please correct the address or verify it before creating a label.`
      );
    }

    const settings: FirestoreSettings = settingsSnap.exists
      ? (settingsSnap.data() as FirestoreSettings)
      : {};

    const apiKey = shippoApiKey.value();

    const addressFrom: ShippoAddress = {
      name: settings.name ?? "Dear Momollie",
      street1: settings.street1 ?? "123 Bakery Lane",
      city: settings.city ?? "Portland",
      state: settings.state ?? "OR",
      zip: settings.zip ?? "97201",
      country: settings.country ?? "US",
      ...(settings.street2 ? {street2: settings.street2} : {}),
      ...(settings.email ? {email: settings.email} : {}),
      ...(settings.phone ? {phone: settings.phone} : {}),
    };

    const addressTo: ShippoAddress = {
      name: order.customer.name,
      street1: order.customer.address.line1,
      city: order.customer.address.city,
      state: order.customer.address.state,
      zip: order.customer.address.zip,
      country: order.customer.address.country || "US",
      ...(order.customer.address.line2 ? {street2: order.customer.address.line2} : {}),
      ...(order.customer.email ? {email: order.customer.email} : {}),
    };

    // Calculate actual package weight from order items
    const itemsWeight = (order.items ?? []).reduce((sum, item) => {
      return sum + (item.weightLb ?? DEFAULT_ITEM_WEIGHT_LB) * item.quantity;
    }, 0);
    const totalWeightLb = Math.max(itemsWeight + PACKAGING_TARE_LB, 0.1);

    const parcel: ShippoParcel = {
      ...PACKAGING,
      weight: totalWeightLb.toFixed(2),
    };

    console.log(`[createShippingLabel] orderId=${orderId} tier=${order.shippingTier ?? "standard"} weight=${totalWeightLb}lb`);
    console.log(`[createShippingLabel] addressTo=${JSON.stringify(addressTo)}`);

    const shipment = await shippoPost<ShippoShipmentResponse>(apiKey, "/shipments/", {
      address_from: addressFrom,
      address_to: addressTo,
      parcels: [parcel],
      async: false,
    });

    console.log(`[createShippingLabel] shipment id=${shipment.object_id} rateCount=${shipment.rates?.length ?? 0}`);

    if (!shipment.rates || shipment.rates.length === 0) {
      console.error("[createShippingLabel] No rates returned from Shippo");
      throw new HttpsError("internal", "No shipping rates returned from Shippo");
    }

    // Select USPS rate matching the customer's chosen shipping tier
    const shippingTier = order.shippingTier ?? "standard";
    const uspsRates = shipment.rates.filter((r) => r.provider.toUpperCase() === "USPS");
    console.log(`[createShippingLabel] uspsRateCount=${uspsRates.length} rates=${JSON.stringify(uspsRates.map((r) => ({id: r.object_id, service: r.servicelevel.name, amount: r.amount})))}`);

    const keywords = shippingTier === "priority" ? PRIORITY_KEYWORDS : STANDARD_KEYWORDS;
    const tierRates = uspsRates.filter((r) =>
      keywords.some((k) => r.servicelevel.name.toLowerCase().includes(k))
    );

    const ratePool =
      tierRates.length > 0 ? tierRates
      : uspsRates.length > 0 ? uspsRates
      : shipment.rates;

    const cheapestRate = ratePool.reduce((best, r) =>
      parseFloat(r.amount) < parseFloat(best.amount) ? r : best
    );

    console.log(`[createShippingLabel] selectedRate=${cheapestRate.object_id} service="${cheapestRate.servicelevel.name}" amount=${cheapestRate.amount}`);

    const transaction = await shippoPost<ShippoTransactionResponse>(apiKey, "/transactions/", {
      rate: cheapestRate.object_id,
      label_file_type: "PDF",
      async: false,
    });

    console.log(`[createShippingLabel] transaction object_state=${transaction.object_state} label_url="${transaction.label_url}" tracking=${transaction.tracking_number} messages=${JSON.stringify(transaction.messages ?? [])}`);

    if (transaction.object_state !== "VALID" || !transaction.label_url) {
      const msg = transaction.messages?.map((m) => m.text).join("; ") || "No label URL returned";
      console.error(`[createShippingLabel] Label creation failed: ${msg}`);
      throw new HttpsError("internal", `Label creation failed: ${msg}`);
    }

    console.log(`[createShippingLabel] SUCCESS — writing to Firestore orderId=${orderId}`);

    await db.collection("orders").doc(orderId).update({
      status: "shipped",
      shippoLabelUrl: transaction.label_url,
      trackingNumber: transaction.tracking_number,
      trackingCarrier: "USPS",
      trackingUrl: transaction.tracking_url_provider,
      shippedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      labelUrl: transaction.label_url,
      trackingNumber: transaction.tracking_number,
      trackingUrl: transaction.tracking_url_provider,
      rateCost: parseFloat(cheapestRate.amount),
    };
  }
);
