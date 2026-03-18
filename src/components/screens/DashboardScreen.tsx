"use client"
import { Bell, Building2, Users, MapPin, TrendingUp, ChevronRight, Phone, CalendarClock, CheckCircle2 } from "lucide-react"
import type { Property, Lead, Appointment, AgentProfile } from "@/lib/store"
import type { Screen } from "../App"
import { formatPrice } from "@/lib/utils"

interface Props {
  properties: Property[]
  leads: Lead[]
  appointments: Appointment[]
  agentProfile: AgentProfile
  goTo: (screen: Screen, id?: string) => void
  onUpdateAppointment: (a: Appointment) => void
}

export default function DashboardScreen({ properties, leads, appointments, agentProfile, goTo, onUpdateAppointment }: Props) {
  const visibleProps = properties.filter(p => p.active !== false)
  const visibleLeads = leads.filter(l => !l.status || l.status === "activo")
  const totalComision = 85000
  const recorridos = 2

  return (
    <div className="screen">
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F01</span>
      </div>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
        padding: "52px 20px 24px",
        color: "white",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 13, opacity: 0.8, margin: "0 0 4px" }}>Buenos días 👋</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{agentProfile.name}</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 12, padding: "8px 10px", cursor: "pointer" }}>
              <Bell size={18} color="white" />
            </button>
            <button
              onClick={() => goTo("agent-profile")}
              style={{
                width: 38, height: 38,
                background: agentProfile.photo ? "transparent" : "rgba(255,255,255,0.25)",
                borderRadius: 12, border: "none", cursor: "pointer", padding: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {agentProfile.photo ? (
                <img src={agentProfile.photo} alt="perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>
                  {agentProfile.name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
          {[
            { label: "Mis inmuebles", value: visibleProps.length, icon: <Building2 size={16} /> },
            { label: "Leads activos", value: visibleLeads.length, icon: <Users size={16} /> },
            { label: "Recorridos hoy", value: recorridos, icon: <MapPin size={16} /> },
            { label: "Comisiones mes", value: `$${(totalComision/1000).toFixed(0)}K`, icon: <TrendingUp size={16} /> },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "12px 14px",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ opacity: 0.7, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* Plan indicator */}
        <div style={{
          background: "#fafafa", border: "1px solid #e2e8f0",
          borderRadius: 14, padding: "12px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 24,
        }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Plan Gratis</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              {visibleProps.length}/10 inmuebles usados
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 80, height: 6,
              background: "#e2e8f0", borderRadius: 999, overflow: "hidden",
            }}>
              <div style={{
                width: `${(visibleProps.length / 10) * 100}%`,
                height: "100%",
                background: visibleProps.length >= 9 ? "#ef4444" : "#2563eb",
                borderRadius: 999,
              }} />
            </div>
            <button style={{
              background: "#2563eb", color: "white", border: "none",
              borderRadius: 8, padding: "6px 12px",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>Upgrade</button>
          </div>
        </div>

        {/* Recent properties */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#111827" }}>Mis inmuebles</h2>
            <span style={{ fontSize: 12, fontWeight: 700, background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: 999 }}>
              {visibleProps.length}
            </span>
          </div>
          <button onClick={() => goTo("properties")} style={{
            display: "flex", alignItems: "center", gap: 2, background: "none", border: "none",
            color: "#2563eb", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Ver todos <ChevronRight size={14} /></button>
        </div>

        {visibleProps.slice(0, 3).map(p => (
          <button key={p.id} onClick={() => goTo("property-detail", p.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              background: "white", border: "1px solid #e2e8f0", borderRadius: 14,
              padding: "10px", marginBottom: 8, cursor: "pointer", textAlign: "left",
            }}
          >
            <img src={p.photos[0]?.url} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>{p.colony}, {p.city} · {p.sqm}m²</div>
              {p.description ? (
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.description}
                </div>
              ) : null}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className={`badge badge-${p.status}`}>{statusLabel(p.status)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{formatPrice(p.price)}</span>
              </div>
            </div>
            <ChevronRight size={16} color="#94a3b8" />
          </button>
        ))}

        {/* Recent leads */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#111827" }}>Leads recientes</h2>
            <span style={{ fontSize: 12, fontWeight: 700, background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: 999 }}>
              {visibleLeads.length}
            </span>
          </div>
          <button onClick={() => goTo("leads")} style={{
            display: "flex", alignItems: "center", gap: 2, background: "none", border: "none",
            color: "#2563eb", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Ver todos <ChevronRight size={14} /></button>
        </div>

        {visibleLeads.slice(0, 2).map(l => (
          <button key={l.id} onClick={() => goTo("lead-detail", l.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              background: "white", border: "1px solid #e2e8f0", borderRadius: 14,
              padding: "12px 14px", marginBottom: 8, cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: "#2563eb",
            }}>{l.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{l.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{l.lookingFor}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 7,
                background: l.assignedProperties.length > 0 ? "#eff6ff" : "#f8fafc",
                color: l.assignedProperties.length > 0 ? "#2563eb" : "#9ca3af",
              }}>🏠 {l.assignedProperties.length}</span>
              <ChevronRight size={14} color="#94a3b8" />
            </div>
          </button>
        ))}

        {/* Pending appointments */}
        {appointments.filter(a => a.status === "pendiente").length > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 12px" }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#111827" }}>
                <CalendarClock size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", color: "#f59e0b" }} />
                Pendientes
              </h2>
              <span style={{ fontSize: 12, background: "#fef3c7", color: "#92400e", fontWeight: 700, padding: "3px 8px", borderRadius: 8 }}>
                {appointments.filter(a => a.status === "pendiente").length} pendiente{appointments.filter(a => a.status === "pendiente").length > 1 ? "s" : ""}
              </span>
            </div>

            {appointments.filter(a => a.status === "pendiente").slice(0, 3).map(apt => (
              <div key={apt.id} onClick={() => goTo("appointment-detail", apt.id)}
                style={{
                  background: "white", border: "1.5px solid #fde68a",
                  borderRadius: 14, padding: "12px 14px", marginBottom: 8,
                  cursor: "pointer",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                        background: apt.type === "recorrido" ? "#ede9fe" : apt.type === "reunion" ? "#fef3c7" : "#dbeafe",
                        color: apt.type === "recorrido" ? "#6d28d9" : apt.type === "reunion" ? "#92400e" : "#1d4ed8",
                      }}>
                        {apt.type === "recorrido" ? "🗺 Recorrido" : apt.type === "reunion" ? "🤝 Reunión" : "📞 Llamada"}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 2 }}>
                      📍 {apt.propertyAddress}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      📅 {apt.scheduledFor} · {apt.scheduledTime}
                      {apt.ownerPhone && <> · <span style={{ color: "#2563eb" }}>📞 {apt.ownerPhone}</span></>}
                    </div>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
                </div>
                {apt.notes && (
                  <div style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic" }}>
                    "{apt.notes.slice(0, 80)}{apt.notes.length > 80 ? "…" : ""}"
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {apt.ownerPhone && apt.ownerPhone !== "Sin teléfono" && (
                    <a href={`tel:${apt.ownerPhone.replace(/\D/g, "")}`}
                      onClick={e => e.stopPropagation()}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "9px", borderRadius: 10, background: "#eff6ff",
                        textDecoration: "none", color: "#2563eb", fontSize: 13, fontWeight: 600,
                      }}>
                      <Phone size={14} /> Llamar ahora
                    </a>
                  )}
                  <button onClick={e => { e.stopPropagation(); onUpdateAppointment({ ...apt, status: "realizada" }) }} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px", borderRadius: 10, background: "#f0fdf4",
                    border: "1px solid #bbf7d0", color: "#16a34a", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>
                    <CheckCircle2 size={14} /> Realizada
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function statusLabel(s: string) {
  return { en_venta: "Disponible", en_renta: "Disponible", separada: "Separada", vendida: "Vendida" }[s] ?? s
}
