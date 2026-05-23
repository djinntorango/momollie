import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteField,
  orderBy,
  query,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Order } from '@/data/products'

function docToOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    stripeSessionId: data.stripeSessionId as string | undefined,
    stripePaymentIntentId: data.stripePaymentIntentId as string | undefined,
    status: data.status as Order['status'],
    customer: data.customer as Order['customer'],
    items: data.items as Order['items'],
    subtotal: data.subtotal as number,
    total: data.total as number,
    shippingTier: data.shippingTier as Order['shippingTier'],
    addressVerified: data.addressVerified as boolean | undefined,
    addressIssues: data.addressIssues as string[] | undefined,
    shippoLabelUrl: data.shippoLabelUrl as string | undefined,
    labelCostUsd: data.labelCostUsd as number | undefined,
    trackingNumber: data.trackingNumber as string | undefined,
    trackingCarrier: data.trackingCarrier as string | undefined,
    trackingUrl: data.trackingUrl as string | undefined,
    createdAt:
      data.createdAt instanceof Timestamp
        ? (data.createdAt as Timestamp).toDate()
        : data.createdAt
          ? new Date(data.createdAt as string)
          : undefined,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? (data.updatedAt as Timestamp).toDate()
        : data.updatedAt
          ? new Date(data.updatedAt as string)
          : undefined,
    shippedAt:
      data.shippedAt instanceof Timestamp
        ? (data.shippedAt as Timestamp).toDate()
        : data.shippedAt
          ? new Date(data.shippedAt as string)
          : undefined,
    refundId: data.refundId as string | undefined,
    refundAmount: data.refundAmount as number | undefined,
    refundedAt:
      data.refundedAt instanceof Timestamp
        ? (data.refundedAt as Timestamp).toDate()
        : data.refundedAt
          ? new Date(data.refundedAt as string)
          : undefined,
  }
}

export async function getOrders(): Promise<Order[]> {
  const q = query(collection(db(), 'orders'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToOrder(d.id, d.data() as Record<string, unknown>))
}

export function subscribeOrders(
  onChange: (orders: Order[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db(), 'orders'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => docToOrder(d.id, d.data() as Record<string, unknown>))),
    onError
  )
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db(), 'orders', id))
  if (!snap.exists()) return null
  return docToOrder(snap.id, snap.data() as Record<string, unknown>)
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<void> {
  await updateDoc(doc(db(), 'orders', id), {
    ...data,
    updatedAt: new Date(),
  })
}

export async function updateOrderAddress(
  id: string,
  customer: Order['customer']
): Promise<void> {
  await updateDoc(doc(db(), 'orders', id), {
    customer,
    addressVerified: deleteField(),
    addressIssues: deleteField(),
    updatedAt: new Date(),
  })
}
