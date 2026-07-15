import { useEffect, useState } from "react";
import "../styles/dashboard.css";
import "../styles/simulation.css";
import { deleteDssHistory, getDssOptions, listDssHistories } from "../services/dss";
import type { HistoryListItem } from "../types/api";
import type { Page } from "../types";

interface HistoryPageProps {
  setPage: (p: Page) => void;
}

function formatDateId(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function fmtNum(val: number | null | undefined, suffix = "", precision = 1): string {
  if (val === null || val === undefined) return "—";
  return `${val.toFixed(precision)}${suffix}`;
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function HistoryPage({ setPage }: HistoryPageProps) {
  void setPage;
  const [histories, setHistories] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [varietyLabelByCode, setVarietyLabelByCode] = useState<Record<string, string>>({});
  const [systemLabelByCode, setSystemLabelByCode] = useState<Record<string, string>>({});

  const loadHistories = async () => {
    setLoading(true);
    setLoadError(null);
    setIsGuest(false);
    try {
      const resp = await listDssHistories();
      setHistories(resp.data ?? []);
    } catch (e: unknown) {
      const status = (e as { status?: number })?.status;
      if (status === 401) setIsGuest(true);
      else setLoadError("Failed to load history records. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadHistories);
  }, []);

  useEffect(() => {
    let active = true;
    const loadOptions = async () => {
      try {
        const resp = await getDssOptions();
        if (!active) return;
        const vMap: Record<string, string> = {};
        for (const v of resp.rice_varieties ?? []) vMap[v.code] = v.label;
        const sMap: Record<string, string> = {};
        for (const s of resp.planting_systems ?? []) sMap[s.code] = s.label;
        setVarietyLabelByCode(vMap);
        setSystemLabelByCode(sMap);
      } catch {
        if (!active) return;
        setVarietyLabelByCode({});
        setSystemLabelByCode({});
      }
    };
    void loadOptions();
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this simulation record?")) return;
    setDeletingId(id);
    try {
      await deleteDssHistory(id);
      setHistories((prev) => prev.filter((h) => h.id !== id));
    } catch {
      alert("Failed to delete history record. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const statsToShow = [
    {
      label: "Total Simulations",
      value: isGuest ? "—" : String(histories.length),
      unit: "sessions",
      delta: "Saved in account",
      up: true,
    },
  ];

  return (
    <div className="page-body">
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          Simulation History
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
          Historical rice–duck DSS simulation runs linked to your authenticated session.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {statsToShow.map((s, i) => (
          <div key={i} className="card">
            <div className="card-body">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">
                {s.value}
                {s.unit && <span> {s.unit}</span>}
              </div>
              <div className={`stat-delta ${s.up ? "up" : "down"}`}>{s.delta}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Saved Simulation Runs</span>
          {!isGuest && !loading && (
            <button
              onClick={() => void loadHistories()}
              style={{
                fontSize: 12,
                color: "var(--green-600)",
                fontWeight: 700,
                cursor: "pointer",
                background: "transparent",
                border: "none",
                padding: "4px 8px",
              }}
            >
              ↻ Refresh
            </button>
          )}
        </div>
        <div className="card-body">
          {isGuest && (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 6,
                  color: "var(--text-primary)",
                }}
              >
                Sign in to View Simulation History
              </div>
              <div style={{ fontSize: 13 }}>
                Log in with your credentials to access stored DSS model runs.
              </div>
            </div>
          )}

          {loading && !isGuest && (
            <div style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)", fontSize: 13 }}>
              ⏳ Loading simulation history...
            </div>
          )}

          {loadError && !loading && (
            <div
              style={{
                padding: "14px",
                background: "rgba(220,38,38,0.07)",
                border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                color: "#b91c1c",
              }}
            >
              {loadError}
            </div>
          )}

          {!loading && !isGuest && !loadError && histories.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)", fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
              No saved simulations found. Run a simulation in the <strong>DSS Model</strong> page to save history.
            </div>
          )}

          {!loading && !isGuest && !loadError && histories.length > 0 && (
            <div>
              {histories.map((h) => (
                <div key={h.id} className="history-item">
                  <div className="history-item-date">{formatDateId(h.created_at)}</div>
                  <div className="history-item-body">
                    <div className="history-item-title">
                      {varietyLabelByCode[h.summary.rice_variety] ?? h.summary.rice_variety} · {systemLabelByCode[h.summary.planting_system] ?? h.summary.planting_system}
                    </div>
                    <div className="history-item-meta">
                      <span>🦆 {h.summary.duck_count} head</span>
                      <span>📐 {fmtNum(h.summary.land_area_are, " are", 1)}</span>
                      <span>⚖️ {fmtNum(h.summary.actual_density_are, " head/are", 2)}</span>
                      <span>🌾 {fmtNum(h.summary.estimated_total_yield_kg, " kg total", 1)}</span>
                      <span>Harvest: {fmtDate(h.summary.d_panen_gabah)}</span>
                    </div>
                  </div>
                  <div className="history-item-actions">
                    <button
                      className="btn-delete-history"
                      onClick={() => void handleDelete(h.id)}
                      disabled={deletingId === h.id}
                    >
                      {deletingId === h.id ? "⏳" : "🗑 Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "12px 16px",
          background: "rgba(59,130,246,0.05)",
          border: "1px solid rgba(59,130,246,0.15)",
          borderRadius: "var(--radius-sm)",
          fontSize: 12,
          color: "#1e40af",
          lineHeight: 1.6,
        }}
      >
        <strong>Note:</strong> History is persisted per user account for authenticated sessions.
      </div>
    </div>
  );
}
