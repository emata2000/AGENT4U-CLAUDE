"use client"
import { useState } from "react"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { Building2 } from "lucide-react"

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
      // App.tsx onAuthStateChanged will react automatically
    } catch (e: unknown) {
      setError("Error al iniciar sesión. Intenta de nuevo.")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="screen" style={{ background: "white" }}>
      <div style={{ position: "sticky", top: 8, height: 0, zIndex: 999, display: "flex", justifyContent: "flex-end", paddingRight: 10, overflow: "visible" }}>
        <span style={{ background: "white", color: "#1e293b", fontSize: 9, fontWeight: 700, fontFamily: "monospace", padding: "2px 7px", borderRadius: 5, letterSpacing: 0.5, pointerEvents: "none", boxShadow: "0 1px 5px rgba(0,0,0,0.3)", border: "1px solid rgba(0,0,0,0.1)" }}>F13</span>
      </div>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)",
        padding: "60px 32px 48px",
        textAlign: "center",
        color: "white",
      }}>
        <div style={{
          width: 72, height: 72,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          backdropFilter: "blur(10px)",
        }}>
          <Building2 size={36} color="white" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>Agent4U</h1>
        <p style={{ fontSize: 16, opacity: 0.85, margin: 0 }}>Tu CRM inmobiliario en campo</p>

        {/* Wave */}
        <svg viewBox="0 0 430 60" style={{ display: "block", marginBottom: -2, marginTop: 40 }}>
          <path d="M0,30 Q107,0 215,30 T430,30 L430,60 L0,60 Z" fill="white" />
        </svg>
      </div>

      <div style={{ padding: "32px 24px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#111827" }}>
          Bienvenido de vuelta
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 32 }}>
          Inicia sesión para acceder a tu cartera de inmuebles
        </p>

        {/* Google login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "14px 20px",
            border: "1.5px solid #e2e8f0",
            borderRadius: 14,
            background: loading ? "#f8fafc" : "white",
            fontSize: 16,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            color: "#374151",
            marginBottom: 16,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <div style={{ width: 20, height: 20, border: "2px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? "Iniciando sesión..." : "Continuar con Google"}
        </button>

        {error && (
          <p style={{ color: "#dc2626", fontSize: 13, textAlign: "center", marginTop: -8, marginBottom: 8 }}>
            {error}
          </p>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

        <p style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "#9ca3af" }}>
          Plan Gratis incluye 10 propiedades activas
        </p>
      </div>
    </div>
  )
}
