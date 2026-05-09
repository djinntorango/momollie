import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function saveMarketingConsent(email: string): Promise<void> {
  const col = collection(db(), 'marketingSubscribers')
  // Avoid duplicate entries for the same email
  const existing = await getDocs(query(col, where('email', '==', email.toLowerCase())))
  if (!existing.empty) return
  await addDoc(col, {
    email: email.toLowerCase(),
    subscribedAt: serverTimestamp(),
    source: 'checkout',
  })
}
