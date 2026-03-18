import { initializeApp, getApps } from "firebase/app"
import { initializeFirestore, persistentLocalCache, getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCyvvSyBccxQjR-iYPMIH9UHohN1sZOXoc",
  authDomain: "agent4u-54b99.firebaseapp.com",
  projectId: "agent4u-54b99",
  storageBucket: "agent4u-54b99.firebasestorage.app",
  messagingSenderId: "663679344839",
  appId: "1:663679344839:web:e52d31dd33d5cad3919ee2",
  measurementId: "G-JHXFRMC2J2"
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Use persistent (IndexedDB) cache for offline support — Firebase v10+ API
// Falls back to getFirestore if already initialized (hot-reload safe)
function initDb() {
  if (typeof window === "undefined") return getFirestore(app)
  try {
    return initializeFirestore(app, { localCache: persistentLocalCache() })
  } catch {
    return getFirestore(app)
  }
}

export const db = initDb()
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
