import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';
import type { Product } from '@/data/products';

const COLLECTION = 'products';

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

function fromDoc(id: string, data: Record<string, unknown>): Product {
  const p = { id, ...data } as Product & { saleEndsAt?: Timestamp | Date }
  if (p.saleEndsAt instanceof Timestamp) {
    p.saleEndsAt = p.saleEndsAt.toDate()
  }
  // Strip expired sale data so stale Firestore docs don't show discounts
  if (p.saleEndsAt instanceof Date && p.saleEndsAt <= new Date()) {
    p.salePercent = undefined
    p.saleEndsAt = undefined
  }
  return p as Product
}

export async function getProducts(): Promise<Product[]> {
  const q = query(collection(db(), COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((d) => fromDoc(d.id, d.data() as Record<string, unknown>));
  return products.sort((a, b) => {
    const aHas = a.sortOrder !== undefined;
    const bHas = b.sortOrder !== undefined;
    if (aHas && bHas) return a.sortOrder! - b.sortOrder!;
    if (aHas) return -1;
    if (bHas) return 1;
    return 0; // both undefined: preserve createdAt desc order from Firestore
  });
}

export async function reorderProducts(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db());
  orderedIds.forEach((id, index) => {
    batch.update(doc(db(), COLLECTION, id), { sortOrder: index });
  });
  await batch.commit();
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db(), COLLECTION, id));
  if (!snap.exists()) return null;
  return fromDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db(), COLLECTION), {
    ...stripUndefined(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db(), COLLECTION, id), {
    ...stripUndefined(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTION, id));
}

export async function applyProductSale(
  productIds: string[],
  percent: number,
  endsAt?: Date
): Promise<void> {
  await Promise.all(
    productIds.map((id) =>
      updateDoc(doc(db(), COLLECTION, id), {
        salePercent: percent,
        saleEndsAt: endsAt ? Timestamp.fromDate(endsAt) : null,
        updatedAt: serverTimestamp(),
      })
    )
  );
}

export async function removeProductSale(productIds: string[]): Promise<void> {
  await Promise.all(
    productIds.map((id) =>
      updateDoc(doc(db(), COLLECTION, id), {
        salePercent: null,
        saleEndsAt: null,
        updatedAt: serverTimestamp(),
      })
    )
  );
}

/** Upload an image file to Firebase Storage and return its public download URL. */
export async function uploadProductImage(
  file: File,
  productId?: string
): Promise<string> {
  const path = `products/${productId ?? Date.now()}-${file.name}`;
  const storageRef = ref(storage(), path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/** Delete an image from Firebase Storage by its URL. Silently no-ops if it fails. */
export async function deleteProductImage(url: string): Promise<void> {
  try {
    const storageRef = ref(storage(), url);
    await deleteObject(storageRef);
  } catch {
    // Image may not be in Storage (e.g. external URL) — ignore
  }
}
