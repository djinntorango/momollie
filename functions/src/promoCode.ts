import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const ALLOWED_ORIGINS = ["https://momollie.web.app", "https://dearmomollie.com", "https://momollie.me"];

interface PromoCodeDoc {
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
  minOrderSubtotal: number;
  maxUses: number | null;
  usageCount: number;
  expiresAt: admin.firestore.Timestamp | null;
}

export interface ValidatePromoResult {
  valid: boolean;
  discountCents?: number;
  type?: "percentage" | "fixed";
  value?: number;
  description?: string;
  reason?: string;
}

export async function applyPromoCode(
  db: admin.firestore.Firestore,
  code: string,
  subtotalCents: number
): Promise<ValidatePromoResult> {
  const normalized = code.trim().toUpperCase();
  const snap = await db.collection("promoCodes").doc(normalized).get();

  if (!snap.exists) return {valid: false, reason: "Invalid promo code"};

  const promo = snap.data() as PromoCodeDoc;

  if (!promo.active) return {valid: false, reason: "This promo code is no longer active"};
  if (promo.expiresAt && promo.expiresAt.toDate() < new Date()) {
    return {valid: false, reason: "This promo code has expired"};
  }
  if (promo.maxUses !== null && promo.usageCount >= promo.maxUses) {
    return {valid: false, reason: "This promo code has reached its usage limit"};
  }
  if (promo.minOrderSubtotal > 0 && subtotalCents < Math.round(promo.minOrderSubtotal * 100)) {
    return {
      valid: false,
      reason: `Minimum order of $${promo.minOrderSubtotal.toFixed(2)} required for this code`,
    };
  }

  const discountCents = promo.type === "percentage"
    ? Math.round(subtotalCents * promo.value / 100)
    : Math.min(Math.round(promo.value * 100), subtotalCents);

  return {
    valid: true,
    discountCents,
    type: promo.type,
    value: promo.value,
    description: promo.type === "percentage"
      ? `${promo.value}% off`
      : `$${promo.value.toFixed(2)} off`,
  };
}

export const validatePromoCode = onCall(
  {cors: ALLOWED_ORIGINS},
  async (request): Promise<ValidatePromoResult> => {
    const {code, subtotalCents} = request.data as {code: string; subtotalCents: number};

    if (!code || typeof code !== "string") {
      throw new HttpsError("invalid-argument", "code is required");
    }
    if (typeof subtotalCents !== "number" || subtotalCents <= 0) {
      throw new HttpsError("invalid-argument", "subtotalCents must be a positive number");
    }

    return applyPromoCode(admin.firestore(), code, subtotalCents);
  }
);
