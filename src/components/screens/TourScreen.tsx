"use client"
import { useState } from "react"
import { ArrowLeft, MapPin, Navigation, CheckCircle2 } from "lucide-react"
import type { Property } from "@/lib/store"
import { formatPrice } from "@/lib/utils"

interface Props {
  properties: Property[]
  onBack: () => void
  initialSelected?: string[]
}

export default function TourScreen({ properties, onBack, initialSelected }: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected ?? [])
  const [started, setStarted] = useState(false)
  const [currentStop, setCurrentStop] = useState(0)

  const activeProps = properties.filter(p => p.status === "en_venta" || p.status === "en_renta")
  const tourProps = activeProps.filter(p => selected.includes(p.id))

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const openGoogleMaps = () => {
    const addresses = tourProps.map(p => encodeURIComponent(`${p.address} ${p.colony} ${p.city}`))
    if (addresses.length === 1) {
      window.open(`https://maps.google.com/?q=${addresses[0]}`, "_blank")
    } else {
      const dest = addresses[addresses.length - 1]
      const waypoints = addresses.slice(0, -1).join("|")
      window.open(`https://maps.google.com/?saddr=current+location&daddr=${dest}&waypoints=${waypoints}`, "_blank")
    }
  }

  if (started) {
    return (
      <div className="screen">
        <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
          <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F11</span>
        </div>
        <div style={{ padding: "52px 16px 16px", background: "white", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => { setStarted(false); setCurrentStop(0) }} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={22} color="#374151" />
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Recorrido en curso</h1>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "#6b7280" }}>{currentStop + 1}/{tourProps.length}</span>
          </div>
        </div>

        <div style={{ padding: "16px 16px" }}>
          {/* Progress */}
          <div style={{ height: 6, background: "#e2e8f0", borderRadius: 999, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#2563eb", borderRadius: 999, width: `${((currentStop) / tourProps.length) * 100}%`, transition: "width 0.3s" }} />
          </div>

          {tourProps.map((p, i) => {
            const done = i < currentStop
            const active = i === currentStop
            return (
              <div key={p.id} style={{
                display: "flex", gap: 12, marginBottom: 12,
              }}>
                {/* Step indicator */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: done ? "#16a34a" : active ? "#2563eb" : "#e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 700, fontSize: 13,
                  }}>
                    {done ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  {i < tourProps.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 20, background: done ? "#16a34a" : "#e2e8f0", margin: "4px 0" }} />
                  )}
                </div>

                {/* Property card */}
                <div style={{
                  flex: 1, background: active ? "#eff6ff" : "white",
                  border: `1.5px solid ${active ? "#bfdbfe" : "#e2e8f0"}`,
                  borderRadius: 14, padding: "12px", marginBottom: 8,
                  opacity: done ? 0.6 : 1,
                }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <img src={p.photos.find(ph => ph.isCover)?.url ?? p.photos[0]?.url} alt=""
                      style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 2 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                        <MapPin size={10} /> {p.address}, {p.colony}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", marginTop: 2 }}>{formatPrice(p.price)}</div>
                    </div>
                  </div>

                  {active && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button onClick={openGoogleMaps} style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "9px", borderRadius: 10, background: "#2563eb", border: "none",
                        color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}>
                        <Navigation size={14} /> Navegar
                      </button>
                      <button onClick={() => setCurrentStop(i + 1)} style={{
                        flex: 1, padding: "9px", borderRadius: 10,
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                        color: "#16a34a", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}>
                        ✓ Visitado
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {currentStop >= tourProps.length && (
            <div style={{ textAlign: "center", padding: "20px", background: "#f0fdf4", borderRadius: 16, marginTop: 8 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#166534" }}>¡Recorrido completado!</div>
              <div style={{ fontSize: 13, color: "#16a34a", marginTop: 4 }}>{tourProps.length} propiedades visitadas</div>
              <button className="btn-primary" style={{ marginTop: 14, borderRadius: 12 }} onClick={() => { setStarted(false); setSelected([]) }}>
                Nuevo recorrido
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F11</span>
      </div>
      <div style={{ padding: "52px 16px 14px", background: "white", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <button onClick={onBack} style={{ background: "#f1f5f9", border: "none", borderRadius: 10, padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={18} color="#374151" />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Planear recorrido</h1>
        </div>
        <p style={{ fontSize: 13, color: "#6b7280", margin: 0, paddingLeft: 46 }}>Selecciona los inmuebles a visitar</p>
      </div>

      <div style={{ padding: "12px 16px" }}>
        {activeProps.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <p>No hay inmuebles activos para visitar</p>
          </div>
        )}

        {activeProps.map((p, i) => (
          <button key={p.id} onClick={() => toggleSelect(p.id)}
            style={{
              width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 14, marginBottom: 8, cursor: "pointer",
              border: `1.5px solid ${selected.includes(p.id) ? "#2563eb" : "#e2e8f0"}`,
              background: selected.includes(p.id) ? "#eff6ff" : "white",
            }}>
            {selected.includes(p.id) && (
              <div style={{
                width: 24, height: 24, borderRadius: "50%", background: "#2563eb",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                fontSize: 11, color: "white", fontWeight: 700,
              }}>{selected.indexOf(p.id) + 1}</div>
            )}
            {!selected.includes(p.id) && (
              <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #d1d5db", flexShrink: 0 }} />
            )}
            <img src={p.photos.find(ph => ph.isCover)?.url ?? p.photos[0]?.url} alt=""
              style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{p.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                <MapPin size={10} /> {p.colony}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#2563eb" }}>{formatPrice(p.price)}</div>
            </div>
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, padding: "12px 16px", background: "white", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
              {selected.length} inmueble{selected.length > 1 ? "s" : ""} seleccionado{selected.length > 1 ? "s" : ""}
            </span>
            <button onClick={() => setSelected([])} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer" }}>
              Limpiar
            </button>
          </div>
          <button className="btn-primary" onClick={() => setStarted(true)} style={{ borderRadius: 12 }}>
            🗺 Iniciar recorrido
          </button>
        </div>
      )}
    </div>
  )
}
