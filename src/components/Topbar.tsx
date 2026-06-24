import type { Page } from "../types";
import type { DssSimulationResponse } from "../types/api";
import "../styles/topbar.css";

interface TopbarProps {
  page: Page;
  dssInput: any;
  dssOutput: DssSimulationResponse | null;
  onMobileMenuToggle?: () => void;
}

const PAGE_META: Record<Page, { title: string; subtitle?: string }> = {
  simulasi: { title: "Simulasi DSS", subtitle: "Agro-Ecological Intelligence" },
  history: { title: "History", subtitle: "Riwayat Simulasi" },
};

function fmtNum(val: number | null | undefined, decimals = 2) {
  if (val === null || val === undefined) return "—";
  return val.toFixed(decimals);
}

function fmtRp(val: number | null | undefined) {
  if (val === null || val === undefined) return "Belum tersedia";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
}

function fmtDate(dateStr: string | null | undefined) {
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

export default function Topbar({
  page,
  dssInput,
  dssOutput,
  onMobileMenuToggle,
}: TopbarProps) {
  const meta = PAGE_META[page];

  const handleExportPDF = () => {
    window.print();
  };

  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const actual = dssOutput?.actual_scenario;
  const eco = dssOutput?.economics?.actual;
  const ecol = dssOutput?.ecology?.actual;
  const env = dssOutput?.environment?.actual;
  const opt = dssOutput?.optimality_assessment;

  return (
    <>
      {/* ── Print-only cover (hidden on screen) ── */}
      <div className="print-report-cover">
        <div className="print-report-logo">
          🌾 Astungkara Way — DSS Padi–Bebek
        </div>
        <div className="print-report-title">
          Laporan Simulasi Sistem Padi–Bebek (Rice-Duck Farming)
        </div>
        <div className="print-report-subtitle">
          Dicetak: {printDate} · Subak Sibang, Badung
        </div>
        <div className="print-report-divider" />

        {dssOutput ? (
          <>
            {/* Input params */}
            <div className="print-report-params">
              <div className="print-param-row">
                <span>Varietas:</span>
                <strong>
                  {dssOutput.lookup?.rice_variety?.label ??
                    dssInput.rice_variety}
                </strong>
                <span>Sistem Tanam:</span>
                <strong>
                  {dssOutput.lookup?.planting_system?.label ??
                    dssInput.planting_system}
                </strong>
                <span>Luas Lahan:</span>
                <strong>{dssInput.land_area_are} are</strong>
              </div>
              <div className="print-param-row">
                <span>Jumlah Bebek:</span>
                <strong>{dssInput.duck_count} ekor</strong>
                <span>Tanggal Tanam:</span>
                <strong>{fmtDate(dssInput.planting_date)}</strong>
                <span>Umur Bebek:</span>
                <strong>{dssInput.duck_age_days} hari</strong>
              </div>
              {actual && (
                <div className="print-param-row">
                  <span>Kepadatan:</span>
                  <strong>{fmtNum(actual.density_are)} ekor/are</strong>
                  <span>Lepas Bebek:</span>
                  <strong>{fmtDate(actual.release_date)}</strong>
                  <span>Tarik Bebek:</span>
                  <strong>{fmtDate(actual.pull_date)}</strong>
                </div>
              )}
            </div>
            <div className="print-report-divider" />

            {/* Results grid */}
            <div className="print-result-grid">
              <div className="print-result-item">
                <div className="print-result-label">Yield (kg/are)</div>
                <div className="print-result-value">
                  {fmtNum(actual?.predicted_yield?.kg_per_are, 2)}
                </div>
              </div>
              <div className="print-result-item">
                <div className="print-result-label">Total Produksi</div>
                <div className="print-result-value">
                  {fmtNum(actual?.predicted_yield?.estimated_total_kg, 0)} kg
                </div>
              </div>
              <div className="print-result-item">
                <div className="print-result-label">Bebek Bertahan</div>
                <div className="print-result-value">
                  {actual?.surviving_ducks ?? "—"} ekor
                </div>
              </div>
              <div className="print-result-item">
                <div className="print-result-label">Status Risiko</div>
                <div className="print-result-value">
                  {actual?.risk_status ?? "—"}
                </div>
              </div>
              <div className="print-result-item">
                <div className="print-result-label">Pendapatan Bebek</div>
                <div className="print-result-value">
                  {fmtRp(eco?.duck_revenue_rp)}
                </div>
              </div>
              <div className="print-result-item">
                <div className="print-result-label">Laba Bersih</div>
                <div className="print-result-value">
                  {eco?.net_profit_rp != null &&
                  eco?.net_profit_rp !== undefined
                    ? fmtRp(eco.net_profit_rp)
                    : "Belum tersedia"}
                </div>
              </div>
              <div className="print-result-item">
                <div className="print-result-label">Biaya Infrastruktur</div>
                <div className="print-result-value">
                  {fmtRp(eco?.infrastructure?.total_infrastructure_cost_rp)}
                </div>
              </div>
              <div className="print-result-item">
                <div className="print-result-label">Nilai Ekologis</div>
                <div className="print-result-value">
                  {fmtRp(
                    ecol?.partial_ecological_value_rp ??
                      ecol?.total_ecological_value_rp,
                  )}
                </div>
              </div>
              <div className="print-result-item">
                <div className="print-result-label">Penghematan Gulma</div>
                <div className="print-result-value">
                  {fmtRp(ecol?.weeding_saving_rp)}
                </div>
              </div>
              <div className="print-result-item">
                <div className="print-result-label">N Tanah (kg/are)</div>
                <div className="print-result-value">
                  {fmtNum(ecol?.soil_nutrients?.n_kg_per_are, 4)}
                </div>
              </div>
              <div className="print-result-item">
                <div className="print-result-label">P₂O₅ Tanah (kg/are)</div>
                <div className="print-result-value">
                  {fmtNum(ecol?.soil_nutrients?.p2o5_kg_per_are, 4)}
                </div>
              </div>
              <div className="print-result-item">
                <div className="print-result-label">CO₂e Emisi</div>
                <div className="print-result-value">
                  {env?.co2e_are != null
                    ? `${fmtNum(env.co2e_are, 2)} kg/are`
                    : env?.co2e_kg_per_ha_season != null
                      ? `${fmtNum(env.co2e_kg_per_ha_season / 100, 2)} kg/are`
                      : "Belum tersedia"}
                </div>
              </div>
            </div>

            {/* Optimality note */}
            {opt && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: "#f4f7f0",
                  borderRadius: 6,
                  fontSize: 11,
                  color: "#444",
                  lineHeight: 1.6,
                }}
              >
                <strong>Evaluasi Optimalitas:</strong>{" "}
                {opt.is_optimal
                  ? "✅ Kondisi sudah optimal — tidak ada perubahan diperlukan."
                  : `⚠️ Ada rekomendasi — ${dssOutput.recommended_scenario?.reasoning_summary ?? "Lihat skenario rekomendasi."}`}{" "}
                Basis: <em>{opt.optimality_basis}</em>. {opt.catatan_kalibrasi}
              </div>
            )}

            {/* Data readiness note */}
            {dssOutput.data_readiness && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  color: "#666",
                  lineHeight: 1.5,
                }}
              >
                Kesiapan data — Agronomi:{" "}
                {dssOutput.data_readiness.agronomy_ready} · Yield:{" "}
                {dssOutput.data_readiness.yield_ready} · Ekonomi:{" "}
                {dssOutput.data_readiness.economics_ready} · Ekologi:{" "}
                {dssOutput.data_readiness.ecology_ready} · Emisi:{" "}
                {dssOutput.data_readiness.environment_ready} · Status
                keseluruhan:{" "}
                <strong>{dssOutput.data_readiness.overall_status}</strong>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: "20px 0", color: "#666", fontSize: 13 }}>
            Belum ada hasil simulasi. Jalankan simulasi terlebih dahulu sebelum
            mencetak laporan.
          </div>
        )}
      </div>

      {/* ── Regular on-screen topbar ── */}
      <header className="topbar">
        <div className="topbar-left">
          {/* Mobile hamburger */}
          <button
            className="topbar-mobile-menu-btn"
            onClick={onMobileMenuToggle}
            aia-label="Buka menu"
          >
            ` ☰
          </button>
          <div className="topbar-icon">🌿</div>
          <div>
            <span className="topbar-title">{meta.title}</span>
            {meta.subtitle && (
              <span className="topbar-subtitle"> · {meta.subtitle}</span>
            )}
          </div>
        </div>
        <div className="topbar-right">
          <button
            className="btn-export"
            onClick={handleExportPDF}
            disabled
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          >
            <span className="btn-export-icon">↗</span>
            Export PDF (Belum Tersedia)
          </button>
        </div>
      </header>
    </>
  );
}
