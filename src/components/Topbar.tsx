import type { Page } from "../types";
import type { DssSimulationInputState, DssSimulationResponse } from "../types/api";
import "../styles/topbar.css";

interface TopbarProps {
  page: Page;
  dssInput: DssSimulationInputState;
  dssOutput: DssSimulationResponse | null;
  onMobileMenuToggle?: () => void;
}

const PAGE_META: Record<Page, { title: string; subtitle?: string }> = {
  simulasi: { title: "Simulasi DSS", subtitle: "Agro-Ecological Intelligence" },
  history: { title: "History", subtitle: "Riwayat Simulasi" },
};

const STATUS_LABEL: Record<string, string> = {
  SAFE: "Aman",
  WARNING_DENSITY: "Kepadatan terlalu tinggi",
  WARNING_UNDER_DENSITY: "Kepadatan terlalu rendah",
  AGE_BUY_RANGE: "Umur bebek sesuai rentang model",
  AGE_BUY_RANGE_WARNING: "Umur bebek di luar rentang model",
};

function fmtNum(val: number | null | undefined, decimals = 2) {
  if (val === null || val === undefined || Number.isNaN(val)) return "—";
  return val.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtRp(val: number | null | undefined) {
  if (val === null || val === undefined) return "Not Available";
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

  const densityInput =
    dssInput?.duck_count != null &&
    dssInput?.land_area_are != null &&
    dssInput.land_area_are > 0
      ? dssInput.duck_count / dssInput.land_area_are
      : null;

  return (
    <>
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
              <div className="print-report-params">
                <div className="print-param-row">
                  <span>Varietas:</span>
                  <strong>{dssInput.rice_variety}</strong>
                  <span>Sistem Tanam:</span>
                  <strong>{dssInput.planting_system}</strong>
                  <span>Luas Lahan Aktif:</span>
                  <strong>{dssInput.land_area_are} are</strong>
                </div>
                <div className="print-param-row">
                  <span>Populasi Bebek:</span>
                  <strong>{dssInput.duck_count} ekor</strong>
                  <span>Tanggal Tanam:</span>
                  <strong>{fmtDate(dssInput.planting_date)}</strong>
                  <span>Umur Bebek:</span>
                  <strong>{dssInput.duck_age_days} hari</strong>
                </div>
                <div className="print-param-row">
                  <span>Kepadatan:</span>
                  <strong>{fmtNum(densityInput)} ekor/are</strong>
                  <span>Lepas Bebek:</span>
                  <strong>{fmtDate(dssOutput.D_masuk_bebek)}</strong>
                  <span>Tarik Bebek:</span>
                  <strong>{fmtDate(dssOutput.D_tarik_bebek)}</strong>
                </div>
                <div className="print-param-row">
                  <span>Panen Gabah:</span>
                  <strong>{fmtDate(dssOutput.D_panen_gabah)}</strong>
                  <span>Status Kepadatan:</span>
                  <strong>{STATUS_LABEL[dssOutput.density_status] ?? dssOutput.density_status}</strong>
                  <span>Status Umur:</span>
                  <strong>{STATUS_LABEL[dssOutput.age_status] ?? dssOutput.age_status}</strong>
                </div>
              </div>
              <div className="print-report-divider" />

              <div className="print-result-grid">
                <div className="print-result-item">
                  <div className="print-result-label">Panen per Are</div>
                  <div className="print-result-value">
                    {fmtNum(dssOutput.Yield_are_predict, 2)} kg/are
                  </div>
                </div>
                <div className="print-result-item">
                  <div className="print-result-label">Total Panen Gabah</div>
                  <div className="print-result-value">
                    {fmtNum(dssOutput.Yield_total_predict, 1)} kg
                  </div>
                </div>
                <div className="print-result-item">
                  <div className="print-result-label">Bebek Hidup</div>
                  <div className="print-result-value">
                    {fmtNum(dssOutput.N_survive, 0)} ekor
                  </div>
                </div>
                <div className="print-result-item">
                  <div className="print-result-label">Total Pendapatan</div>
                  <div className="print-result-value">
                    {fmtRp(dssOutput.Total_Revenue)}
                  </div>
                </div>
                <div className="print-result-item">
                  <div className="print-result-label">Pendapatan Gabah</div>
                  <div className="print-result-value">
                    {fmtRp(dssOutput.Revenue_gabah)}
                  </div>
                </div>
                <div className="print-result-item">
                  <div className="print-result-label">Pendapatan Bebek</div>
                  <div className="print-result-value">
                    {fmtRp(dssOutput.Revenue_duck)}
                  </div>
                </div>
                <div className="print-result-item">
                  <div className="print-result-label">Total Biaya Tunai</div>
                  <div className="print-result-value">
                    {fmtRp(dssOutput.Cost_total_cash)}
                  </div>
                </div>
                <div className="print-result-item">
                  <div className="print-result-label">Biaya Bebek (Cash)</div>
                  <div className="print-result-value">
                    {fmtRp(dssOutput.Cost_duck_buy)}
                  </div>
                </div>
                <div className="print-result-item">
                  <div className="print-result-label">Laba Tunai Bersih</div>
                  <div className="print-result-value">
                    {fmtRp(dssOutput.Profit_net_cash)}
                  </div>
                </div>
                <div className="print-result-item">
                  <div className="print-result-label">Faktor Sistem (F_sys)</div>
                  <div className="print-result-value">
                    {fmtNum(dssOutput.F_sys, 2)}
                  </div>
                </div>
                <div className="print-result-item">
                  <div className="print-result-label">Biaya Indikatif Total (Sandbox)</div>
                  <div className="print-result-value">
                    {fmtRp(
                      (dssOutput.Cost_feed_isolated ?? 0) +
                      (dssOutput.Cost_weeding_isolated ?? 0) +
                      (dssOutput.Cost_pesticide_isolated ?? 0) +
                      (dssOutput.Cost_infra_isolated ?? 0) +
                      (dssOutput.Cost_fertilizer_isolated ?? 0)
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
          <div style={{ padding: "20px 0", color: "#666", fontSize: 13 }}>
            No simulation results yet. Jalankan simulasi terlebih dahulu sebelum
            mencetak laporan.
          </div>
        )}
      </div>

      <header className="topbar">
        <div className="topbar-left">
          <button
            className="topbar-mobile-menu-btn"
            onClick={onMobileMenuToggle}
            aria-label="Buka menu"
          >
            ☰
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
            Export PDF (Not Available)
          </button>
        </div>
      </header>
    </>
  );
}
