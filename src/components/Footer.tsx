import '../styles/dashboard.css';

export default function Footer() {
  return (
    <footer className="page-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">🌾 Astungkara Way · DSS Padi–Bebek</div>
          <p className="footer-desc">
            Sistem pendukung keputusan untuk simulasi integrasi padi dan bebek berbasis model matematis.
          </p>
        </div>
        <div>
          <div className="footer-col-title">Fitur DSS</div>
          <div className="footer-link">
            <span style={{ color: 'var(--green-300)', opacity: 0.6 }}>›</span>
            Simulasi padi-bebek
          </div>
          <div className="footer-link">
            <span style={{ color: 'var(--green-300)', opacity: 0.6 }}>›</span>
            Rekomendasi kepadatan
          </div>
          <div className="footer-link">
            <span style={{ color: 'var(--green-300)', opacity: 0.6 }}>›</span>
            Estimasi yield
          </div>
          <div className="footer-link">
            <span style={{ color: 'var(--green-300)', opacity: 0.6 }}>›</span>
            Ringkasan ekonomi, ekologi, dan lingkungan
          </div>
        </div>
      </div>
      <hr className="footer-divider" />
      <div className="footer-bottom">
        <span className="footer-copy">© 2025–2026 Astungkara Way · Subak Sibang, Badung</span>
      </div>
    </footer>
  );
}
