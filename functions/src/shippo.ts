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
  PACKAGING,
  PACKAGING_TARE_LB,
} from "./shippoClient.js";
import {resendApiKey, sendShippingNotification} from "./email.js";

import {isAdmin} from "./config.js";

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
  items?: Array<{productId?: string; name?: string; quantity: number; weightLb?: number; price?: number; salePrice?: number}>;
  addressVerified?: boolean;
  addressIssues?: string[];
  shippoRateId?: string;
  shippoRateAmountUsd?: number;
  shippoServiceLevel?: string;
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

const ALLOWED_ORIGINS = ["https://momollie.web.app", "https://dearmomollie.com", "https://momollie.me"];

export const verifyOrderAddresses = onCall(
  {secrets: [shippoApiKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    if (!isAdmin(request.auth?.uid)) {
      throw new HttpsError("permission-denied", "Admin access required");
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
    if (!isAdmin(request.auth?.uid)) {
      throw new HttpsError("permission-denied", "Admin access required");
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

// PACKAGING and PACKAGING_TARE_LB imported from shippoClient.ts

interface EstimateItem {
  productId: string;
  quantity: number;
  selections?: { productId: string }[];  // bundle slot selections
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

    // Collect all product IDs we need to fetch: the top-level product + any selection sub-products
    const allProductIds = new Set<string>();
    for (const item of items) {
      allProductIds.add(item.productId);
      if (item.selections) {
        for (const sel of item.selections) allProductIds.add(sel.productId);
      }
    }
    const idList = Array.from(allProductIds);

    const [productSnapsMap, settingsSnap] = await Promise.all([
      Promise.all(idList.map((id) => db.collection("products").doc(id).get())).then((snaps) => {
        const m = new Map<string, FirestoreProductWeight>();
        snaps.forEach((snap, i) => { if (snap.exists) m.set(idList[i], snap.data() as FirestoreProductWeight); });
        return m;
      }),
      db.collection("settings").doc("shipping").get(),
    ]);

    const itemsWeightLb = items.reduce((sum, item) => {
      let itemWeight: number;
      if (item.selections && item.selections.length > 0) {
        // Bundle: sum the weights of the actually selected products
        itemWeight = item.selections.reduce((s, sel) => {
          const selProduct = productSnapsMap.get(sel.productId);
          if (!selProduct?.weightLb) {
            throw new HttpsError(
              "failed-precondition",
              `Selected product ${sel.productId} is missing weight data`
            );
          }
          return s + selProduct.weightLb;
        }, 0);
      } else {
        // Flat product: use the product's own weight
        const product = productSnapsMap.get(item.productId);
        if (!product?.weightLb) {
          throw new HttpsError(
            "failed-precondition",
            `Product ${item.productId} is missing weight data — update the product before estimating shipping`
          );
        }
        itemWeight = product.weightLb;
      }
      return sum + itemWeight * item.quantity;
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
      {...PACKAGING, weight: totalWeightLb.toFixed(2)}
    );
  }
);

/**
 * Returns the selected rate details (service, cost) without purchasing.
 * Used to show a cost-preview modal before the admin commits to buying.
 */
export const previewShippingLabel = onCall(
  {secrets: [shippoApiKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    if (!isAdmin(request.auth?.uid)) throw new HttpsError("permission-denied", "Admin access required");

    const {orderId} = request.data as {orderId: string};
    if (!orderId) throw new HttpsError("invalid-argument", "orderId is required");

    const db = admin.firestore();
    const [orderSnap, settingsSnap] = await Promise.all([
      db.collection("orders").doc(orderId).get(),
      db.collection("settings").doc("shipping").get(),
    ]);
    if (!orderSnap.exists) throw new HttpsError("not-found", `Order ${orderId} not found`);

    const order = orderSnap.data() as FirestoreOrder;

    // If the checkout locked in a rate, return it directly — no need to re-query Shippo.
    // This ensures the preview matches exactly what createShippingLabel will charge.
    if (order.shippoRateId && order.shippoRateAmountUsd) {
      return {
        serviceLevel: order.shippoServiceLevel ?? (order.shippingTier === "priority" ? "USPS Priority Mail" : "USPS Ground Advantage"),
        carrier: "USPS",
        amountUsd: order.shippoRateAmountUsd,
        estimatedDays: null,
      };
    }

    const settings: FirestoreSettings = settingsSnap.exists ? (settingsSnap.data() as FirestoreSettings) : {};
    const apiKey = shippoApiKey.value();

    const addressFrom: ShippoAddress = {
      name: settings.name ?? "Dear Momollie",
      street1: settings.street1 ?? "123 Bakery Lane",
      city: settings.city ?? "Portland",
      state: settings.state ?? "OR",
      zip: settings.zip ?? "97201",
      country: settings.country ?? "US",
      ...(settings.street2 ? {street2: settings.street2} : {}),
    };

    const addressTo: ShippoAddress = {
      name: order.customer.name,
      street1: order.customer.address.line1,
      city: order.customer.address.city,
      state: order.customer.address.state,
      zip: order.customer.address.zip,
      country: order.customer.address.country || "US",
      ...(order.customer.address.line2 ? {street2: order.customer.address.line2} : {}),
    };

    const itemsWeight = (order.items ?? []).reduce((sum, item) => {
      if (item.weightLb === undefined) {
        throw new HttpsError("failed-precondition", `Item "${item.name ?? item.productId}" is missing weight`);
      }
      return sum + item.weightLb * item.quantity;
    }, 0);
    const totalWeightLb = Math.max(itemsWeight + PACKAGING_TARE_LB, 0.1);

    const shipment = await shippoPost<ShippoShipmentResponse>(apiKey, "/shipments/", {
      address_from: addressFrom,
      address_to: addressTo,
      parcels: [{...PACKAGING, weight: totalWeightLb.toFixed(2)}],
      async: false,
    });

    if (!shipment.rates || shipment.rates.length === 0) {
      throw new HttpsError("internal", "No shipping rates returned from Shippo");
    }

    const shippingTier = order.shippingTier ?? "standard";
    const uspsRates = shipment.rates.filter((r) => r.provider.toUpperCase() === "USPS");
    const keywords = shippingTier === "priority" ? PRIORITY_KEYWORDS : STANDARD_KEYWORDS;
    const tierRates = uspsRates.filter((r) =>
      keywords.some((k) => r.servicelevel.name.toLowerCase().includes(k))
    );
    const ratePool = tierRates.length > 0 ? tierRates : uspsRates.length > 0 ? uspsRates : shipment.rates;
    const rate = ratePool.reduce((best, r) =>
      parseFloat(r.amount) < parseFloat(best.amount) ? r : best
    );

    return {
      serviceLevel: rate.servicelevel.name,
      carrier: rate.provider,
      amountUsd: parseFloat(rate.amount),
      estimatedDays: rate.estimated_days ?? null,
    };
  }
);

export const createShippingLabel = onCall(
  {secrets: [shippoApiKey, resendApiKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    if (!isAdmin(request.auth?.uid)) {
      throw new HttpsError("permission-denied", "Admin access required");
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

    const shippingTier = order.shippingTier ?? "standard";
    console.log(`[createShippingLabel] orderId=${orderId} tier=${shippingTier} weight=${totalWeightLb}lb`);
    console.log(`[createShippingLabel] addressTo=${JSON.stringify(addressTo)}`);

    let transaction: ShippoTransactionResponse | undefined;
    let labelCostUsd = 0;

    // Attempt 1: purchase the exact rate locked in at checkout to avoid price drift
    if (order.shippoRateId) {
      try {
        const t = await shippoPost<ShippoTransactionResponse>(apiKey, "/transactions/", {
          rate: order.shippoRateId,
          label_file_type: "PDF",
          async: false,
        });
        if (t.object_state === "VALID" && t.label_url) {
          transaction = t;
          labelCostUsd = order.shippoRateAmountUsd ?? 0;
          console.log(`[createShippingLabel] Used locked checkout rate ${order.shippoRateId}, cost=$${labelCostUsd}`);
        } else {
          console.log(`[createShippingLabel] Locked rate invalid (state=${t.object_state}), falling back to fresh rates`);
        }
      } catch (rateErr) {
        console.log(`[createShippingLabel] Locked rate expired or failed, falling back to fresh rates: ${rateErr}`);
      }
    }

    // Attempt 2: fresh rate lookup (runs when no stored rate or stored rate expired)
    if (!transaction) {
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

      const t = await shippoPost<ShippoTransactionResponse>(apiKey, "/transactions/", {
        rate: cheapestRate.object_id,
        label_file_type: "PDF",
        async: false,
      });

      console.log(`[createShippingLabel] transaction object_state=${t.object_state} label_url="${t.label_url}" tracking=${t.tracking_number} messages=${JSON.stringify(t.messages ?? [])}`);

      if (t.object_state !== "VALID" || !t.label_url) {
        const msg = t.messages?.map((m) => m.text).join("; ") || "No label URL returned";
        console.error(`[createShippingLabel] Label creation failed: ${msg}`);
        throw new HttpsError("internal", `Label creation failed: ${msg}`);
      }

      transaction = t;
      labelCostUsd = parseFloat(cheapestRate.amount);
    }

    console.log(`[createShippingLabel] SUCCESS — writing to Firestore orderId=${orderId}`);

    // transaction is guaranteed defined here (we threw above if fresh lookup failed)
    const tx = transaction as ShippoTransactionResponse;

    await db.collection("orders").doc(orderId).update({
      status: "shipped",
      shippoLabelUrl: tx.label_url,
      trackingNumber: tx.tracking_number,
      trackingCarrier: "USPS",
      trackingUrl: tx.tracking_url_provider,
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
            price: item.price ?? 0,
            salePrice: item.salePrice,
          })),
          trackingNumber: tx.tracking_number,
          trackingUrl: tx.tracking_url_provider,
          shippingTier: order.shippingTier ?? "standard",
        });
      } catch (emailErr) {
        console.error("[createShippingLabel] Failed to send shipping notification email:", emailErr);
      }
    }

    return {
      labelUrl: tx.label_url,
      trackingNumber: tx.tracking_number,
      trackingUrl: tx.tracking_url_provider,
      rateCost: labelCostUsd,
    };
  }
);

// ---------------------------------------------------------------------------
// markOrderShipped — admin-only, for orders shipped outside the label flow.
// Updates the order and sends the customer a shipping notification.
// ---------------------------------------------------------------------------

interface MarkOrderShippedRequest {
  orderId: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUrl?: string;
}

export const markOrderShipped = onCall(
  {secrets: [resendApiKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    if (!isAdmin(request.auth?.uid)) {
      throw new HttpsError("permission-denied", "Admin access required");
    }

    const data = request.data as MarkOrderShippedRequest;
    if (!data.orderId) {
      throw new HttpsError("invalid-argument", "orderId is required");
    }

    const db = admin.firestore();
    const orderRef = db.collection("orders").doc(data.orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      throw new HttpsError("not-found", `Order ${data.orderId} not found`);
    }
    const order = orderSnap.data() as FirestoreOrder;

    const trackingNumber = data.trackingNumber?.trim() || undefined;
    const trackingCarrier = data.trackingCarrier?.trim() || "USPS";
    const trackingUrl = data.trackingUrl?.trim() || undefined;

    await orderRef.update({
      status: "shipped",
      shippedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(trackingNumber ? {
        trackingNumber,
        trackingCarrier,
        ...(trackingUrl ? {trackingUrl} : {}),
      } : {}),
    });

    // Best-effort — the order is already marked shipped; report email status to the caller.
    let emailSent = false;
    if (order.customer?.email) {
      try {
        await sendShippingNotification(resendApiKey.value(), {
          orderId: data.orderId,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          items: (order.items ?? []).map((item) => ({
            name: item.name ?? "",
            quantity: item.quantity,
            price: item.price ?? 0,
            salePrice: item.salePrice,
          })),
          trackingNumber,
          trackingUrl,
          trackingCarrier,
          shippingTier: order.shippingTier ?? "standard",
        });
        emailSent = true;
      } catch (emailErr) {
        console.error(`[markOrderShipped] Failed to send shipping notification for order ${data.orderId}:`, emailErr);
      }
    }

    return {emailSent};
  }
);
