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
  return `${value.toLocaleString("id-ID", {
    minimumFractionDigits: opts.precision ?? 0,
    maximumFractionDigits: opts.precision ?? 2,
  })}${opts.suffix ?? ""}`;
}

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

function fmtRp(val: number | null | undefined): string {
  if (val == null) return "—";
  return `Rp ${val.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
}

const STATUS_LABEL: Record<string, string> = {
  SAFE: "Aman",
  WARNING_DENSITY: "Kepadatan terlalu tinggi",
  WARNING_UNDER_DENSITY: "Kepadatan terlalu rendah",
  AGE_BUY_RANGE: "Umur bebek sesuai rentang model",
  AGE_BUY_RANGE_WARNING: "Umur bebek di luar rentang model",
  ready: "Siap",
  estimation: "Estimasi",
  "local-calibrated": "Data lokal terkalibrasi",
  "local-estimate": "Estimasi lokal",
};

function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null;
  const label = STATUS_LABEL[status] ?? status;
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
        <span className="card-title">{title}</span>
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

  if (dateValue) {
    displayValue = <span style={{ fontWeight: 600 }}>{fmtDate(dateValue)}</span>;
  } else if (value !== null && value !== undefined) {
    if (unit === "Rp" && typeof value === "number") {
      displayValue = <span style={{ fontWeight: 600 }}>{fmtRp(value)}</span>;
    } else {
      displayValue = (
        <span style={{ fontWeight: 600 }}>
          {typeof value === "number" ? fmtNum(value) : value}
          {unit ? ` ${unit}` : ""}
        </span>
      );
    }
  } else {
    displayValue = <span style={{ color: "var(--text-muted)" }}>Belum tersedia</span>;
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
        {status && <StatusBadge status={status} />}
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
          Ringkasan Hasil Simulasi
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          <MetricWithStatus label="Total Pendapatan" value={output.Total_Revenue} unit="Rp" />
          <MetricWithStatus label="Total Biaya Tunai" value={output.Cost_total_cash} unit="Rp" />
          <MetricWithStatus label="Laba Tunai Bersih" value={output.Profit_net_cash} unit="Rp" />
          <MetricWithStatus label="Faktor Sistem (F_sys)" value={output.F_sys} />
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
        setError("Silakan isi semua parameter numerik dengan benar.");
        return;
      }

      if (dssInput.land_area_are <= 0) {
        setError("Luas lahan aktif bebek harus lebih dari 0 are.");
        return;
      }

      if (dssInput.duck_count <= 0) {
        setError("Populasi bibit bebek harus lebih dari 0 ekor.");
        return;
      }

      if (dssInput.duck_age_days <= 0) {
        setError("Umur bebek saat masuk sawah harus lebih dari 0 hari.");
        return;
      }

      if (needsActualDuckBuyPrice && dssInput.duck_buy_price_rp_per_duck == null) {
        setError("Harga beli bebek aktual wajib diisi saat umur bebek di luar rentang 14–21 hari.");
        return;
      }

      if (
        dssInput.duck_buy_price_rp_per_duck != null &&
        dssInput.duck_buy_price_rp_per_duck <= 0
      ) {
        setError("Harga beli bebek aktual harus lebih dari 0 rupiah per ekor.");
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
      setError(message || "Terjadi kesalahan saat menjalankan simulasi.");
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
                <div className="obs-input-label">Luas Lahan Aktif Bebek (are)</div>
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
                  Luas petak sawah aktif yang akan dimasuki bebek, bukan total lahan petani.
                </div>
              </div>
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Populasi Bibit Bebek (ekor)</div>
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
                <div className="obs-input-label">Varietas Padi</div>
                <select
                  className="obs-input"
                  value={dssInput.rice_variety}
                  onChange={(e) => handleInputChange("rice_variety", e.target.value)}
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
                  onChange={(e) => handleInputChange("planting_system", e.target.value)}
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
                {selectedSystem && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    Batas kepadatan aman: {selectedSystem.k_safe_are} ekor/are.
                  </div>
                )}
              </div>
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Tanggal Tanam</div>
                <input
                  className="obs-input"
                  type="date"
                  value={dssInput.planting_date}
                  onChange={(e) => handleInputChange("planting_date", e.target.value)}
                  required
                />
              </div>
              <div className="obs-input-group" style={{ marginBottom: 16 }}>
                <div className="obs-input-label">Umur Bebek Saat Masuk Sawah (hari)</div>
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
                  Rentang acuan model 14–21 hari. Umur bebek bisa memengaruhi risiko umur, prediksi hidup, hasil panen, pakan, dan biaya.
                </div>
              </div>
              {needsActualDuckBuyPrice && (
                <div className="obs-input-group" style={{ marginBottom: 20 }}>
                  <div className="obs-input-label">Harga Beli Bebek Aktual (Rp/ekor)</div>
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
                    Diisi saat umur bebek di luar 14–21 hari agar biaya pembelian bebek memakai harga aktual petani.
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="btn-log"
                disabled={submitting || loadingOptions}
                style={{ width: "100%" }}
              >
                {submitting ? "Menjalankan Simulasi..." : "Jalankan Simulasi DSS"}
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
                Hasil Prediksi
              </div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                Isi parameter dan klik Jalankan Simulasi DSS untuk melihat hasil.
              </div>
            </div>
          ) : (
            <div className="card" style={{ minHeight: 600 }}>
              <div className="card-header">
                <span className="card-title">Ringkasan Operasional</span>
              </div>
              <div className="card-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 16,
                  }}
                >
                  <MetricWithStatus label="Kepadatan Input" value={densityInput} unit="ekor/are" />
                  <MetricWithStatus label="Status Kepadatan" value={STATUS_LABEL[dssOutput.density_status] ?? dssOutput.density_status} />
                  <MetricWithStatus label="Status Umur Bebek" value={STATUS_LABEL[dssOutput.age_status] ?? dssOutput.age_status} />
                  <MetricWithStatus label="Prediksi Bebek Hidup" value={dssOutput.N_survive} unit="ekor" />
                  <MetricWithStatus label="Tanggal Lepas Bebek" dateValue={dssOutput.D_masuk_bebek} />
                  <MetricWithStatus label="Tanggal Tarik Bebek" dateValue={dssOutput.D_tarik_bebek} />
                  <MetricWithStatus label="Tanggal Panen Gabah" dateValue={dssOutput.D_panen_gabah} />
                  <MetricWithStatus label="Total Panen Gabah" value={dssOutput.Yield_total_predict} unit="kg" />
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
            <DetailSection title="Operasional & Agronomi">
              <MetricWithStatus label="Varietas Padi" value={selectedVariety?.label ?? dssInput.rice_variety} />
              <MetricWithStatus label="Sistem Tanam" value={selectedSystem?.label ?? dssInput.planting_system} />
              <MetricWithStatus label="Kepadatan Input" value={densityInput} unit="ekor/are" />
              <MetricWithStatus label="Status Kepadatan" value={STATUS_LABEL[dssOutput.density_status] ?? dssOutput.density_status} />
              <MetricWithStatus label="Status Umur Bebek" value={STATUS_LABEL[dssOutput.age_status] ?? dssOutput.age_status} />
              <MetricWithStatus label="Tanggal Lepas Bebek" dateValue={dssOutput.D_masuk_bebek} />
              <MetricWithStatus label="Tanggal Tarik Bebek" dateValue={dssOutput.D_tarik_bebek} />
              <MetricWithStatus label="Tanggal Panen Gabah" dateValue={dssOutput.D_panen_gabah} />
              <MetricWithStatus label="Prediksi Bebek Hidup" value={dssOutput.N_survive} unit="ekor" />
            </DetailSection>

            <DetailSection title="Prediksi Panen & Pendapatan">
              <MetricWithStatus label="Estimasi Panen per Are" value={dssOutput.Yield_are_predict} unit="kg/are" />
              <MetricWithStatus label="Estimasi Total Panen Gabah" value={dssOutput.Yield_total_predict} unit="kg" />
              <MetricWithStatus label="Estimasi Penjualan Gabah" value={dssOutput.Revenue_gabah} unit="Rp" />
              <MetricWithStatus label="Estimasi Penjualan Bebek" value={dssOutput.Revenue_duck} unit="Rp" />
              <MetricWithStatus label="Total Pendapatan" value={dssOutput.Total_Revenue} unit="Rp" />
            </DetailSection>

            <DetailSection title="Biaya Inti Kas (Core Cash Cost)">
              <MetricWithStatus label="Biaya Pembelian Bebek" value={dssOutput.Cost_duck_buy} unit="Rp" />
              <MetricWithStatus label="Total Biaya Tunai" value={dssOutput.Cost_total_cash} unit="Rp" note="Biaya tunai murni hanya pembelian bibit bebek." />
            </DetailSection>

            <DetailSection title="Analisis Biaya Non-Tunai / Sandbox (Indikatif)" style={{ 
              border: "2px dashed var(--accent-amber)", 
              background: "linear-gradient(135deg, rgba(245,158,11,0.03), rgba(245,158,11,0.01))" 
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8, 
                marginBottom: 12, 
                padding: "8px 12px",
                background: "rgba(245,158,11,0.1)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(245,158,11,0.3)"
              }}>
                <span style={{ fontSize: 14 }}>⚠</span>
                <span style={{ 
                  fontSize: 11.5, 
                  fontWeight: 700, 
                  color: "var(--accent-amber)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  BIAYA INDIKATIF (SANDBOX) — Tidak mengurangi Laba Tunai Bersih
                </span>
              </div>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(4, 1fr)", 
                gap: 12 
              }}>
                <MetricWithStatus label="Pakan Bebek" value={dssOutput.Cost_feed_isolated} unit="Rp" />
                <MetricWithStatus label="Penyiangan" value={dssOutput.Cost_weeding_isolated} unit="Rp" />
                <MetricWithStatus label="Pestisida" value={dssOutput.Cost_pesticide_isolated} unit="Rp" />
                <MetricWithStatus label="Infrastruktur Total" value={dssOutput.Cost_infra_isolated} unit="Rp" />
                <MetricWithStatus label="Pupuk Total" value={dssOutput.Cost_fertilizer_isolated} unit="Rp" />
                <MetricWithStatus label="&nbsp;&nbsp;├─ Urea" value={dssOutput.Cost_fert_urea_isolated} unit="Rp" />
                <MetricWithStatus label="&nbsp;&nbsp;├─ Phonska" value={dssOutput.Cost_fert_phonska_isolated} unit="Rp" />
                <MetricWithStatus label="&nbsp;&nbsp;└─ KCl" value={dssOutput.Cost_fert_kcl_isolated} unit="Rp" />
                <MetricWithStatus label="Infra Jaring" value={dssOutput.Cost_infra_net_isolated} unit="Rp" />
                <MetricWithStatus label="Infra Kandang" value={dssOutput.Cost_infra_cage_isolated} unit="Rp" />
              </div>
            </DetailSection>
          </div>

          {/* SCIENTIFIC VISUALIZATION CHARTS SECTION */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="card-title">📈 Visualisasi Kurva & Grafik Ilmiah (SoT v2)</span>
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
                  Kurva Kepadatan (F_density)
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
                  Kurva Risiko Umur (R_age)
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
                  Breakdown Kas Two-Tier
                </button>
              </div>
            </div>
            <div className="card-body">
              {activeChartTab === "density" && (
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                    Kurva hubungan kepadatan bebek (d) terhadap faktor hasil tanaman. 
                    Menunjukkan zona ideal sistem tanam Jarwo (4 ekor/are) vs Tegel (3 ekor/are) serta ambang saturasi (8 ekor/are).
                  </div>
                  <DensityCurveChart 
                    data={vizData?.visualizations?.density_curve ?? vizData?.density_curve ?? dssOutput.charts?.density_series} 
                    currentDensity={densityInput ?? undefined} 
                    benchmarks={vizData?.reference_benchmarks}
                  />
                </div>
              )}

              {activeChartTab === "age" && (
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                    Kurva risiko kerusakan tanaman / injakan (R_age) dan peluang hidup (Survival Ceiling) berdasarkan umur bebek (age_days).
                    Rentang ideal ontogeni: 14–21 hari.
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
                    Visualisasi <strong>Financial Waterfall</strong> (Pendapatan total, alokasi biaya pembelian bebek, dan laba tunai bersih).
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
