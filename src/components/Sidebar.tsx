import { useState } from "react";
import type { Page } from "../types";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import "../styles/sidebar.css";

interface SidebarProps {
  page: Page;
  setPage: (p: Page) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: "simulasi", label: "Simulasi DSS" },
  { id: "history", label: "History" },
];

export default function Sidebar({
  page,
  setPage,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const { status, user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isAuthenticated = status === "authenticated" && Boolean(user);
  const isLoading = status === "loading";

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "AW";

  const handleNavClick = (id: Page) => {
    setPage(id);
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${mobileOpen ? " open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <div className="sidebar-logo-icon">🌾</div>
            <span className="sidebar-logo-name">Astungkara Way</span>
          </div>
        </div>

        <div className="sidebar-section">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`sidebar-nav-item${page === item.id ? " active" : ""}`}
              onClick={() => handleNavClick(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleNavClick(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          {isLoading ? (
            <div
              style={{
                padding: "10px",
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Memuat sesi…
            </div>
          ) : isAuthenticated ? (
            <div>
              <div className="sidebar-user">
                <div className="sidebar-user-avatar">{initials}</div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user!.name}</div>
                  <div
                    className="sidebar-user-role"
                    style={{ fontSize: 10, opacity: 0.65 }}
                  >
                    {user!.email}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                style={{
                  width: "100%",
                  marginTop: 6,
                  background: "transparent",
                  border: "1px solid #dc2626",
                  borderRadius: "var(--radius-sm)",
                  color: "#dc2626",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  transition: "all var(--transition)",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(220,38,38,0.12)";
                  e.currentTarget.style.color = "#f87171";
                  e.currentTarget.style.borderColor = "#f87171";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#dc2626";
                  e.currentTarget.style.borderColor = "#dc2626";
                }}
              >
                Keluar
              </button>
            </div>
          ) : (
            <div>
              <div
                className="sidebar-user"
                style={{ cursor: "default", opacity: 0.6 }}
              >
                <div
                  className="sidebar-user-avatar"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  👤
                </div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">Tamu</div>
                  <div className="sidebar-user-role">Tidak login</div>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  width: "100%",
                  marginTop: 6,
                  background:
                    "linear-gradient(135deg, var(--green-600), var(--green-500))",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  transition: "all var(--transition)",
                  boxShadow: "0 2px 8px rgba(22,128,58,0.25)",
                }}
              >
                Masuk / Daftar
              </button>
            </div>
          )}
        </div>
      </aside>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
