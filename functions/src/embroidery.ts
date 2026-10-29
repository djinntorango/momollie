import {HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {randomUUID} from "crypto";

export interface EmbroideryMockup {
  imageUrl: string;
  aspect: number;
  printArea: {x: number; y: number; width: number; height: number};
}

export interface EmbroideryDesign {
  previewUrl: string;
  text?: string;
  font?: string;
  threadColors: string[];
  notes?: string;
  referenceUrl?: string;
  mockup?: EmbroideryMockup; // attached server-side from the product
}

// Limits mirror the customer designer (src/components/EmbroideryDesigner.tsx)
const MAX_TEXT_LENGTH = 40;
const MAX_FONT_LENGTH = 40;
const MAX_NOTES_LENGTH = 500;
const MAX_THREAD_COLORS = 20;

function storageBucket(): string | undefined {
  try {
    return (JSON.parse(process.env.FIREBASE_CONFIG ?? "{}") as {storageBucket?: string}).storageBucket;
  } catch {
    return undefined;
  }
}

const UPLOAD_PREFIX = "embroidery/";

/** Storage object path from a Firebase download URL, e.g. "embroidery/123-design.png". */
function storagePathFromUrl(url: string): string {
  const encoded = url.split("/o/")[1]?.split("?")[0] ?? "";
  return decodeURIComponent(encoded);
}

function downloadUrl(bucket: string, path: string, token: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

/** Only accept files the designer uploaded to our own bucket's embroidery/ folder. */
function isEmbroideryUploadUrl(url: unknown): url is string {
  if (typeof url !== "string" || url.length > 1000) return false;
  const bucket = storageBucket();
  if (!bucket) return false;
  return url.startsWith(`https://firebasestorage.googleapis.com/v0/b/${bucket}/o/embroidery%2F`);
}

function optionalString(value: unknown, max: number, field: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || value.length > max) {
    throw new HttpsError("invalid-argument", `Embroidery ${field} is invalid`);
  }
  return value.trim() || undefined;
}

/** Validates an untrusted embroidery design from the client and returns a clean copy. */
export function parseEmbroideryDesign(raw: unknown): EmbroideryDesign {
  if (!raw || typeof raw !== "object") {
    throw new HttpsError("invalid-argument", "Embroidery design is invalid");
  }
  const d = raw as Record<string, unknown>;

  if (!isEmbroideryUploadUrl(d.previewUrl)) {
    throw new HttpsError("invalid-argument", "Embroidery design image is invalid — please re-save your design");
  }
  if (d.referenceUrl !== undefined && !isEmbroideryUploadUrl(d.referenceUrl)) {
    throw new HttpsError("invalid-argument", "Embroidery reference image is invalid — please re-upload it");
  }

  const colors = Array.isArray(d.threadColors) ? d.threadColors : [];
  if (colors.length > MAX_THREAD_COLORS || !colors.every((c) => typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c))) {
    throw new HttpsError("invalid-argument", "Embroidery thread colors are invalid");
  }

  const text = optionalString(d.text, MAX_TEXT_LENGTH, "text");
  const font = text ? optionalString(d.font, MAX_FONT_LENGTH, "font") : undefined;
  const notes = optionalString(d.notes, MAX_NOTES_LENGTH, "notes");

  return {
    previewUrl: d.previewUrl,
    threadColors: colors as string[],
    ...(text ? {text} : {}),
    ...(font ? {font} : {}),
    ...(notes ? {notes} : {}),
    ...(d.referenceUrl ? {referenceUrl: d.referenceUrl as string} : {}),
  };
}

/** Mockups are written by admins, but sanity-check the shape before snapshotting one onto an order. */
export function mockupFromProduct(raw: unknown): EmbroideryMockup | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const m = raw as Partial<EmbroideryMockup>;
  const a = m.printArea;
  const isFraction = (n: unknown) => typeof n === "number" && n >= 0 && n <= 1;
  if (
    typeof m.imageUrl !== "string" || !m.imageUrl.startsWith("https://") ||
    typeof m.aspect !== "number" || !(m.aspect > 0) ||
    !a || !isFraction(a.x) || !isFraction(a.y) || !isFraction(a.width) || !isFraction(a.height) ||
    a.width === 0 || a.height === 0
  ) {
    return undefined;
  }
  return {imageUrl: m.imageUrl, aspect: m.aspect, printArea: {x: a.x, y: a.y, width: a.width, height: a.height}};
}

export async function assertEmbroideryUploadsExist(design: EmbroideryDesign): Promise<void> {
  const bucket = admin.storage().bucket(storageBucket());
  const urls = [design.previewUrl, ...(design.referenceUrl ? [design.referenceUrl] : [])];
  const results = await Promise.all(urls.map((url) => bucket.file(storagePathFromUrl(url)).exists()));
  if (results.some(([exists]) => !exists)) {
    throw new HttpsError(
      "failed-precondition",
      "Your embroidery design has expired — please remove it from your cart and design it again"
    );
  }
}

interface ItemWithEmbroidery {
  embroidery?: EmbroideryDesign;
  selections?: Array<{embroidery?: EmbroideryDesign}>;
}

/**
 * Copies a paid order's design files out of embroidery/ (which a bucket lifecycle
 * rule empties periodically) into orders/{orderId}/, and points the order at the
 * copies. Returns the updated items. Failures are logged rather than thrown so
 * they never block fulfillment; the originals stay usable until the lifecycle rule runs.
 */
export async function persistOrderEmbroidery<T extends ItemWithEmbroidery>(
  db: admin.firestore.Firestore,
  orderId: string,
  items: T[]
): Promise<T[]> {
  const bucketName = storageBucket();
  if (!bucketName) return items;
  const bucket = admin.storage().bucket(bucketName);

  const persistUrl = async (url: string): Promise<string> => {
    const src = storagePathFromUrl(url);
    if (!src.startsWith(UPLOAD_PREFIX)) return url;
    const dest = `orders/${orderId}/${src.slice(UPLOAD_PREFIX.length)}`;
    const token = randomUUID();
    await bucket.file(src).copy(bucket.file(dest));
    await bucket.file(dest).setMetadata({metadata: {firebaseStorageDownloadTokens: token}});
    return downloadUrl(bucketName, dest, token);
  };

  const persistDesign = async (design?: EmbroideryDesign): Promise<EmbroideryDesign | undefined> => {
    if (!design) return undefined;
    return {
      ...design,
      previewUrl: await persistUrl(design.previewUrl),
      ...(design.referenceUrl ? {referenceUrl: await persistUrl(design.referenceUrl)} : {}),
    };
  };

  const hasAny = items.some((i) => i.embroidery || i.selections?.some((sel) => sel.embroidery));
  if (!hasAny) return items;

  try {
    const updated = await Promise.all(items.map(async (item) => {
      const embroidery = await persistDesign(item.embroidery);
      const selections = item.selections && await Promise.all(item.selections.map(async (sel) => {
        const selEmbroidery = await persistDesign(sel.embroidery);
        return selEmbroidery ? {...sel, embroidery: selEmbroidery} : sel;
      }));
      return {
        ...item,
        ...(embroidery ? {embroidery} : {}),
        ...(selections ? {selections} : {}),
      };
    }));
    await db.collection("orders").doc(orderId).update({items: updated});
    return updated;
  } catch (err) {
    console.error(`[embroidery] Failed to persist design files for order ${orderId}:`, err);
    return items;
  }
}
