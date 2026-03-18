"use client"
import { useState } from "react"
import { ArrowLeft, Phone, MessageCircle, Star, MapPin, Plus, X, Route, Search, Pencil } from "lucide-react"
import type { Lead, Property } from "@/lib/store"
import { formatPrice } from "@/lib/utils"

interface Props {
  lead: Lead
  properties: Property[]
  onBack: () => void
  onUpdate: (lead: Lead) => void
  onStartTour: (propertyIds: string[]) => void
}

export default function LeadDetailScreen({ lead, properties, onBack, onUpdate, onStartTour }: Props) {
  const [assignedIds, setAssignedIds] = useState<string[]>(lead.assignedProperties)
  const [ratings, setRatings] = useState<Record<string, number>>(lead.propertyRatings ?? {})
  const [showPicker, setShowPicker] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [search, setSearch] = useState("")
  const [editForm, setEditForm] = useState({
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    budgetMin: String(lead.budget.min),
    budgetMax: String(lead.budget.max),
    lookingFor: lead.lookingFor,
    notes: lead.notes,
  })
  const ef = (k: string, v: string) => setEditForm(prev => ({ ...prev, [k]: v }))

  const assigned = properties
    .filter(p => assignedIds.includes(p.id))
    .sort((a, b) => (ratings[b.id] ?? 0) - (ratings[a.id] ?? 0))
  const available = properties.filter(p => !assignedIds.includes(p.id))
  const q = search.toLowerCase()
  const filtered = available.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.colony.toLowerCase().includes(q) ||
    p.address.toLowerCase().includes(q) ||
    p.city.toLowerCase().includes(q) ||
    String(p.price).includes(q)
  )

  const addProperty = (id: string) => {
    const next = [...assignedIds, id]
    setAssignedIds(next)
    onUpdate({ ...lead, assignedProperties: next, propertyRatings: ratings })
    setShowPicker(false)
    setSearch("")
  }

  const removeProperty = (id: string) => {
    const next = assignedIds.filter(x => x !== id)
    const nextRatings = { ...ratings }
    delete nextRatings[id]
    setAssignedIds(next)
    setRatings(nextRatings)
    onUpdate({ ...lead, assignedProperties: next, propertyRatings: nextRatings })
  }

  const setRating = (id: string, stars: number) => {
    const nextRatings = { ...ratings, [id]: ratings[id] === stars ? 0 : stars }
    setRatings(nextRatings)
    onUpdate({ ...lead, propertyRatings: nextRatings })
  }

  const toggleActive = () => {
    const nextStatus = (lead.status ?? "activo") === "activo" ? "inactivo" : "activo"
    onUpdate({ ...lead, status: nextStatus })
  }

  const saveEdit = () => {
    onUpdate({
      ...lead,
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email,
      budget: {
        min: parseInt(editForm.budgetMin.replace(/\D/g, "")) || 0,
        max: parseInt(editForm.budgetMax.replace(/\D/g, "")) || 0,
      },
      lookingFor: editForm.lookingFor,
      notes: editForm.notes,
    })
    setShowEdit(false)
  }

  const isActive = (lead.status ?? "activo") === "activo"

  return (
    <div className="screen" style={{ paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F06</span>
      </div>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
        padding: "52px 16px 24px", color: "white",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, padding: "6px 10px", cursor: "pointer", marginBottom: 16 }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={toggleActive}
              style={{
                background: isActive ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.15)",
                border: "1.5px solid",
                borderColor: isActive ? "rgba(134,239,172,0.5)" : "rgba(255,255,255,0.3)",
                borderRadius: 10, padding: "6px 12px", cursor: "pointer",
                color: "white", fontSize: 12, fontWeight: 700,
              }}
            >
              {isActive ? "● Activo" : "○ Inactivo"}
            </button>
            <button
              onClick={() => setShowEdit(true)}
              style={{
                background: "rgba(255,255,255,0.2)", border: "none",
                borderRadius: 10, padding: "6px 10px", cursor: "pointer",
              }}
            >
              <Pencil size={16} color="white" />
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700,
          }}>{lead.name[0]}</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{lead.name}</h1>
            <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>Lead desde {lead.createdAt}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 16px" }}>
        {/* Contact info */}
        <div style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 16px", marginBottom: 16, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>📞 {lead.phone}</div>
              {lead.email && <div style={{ fontSize: 13, color: "#6b7280" }}>✉️ {lead.email}</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`tel:${lead.phone}`} style={{
                background: "#eff6ff", borderRadius: 10, padding: "8px 12px",
                display: "flex", alignItems: "center", gap: 4, textDecoration: "none",
                color: "#2563eb", fontSize: 13, fontWeight: 600,
              }}>
                <Phone size={14} /> Llamar
              </a>
              <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                style={{
                  background: "#f0fdf4", borderRadius: 10, padding: "8px 12px",
                  display: "flex", alignItems: "center", gap: 4, textDecoration: "none",
                  color: "#16a34a", fontSize: 13, fontWeight: 600,
                }}>
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* What they're looking for */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 10px" }}>¿Qué busca?</h3>
          <p style={{ fontSize: 14, color: "#374151", margin: "0 0 10px", lineHeight: 1.5 }}>{lead.lookingFor}</p>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8 }}>
              Min: {formatPrice(lead.budget.min)}
            </span>
            <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8 }}>
              Max: {formatPrice(lead.budget.max)}
            </span>
          </div>
        </div>

        {/* Assigned properties */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
            Inmuebles asignados {assigned.length > 0 && `(${assigned.length})`}
          </h3>
          <button onClick={() => setShowPicker(true)} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "#eff6ff", border: "1.5px solid #bfdbfe",
            borderRadius: 10, padding: "6px 12px",
            color: "#2563eb", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            <Plus size={14} /> Agregar
          </button>
        </div>

        {assigned.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px", background: "#f8fafc", borderRadius: 14, marginBottom: 16, color: "#9ca3af", fontSize: 13 }}>
            Sin inmuebles asignados. Toca "Agregar" para asignar.
          </div>
        )}

        {assigned.map(p => {
          const starCount = ratings[p.id] ?? 0
          return (
            <div key={p.id} style={{
              background: "white", border: `1.5px solid ${starCount >= 4 ? "#fde68a" : starCount > 0 ? "#e2e8f0" : "#e2e8f0"}`,
              borderRadius: 14, padding: "10px 12px", marginBottom: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img src={p.photos.find(ph => ph.isCover)?.url ?? p.photos[0]?.url} alt=""
                  style={{ width: 50, height: 50, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                    <MapPin size={10} /> {p.colony}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>{formatPrice(p.price)}</div>
                </div>
                <button onClick={() => removeProperty(p.id)} title="Quitar inmueble" style={{
                  background: "#fef2f2", border: "none", borderRadius: 8, padding: "6px", cursor: "pointer", flexShrink: 0,
                }}>
                  <X size={14} color="#ef4444" />
                </button>
              </div>
              {/* 5-star rating */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, marginRight: 4 }}>Calificación:</span>
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(p.id, s)} style={{
                    background: "none", border: "none", padding: "2px", cursor: "pointer", lineHeight: 1,
                  }}>
                    <Star size={18} color={s <= starCount ? "#f59e0b" : "#d1d5db"} fill={s <= starCount ? "#f59e0b" : "none"} />
                  </button>
                ))}
                {starCount > 0 && (
                  <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, marginLeft: 4 }}>
                    {starCount === 5 ? "¡Favorito!" : starCount >= 4 ? "Muy bueno" : starCount >= 3 ? "Interesante" : starCount >= 2 ? "Regular" : "Poco interés"}
                  </span>
                )}
              </div>
            </div>
          )
        })}

        {/* Tour button */}
        {assigned.length >= 1 && (
          <button onClick={() => onStartTour(assignedIds)} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", marginTop: 4, marginBottom: 16,
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", fontSize: 15, fontWeight: 700,
            boxShadow: "0 4px 12px rgba(109,40,217,0.35)",
          }}>
            <Route size={18} /> Crear recorrido de visitas
          </button>
        )}

        {lead.notes && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "12px 16px", marginTop: 8 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#92400e", margin: "0 0 4px" }}>📝 Notas</p>
            <p style={{ fontSize: 13, color: "#78350f", margin: 0 }}>{lead.notes}</p>
          </div>
        )}
      </div>

      {/* Edit sheet */}
      {showEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowEdit(false)}>
          <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "20px 16px 40px", width: "100%", maxHeight: "85%", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 999, margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>Editar lead</h3>

            <label style={lbl}>Nombre</label>
            <input className="input-field" style={{ marginBottom: 12 }}
              value={editForm.name} onChange={e => ef("name", e.target.value)} />

            <label style={lbl}>Teléfono</label>
            <input className="input-field" style={{ marginBottom: 12 }} type="tel" inputMode="tel"
              value={editForm.phone} onChange={e => ef("phone", e.target.value)} />

            <label style={lbl}>Email</label>
            <input className="input-field" style={{ marginBottom: 12 }} type="email"
              value={editForm.email} onChange={e => ef("email", e.target.value)} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Presupuesto mín.</label>
                <input className="input-field" type="number" inputMode="numeric"
                  value={editForm.budgetMin} onChange={e => ef("budgetMin", e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Presupuesto máx.</label>
                <input className="input-field" type="number" inputMode="numeric"
                  value={editForm.budgetMax} onChange={e => ef("budgetMax", e.target.value)} />
              </div>
            </div>

            <label style={lbl}>¿Qué busca?</label>
            <textarea className="input-field" style={{ height: 64, resize: "none", marginBottom: 12 }}
              value={editForm.lookingFor} onChange={e => ef("lookingFor", e.target.value)} />

            <label style={lbl}>Notas</label>
            <textarea className="input-field" style={{ height: 64, resize: "none", marginBottom: 16 }}
              value={editForm.notes} onChange={e => ef("notes", e.target.value)} />

            <button className="btn-primary" onClick={saveEdit}>✓ Guardar cambios</button>
            <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => setShowEdit(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Property picker sheet */}
      {showPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
          onClick={() => { setShowPicker(false); setSearch("") }}>
          <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "20px 16px 40px", width: "100%", maxHeight: "70%" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 999, margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Agregar inmueble</h3>

            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
              <input
                className="input-field"
                style={{ paddingLeft: 36 }}
                placeholder="Buscar por nombre, colonia, dirección…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            {available.length === 0 ? (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, padding: "20px 0" }}>
                Todos los inmuebles ya están asignados
              </p>
            ) : filtered.length === 0 ? (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, padding: "20px 0" }}>
                Sin resultados para "{search}"
              </p>
            ) : (
              <div style={{ overflowY: "auto", maxHeight: "45vh" }}>
                {filtered.map(p => (
                  <button key={p.id} onClick={() => addProperty(p.id)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                    background: "white", border: "1px solid #e2e8f0", borderRadius: 14,
                    padding: "10px 12px", marginBottom: 8, cursor: "pointer",
                  }}>
                    <img src={p.photos.find(ph => ph.isCover)?.url ?? p.photos[0]?.url} alt=""
                      style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{p.colony} · {p.sqm}m²</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>{formatPrice(p.price)}</div>
                    </div>
                    <Plus size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6,
}
