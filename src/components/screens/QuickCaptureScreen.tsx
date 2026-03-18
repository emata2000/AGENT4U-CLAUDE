"use client"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Camera, MapPin, Phone, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import type { Appointment } from "@/lib/store"
import { runOCR, extractPhone } from "@/lib/ocr"

interface Props {
  onSave: (apt: Appointment) => void
  onBack: () => void
}

export default function QuickCaptureScreen({ onSave, onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [ocrStatus, setOcrStatus] = useState<"idle" | "loading" | "done" | "no_phone">("idle")

  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [colony, setColony] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [type, setType] = useState<"recorrido" | "llamada" | "reunion">("llamada")
  const [notes, setNotes] = useState("")

  useEffect(() => { captureGPS() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const captureGPS = () => {
    if (!navigator.geolocation) { setGeoStatus("error"); return }
    setGeoStatus("loading")
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setGpsCoords({ lat: latitude, lng: longitude })
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "es" } }
          )
          const { address: a } = await res.json()
          setAddress([a.road, a.house_number].filter(Boolean).join(" "))
          setColony(a.suburb || a.neighbourhood || a.quarter || a.city_district || "")
          setCity(a.city || a.town || a.municipality || "")
          setState(a.state || a.province || a.region || "")
          setZipCode(a.postcode || "")
          setGeoStatus("done")
        } catch { setGeoStatus("error") }
      },
      () => setGeoStatus("error"),
      { timeout: 12000, enableHighAccuracy: true }
    )
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    const reader = new FileReader()
    reader.onload = async ev => {
      const url = ev.target?.result as string
      setPhotoUrl(url)
      setOcrStatus("loading")
      try {
        const text = await runOCR(url)
        const extracted = extractPhone(text)
        if (extracted) { setPhone(extracted); setOcrStatus("done") }
        else setOcrStatus("no_phone")
      } catch { setOcrStatus("no_phone") }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const fullAddress = [address, colony, city, state, zipCode].filter(Boolean).join(", ") || "Dirección pendiente"
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    onSave({
      id: Date.now().toString(),
      propertyId: "",
      propertyAddress: fullAddress,
      ownerPhone: phone || "Sin teléfono",
      type,
      scheduledFor: tomorrow.toISOString().split("T")[0],
      scheduledTime: "10:00",
      status: "pendiente",
      notes,
      source: "captura_rapida",
      lat: gpsCoords?.lat,
      lng: gpsCoords?.lng,
      createdAt: new Date().toISOString().split("T")[0],
    })
  }

  const canSave = !!(address || colony || city || phone)

  return (
    <div className="screen" style={{ paddingBottom: 100 }}>
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F08</span>
      </div>
      {/* Header */}
      <div style={{
        padding: "52px 16px 16px",
        background: "linear-gradient(135deg,#1e40af,#2563eb)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.2)", border: "none",
            borderRadius: 10, padding: "6px 8px", cursor: "pointer",
          }}>
            <ArrowLeft size={20} color="white" />
          </button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "white" }}>📸 Captura Rápida</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: 0 }}>Foto · Teléfono · GPS · Llamar después</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>

        {/* 1. FOTO */}
        <input ref={fileRef} type="file" accept="image/*" capture="environment"
          style={{ display: "none" }} onChange={handlePhoto} />

        {!photoUrl ? (
          <button onClick={() => fileRef.current?.click()} style={{
            width: "100%", height: 160, border: "2px dashed #93c5fd",
            borderRadius: 16, background: "#eff6ff", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 8, marginBottom: 16,
          }}>
            <Camera size={34} color="#2563eb" />
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1e40af" }}>Fotografiar el inmueble</span>
            <span style={{ fontSize: 12, color: "#2563eb" }}>El teléfono se leerá automáticamente del letrero</span>
          </button>
        ) : (
          <div style={{ position: "relative", marginBottom: 16, borderRadius: 16, overflow: "hidden" }}>
            <img src={photoUrl} alt="Captura" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
            <button onClick={() => fileRef.current?.click()} style={{
              position: "absolute", bottom: 10, right: 10,
              background: "rgba(0,0,0,0.65)", border: "none", borderRadius: 10,
              padding: "6px 12px", color: "white", fontSize: 12, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}>
              <Camera size={13} /> Cambiar
            </button>
            {ocrStatus === "loading" && (
              <div style={{
                position: "absolute", top: 10, left: 10,
                background: "rgba(217,119,6,0.92)", borderRadius: 8,
                padding: "5px 12px", color: "white", fontSize: 11,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <Loader2 size={11} /> Leyendo teléfono del letrero…
              </div>
            )}
            {ocrStatus === "done" && (
              <div style={{
                position: "absolute", top: 10, left: 10,
                background: "rgba(22,163,74,0.92)", borderRadius: 8,
                padding: "5px 12px", color: "white", fontSize: 11,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <CheckCircle2 size={11} /> Teléfono detectado
              </div>
            )}
          </div>
        )}

        {/* 2. TELÉFONO — inmediatamente después de la foto */}
        <div style={{ background: "#f8fafc", borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
            <Phone size={15} color="#2563eb" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Teléfono del propietario</span>
            {ocrStatus === "loading" && (
              <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                <Loader2 size={10} /> OCR…
              </span>
            )}
          </div>
          <input className="input-field" placeholder="Se detecta por OCR o captura manualmente"
            value={phone} onChange={e => setPhone(e.target.value)}
            type="tel" inputMode="tel" />
          {ocrStatus === "no_phone" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
              <AlertCircle size={12} color="#f59e0b" />
              <span style={{ fontSize: 11, color: "#1d4ed8" }}>
                No se detectó número en la foto — ingrésalo manualmente
              </span>
            </div>
          )}
        </div>

        {/* 3. TIPO */}
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Tipo de pendiente</label>
          <div style={{ display: "flex", gap: 8 }}>
            {([
              { key: "llamada", label: "📞 Llamada", color: "#2563eb", bg: "#dbeafe" },
              { key: "recorrido", label: "🗺 Recorrido", color: "#6d28d9", bg: "#ede9fe" },
              { key: "reunion", label: "🤝 Reunión", color: "#1d4ed8", bg: "#dbeafe" },
            ] as const).map(op => (
              <button key={op.key} onClick={() => setType(op.key)} style={{
                flex: 1, padding: "10px 4px", border: "1.5px solid",
                borderColor: type === op.key ? op.color : "#e2e8f0",
                borderRadius: 12, cursor: "pointer",
                background: type === op.key ? op.bg : "white",
                color: type === op.key ? op.color : "#6b7280",
                fontWeight: 700, fontSize: 11,
              }}>
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. DIRECCIÓN (GPS) */}
        <div style={{ background: "#f8fafc", borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <MapPin size={15} color="#2563eb" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Dirección</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {geoStatus === "loading" && (
                <span style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                  <Loader2 size={11} /> Obteniendo GPS…
                </span>
              )}
              {geoStatus === "done" && (
                <span style={{ fontSize: 11, color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle2 size={11} /> GPS capturado
                </span>
              )}
              {geoStatus === "error" && (
                <span style={{ fontSize: 11, color: "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertCircle size={11} /> GPS no disponible
                </span>
              )}
              <button onClick={captureGPS} disabled={geoStatus === "loading"} style={{
                background: "#2563eb", color: "white", border: "none",
                borderRadius: 8, padding: "4px 10px", fontSize: 11,
                fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                opacity: geoStatus === "loading" ? 0.6 : 1,
              }}>
                <RefreshCw size={10} />
                {geoStatus === "loading" ? "…" : "GPS"}
              </button>
            </div>
          </div>

          <input className="input-field" style={{ marginBottom: 10 }}
            placeholder="Calle y número"
            value={address} onChange={e => setAddress(e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input className="input-field" placeholder="Colonia"
              value={colony} onChange={e => setColony(e.target.value)} />
            <input className="input-field" placeholder="Ciudad"
              value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input className="input-field" placeholder="Estado"
              value={state} onChange={e => setState(e.target.value)} />
            <input className="input-field" placeholder="C.P."
              value={zipCode} onChange={e => setZipCode(e.target.value)}
              type="text" inputMode="numeric" maxLength={5} />
          </div>
          {geoStatus === "error" && (
            <div style={{ marginTop: 8, padding: "8px 10px", background: "#fef2f2", borderRadius: 8 }}>
              <p style={{ fontSize: 11, color: "#991b1b", margin: 0 }}>
                El GPS requiere permiso de ubicación en el navegador. Actívalo o ingresa la dirección manualmente.
              </p>
            </div>
          )}
        </div>

        {/* 5. NOTAS */}
        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>Notas (opcional)</label>
          <textarea className="input-field" style={{ height: 64, resize: "none" }}
            placeholder="Ej. Casa en esquina, letrero azul, preguntar por Ana…"
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={!canSave} style={{
          background: canSave ? "#2563eb" : "#e2e8f0",
          color: canSave ? "white" : "#94a3b8",
        }}>
          ✓ Guardar para llamar después
        </button>
        <button className="btn-secondary" onClick={onBack} style={{ marginTop: 8 }}>Cancelar</button>
      </div>
    </div>
  )
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6,
}
