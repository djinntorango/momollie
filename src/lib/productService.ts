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

export async function getProducts(): Promise<Product[]> {
  const q = query(collection(db(), COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db(), COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
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

export async function applyProductSale(productIds: string[], percent: number): Promise<void> {
  await Promise.all(
    productIds.map((id) =>
      updateDoc(doc(db(), COLLECTION, id), { salePercent: percent, updatedAt: serverTimestamp() })
    )
  );
}

export async function removeProductSale(productIds: string[]): Promise<void> {
  await Promise.all(
    productIds.map((id) =>
      updateDoc(doc(db(), COLLECTION, id), { salePercent: null, updatedAt: serverTimestamp() })
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
