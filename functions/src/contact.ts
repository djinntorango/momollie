import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
  resendApiKey,
  sendContactNotification,
  sendOrderNoteEmail,
} from "./email.js";

const ALLOWED_ORIGINS = ["https://momollie.web.app", "https://dearmomollie.com"];

// ---------------------------------------------------------------------------
// sendContactEmail — public, anyone on the site can submit the contact form
// ---------------------------------------------------------------------------

interface SendContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactEmail = onCall(
  {secrets: [resendApiKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    const data = request.data as SendContactEmailRequest;

    if (!data.name?.trim()) throw new HttpsError("invalid-argument", "Name is required");
    if (!data.email?.trim()) throw new HttpsError("invalid-argument", "Email is required");
    if (!data.subject?.trim()) throw new HttpsError("invalid-argument", "Subject is required");
    if (!data.message?.trim()) throw new HttpsError("invalid-argument", "Message is required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) throw new HttpsError("invalid-argument", "Invalid email address");

    if (data.message.length > 5000) throw new HttpsError("invalid-argument", "Message too long");

    await sendContactNotification(resendApiKey.value(), {
      customerName: data.name.trim(),
      customerEmail: data.email.trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
    });

    return {success: true};
  }
);

// ---------------------------------------------------------------------------
// sendOrderNote — admin-only, sends a personal note to a customer
// ---------------------------------------------------------------------------

interface SendOrderNoteRequest {
  orderId: string;
  subject: string;
  message: string;
}

export const sendOrderNote = onCall(
  {secrets: [resendApiKey], cors: ALLOWED_ORIGINS},
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const data = request.data as SendOrderNoteRequest;

    if (!data.orderId?.trim()) throw new HttpsError("invalid-argument", "Order ID is required");
    if (!data.subject?.trim()) throw new HttpsError("invalid-argument", "Subject is required");
    if (!data.message?.trim()) throw new HttpsError("invalid-argument", "Message is required");
    if (data.message.length > 10000) throw new HttpsError("invalid-argument", "Message too long");

    const db = admin.firestore();
    const orderDoc = await db.collection("orders").doc(data.orderId).get();
    if (!orderDoc.exists) {
      throw new HttpsError("not-found", `Order ${data.orderId} not found`);
    }

    const order = orderDoc.data()!;
    const customerName: string = order.customer?.name ?? "Customer";
    const customerEmail: string = order.customer?.email;
    if (!customerEmail) {
      throw new HttpsError("failed-precondition", "Order has no customer email");
    }

    await sendOrderNoteEmail(resendApiKey.value(), {
      orderId: data.orderId,
      customerName,
      customerEmail,
      subject: data.subject.trim(),
      message: data.message.trim(),
    });

    // Record that a note was sent, for the admin audit trail
    await db.collection("orders").doc(data.orderId).update({
      lastNoteSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {success: true};
  }
);
