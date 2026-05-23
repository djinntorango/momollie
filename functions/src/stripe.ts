import {onCall, onRequest, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import Stripe from "stripe";
import * as admin from "firebase-admin";
import {getShippingRateOptions, ShippoAddress} from "./shippoClient.js";
import {resendApiKey, sendOrderConfirmation} from "./email.js";

import {isAdmin} from "./config.js";

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
  destinationZip?: string;
}

interface FirestoreProduct {
  name: string;
  price: number;
  salePercent?: number;
  image?: string;
  inStock?: boolean;
  stockQty?: number;
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

const ALLOWED_ORIGINS = ["https://momollie.web.app", "https://dearmomollie.com", "https://momollie.me"];

// Packaging dimensions (own packaging) — 12"×9"×6" box, 0.5 lb tare
const PACKAGING = {length: "12", width: "9", height: "6", distance_unit: "in", mass_unit: "lb"};
const PACKAGING_TARE_LB = 0.5;

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

    // Calculate total cart weight — all products must have weightLb set
    const itemsWeightLb = data.items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      if (!product?.weightLb) {
        throw new HttpsError(
          "failed-precondition",
          `Product "${product?.name ?? item.productId}" is missing weight data — update the product before checkout`
        );
      }
      return sum + product.weightLb * item.quantity;
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

    // Use customer's ZIP if provided, otherwise fall back to central US proxy
    const addressTo: ShippoAddress = data.destinationZip
      ? {name: "Customer", street1: "1 Main St", city: "", state: "", zip: data.destinationZip, country: "US"}
      : CENTRAL_US;

    // Get live USPS rates from Shippo, fall back to weight-based estimates on error
    let shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[];
    try {
      const rates = await getShippingRateOptions(
        shippoApiKey.value(),
        addressFrom,
        addressTo,
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
    if (!isAdmin(request.auth?.uid)) {
      throw new HttpsError("permission-denied", "Admin access required");
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
  {secrets: [stripeSecretKey, stripeWebhookSecret, resendApiKey], cors: ALLOWED_ORIGINS},
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

    // ── Payment Element flow (new) ──────────────────────────────────────────
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;

      // Only process PIs created by our createPaymentIntent function
      if (orderId) {
        const db = admin.firestore();

        // Build the update: always mark paid, only update customer if not already set
        const orderSnap = await db.collection("orders").doc(orderId).get();
        const existingCustomer = (orderSnap.data() as {customer?: {name?: string}} | undefined)?.customer;

        const baseUpdate: Record<string, unknown> = {
          status: "paid",
          stripePaymentIntentId: pi.id,
          expiresAt: admin.firestore.FieldValue.delete(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Only copy address from pi.shipping if we don't already have one from finalizePaymentIntent
        if (!existingCustomer?.name && pi.shipping) {
          const shipping = pi.shipping;
          const address = shipping.address;
          baseUpdate.customer = {
            name: shipping.name ?? "",
            email: pi.receipt_email ?? "",
            address: {
              line1: address?.line1 ?? "",
              ...(address?.line2 ? {line2: address.line2} : {}),
              city: address?.city ?? "",
              state: address?.state ?? "",
              zip: address?.postal_code ?? "",
              country: address?.country ?? "US",
            },
          };
        } else if (!existingCustomer?.name && pi.receipt_email) {
          // At least save the email if we somehow have it but no address
          baseUpdate["customer.email"] = pi.receipt_email;
        }

        await db.collection("orders").doc(orderId).update(baseUpdate);

        // Atomically decrement stockQty for each purchased product
        const orderForStock = await db.collection("orders").doc(orderId).get();
        const orderItemsForStock = (orderForStock.data() as {items?: Array<{productId: string; quantity: number}>})?.items ?? [];
        await Promise.all(
          orderItemsForStock.map(async (item) => {
            const productRef = db.collection("products").doc(item.productId);
            await db.runTransaction(async (tx) => {
              const snap = await tx.get(productRef);
              if (!snap.exists) return;
              const product = snap.data() as FirestoreProduct;
              if (typeof product.stockQty !== "number") return; // no tracking
              const newQty = Math.max(0, product.stockQty - item.quantity);
              tx.update(productRef, {
                stockQty: newQty,
                ...(newQty === 0 ? {inStock: false} : {}),
              });
            });
          })
        );

        // Fetch fresh order data for confirmation email
        const freshSnap = await db.collection("orders").doc(orderId).get();
        const orderData = freshSnap.data() as {
          items?: Array<{name: string; quantity: number; price: number}>;
          subtotal?: number;
          total?: number;
          shippingTier?: "standard" | "priority";
          customer?: {name?: string; email?: string; address?: {line1?: string; line2?: string; city?: string; state?: string; zip?: string; country?: string}};
        } | undefined;

        const emailTo = orderData?.customer?.email ?? pi.receipt_email ?? "";
        const nameFor = orderData?.customer?.name ?? "";
        const addrFor = orderData?.customer?.address;

        if (emailTo && orderData) {
          try {
            await sendOrderConfirmation(resendApiKey.value(), {
              orderId,
              customerName: nameFor,
              customerEmail: emailTo,
              items: (orderData.items ?? []).map((i) => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price,
              })),
              subtotal: orderData.subtotal ?? pi.amount / 100,
              total: orderData.total ?? pi.amount / 100,
              shippingTier: orderData.shippingTier ?? "standard",
              address: {
                line1: addrFor?.line1 ?? "",
                ...(addrFor?.line2 ? {line2: addrFor.line2} : {}),
                city: addrFor?.city ?? "",
                state: addrFor?.state ?? "",
                zip: addrFor?.zip ?? "",
                country: addrFor?.country ?? "US",
              },
            });
          } catch (emailErr) {
            console.error("[stripeWebhook/payment_intent.succeeded] Failed to send confirmation email:", emailErr);
          }
        }
      }

      res.json({received: true});
      return;
    }

    // ── Checkout Session flow (legacy) ───────────────────────────────────────
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

      const db = admin.firestore();

      const baseItems = lineItemsResponse.data.map((li) => {
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

      // Fetch product weights from Firestore so they're stored on the order
      const productSnaps = await Promise.all(
        baseItems.map((item) =>
          item.productId ? db.collection("products").doc(item.productId).get() : null
        )
      );
      const items = baseItems.map((item, i) => {
        const weightLb = (productSnaps[i]?.data() as {weightLb?: number} | undefined)?.weightLb;
        return weightLb !== undefined ? {...item, weightLb} : item;
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

      const orderRef = await db.collection("orders").add(orderData);

      // Send order confirmation email (best-effort — don't fail the webhook if it errors)
      if (customerEmail) {
        try {
          await sendOrderConfirmation(resendApiKey.value(), {
            orderId: orderRef.id,
            customerName: customerName,
            customerEmail: customerEmail,
            items: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal,
            total,
            shippingTier,
            address: {
              line1: address?.line1 ?? "",
              ...(address?.line2 ? {line2: address.line2} : {}),
              city: address?.city ?? "",
              state: address?.state ?? "",
              zip: address?.postal_code ?? "",
              country: address?.country ?? "US",
            },
          });
        } catch (emailErr) {
          console.error("[stripeWebhook] Failed to send order confirmation email:", emailErr);
        }
      }
    }

    res.json({received: true});
  }
);
