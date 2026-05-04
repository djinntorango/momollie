import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export interface Testimonial {
  id: string
  name: string
  quote: string
  rating: number   // 1–5
  active: boolean
  order: number    // display order (lower = first)
  createdAt?: Date
}

const COL = 'testimonials'

export async function getTestimonials(): Promise<Testimonial[]> {
  const q = query(collection(db(), COL), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Testimonial))
}

export async function getActiveTestimonials(): Promise<Testimonial[]> {
  const all = await getTestimonials()
  return all.filter((t) => t.active)
}

export async function createTestimonial(
  data: Omit<Testimonial, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db(), COL), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTestimonial(
  id: string,
  data: Partial<Omit<Testimonial, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db(), COL, id), data)
}

export async function deleteTestimonial(id: string): Promise<void> {
  await deleteDoc(doc(db(), COL, id))
}
