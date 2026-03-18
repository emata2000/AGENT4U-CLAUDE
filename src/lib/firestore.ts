import { useState, useEffect, useCallback } from "react"
import {
  collection, doc, onSnapshot, setDoc, updateDoc,
  getDocs, writeBatch, query, orderBy,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Property, Lead, Appointment, AgentProfile } from "./store"
import { DEMO_PROPERTIES, DEMO_LEADS, DEMO_APPOINTMENTS } from "./store"

// ─── Firestore paths ─────────────────────────────────────────────────────────
const col = (uid: string, name: string) => collection(db, "agents", uid, name)
const ref = (uid: string, name: string, id: string) => doc(db, "agents", uid, name, id)
const profileRef = (uid: string) => doc(db, "agents", uid, "profile", "data")

// ─── Seed demo data on first login ───────────────────────────────────────────
async function seedDemoData(uid: string) {
  const batch = writeBatch(db)
  DEMO_PROPERTIES.forEach(p => batch.set(ref(uid, "properties", p.id), p))
  DEMO_LEADS.forEach(l => batch.set(ref(uid, "leads", l.id), l))
  DEMO_APPOINTMENTS.forEach(a => batch.set(ref(uid, "appointments", a.id), a))
  await batch.commit()
}

// ─── useFirestoreStore ────────────────────────────────────────────────────────
export function useFirestoreStore(uid: string | null) {
  const [properties, setProperties] = useState<Property[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!uid) { setLoaded(true); return }

    let unsubs: (() => void)[] = []

    // Check if agent has data, seed demo if first time
    getDocs(col(uid, "properties")).then(snap => {
      if (snap.empty) seedDemoData(uid)
    })

    // Real-time listeners
    unsubs.push(
      onSnapshot(query(col(uid, "properties")), snap => {
        setProperties(snap.docs.map(d => d.data() as Property))
      }),
      onSnapshot(query(col(uid, "leads")), snap => {
        setLeads(snap.docs.map(d => d.data() as Lead))
      }),
      onSnapshot(query(col(uid, "appointments")), snap => {
        setAppointments(snap.docs.map(d => d.data() as Appointment))
        setLoaded(true)
      }),
    )

    return () => unsubs.forEach(u => u())
  }, [uid])

  const addProperty = useCallback(async (p: Property) => {
    if (!uid) return
    await setDoc(ref(uid, "properties", p.id), p)
  }, [uid])

  const updateProperty = useCallback(async (p: Property) => {
    if (!uid) return
    await setDoc(ref(uid, "properties", p.id), p)
  }, [uid])

  const addLead = useCallback(async (l: Lead) => {
    if (!uid) return
    await setDoc(ref(uid, "leads", l.id), l)
  }, [uid])

  const updateLead = useCallback(async (l: Lead) => {
    if (!uid) return
    await setDoc(ref(uid, "leads", l.id), l)
  }, [uid])

  const addAppointment = useCallback(async (a: Appointment) => {
    if (!uid) return
    await setDoc(ref(uid, "appointments", a.id), a)
  }, [uid])

  const updateAppointment = useCallback(async (a: Appointment) => {
    if (!uid) return
    await setDoc(ref(uid, "appointments", a.id), a)
  }, [uid])

  return {
    properties, leads, appointments, loaded,
    addProperty, updateProperty,
    addLead, updateLead,
    addAppointment, updateAppointment,
  }
}

// ─── useFirestoreProfile ──────────────────────────────────────────────────────
const DEFAULT_PROFILE: AgentProfile = {
  name: "Mi Perfil",
  phone: "",
  email: "",
  description: "",
}

export function useFirestoreProfile(uid: string | null, googleDisplayName?: string | null, googleEmail?: string | null) {
  const [profile, setProfile] = useState<AgentProfile>({
    ...DEFAULT_PROFILE,
    name: googleDisplayName ?? DEFAULT_PROFILE.name,
    email: googleEmail ?? DEFAULT_PROFILE.email,
  })

  useEffect(() => {
    if (!uid) return
    const unsub = onSnapshot(profileRef(uid), snap => {
      if (snap.exists()) {
        setProfile(snap.data() as AgentProfile)
      } else {
        // First login — save Google info as default profile
        const initial: AgentProfile = {
          name: googleDisplayName ?? "Agente",
          phone: "",
          email: googleEmail ?? "",
          description: "",
        }
        setDoc(profileRef(uid), initial)
        setProfile(initial)
      }
    })
    return unsub
  }, [uid, googleDisplayName, googleEmail])

  const saveProfile = useCallback(async (p: AgentProfile) => {
    if (!uid) return
    setProfile(p)
    await setDoc(profileRef(uid), p)
  }, [uid])

  return { profile, saveProfile }
}
