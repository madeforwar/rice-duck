import React, { useState, useEffect } from "react";
import type { Page } from "../types";
import { simulateDss, getDssOptions } from "../services/dss";
import type {
  DssSimulationRequest,
  DssSimulationResponse,
  RiceVarietyOption,
  PlantingSystemOption,
  ActualScenario,
  RecommendedScenario,
  OptimalityAssessment,
  DataReadinessBlock,
} from "../types/api";
import "../styles/simulation.css";
import "../styles/dashboard.css";

interface SimulasiPageProps {
  setPage?: (p: Page) => void;
  dssInput: any; // Use the extended state from App.tsx
  setDssInput: (input: any) => void;
  dssOutput: DssSimulationResponse | null;
  setDssOutput: (output: DssSimulationResponse | null) => void;
}

// Helper function to format numbers
function fmtNum(
  value: number | null | undefined,
  opts: { suffix?: string; precision?: number } = {},
): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(opts.precision ?? 2)}${opts.suffix ?? ""}`;
}

// Helper function to format dates
function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Status badge component for details
const STATUS_LABEL: Record<string, string> = {
  "local-calibrated": "Data Lokal",
  "local-estimate": "Estimasi Lokal",
  "literature-uncalibrated": "Ref. Literatur",
  mixed: "Data Campuran",
  partial: "Parsial",
  unavailable: "Tidak Tersedia",
  missing: "Tidak Tersedia",
  ready: "Siap",
  "estimation-only": "Estimasi",
  estimation: "Estimasi",
  disabled: "Nonaktif",
  collected: "Terkumpul",
  "system-design": "Aturan Sistem",
};

function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  const label = STATUS_LABEL[status] ?? status;
  return <span className={`status-badge ${status}`}>{label}</span>;
}

// Risk badge component
const RISK_LABEL: Record<string, string> = {
  LOW: "Kepadatan Rendah",
  SAFE: "Kepadatan Aman",
  WARNING: "Perlu Perhatian",
  HIGH: "Risiko Tinggi",
};

// Data readiness translation
const DATA_READINESS_LABEL: Record<string, string> = {
  ready: "Tersedia",
  estimation_only: "Estimasi",
  partial: "Parsial",
  "literature-uncalibrated": "Referensi",
};

function RiskBadge({ riskStatus }: { riskStatus: string | null | undefined }) {
  if (!riskStatus) return null;
  return (
    <span className={`risk-badge ${riskStatus}`}>
      {RISK_LABEL[riskStatus] ?? riskStatus}
    </span>
  );
}

// Card component for showing actual/recommended scenarios
function ScenarioCard({
  title,
  scenario,
}: {
  title: string;
  scenario: ActualScenario | RecommendedScenario | null;
}) {
  if (!scenario) return null;

  const isRecommended = "recommended_duck_count" in scenario;

  return (
    <div
      className="card"
      style={{
        marginBottom: 16,
        borderLeft: isRecommended
          ? "4px solid var(--accent-amber)"
          : "4px solid var(--green-500)",
      }}
    >
      <div className="card-header">
        <span className="card-title">{title}</span>
      </div>
      <div className="card-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Jumlah Bebek
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {isRecommended
                ? (scenario as RecommendedScenario).recommended_duck_count
                : (scenario as ActualScenario).duck_count}{" "}
              ekor
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Luas Lahan
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {(scenario as ActualScenario).land_area_are} are
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Kepadatan
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {isRecommended
                ? fmtNum(
                    (scenario as RecommendedScenario).recommended_density_are,
                    { suffix: " ekor/are" },
                  )
                : fmtNum((scenario as ActualScenario).density_are, {
                    suffix: " ekor/are",
                  })}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Durasi
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {isRecommended
                ? (scenario as RecommendedScenario).recommended_duration_days
                : (scenario as ActualScenario).duration_days}{" "}
              hari
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Tanggal Lepas
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {fmtDate(
                isRecommended
                  ? (scenario as RecommendedScenario).recommended_release_date
                  : (scenario as ActualScenario).release_date,
              )}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Tanggal Tarik
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {fmtDate(
                isRecommended
                  ? (scenario as RecommendedScenario).recommended_pull_date
                  : (scenario as ActualScenario).pull_date,
              )}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Estimasi Yield / Are
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {fmtNum(scenario.predicted_yield.kg_per_are, { suffix: " kg" })}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Total Yield
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {fmtNum(scenario.predicted_yield.estimated_total_kg, {
                suffix: " kg",
                precision: 0,
              })}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Status Risiko
            </div>
            <RiskBadge riskStatus={scenario.risk_status} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Summary Card
function SummaryCard({
  optimality,
  actual,
  dataReadiness,
}: {
  optimality: OptimalityAssessment;
  actual: ActualScenario;
  dataReadiness: DataReadinessBlock;
}) {
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
          {optimality.is_optimal
            ? "✅ Skenario Sudah Optimal"
            : "⚠️ Ada Rekomendasi Perbaikan"}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}
        >
          Skenario aktual memiliki kepadatan{" "}
          {fmtNum(actual.density_are, { suffix: " ekor/are" })} dengan status{" "}
          <span style={{ fontWeight: 600 }}>
            {RISK_LABEL[actual.risk_status] ?? actual.risk_status}
          </span>
          . Estimasi yield utama adalah{" "}
          {fmtNum(actual.predicted_yield.kg_per_are, { suffix: " kg/are" })}.
        </div>
        {dataReadiness.economics_ready !== "ready" && (
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            Data ekonomi masih parsial karena beberapa parameter harga belum
            tersedia.
          </div>
        )}
        <div
          style={{ marginTop: 8, fontSize: 13, color: "var(--text-secondary)" }}
        >
          Status keseluruhan data:{" "}
          <StatusBadge status={dataReadiness.overall_status} />
        </div>
      </div>
    </div>
  );
}

// Detail Section Component
function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ marginBottom: 4 }}>
      <div className="card-header">
        <span className="card-title">{title}</span>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

// Metric with status component
function MetricWithStatus({
  label,
  value,
  unit,
  status,
  source,
  note,
  formulaAvailable,
  numericReady,
  dateValue,
}: {
  label: string;
  value?: number | string | null | undefined;
  unit?: string;
  status?: string | null;
  source?: string | null;
  note?: string | null;
  formulaAvailable?: boolean | null;
  numericReady?: boolean | null;
  dateValue?: string | null | undefined;
}) {
  let displayValue: React.ReactNode;
  let showStatusAndSource = true;

  if (dateValue) {
    displayValue = (
      <span style={{ fontWeight: 600 }}>{fmtDate(dateValue)}</span>
    );
  } else if (value !== null && value !== undefined) {
    if (unit === "Rp" && typeof value === "number") {
      displayValue = (
        <span style={{ fontWeight: 600 }}>
          Rp. {value.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
        </span>
      );
    } else {
      displayValue = (
        <span style={{ fontWeight: 600 }}>
          {typeof value === "number"
            ? value.toLocaleString("id-ID", { maximumFractionDigits: 4 })
            : value}
          {unit ? ` ${unit}` : ""}
        </span>
      );
    }
  } else if (formulaAvailable === true && numericReady !== true) {
    displayValue = (
      <span style={{ color: "var(--text-muted)" }}>
        Rumus tersedia, data belum lengkap
      </span>
    );
  } else {
    displayValue = (
      <span style={{ color: "var(--text-muted)" }}>Belum tersedia</span>
    );
    showStatusAndSource = false; // Don't show status/source for "Belum tersedia"
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
          {label}
        </span>
        {showStatusAndSource && (
          <div style={{ display: "flex", gap: 4 }}>
            {status && <StatusBadge status={status} />}
            {source && (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  padding: "2px 6px",
                  background: "var(--surface-muted)",
                  borderRadius: 4,
                }}
              >
                {source}
              </span>
            )}
          </div>
        )}
      </div>
      <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
        {displayValue}
      </div>
      {note && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          {note}
        </div>
      )}
    </div>
  );
}

export default function SimulasiPage({
  dssInput,
  setDssInput,
  dssOutput,
  setDssOutput,
}: SimulasiPageProps) {
  const [options, setOptions] = useState<{
    rice_varieties: RiceVarietyOption[];
    planting_systems: PlantingSystemOption[];
  } | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load options on mount
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

  // Handle form input changes
  const handleInputChange = (
    field: keyof DssSimulationRequest,
    value: string | number | null,
  ) => {
    setDssInput({
      ...dssInput,
      [field]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate that required numeric fields are present and valid
      if (
        dssInput.land_area_are == null ||
        dssInput.duck_count == null ||
        dssInput.duck_age_days == null
      ) {
        setError("Silakan isi semua parameter numerik dengan benar.");
        return;
      }

      // Send only valid DssSimulationRequest to backend
      const payload: DssSimulationRequest = {
        ...dssInput,
        land_area_are: dssInput.land_area_are,
        duck_count: dssInput.duck_count,
        duck_age_days: dssInput.duck_age_days,
      };

      const result = await simulateDss(payload);
      setDssOutput(result);
    } catch (err: any) {
      setError(
        err?.error?.message || "Terjadi kesalahan saat menjalankan simulasi.",
      );
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
        {/* Left: Form Input */}
        <div className="card" style={{ minHeight: 600 }}>
          <div className="card-header">
            <span className="card-title">Parameter Simulasi</span>
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
                <div className="obs-input-label">Luas Lahan (are)</div>
                <input
                  className="obs-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={dssInput.land_area_are ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "land_area_are",
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
                  }}
                >
                  Luas lahan yang diisi adalah area aktif yang akan dimasuki
                  bebek.
                </div>
              </div>
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Jumlah Bebek (ekor)</div>
                <input
                  className="obs-input"
                  type="number"
                  step="1"
                  min="0"
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
                <div className="obs-input-label">Varietas Padi</div>
                <select
                  className="obs-input"
                  value={dssInput.rice_variety}
                  onChange={(e) =>
                    handleInputChange("rice_variety", e.target.value)
                  }
                  disabled={loadingOptions}
                  required
                >
                  <option value="">Pilih varietas...</option>
                  {options?.rice_varieties.map((variety) => (
                    <option key={variety.code} value={variety.code}>
                      {variety.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Sistem Tanam</div>
                <select
                  className="obs-input"
                  value={dssInput.planting_system}
                  onChange={(e) =>
                    handleInputChange("planting_system", e.target.value)
                  }
                  disabled={loadingOptions}
                  required
                >
                  <option value="">Pilih sistem tanam...</option>
                  {options?.planting_systems.map((system) => (
                    <option key={system.code} value={system.code}>
                      {system.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Tanggal Tanam</div>
                <input
                  className="obs-input"
                  type="date"
                  value={dssInput.planting_date}
                  onChange={(e) =>
                    handleInputChange("planting_date", e.target.value)
                  }
                  required
                />
              </div>
              <div className="obs-input-group" style={{ marginBottom: 20 }}>
                <div className="obs-input-label">
                  Umur Bebek Saat Dilepaskan (hari)
                </div>
                <input
                  className="obs-input"
                  type="number"
                  step="1"
                  min="0"
                  value={dssInput.duck_age_days ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "duck_age_days",
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-log"
                disabled={submitting || loadingOptions}
                style={{ width: "100%" }}
              >
                {submitting
                  ? "Menjalankan Simulasi..."
                  : "Jalankan Simulasi DSS"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Placeholder or Results */}
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
                Hasil Prediksi
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                Isi parameter dan klik Jalankan Simulasi DSS untuk melihat
                hasil.
              </div>
            </div>
          ) : (
            <>
              <ScenarioCard
                title="Kondisi Aktual"
                scenario={dssOutput.actual_scenario}
              />
              {!dssOutput.optimality_assessment.is_optimal &&
                dssOutput.recommended_scenario && (
                  <ScenarioCard
                    title="Rekomendasi"
                    scenario={dssOutput.recommended_scenario}
                  />
                )}
            </>
          )}
        </div>
      </div>

      {/* Below: Summary and Details */}
      {dssOutput && (
        <>
          <div style={{ marginTop: 16 }}>
            <SummaryCard
              optimality={dssOutput.optimality_assessment}
              actual={dssOutput.actual_scenario}
              dataReadiness={dssOutput.data_readiness}
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            {/* Yield & Agronomy */}
            <DetailSection title="Yield & Agronomi">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Aktual
                  </div>
                  <MetricWithStatus
                    label="Durasi (hari)"
                    value={dssOutput.actual_scenario.duration_days}
                  />
                  <MetricWithStatus
                    label="Tanggal Lepas"
                    dateValue={dssOutput.actual_scenario.release_date}
                  />
                  <MetricWithStatus
                    label="Tanggal Tarik"
                    dateValue={dssOutput.actual_scenario.pull_date}
                  />
                  <MetricWithStatus
                    label="Yield / Are"
                    value={dssOutput.actual_scenario.predicted_yield.kg_per_are}
                    unit="kg"
                  />
                  <MetricWithStatus
                    label="Total Yield"
                    value={
                      dssOutput.actual_scenario.predicted_yield
                        .estimated_total_kg
                    }
                    unit="kg"
                  />
                  <MetricWithStatus
                    label="Yield / Ha"
                    value={dssOutput.actual_scenario.predicted_yield.kg_per_ha}
                    unit="kg"
                  />
                  <MetricWithStatus
                    label="Yield / Ha (Ton)"
                    value={dssOutput.actual_scenario.predicted_yield.ton_per_ha}
                    unit="ton"
                  />
                  {dssOutput.actual_scenario.penalty_rate < 0.5 ? (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginBottom: 2,
                        }}
                      >
                        Penalti Rate
                      </div>
                      <span className="risk-badge SAFE">Aman</span>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginBottom: 2,
                        }}
                      >
                        Penalti Rate
                      </div>
                      <span className="risk-badge HIGH">Bahaya</span>
                    </div>
                  )}
                </div>
                {!dssOutput.optimality_assessment.is_optimal &&
                dssOutput.recommended_scenario ? (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Rekomendasi
                    </div>
                    <MetricWithStatus
                      label="Durasi (hari)"
                      value={
                        dssOutput.recommended_scenario.recommended_duration_days
                      }
                    />
                    <MetricWithStatus
                      label="Tanggal Lepas"
                      dateValue={
                        dssOutput.recommended_scenario.recommended_release_date
                      }
                    />
                    <MetricWithStatus
                      label="Tanggal Tarik"
                      dateValue={
                        dssOutput.recommended_scenario.recommended_pull_date
                      }
                    />
                    <MetricWithStatus
                      label="Yield / Are"
                      value={
                        dssOutput.recommended_scenario.predicted_yield
                          .kg_per_are
                      }
                      unit="kg"
                    />
                    <MetricWithStatus
                      label="Total Yield"
                      value={
                        dssOutput.recommended_scenario.predicted_yield
                          .estimated_total_kg
                      }
                      unit="kg"
                    />
                    <MetricWithStatus
                      label="Yield / Ha"
                      value={
                        dssOutput.recommended_scenario.predicted_yield.kg_per_ha
                      }
                      unit="kg"
                    />
                    <MetricWithStatus
                      label="Yield / Ha (Ton)"
                      value={
                        dssOutput.recommended_scenario.predicted_yield
                          .ton_per_ha
                      }
                      unit="ton"
                    />
                    {dssOutput.recommended_scenario.penalty_rate === 0 ? (
                      <div style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            marginBottom: 2,
                          }}
                        >
                          Penalti Rate
                        </div>
                        <span className="risk-badge SAFE">Aman</span>
                      </div>
                    ) : (
                      <MetricWithStatus
                        label="Penalti Rate"
                        value={dssOutput.recommended_scenario.penalty_rate}
                      />
                    )}
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Rekomendasi
                    </div>
                    <div
                      style={{ fontSize: 14, color: "var(--text-secondary)" }}
                    >
                      Tidak ada rekomendasi tambahan karena skenario aktual
                      sudah berada pada titik optimal model.
                    </div>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Kepadatan & Risiko */}
            <DetailSection title="Kepadatan & Risiko">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Aktual
                  </div>
                  <MetricWithStatus
                    label="Kepadatan"
                    value={dssOutput.actual_scenario.density_are}
                    unit="ekor/are"
                  />
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: 2,
                      }}
                    >
                      Status Risiko
                    </div>
                    <RiskBadge
                      riskStatus={dssOutput.actual_scenario.risk_status}
                    />
                  </div>
                  <MetricWithStatus
                    label="Risiko Aktual"
                    value={dssOutput.risk.actual_status}
                  />
                  <MetricWithStatus
                    label="Risiko Kepadatan"
                    value={dssOutput.risk.density_risk}
                  />
                  <MetricWithStatus
                    label="Risiko Fase"
                    value={dssOutput.risk.phase_risk}
                  />
                  <MetricWithStatus
                    label="Peringatan Pakan"
                    value={dssOutput.risk.feed_warning}
                  />
                  <MetricWithStatus
                    label="Ambang Batas Aman Maks (ekor/are)"
                    value={dssOutput.risk.thresholds.safe_max_are}
                  />
                </div>
                {!dssOutput.optimality_assessment.is_optimal &&
                dssOutput.recommended_scenario ? (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Rekomendasi
                    </div>
                    <MetricWithStatus
                      label="Kepadatan"
                      value={
                        dssOutput.recommended_scenario.recommended_density_are
                      }
                      unit="ekor/are"
                    />
                    <div style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginBottom: 2,
                        }}
                      >
                        Status Risiko
                      </div>
                      <RiskBadge
                        riskStatus={dssOutput.recommended_scenario.risk_status}
                      />
                    </div>
                    <MetricWithStatus
                      label="Risiko Rekomendasi"
                      value={dssOutput.risk.recommended_status}
                    />
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Rekomendasi
                    </div>
                    <div
                      style={{ fontSize: 14, color: "var(--text-secondary)" }}
                    >
                      Tidak ada rekomendasi tambahan karena skenario aktual
                      sudah berada pada titik optimal model.
                    </div>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Ekonomi */}
            <DetailSection title="Ekonomi">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Aktual
                  </div>
                  <MetricWithStatus
                    label="Pendapatan Bebek"
                    value={dssOutput.economics.actual.duck_revenue_rp}
                    unit="Rp"
                    status={dssOutput.economics.actual.status}
                  />
                  <MetricWithStatus
                    label="Biaya Pembelian Bebek"
                    value={dssOutput.economics.actual.duck_purchase_cost_rp}
                    unit="Rp"
                  />
                  <MetricWithStatus
                    label="Biaya Pakan"
                    value={dssOutput.economics.actual.feed_cost_rp}
                    unit="Rp"
                    status={dssOutput.economics.actual.feed_cost_status}
                    source={dssOutput.economics.actual.q_feed_source}
                    note={
                      dssOutput.economics.actual.q_feed_assumption_note
                        ? "Menggunakan referensi literatur (0.10 kg/ekor/hari)."
                        : null
                    }
                  />
                  <MetricWithStatus
                    label="Total Biaya Infrastruktur"
                    value={
                      dssOutput.economics.actual.infrastructure
                        .total_infrastructure_cost_rp
                    }
                    unit="Rp"
                  />
                  <MetricWithStatus
                    label="Pendapatan Padi"
                    value={dssOutput.economics.actual.rice_revenue_rp}
                    unit="Rp"
                  />
                  <MetricWithStatus
                    label="Laba Bersih"
                    value={dssOutput.economics.actual.net_profit_rp}
                    unit="Rp"
                  />
                  <MetricWithStatus
                    label="Laba Bersih / Are"
                    value={dssOutput.economics.actual.net_profit_rp_per_are}
                    unit="Rp"
                  />
                  {dssOutput.economics.actual.missing_parameters.length > 0 && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Parameter yang hilang:{" "}
                      {dssOutput.economics.actual.missing_parameters.join(", ")}
                    </div>
                  )}
                </div>
                {!dssOutput.optimality_assessment.is_optimal &&
                dssOutput.economics.recommended ? (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Rekomendasi
                    </div>
                    <MetricWithStatus
                      label="Pendapatan Bebek"
                      value={dssOutput.economics.recommended.duck_revenue_rp}
                      unit="Rp"
                      status={dssOutput.economics.recommended.status}
                    />
                    <MetricWithStatus
                      label="Biaya Pembelian Bebek"
                      value={
                        dssOutput.economics.recommended.duck_purchase_cost_rp
                      }
                      unit="Rp"
                    />
                    <MetricWithStatus
                      label="Biaya Pakan"
                      value={dssOutput.economics.recommended.feed_cost_rp}
                      unit="Rp"
                      status={dssOutput.economics.recommended.feed_cost_status}
                      source={dssOutput.economics.recommended.q_feed_source}
                      note={
                        dssOutput.economics.recommended.q_feed_assumption_note
                          ? "Menggunakan referensi literatur (0.10 kg/ekor/hari)."
                          : null
                      }
                    />
                    <MetricWithStatus
                      label="Total Biaya Infrastruktur"
                      value={
                        dssOutput.economics.recommended.infrastructure
                          .total_infrastructure_cost_rp
                      }
                      unit="Rp"
                    />
                    <MetricWithStatus
                      label="Pendapatan Padi"
                      value={dssOutput.economics.recommended.rice_revenue_rp}
                      unit="Rp"
                    />
                    <MetricWithStatus
                      label="Laba Bersih"
                      value={dssOutput.economics.recommended.net_profit_rp}
                      unit="Rp"
                    />
                    <MetricWithStatus
                      label="Laba Bersih / Are"
                      value={
                        dssOutput.economics.recommended.net_profit_rp_per_are
                      }
                      unit="Rp"
                    />
                    {dssOutput.economics.recommended.missing_parameters.length >
                      0 && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        Parameter yang hilang:{" "}
                        {dssOutput.economics.recommended.missing_parameters.join(
                          ", ",
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Rekomendasi
                    </div>
                    <div
                      style={{ fontSize: 14, color: "var(--text-secondary)" }}
                    >
                      Tidak ada rekomendasi tambahan karena skenario aktual
                      sudah berada pada titik optimal model.
                    </div>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Ekologi & Hara Tanah */}
            <DetailSection title="Ekologi & Hara Tanah">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Aktual
                  </div>
                  <MetricWithStatus
                    label="Penghematan Pupuk"
                    value={dssOutput.ecology.actual.fertilizer_saving_rp}
                    unit="Rp"
                    status={dssOutput.ecology.actual.fertilizer_saving_status}
                  />
                  <MetricWithStatus
                    label="Penghematan Pestisida/Herbisida"
                    value={
                      dssOutput.ecology.actual.pesticide_herbicide_saving_rp
                    }
                    unit="Rp"
                    status={
                      dssOutput.ecology.actual.pesticide_herbicide_saving_status
                    }
                  />
                  <MetricWithStatus
                    label="Rate Pengurangan Gulma"
                    value={dssOutput.ecology.actual.weed_reduction_rate}
                  />
                  <MetricWithStatus
                    label="Penghematan Gulma"
                    value={dssOutput.ecology.actual.weeding_saving_rp}
                    unit="Rp"
                    status={dssOutput.ecology.actual.weeding_saving_status}
                  />
                  <MetricWithStatus
                    label="Nilai Ekologis Parsial"
                    value={dssOutput.ecology.actual.partial_ecological_value_rp}
                    unit="Rp"
                  />
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid var(--surface-border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Hara Tanah
                    </div>
                    <MetricWithStatus
                      label="N / Are"
                      value={
                        dssOutput.ecology.actual.soil_nutrients.n_kg_per_are
                      }
                      unit="kg"
                    />
                    <MetricWithStatus
                      label="P₂O₅ / Are"
                      value={
                        dssOutput.ecology.actual.soil_nutrients.p2o5_kg_per_are
                      }
                      unit="kg"
                    />
                    <MetricWithStatus
                      label="K₂O / Are"
                      value={
                        dssOutput.ecology.actual.soil_nutrients.k2o_kg_per_are
                      }
                      unit="kg"
                    />
                  </div>
                  {dssOutput.ecology.actual.included_components.length > 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 12,
                      }}
                    >
                      Komponen yang termasuk:{" "}
                      {dssOutput.ecology.actual.included_components.join(", ")}
                    </div>
                  )}
                </div>
                {!dssOutput.optimality_assessment.is_optimal &&
                dssOutput.ecology.recommended ? (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Rekomendasi
                    </div>
                    <MetricWithStatus
                      label="Penghematan Pupuk"
                      value={dssOutput.ecology.recommended.fertilizer_saving_rp}
                      unit="Rp"
                      status={
                        dssOutput.ecology.recommended.fertilizer_saving_status
                      }
                    />
                    <MetricWithStatus
                      label="Penghematan Pestisida/Herbisida"
                      value={
                        dssOutput.ecology.recommended
                          .pesticide_herbicide_saving_rp
                      }
                      unit="Rp"
                      status={
                        dssOutput.ecology.recommended
                          .pesticide_herbicide_saving_status
                      }
                    />
                    <MetricWithStatus
                      label="Rate Pengurangan Gulma"
                      value={dssOutput.ecology.recommended.weed_reduction_rate}
                    />
                    <MetricWithStatus
                      label="Penghematan Gulma"
                      value={dssOutput.ecology.recommended.weeding_saving_rp}
                      unit="Rp"
                      status={
                        dssOutput.ecology.recommended.weeding_saving_status
                      }
                    />
                    <MetricWithStatus
                      label="Nilai Ekologis Parsial"
                      value={
                        dssOutput.ecology.recommended
                          .partial_ecological_value_rp
                      }
                      unit="Rp"
                    />
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: "1px solid var(--surface-border)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        Hara Tanah
                      </div>
                      <MetricWithStatus
                        label="N / Are"
                        value={
                          dssOutput.ecology.recommended.soil_nutrients
                            .n_kg_per_are
                        }
                        unit="kg"
                      />
                      <MetricWithStatus
                        label="P₂O₅ / Are"
                        value={
                          dssOutput.ecology.recommended.soil_nutrients
                            .p2o5_kg_per_are
                        }
                        unit="kg"
                      />
                      <MetricWithStatus
                        label="K₂O / Are"
                        value={
                          dssOutput.ecology.recommended.soil_nutrients
                            .k2o_kg_per_are
                        }
                        unit="kg"
                      />
                    </div>
                    {dssOutput.ecology.recommended.included_components.length >
                      0 && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: 12,
                        }}
                      >
                        Komponen yang termasuk:{" "}
                        {dssOutput.ecology.recommended.included_components.join(
                          ", ",
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Rekomendasi
                    </div>
                    <div
                      style={{ fontSize: 14, color: "var(--text-secondary)" }}
                    >
                      Tidak ada rekomendasi tambahan karena skenario aktual
                      sudah berada pada titik optimal model.
                    </div>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Emisi & Lingkungan */}
            <DetailSection title="Emisi & Lingkungan">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Aktual
                  </div>
                  <MetricWithStatus
                    label="CO₂e / Are"
                    value={dssOutput.environment.actual.co2e_are}
                    unit="kg"
                    formulaAvailable={
                      dssOutput.environment.actual.formula_available
                    }
                    numericReady={dssOutput.environment.actual.numeric_ready}
                  />
                  <MetricWithStatus
                    label="F CH₄ / Are"
                    value={dssOutput.environment.actual.f_ch4_are}
                    formulaAvailable={
                      dssOutput.environment.actual.formula_available
                    }
                    numericReady={dssOutput.environment.actual.numeric_ready}
                  />
                  <MetricWithStatus
                    label="F N₂O / Are"
                    value={dssOutput.environment.actual.f_n2o_are}
                    formulaAvailable={
                      dssOutput.environment.actual.formula_available
                    }
                    numericReady={dssOutput.environment.actual.numeric_ready}
                  />
                  <MetricWithStatus
                    label="GHGI"
                    value={dssOutput.environment.actual.ghgi}
                    formulaAvailable={
                      dssOutput.environment.actual.formula_available
                    }
                    numericReady={dssOutput.environment.actual.numeric_ready}
                  />
                  <MetricWithStatus
                    label="Reduksi CH₄"
                    value={dssOutput.environment.actual.ch4_reduction_pct}
                    unit="%"
                    formulaAvailable={
                      dssOutput.environment.actual.formula_available
                    }
                    numericReady={dssOutput.environment.actual.numeric_ready}
                  />
                  {dssOutput.environment.actual.calibration_note && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 12,
                      }}
                    >
                      {dssOutput.environment.actual.calibration_note}
                    </div>
                  )}
                </div>
                {!dssOutput.optimality_assessment.is_optimal &&
                dssOutput.environment.recommended ? (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Rekomendasi
                    </div>
                    <MetricWithStatus
                      label="CO₂e / Are"
                      value={dssOutput.environment.recommended.co2e_are}
                      unit="kg"
                      formulaAvailable={
                        dssOutput.environment.recommended.formula_available
                      }
                      numericReady={
                        dssOutput.environment.recommended.numeric_ready
                      }
                    />
                    <MetricWithStatus
                      label="F CH₄ / Are"
                      value={dssOutput.environment.recommended.f_ch4_are}
                      formulaAvailable={
                        dssOutput.environment.recommended.formula_available
                      }
                      numericReady={
                        dssOutput.environment.recommended.numeric_ready
                      }
                    />
                    <MetricWithStatus
                      label="F N₂O / Are"
                      value={dssOutput.environment.recommended.f_n2o_are}
                      formulaAvailable={
                        dssOutput.environment.recommended.formula_available
                      }
                      numericReady={
                        dssOutput.environment.recommended.numeric_ready
                      }
                    />
                    <MetricWithStatus
                      label="GHGI"
                      value={dssOutput.environment.recommended.ghgi}
                      formulaAvailable={
                        dssOutput.environment.recommended.formula_available
                      }
                      numericReady={
                        dssOutput.environment.recommended.numeric_ready
                      }
                    />
                    <MetricWithStatus
                      label="Reduksi CH₄"
                      value={
                        dssOutput.environment.recommended.ch4_reduction_pct
                      }
                      unit="%"
                      formulaAvailable={
                        dssOutput.environment.recommended.formula_available
                      }
                      numericReady={
                        dssOutput.environment.recommended.numeric_ready
                      }
                    />
                    {dssOutput.environment.recommended.calibration_note && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: 12,
                        }}
                      >
                        {dssOutput.environment.recommended.calibration_note}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Rekomendasi
                    </div>
                    <div
                      style={{ fontSize: 14, color: "var(--text-secondary)" }}
                    >
                      Tidak ada rekomendasi tambahan karena skenario aktual
                      sudah berada pada titik optimal model.
                    </div>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Data Readiness & Notes */}
            <DetailSection title="Kesiapan Data, Validasi, & Catatan">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Kesiapan Data
                  </div>
                  <MetricWithStatus
                    label="Agronomi"
                    value={
                      DATA_READINESS_LABEL[
                        dssOutput.data_readiness.agronomy_ready
                      ] || dssOutput.data_readiness.agronomy_ready
                    }
                  />
                  <MetricWithStatus
                    label="Yield"
                    value={
                      DATA_READINESS_LABEL[
                        dssOutput.data_readiness.yield_ready
                      ] || dssOutput.data_readiness.yield_ready
                    }
                  />
                  <MetricWithStatus
                    label="Ekonomi"
                    value={
                      DATA_READINESS_LABEL[
                        dssOutput.data_readiness.economics_ready
                      ] || dssOutput.data_readiness.economics_ready
                    }
                  />
                  <MetricWithStatus
                    label="Ekologi"
                    value={
                      DATA_READINESS_LABEL[
                        dssOutput.data_readiness.ecology_ready
                      ] || dssOutput.data_readiness.ecology_ready
                    }
                  />
                  <MetricWithStatus
                    label="Lingkungan"
                    value={
                      DATA_READINESS_LABEL[
                        dssOutput.data_readiness.environment_ready
                      ] || dssOutput.data_readiness.environment_ready
                    }
                  />
                  <MetricWithStatus
                    label="Keseluruhan"
                    value={
                      DATA_READINESS_LABEL[
                        dssOutput.data_readiness.overall_status
                      ] || dssOutput.data_readiness.overall_status
                    }
                  />
                </div>
                <div>
                  {/* Validasi Collapsible */}
                  <details style={{ marginBottom: 12 }}>
                    <summary
                      style={{
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Validasi
                    </summary>
                    <div style={{ paddingTop: 8 }}>
                      {!dssOutput.validation.input_valid && (
                        <div
                          style={{
                            marginBottom: 12,
                            padding: 12,
                            background: "rgba(220,38,38,0.05)",
                            border: "1px solid rgba(220,38,38,0.2)",
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#dc2626",
                              marginBottom: 8,
                            }}
                          >
                            Input Tidak Valid
                          </div>
                          {dssOutput.validation.constraint_violations.length >
                            0 && (
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                              {dssOutput.validation.constraint_violations.map(
                                (violation, i) => (
                                  <li
                                    key={i}
                                    style={{
                                      fontSize: 13,
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    {violation}
                                  </li>
                                ),
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                      {dssOutput.validation.warnings.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              marginBottom: 4,
                            }}
                          >
                            Peringatan
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {dssOutput.validation.warnings.map((warning, i) => (
                              <li
                                key={i}
                                style={{
                                  fontSize: 13,
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </details>

                  {/* Catatan Collapsible */}
                  {dssOutput.notes.length > 0 && (
                    <details>
                      <summary
                        style={{
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        Catatan
                      </summary>
                      <div style={{ paddingTop: 8 }}>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {dssOutput.notes.map((note, i) => (
                            <li
                              key={i}
                              style={{
                                fontSize: 13,
                                color: "var(--text-secondary)",
                              }}
                            >
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </DetailSection>

            {/* Trace (Academic) */}
            <DetailSection title="Trace Akademik">
              <details style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Lihat Trace Detail
                </summary>
                <pre
                  style={{
                    marginTop: 16,
                    padding: 12,
                    background: "var(--surface-muted)",
                    borderRadius: "var(--radius-sm)",
                    overflow: "auto",
                    fontSize: 11,
                  }}
                >
                  {JSON.stringify(dssOutput.trace, null, 2)}
                </pre>
              </details>
            </DetailSection>
          </div>
        </>
      )}
    </div>
  );
}
