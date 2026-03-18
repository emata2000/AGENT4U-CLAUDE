"use client"
import { ArrowLeft, Phone, MapPin, Calendar, Clock, FileText, Building2, CheckCircle2, XCircle } from "lucide-react"
import type { Appointment } from "@/lib/store"

interface Props {
  appointment: Appointment
  onBack: () => void
  onMarkDone: (apt: Appointment) => void
  onMarkCancelled: (apt: Appointment) => void
  onCreateProperty: (apt: Appointment) => void
}

export default function AppointmentDetailScreen({
  appointment: apt,
  onBack,
  onMarkDone,
  onMarkCancelled,
  onCreateProperty,
}: Props) {
  const TYPE_LABEL: Record<string, string> = {
    recorrido: "🗺 Recorrido", llamada: "📞 Llamada", reunion: "🤝 Reunión",
  }
  const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
    recorrido: { bg: "#ede9fe", color: "#6d28d9" },
    llamada:   { bg: "#dbeafe", color: "#1d4ed8" },
    reunion:   { bg: "#fef3c7", color: "#92400e" },
  }
  const typeLabel = TYPE_LABEL[apt.type] ?? apt.type
  const typeColors = TYPE_COLORS[apt.type] ?? { bg: "#f1f5f9", color: "#374151" }

  const statusMap = {
    pendiente: { label: "Pendiente", bg: "#fef9c3", color: "#713f12" },
    realizada: { label: "Realizada", bg: "#dcfce7", color: "#166534" },
    cancelada: { label: "Cancelada", bg: "#fee2e2", color: "#991b1b" },
  }
  const statusInfo = statusMap[apt.status]

  return (
    <div className="screen" style={{ paddingBottom: 120 }}>
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F10</span>
      </div>
      {/* Header */}
      <div style={{
        padding: "52px 16px 16px",
        background: "linear-gradient(135deg,#92400e,#d97706)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.2)", border: "none",
            borderRadius: 10, padding: "6px 8px", cursor: "pointer",
          }}>
            <ArrowLeft size={20} color="white" />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "white" }}>Detalle de Pendiente</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: 0 }}>
              {apt.source === "captura_rapida" ? "📸 Captura rápida" : "Pendiente"}
            </p>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
            background: "rgba(255,255,255,0.2)", color: "white",
          }}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>

        {/* Type badge */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, padding: "6px 14px", borderRadius: 10,
            background: typeColors.bg, color: typeColors.color,
          }}>
            {typeLabel}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 10,
            background: statusInfo.bg, color: statusInfo.color,
          }}>
            {statusInfo.label}
          </span>
        </div>

        {/* Address */}
        <div style={card}>
          <div style={cardRow}>
            <MapPin size={18} color="#2563eb" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={cardLabel}>Dirección del inmueble</div>
              <div style={cardValue}>{apt.propertyAddress}</div>
              {apt.source === "captura_rapida" && apt.lat && apt.lng && (
                <a
                  href={`https://maps.google.com/?q=${apt.lat},${apt.lng}`}
                  target="_blank" rel="noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    marginTop: 8, padding: "5px 10px", borderRadius: 8,
                    background: "#eff6ff", border: "1px solid #bfdbfe",
                    color: "#2563eb", fontSize: 12, fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <MapPin size={12} /> Ver en Google Maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Phone — call button */}
        <div style={card}>
          <div style={cardRow}>
            <Phone size={18} color="#2563eb" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={cardLabel}>Teléfono del propietario</div>
              <div style={cardValue}>{apt.ownerPhone}</div>
            </div>
            {apt.ownerPhone !== "Sin teléfono" && (
              <a href={`tel:${apt.ownerPhone.replace(/\D/g, "")}`} style={{
                background: "#2563eb", color: "white", border: "none",
                borderRadius: 10, padding: "8px 16px", fontSize: 13,
                fontWeight: 700, textDecoration: "none",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Phone size={14} /> Llamar
              </a>
            )}
          </div>
        </div>

        {/* Date / Time */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div style={card}>
            <div style={cardRow}>
              <Calendar size={16} color="#2563eb" />
              <div>
                <div style={cardLabel}>Fecha</div>
                <div style={{ ...cardValue, fontSize: 14 }}>{apt.scheduledFor}</div>
              </div>
            </div>
          </div>
          <div style={card}>
            <div style={cardRow}>
              <Clock size={16} color="#2563eb" />
              <div>
                <div style={cardLabel}>Hora</div>
                <div style={{ ...cardValue, fontSize: 14 }}>{apt.scheduledTime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {apt.notes && (
          <div style={card}>
            <div style={cardRow}>
              <FileText size={18} color="#2563eb" style={{ flexShrink: 0 }} />
              <div>
                <div style={cardLabel}>Notas</div>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5 }}>{apt.notes}</div>
              </div>
            </div>
          </div>
        )}

        {/* Created */}
        <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", margin: "8px 0 24px" }}>
          Capturado el {apt.createdAt}
        </p>

        {/* Captura rápida banner */}
        {apt.source === "captura_rapida" && apt.status === "pendiente" && (
          <div style={{
            background: "#fff7ed", border: "1.5px solid #fed7aa",
            borderRadius: 14, padding: "12px 14px", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>📸</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c" }}>Captura rápida pendiente de convertir</div>
              <div style={{ fontSize: 12, color: "#9a3412" }}>Da de alta como inmueble para agregar todos sus datos</div>
            </div>
          </div>
        )}

        {/* Actions */}
        {apt.status === "pendiente" && (
          <>
            {/* Alta de propiedad */}
            <button onClick={() => onCreateProperty(apt)} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "15px", borderRadius: 14, border: "none", cursor: "pointer", marginBottom: 10,
              background: "linear-gradient(135deg,#1e40af,#2563eb)",
              color: "white", fontSize: 15, fontWeight: 700,
              boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
            }}>
              <Building2 size={20} /> Dar de alta como inmueble
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={() => onMarkDone(apt)} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "13px", borderRadius: 12, border: "1.5px solid #bbf7d0",
                background: "#f0fdf4", color: "#16a34a", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
                <CheckCircle2 size={16} /> Realizada
              </button>
              <button onClick={() => onMarkCancelled(apt)} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "13px", borderRadius: 12, border: "1.5px solid #fecaca",
                background: "#fef2f2", color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
                <XCircle size={16} /> Cancelar
              </button>
            </div>
          </>
        )}

        {apt.status !== "pendiente" && (
          <div style={{ textAlign: "center", padding: "20px", background: "#f8fafc", borderRadius: 14 }}>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
              Esta cita fue marcada como <strong>{statusInfo.label}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const card: React.CSSProperties = {
  background: "#f8fafc", borderRadius: 14, padding: 14, marginBottom: 12,
}
const cardRow: React.CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: 12,
}
const cardLabel: React.CSSProperties = {
  fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5,
}
const cardValue: React.CSSProperties = {
  fontSize: 15, fontWeight: 600, color: "#111827",
}
