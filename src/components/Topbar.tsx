import type { Page, SimInput, SimOutput } from '../types';
import '../styles/topbar.css';

interface TopbarProps {
  page: Page;
  simInput: SimInput;
  simOutput: SimOutput;
  loggedMoisture: number;
  loggedWaterLevel: number;
}

const PAGE_META: Record<Page, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Astungkara Way', subtitle: 'Block A-12' },
  simulasi: { title: 'Agro-Ecological Intelligence', subtitle: 'Simulasi & Prediksi' },
  laporan: { title: 'Impact Reports', subtitle: 'Laporan Dampak' },
};

export default function Topbar({ page, simInput, simOutput, loggedMoisture, loggedWaterLevel }: TopbarProps) {
  const meta = PAGE_META[page];

  const handleExportPDF = () => {
    window.print();
  };

  const printDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <>
      {/* Print-only report header — hidden in screen mode */}
      <div className="print-report-cover">
        <div className="print-report-logo">Astungkara Way</div>
        <div className="print-report-title">Laporan Agro-Ekologi Sistem Padi–Bebek</div>
        <div className="print-report-subtitle">Dicetak pada: {printDate} · Blok A-12 · Subak Sibang, Badung</div>
        <div className="print-report-divider" />
        <div className="print-report-params">
          <div className="print-param-row">
            <span>Varietas Padi:</span><strong>{simInput.varietasPadi}</strong>
            <span>Sistem Tanam:</span><strong>{simInput.sistemTanam}</strong>
            <span>Luas Lahan:</span><strong>{simInput.lahanLuas} a</strong>
          </div>
          <div className="print-param-row">
            <span>Jumlah Bebek:</span><strong>{simInput.jumlahBebek} ekor</strong>
            <span>Tanggal Tanam:</span><strong>{simInput.tanggalTanam}</strong>
            <span>Umur Bebek:</span><strong>{simInput.umurBebek} hari</strong>
          </div>
          <div className="print-param-row">
            <span>Kelembaban Tanah:</span><strong>{loggedMoisture}%</strong>
            <span>Tinggi Air:</span><strong>{loggedWaterLevel} cm</strong>
            <span>Densitas Bebek:</span><strong>{simOutput.currentDensity} ekor/a</strong>
          </div>
        </div>
        <div className="print-report-divider" />
        <div className="print-result-grid">
          <div className="print-result-item">
            <div className="print-result-label">Yield Gabah</div>
            <div className="print-result-value">{(simOutput.currentYield * 10).toFixed(1)} kg/a</div>
          </div>
          <div className="print-result-item">
            <div className="print-result-label">Beras</div>
            <div className="print-result-value">{simOutput.berasYield} kg/a</div>
          </div>
          <div className="print-result-item">
            <div className="print-result-label">Bobot Bebek</div>
            <div className="print-result-value">{simOutput.duckYield} kg/ekor</div>
          </div>
          <div className="print-result-item">
            <div className="print-result-label">Profit Gabah</div>
            <div className="print-result-value">{simOutput.profitGabahFormatted}</div>
          </div>
          <div className="print-result-item">
            <div className="print-result-label">Profit Beras</div>
            <div className="print-result-value">{simOutput.profitBerasFormatted}</div>
          </div>
          <div className="print-result-item">
            <div className="print-result-label">Profit Bebek</div>
            <div className="print-result-value">{simOutput.profitBebekFormatted}</div>
          </div>
          <div className="print-result-item">
            <div className="print-result-label">Penghematan N</div>
            <div className="print-result-value">{simOutput.hematN_Actual} kg</div>
          </div>
          <div className="print-result-item">
            <div className="print-result-label">Penghematan P</div>
            <div className="print-result-value">{simOutput.hematP_Actual} kg</div>
          </div>
          <div className="print-result-item">
            <div className="print-result-label">Penghematan K</div>
            <div className="print-result-value">{simOutput.hematK_Actual} kg</div>
          </div>
          <div className="print-result-item">
            <div className="print-result-label">Reduksi CO2e</div>
            <div className="print-result-value">{simOutput.reduksiCO2_Actual} ton</div>
          </div>
          <div className="print-result-item">
            <div className="print-result-label">Reduksi CH4</div>
            <div className="print-result-value">{simOutput.reduksiCH4_Actual} kg</div>
          </div>
          <div className="print-result-item">
            <div className="print-result-label">Skor Keberlanjutan</div>
            <div className="print-result-value">{simOutput.sustainabilityScore}/100</div>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: '10px 16px', background: '#f4f7f0', borderRadius: 6, fontSize: 11, color: '#444' }}>
          <strong>Penghematan Tenaga Gulma:</strong> {simOutput.savingGulmaHariActual} &nbsp;|&nbsp;
          <strong>Dampak Lingkungan:</strong> {simOutput.dampakLingkunganAktual} &nbsp;|&nbsp;
          <strong>Risiko Hama:</strong> {simOutput.risikoHama}
        </div>
      </div>

      {/* Regular on-screen topbar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-icon">🌿</div>
          <div>
            <span className="topbar-title">{meta.title}</span>
            {meta.subtitle && (
              <span className="topbar-subtitle"> · {meta.subtitle}</span>
            )}
          </div>
        </div>
        <div className="topbar-right">
          {page === 'dashboard' && (
            <>
              <div className="topbar-status-badge">
                <span className="topbar-status-dot" />
                Live Status: Optimized
              </div>
              <span className="topbar-block-label">Block A-12</span>
            </>
          )}
          <button className="btn-export" onClick={handleExportPDF}>
            <span className="btn-export-icon">↗</span>
            Export to PDF
          </button>
        </div>
      </header>
    </>
  );
}
