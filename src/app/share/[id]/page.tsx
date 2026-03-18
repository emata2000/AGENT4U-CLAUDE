"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSharedProperty } from "@/lib/share"
import type { Property } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import { MapPin, Bed, Bath, Ruler, Phone, MessageCircle, Loader2 } from "lucide-react"

export default function SharePage() {
  const params = useParams()
  const shareId = params.id as string
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [photoIdx, setPhotoIdx] = useState(0)

  useEffect(() => {
    getSharedProperty(shareId).then(p => {
      if (p) setProperty(p)
      else setNotFound(true)
      setLoading(false)
    }).catch(() => { setNotFound(true); setLoading(false) })
  }, [shareId])

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ textAlign: "center" }}>
        <Loader2 size={32} color="#2563eb" style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 12, color: "#6b7280", fontSize: 14 }}>Cargando inmueble…</p>
      </div>
    </div>
  )

  if (notFound || !property) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ textAlign: "center", padding: 32 }}>
        <p style={{ fontSize: 48, margin: "0 0 12px" }}>🏚</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Inmueble no encontrado</h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginTop: 8 }}>El link puede haber expirado o ser inválido.</p>
      </div>
    </div>
  )

  const photos = property.photos.filter(p => p.url)
  const coverPhoto = photos.find(p => p.isCover) ?? photos[0]

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "white" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1e40af,#2563eb)", padding: "20px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>🏢</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "white" }}>Agent4U</span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: 0 }}>Inmueble compartido</p>
      </div>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div style={{ position: "relative" }}>
          <img
            src={photos[photoIdx]?.url ?? coverPhoto?.url}
            alt=""
            style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }}
          />
          {photos.length > 1 && (
            <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
              {photos.map((_, i) => (
                <button key={i} onClick={() => setPhotoIdx(i)} style={{
                  width: i === photoIdx ? 20 : 8, height: 8, borderRadius: 999,
                  background: i === photoIdx ? "white" : "rgba(255,255,255,0.6)",
                  border: "none", cursor: "pointer", padding: 0, transition: "width 0.2s",
                }} />
              ))}
            </div>
          )}
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <span style={{
              background: "#16a34a", color: "white", fontSize: 11, fontWeight: 700,
              padding: "4px 10px", borderRadius: 8,
            }}>
              {property.status === "en_venta" || property.status === "en_renta" ? "Disponible" : property.status}
            </span>
          </div>
        </div>
      )}

      {/* Details */}
      <div style={{ padding: "20px 16px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>{property.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
          <MapPin size={14} /> {property.address}, {property.colony}, {property.city}
        </div>

        <div style={{ fontSize: 28, fontWeight: 900, color: "#1e40af", marginBottom: 16 }}>
          {formatPrice(property.price)} {property.operation === "renta" ? <span style={{ fontSize: 16, fontWeight: 600, color: "#6b7280" }}>/mes</span> : ""}
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 20, padding: "14px 16px", background: "#f8fafc", borderRadius: 14 }}>
          {property.bedrooms > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "#374151" }}>
              <Bed size={16} color="#2563eb" /> {property.bedrooms} rec.
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "#374151" }}>
            <Bath size={16} color="#2563eb" /> {property.bathrooms} baños
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "#374151" }}>
            <Ruler size={16} color="#2563eb" /> {property.sqm}m²
          </div>
        </div>

        {property.description && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Descripción</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{property.description}</p>
          </div>
        )}

        {/* Contact buttons */}
        {property.ownerPhone && (
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <a href={`tel:${property.ownerPhone}`} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px", borderRadius: 14, background: "#f1f5f9", border: "1.5px solid #e2e8f0",
              color: "#374151", textDecoration: "none", fontSize: 14, fontWeight: 700,
            }}>
              <Phone size={16} /> Llamar
            </a>
            <a href={`https://wa.me/${property.ownerPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px", borderRadius: 14, background: "#16a34a", border: "none",
              color: "white", textDecoration: "none", fontSize: 14, fontWeight: 700,
            }}>
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        )}

        <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 24 }}>
          Compartido con Agent4U · CRM Inmobiliario
        </p>
      </div>
    </div>
  )
}
