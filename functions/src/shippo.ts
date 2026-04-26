import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import * as admin from "firebase-admin";
import {
  shippoPost,
  shippoValidateAddress,
  getShippingRateOptions,
  ShippoAddress,
  ShippoParcel,
  ShippoShipmentResponse,
  ShippoTransactionResponse,
  ShippoAddressValidation,
  ShippingRateOptions,
} from "./shippoClient.js";
import {resendApiKey, sendShippingNotification} from "./email.js";

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
  items?: Array<{productId?: string; name?: string; quantity: number; weightLb?: number}>;
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
const PACKAGING_DIMS = {length: "12", width: "9", height: "6", distance_unit: "in", mass_unit: "lb"};
const PACKAGING_TARE_LB = 0.5;

interface EstimateItem {
  productId: string;
  quantity: number;
}

interface FirestoreProductWeight {
  weightLb?: number;
}

export const getShippingEstimate = onCall(
  {secrets: [shippoApiKey], cors: ALLOWED_ORIGINS},
  async (request): Promise<ShippingRateOptions> => {
    const {destinationZip, items} = request.data as {
      destinationZip: string;
      items: EstimateItem[];
    };

    if (!destinationZip || !/^\d{5}$/.test(destinationZip)) {
      throw new HttpsError("invalid-argument", "destinationZip must be a 5-digit ZIP code");
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new HttpsError("invalid-argument", "items must be a non-empty array");
    }

    const db = admin.firestore();
    const apiKey = shippoApiKey.value();

    const [productSnaps, settingsSnap] = await Promise.all([
      Promise.all(items.map((item) => db.collection("products").doc(item.productId).get())),
      db.collection("settings").doc("shipping").get(),
    ]);

    const itemsWeightLb = items.reduce((sum, item, i) => {
      const product = productSnaps[i].data() as FirestoreProductWeight | undefined;
      if (!product?.weightLb) {
        throw new HttpsError(
          "failed-precondition",
          `Product ${item.productId} is missing weight data — update the product before estimating shipping`
        );
      }
      return sum + product.weightLb * item.quantity;
    }, 0);
    const totalWeightLb = Math.max(itemsWeightLb + PACKAGING_TARE_LB, 0.1);

    const settings: FirestoreSettings = settingsSnap.exists
      ? (settingsSnap.data() as FirestoreSettings)
      : {};

    const addressFrom: ShippoAddress = {
      name: settings.name ?? "Dear Momollie",
      street1: settings.street1 ?? "123 Bakery Lane",
      city: settings.city ?? "Portland",
      state: settings.state ?? "OR",
      zip: settings.zip ?? "97201",
      country: settings.country ?? "US",
    };

    // Shippo resolves city/state from ZIP — street1 is required by the API but
    // not used for zone calculation, so a placeholder is fine here.
    const addressTo: ShippoAddress = {
      name: "Customer",
      street1: "1 Main St",
      city: "",
      state: "",
      zip: destinationZip,
      country: "US",
    };

    return getShippingRateOptions(
      apiKey,
      addressFrom,
      addressTo,
      {...PACKAGING_DIMS, weight: totalWeightLb.toFixed(2)}
    );
  }
);

// PACKAGING alias for createShippingLabel
const PACKAGING = PACKAGING_DIMS;

export const createShippingLabel = onCall(
  {secrets: [shippoApiKey, resendApiKey], cors: ALLOWED_ORIGINS},
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

    // Calculate actual package weight from order items — weightLb must be set on every item
    const itemsWeight = (order.items ?? []).reduce((sum, item) => {
      if (item.weightLb === undefined) {
        throw new HttpsError(
          "failed-precondition",
          `Order item "${item.name ?? item.productId}" is missing weight data — re-check product settings before creating a label`
        );
      }
      return sum + item.weightLb * item.quantity;
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

    const labelCostUsd = parseFloat(cheapestRate.amount);

    await db.collection("orders").doc(orderId).update({
      status: "shipped",
      shippoLabelUrl: transaction.label_url,
      trackingNumber: transaction.tracking_number,
      trackingCarrier: "USPS",
      trackingUrl: transaction.tracking_url_provider,
      labelCostUsd,
      shippedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send shipping notification email (best-effort — don't fail the label creation if it errors)
    if (order.customer.email) {
      try {
        await sendShippingNotification(resendApiKey.value(), {
          orderId,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          items: (order.items ?? []).map((item) => ({
            name: item.name ?? "",
            quantity: item.quantity,
            price: 0, // price not needed for shipping notification display
          })),
          trackingNumber: transaction.tracking_number,
          trackingUrl: transaction.tracking_url_provider,
          shippingTier: order.shippingTier ?? "standard",
        });
      } catch (emailErr) {
        console.error("[createShippingLabel] Failed to send shipping notification email:", emailErr);
      }
    }

    return {
      labelUrl: transaction.label_url,
      trackingNumber: transaction.tracking_number,
      trackingUrl: transaction.tracking_url_provider,
      rateCost: labelCostUsd,
    };
  }
);
