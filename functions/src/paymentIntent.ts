import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import Stripe from "stripe";
import * as admin from "firebase-admin";
import {getShippingRateOptions, ShippoAddress} from "./shippoClient.js";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const shippoApiKey = defineSecret("SHIPPO_API_KEY");

const ALLOWED_ORIGINS = ["https://momollie.web.app", "https://momollie.me"];
const PACKAGING = {length: "12", width: "9", height: "6", distance_unit: "in", mass_unit: "lb"};
const PACKAGING_TARE_LB = 0.5;

interface CheckoutItem {
  productId: string;
  quantity: number;
}

interface FirestoreProduct {
  name: string;
  price: number;
  salePercent?: number;
  image?: string;
  inStock?: boolean;
  weightLb?: number;
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
      if (!product.weightLb) {
        throw new HttpsError(
          "failed-precondition",
          `"${product.name}" is missing weight data — contact the shop`
        );
      }

      const unitPrice = product.salePercent
        ? product.price * (1 - product.salePercent / 100)
        : product.price;

      orderItems.push({
        productId: item.productId,
        name: product.name,
        image: product.image ?? "",
        price: unitPrice,
        quantity: item.quantity,
        weightLb: product.weightLb,
      });
    }

    const subtotalCents = Math.round(
      orderItems.reduce((s, i) => s + i.price * i.quantity, 0) * 100
    );

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
      status: "pending_payment",
      stripePaymentIntentId: pi.id,
      items: orderItems,
      subtotal: subtotalCents / 100,
      total: subtotalCents / 100, // updated by finalizePaymentIntent
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
    const {paymentIntentId, shippingTier, destinationZip} = request.data as {
      paymentIntentId: string;
      shippingTier: "standard" | "priority";
      destinationZip: string;
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
      items: Array<{weightLb?: number; name?: string; quantity: number}>;
    };

    const itemsWeight = orderData.items.reduce((sum, item) => {
      if (!item.weightLb) {
        throw new HttpsError("failed-precondition", `Item "${item.name}" is missing weight data`);
      }
      return sum + item.weightLb * item.quantity;
    }, 0);
    const totalWeightLb = Math.max(itemsWeight + PACKAGING_TARE_LB, 0.1);

    // Recalculate shipping from actual destination ZIP
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
    const shippingCostCents = selectedRate.amountCents;
    const totalCents = subtotalCents + shippingCostCents;

    // Update PaymentIntent with final amount
    await stripe.paymentIntents.update(paymentIntentId, {
      amount: totalCents,
      metadata: {
        ...pi.metadata,
        shippingTier,
        shippingCostCents: String(shippingCostCents),
        shippingServiceLevel: selectedRate.serviceLevel,
      },
    });

    // Update the pending order with confirmed shipping info
    await db.collection("orders").doc(orderId).update({
      shippingTier,
      total: totalCents / 100,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      totalCents,
      shippingCostCents,
      shippingServiceLevel: selectedRate.serviceLevel,
    };
  }
);
