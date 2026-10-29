import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

// Must match the limit in storage.rules
export const MAX_EMBROIDERY_UPLOAD_BYTES = 5 * 1024 * 1024

/**
 * Upload a customer embroidery file (rendered design or reference image) to
 * Firebase Storage and return its download URL. Customers are anonymous, so
 * storage.rules only allows create (no overwrite/delete) of small images here.
 */
export async function uploadEmbroideryFile(file: Blob, kind: 'design' | 'reference'): Promise<string> {
  if (file.size > MAX_EMBROIDERY_UPLOAD_BYTES) {
    throw new Error('Image must be smaller than 5 MB.')
  }
  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1] ?? 'png'
  const path = `embroidery/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${kind}.${ext}`
  const snapshot = await uploadBytes(ref(storage(), path), file, { contentType: file.type || 'image/png' })
  return getDownloadURL(snapshot.ref)
}
