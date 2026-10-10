import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PromoCode } from '@/data/products';

const COLLECTION = 'promoCodes';

export async function getPromoCodes(): Promise<PromoCode[]> {
  const q = query(collection(db(), COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      expiresAt: data.expiresAt ? (data.expiresAt as Timestamp).toDate() : null,
      createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
    } as PromoCode;
  });
}

export async function createPromoCode(
  data: Omit<PromoCode, 'id' | 'createdAt' | 'usageCount'>
): Promise<void> {
  const code = data.code.trim().toUpperCase();
  await setDoc(doc(db(), COLLECTION, code), {
    ...data,
    code,
    usageCount: 0,
    expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null,
    createdAt: serverTimestamp(),
  });
}

export async function updatePromoCode(
  id: string,
  data: Partial<Omit<PromoCode, 'id' | 'createdAt' | 'usageCount'>>
): Promise<void> {
  const update: Record<string, unknown> = { ...data };
  if ('expiresAt' in data) {
    update.expiresAt = data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(doc(db(), COLLECTION, id), update as any);
}

export async function deletePromoCode(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTION, id));
}
