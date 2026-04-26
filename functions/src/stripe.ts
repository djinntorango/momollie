import {onCall, onRequest, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import Stripe from "stripe";
import * as admin from "firebase-admin";
import {getShippingRateOptions, ShippoAddress} from "./shippoClient.js";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const shippoApiKey = defineSecret("SHIPPO_API_KEY");

interface CheckoutItem {
  productId: string;
  quantity: number;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  origin: string;
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

const ALLOWED_ORIGINS = ["https://momollie.web.app", "https://momollie.me"];

// Packaging dimensions (own packaging) — 12"×9"×6" box, 0.5 lb tare
const PACKAGING = {length: "12", width: "9", height: "6", distance_unit: "in", mass_unit: "lb"};
const PACKAGING_TARE_LB = 0.5;
const DEFAULT_ITEM_WEIGHT_LB = 0.5;

// Central US destination for fair zone-average rate estimation
const CENTRAL_US: ShippoAddress = {
  name: "Estimate",
  street1: "1 Main St",
  city: "Kansas City",
  state: "MO",
  zip: "64101",
  country: "US",
};

export const createCheckoutSession = onCall(
  {secrets: [stripeSecretKey, shippoApiKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    const data = request.data as CheckoutRequest;

    if (!data.items || data.items.length === 0) {
      throw new HttpsError("invalid-argument", "No items provided");
    }

    const stripe = new Stripe(stripeSecretKey.value());
    const db = admin.firestore();

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const productMap = new Map<string, FirestoreProduct>();

    for (const item of data.items) {
      const docSnap = await db.collection("products").doc(item.productId).get();
      if (!docSnap.exists) {
        throw new HttpsError("not-found", `Product ${item.productId} not found`);
      }

      const product = docSnap.data() as FirestoreProduct;
      productMap.set(item.productId, product);

      if (product.inStock === false) {
        throw new HttpsError("failed-precondition", `Product "${product.name}" is out of stock`);
      }

      const unitAmount = product.salePercent
        ? Math.round(product.price * (1 - product.salePercent / 100) * 100)
        : Math.round(product.price * 100);

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: product.image?.startsWith("https://") ? [product.image] : [],
            metadata: {productId: item.productId},
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      });
    }

    // Calculate total cart weight
    const itemsWeightLb = data.items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + (product?.weightLb ?? DEFAULT_ITEM_WEIGHT_LB) * item.quantity;
    }, 0);
    const totalWeightLb = Math.max(itemsWeightLb + PACKAGING_TARE_LB, 0.1);

    // Fetch from-address from settings (for accurate zone calculation)
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

    // Get live USPS rates from Shippo, fall back to weight-based estimates on error
    let shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[];
    try {
      const rates = await getShippingRateOptions(
        shippoApiKey.value(),
        addressFrom,
        CENTRAL_US,
        {...PACKAGING, weight: totalWeightLb.toFixed(2)}
      );

      shippingOptions = [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {amount: rates.standard.amountCents, currency: "usd"},
            display_name: `Standard Shipping (${rates.standard.serviceLevel})`,
            metadata: {tier: "standard"},
            delivery_estimate: {
              minimum: {unit: "business_day", value: 3},
              maximum: {unit: "business_day", value: 7},
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {amount: rates.priority.amountCents, currency: "usd"},
            display_name: `Priority Shipping (${rates.priority.serviceLevel})`,
            metadata: {tier: "priority"},
            delivery_estimate: {
              minimum: {unit: "business_day", value: 1},
              maximum: {unit: "business_day", value: 3},
            },
          },
        },
      ];
    } catch (err) {
      console.warn("Shippo rate fetch failed, using fallback rates:", err);
      const weightTier =
        totalWeightLb <= 1 ? 0
        : totalWeightLb <= 2 ? 1
        : totalWeightLb <= 5 ? 2
        : 3;
      const standardAmounts = [595, 795, 1095, 1495];
      const priorityAmounts = [995, 1295, 1595, 1995];

      shippingOptions = [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {amount: standardAmounts[weightTier], currency: "usd"},
            display_name: "Standard Shipping (USPS Ground Advantage)",
            metadata: {tier: "standard"},
            delivery_estimate: {
              minimum: {unit: "business_day", value: 3},
              maximum: {unit: "business_day", value: 7},
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {amount: priorityAmounts[weightTier], currency: "usd"},
            display_name: "Priority Shipping (USPS Priority Mail)",
            metadata: {tier: "priority"},
            delivery_estimate: {
              minimum: {unit: "business_day", value: 1},
              maximum: {unit: "business_day", value: 3},
            },
          },
        },
      ];
    }

    const origin = data.origin || "https://momollie.web.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      shipping_address_collection: {allowed_countries: ["US"]},
      shipping_options: shippingOptions,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {items: JSON.stringify(data.items)},
    });

    return {url: session.url};
  }
);

export const createRefund = onCall(
  {secrets: [stripeSecretKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {orderId, amountCents} = request.data as {orderId: string; amountCents?: number};
    if (!orderId) {
      throw new HttpsError("invalid-argument", "orderId is required");
    }

    const db = admin.firestore();
    const orderSnap = await db.collection("orders").doc(orderId).get();
    if (!orderSnap.exists) {
      throw new HttpsError("not-found", `Order ${orderId} not found`);
    }

    const order = orderSnap.data() as {
      stripePaymentIntentId?: string;
      total?: number;
      status?: string;
    };

    if (!order.stripePaymentIntentId) {
      throw new HttpsError("failed-precondition", "Order has no payment intent — cannot refund");
    }
    if (order.status === "cancelled") {
      throw new HttpsError("failed-precondition", "Order is already cancelled");
    }

    const stripe = new Stripe(stripeSecretKey.value());

    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: order.stripePaymentIntentId,
    };
    if (amountCents && amountCents > 0) {
      refundParams.amount = amountCents;
    }

    const refund = await stripe.refunds.create(refundParams);

    const totalCents = Math.round((order.total ?? 0) * 100);
    const isFullRefund = !amountCents || amountCents >= totalCents;

    await db.collection("orders").doc(orderId).update({
      refundId: refund.id,
      refundAmount: refund.amount / 100,
      refundedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(isFullRefund ? {status: "cancelled"} : {}),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      refundId: refund.id,
      refundAmount: refund.amount / 100,
      status: refund.status,
      isFullRefund,
    };
  }
);

export const stripeWebhook = onRequest(
  {secrets: [stripeSecretKey, stripeWebhookSecret], cors: ALLOWED_ORIGINS},
  async (req, res) => {
    const stripe = new Stripe(stripeSecretKey.value());
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      res.status(400).send("Missing stripe-signature header");
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).send(`Webhook Error: ${msg}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const [lineItemsResponse, fullSession] = await Promise.all([
        stripe.checkout.sessions.listLineItems(session.id, {expand: ["data.price.product"]}),
        stripe.checkout.sessions.retrieve(session.id, {expand: ["shipping_cost.shipping_rate"]}),
      ]);

      const shippingRate = fullSession.shipping_cost?.shipping_rate as Stripe.ShippingRate | undefined;
      const shippingTier = shippingRate?.metadata?.tier === "priority" ? "priority" : "standard";

      const shipping = fullSession.shipping_details;
      const customerName = fullSession.customer_details?.name ?? "Unknown";
      const customerEmail = fullSession.customer_details?.email ?? "";
      const address = shipping?.address ?? fullSession.customer_details?.address;

      const items = lineItemsResponse.data.map((li) => {
        const stripeProduct = li.price?.product as Stripe.Product | undefined;
        const productId = stripeProduct?.metadata?.productId ?? "";
        const unitAmount = li.price?.unit_amount ?? 0;
        return {
          productId,
          name: li.description ?? "",
          image: stripeProduct?.images?.[0] ?? "",
          price: unitAmount / 100,
          quantity: li.quantity ?? 1,
        };
      });

      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const total = (session.amount_total ?? 0) / 100;

      const orderData = {
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? "",
        status: "paid",
        customer: {
          name: customerName,
          email: customerEmail,
          address: {
            line1: address?.line1 ?? "",
            ...(address?.line2 ? {line2: address.line2} : {}),
            city: address?.city ?? "",
            state: address?.state ?? "",
            zip: address?.postal_code ?? "",
            country: address?.country ?? "US",
          },
        },
        items,
        subtotal,
        total,
        shippingTier,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const db = admin.firestore();
      await db.collection("orders").add(orderData);
    }

    res.json({received: true});
  }
);
