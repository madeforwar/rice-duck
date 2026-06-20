import { useState, useEffect } from "react";
import type { Page, SimInput, SimOutput } from "../types";
import "../styles/dashboard.css";

interface DashboardPageProps {
  setPage: (p: Page) => void;
  simInput: SimInput;
  simOutput: SimOutput;
  loggedMoisture: number;
  setLoggedMoisture: (val: number) => void;
  loggedWaterLevel: number;
  setLoggedWaterLevel: (val: number) => void;
}

const TIMELINE_STEPS = [
  { icon: "✓", label: "Soil Prep", date: "Finished Mar 02", status: "done" },
  { icon: "✓", label: "Seeding", date: "Finished Mar 15", status: "done" },
  {
    icon: "🦆",
    label: "Duck Intro",
    date: "Active Stage",
    status: "active",
    tag: "Active Stage",
  },
  { icon: "◎", label: "Ripening", date: "Est. May 30", status: "pending" },
  { icon: "✂", label: "Harvest", date: "Est. Jun 8", status: "pending" },
];

export default function DashboardPage({
  setPage,
  simInput,
  simOutput,
  loggedMoisture,
  setLoggedMoisture,
  loggedWaterLevel,
  setLoggedWaterLevel,
}: DashboardPageProps) {
  const [tempMoisture, setTempMoisture] = useState<number>(loggedMoisture);
  const [tempWaterLevel, setTempWaterLevel] =
    useState<number>(loggedWaterLevel);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewScope, setViewScope] = useState<"weekly" | "monthly">("weekly");

  useEffect(() => {
    setTempMoisture(loggedMoisture);
  }, [loggedMoisture]);

  useEffect(() => {
    setTempWaterLevel(loggedWaterLevel);
  }, [loggedWaterLevel]);

  const handleLogData = () => {
    setLoggedMoisture(tempMoisture);
    setLoggedWaterLevel(tempWaterLevel);
    setToastMessage(
      `Sukses mencatat data observasi: Kelembaban ${tempMoisture}%, Tinggi Air ${tempWaterLevel} cm.`,
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Calculate dynamic growth heights based on simulated variety, system, duck density, and logged observations
  const stages =
    viewScope === "weekly"
      ? [
          { wk: "Wk-2", baseOpt: 25 },
          { wk: "Wk-4", baseOpt: 45 },
          { wk: "Wk-6", baseOpt: 65 },
          { wk: "Wk-8", baseOpt: 85 },
          { wk: "Wk-10", baseOpt: 95 },
        ]
      : [
          { wk: "Bln-1", baseOpt: 35 },
          { wk: "Bln-2", baseOpt: 75 },
          { wk: "Bln-3", baseOpt: 98 },
        ];

  // Variety factor:
  const varFactor =
    simInput.varietasPadi === "Inpari 32"
      ? 1.06
      : simInput.varietasPadi === "Cigelis"
        ? 0.92
        : simInput.varietasPadi === "Sertani"
          ? 0.98
          : 1.0;

  // System factor:
  const sysFactor =
    simInput.sistemTanam === "SRI"
      ? 1.1
      : simInput.sistemTanam === "Jajar Legowo"
        ? 1.05
        : simInput.sistemTanam === "Tegel/Konvensional"
          ? 0.93
          : 1.0;

  // Duck density factor:
  const density = simOutput.currentDensity;
  const duckGrowthFactor = density > 150 ? 0.85 : density < 50 ? 0.92 : 1.08;

  // Moisture stress factor:
  const moistureOffset = Math.abs(loggedMoisture - 75);
  const moistureFactor =
    moistureOffset > 10
      ? Math.max(0.7, 1 - (moistureOffset - 10) * 0.015)
      : 1.0;

  // Water level stress factor:
  const waterOffset = Math.abs(loggedWaterLevel - 12.5);
  const waterFactor =
    waterOffset > 2.5 ? Math.max(0.75, 1 - (waterOffset - 2.5) * 0.03) : 1.0;

  // Final growth scaling multiplier:
  const actualMultiplier =
    sysFactor * duckGrowthFactor * moistureFactor * waterFactor;

  const BAR_DATA = stages.map((stage) => {
    const optimal = Math.round(stage.baseOpt * varFactor);
    const actual = Math.round(stage.baseOpt * varFactor * actualMultiplier);
    return {
      label: stage.wk,
      optimal: Math.min(100, optimal),
      actual: Math.min(100, actual),
    };
  });
  return (
    <div className="page-body">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-tag">Subak Sibang · Badung</div>
        <h1 className="hero-title">The Symbiosis of Earth and Water</h1>
        <p className="hero-desc">
          In the heart of the Subak system, our rice and ducks dance in a
          centuries-old rhythm. This dashboard translates the whispers of the
          soil into the language of growth.
        </p>
      </div>

      {/* Cultivation Timeline */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">Cultivation Timeline</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Current Cycle: Subak organic IR-64 · Bali Runner Ducks
            </span>
            <span className="day-badge">DAY 42 / 105</span>
          </div>
        </div>
        <div className="card-body">
          <div className="timeline">
            {TIMELINE_STEPS.map((step) => (
              <div key={step.label} className="timeline-step">
                <div className={`timeline-dot ${step.status}`}>
                  {step.status === "done"
                    ? "✓"
                    : step.status === "active"
                      ? "🦆"
                      : step.icon}
                </div>
                <div className="timeline-step-label">{step.label}</div>
                {step.tag && (
                  <div className="timeline-step-active-tag">{step.tag}</div>
                )}
                <div className="timeline-step-date">{step.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rice Growth + Duck Synergy */}
      <div className="two-col">
        {/* Rice Growth Analysis */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🌾 Rice Growth Analysis</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setViewScope("weekly")}
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 99,
                  cursor: "pointer",
                  background: viewScope === "weekly" ? "var(--green-600)" : "transparent",
                  border: viewScope === "weekly" ? "none" : "1px solid var(--surface-border)",
                  color: viewScope === "weekly" ? "white" : "var(--text-muted)",
                  fontWeight: viewScope === "weekly" ? 700 : 500,
                  fontFamily: "var(--font-body)",
                }}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewScope("monthly")}
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 99,
                  cursor: "pointer",
                  background: viewScope === "monthly" ? "var(--green-600)" : "transparent",
                  border: viewScope === "monthly" ? "none" : "1px solid var(--surface-border)",
                  color: viewScope === "monthly" ? "white" : "var(--text-muted)",
                  fontWeight: viewScope === "monthly" ? 700 : 500,
                  fontFamily: "var(--font-body)",
                }}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="card-body">
            {/* Stress indicator based on moisture and water level */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(22,101,52,0.04)",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                marginBottom: 14,
                border: "1px solid rgba(22,101,52,0.1)",
                fontSize: "12px",
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Growth Factor:</span>{" "}
                <span
                  style={{
                    fontWeight: 700,
                    color: actualMultiplier >= 1.0 ? "var(--green-600)" : "var(--accent-amber)",
                  }}
                >
                  {(actualMultiplier * 100).toFixed(0)}%
                </span>
                {moistureFactor < 1.0 && (
                  <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>
                    (Moisture Stress: -{((1 - moistureFactor) * 100).toFixed(0)}%)
                  </span>
                )}
                {waterFactor < 1.0 && (
                  <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>
                    (Water Stress: -{((1 - waterFactor) * 100).toFixed(0)}%)
                  </span>
                )}
                {moistureFactor === 1.0 && waterFactor === 1.0 && (
                  <span style={{ color: "var(--green-600)", marginLeft: 6 }}>
                    (Soil conditions optimal!)
                  </span>
                )}
              </div>
            </div>

            <div className="chart-legend">
              <div className="legend-item">
                <div
                  className="legend-dot"
                  style={{ background: "linear-gradient(180deg, var(--green-400), var(--green-600))" }}
                />
                Actual Growth (cm)
              </div>
              <div className="legend-item">
                <div
                  className="legend-dot"
                  style={{ background: "rgba(209,250,229,0.7)", border: "1px dashed var(--green-400)" }}
                />
                Optimal Baseline (cm)
              </div>
            </div>

            <div style={{ display: "flex", position: "relative", height: "185px", marginTop: 15 }}>
              {/* Y Axis */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  width: 35,
                  paddingBottom: 20,
                  textAlign: "right",
                  paddingRight: 8,
                  boxSizing: "border-box",
                }}
              >
                <span>100cm</span>
                <span>75cm</span>
                <span>50cm</span>
                <span>25cm</span>
                <span>0cm</span>
              </div>

              {/* Chart Plot Area */}
              <div style={{ flex: 1, position: "relative", height: "100%" }}>
                {/* Horizontal Gridlines */}
                <div
                  style={{
                    position: "absolute",
                    inset: "0 0 20px 0",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ borderBottom: "1px dashed rgba(0,0,0,0.06)", height: 0 }} />
                  <div style={{ borderBottom: "1px dashed rgba(0,0,0,0.06)", height: 0 }} />
                  <div style={{ borderBottom: "1px dashed rgba(0,0,0,0.06)", height: 0 }} />
                  <div style={{ borderBottom: "1px dashed rgba(0,0,0,0.06)", height: 0 }} />
                  <div style={{ borderBottom: "1px solid rgba(0,0,0,0.15)", height: 0 }} />
                </div>

                {/* Bars */}
                <div
                  style={{
                    position: "absolute",
                    inset: "0 0 20px 0",
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 12,
                    padding: "0 8px",
                  }}
                >
                  {BAR_DATA.map((d) => (
                    <div
                      key={d.label}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "flex-end",
                        height: "100%",
                        position: "relative",
                        gap: 4,
                      }}
                    >
                      {/* Optimal bar */}
                      <div
                        style={{
                          flex: 1,
                          height: `${d.optimal}%`,
                          background: "rgba(209,250,229,0.4)",
                          border: "1.5px dashed var(--green-400)",
                          borderRadius: "4px 4px 0 0",
                          position: "relative",
                          display: "flex",
                          justifyContent: "center",
                          transition: "height 0.4s ease",
                        }}
                        title={`Optimal: ${d.optimal} cm`}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: -16,
                            fontSize: 9,
                            fontWeight: 600,
                            color: "var(--green-700)",
                          }}
                        >
                          {d.optimal}
                        </span>
                      </div>

                      {/* Actual bar */}
                      <div
                        style={{
                          flex: 1,
                          height: `${d.actual}%`,
                          background: "linear-gradient(180deg, var(--green-400), var(--green-600))",
                          borderRadius: "4px 4px 0 0",
                          boxShadow: "0 2px 5px rgba(22,128,58,0.15)",
                          position: "relative",
                          display: "flex",
                          justifyContent: "center",
                          transition: "height 0.4s ease",
                        }}
                        title={`Actual: ${d.actual} cm`}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: -16,
                            fontSize: 9,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                          }}
                        >
                          {d.actual}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* X Axis Labels */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 20,
                    display: "flex",
                    padding: "0 8px",
                  }}
                >
                  {BAR_DATA.map((d) => (
                    <div
                      key={d.label}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        paddingTop: 4,
                      }}
                    >
                      {d.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Duck Synergy */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🦆 Duck Synergy</span>
          </div>
          <div className="card-body">
            <div className="synergy-stat">
              <div className="synergy-stat-top">
                <span className="synergy-stat-label">Flock Vitality</span>
                <span className="synergy-stat-delta">+6.2% △</span>
              </div>
              <div className="synergy-stat-value">98%</div>
              <div className="synergy-stat-sub">Optimal Range</div>
            </div>
            <div className="synergy-stat">
              <div className="synergy-stat-top">
                <span className="synergy-stat-label">Pest Reduction</span>
                <span className="synergy-stat-delta">+12% △</span>
              </div>
              <div className="synergy-stat-value">85%</div>
              <div className="synergy-stat-sub">vs Artificial Control</div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Observation + Active Alerts */}
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Field Observation</span>
          </div>
          <div className="card-body">
            {toastMessage && (
              <div
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  color: "var(--green-700)",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  marginBottom: "12px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>✓</span> {toastMessage}
              </div>
            )}
            <div className="obs-input-group">
              <div className="obs-input-label">Soil Moisture (%)</div>
              <input
                className="obs-input"
                type="number"
                value={tempMoisture}
                onChange={(e) =>
                  setTempMoisture(parseFloat(e.target.value) || 0)
                }
                min={0}
                max={100}
              />
            </div>
            <div className="obs-input-group">
              <div className="obs-input-label">Water Level (cm)</div>
              <input
                className="obs-input"
                type="number"
                value={tempWaterLevel}
                onChange={(e) =>
                  setTempWaterLevel(parseFloat(e.target.value) || 0)
                }
                step={0.5}
                min={0}
                max={50}
              />
            </div>
            <button className="btn-log" onClick={handleLogData}>
              Log Data Point
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Active Alerts</span>
          </div>
          <div className="card-body">
            <div className="alert-item warning">
              <span className="alert-icon">⚠️</span>
              <div style={{ flex: 1 }}>
                <div className="alert-title">Duck Movement Restricted</div>
                <div className="alert-body">
                  Heavy rainfall predicted in 4 hours. Move flock to high ground
                  shelters.
                </div>
              </div>
              <span className="alert-dismiss">Dismiss</span>
            </div>
            <div className="alert-item info">
              <span className="alert-icon">○</span>
              <div style={{ flex: 1 }}>
                <div className="alert-title">Fertilizer Cycle Pending</div>
                <div className="alert-body">
                  Scheduled for Day 45 (in 3 days).
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Last automated sync: 2 minutes ago
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--green-600)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--green-400)",
                    display: "inline-block",
                  }}
                />
                Connected to Subak Grid
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA to Simulation */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(22,101,52,0.08), rgba(34,197,94,0.05))",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "var(--radius-md)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 0,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              color: "var(--text-primary)",
              marginBottom: 3,
            }}
          >
            Simulasikan Musim Tanam Berikutnya
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Masukkan parameter lahan untuk prediksi dan rekomendasi
            agro-ekologis
          </div>
        </div>
        <button
          onClick={() => setPage("simulasi")}
          style={{
            background: "var(--green-700)",
            color: "white",
            padding: "11px 22px",
            borderRadius: "var(--radius-sm)",
            fontWeight: 700,
            fontSize: 13.5,
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            whiteSpace: "nowrap",
            border: "none",
            transition: "background var(--transition)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--green-600)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--green-700)")
          }
        >
          Simulasikan & Bandingkan →
        </button>
      </div>
    </div>
  );
}
