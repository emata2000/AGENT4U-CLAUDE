import { db } from "./firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"
import type { Property } from "./store"

// Saves property to Firestore and returns shareable link
export async function shareProperty(property: Property): Promise<string> {
  const shareId = `${property.id}_${Date.now()}`

  // Strip base64 photos to keep payload small — keep only URL if it's a real URL
  const photosForShare = property.photos.map(p => ({
    ...p,
    url: p.url.startsWith("data:") ? "" : p.url,
  })).filter(p => p.url !== "" || property.photos.length === 1)

  const shareData = {
    ...property,
    photos: photosForShare,
    sharedAt: new Date().toISOString(),
    sharedBy: "agent4u",
  }

  await setDoc(doc(db, "shared_properties", shareId), shareData)

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  return `${baseUrl}/share/${shareId}`
}

// Fetches a shared property from Firestore
export async function getSharedProperty(shareId: string): Promise<Property | null> {
  const snap = await getDoc(doc(db, "shared_properties", shareId))
  if (!snap.exists()) return null
  return snap.data() as Property
}
