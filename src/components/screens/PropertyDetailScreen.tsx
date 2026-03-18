"use client"
import { useState, useRef } from "react"
import { ArrowLeft, Share2, FileText, Bed, Bath, Ruler, MapPin, ChevronLeft, ChevronRight, Phone, Pencil, ImagePlus, Star } from "lucide-react"
import type { Property, PropertyPhoto, AgentProfile } from "@/lib/store"
import { formatPriceFull } from "@/lib/utils"

interface Props {
  property: Property
  agentProfile: AgentProfile
  onBack: () => void
  onUpdate: (p: Property) => void
}

const STATUSES = ["en_venta", "separada", "vendida"] as const
const STATUS_LABELS: Record<string, string> = {
  en_venta: "Disponible", en_renta: "Disponible", separada: "Separada", vendida: "Vendida"
}
const TYPE_LABELS: Record<string, string> = {
  casa: "Casa", departamento: "Departamento", local: "Local comercial",
  terreno: "Terreno", oficina: "Oficina",
}
const PHOTO_LABELS = [
  "Fachada", "Sala", "Comedor", "Cocina", "Recámara Principal",
  "Recámara", "Baño Principal", "Baño", "Estudio", "Terraza",
  "Jardín", "Cochera", "Alberca", "Área común", "Vista", "Otro",
]

const AMENITIES_LIST = [
  "Alberca", "Jardín", "Cochera", "Cochera techada", "Cuarto de servicio",
  "Terraza", "BBQ / Asador", "Seguridad 24h", "Gimnasio", "Elevador",
  "Rooftop", "Concierge", "Cine privado", "Cava de vinos", "Sala de juegos",
  "Área de niños", "Pet friendly", "Amueblado", "Bodega", "Cocina integral",
]
const NO_PHOTO_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3Crect x='155' y='95' width='90' height='70' rx='10' fill='%23e2e8f0'/%3E%3Ccircle cx='200' cy='122' r='18' fill='%23cbd5e1'/%3E%3Crect x='175' y='148' width='50' height='8' rx='4' fill='%23e2e8f0'/%3E%3Ctext x='200' y='205' fill='%23cbd5e1' font-size='15' text-anchor='middle' font-family='system-ui%2Csans-serif'%3ESin fotos%3C/text%3E%3C/svg%3E"

export default function PropertyDetailScreen({ property, agentProfile, onBack, onUpdate }: Props) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const [showBrochure, setShowBrochure] = useState(false)
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({
    type: property.type,
    operation: property.operation,
    price: String(property.price),
    address: property.address,
    colony: property.colony,
    city: property.city,
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    sqm: String(property.sqm),
    sqmLand: String(property.sqmLand ?? ""),
    description: property.description,
  })
  const [editAmenities, setEditAmenities] = useState<string[]>(property.amenities ?? [])
  const [editPhotos, setEditPhotos] = useState<PropertyPhoto[]>(property.photos)
  const fileRef = useRef<HTMLInputElement>(null)
  const ef = (k: string, v: string) => setEditForm(prev => ({ ...prev, [k]: v }))
  const toggleEditAmenity = (a: string) => setEditAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const url = ev.target?.result as string
        setEditPhotos(prev => {
          const newPhoto: PropertyPhoto = {
            id: `ph_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            url,
            label: "Foto",
            isCover: prev.length === 0,
            sortOrder: prev.length,
          }
          return [...prev, newPhoto]
        })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  const setCover = (id: string) => {
    setEditPhotos(prev => prev.map(p => ({ ...p, isCover: p.id === id })))
  }

  const updatePhotoLabel = (id: string, label: string) => {
    setEditPhotos(prev => prev.map(p => p.id === id ? { ...p, label } : p))
  }

  const deletePhoto = (id: string) => {
    setEditPhotos(prev => {
      const next = prev.filter(p => p.id !== id)
      if (next.length > 0 && !next.some(p => p.isCover)) {
        next[0] = { ...next[0], isCover: true }
      }
      return next
    })
  }

  const saveEdit = () => {
    onUpdate({
      ...property,
      type: editForm.type as Property["type"],
      operation: editForm.operation as Property["operation"],
      price: parseInt(editForm.price.replace(/\D/g, "")) || property.price,
      address: editForm.address,
      colony: editForm.colony,
      city: editForm.city,
      bedrooms: parseInt(editForm.bedrooms) || 0,
      bathrooms: parseInt(editForm.bathrooms) || 0,
      sqm: parseInt(editForm.sqm) || 0,
      sqmLand: parseInt(editForm.sqmLand) || undefined,
      amenities: editAmenities.length > 0 ? editAmenities : undefined,
      description: editForm.description,
      photos: editPhotos.map((p, i) => ({ ...p, sortOrder: i })),
    })
    setShowEdit(false)
  }

  const photos = property.photos.sort((a, b) => a.sortOrder - b.sortOrder)
  const coverIdx = photos.findIndex(p => p.isCover)
  const orderedPhotos = coverIdx > 0 ? [photos[coverIdx], ...photos.filter((_, i) => i !== coverIdx)] : photos

  const changeStatus = (status: typeof STATUSES[number]) => {
    onUpdate({ ...property, status })
    setShowStatusPicker(false)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `${property.title} - ${formatPriceFull(property.price)}`,
        url: window.location.href,
      })
    } else {
      alert("Link copiado: agent4u.app/propiedad/" + property.id)
    }
  }

  const handleGeneratePDF = () => {
    window.print()
  }

  return (
    <div className="screen" style={{ paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F03</span>
      </div>
      {/* Photo carousel */}
      <div style={{ position: "relative", height: 300, background: "#f1f5f9" }}>
        <img
          src={orderedPhotos[photoIdx]?.url ?? NO_PHOTO_URL}
          alt={orderedPhotos[photoIdx]?.label ?? "Sin fotos"}
          style={{ width: "100%", height: "100%", objectFit: orderedPhotos.length === 0 ? "contain" : "cover" }}
        />

        {/* Top controls */}
        <div style={{ position: "absolute", top: 48, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 12px" }}>
          <button onClick={onBack} style={{
            background: "rgba(0,0,0,0.45)", border: "none", borderRadius: 12,
            padding: "8px 10px", cursor: "pointer", backdropFilter: "blur(4px)",
          }}>
            <ArrowLeft size={20} color="white" />
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowEdit(true)} style={{
              background: "rgba(0,0,0,0.45)", border: "none", borderRadius: 12,
              padding: "8px 10px", cursor: "pointer",
            }}>
              <Pencil size={20} color="white" />
            </button>
            <button onClick={handleGeneratePDF} style={{
              background: "rgba(0,0,0,0.45)", border: "none", borderRadius: 12,
              padding: "8px 10px", cursor: "pointer",
            }}>
              <Share2 size={20} color="white" />
            </button>
            <button onClick={() => setShowBrochure(true)} style={{
              background: "#2563eb", border: "none", borderRadius: 12,
              padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}>
              <FileText size={16} color="white" />
              <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>Brochure</span>
            </button>
          </div>
        </div>

        {/* Photo nav */}
        {orderedPhotos.length > 1 && (
          <>
            <button onClick={() => setPhotoIdx(Math.max(0, photoIdx - 1))}
              style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%", padding: 6, cursor: "pointer" }}>
              <ChevronLeft size={18} color="white" />
            </button>
            <button onClick={() => setPhotoIdx(Math.min(orderedPhotos.length - 1, photoIdx + 1))}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%", padding: 6, cursor: "pointer" }}>
              <ChevronRight size={18} color="white" />
            </button>

            {/* Photo label */}
            <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.55)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "white", fontWeight: 500 }}>
              {orderedPhotos[photoIdx]?.label} · {photoIdx + 1}/{orderedPhotos.length}
            </div>
          </>
        )}
      </div>

      {/* Photo thumbnails */}
      {orderedPhotos.length > 1 && (
        <div style={{ display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto" }}>
          {orderedPhotos.map((ph, i) => (
            <button key={ph.id} onClick={() => setPhotoIdx(i)} style={{
              flexShrink: 0, width: 56, height: 56, borderRadius: 10, overflow: "hidden",
              border: i === photoIdx ? "2.5px solid #2563eb" : "2.5px solid transparent", cursor: "pointer", padding: 0,
            }}>
              <img src={ph.url} alt={ph.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "16px 16px" }}>
        {/* Title + status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ background: "#f1f5f9", color: "#374151", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
                {TYPE_LABELS[property.type] ?? property.type}
              </span>
              <span style={{ background: property.operation === "venta" ? "#eff6ff" : "#f0fdf4", color: property.operation === "venta" ? "#2563eb" : "#16a34a", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
                {property.operation === "venta" ? "Venta" : "Renta"}
              </span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "#111827" }}>{property.title}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 10, marginTop: 20 }}>
            <button
              onClick={() => onUpdate({ ...property, active: !(property.active ?? true) })}
              style={{
                padding: "4px 10px", borderRadius: 8, border: "1.5px solid",
                borderColor: (property.active ?? true) ? "#bbf7d0" : "#e2e8f0",
                background: (property.active ?? true) ? "#f0fdf4" : "#f8fafc",
                color: (property.active ?? true) ? "#16a34a" : "#9ca3af",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}
            >
              {(property.active ?? true) ? "● Activo" : "○ Inactivo"}
            </button>
            <button onClick={() => setShowStatusPicker(true)} className={`badge badge-${property.status}`} style={{ cursor: "pointer" }}>
              {STATUS_LABELS[property.status]} ▾
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12, color: "#6b7280", fontSize: 13 }}>
          <MapPin size={14} /> {property.address}, {property.colony}, {property.city}
        </div>

        {/* Price */}
        <div style={{ fontSize: 24, fontWeight: 900, color: "#111827", marginBottom: 16 }}>
          {formatPriceFull(property.price)}
          {property.operation === "renta" && <span style={{ fontSize: 14, fontWeight: 500, color: "#6b7280" }}> /mes</span>}
        </div>

        {/* Specs */}
        <div style={{
          display: "flex", gap: 0, background: "#f8fafc", borderRadius: 14,
          overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: 20,
        }}>
          {property.bedrooms > 0 && (
            <div style={{ flex: 1, padding: "12px", textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
              <Bed size={18} color="#6b7280" style={{ margin: "0 auto 4px" }} />
              <div style={{ fontSize: 16, fontWeight: 700 }}>{property.bedrooms}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Recámaras</div>
            </div>
          )}
          <div style={{ flex: 1, padding: "12px", textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
            <Bath size={18} color="#6b7280" style={{ margin: "0 auto 4px" }} />
            <div style={{ fontSize: 16, fontWeight: 700 }}>{property.bathrooms}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Baños</div>
          </div>
          <div style={{ flex: 1, padding: "12px", textAlign: "center", borderRight: property.sqmLand ? "1px solid #e2e8f0" : "none" }}>
            <Ruler size={18} color="#6b7280" style={{ margin: "0 auto 4px" }} />
            <div style={{ fontSize: 16, fontWeight: 700 }}>{property.sqm}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>m² Const.</div>
          </div>
          {property.sqmLand && (
            <div style={{ flex: 1, padding: "12px", textAlign: "center" }}>
              <Ruler size={18} color="#6b7280" style={{ margin: "0 auto 4px" }} />
              <div style={{ fontSize: 16, fontWeight: 700 }}>{property.sqmLand}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>m² Terreno</div>
            </div>
          )}
        </div>

        {property.description && (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Descripción</h3>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 20 }}>{property.description}</p>
          </>
        )}

        {property.amenities && property.amenities.length > 0 && (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Amenidades</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {property.amenities.map(a => (
                <span key={a} style={{
                  padding: "5px 12px", borderRadius: 20,
                  background: "#eff6ff", color: "#2563eb",
                  fontSize: 12, fontWeight: 600, border: "1px solid #bfdbfe",
                }}>✓ {a}</span>
              ))}
            </div>
          </>
        )}

        {/* Map placeholder */}
        <div style={{
          background: "#e0f2fe", borderRadius: 14, height: 140,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 8, marginBottom: 20, color: "#0369a1",
        }}>
          <MapPin size={28} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{property.address}, {property.colony}</span>
          {property.lat && property.lng && (
            <span style={{ fontSize: 11, color: "#0369a1", opacity: 0.7 }}>
              {property.lat.toFixed(5)}, {property.lng.toFixed(5)}
            </span>
          )}
          <a
            href={property.lat && property.lng
              ? `https://maps.google.com/?q=${property.lat},${property.lng}`
              : `https://maps.google.com/?q=${encodeURIComponent(property.address + " " + property.colony + " " + property.city)}`
            }
            target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}
          >
            {property.lat ? "📍 Ver ubicación exacta en Maps →" : "Ver en Google Maps →"}
          </a>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <a href="tel:5512345678" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "13px", borderRadius: 13, border: "1.5px solid #e2e8f0",
            background: "white", textDecoration: "none", color: "#374151",
            fontSize: 14, fontWeight: 600,
          }}>
            <Phone size={16} /> Propietario
          </a>
          <button className="btn-primary" style={{ borderRadius: 13, padding: "13px" }}
            onClick={() => setShowBrochure(true)}>
            📄 Brochure
          </button>
        </div>
      </div>

      {/* Status picker */}
      {showStatusPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowStatusPicker(false)}>
          <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "20px 16px 40px", width: "100%" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 999, margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Cambiar estado</h3>
            {STATUSES.map(s => (
              <button key={s} onClick={() => changeStatus(s)} style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 16px", borderRadius: 12, border: "1px solid #e2e8f0",
                background: property.status === s ? "#eff6ff" : "white",
                marginBottom: 8, cursor: "pointer",
              }}>
                <span className={`badge badge-${s}`}>{STATUS_LABELS[s]}</span>
                {property.status === s && <span style={{ color: "#2563eb", fontWeight: 700 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Edit sheet */}
      {showEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowEdit(false)}>
          <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "20px 16px 40px", width: "100%", maxHeight: "85%", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 999, margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>Editar inmueble</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Tipo</label>
                <div style={{ position: "relative" }}>
                  <select className="input-field" value={editForm.type} onChange={e => ef("type", e.target.value)} style={{ paddingRight: 30, appearance: "none" }}>
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="local">Local</option>
                    <option value="terreno">Terreno</option>
                    <option value="oficina">Oficina</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={lbl}>Operación</label>
                <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                  {["venta", "renta"].map(op => (
                    <button key={op} onClick={() => ef("operation", op)} style={{
                      flex: 1, padding: "11px 8px", border: "none", cursor: "pointer",
                      background: editForm.operation === op ? "#2563eb" : "white",
                      color: editForm.operation === op ? "white" : "#374151",
                      fontWeight: 600, fontSize: 13,
                    }}>{op[0].toUpperCase() + op.slice(1)}</button>
                  ))}
                </div>
              </div>
            </div>

            <label style={lbl}>Precio (MXN)</label>
            <input className="input-field" style={{ marginBottom: 12 }} type="number" inputMode="numeric"
              value={editForm.price} onChange={e => ef("price", e.target.value)} />

            <label style={lbl}>Calle y número</label>
            <input className="input-field" style={{ marginBottom: 12 }}
              value={editForm.address} onChange={e => ef("address", e.target.value)} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Colonia</label>
                <input className="input-field" value={editForm.colony} onChange={e => ef("colony", e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Ciudad</label>
                <input className="input-field" value={editForm.city} onChange={e => ef("city", e.target.value)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Recám.</label>
                <input className="input-field" type="number" inputMode="numeric"
                  value={editForm.bedrooms} onChange={e => ef("bedrooms", e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Baños</label>
                <input className="input-field" type="number" inputMode="numeric"
                  value={editForm.bathrooms} onChange={e => ef("bathrooms", e.target.value)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={lbl}>m² Construcción</label>
                <input className="input-field" type="number" inputMode="numeric"
                  value={editForm.sqm} onChange={e => ef("sqm", e.target.value)} />
              </div>
              <div>
                <label style={lbl}>m² Terreno</label>
                <input className="input-field" type="number" inputMode="numeric" placeholder="0"
                  value={editForm.sqmLand} onChange={e => ef("sqmLand", e.target.value)} />
              </div>
            </div>

            <label style={lbl}>Descripción</label>
            <textarea className="input-field" style={{ height: 72, resize: "none", marginBottom: 12 }}
              value={editForm.description} onChange={e => ef("description", e.target.value)} />

            <label style={lbl}>Amenidades</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
              {AMENITIES_LIST.map(a => {
                const sel = editAmenities.includes(a)
                return (
                  <button key={a} onClick={() => toggleEditAmenity(a)} style={{
                    padding: "5px 11px", borderRadius: 20, border: "1.5px solid",
                    borderColor: sel ? "#2563eb" : "#e2e8f0",
                    background: sel ? "#eff6ff" : "white",
                    color: sel ? "#2563eb" : "#374151",
                    fontSize: 12, fontWeight: sel ? 700 : 500, cursor: "pointer",
                  }}>{sel ? "✓ " : ""}{a}</button>
                )
              })}
            </div>

            <label style={lbl}>Fotos ({editPhotos.length})</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 6 }}>
              {editPhotos.map(ph => (
                <div key={ph.id} style={{ display: "flex", gap: 10, alignItems: "center", background: "#f8fafc", borderRadius: 12, padding: 8, border: ph.isCover ? "1.5px solid #2563eb" : "1.5px solid #e2e8f0" }}>
                  {/* Thumbnail */}
                  <div style={{ flexShrink: 0, position: "relative", width: 64, height: 64 }}>
                    <img src={ph.url} alt={ph.label} style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
                    {ph.isCover && (
                      <span style={{ position: "absolute", bottom: 2, left: 2, background: "#2563eb", color: "white", fontSize: 7, padding: "1px 4px", borderRadius: 3, fontWeight: 700 }}>PORTADA</span>
                    )}
                  </div>
                  {/* Label + actions */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ position: "relative", marginBottom: 6 }}>
                      <select
                        value={PHOTO_LABELS.includes(ph.label) ? ph.label : "Otro"}
                        onChange={e => updatePhotoLabel(ph.id, e.target.value)}
                        style={{ width: "100%", padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, background: "white", appearance: "none" }}
                      >
                        {PHOTO_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    {!PHOTO_LABELS.includes(ph.label) && (
                      <input
                        value={ph.label}
                        onChange={e => updatePhotoLabel(ph.id, e.target.value)}
                        placeholder="Nombre personalizado"
                        style={{ width: "100%", padding: "5px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 12, marginBottom: 6 }}
                      />
                    )}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setCover(ph.id)} style={{
                        flex: 1, padding: "5px 8px", borderRadius: 7, border: "1.5px solid",
                        borderColor: ph.isCover ? "#2563eb" : "#e2e8f0",
                        background: ph.isCover ? "#eff6ff" : "white",
                        color: ph.isCover ? "#2563eb" : "#6b7280",
                        fontSize: 11, fontWeight: 600, cursor: "pointer",
                      }}>
                        <Star size={10} style={{ verticalAlign: "middle" }} /> {ph.isCover ? "Portada ✓" : "Hacer portada"}
                      </button>
                      <button onClick={() => deletePhoto(ph.id)} style={{
                        padding: "5px 10px", borderRadius: 7, border: "1.5px solid #fca5a5",
                        background: "#fff1f2", color: "#ef4444", fontSize: 11, fontWeight: 700, cursor: "pointer",
                      }}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()} style={{
                width: "100%", padding: "12px", borderRadius: 10,
                border: "2px dashed #d1d5db", background: "#f9fafb",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", gap: 8, color: "#6b7280", fontSize: 13, fontWeight: 600,
              }}>
                <ImagePlus size={18} color="#9ca3af" /> Agregar fotos
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleAddPhotos} />
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16 }}>Selecciona la etiqueta de cada foto para identificar el espacio</p>

            <button className="btn-primary" onClick={saveEdit}>✓ Guardar cambios</button>
            <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => setShowEdit(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Brochure preview */}
      {showBrochure && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, overflowY: "auto" }}
          onClick={() => setShowBrochure(false)}>
          <div style={{
            background: "white", margin: "20px 16px", borderRadius: 20, overflow: "hidden",
            maxWidth: 400, marginLeft: "auto", marginRight: "auto",
          }} onClick={e => e.stopPropagation()}>
            {/* Brochure header */}
            <div style={{ background: "#1e40af", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: 18 }}>Agent4U</span>
              <button onClick={() => setShowBrochure(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "white", fontSize: 12 }}>✕ Cerrar</button>
            </div>

            {/* Cover photo */}
            <img src={orderedPhotos[0]?.url} alt="" style={{ width: "100%", height: 200, objectFit: "cover" }} />

            {/* Title + price */}
            <div style={{ padding: "16px 20px 12px" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ background: "#f1f5f9", color: "#374151", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>{TYPE_LABELS[property.type] ?? property.type}</span>
                <span style={{ background: property.operation === "venta" ? "#eff6ff" : "#f0fdf4", color: property.operation === "venta" ? "#2563eb" : "#16a34a", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>{property.operation === "venta" ? "Venta" : "Renta"}</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>{property.title}</h2>
              <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 10px" }}>📍 {property.address}, {property.colony}, {property.city}</p>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#1e40af", marginBottom: 12 }}>{formatPriceFull(property.price)}</div>
              <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#374151", flexWrap: "wrap" }}>
                {property.bedrooms > 0 && <span>🛏 {property.bedrooms} rec.</span>}
                <span>🚿 {property.bathrooms} baños</span>
                <span>📐 {property.sqm}m² const.</span>
                {property.sqmLand && <span>🏡 {property.sqmLand}m² terreno</span>}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div style={{ padding: "0 20px 14px", paddingTop: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", margin: "0 0 6px", letterSpacing: "0.05em" }}>DESCRIPCIÓN</p>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: 0, background: "#f8fafc", borderRadius: 10, padding: 12 }}>{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div style={{ padding: "0 20px 14px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", margin: "0 0 8px", letterSpacing: "0.05em" }}>AMENIDADES</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {property.amenities.map(a => (
                    <span key={a} style={{ padding: "4px 10px", borderRadius: 20, background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 600, border: "1px solid #bfdbfe" }}>✓ {a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Photo gallery */}
            {orderedPhotos.length > 1 && (
              <div style={{ padding: "0 20px 16px" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>FOTOGRAFÍAS</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {orderedPhotos.slice(1).map(ph => (
                    <div key={ph.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden" }}>
                      <img src={ph.url} alt={ph.label} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                      <div style={{
                        background: "#f1f5f9", color: "#374151",
                        fontSize: 10, fontWeight: 600, padding: "3px 6px", textAlign: "center",
                      }}>{ph.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share buttons */}
            <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn-primary" onClick={handleGeneratePDF} style={{ borderRadius: 12 }}>
                📄 Descargar / Compartir PDF
              </button>
              <button className="btn-secondary" onClick={handleShare} style={{ borderRadius: 12 }}>
                📤 Compartir link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print brochure — visible only @media print */}
      <div id="brochure-print" style={{ display: "none", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#111827", background: "white" }}>
        {/* Header */}
        <div style={{ background: "#1e40af", color: "white", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 800, fontSize: 20 }}>Agent4U</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, overflow: "hidden", flexShrink: 0 }}>
              {agentProfile.photo
                ? <img src={agentProfile.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : agentProfile.name.split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase()
              }
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{agentProfile.name}</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>📞 {agentProfile.phone}</div>
            </div>
          </div>
        </div>

        {/* Cover photo */}
        {orderedPhotos[0] && (
          <img src={orderedPhotos[0].url} alt={orderedPhotos[0].label}
            style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }} />
        )}

        <div style={{ padding: "20px 24px" }}>
          {/* Type + operation badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: "#f1f5f9", color: "#374151" }}>
              {TYPE_LABELS[property.type] ?? property.type}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: "#eff6ff", color: "#2563eb" }}>
              {property.operation === "venta" ? "Venta" : "Renta"}
            </span>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 6px" }}>{property.title}</h2>
          <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 12 }}>📍 {property.address}, {property.colony}, {property.city}</div>

          {/* Price */}
          <div style={{ fontSize: 28, fontWeight: 900, color: "#1e40af", marginBottom: 16 }}>
            {formatPriceFull(property.price)}{property.operation === "renta" ? " /mes" : ""}
          </div>

          {/* Specs grid */}
          <div style={{ display: "flex", gap: 0, background: "#f8fafc", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", marginBottom: 18 }}>
            {property.bedrooms > 0 && (
              <div style={{ flex: 1, padding: "12px 8px", textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{property.bedrooms}</div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>Recámaras</div>
              </div>
            )}
            <div style={{ flex: 1, padding: "12px 8px", textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{property.bathrooms}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Baños</div>
            </div>
            {property.sqm > 0 && (
              <div style={{ flex: 1, padding: "12px 8px", textAlign: "center", borderRight: property.sqmLand ? "1px solid #e2e8f0" : "none" }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{property.sqm}</div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>m² Const.</div>
              </div>
            )}
            {property.sqmLand && (
              <div style={{ flex: 1, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{property.sqmLand}</div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>m² Terreno</div>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em", marginBottom: 8 }}>DESCRIPCIÓN</div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginBottom: 18, background: "#f8fafc", borderRadius: 10, padding: 14 }}>
                {property.description}
              </div>
            </>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em", marginBottom: 8 }}>AMENIDADES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                {property.amenities.map(a => (
                  <span key={a} style={{ padding: "4px 10px", borderRadius: 20, background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 600, border: "1px solid #bfdbfe" }}>
                    ✓ {a}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Photo gallery */}
          {orderedPhotos.length > 1 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em", marginBottom: 8 }}>FOTOGRAFÍAS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 18 }}>
                {orderedPhotos.slice(1).map(ph => (
                  <div key={ph.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", pageBreakInside: "avoid", breakInside: "avoid" }}>
                    <img src={ph.url} alt={ph.label} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                    <div style={{ background: "#f1f5f9", color: "#374151", fontSize: 10, fontWeight: 600, padding: "4px 8px", textAlign: "center" }}>
                      {ph.label}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ background: "#f8fafc", padding: "10px 24px", textAlign: "center", fontSize: 10, color: "#9ca3af", borderTop: "1px solid #e2e8f0" }}>
          Generado con Agent4U · agent4u.app
        </div>
      </div>
    </div>
  )
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6,
}
