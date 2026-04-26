import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Promotion } from '@/data/products';

const COLLECTION = 'promotions';

export async function getPromotions(): Promise<Promotion[]> {
  const q = query(collection(db(), COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Promotion));
}

export async function getActivePromotion(): Promise<Promotion | null> {
  const q = query(collection(db(), COLLECTION), where('active', '==', true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Promotion;
}

export async function createPromotion(
  data: Omit<Promotion, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db(), COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePromotion(
  id: string,
  data: Partial<Omit<Promotion, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db(), COLLECTION, id), data);
}

export async function deletePromotion(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTION, id));
}
