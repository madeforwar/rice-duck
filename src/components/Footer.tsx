import '../styles/dashboard.css';

export default function Footer() {
  return (
    <footer className="page-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">🌾 Astungkara · RiceDuck Predict</div>
          <p className="footer-desc">
            Sistem prediksi hasil panen berbasis teknologi pertanian terpadu padi–bebek.
            Optimasi sinergi ekosistem sawah untuk produktivitas dan keberlanjutan maksimal.
          </p>
        </div>
        <div>
          <div className="footer-col-title">Fitur</div>
          {['Prediksi Hasil Panen', 'Analisis Risiko Hama', 'Rekomendasi Cerdas', 'Dashboard Monitoring'].map(f => (
            <div key={f} className="footer-link">
              <span style={{ color: 'var(--green-300)', opacity: 0.6 }}>›</span>
              {f}
            </div>
          ))}
        </div>
        <div>
          <div className="footer-col-title">Varietas Didukung</div>
          {['Cigelis', 'Ciherang', 'Inpari 32', 'Sertani'].map(v => (
            <div key={v} className="footer-link">
              <span style={{ color: 'var(--green-300)', opacity: 0.6 }}>✓</span>
              {v}
            </div>
          ))}
        </div>
      </div>
      <hr className="footer-divider" />
      <div className="footer-bottom">
        <span className="footer-copy">© 2025 Astungkara · Traditional Tech Innovation</span>
        <span className="footer-version">Versi 1.2.0 · Sistem Padi–Bebek</span>
      </div>
    </footer>
  );
}