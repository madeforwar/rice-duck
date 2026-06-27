import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { ApiError } from "../lib/api-error";

interface AuthModalProps {
  onClose: () => void;
}

type ModalMode = "login" | "register";

export default function AuthModal({ onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<ModalMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "login") {
        await login({ email, password });
        onClose();
      } else {
        await register({ name, email, password });
        setSuccessMsg("Pendaftaran berhasil! Silakan login.");
        setMode("login");
        setName("");
        setPassword("");
      }
    } catch (e: unknown) {
      const apiErr = e as ApiError;
      setError(apiErr?.message ?? "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleSubmit();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: 400,
          overflow: "hidden",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f2d17 0%, #166534 100%)",
            padding: "20px 24px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  color: "white",
                  marginBottom: 3,
                }}
              >
                {mode === "login" ? "Masuk ke Akun" : "Buat Akun Baru"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {mode === "login"
                  ? "Login untuk menyimpan history simulasi"
                  : "Daftar untuk menyimpan & mengakses riwayat"}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none",
                color: "rgba(255,255,255,0.7)",
                width: 28,
                height: 28,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          {/* Mode toggle */}
          <div
            style={{
              display: "flex",
              marginTop: 14,
              background: "rgba(0,0,0,0.2)",
              borderRadius: "var(--radius-sm)",
              padding: 3,
              gap: 3,
            }}
          >
            {(["login", "register"] as ModalMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setSuccessMsg(null);
                }}
                style={{
                  flex: 1,
                  background: mode === m ? "white" : "transparent",
                  color: mode === m ? "var(--green-700)" : "rgba(255,255,255,0.6)",
                  border: "none",
                  borderRadius: "calc(var(--radius-sm) - 2px)",
                  padding: "7px 0",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all var(--transition)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {m === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px 24px" }}>
          {successMsg && (
            <div
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 12px",
                fontSize: 13,
                color: "var(--green-700)",
                marginBottom: 14,
                fontWeight: 600,
              }}
            >
              ✓ {successMsg}
            </div>
          )}

          {error && (
            <div
              style={{
                background: "rgba(220,38,38,0.07)",
                border: "1px solid rgba(220,38,38,0.22)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 12px",
                fontSize: 13,
                color: "#b91c1c",
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          {mode === "register" && (
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 5,
                }}
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Pak Wayan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 5,
              }}
            >
              Email
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="email@contoh.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus={mode === "login"}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 5,
              }}
            >
              Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder={mode === "register" ? "Min. 8 karakter" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            onClick={() => void handleSubmit()}
            disabled={isLoading}
            style={{
              width: "100%",
              background: isLoading
                ? "var(--surface-border)"
                : "linear-gradient(135deg, var(--green-600), var(--green-500))",
              color: isLoading ? "var(--text-muted)" : "white",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "12px",
              fontSize: 14,
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              transition: "all var(--transition)",
              boxShadow: isLoading ? "none" : "0 3px 10px rgba(22,128,58,0.3)",
            }}
          >
            {isLoading
              ? "⏳ Memproses..."
              : mode === "login"
              ? "Masuk"
              : "Buat Akun"}
          </button>
        </div>
      </div>
    </div>
  );
}
