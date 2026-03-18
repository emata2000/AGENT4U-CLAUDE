"use client"
import { useState } from "react"
import { Search, ChevronRight, Bed, Bath, Ruler, ArrowLeft } from "lucide-react"
import type { Property } from "@/lib/store"
import type { Screen } from "../App"
import { formatPrice } from "@/lib/utils"

interface Props {
  properties: Property[]
  goTo: (screen: Screen, id?: string) => void
  onSelect: (id: string) => void
}

const STATUS_FILTERS = ["Activos", "Disponible", "Separada", "Vendida", "Inactivos"]

export default function PropertiesScreen({ properties, goTo, onSelect }: Props) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("Activos")

  const filtered = properties.filter(p => {
    const isActive = p.active !== false
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.colony.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      (filter === "Activos" && isActive) ||
      (filter === "Inactivos" && !isActive) ||
      (filter === "Disponible" && (p.status === "en_venta" || p.status === "en_renta") && isActive) ||
      (filter === "Separada" && p.status === "separada" && isActive) ||
      (filter === "Vendida" && p.status === "vendida" && isActive)
    return matchSearch && matchFilter
  })

  return (
    <div className="screen">
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F02</span>
      </div>
      {/* Header */}
      <div style={{ padding: "52px 16px 12px", background: "white", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => goTo("dashboard")} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <ArrowLeft size={18} color="#374151" />
            </button>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Mis inmuebles</h1>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>{filtered.length}</span>
            </div>
          </div>
          <button onClick={() => goTo("new-property")} style={{
            background: "#2563eb", color: "white", border: "none",
            borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>+ Nuevo</button>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            className="input-field"
            style={{ paddingLeft: 40 }}
            placeholder="Buscar por nombre o colonia..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              whiteSpace: "nowrap",
              padding: "6px 14px",
              borderRadius: 999,
              border: "1.5px solid",
              borderColor: filter === f ? "#2563eb" : "#e2e8f0",
              background: filter === f ? "#eff6ff" : "white",
              color: filter === f ? "#2563eb" : "#6b7280",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              flexShrink: 0,
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <p style={{ fontSize: 16 }}>No hay inmuebles</p>
            <button onClick={() => goTo("new-property")} className="btn-primary" style={{ marginTop: 16, width: "auto", padding: "12px 24px" }}>
              + Agregar inmueble
            </button>
          </div>
        )}

        {filtered.map(p => (
          <button key={p.id} onClick={() => onSelect(p.id)}
            style={{
              width: "100%", textAlign: "left", background: "white",
              border: "1px solid #e2e8f0", borderRadius: 16,
              overflow: "hidden", marginBottom: 12, cursor: "pointer",
              display: "block", padding: 0,
              opacity: p.active === false ? 0.6 : 1,
            }}
          >
            {/* Photo */}
            <div style={{ position: "relative" }}>
              <img
                src={p.photos.find(ph => ph.isCover)?.url ?? p.photos[0]?.url}
                alt=""
                style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                <span className={`badge badge-${p.status}`}>{statusLabel(p.status)}</span>
                {p.active === false && (
                  <span style={{ background: "#6b7280", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>Inactivo</span>
                )}
              </div>
              {p.photos.length > 1 && (
                <div style={{
                  position: "absolute", bottom: 10, right: 10,
                  background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "3px 8px",
                  fontSize: 11, color: "white", fontWeight: 600,
                }}>
                  📷 {p.photos.length} fotos
                </div>
              )}
            </div>

            <div style={{ padding: "12px 14px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ background: "#f1f5f9", color: "#374151", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5 }}>
                  {typeLabel(p.type)}
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>📍 {p.address}, {p.colony}</div>

              <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
                {p.bedrooms > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#374151" }}>
                    <Bed size={14} color="#6b7280" /> {p.bedrooms} rec.
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#374151" }}>
                  <Bath size={14} color="#6b7280" /> {p.bathrooms} baños
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#374151" }}>
                  <Ruler size={14} color="#6b7280" /> {p.sqm}m²
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>
                  {formatPrice(p.price)} {p.operation === "renta" ? "/mes" : ""}
                </span>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function statusLabel(s: string) {
  return { en_venta: "Disponible", en_renta: "Disponible", separada: "Separada", vendida: "Vendida" }[s] ?? s
}

function typeLabel(t: string) {
  return { casa: "Casa", departamento: "Depto.", local: "Local", terreno: "Terreno", oficina: "Oficina" }[t] ?? t
}
