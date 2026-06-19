import '../styles/dashboard.css';
import '../styles/simulation.css';

const RECENT_RECORDS = [
  {
    date: 'Oct 24',
    title: 'Azolla Introduction Complete',
    desc: 'Water ferns introduced to suppress weed growth and fix nitrogen. Initial coverage at 15%.',
    tag: 'REGENERATIVE',
    tagColor: 'badge-green',
  },
  {
    date: 'Oct 22',
    title: 'Duck Flock Rotation',
    desc: 'Flock B moved from Block A to Block A-16. Past load in A-14 dropped below threshold.',
    tag: 'LIVESTOCK',
    tagColor: 'badge-amber',
  },
  {
    date: 'Oct 20',
    title: 'Soil Nutrient Analysis',
    desc: 'N-P-K ratio within optimal range. Organic matter increased by 0.4% from last cycle.',
    tag: 'SOIL',
    tagColor: 'badge-green',
  },
  {
    date: 'Oct 18',
    title: 'Pest Monitoring Report',
    desc: 'Brown planthopper population below economic threshold. Duck activity sufficient.',
    tag: 'PEST',
    tagColor: 'badge-green',
  },
];

const SUMMARY_STATS = [
  { label: 'Rata-rata Yield', value: '6.8', unit: 'kg/a', delta: '+0.4 vs season avg', up: true },
  { label: 'Total Bebek Aktif', value: '340', unit: 'ekor', delta: '+12% dari musim lalu', up: true },
  { label: 'Reduksi Pestisida', value: '78', unit: '%', delta: 'vs konvensional', up: true },
  { label: 'Profit Bersih', value: 'Rp28.5', unit: 'jt', delta: '+18% target tercapai', up: true },
];

export default function LaporanPage() {
  return (
    <div className="page-body">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-primary)', marginBottom: 4 }}>
          Impact Reports
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
          Ringkasan dampak finansial, ekologis, dan operasional sistem padi–bebek Astungkara Way.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {SUMMARY_STATS.map((s, i) => (
          <div key={i} className="card">
            <div className="card-body">
              <div style={{ fontSize: 22, marginBottom: 6 }}></div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">
                {s.value}<span> {s.unit}</span>
              </div>
              <div className={`stat-delta ${s.up ? 'up' : 'down'}`}>
                {s.up ? '↑' : '↓'} {s.delta}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial vs Ecological vs Risk Tabs */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">Proyeksi Finansial Musim Ini</span>
          <span className="card-badge badge-green">Target Tercapai</span>
        </div>
        <div className="card-body">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Metrik</th>
                <th>Aktual</th>
                <th>Target</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { metric: 'Biaya Pupuk Kimia', actual: 'Rp0.8jt', target: 'Rp1.4jt', ok: true },
                { metric: 'Biaya Operasional Bebek', actual: 'Rp2.4jt', target: 'Rp2.8jt', ok: true },
                { metric: 'Revenue Gabah', actual: 'Rp35.4jt', target: 'Rp32.0jt', ok: true },
                { metric: 'Revenue Bebek', actual: 'Rp4.2jt', target: 'Rp4.0jt', ok: true },
                { metric: 'Profit Bersih', actual: 'Rp28.5jt', target: 'Rp24.0jt', ok: true },
              ].map((row, i) => (
                <tr key={i} className={row.metric === 'Profit Bersih' ? 'profit-row' : ''}>
                  <td className="metric-name">{row.metric}</td>
                  <td className={row.metric === 'Profit Bersih' ? 'value-optimal' : 'value-neutral'}>{row.actual}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{row.target}</td>
                  <td>
                    <span className={`card-badge ${row.ok ? 'badge-green' : 'badge-red'}`}>
                      {row.ok ? '✓ Tercapai' : '✗ Meleset'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Field Observations */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Field Observations</span>
          <span style={{ fontSize: 12.5, color: 'var(--green-600)', fontWeight: 700, cursor: 'pointer' }}>
            View All Records →
          </span>
        </div>
        <div className="card-body">
          {RECENT_RECORDS.map((rec, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              padding: '12px 0',
              borderBottom: i < RECENT_RECORDS.length - 1 ? '1px solid var(--surface-border)' : 'none',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 44, fontWeight: 600 }}>
                {rec.date}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {rec.title}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {rec.desc}
                </div>
              </div>
              <span className={`card-badge ${rec.tagColor}`}>{rec.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}