import * as admin from "firebase-admin";
import {sendOrderConfirmation, sendNewOrderAlert} from "./email.js";

interface FirestoreProduct {
  stockQty?: number;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderCustomer {
  name?: string;
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

export interface OrderData {
  items?: OrderItem[];
  subtotal?: number;
  total?: number;
  shippingTier?: "standard" | "priority";
  customer?: OrderCustomer;
  status?: string;
}

/**
 * Atomically transitions an order to "paid" (or whatever fields are passed)
 * only if it hasn't already been finalized. Both completeOrder (client-triggered)
 * and the payment_intent.succeeded webhook race to call this for the same order —
 * only the caller that wins the transaction should run fulfillment side effects
 * (stock decrement, emails), so those don't double-fire.
 */
export async function claimOrderForFulfillment(
  db: admin.firestore.Firestore,
  orderId: string,
  updateFields: Record<string, unknown>
): Promise<{claimed: boolean; orderData?: OrderData}> {
  const orderRef = db.collection("orders").doc(orderId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(orderRef);
    if (!snap.exists) return {claimed: false};
    const data = snap.data() as OrderData;
    if (data.status === "paid" || data.status === "shipped" || data.status === "delivered") {
      return {claimed: false};
    }
    tx.update(orderRef, updateFields);
    return {claimed: true, orderData: data};
  });
}

export async function decrementStockForOrder(
  db: admin.firestore.Firestore,
  items: Array<{productId: string; quantity: number}>
): Promise<void> {
  await Promise.all(
    items.map(async (item) => {
      const productRef = db.collection("products").doc(item.productId);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(productRef);
        if (!snap.exists) return;
        const product = snap.data() as FirestoreProduct;
        if (typeof product.stockQty !== "number") return;
        const newQty = Math.max(0, product.stockQty - item.quantity);
        tx.update(productRef, {
          stockQty: newQty,
          ...(newQty === 0 ? {inStock: false} : {}),
        });
      });
    })
  );
}

export async function sendOrderEmails(
  resendApiKeyValue: string,
  orderId: string,
  orderData: OrderData,
  fallbackEmail: string
): Promise<void> {
  const emailTo = orderData.customer?.email ?? fallbackEmail;
  const nameFor = orderData.customer?.name ?? "";
  const addrFor = orderData.customer?.address;
  const items = (orderData.items ?? []).map((i) => ({name: i.name, quantity: i.quantity, price: i.price}));
  const address = {
    line1: addrFor?.line1 ?? "",
    ...(addrFor?.line2 ? {line2: addrFor.line2} : {}),
    city: addrFor?.city ?? "",
    state: addrFor?.state ?? "",
    zip: addrFor?.zip ?? "",
    country: addrFor?.country ?? "US",
  };

  if (emailTo) {
    try {
      await sendOrderConfirmation(resendApiKeyValue, {
        orderId,
        customerName: nameFor,
        customerEmail: emailTo,
        items,
        subtotal: orderData.subtotal ?? 0,
        total: orderData.total ?? 0,
        shippingTier: orderData.shippingTier ?? "standard",
        address,
      });
    } catch (emailErr) {
      console.error(`[orderFulfillment] Failed to send confirmation email for order ${orderId}:`, emailErr);
    }
  }

  try {
    await sendNewOrderAlert(resendApiKeyValue, {
      orderId,
      customerName: nameFor,
      customerEmail: emailTo,
      items,
      total: orderData.total ?? 0,
      address,
    });
  } catch (alertErr) {
    console.error(`[orderFulfillment] Failed to send new order alert for order ${orderId}:`, alertErr);
  }
}
