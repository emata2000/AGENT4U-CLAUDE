"use client"
import { useState, useEffect } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import type { User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useFirestoreStore, useFirestoreProfile } from "@/lib/firestore"
import LoginScreen from "./screens/LoginScreen"
import DashboardScreen from "./screens/DashboardScreen"
import PropertiesScreen from "./screens/PropertiesScreen"
import NewPropertyScreen from "./screens/NewPropertyScreen"
import QuickCaptureScreen from "./screens/QuickCaptureScreen"
import AppointmentDetailScreen from "./screens/AppointmentDetailScreen"
import PropertyDetailScreen from "./screens/PropertyDetailScreen"
import LeadsScreen from "./screens/LeadsScreen"
import NewLeadScreen from "./screens/NewLeadScreen"
import LeadDetailScreen from "./screens/LeadDetailScreen"
import TourScreen from "./screens/TourScreen"
import PendingCallsScreen from "./screens/PendingCallsScreen"
import AgentProfileScreen from "./screens/AgentProfileScreen"
import BottomNav from "./BottomNav"
import { Building2, Camera, Users, MapPin } from "lucide-react"
import type { Property, Lead, Appointment } from "@/lib/store"

export type Screen =
  | "login"
  | "dashboard"
  | "properties"
  | "new-property"
  | "quick-capture"
  | "appointment-detail"
  | "property-detail"
  | "leads"
  | "new-lead"
  | "lead-detail"
  | "tour"
  | "pending"
  | "agent-profile"

export interface NewPropertyPrefill {
  address: string
  colony: string
  city: string
  ownerPhone: string
}

export default function App() {
  // undefined = still checking auth, null = not logged in, User = logged in
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [screen, setScreen] = useState<Screen>("dashboard")
  const [activeTab, setActiveTab] = useState<"dashboard" | "properties" | "leads" | "pending">("dashboard")
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [newPropertyPrefill, setNewPropertyPrefill] = useState<NewPropertyPrefill | null>(null)
  const [tourInitialSelected, setTourInitialSelected] = useState<string[]>([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return unsub
  }, [])

  const uid = user?.uid ?? null
  const store = useFirestoreStore(uid)
  const { profile: agentProfile, saveProfile } = useFirestoreProfile(uid, user?.displayName, user?.email)

  const goTo = (s: Screen, id?: string) => {
    setScreen(s)
    if (s === "property-detail" && id) setSelectedPropertyId(id)
    if (s === "lead-detail" && id) setSelectedLeadId(id)
    if (s === "appointment-detail" && id) setSelectedAppointmentId(id)
    if (s === "dashboard" || s === "properties" || s === "leads" || s === "pending") {
      setActiveTab(s as typeof activeTab)
    }
  }

  // Still checking auth state — show spinner
  if (user === undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "white" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#6b7280", fontSize: 14 }}>Cargando...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // Not logged in — show login screen
  if (!user) {
    return <LoginScreen />
  }

  const selectedProperty = store.properties.find(p => p.id === selectedPropertyId) ?? null
  const selectedLead = store.leads.find(l => l.id === selectedLeadId) ?? null
  const selectedAppointment = store.appointments.find(a => a.id === selectedAppointmentId) ?? null
  const pendingCount = store.appointments.filter(a => a.status === "pendiente").length
  const propertiesCount = store.properties.filter(p => p.active !== false).length
  const leadsCount = store.leads.filter(l => !l.status || l.status === "activo").length

  const showNav = ["dashboard", "properties", "leads", "pending"].includes(screen)

  return (
    <>
      {screen === "dashboard" && (
        <DashboardScreen
          properties={store.properties}
          leads={store.leads}
          appointments={store.appointments}
          agentProfile={agentProfile}
          goTo={goTo}
          onUpdateAppointment={store.updateAppointment}
        />
      )}
      {screen === "properties" && (
        <PropertiesScreen
          properties={store.properties}
          goTo={goTo}
          onSelect={id => goTo("property-detail", id)}
        />
      )}
      {screen === "new-property" && (
        <NewPropertyScreen
          prefill={newPropertyPrefill}
          onSave={(p: Property) => {
            store.addProperty(p)
            setNewPropertyPrefill(null)
            goTo("properties")
          }}
          onBack={() => {
            setNewPropertyPrefill(null)
            goTo(activeTab === "properties" ? "properties" : "dashboard")
          }}
        />
      )}
      {screen === "quick-capture" && (
        <QuickCaptureScreen
          onSave={(apt: Appointment) => {
            store.addAppointment(apt)
            goTo("pending")
          }}
          onBack={() => goTo(activeTab)}
        />
      )}
      {screen === "appointment-detail" && selectedAppointment && (
        <AppointmentDetailScreen
          appointment={selectedAppointment}
          onBack={() => goTo("pending")}
          onMarkDone={apt => { store.updateAppointment({ ...apt, status: "realizada" }); goTo("pending") }}
          onMarkCancelled={apt => { store.updateAppointment({ ...apt, status: "cancelada" }); goTo("pending") }}
          onCreateProperty={apt => {
            setNewPropertyPrefill({
              address: apt.propertyAddress.split(",")[0]?.trim() ?? "",
              colony: apt.propertyAddress.split(",")[1]?.trim() ?? "",
              city: apt.propertyAddress.split(",")[2]?.trim() ?? "CDMX",
              ownerPhone: apt.ownerPhone,
            })
            goTo("new-property")
          }}
        />
      )}
      {screen === "property-detail" && selectedProperty && (
        <PropertyDetailScreen
          property={selectedProperty}
          agentProfile={agentProfile}
          onBack={() => goTo("properties")}
          onUpdate={store.updateProperty}
        />
      )}
      {screen === "agent-profile" && (
        <AgentProfileScreen
          profile={agentProfile}
          onSave={saveProfile}
          onBack={() => goTo("dashboard")}
          onLogout={() => signOut(auth)}
        />
      )}
      {screen === "leads" && (
        <LeadsScreen
          leads={store.leads}
          properties={store.properties}
          goTo={goTo}
          onSelect={id => goTo("lead-detail", id)}
        />
      )}
      {screen === "new-lead" && (
        <NewLeadScreen
          properties={store.properties}
          onSave={(l: Lead) => { store.addLead(l); goTo("leads") }}
          onBack={() => goTo("leads")}
        />
      )}
      {screen === "lead-detail" && selectedLead && (
        <LeadDetailScreen
          lead={selectedLead}
          properties={store.properties}
          onBack={() => goTo("leads")}
          onUpdate={store.updateLead}
          onStartTour={(ids) => {
            setTourInitialSelected(ids)
            goTo("tour")
          }}
        />
      )}
      {screen === "tour" && (
        <TourScreen
          properties={store.properties}
          onBack={() => { setTourInitialSelected([]); goTo("dashboard") }}
          initialSelected={tourInitialSelected}
        />
      )}
      {screen === "pending" && (
        <PendingCallsScreen
          appointments={store.appointments}
          onUpdate={store.updateAppointment}
          onAdd={store.addAppointment}
          onSelect={id => goTo("appointment-detail", id)}
          onBack={() => goTo("dashboard")}
        />
      )}

      {showNav && (
        <BottomNav
          active={activeTab}
          onTab={(tab) => {
            setActiveTab(tab)
            setScreen(tab)
          }}
          onAdd={() => setShowAddSheet(true)}
          pendingCount={pendingCount}
          propertiesCount={propertiesCount}
          leadsCount={leadsCount}
        />
      )}

      {/* Add action sheet */}
      {showAddSheet && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowAddSheet(false)}>
          <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "20px 16px 40px", width: "100%" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 999, margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, textAlign: "center", margin: "0 0 18px" }}>¿Qué deseas hacer?</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => { setShowAddSheet(false); goTo("quick-capture") }} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                background: "linear-gradient(135deg,#1e40af,#2563eb)", border: "none", borderRadius: 16, cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Camera size={22} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>📸 Captura Rápida</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Foto + GPS + teléfono · Llamar después</div>
                </div>
              </button>
              <button onClick={() => { setShowAddSheet(false); goTo("new-property") }} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 16, cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ width: 44, height: 44, background: "#eff6ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building2 size={22} color="#2563eb" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Nuevo Inmueble</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Formulario completo con fotos y datos</div>
                </div>
              </button>
              <button onClick={() => { setShowAddSheet(false); goTo("new-lead") }} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 16, cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ width: 44, height: 44, background: "#f0fdf4", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Users size={22} color="#16a34a" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Nuevo Lead</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Registrar cliente o prospecto</div>
                </div>
              </button>
              <button onClick={() => { setShowAddSheet(false); goTo("tour") }} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 16, cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ width: 44, height: 44, background: "#faf5ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MapPin size={22} color="#7c3aed" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Planear Recorrido</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Selecciona inmuebles y navega la ruta</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
