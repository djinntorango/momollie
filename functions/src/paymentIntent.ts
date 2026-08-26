import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import Stripe from "stripe";
import * as admin from "firebase-admin";
import {getShippingRateOptions, ShippoAddress, PACKAGING, PACKAGING_TARE_LB} from "./shippoClient.js";
import {applyPromoCode} from "./promoCode.js";
import {resendApiKey} from "./email.js";
import {claimOrderForFulfillment, decrementStockForOrder, sendOrderEmails} from "./orderFulfillment.js";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const shippoApiKey = defineSecret("SHIPPO_API_KEY");

const ALLOWED_ORIGINS = ["https://momollie.web.app", "https://dearmomollie.com", "https://momollie.me"];
// PACKAGING and PACKAGING_TARE_LB imported from shippoClient.ts

interface CheckoutItem {
  productId: string;
  quantity: number;
  selections?: { productId: string }[];  // bundle slot selections
}

interface FirestoreProduct {
  name: string;
  price: number;
  salePercent?: number;
  image?: string;
  inStock?: boolean;
  stockQty?: number;
  weightLb?: number;
  freeShipping?: boolean;
}

interface FirestoreSettings {
  name?: string;
  street1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

/**
 * Creates a Stripe PaymentIntent and a pending Firestore order.
 * Amount is set to the items subtotal only — shipping is added by finalizePaymentIntent.
 */
export const createPaymentIntent = onCall(
  {secrets: [stripeSecretKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    const {items} = request.data as {items: CheckoutItem[]};

    if (!Array.isArray(items) || items.length === 0) {
      throw new HttpsError("invalid-argument", "No items provided");
    }

    const stripe = new Stripe(stripeSecretKey.value());
    const db = admin.firestore();

    const orderItems: Array<{
      productId: string;
      name: string;
      image: string;
      price: number;
      quantity: number;
      weightLb: number;
      freeShipping: boolean;
    }> = [];

    for (const item of items) {
      const snap = await db.collection("products").doc(item.productId).get();
      if (!snap.exists) {
        throw new HttpsError("not-found", `Product ${item.productId} not found`);
      }
      const product = snap.data() as FirestoreProduct;
      if (product.inStock === false) {
        throw new HttpsError("failed-precondition", `"${product.name}" is out of stock`);
      }
      if (typeof product.stockQty === "number" && product.stockQty <= 0) {
        throw new HttpsError("failed-precondition", `"${product.name}" is out of stock`);
      }

      const unitPrice = product.salePercent
        ? product.price * (1 - product.salePercent / 100)
        : product.price;

      // For bundles with slot selections, sum the actual selected products' weights.
      // For flat products, use the product's own weightLb.
      const isFreeShipping = product.freeShipping === true;
      let resolvedWeightLb: number;
      if (isFreeShipping) {
        resolvedWeightLb = product.weightLb ?? 0;
      } else if (item.selections && item.selections.length > 0) {
        const selSnaps = await Promise.all(
          item.selections.map((sel) => db.collection("products").doc(sel.productId).get())
        );
        resolvedWeightLb = selSnaps.reduce((sum, selSnap) => {
          const selProduct = selSnap.data() as FirestoreProduct | undefined;
          if (!selProduct?.weightLb) {
            throw new HttpsError(
              "failed-precondition",
              `A selected bundle item is missing weight data — contact the shop`
            );
          }
          return sum + selProduct.weightLb;
        }, 0);
      } else {
        if (!product.weightLb) {
          throw new HttpsError(
            "failed-precondition",
            `"${product.name}" is missing weight data — contact the shop`
          );
        }
        resolvedWeightLb = product.weightLb;
      }

      orderItems.push({
        productId: item.productId,
        name: product.name,
        image: product.image ?? "",
        price: unitPrice,
        quantity: item.quantity,
        weightLb: resolvedWeightLb,
        freeShipping: isFreeShipping,
      });
    }

    const subtotalCents = Math.round(
      orderItems.reduce((s, i) => s + i.price * i.quantity, 0) * 100
    );

    if (subtotalCents < 50) {
      throw new HttpsError("invalid-argument", "Order total must be at least $0.50");
    }

    // Reserve the Firestore doc ID before creating the PI so we can store it in metadata
    const orderRef = db.collection("orders").doc();

    const pi = await stripe.paymentIntents.create({
      amount: subtotalCents, // shipping added by finalizePaymentIntent
      currency: "usd",
      automatic_payment_methods: {enabled: true},
      metadata: {
        orderId: orderRef.id,
        subtotalCents: String(subtotalCents),
      },
    });

    await orderRef.set({
      status: "pending",
      stripePaymentIntentId: pi.id,
      items: orderItems,
      subtotal: subtotalCents / 100,
      total: subtotalCents / 100, // updated by finalizePaymentIntent
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      clientSecret: pi.client_secret!,
      paymentIntentId: pi.id,
      subtotalCents,
    };
  }
);

/**
 * Recalculates the shipping cost server-side from the actual destination ZIP,
 * updates the PaymentIntent amount, and updates the pre-created order.
 * Called just before the customer confirms payment.
 */
export const finalizePaymentIntent = onCall(
  {secrets: [stripeSecretKey, shippoApiKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    const {paymentIntentId, shippingTier, destinationZip, shippingAddress, email, promoCode} = request.data as {
      paymentIntentId: string;
      shippingTier: "standard" | "priority";
      destinationZip: string;
      shippingAddress?: {
        name: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
      email?: string;
      promoCode?: string;
    };

    if (!paymentIntentId || !destinationZip || !shippingTier) {
      throw new HttpsError("invalid-argument", "paymentIntentId, shippingTier, and destinationZip are required");
    }
    if (!/^\d{5}$/.test(destinationZip)) {
      throw new HttpsError("invalid-argument", "destinationZip must be a 5-digit ZIP");
    }

    const stripe = new Stripe(stripeSecretKey.value());
    const db = admin.firestore();

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    const subtotalCents = parseInt(pi.metadata?.subtotalCents ?? "0");
    const orderId = pi.metadata?.orderId;

    if (!orderId) {
      throw new HttpsError("not-found", "No order associated with this payment intent");
    }

    // Fetch order items for weight calculation
    const orderSnap = await db.collection("orders").doc(orderId).get();
    if (!orderSnap.exists) {
      throw new HttpsError("not-found", `Order ${orderId} not found`);
    }
    const orderData = orderSnap.data() as {
      items: Array<{weightLb?: number; name?: string; quantity: number; freeShipping?: boolean}>;
    };

    const allFreeShipping = orderData.items.every((i) => i.freeShipping === true);

    let shippingCostCents: number;
    let shippingServiceLevel: string;
    let shippoRateId: string | undefined;

    if (allFreeShipping) {
      shippingCostCents = 0;
      shippingServiceLevel = "Included";
    } else {
      const itemsWeight = orderData.items.reduce((sum, item) => {
        if (!item.weightLb) {
          throw new HttpsError("failed-precondition", `Item "${item.name}" is missing weight data`);
        }
        return sum + item.weightLb * item.quantity;
      }, 0);
      const totalWeightLb = Math.max(itemsWeight + PACKAGING_TARE_LB, 0.1);

      const settingsSnap = await db.collection("settings").doc("shipping").get();
      const settings = settingsSnap.exists ? (settingsSnap.data() as FirestoreSettings) : {};

      const addressFrom: ShippoAddress = {
        name: settings.name ?? "Dear Momollie",
        street1: settings.street1 ?? "123 Bakery Lane",
        city: settings.city ?? "Portland",
        state: settings.state ?? "OR",
        zip: settings.zip ?? "97201",
        country: settings.country ?? "US",
      };

      const addressTo: ShippoAddress = {
        name: "Customer",
        street1: "1 Main St",
        city: "",
        state: "",
        zip: destinationZip,
        country: "US",
      };

      const rates = await getShippingRateOptions(
        shippoApiKey.value(),
        addressFrom,
        addressTo,
        {...PACKAGING, weight: totalWeightLb.toFixed(2)}
      );

      const selectedRate = shippingTier === "priority" ? rates.priority : rates.standard;
      shippingCostCents = selectedRate.amountCents;
      shippingServiceLevel = selectedRate.serviceLevel;
      shippoRateId = selectedRate.rateId;
    }

    // Apply promo code discount (server-side re-validation)
    let discountCents = 0;
    let appliedPromoCode: string | null = null;
    if (promoCode) {
      const promoResult = await applyPromoCode(db, promoCode, subtotalCents);
      if (promoResult.valid && promoResult.discountCents) {
        discountCents = promoResult.discountCents;
        appliedPromoCode = promoCode.trim().toUpperCase();
      }
    }
    const discountedSubtotalCents = subtotalCents - discountCents;

    // Calculate tax for the destination ZIP
    let taxCents = 0;
    let taxError: string | null = null;
    try {
      const taxCalc = await stripe.tax.calculations.create({
        currency: "usd",
        line_items: [
          {
            amount: discountedSubtotalCents,
            reference: "items",
            tax_code: "txcd_99999999", // general physical goods
          },
        ],
        shipping_cost: {
          amount: shippingCostCents,
        },
        customer_details: {
          address: {postal_code: destinationZip, country: "US"},
          address_source: "shipping",
        },
        expand: ["line_items.data.tax_breakdown"],
      });
      taxCents = taxCalc.tax_amount_exclusive;
      console.log(`[finalizePaymentIntent] Tax: ${taxCents} cents for ZIP ${destinationZip}`);
    } catch (taxErr) {
      const msg = taxErr instanceof Error ? taxErr.message : String(taxErr);
      console.error("[finalizePaymentIntent] Stripe Tax calculation failed:", msg);
      taxError = msg;
    }

    const totalCents = discountedSubtotalCents + shippingCostCents + taxCents;

    // Increment promo code usage count atomically
    if (appliedPromoCode) {
      await db.collection("promoCodes").doc(appliedPromoCode).update({
        usageCount: admin.firestore.FieldValue.increment(1),
      });
    }

    // Update PaymentIntent with final amount
    await stripe.paymentIntents.update(paymentIntentId, {
      amount: totalCents,
      metadata: {
        ...pi.metadata,
        shippingTier,
        shippingCostCents: String(shippingCostCents),
        shippingServiceLevel: shippingServiceLevel,
        taxCents: String(taxCents),
        ...(appliedPromoCode ? {promoCode: appliedPromoCode, discountCents: String(discountCents)} : {}),
      },
    });

    // Update the pending order with confirmed shipping info and customer address
    const orderUpdate: Record<string, unknown> = {
      shippingTier,
      total: totalCents / 100,
      taxAmount: taxCents / 100,
      // Lock in the Shippo rate so preview and label creation use this exact quote
      ...(shippoRateId ? {
        shippoRateId,
        shippoRateAmountUsd: shippingCostCents / 100,
        shippoServiceLevel: shippingServiceLevel,
      } : {}),
      ...(appliedPromoCode ? {promoCode: appliedPromoCode, discountAmount: discountCents / 100} : {}),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (shippingAddress) {
      orderUpdate.customer = {
        name: shippingAddress.name,
        email: email ?? "",
        address: {
          line1: shippingAddress.line1,
          ...(shippingAddress.line2 ? {line2: shippingAddress.line2} : {}),
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
        },
      };
    }
    await db.collection("orders").doc(orderId).update(orderUpdate);

    return {
      totalCents,
      shippingCostCents,
      shippingServiceLevel,
      taxCents,
      taxError,
      discountCents,
    };
  }
);

/**
 * Called by the client immediately after stripe.confirmPayment() returns success.
 * Verifies with Stripe that the PI actually succeeded, then marks the order as paid.
 * This is the primary status update path — the webhook is a secondary fallback.
 */
export const completeOrder = onCall(
  {secrets: [stripeSecretKey, resendApiKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    const {paymentIntentId} = request.data as {paymentIntentId: string};
    if (!paymentIntentId) {
      throw new HttpsError("invalid-argument", "paymentIntentId is required");
    }

    const stripe = new Stripe(stripeSecretKey.value());
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.status !== "succeeded") {
      throw new HttpsError("failed-precondition", `Payment not yet confirmed (status: ${pi.status})`);
    }

    const orderId = pi.metadata?.orderId;
    if (!orderId) {
      throw new HttpsError("not-found", "No order associated with this payment");
    }

    const db = admin.firestore();
    const orderSnap = await db.collection("orders").doc(orderId).get();
    if (!orderSnap.exists) {
      throw new HttpsError("not-found", `Order ${orderId} not found`);
    }

    const updateData: Record<string, unknown> = {
      status: "paid",
      stripePaymentIntentId: pi.id,
      expiresAt: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Copy shipping from Stripe PI if not already saved (webhook fallback)
    const existing = orderSnap.data() as {customer?: {name?: string}};
    if (!existing.customer?.name && pi.shipping) {
      const addr = pi.shipping.address;
      updateData.customer = {
        name: pi.shipping.name ?? "",
        email: pi.receipt_email ?? "",
        address: {
          line1: addr?.line1 ?? "",
          ...(addr?.line2 ? {line2: addr.line2} : {}),
          city: addr?.city ?? "",
          state: addr?.state ?? "",
          zip: addr?.postal_code ?? "",
          country: addr?.country ?? "US",
        },
      };
    }

    // Only the caller that wins this claim runs fulfillment (stock decrement + emails) —
    // guards against double-processing when the webhook already won the race.
    const {claimed, orderData} = await claimOrderForFulfillment(db, orderId, updateData);
    if (!claimed) {
      return {orderId, alreadyPaid: true};
    }

    if (orderData) {
      await decrementStockForOrder(db, orderData.items ?? []);
      const mergedOrderData = {
        ...orderData,
        customer: (updateData.customer as typeof orderData.customer | undefined) ?? orderData.customer,
      };
      await sendOrderEmails(resendApiKey.value(), orderId, mergedOrderData, pi.receipt_email ?? "");
    }

    return {orderId, alreadyPaid: false};
  }
);

/**
 * Deletes all pending orders older than 4 hours. One-time / on-demand admin action.
 * After this runs, new pending orders auto-expire via Firestore TTL after 24 h.
 */
export const purgeStalePendingOrders = onCall(
  {cors: ALLOWED_ORIGINS},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const db = admin.firestore();
    const cutoff = admin.firestore.Timestamp.fromMillis(Date.now() - 4 * 60 * 60 * 1000);

    const snap = await db.collection("orders")
      .where("status", "==", "pending")
      .where("createdAt", "<", cutoff)
      .get();

    if (snap.empty) return {deleted: 0};

    for (let i = 0; i < snap.docs.length; i += 500) {
      const batch = db.batch();
      snap.docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    return {deleted: snap.size};
  }
);
