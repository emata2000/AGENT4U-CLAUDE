"use client"
import { useState } from "react"
import { Phone, CheckCircle2, XCircle, ChevronRight, CalendarClock, ArrowLeft, List, Calendar, ChevronLeft } from "lucide-react"
import type { Appointment, AppointmentType } from "@/lib/store"

interface Props {
  appointments: Appointment[]
  onUpdate: (a: Appointment) => void
  onAdd: (a: Appointment) => void
  onSelect: (id: string) => void
  onBack: () => void
}

const TYPE_LABEL: Record<AppointmentType, string> = {
  recorrido: "🗺 Recorrido",
  llamada: "📞 Llamada",
  reunion: "🤝 Reunión",
}

const TYPE_COLORS: Record<AppointmentType, { bg: string; color: string }> = {
  recorrido: { bg: "#ede9fe", color: "#6d28d9" },
  llamada:   { bg: "#dbeafe", color: "#1d4ed8" },
  reunion:   { bg: "#fef3c7", color: "#92400e" },
}

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente", realizada: "Realizada", cancelada: "Cancelada",
}

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const DAY_NAMES = ["Lu","Ma","Mi","Ju","Vi","Sa","Do"]

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  // Monday-based: 0=Mon … 6=Sun
  const startDow = (first.getDay() + 6) % 7
  const days: (number | null)[] = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(d)
  while (days.length % 7 !== 0) days.push(null)
  return days
}

export default function PendingCallsScreen({ appointments, onUpdate, onAdd, onSelect, onBack }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<"list" | "calendar">("list")
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const [form, setForm] = useState({
    type: "llamada" as AppointmentType,
    address: "",
    phone: "",
    date: today.toISOString().split("T")[0],
    time: "10:00",
    notes: "",
  })

  const sf = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleAdd = () => {
    if (!form.address && !form.phone) return
    onAdd({
      id: Date.now().toString(),
      propertyId: "",
      propertyAddress: form.address || "Dirección pendiente",
      ownerPhone: form.phone || "Sin teléfono",
      type: form.type,
      scheduledFor: form.date,
      scheduledTime: form.time,
      status: "pendiente",
      notes: form.notes,
      createdAt: today.toISOString().split("T")[0],
    })
    setForm({ type: "llamada", address: "", phone: "", date: today.toISOString().split("T")[0], time: "10:00", notes: "" })
    setShowForm(false)
  }

  const pending = appointments.filter(a => a.status === "pendiente")
  const done = appointments.filter(a => a.status !== "pendiente")

  // Calendar helpers
  const calDays = getCalendarDays(calYear, calMonth)
  const todayStr = today.toISOString().split("T")[0]

  const aptsByDate: Record<string, Appointment[]> = {}
  appointments.forEach(a => {
    if (!aptsByDate[a.scheduledFor]) aptsByDate[a.scheduledFor] = []
    aptsByDate[a.scheduledFor].push(a)
  })

  const dayKey = (d: number) => {
    const m = String(calMonth + 1).padStart(2, "0")
    const dd = String(d).padStart(2, "0")
    return `${calYear}-${m}-${dd}`
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
    setSelectedDay(null)
  }

  const selectedApts = selectedDay ? (aptsByDate[selectedDay] ?? []) : []

  return (
    <div className="screen" style={{ paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F09</span>
      </div>
      <div style={{ padding: "52px 16px 12px", background: "white", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={onBack} style={{
              background: "#f1f5f9", border: "none", borderRadius: 10,
              padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center",
            }}>
              <ArrowLeft size={18} color="#374151" />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CalendarClock size={20} color="#f59e0b" />
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Pendientes</h1>
              {pending.length > 0 && (
                <span style={{ fontSize: 12, fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 999 }}>
                  {pending.length}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setShowForm(true)} style={{
            background: "#2563eb", color: "white", border: "none",
            borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>+ Nuevo</button>
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 0, background: "#f1f5f9", borderRadius: 12, padding: 3 }}>
          {([["list", List, "Lista"], ["calendar", Calendar, "Calendario"]] as const).map(([v, Icon, label]) => (
            <button key={v} onClick={() => { setView(v); setSelectedDay(null) }} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "8px", borderRadius: 10, border: "none", cursor: "pointer",
              background: view === v ? "white" : "transparent",
              color: view === v ? "#111827" : "#6b7280",
              fontWeight: view === v ? 600 : 500, fontSize: 13,
              boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
        <div style={{ padding: "12px 16px" }}>
          {appointments.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
              <p style={{ fontSize: 40, margin: "0 0 12px" }}>📅</p>
              <p style={{ fontSize: 16 }}>Sin pendientes registrados</p>
              <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: 16, width: "auto", padding: "12px 24px" }}>
                + Agregar pendiente
              </button>
            </div>
          )}

          {pending.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 8, letterSpacing: 0.5 }}>PENDIENTES</p>
              {pending.map(apt => (
                <AppointmentCard key={apt.id} apt={apt} onUpdate={onUpdate} onSelect={onSelect} />
              ))}
            </>
          )}

          {done.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: "16px 0 8px", letterSpacing: 0.5 }}>HISTORIAL</p>
              {done.map(apt => (
                <AppointmentCard key={apt.id} apt={apt} onUpdate={onUpdate} onSelect={onSelect} dim />
              ))}
            </>
          )}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === "calendar" && (
        <div style={{ padding: "16px 16px" }}>
          {/* Month navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <button onClick={prevMonth} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer", display: "flex" }}>
              <ChevronLeft size={18} color="#374151" />
            </button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
              {MONTHS[calMonth]} {calYear}
            </span>
            <button onClick={nextMonth} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer", display: "flex" }}>
              <ChevronRight size={18} color="#374151" />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#9ca3af", padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
            {calDays.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />
              const key = dayKey(day)
              const dayApts = aptsByDate[key] ?? []
              const hasPending = dayApts.some(a => a.status === "pendiente")
              const hasDone = dayApts.length > 0 && !hasPending
              const isToday = key === todayStr
              const isSelected = key === selectedDay

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  style={{
                    aspectRatio: "1", borderRadius: 10, border: "none", cursor: "pointer",
                    background: isSelected ? "#2563eb" : isToday ? "#eff6ff" : hasPending ? "#fef9c3" : hasDone ? "#f0fdf4" : "#f8fafc",
                    color: isSelected ? "white" : isToday ? "#2563eb" : "#374151",
                    fontWeight: isToday || dayApts.length > 0 ? 700 : 400,
                    fontSize: 13,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                    padding: "6px 2px",
                    boxShadow: isSelected ? "0 2px 8px rgba(37,99,235,0.35)" : isToday ? "0 0 0 1.5px #bfdbfe" : "none",
                  }}
                >
                  {day}
                  {dayApts.length > 0 && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: isSelected ? "rgba(255,255,255,0.7)" : hasPending ? "#f59e0b" : "#16a34a",
                      flexShrink: 0,
                    }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} /> Pendiente
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} /> Realizada
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "#eff6ff", border: "1.5px solid #bfdbfe", display: "inline-block" }} /> Hoy
            </div>
          </div>

          {/* Selected day appointments */}
          {selectedDay && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: 0 }}>
                  📅 {selectedDay}
                </p>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  {selectedApts.length} {selectedApts.length === 1 ? "pendiente" : "pendientes"}
                </span>
              </div>
              {selectedApts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", background: "#f8fafc", borderRadius: 14, color: "#9ca3af", fontSize: 13 }}>
                  Sin pendientes este día
                </div>
              ) : (
                selectedApts.map(apt => (
                  <AppointmentCard key={apt.id} apt={apt} onUpdate={onUpdate} onSelect={onSelect} dim={apt.status !== "pendiente"} />
                ))
              )}
            </>
          )}

          {!selectedDay && appointments.length > 0 && (
            <div style={{ textAlign: "center", padding: "16px", background: "#f8fafc", borderRadius: 14, color: "#9ca3af", fontSize: 13 }}>
              Toca un día para ver sus pendientes
            </div>
          )}

          {appointments.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px 20px", color: "#9ca3af" }}>
              <p style={{ fontSize: 14 }}>Sin pendientes registrados</p>
              <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: 12, width: "auto", padding: "10px 20px" }}>
                + Agregar pendiente
              </button>
            </div>
          )}
        </div>
      )}

      {/* New Pending form sheet */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "20px 16px 40px", width: "100%", maxHeight: "85%", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 999, margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, textAlign: "center", margin: "0 0 18px" }}>Nuevo pendiente</h3>

            <label style={lbl}>Tipo</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {(["llamada", "recorrido", "reunion"] as AppointmentType[]).map(t => (
                <button key={t} onClick={() => sf("type", t)} style={{
                  flex: 1, padding: "10px 6px", borderRadius: 12, border: "1.5px solid",
                  borderColor: form.type === t ? TYPE_COLORS[t].color : "#e2e8f0",
                  background: form.type === t ? TYPE_COLORS[t].bg : "white",
                  color: form.type === t ? TYPE_COLORS[t].color : "#6b7280",
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}>{TYPE_LABEL[t]}</button>
              ))}
            </div>

            <label style={lbl}>Dirección</label>
            <input className="input-field" style={{ marginBottom: 12 }}
              placeholder="Calle, colonia, ciudad"
              value={form.address} onChange={e => sf("address", e.target.value)} />

            <label style={lbl}>Teléfono</label>
            <input className="input-field" style={{ marginBottom: 12 }} type="tel" inputMode="tel"
              placeholder="55-1234-5678"
              value={form.phone} onChange={e => sf("phone", e.target.value)} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Fecha</label>
                <input className="input-field" type="date" value={form.date} onChange={e => sf("date", e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Hora</label>
                <input className="input-field" type="time" value={form.time} onChange={e => sf("time", e.target.value)} />
              </div>
            </div>

            <label style={lbl}>Notas (opcional)</label>
            <textarea className="input-field" style={{ height: 64, resize: "none", marginBottom: 16 }}
              placeholder="Detalles adicionales…"
              value={form.notes} onChange={e => sf("notes", e.target.value)} />

            <button className="btn-primary" onClick={handleAdd} disabled={!form.address && !form.phone}>
              ✓ Guardar pendiente
            </button>
            <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

function AppointmentCard({ apt, onUpdate, onSelect, dim }: {
  apt: Appointment
  onUpdate: (a: Appointment) => void
  onSelect: (id: string) => void
  dim?: boolean
}) {
  const tc = TYPE_COLORS[apt.type] ?? { bg: "#f1f5f9", color: "#374151" }
  return (
    <div onClick={() => onSelect(apt.id)} style={{
      background: "white",
      border: `1.5px solid ${apt.status === "pendiente" ? "#fde68a" : "#e2e8f0"}`,
      borderRadius: 14, padding: "12px 14px", marginBottom: 8,
      cursor: "pointer", opacity: dim ? 0.65 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
              background: tc.bg, color: tc.color,
            }}>{TYPE_LABEL[apt.type] ?? apt.type}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
              background: apt.status === "pendiente" ? "#fef3c7" : apt.status === "realizada" ? "#f0fdf4" : "#fef2f2",
              color: apt.status === "pendiente" ? "#92400e" : apt.status === "realizada" ? "#16a34a" : "#dc2626",
            }}>{STATUS_LABEL[apt.status]}</span>
            {apt.source === "captura_rapida" && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                background: "#fff7ed", color: "#c2410c",
              }}>📸 Captura rápida</span>
            )}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 2 }}>
            📍 {apt.propertyAddress}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            📅 {apt.scheduledFor} · {apt.scheduledTime}
            {apt.ownerPhone && apt.ownerPhone !== "Sin teléfono" && (
              <> · <span style={{ color: "#2563eb" }}>📞 {apt.ownerPhone}</span></>
            )}
          </div>
        </div>
        <ChevronRight size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
      </div>

      {apt.notes && (
        <div style={{ fontSize: 12, color: "#6b7280", fontStyle: "italic", marginBottom: apt.status === "pendiente" ? 8 : 0 }}>
          "{apt.notes.slice(0, 80)}{apt.notes.length > 80 ? "…" : ""}"
        </div>
      )}

      {apt.status === "pendiente" && (
        <div style={{ display: "flex", gap: 8, marginTop: 6 }} onClick={e => e.stopPropagation()}>
          {apt.ownerPhone && apt.ownerPhone !== "Sin teléfono" && (
            <a href={`tel:${apt.ownerPhone.replace(/\D/g, "")}`}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px", borderRadius: 10, background: "#eff6ff",
                textDecoration: "none", color: "#2563eb", fontSize: 13, fontWeight: 600,
              }}>
              <Phone size={14} /> Llamar
            </a>
          )}
          <button onClick={() => onUpdate({ ...apt, status: "realizada" })} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "9px", borderRadius: 10, background: "#f0fdf4",
            border: "1px solid #bbf7d0", color: "#16a34a", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            <CheckCircle2 size={14} /> Realizada
          </button>
          <button onClick={() => onUpdate({ ...apt, status: "cancelada" })} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "9px 12px", borderRadius: 10, background: "#fef2f2",
            border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            <XCircle size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6,
}
