import { useState, useEffect } from 'react';
import '../styles/dashboard.css';
import '../styles/simulation.css';
import { listDssHistories, deleteDssHistory, getDssHistoryDetail, getDssOptions } from '../services/dss';
import type { HistoryListItem, DssSimulationResponse } from '../types/api';
import type { Page } from '../types';

interface HistoryPageProps {
  setPage: (p: Page) => void;
}

const RISK_LABEL: Record<string, string> = {
  LOW: 'Kepadatan Rendah',
  SAFE: 'Aman',
  WARNING: 'Perlu Perhatian',
  HIGH: 'Risiko Tinggi',
};

function formatDateId(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr; }
}

function fmtNum(val: number | null | undefined, suffix = '', precision = 1): string {
  if (val === null || val === undefined) return '—';
  return `${val.toFixed(precision)}${suffix}`;
}

function fmtRp(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'Belum tersedia';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(val);
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return dateStr; }
}

// ── History Detail Modal ──────────────────────────────────────────────────────

function HistoryDetailModal({
  historyId,
  onClose,
}: {
  historyId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<DssSimulationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const resp = await getDssHistoryDetail(historyId);
        if (active) setDetail(resp);
      } catch {
        if (active) setError('Gagal memuat detail simulasi.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [historyId]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, overflow: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'white', borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f2d17 0%, #166534 100%)',
            padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            position: 'sticky', top: 0, zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'white', marginBottom: 2 }}>
              Detail Simulasi
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              ID: {historyId.slice(0, 8)}…
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.12)', border: 'none',
              color: 'rgba(255,255,255,0.7)', width: 28, height: 28,
              borderRadius: '50%', cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        <div style={{ padding: '20px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>
              ⏳ Memuat detail simulasi...
            </div>
          )}
          {error && (
            <div style={{ padding: 14, background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: '#b91c1c' }}>
              {error}
            </div>
          )}
          {detail && !loading && <HistoryDetailContent detail={detail} />}
        </div>
      </div>
    </div>
  );
}

// ── History Detail Content ────────────────────────────────────────────────────

function HistoryDetailContent({ detail }: { detail: DssSimulationResponse }) {
  const actual = detail.actual_scenario;
  const eco = detail.economics?.actual;
  const ecol = detail.ecology?.actual;
  const opt = detail.optimality_assessment;
  const rec = detail.recommended_scenario;

  const rows: Array<{ label: string; value: string }> = [
    { label: 'Varietas Padi', value: detail.lookup?.rice_variety?.label ?? detail.input.rice_variety },
    { label: 'Sistem Tanam', value: detail.lookup?.planting_system?.label ?? detail.input.planting_system },
    { label: 'Luas Lahan', value: `${detail.input.land_area_are} are` },
    { label: 'Jumlah Bebek', value: `${detail.input.duck_count} ekor` },
    { label: 'Tanggal Tanam', value: fmtDate(detail.input.planting_date) },
    { label: 'Umur Bebek Dilepas', value: `${detail.input.duck_age_days} hari` },
    { label: 'Tanggal Lepas Bebek', value: fmtDate(actual?.release_date) },
    { label: 'Tanggal Tarik Bebek', value: fmtDate(actual?.pull_date) },
    { label: 'Durasi di Sawah', value: `${actual?.duration_days ?? '—'} hari` },
    { label: 'Kepadatan', value: `${fmtNum(actual?.density_are, ' ekor/are', 2)}` },
    { label: 'Status Risiko', value: RISK_LABEL[actual?.risk_status ?? ''] ?? actual?.risk_status ?? '—' },
    { label: 'Yield / are', value: `${fmtNum(actual?.predicted_yield?.kg_per_are, ' kg/are', 2)}` },
    { label: 'Total Produksi', value: `${fmtNum(actual?.predicted_yield?.estimated_total_kg, ' kg', 0)}` },
    { label: 'Bebek Bertahan', value: `${actual?.surviving_ducks ?? '—'} ekor` },
    { label: 'Pendapatan Bebek', value: fmtRp(eco?.duck_revenue_rp) },
    { label: 'Biaya Infrastruktur', value: fmtRp(eco?.infrastructure?.total_infrastructure_cost_rp) },
    { label: 'Laba Bersih', value: eco?.net_profit_rp != null ? fmtRp(eco.net_profit_rp) : 'Belum tersedia' },
    { label: 'Nilai Ekologis', value: fmtRp(ecol?.partial_ecological_value_rp ?? ecol?.total_ecological_value_rp) },
    { label: 'Penghematan Gulma', value: fmtRp(ecol?.weeding_saving_rp) },
    { label: 'N Tanah (kg/are)', value: fmtNum(ecol?.soil_nutrients?.n_kg_per_are, '', 4) },
    { label: 'CO₂e Emisi', value: 'Limitasi penelitian' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            padding: '9px 12px', background: 'var(--surface-muted)',
            border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 3 }}>
              {r.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {r.value}
            </div>
          </div>
        ))}
      </div>

      {/* Optimality */}
      {opt && (
        <div style={{
          padding: '12px 14px', marginBottom: 12,
          background: opt.is_optimal ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)',
          border: `1px solid ${opt.is_optimal ? 'rgba(34,197,94,0.22)' : 'rgba(245,158,11,0.22)'}`,
          borderRadius: 'var(--radius-sm)', fontSize: 12.5,
        }}>
          <strong>{opt.is_optimal ? '✅ Kondisi sudah optimal' : '⚠️ Ada rekomendasi sistem'}</strong>
          {!opt.is_optimal && rec && (
            <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>{rec.reasoning_summary}</div>
          )}
          {!opt.profit_component_included && (
            <div style={{ marginTop: 4, color: '#92400e', fontSize: 11 }}>
              Evaluasi parsial — data harga belum lengkap.
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {detail.notes?.length > 0 && (
        <div className="info-callout" style={{ marginTop: 0 }}>
          <strong>Catatan Sistem:</strong>
          <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
            {detail.notes.slice(0, 6).map((n, i) => (
              <li key={i} style={{ fontSize: 12, marginBottom: 2 }}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Data readiness */}
      {detail.data_readiness && (
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
          Status data — Agronomi: <strong>{detail.data_readiness.agronomy_ready}</strong> ·
          Yield: <strong>{detail.data_readiness.yield_ready}</strong> ·
          Ekonomi: <strong>{detail.data_readiness.economics_ready}</strong> ·
          Keseluruhan: <strong>{detail.data_readiness.overall_status}</strong>
        </div>
      )}
    </div>
  );
}

// ── Main HistoryPage ──────────────────────────────────────────────────────────

export default function HistoryPage({ setPage }: HistoryPageProps) {
  void setPage;
  const [histories, setHistories] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
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
      else setLoadError('Gagal memuat history. Periksa koneksi ke backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadHistories(); }, []);

  useEffect(() => {
    let active = true;
    const loadOptions = async () => {
      try {
        const resp = await getDssOptions();
        if (!active) return;
        const vMap: Record<string, string> = {};
        for (const v of resp.rice_varieties ?? []) {
          vMap[v.code] = v.label;
        }
        const sMap: Record<string, string> = {};
        for (const s of resp.planting_systems ?? []) {
          sMap[s.code] = s.label;
        }
        setVarietyLabelByCode(vMap);
        setSystemLabelByCode(sMap);
      } catch {
        if (!active) return;
        setVarietyLabelByCode({});
        setSystemLabelByCode({});
      }
    };
    void loadOptions();
    return () => { active = false; };
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus history simulasi ini?')) return;
    setDeletingId(id);
    try {
      await deleteDssHistory(id);
      setHistories((prev) => prev.filter((h) => h.id !== id));
    } catch { alert('Gagal menghapus history. Coba lagi.'); }
    finally { setDeletingId(null); }
  };

  const statsToShow = [
    { label: 'Total Simulasi', value: isGuest ? '—' : String(histories.length), unit: 'sesi', delta: 'Tersimpan di akun', up: true },
  ];

  return (
    <div className="page-body">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-primary)', marginBottom: 4 }}>
          History Simulasi
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
          Riwayat simulasi DSS padi–bebek yang tersimpan di akun Anda.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {statsToShow.map((s, i) => (
          <div key={i} className="card">
            <div className="card-body">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">
                {s.value}
                {s.unit && <span> {s.unit}</span>}
              </div>
              <div className={`stat-delta ${s.up ? 'up' : 'down'}`}>{s.delta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* History List */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Riwayat Simulasi</span>
          {!isGuest && !loading && (
            <button
              onClick={() => void loadHistories()}
              style={{ fontSize: 12, color: 'var(--green-600)', fontWeight: 700, cursor: 'pointer', background: 'transparent', border: 'none', padding: '4px 8px' }}
            >
              ↻ Refresh
            </button>
          )}
        </div>
        <div className="card-body">
          {isGuest && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
                Masuk untuk melihat history
              </div>
              <div style={{ fontSize: 13 }}>
                Login dengan akun Anda untuk menyimpan dan mengakses riwayat simulasi DSS.
              </div>
            </div>
          )}

          {loading && !isGuest && (
            <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)', fontSize: 13 }}>
              ⏳ Memuat history...
            </div>
          )}

          {loadError && !loading && (
            <div style={{ padding: '14px', background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: '#b91c1c' }}>
              {loadError}
            </div>
          )}

          {!loading && !isGuest && !loadError && histories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
              Belum ada simulasi tersimpan. Jalankan simulasi di halaman{' '}
              <strong>Simulasi DSS</strong> untuk menyimpan history.
            </div>
          )}

          {!loading && !isGuest && !loadError && histories.length > 0 && (
            <div>
              {histories.map((h) => (
                <div key={h.id} className="history-item">
                  <div className="history-item-date">{formatDateId(h.created_at)}</div>
                  <div className="history-item-body">
                    <div className="history-item-title">
                      {varietyLabelByCode[h.summary.rice_variety] ?? h.summary.rice_variety} ·{' '}
                      {systemLabelByCode[h.summary.planting_system] ?? h.summary.planting_system}
                    </div>
                    <div className="history-item-meta">
                      <span>🦆 {h.summary.duck_count} ekor</span>
                      <span>📐 {fmtNum(h.summary.land_area_are, ' are', 1)}</span>
                      <span>⚖️ {fmtNum(h.summary.actual_density_are, ' ekor/are', 2)}</span>
                      <span>🌾 {fmtNum(h.summary.estimated_total_yield_kg, ' kg total', 0)}</span>
                      <span>
                        <span className={`risk-badge ${h.summary.risk_status}`}>
                          {RISK_LABEL[h.summary.risk_status] ?? h.summary.risk_status}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="history-item-actions">
                    <button
                      className="btn-view-history"
                      onClick={() => setDetailId(h.id)}
                      title="Lihat detail"
                    >
                      🔍 Detail
                    </button>
                    <button
                      className="btn-delete-history"
                      onClick={() => void handleDelete(h.id)}
                      disabled={deletingId === h.id}
                    >
                      {deletingId === h.id ? '⏳' : '🗑 Hapus'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: '#1e40af', lineHeight: 1.6 }}>
        <strong>Catatan:</strong> History hanya tersimpan jika Anda melakukan simulasi dalam kondisi login.
        Simulasi tanpa login tidak disimpan. Data history bersifat per-akun.
      </div>

      {/* Detail Modal */}
      {detailId && (
        <HistoryDetailModal
          historyId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
