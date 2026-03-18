"use client"
import { useState, useRef } from "react"
import { ArrowLeft, Camera, User } from "lucide-react"
import type { AgentProfile } from "@/lib/store"

interface Props {
  profile: AgentProfile
  onSave: (p: AgentProfile) => void
  onBack: () => void
}

export default function AgentProfileScreen({ profile, onSave, onBack }: Props) {
  const [form, setForm] = useState<AgentProfile>({ ...profile })
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setForm(prev => ({ ...prev, photo: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    onSave(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = form.name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase()

  return (
    <div className="screen">
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F12</span>
      </div>
      {/* Header */}
      <div style={{ padding: "52px 16px 16px", background: "white", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={18} color="#374151" />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Mi Perfil</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24, marginTop: 8 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: 96, height: 96, borderRadius: "50%",
              background: form.photo ? "transparent" : "linear-gradient(135deg, #1e40af, #2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", overflow: "hidden", position: "relative",
              boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
            }}
          >
            {form.photo ? (
              <img src={form.photo} alt="foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 32, fontWeight: 700, color: "white" }}>{initials}</span>
            )}
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              width: 28, height: 28, background: "#2563eb", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid white",
            }}>
              <Camera size={14} color="white" />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>Toca para cambiar foto</p>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              <User size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
              Nombre completo
            </label>
            <input
              className="input-field"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Teléfono
            </label>
            <input
              className="input-field"
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="55-1234-5678"
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Correo electrónico
            </label>
            <input
              className="input-field"
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Descripción / Bio
            </label>
            <textarea
              className="input-field"
              rows={4}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Cuéntales a tus clientes sobre tu experiencia..."
              style={{ resize: "none", fontFamily: "inherit" }}
            />
          </div>
        </div>

        {/* Save button */}
        <button
          className="btn-primary"
          onClick={handleSave}
          style={{ marginTop: 24, background: saved ? "#16a34a" : "#2563eb", transition: "background 0.2s" }}
        >
          {saved ? "✓ Guardado" : "Guardar perfil"}
        </button>

        {/* Brochure preview note */}
        <div style={{
          marginTop: 16, padding: "12px 14px",
          background: "#eff6ff", borderRadius: 12,
          fontSize: 13, color: "#2563eb",
        }}>
          📄 Tu foto, nombre, teléfono y correo aparecerán en los brochures de tus propiedades.
        </div>
      </div>
    </div>
  )
}
