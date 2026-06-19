import { useState } from "react";
import type { SimInput, SimOutput } from "../types";
import { calculate } from "../types/calculate";
import "../styles/simulation.css";
import "../styles/dashboard.css";

const DEFAULT_INPUT: SimInput = {
  lahanLuas: 2.5,
  jumlahBebek: 150,
  varietasPadi: "Ciherang",
  sistemTanam: "Jajar Legowo",
  tanggalTanam: "2025-11-20",
  umurBebek: 21,
};

type TabKey = "finansial" | "ekologis" | "rekomendasi";

export default function SimulasiPage() {
  const [input, setInput] = useState<SimInput>(DEFAULT_INPUT);
  const [output, setOutput] = useState<SimOutput | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("finansial");
  const [hasResult, setHasResult] = useState(false);

  const handleChange = (key: keyof SimInput, val: string | number) => {
    setInput((prev) => ({ ...prev, [key]: val }));
    setHasResult(false);
  };

  const handleSimulate = () => {
    const result = calculate(input);
    setOutput(result);
    setHasResult(true);
  };

  return (
    <div className="page-body">
      {/* Page title */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 30,
            color: "var(--text-primary)",
            marginBottom: 4,
          }}
        >
          Agro-Ecological Intelligence
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
          Perbandingan analisis simbiosis antara skenario aktual Anda dengan
          standar regeneratif optimal Astungkara Way.
        </p>
      </div>

      <div className="sim-layout">
        {/* ── Tabel 1: Input Panel ── */}
        <div className="input-panel">
          <div className="input-panel-header">
            <div className="input-panel-title">Input Parameter</div>
            <div className="input-panel-subtitle">
              Konfigurasi Lahan &amp; Budidaya
            </div>
          </div>
          <div className="input-panel-body">
            {/* Luas Lahan + Jumlah Bebek */}
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Luas Lahan</label>
                <div className="form-input-with-unit">
                  <input
                    className="form-input-bare"
                    type="number"
                    min={0.1}
                    max={50}
                    step={0.1}
                    value={input.lahanLuas}
                    onChange={(e) =>
                      handleChange("lahanLuas", parseFloat(e.target.value) || 0)
                    }
                  />
                  <span className="form-unit">a</span>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Jumlah Bebek</label>
                <div className="form-input-with-unit">
                  <input
                    className="form-input-bare"
                    type="number"
                    min={0}
                    max={5000}
                    step={10}
                    value={input.jumlahBebek}
                    onChange={(e) =>
                      handleChange("jumlahBebek", parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="form-unit">Ekor</span>
                </div>
              </div>
            </div>

            {/* Varietas + Sistem Tanam */}
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Varietas &amp; Sistem</label>
                <select
                  className="form-select"
                  value={input.varietasPadi}
                  onChange={(e) => handleChange("varietasPadi", e.target.value)}
                >
                  <option>Cigelis</option>
                  <option>Ciherang</option>
                  <option>Inpari 32</option>
                  <option>Sertani</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sistem Tanam</label>
                <select
                  className="form-select"
                  value={input.sistemTanam}
                  onChange={(e) => handleChange("sistemTanam", e.target.value)}
                >
                  <option>Jajar Legowo</option>
                  <option>Tegel/Konvensional</option>
                  <option>Double Transplant</option>
                  <option>SRI:</option>
                </select>
              </div>
            </div>

            {/* Tanggal Tanam & Umur Bebek */}
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tanggal Tanam</label>
                <input
                  className="form-input"
                  type="date"
                  value={input.tanggalTanam}
                  onChange={(e) => handleChange("tanggalTanam", e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Umur Bebek Saat Masuk</label>
                <div className="form-input-with-unit">
                  <input
                    className="form-input-bare"
                    type="number"
                    min={1}
                    max={100}
                    step={1}
                    value={input.umurBebek}
                    onChange={(e) =>
                      handleChange("umurBebek", parseInt(e.target.value) || 0)
                    }
                  />
                  <span className="form-unit">Hari</span>
                </div>
              </div>
            </div>

            <button className="btn-simulate" onClick={handleSimulate}>
              Simulasikan &amp; Bandingkan
            </button>
          </div>
        </div>

        {/* ── Tabel 2: Output — Comparison Cards ── */}
        <div>
          {!hasResult ? (
            <div
              style={{
                height: "100%",
                border: "1.5px dashed var(--surface-border)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 32,
                gap: 10,
                background: "white",
              }}
            >
              <span style={{ fontSize: 40 }}>🌾</span>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 17,
                  color: "var(--text-secondary)",
                  textAlign: "center",
                }}
              >
                Hasil Prediksi &amp; Analisis
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  textAlign: "center",
                  maxWidth: 240,
                }}
              >
                Isi parameter input dan klik <strong>Simulasikan</strong> untuk
                melihat hasil
              </div>
            </div>
          ) : (
            output && (
              <>
                {/* Rencana Aktual */}
                <div className="compare-card" style={{ marginBottom: 14 }}>
                  <div className="compare-card-header">
                    <span className="compare-card-label">
                      Rencana Aktual Anda
                    </span>
                    <span
                      className={`card-badge ${output.densityStatus === "ok" ? "badge-green" : "badge-red"}`}
                    >
                      {output.densityStatus === "danger"
                        ? "RISIKO TINGGI"
                        : output.densityStatus === "warning"
                          ? "PERLU PERHATIAN"
                          : "OPTIMAL"}
                    </span>
                  </div>
                  <div
                    className="compare-card-body"
                    style={{ padding: "14px 16px" }}
                  >
                    <table
                      className="fin-table"
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "13px",
                      }}
                    >
                      <tbody>
                        {/* ── Umur & Populasi ── */}
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Jumlah Bebek
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {input.jumlahBebek} Ekor
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Kepadatan Bebek
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.currentDensity} Ekor/a
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Durasi Pelepasan
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.durasiAktual} Hari
                          </td>
                        </tr>

                        {/* ── Kelompok Yield ── */}
                        <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                          <td colSpan={2} style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Yield / Hasil
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Hasil Gabah
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {(output.currentYield * 10).toFixed(1)} kg/a
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Beras
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.berasYield.toFixed(1)} kg/a
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Hasil Bebek
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.duckYield.toFixed(2)} kg/ekor
                          </td>
                        </tr>

                        {/* ── Kelompok Profit Bersih ── */}
                        <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                          <td colSpan={2} style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Profit Bersih
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Gabah
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.profitGabahFormatted}
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Bebek
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.profitBebekFormatted}
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Beras
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.profitBerasFormatted}
                          </td>
                        </tr>

                        {/* ── Kelompok Gulma ── */}
                        <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                          <td colSpan={2} style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Gulma
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Penghematan Pencabut Gulma
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.savingGulmaHariActual}
                          </td>
                        </tr>

                        {/* ── Kelompok Pupuk ── */}
                        <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                          <td colSpan={2} style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Pupuk (Penghematan)
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Penghematan N
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.hematN_Actual} kg
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Penghematan P
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.hematP_Actual} kg
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Penghematan K
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.hematK_Actual} kg
                          </td>
                        </tr>

                        {/* ── Kelompok Dampak Lingkungan ── */}
                        <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                          <td colSpan={2} style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Dampak Lingkungan
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Emisi CO2
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.emisiCO2_Actual} ton CO2e
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Emisi Metana (CH4)
                          </td>
                          <td
                            style={{ padding: "8px 10px", textAlign: "right" }}
                          >
                            {output.emisiCH4_Actual} kg CH4
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {output.densityStatus === "danger" && (
                      <div
                        className="analysis-alert risk"
                        style={{ marginTop: "12px", marginBottom: 0 }}
                      >
                        <span className="analysis-alert-icon">⚠️</span>
                        <div>
                          <div className="analysis-alert-title">
                            Analisis Densitas
                          </div>
                          <div className="analysis-alert-body">
                            Kepadatan {output.currentDensity} ekor/a pada sistem{" "}
                            {input.sistemTanam} berisiko merusak akar padi muda
                            dan meningkatkan kadar amonia tanah secara berlebih.
                          </div>
                        </div>
                      </div>
                    )}
                    {output.densityStatus === "ok" && (
                      <div
                        className="analysis-alert ok"
                        style={{ marginTop: "12px", marginBottom: 0 }}
                      >
                        <span className="analysis-alert-icon">✓</span>
                        <div>
                          <div className="analysis-alert-title">
                            Analisis Simbiosis
                          </div>
                          <div className="analysis-alert-body">
                            Densitas {output.currentDensity} ekor/a mendukung
                            kontrol gulma dan nitrifikasi tanah secara optimal.
                            Pertahankan manajemen ini.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rekomendasi Optimal */}
                <div className="compare-card optimal">
                  <div className="compare-card-header">
                    <span className="compare-card-label">
                      Rekomendasi Optimal
                    </span>
                    <span className="compare-card-badge-optimal">
                      SKENARIO AMAN &amp; OPTIMAL
                    </span>
                  </div>
                  <div
                    className="compare-card-body"
                    style={{ padding: "14px 16px" }}
                  >
                    <table
                      className="fin-table"
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "13px",
                      }}
                    >
                      <tbody>
                        {/* ── Umur & Populasi ── */}
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Jumlah Bebek
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {Math.round(80 * input.lahanLuas)} Ekor
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Kepadatan Bebek
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.optimalDensity} Ekor/a
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Durasi Pelepasan
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.durasiRekomendasi} Hari
                          </td>
                        </tr>

                        {/* ── Kelompok Yield ── */}
                        <tr style={{ background: "rgba(34,197,94,0.06)" }}>
                          <td colSpan={2} style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "bold", color: "var(--green-700)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Yield / Hasil
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Hasil Gabah
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {(output.optimalYield * 10).toFixed(1)} kg/a
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Beras
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.optimalBerasYield.toFixed(1)} kg/a
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Hasil Bebek
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.optimalDuckYield.toFixed(2)} kg/ekor
                          </td>
                        </tr>

                        {/* ── Kelompok Profit Bersih ── */}
                        <tr style={{ background: "rgba(34,197,94,0.06)" }}>
                          <td colSpan={2} style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "bold", color: "var(--green-700)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Profit Bersih
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Gabah
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.optProfitGabahFormatted}
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Bebek
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.optProfitBebekFormatted}
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Beras
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.optProfitBerasFormatted}
                          </td>
                        </tr>

                        {/* ── Kelompok Gulma ── */}
                        <tr style={{ background: "rgba(34,197,94,0.06)" }}>
                          <td colSpan={2} style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "bold", color: "var(--green-700)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Gulma
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Penghematan Pencabut Gulma
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.savingGulmaHariOptimal}
                          </td>
                        </tr>

                        {/* ── Kelompok Pupuk ── */}
                        <tr style={{ background: "rgba(34,197,94,0.06)" }}>
                          <td colSpan={2} style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "bold", color: "var(--green-700)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Pupuk (Penghematan)
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Penghematan N
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.hematN_Optimal} kg
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Penghematan P
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.hematP_Optimal} kg
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Penghematan K
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.hematK_Optimal} kg
                          </td>
                        </tr>

                        {/* ── Kelompok Dampak Lingkungan ── */}
                        <tr style={{ background: "rgba(34,197,94,0.06)" }}>
                          <td colSpan={2} style={{ padding: "6px 10px", fontSize: "11px", fontWeight: "bold", color: "var(--green-700)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Dampak Lingkungan
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Emisi CO2
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.emisiCO2_Optimal} ton CO2e
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="metric-name"
                            style={{ padding: "8px 10px", fontWeight: 600 }}
                          >
                            Emisi Metana (CH4)
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                              color: "var(--green-600)",
                              fontWeight: 600,
                            }}
                          >
                            {output.emisiCH4_Optimal} kg CH4
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </div>

      {/* Schedule Integration */}
      {hasResult && output && (
        <>
          <div style={{ marginBottom: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Jadwal Integrasi
            </span>
          </div>
          <div className="schedule-row">
            {[
              {
                tag: "Mulai",
                date: "01 Jun",
                label: "TANAM",
                sub: "Inisiasi bibit",
              },
              {
                tag: "Hari ke-21",
                date: "22 Jun",
                label: "PELEPASAN",
                sub: "Bebek masuk sawah",
              },
              {
                tag: "Hari ke-90",
                date: "19 Agt",
                label: "PANEN",
                sub: "Estimasi panen",
              },
            ].map((item, i) => (
              <div key={i} className="schedule-item">
                <div className="schedule-item-tag">{item.tag}</div>
                <div className="schedule-item-date">{item.date}</div>
                <div className="schedule-item-label">{item.label}</div>
                <div className="schedule-item-sub">{item.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Tabel 3: Analisis Detail (Tabs) ── */}
          <div className="card">
            <div className="card-body" style={{ padding: "14px 18px" }}>
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  Analisis Detail
                </span>
              </div>
              <div className="tab-nav">
                {(["finansial", "ekologis", "rekomendasi"] as TabKey[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      className={`tab-btn${activeTab === tab ? " active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === "finansial" && "Proyeksi Finansial"}
                      {tab === "ekologis" && "Dampak Ekologis"}
                      {tab === "rekomendasi" && "Rekomendasi Aksi"}
                    </button>
                  ),
                )}
              </div>

              {activeTab === "finansial" && (
                <table className="fin-table">
                  <thead>
                    <tr>
                      <th>Metrik</th>
                      <th>Aktual</th>
                      <th>Optimal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {output.financials.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          row.metric === "Profit Bersih" ? "profit-row" : ""
                        }
                      >
                        <td className="metric-name">{row.metric}</td>
                        <td
                          className={
                            row.actualIsNegative
                              ? "value-actual"
                              : "value-neutral"
                          }
                        >
                          {row.actual}
                        </td>
                        <td className="value-optimal">{row.optimal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "ekologis" && (
                <table className="fin-table">
                  <thead>
                    <tr>
                      <th>Metrik</th>
                      <th>Aktual</th>
                      <th>Optimal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {output.ecological.map((row, i) => (
                      <tr key={i}>
                        <td className="metric-name">{row.metric}</td>
                        <td className="value-neutral">{row.actual}</td>
                        <td className="value-optimal">{row.optimal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "rekomendasi" && (
                <div className="rekom-list">
                  {output.rekomendasi.map((r, i) => (
                    <div key={i} className="rekom-item">
                      <div className={`rekom-priority-dot ${r.prioritas}`} />
                      <div className="rekom-content">
                        <div className="rekom-category">{r.kategori}</div>
                        <div className="rekom-action">{r.tindakan}</div>
                        <div className="rekom-impact"> {r.dampak}</div>
                      </div>
                      <span className={`rekom-badge ${r.prioritas}`}>
                        {r.prioritas === "high"
                          ? "Tinggi"
                          : r.prioritas === "medium"
                            ? "Sedang"
                            : "Rendah"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
