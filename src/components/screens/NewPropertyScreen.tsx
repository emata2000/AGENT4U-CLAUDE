"use client"
import { useState, useRef } from "react"
import { ArrowLeft, Camera, X, Star, ChevronDown, MapPin, Loader } from "lucide-react"
import type { Property, PropertyPhoto } from "@/lib/store"
import type { NewPropertyPrefill } from "../App"

interface Props {
  onSave: (p: Property) => void
  onBack: () => void
  prefill?: NewPropertyPrefill | null
}

const NO_PHOTO_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3Crect x='155' y='95' width='90' height='70' rx='10' fill='%23e2e8f0'/%3E%3Ccircle cx='200' cy='122' r='18' fill='%23cbd5e1'/%3E%3Crect x='175' y='148' width='50' height='8' rx='4' fill='%23e2e8f0'/%3E%3Ctext x='200' y='205' fill='%23cbd5e1' font-size='15' text-anchor='middle' font-family='system-ui%2Csans-serif'%3ESin fotos%3C/text%3E%3C/svg%3E"

const PHOTO_LABELS = [
  "Fachada", "Sala", "Comedor", "Cocina", "Recámara Principal",
  "Recámaras", "Baño Principal", "Baños", "Estudio", "Patio / Jardín",
  "Cochera", "Alberca", "Áreas Comunes", "Vista", "Otro",
]

const AMENITIES_LIST = [
  "Alberca", "Jardín", "Cochera", "Cochera techada", "Cuarto de servicio",
  "Terraza", "BBQ / Asador", "Seguridad 24h", "Gimnasio", "Elevador",
  "Rooftop", "Concierge", "Cine privado", "Cava de vinos", "Sala de juegos",
  "Área de niños", "Pet friendly", "Amueblado", "Bodega", "Cocina integral",
]

export default function NewPropertyScreen({ onSave, onBack, prefill }: Props) {
  const [step, setStep] = useState<"form" | "photos">("form")
  const [photos, setPhotos] = useState<PropertyPhoto[]>([])
  const [labelPicker, setLabelPicker] = useState<string | null>(null)
  const [amenities, setAmenities] = useState<string[]>([])
  const [gpsState, setGpsState] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    type: "casa", operation: "venta", price: "",
    address: prefill?.address ?? "", colony: prefill?.colony ?? "", city: prefill?.city ?? "CDMX",
    state: "", zipCode: "",
    bedrooms: "3", bathrooms: "2", sqm: "", sqmLand: "", description: "",
  })
  const f = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const captureGPS = () => {
    if (!navigator.geolocation) { setGpsState("error"); return }
    setGpsState("loading")
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        setCoords({ lat, lng })
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
            { headers: { "User-Agent": "Agent4U-CRM/1.0" } }
          )
          const data = await res.json()
          const a = data.address ?? {}
          const street = a.road ?? a.pedestrian ?? a.footway ?? ""
          const houseNumber = a.house_number ? ` ${a.house_number}` : ""
          const neighbourhood = a.neighbourhood ?? a.suburb ?? a.quarter ?? a.village ?? ""
          const city = a.city ?? a.town ?? a.municipality ?? a.state ?? ""
          if (street) f("address", street + houseNumber)
          if (neighbourhood) f("colony", neighbourhood)
          if (city) f("city", city)
          const stateVal = a.state ?? a.province ?? a.region ?? ""
          const zip = a.postcode ?? ""
          if (stateVal) f("state", stateVal)
          if (zip) f("zipCode", zip)
        } catch { /* geocoding failed, coords still saved */ }
        setGpsState("ok")
      },
      () => setGpsState("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }
  const toggleAmenity = (a: string) => setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const url = ev.target?.result as string
        setPhotos(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          url, label: prev.length === 0 ? "Fachada" : "Sala",
          isCover: prev.length === 0,
          sortOrder: prev.length,
        }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  const setCover = (id: string) => setPhotos(prev => prev.map(p => ({ ...p, isCover: p.id === id })))
  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const next = prev.filter(p => p.id !== id)
      if (next.length > 0 && !next.some(p => p.isCover)) next[0].isCover = true
      return next.map((p, i) => ({ ...p, sortOrder: i }))
    })
  }
  const setLabel = (id: string, label: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, label } : p))
    setLabelPicker(null)
  }

  const handleSave = () => {
    const prop: Property = {
      id: Date.now().toString(),
      title: `${typeLabel(form.type)} en ${form.colony || form.city}`,
      type: form.type as Property["type"],
      operation: form.operation as Property["operation"],
      status: "en_venta",
      active: true,
      price: parseInt(form.price.replace(/\D/g, "")) || 0,
      address: form.address, colony: form.colony, city: form.city,
      state: form.state || undefined, zipCode: form.zipCode || undefined,
      bedrooms: parseInt(form.bedrooms) || 0,
      bathrooms: parseInt(form.bathrooms) || 0,
      sqm: parseInt(form.sqm) || 0,
      sqmLand: parseInt(form.sqmLand) || undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
      description: form.description,
      lat: coords?.lat,
      lng: coords?.lng,
      photos: photos.length > 0 ? photos : [{
        id: "default", url: NO_PHOTO_URL,
        label: "Sin fotos", isCover: true, sortOrder: 0,
      }],
      createdAt: new Date().toISOString().split("T")[0],
    }
    onSave(prop)
  }

  return (
    <div className="screen" style={{ paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F04</span>
      </div>
      <div style={{ padding: "52px 16px 14px", background: "white", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <ArrowLeft size={22} color="#374151" />
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Nuevo inmueble</h1>
        </div>
        <div style={{ display: "flex", gap: 0, marginTop: 14, background: "#f1f5f9", borderRadius: 12, padding: 3 }}>
          {[["form", "1. Datos"], ["photos", "2. Fotos"]].map(([s, label]) => (
            <button key={s} onClick={() => setStep(s as "form" | "photos")} style={{
              flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer",
              background: step === s ? "white" : "transparent",
              color: step === s ? "#111827" : "#6b7280",
              fontWeight: step === s ? 600 : 500, fontSize: 14,
              boxShadow: step === s ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {step === "form" && (
        <div style={{ padding: "20px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Tipo</label>
              <div style={{ position: "relative" }}>
                <select className="input-field" value={form.type} onChange={e => f("type", e.target.value)} style={{ paddingRight: 36, appearance: "none" }}>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="local">Local</option>
                  <option value="terreno">Terreno</option>
                  <option value="oficina">Oficina</option>
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#6b7280" }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Operación</label>
              <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                {["venta", "renta"].map(op => (
                  <button key={op} onClick={() => f("operation", op)} style={{
                    flex: 1, padding: "12px", border: "none", cursor: "pointer",
                    background: form.operation === op ? "#2563eb" : "white",
                    color: form.operation === op ? "white" : "#374151",
                    fontWeight: 600, fontSize: 14,
                  }}>{op[0].toUpperCase() + op.slice(1)}</button>
                ))}
              </div>
            </div>
          </div>

          <label style={labelStyle}>Precio (MXN)</label>
          <input className="input-field" style={{ marginBottom: 14 }} placeholder="$ 0,000,000" value={form.price}
            onChange={e => f("price", e.target.value)} type="number" inputMode="numeric" />

          {/* GPS capture button */}
          <button onClick={captureGPS} disabled={gpsState === "loading"} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "11px", borderRadius: 12, border: "1.5px solid",
            borderColor: gpsState === "ok" ? "#86efac" : gpsState === "error" ? "#fca5a5" : "#bfdbfe",
            background: gpsState === "ok" ? "#f0fdf4" : gpsState === "error" ? "#fff1f2" : "#eff6ff",
            color: gpsState === "ok" ? "#16a34a" : gpsState === "error" ? "#ef4444" : "#2563eb",
            fontSize: 14, fontWeight: 600, cursor: gpsState === "loading" ? "default" : "pointer",
            marginBottom: 10,
          }}>
            {gpsState === "loading"
              ? <><Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> Obteniendo ubicación...</>
              : gpsState === "ok"
              ? <><MapPin size={16} /> GPS capturado · Dirección autocompletada</>
              : gpsState === "error"
              ? <><MapPin size={16} /> No se pudo obtener GPS — llena manualmente</>
              : <><MapPin size={16} /> Capturar ubicación con GPS</>
            }
          </button>

          <label style={labelStyle}>Calle y número</label>
          <input className="input-field" style={{ marginBottom: 14 }} placeholder="Calle 123" value={form.address}
            onChange={e => f("address", e.target.value)} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={labelStyle}>Colonia</label>
              <input className="input-field" placeholder="Colonia" value={form.colony} onChange={e => f("colony", e.target.value)} />
            </div>
            <div><label style={labelStyle}>Ciudad</label>
              <input className="input-field" placeholder="Ciudad" value={form.city} onChange={e => f("city", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: coords ? 8 : 14 }}>
            <div><label style={labelStyle}>Estado</label>
              <input className="input-field" placeholder="Estado" value={form.state} onChange={e => f("state", e.target.value)} />
            </div>
            <div><label style={labelStyle}>C.P.</label>
              <input className="input-field" placeholder="00000" value={form.zipCode} onChange={e => f("zipCode", e.target.value)}
                type="text" inputMode="numeric" maxLength={5} />
            </div>
          </div>

          {coords && (
            <a
              href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
              target="_blank" rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 6, marginBottom: 14,
                padding: "8px 12px", borderRadius: 10, background: "#f0fdf4",
                border: "1px solid #86efac", textDecoration: "none",
                color: "#16a34a", fontSize: 12, fontWeight: 600,
              }}
            >
              <MapPin size={13} />
              Ver en Google Maps · {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </a>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {form.type !== "local" && form.type !== "terreno" && form.type !== "oficina" && (
              <div><label style={labelStyle}>Recám.</label>
                <input className="input-field" type="number" inputMode="numeric" value={form.bedrooms} onChange={e => f("bedrooms", e.target.value)} />
              </div>
            )}
            <div><label style={labelStyle}>Baños</label>
              <input className="input-field" type="number" inputMode="numeric" value={form.bathrooms} onChange={e => f("bathrooms", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div><label style={labelStyle}>m² Construcción</label>
              <input className="input-field" type="number" inputMode="numeric" placeholder="180" value={form.sqm} onChange={e => f("sqm", e.target.value)} />
            </div>
            <div><label style={labelStyle}>m² Terreno</label>
              <input className="input-field" type="number" inputMode="numeric" placeholder="220" value={form.sqmLand} onChange={e => f("sqmLand", e.target.value)} />
            </div>
          </div>

          <label style={labelStyle}>Amenidades</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {AMENITIES_LIST.map(a => {
              const selected = amenities.includes(a)
              return (
                <button key={a} onClick={() => toggleAmenity(a)} style={{
                  padding: "6px 12px", borderRadius: 20, border: "1.5px solid",
                  borderColor: selected ? "#2563eb" : "#e2e8f0",
                  background: selected ? "#eff6ff" : "white",
                  color: selected ? "#2563eb" : "#374151",
                  fontSize: 13, fontWeight: selected ? 700 : 500, cursor: "pointer",
                }}>{selected ? "✓ " : ""}{a}</button>
              )
            })}
          </div>

          <label style={labelStyle}>Descripción</label>
          <textarea className="input-field" style={{ marginBottom: 20, height: 80, resize: "none" }}
            placeholder="Describe el inmueble..." value={form.description} onChange={e => f("description", e.target.value)} />

          <button className="btn-primary" onClick={() => setStep("photos")}>Siguiente: Agregar fotos →</button>
          <button className="btn-secondary" style={{ marginTop: 8 }} onClick={handleSave}>Guardar sin fotos</button>
        </div>
      )}

      {step === "photos" && (
        <div style={{ padding: "20px 16px" }}>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
            Agrega fotos de cada área. La foto con ⭐ será la portada del brochure.
          </p>
          <input ref={fileRef} type="file" accept="image/*" multiple capture="environment"
            style={{ display: "none" }} onChange={handleFiles} />
          <button onClick={() => fileRef.current?.click()} style={{
            width: "100%", padding: "20px", border: "2px dashed #93c5fd",
            borderRadius: 14, background: "#eff6ff", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            marginBottom: 20, color: "#2563eb",
          }}>
            <Camera size={28} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Tomar foto / Subir imagen</span>
            <span style={{ fontSize: 12, color: "#3b82f6" }}>Puedes seleccionar varias a la vez</span>
          </button>

          {photos.length > 0 && (
            <>
              <div className="photo-grid" style={{ marginBottom: 10 }}>
                {photos.map(photo => (
                  <div key={photo.id} className="photo-thumb"
                    style={{ border: photo.isCover ? "2.5px solid #2563eb" : "2.5px solid transparent" }}>
                    <img src={photo.url} alt={photo.label} />
                    {photo.isCover && (
                      <div style={{ position: "absolute", top: 4, left: 4, background: "#2563eb", borderRadius: 6, padding: "2px 6px", fontSize: 10, color: "white", fontWeight: 700 }}>
                        ⭐ Portada
                      </div>
                    )}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      background: "linear-gradient(transparent,rgba(0,0,0,0.7))",
                      padding: "16px 6px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                    }}>
                      <button onClick={() => setLabelPicker(photo.id)} style={{
                        background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 6,
                        padding: "2px 6px", fontSize: 10, fontWeight: 600, cursor: "pointer",
                        maxWidth: "65%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{photo.label}</button>
                      <div style={{ display: "flex", gap: 4 }}>
                        {!photo.isCover && (
                          <button onClick={() => setCover(photo.id)} style={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 6, padding: "3px", cursor: "pointer" }}>
                            <Star size={12} color="#ca8a04" />
                          </button>
                        )}
                        <button onClick={() => removePhoto(photo.id)} style={{ background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 6, padding: "3px", cursor: "pointer" }}>
                          <X size={12} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginBottom: 20 }}>
                {photos.length}/20 fotos · Toca la etiqueta para cambiarla · ⭐ para portada
              </p>
            </>
          )}

          <button className="btn-primary" onClick={handleSave}>✓ Guardar inmueble</button>
          <button className="btn-secondary" onClick={() => setStep("form")} style={{ marginTop: 8 }}>← Volver a datos</button>
        </div>
      )}

      {labelPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
          onClick={() => setLabelPicker(null)}>
          <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "20px 16px 40px", width: "100%" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 999, margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, textAlign: "center" }}>Elige etiqueta</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PHOTO_LABELS.map(label => (
                <button key={label} onClick={() => setLabel(labelPicker, label)} style={{
                  padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0",
                  background: "white", fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, marginTop: 2,
}

function typeLabel(t: string) {
  return { casa: "Casa", departamento: "Depto.", local: "Local", terreno: "Terreno", oficina: "Oficina" }[t] ?? t
}
