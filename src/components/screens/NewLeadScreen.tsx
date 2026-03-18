"use client"
import { useState } from "react"
import { ArrowLeft, Star } from "lucide-react"
import type { Lead, Property } from "@/lib/store"
import { formatPrice } from "@/lib/utils"

interface Props {
  properties: Property[]
  onSave: (l: Lead) => void
  onBack: () => void
}

export default function NewLeadScreen({ properties, onSave, onBack }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", lookingFor: "", budgetMin: "", budgetMax: "", notes: "" })
  const [selected, setSelected] = useState<string[]>([])
  const [favorite, setFavorite] = useState<string>("")

  const f = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const toggleProp = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        if (favorite === id) setFavorite("")
        return prev.filter(x => x !== id)
      }
      return [...prev, id]
    })
  }

  const handleSave = () => {
    const lead: Lead = {
      id: Date.now().toString(),
      name: form.name || "Sin nombre",
      phone: form.phone,
      email: form.email,
      lookingFor: form.lookingFor,
      budget: {
        min: parseInt(form.budgetMin.replace(/\D/g, "")) || 0,
        max: parseInt(form.budgetMax.replace(/\D/g, "")) || 0,
      },
      assignedProperties: selected,
      favoriteProperty: favorite || undefined,
      notes: form.notes,
      status: "activo",
      createdAt: new Date().toISOString().split("T")[0],
    }
    onSave(lead)
  }

  return (
    <div className="screen" style={{ paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F07</span>
      </div>
      <div style={{ padding: "52px 16px 14px", background: "white", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <ArrowLeft size={22} color="#374151" />
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Nuevo lead</h1>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        <label style={labelStyle}>Nombre completo</label>
        <input className="input-field" style={{ marginBottom: 14 }} placeholder="Ana García"
          value={form.name} onChange={e => f("name", e.target.value)} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input className="input-field" placeholder="55-0000-0000" type="tel" value={form.phone} onChange={e => f("phone", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input className="input-field" placeholder="correo@email.com" type="email" value={form.email} onChange={e => f("email", e.target.value)} />
          </div>
        </div>

        <label style={labelStyle}>¿Qué busca?</label>
        <input className="input-field" style={{ marginBottom: 14 }} placeholder="Casa en Polanco, 3+ rec, con jardín"
          value={form.lookingFor} onChange={e => f("lookingFor", e.target.value)} />

        <label style={labelStyle}>Presupuesto (MXN)</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <input className="input-field" placeholder="Mín $" type="number" inputMode="numeric" value={form.budgetMin} onChange={e => f("budgetMin", e.target.value)} />
          <input className="input-field" placeholder="Máx $" type="number" inputMode="numeric" value={form.budgetMax} onChange={e => f("budgetMax", e.target.value)} />
        </div>

        {/* Assign properties */}
        {properties.length > 0 && (
          <>
            <label style={{ ...labelStyle, marginBottom: 10 }}>Inmuebles a mostrar</label>
            {properties.map(p => (
              <button key={p.id} onClick={() => toggleProp(p.id)} style={{
                width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 12, marginBottom: 8, cursor: "pointer",
                border: `1.5px solid ${selected.includes(p.id) ? "#2563eb" : "#e2e8f0"}`,
                background: selected.includes(p.id) ? "#eff6ff" : "white",
              }}>
                <img src={p.photos.find(ph => ph.isCover)?.url ?? p.photos[0]?.url} alt=""
                  style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{formatPrice(p.price)}</div>
                </div>
                {selected.includes(p.id) && (
                  <button onClick={e => { e.stopPropagation(); setFavorite(favorite === p.id ? "" : p.id) }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <Star size={18} color={favorite === p.id ? "#f59e0b" : "#d1d5db"} fill={favorite === p.id ? "#f59e0b" : "none"} />
                  </button>
                )}
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${selected.includes(p.id) ? "#2563eb" : "#d1d5db"}`,
                  background: selected.includes(p.id) ? "#2563eb" : "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {selected.includes(p.id) && <span style={{ color: "white", fontSize: 11 }}>✓</span>}
                </div>
              </button>
            ))}
            {selected.length > 0 && (
              <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
                Toca ⭐ para marcar la favorita del cliente
              </p>
            )}
          </>
        )}

        <label style={labelStyle}>Notas</label>
        <textarea className="input-field" style={{ marginBottom: 20, height: 70, resize: "none" }}
          placeholder="Notas adicionales..."
          value={form.notes} onChange={e => f("notes", e.target.value)} />

        <button className="btn-primary" onClick={handleSave}>✓ Guardar lead</button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151",
  marginBottom: 6, marginTop: 2,
}
