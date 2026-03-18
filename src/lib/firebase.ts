import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
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

export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
