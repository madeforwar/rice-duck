import React, { useEffect, useMemo, useState } from "react";
import type { Page } from "../types";
import { simulateDss, getDssOptions, getDssVisualization } from "../services/dss";
import type {
  DssSimulationInputState,
  DssSimulationRequest,
  DssSimulationResponse,
  VisualizationResponse,
  RiceVarietyOption,
  PlantingSystemOption,
} from "../types/api";
import { DensityCurveChart } from "../components/charts/DensityCurveChart";
import { AgeVulnerabilityChart } from "../components/charts/AgeVulnerabilityChart";
import { TwoTierCashBreakdownChart } from "../components/charts/TwoTierCashBreakdownChart";
import "../styles/simulation.css";
import "../styles/dashboard.css";

interface SimulasiPageProps {
  setPage?: (p: Page) => void;
  dssInput: DssSimulationInputState;
  setDssInput: (input: DssSimulationInputState) => void;
  dssOutput: DssSimulationResponse | null;
  setDssOutput: (output: DssSimulationResponse | null) => void;
}

function fmtNum(
  value: number | null | undefined,
  opts: { suffix?: string; precision?: number } = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: opts.precision ?? 0,
    maximumFractionDigits: opts.precision ?? 2,
  })}${opts.suffix ?? ""}`;
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

function fmtRp(val: number | null | undefined): string {
  if (val == null) return "—";
  return `Rp ${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

const STATUS_LABEL: Record<string, string> = {
  SAFE: "Safe Density",
  WARNING_DENSITY: "Excessive Density Warning",
  WARNING_UNDER_DENSITY: "Sub-Optimal Density",
  AGE_BUY_RANGE: "Optimal Age Range",
  AGE_BUY_RANGE_WARNING: "Age Model Deviation",
  ready: "Ready",
  estimation: "Estimated",
  "local-calibrated": "Locally Calibrated",
  "local-estimate": "Local Estimate",
};

// ASCII Tree Symbol Sanitizer helper
function cleanText(text: string): string {
  return text.replace(/[├─└│]/g, "").trim();
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  const label = STATUS_LABEL[status] ?? cleanText(status);
  return <span className={`status-badge ${status}`}>{label}</span>;
}

function DetailSection({
  title,
  children,
  style,
  className,
}: {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={`card${className ? ` ${className}` : ""}`} style={{ marginBottom: 4, ...style }}>
      <div className="card-header">
        <span className="card-title">{cleanText(title)}</span>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function MetricWithStatus({
  label,
  value,
  unit,
  status,
  note,
  dateValue,
}: {
  label: string;
  value?: number | string | null | undefined;
  unit?: string;
  status?: string | null;
  note?: string | null;
  dateValue?: string | null | undefined;
}) {
  let displayValue: React.ReactNode;
  const safeLabel = cleanText(label);

  if (dateValue) {
    displayValue = <span style={{ fontWeight: 600 }}>{fmtDate(dateValue)}</span>;
  } else if (value !== null && value !== undefined) {
    if (unit === "Rp" && typeof value === "number") {
      displayValue = <span style={{ fontWeight: 600 }}>{fmtRp(value)}</span>;
    } else {
      displayValue = (
        <span style={{ fontWeight: 600 }}>
          {typeof value === "number" ? fmtNum(value) : cleanText(String(value))}
          {unit ? ` ${unit}` : ""}
        </span>
      );
    }
  } else {
    displayValue = <span style={{ color: "var(--text-muted)" }}>Not Available</span>;
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {safeLabel}
        </span>
        {status && <StatusBadge status={status} />}
      </div>
      <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
        {displayValue}
      </div>
      {note && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          {cleanText(note)}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ output }: { output: DssSimulationResponse }) {
  return (
    <div
      className="card"
      style={{
        marginBottom: 16,
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.05), rgba(16,185,129,0.05))",
        border: "1px solid rgba(34,197,94,0.2)",
      }}
    >
      <div className="card-body">
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          Simulation Executive Summary
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          <MetricWithStatus label="Total Gross Revenue" value={output.Total_Revenue} unit="Rp" />
          <MetricWithStatus label="Total Pure Cash Cost" value={output.Cost_total_cash} unit="Rp" />
          <MetricWithStatus label="Pure Absorbed Net Cash" value={output.Profit_net_cash} unit="Rp" />
        </div>
      </div>
    </div>
  );
}

export default function SimulasiPage({
  dssInput,
  setDssInput,
  dssOutput,
  setDssOutput,
}: SimulasiPageProps) {
  const [activeChartTab, setActiveChartTab] = useState<"density" | "age" | "cash">("density");
  const [vizData, setVizData] = useState<VisualizationResponse | null>(null);
  const [options, setOptions] = useState<{
    rice_varieties: RiceVarietyOption[];
    planting_systems: PlantingSystemOption[];
  } | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const data = await getDssOptions();
        setOptions(data);
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  const varietyByCode = useMemo(() => {
    const map = new Map<string, RiceVarietyOption>();
    options?.rice_varieties.forEach((item) => map.set(item.code, item));
    return map;
  }, [options]);

  const systemByCode = useMemo(() => {
    const map = new Map<string, PlantingSystemOption>();
    options?.planting_systems.forEach((item) => map.set(item.code, item));
    return map;
  }, [options]);

  const handleInputChange = (
    field: keyof DssSimulationRequest,
    value: string | number | null,
  ) => {
    setDssInput({
      ...dssInput,
      [field]: value,
    });
  };

  const needsActualDuckBuyPrice =
    dssInput.duck_age_days != null &&
    (dssInput.duck_age_days < 14 || dssInput.duck_age_days > 21);

  const densityInput =
    dssInput.duck_count != null && dssInput.land_area_are != null && dssInput.land_area_are > 0
      ? dssInput.duck_count / dssInput.land_area_are
      : null;

  const selectedVariety = varietyByCode.get(dssInput.rice_variety);
  const selectedSystem = systemByCode.get(dssInput.planting_system);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (
        dssInput.land_area_are == null ||
        dssInput.duck_count == null ||
        dssInput.duck_age_days == null
      ) {
        setError("Please fill in all numeric parameters accurately.");
        return;
      }

      if (dssInput.land_area_are <= 0) {
        setError("Active wet area must be greater than 0 are.");
        return;
      }

      if (dssInput.duck_count <= 0) {
        setError("Duck population must be greater than 0 head.");
        return;
      }

      if (dssInput.duck_age_days <= 0) {
        setError("Duck age at release must be greater than 0 days.");
        return;
      }

      if (needsActualDuckBuyPrice && dssInput.duck_buy_price_rp_per_duck == null) {
        setError("Actual purchase price per duck is required when age is outside 14–21 days.");
        return;
      }

      if (
        dssInput.duck_buy_price_rp_per_duck != null &&
        dssInput.duck_buy_price_rp_per_duck <= 0
      ) {
        setError("Actual duck purchase price must be greater than 0.");
        return;
      }

      const payload: DssSimulationRequest = {
        ...dssInput,
        land_area_are: dssInput.land_area_are,
        duck_count: dssInput.duck_count,
        duck_age_days: dssInput.duck_age_days,
      };

      const [simResult, vizResult] = await Promise.allSettled([
        simulateDss(payload),
        getDssVisualization(payload),
      ]);

      if (simResult.status === "fulfilled") {
        setDssOutput(simResult.value);
      } else {
        throw simResult.reason;
      }

      if (vizResult.status === "fulfilled") {
        setVizData(vizResult.value);
      } else {
        console.error("Failed to fetch visualization:", vizResult.reason);
      }
    } catch (err: unknown) {
      const message = (err as { error?: { message?: string } })?.error?.message;
      setError(message || "An error occurred while executing the DSS simulation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-body">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <div className="card" style={{ minHeight: 600 }}>
          <div className="card-header">
            <span className="card-title">Simulation Input Parameters</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    background: "rgba(220,38,38,0.05)",
                    border: "1px solid rgba(220,38,38,0.2)",
                    borderRadius: "var(--radius-sm)",
                    color: "#dc2626",
                    fontSize: 14,
                  }}
                >
                  {error}
                </div>
              )}
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Active Wet Area (are)</div>
                <input
                  className="obs-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={dssInput.land_area_are ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "land_area_are",
                      e.target.value ? parseFloat(e.target.value) : null,
                    )
                  }
                  required
                />
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  Active paddy field area for duck integration (1 are = 100 m²).
                </div>
              </div>
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Duck Population (head)</div>
                <input
                  className="obs-input"
                  type="number"
                  step="1"
                  min="1"
                  value={dssInput.duck_count ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "duck_count",
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  required
                />
              </div>
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Rice Variety</div>
                <select
                  className="obs-input"
                  value={dssInput.rice_variety}
                  onChange={(e) => handleInputChange("rice_variety", e.target.value)}
                  disabled={loadingOptions}
                  required
                >
                  <option value="">Select variety...</option>
                  {options?.rice_varieties.map((variety) => (
                    <option key={variety.code} value={variety.code}>
                      {variety.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Planting System</div>
                <select
                  className="obs-input"
                  value={dssInput.planting_system}
                  onChange={(e) => handleInputChange("planting_system", e.target.value)}
                  disabled={loadingOptions}
                  required
                >
                  <option value="">Select planting system...</option>
                  {options?.planting_systems.map((system) => (
                    <option key={system.code} value={system.code}>
                      {system.label}
                    </option>
                  ))}
                </select>
                {selectedSystem && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    Safe density threshold: {selectedSystem.k_safe_are} head/are.
                  </div>
                )}
              </div>
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Planting Date</div>
                <input
                  className="obs-input"
                  type="date"
                  value={dssInput.planting_date}
                  onChange={(e) => handleInputChange("planting_date", e.target.value)}
                  required
                />
              </div>
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Duck Age at Field Entry (days)</div>
                <input
                  className="obs-input"
                  type="number"
                  step="1"
                  min="1"
                  value={dssInput.duck_age_days ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "duck_age_days",
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  required
                />
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  Model reference window is 14–21 days. Ontogeny influences survival ceiling and crop trampling risk.
                </div>
              </div>
              {needsActualDuckBuyPrice && (
                <div className="obs-input-group" style={{ marginBottom: 20 }}>
                  <div className="obs-input-label">Actual Duck Purchase Price (Rp/head)</div>
                  <input
                    className="obs-input"
                    type="number"
                    step="100"
                    min="1"
                    value={dssInput.duck_buy_price_rp_per_duck ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        "duck_buy_price_rp_per_duck",
                        e.target.value ? parseFloat(e.target.value) : null,
                      )
                    }
                    required
                  />
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginTop: 4,
                      lineHeight: 1.5,
                    }}
                  >
                    Required for duck age outside the standard 14–21 day baseline window.
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="btn-log"
                disabled={submitting || loadingOptions}
                style={{ width: "100%" }}
              >
                {submitting ? "Executing DSS Model..." : "Run DSS Simulation"}
              </button>
            </form>
          </div>
        </div>

        <div style={{ minHeight: 600 }}>
          {!dssOutput ? (
            <div
              className="card"
              style={{
                height: "100%",
                minHeight: 600,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: 40,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 8,
                }}
              >
                Prediction Outputs
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                Configure parameters on the left and click Run DSS Simulation to calculate models.
              </div>
            </div>
          ) : (
            <div className="card" style={{ minHeight: 600 }}>
              <div className="card-header">
                <span className="card-title">Operational Summary</span>
              </div>
              <div className="card-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 16,
                  }}
                >
                  <MetricWithStatus label="Calculated Density" value={densityInput} unit="head/are" />
                  <MetricWithStatus label="Density Status" value={STATUS_LABEL[dssOutput.density_status] ?? dssOutput.density_status} />
                  <MetricWithStatus label="Duck Age Status" value={STATUS_LABEL[dssOutput.age_status] ?? dssOutput.age_status} />
                  <MetricWithStatus label="Predicted Duck Survival" value={dssOutput.N_survive} unit="head" />
                  <MetricWithStatus label="Duck Release Date" dateValue={dssOutput.D_masuk_bebek} />
                  <MetricWithStatus label="Duck Withdrawal Date" dateValue={dssOutput.D_tarik_bebek} />
                  <MetricWithStatus label="Rice Harvest Date" dateValue={dssOutput.D_panen_gabah} />
                  <MetricWithStatus label="Total Grain Harvest" value={dssOutput.Yield_total_predict} unit="kg" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {dssOutput && (
        <>
          <div style={{ marginTop: 16 }}>
            <SummaryCard output={dssOutput} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <DetailSection title="Agronomic & Operational Parameters">
              <MetricWithStatus label="Rice Variety" value={selectedVariety?.label ?? dssInput.rice_variety} />
              <MetricWithStatus label="Planting System" value={selectedSystem?.label ?? dssInput.planting_system} />
              <MetricWithStatus label="Calculated Density" value={densityInput} unit="head/are" />
              <MetricWithStatus label="Density Status" value={STATUS_LABEL[dssOutput.density_status] ?? dssOutput.density_status} />
              <MetricWithStatus label="Duck Age Status" value={STATUS_LABEL[dssOutput.age_status] ?? dssOutput.age_status} />
              <MetricWithStatus label="Duck Release Date" dateValue={dssOutput.D_masuk_bebek} />
              <MetricWithStatus label="Duck Withdrawal Date" dateValue={dssOutput.D_tarik_bebek} />
              <MetricWithStatus label="Rice Harvest Date" dateValue={dssOutput.D_panen_gabah} />
              <MetricWithStatus label="Predicted Duck Survival" value={dssOutput.N_survive} unit="head" />
            </DetailSection>

            <DetailSection title="Yield & Revenue Predictions">
              <MetricWithStatus label="Estimated Grain Yield per Unit Area" value={dssOutput.Yield_are_predict} unit="kg/are" />
              <MetricWithStatus label="Estimated Total Grain Harvest" value={dssOutput.Yield_total_predict} unit="kg" />
              <MetricWithStatus label="Estimated Grain Sales Revenue" value={dssOutput.Revenue_gabah} unit="Rp" />
              <MetricWithStatus label="Estimated Duck Sales Revenue" value={dssOutput.Revenue_duck} unit="Rp" />
              <MetricWithStatus label="Total Gross Revenue" value={dssOutput.Total_Revenue} unit="Rp" />
            </DetailSection>

            <DetailSection title="Pure Cash Cost Circuit (Tier 1)">
              <MetricWithStatus label="Duck Purchase Cost" value={dssOutput.Cost_duck_buy} unit="Rp" />
              <MetricWithStatus label="Total Pure Cash Outflow" value={dssOutput.Cost_total_cash} unit="Rp" note="Validated cash outlay strictly comprises livestock acquisition cost." />
            </DetailSection>

            <DetailSection title="Net Financial Absorption Summary">
              <MetricWithStatus label="Total Gross Revenue" value={dssOutput.Total_Revenue} unit="Rp" />
              <MetricWithStatus label="Total Cash Cost Outflow" value={dssOutput.Cost_total_cash} unit="Rp" />
              <MetricWithStatus label="Pure Absorbed Net Cash" value={dssOutput.Profit_net_cash} unit="Rp" note="Hero Financial Metric (Total Gross Revenue minus Cash Outflow)." />
            </DetailSection>
          </div>

          {/* SCIENTIFIC VISUALIZATION CHARTS SECTION */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="card-title">📈 High-Fidelity Scientific Charts & Model Visualizations</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={`tab-btn ${activeChartTab === "density" ? "active" : ""}`}
                  onClick={() => setActiveChartTab("density")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: activeChartTab === "density" ? "var(--green-600)" : "var(--surface-muted)",
                    color: activeChartTab === "density" ? "white" : "var(--text-secondary)",
                    border: "1px solid var(--surface-border)",
                  }}
                >
                  Canopy Growth Index
                </button>
                <button
                  className={`tab-btn ${activeChartTab === "age" ? "active" : ""}`}
                  onClick={() => setActiveChartTab("age")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: activeChartTab === "age" ? "var(--green-600)" : "var(--surface-muted)",
                    color: activeChartTab === "age" ? "white" : "var(--text-secondary)",
                    border: "1px solid var(--surface-border)",
                  }}
                >
                  Ontogenic Risk Penalty
                </button>
                <button
                  className={`tab-btn ${activeChartTab === "cash" ? "active" : ""}`}
                  onClick={() => setActiveChartTab("cash")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: activeChartTab === "cash" ? "var(--green-600)" : "var(--surface-muted)",
                    color: activeChartTab === "cash" ? "white" : "var(--text-secondary)",
                    border: "1px solid var(--surface-border)",
                  }}
                >
                  Financial Waterfall
                </button>
              </div>
            </div>
            <div className="card-body">
              {activeChartTab === "density" && (
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                    Cubic spline relationship curve between duck stocking density (ducks/are) and crop yield multiplier factor.
                    Annotated with Legowo 2:1 (4.0 ducks/are) vs Tegel (3.0 ducks/are) safe carrying capacity limits and saturation threshold (&gt;8.0 ducks/are).
                  </div>
                  <DensityCurveChart 
                    data={vizData?.visualizations?.density_curve ?? vizData?.density_curve ?? dssOutput.charts?.density_series} 
                    currentDensity={densityInput ?? undefined} 
                    benchmarks={vizData?.reference_benchmarks ?? vizData?.visualizations?.benchmarks}
                  />
                </div>
              )}

              {activeChartTab === "age" && (
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                    Piecewise ontogeny vulnerability curve and effective flock survival rate as a function of duckling chronological age.
                    Optimal model window: 14–21 days post-hatch.
                  </div>
                  <AgeVulnerabilityChart 
                    data={vizData?.visualizations?.age_vulnerability ?? vizData?.age_vulnerability ?? dssOutput.charts?.age_series} 
                    currentAge={dssInput.duck_age_days ?? undefined} 
                  />
                </div>
              )}

              {activeChartTab === "cash" && (
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                    Scientific <strong>Financial Waterfall</strong> illustrating gross revenue flow, cash outlays, and net cash absorption.
                  </div>
                  <TwoTierCashBreakdownChart
                    simulationResult={dssOutput}
                    waterfallData={vizData?.visualizations?.financial_waterfall}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
