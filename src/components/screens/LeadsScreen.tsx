"use client"
import { useState } from "react"
import { Search, ChevronRight, Phone, MessageCircle, ArrowLeft } from "lucide-react"
import type { Lead, Property } from "@/lib/store"
import type { Screen } from "../App"
import { formatPrice } from "@/lib/utils"

interface Props {
  leads: Lead[]
  properties: Property[]
  goTo: (screen: Screen, id?: string) => void
  onSelect: (id: string) => void
}

const PAGE_SIZE = 10

export default function LeadsScreen({ leads, properties, goTo, onSelect }: Props) {
  const [search, setSearch] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filtered = leads.filter(l => {
    const isActive = !l.status || l.status === "activo"
    if (!showInactive && !isActive) return false
    return (
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.lookingFor.toLowerCase().includes(search.toLowerCase())
    )
  })

  const visibleItems = filtered.slice(0, visible)

  return (
    <div className="screen">
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F05</span>
      </div>
      <div style={{ padding: "52px 16px 12px", background: "white", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => goTo("dashboard")} style={{
              background: "#f1f5f9", border: "none", borderRadius: 10,
              padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center",
            }}>
              <ArrowLeft size={18} color="#374151" />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Mis leads</h1>
          </div>
          <button onClick={() => goTo("new-lead")} style={{
            background: "#2563eb", color: "white", border: "none",
            borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>+ Nuevo</button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input className="input-field" style={{ paddingLeft: 40 }} placeholder="Buscar lead..."
              value={search} onChange={e => { setSearch(e.target.value); setVisible(PAGE_SIZE) }} />
          </div>
          <button onClick={() => setShowInactive(!showInactive)} style={{
            padding: "10px 12px", borderRadius: 12, border: "1.5px solid",
            borderColor: showInactive ? "#6b7280" : "#e2e8f0",
            background: showInactive ? "#f3f4f6" : "white",
            color: showInactive ? "#374151" : "#9ca3af",
            fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {showInactive ? "Ocultar inactivos" : "Ver inactivos"}
          </button>
        </div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>👤</p>
            <p style={{ fontSize: 16 }}>No hay leads</p>
            <button onClick={() => goTo("new-lead")} className="btn-primary" style={{ marginTop: 16, width: "auto", padding: "12px 24px" }}>
              + Agregar lead
            </button>
          </div>
        )}

        {visibleItems.map(lead => {
          const ratings = lead.propertyRatings ?? {}
          const assignedProps = properties
            .filter(p => lead.assignedProperties.includes(p.id))
            .sort((a, b) => (ratings[b.id] ?? 0) - (ratings[a.id] ?? 0))

          const isActive = !lead.status || lead.status === "activo"
          return (
            <div key={lead.id} style={{
              background: "white", border: "1px solid #e2e8f0", borderRadius: 16,
              marginBottom: 12, overflow: "hidden", opacity: isActive ? 1 : 0.6,
            }}>
              <button onClick={() => onSelect(lead.id)} style={{
                width: "100%", textAlign: "left", background: "none", border: "none",
                padding: "14px 14px 10px", cursor: "pointer",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, background: "#eff6ff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700, color: "#2563eb", flexShrink: 0,
                  }}>{lead.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{lead.name}</span>
                      {!isActive && <span style={{ fontSize: 10, fontWeight: 700, background: "#f3f4f6", color: "#6b7280", padding: "2px 6px", borderRadius: 5 }}>Inactivo</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{lead.lookingFor}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                      <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>
                        {formatPrice(lead.budget.min)} – {formatPrice(lead.budget.max)}
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8,
                        background: assignedProps.length > 0 ? "#eff6ff" : "#f8fafc",
                        color: assignedProps.length > 0 ? "#2563eb" : "#9ca3af",
                        border: `1px solid ${assignedProps.length > 0 ? "#bfdbfe" : "#e2e8f0"}`,
                      }}>
                        🏠 {assignedProps.length} inmueble{assignedProps.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
              </button>

              {/* Assigned properties */}
              {assignedProps.length > 0 && (
                <div style={{ padding: "0 14px 10px" }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginBottom: 6 }}>
                    {assignedProps.length} INMUEBLE{assignedProps.length > 1 ? "S" : ""} ASIGNADO{assignedProps.length > 1 ? "S" : ""}
                  </div>
                  <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
                    {assignedProps.map(p => {
                      const stars = ratings[p.id] ?? 0
                      return (
                        <div key={p.id} style={{
                          flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
                          background: stars >= 4 ? "#fffbeb" : "#f8fafc",
                          border: `1px solid ${stars >= 4 ? "#fde68a" : "#e2e8f0"}`,
                          borderRadius: 10, padding: "4px 8px",
                        }}>
                          <img src={p.photos.find(ph => ph.isCover)?.url ?? p.photos[0]?.url} alt=""
                            style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover" }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
                            {p.title.length > 12 ? p.title.slice(0, 12) + "…" : p.title}
                          </span>
                          {stars > 0 && (
                            <span style={{ fontSize: 10, color: "#f59e0b", letterSpacing: -1 }}>
                              {"★".repeat(stars)}{"☆".repeat(5 - stars)}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", borderTop: "1px solid #f1f5f9" }}>
                <a href={`tel:${lead.phone}`} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "10px", color: "#374151", textDecoration: "none", fontSize: 13, fontWeight: 600,
                }}>
                  <Phone size={14} /> Llamar
                </a>
                <div style={{ width: 1, background: "#f1f5f9" }} />
                <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "10px", color: "#16a34a", textDecoration: "none", fontSize: 13, fontWeight: 600,
                  }}>
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>
            </div>
          )
        })}
        {visible < filtered.length && (
          <button
            onClick={() => setVisible(v => v + PAGE_SIZE)}
            style={{
              width: "100%", padding: "13px", borderRadius: 12,
              border: "1.5px solid #e2e8f0", background: "white",
              color: "#2563eb", fontSize: 14, fontWeight: 600, cursor: "pointer",
              marginBottom: 12,
            }}
          >
            Ver más ({filtered.length - visible} restantes)
          </button>
        )}
      </div>
    </div>
  )
}
