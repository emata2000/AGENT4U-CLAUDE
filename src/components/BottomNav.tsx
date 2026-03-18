"use client"
import { Home, Building2, Plus, Users, CalendarClock } from "lucide-react"

type Tab = "dashboard" | "properties" | "leads" | "pending"

interface Props {
  active: Tab
  onTab: (tab: Tab) => void
  onAdd: () => void
  pendingCount?: number
  propertiesCount?: number
  leadsCount?: number
}

export default function BottomNav({ active, onTab, onAdd, pendingCount = 0, propertiesCount = 0, leadsCount = 0 }: Props) {
  const color = (tab: Tab) => active === tab ? "#2563eb" : "#94a3b8"

  return (
    <div className="bottom-nav">
      <button className="nav-item" onClick={() => onTab("dashboard")}>
        <Home size={22} color={color("dashboard")} />
        <span style={{ color: color("dashboard") }}>Inicio</span>
      </button>
      <button className="nav-item" style={{ position: "relative" }} onClick={() => onTab("properties")}>
        <Building2 size={22} color={color("properties")} />
        {propertiesCount > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 8,
            background: "#2563eb", color: "white",
            fontSize: 9, fontWeight: 700,
            borderRadius: 999, minWidth: 16, height: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
          }}>{propertiesCount}</span>
        )}
        <span style={{ color: color("properties") }}>Inmuebles</span>
      </button>
      <button className="nav-add" onClick={onAdd}>
        <Plus size={26} color="white" />
      </button>
      <button className="nav-item" style={{ position: "relative" }} onClick={() => onTab("leads")}>
        <Users size={22} color={color("leads")} />
        {leadsCount > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 8,
            background: "#16a34a", color: "white",
            fontSize: 9, fontWeight: 700,
            borderRadius: 999, minWidth: 16, height: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
          }}>{leadsCount}</span>
        )}
        <span style={{ color: color("leads") }}>Leads</span>
      </button>
      <button className="nav-item" style={{ position: "relative" }} onClick={() => onTab("pending")}>
        <CalendarClock size={22} color={color("pending")} />
        {pendingCount > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 10,
            background: "#ef4444", color: "white",
            fontSize: 9, fontWeight: 700,
            borderRadius: 999, minWidth: 16, height: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
          }}>{pendingCount}</span>
        )}
        <span style={{ color: color("pending") }}>Pendientes</span>
      </button>
    </div>
  )
}
