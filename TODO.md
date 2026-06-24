# Status Implementasi Frontend DSS (Rev 2)

## ✅ Selesai

### Integrasi Backend DSS
- [x] `SimulasiPage` memanggil `simulateDss()` → memakai `DssSimulationResponse`
- [x] Dropdown varietas/sistem tanam menggunakan kode backend (`sertani`/`inpari`, `jajar_legowo`/`tegel`)
- [x] Semua output ditampilkan dari backend (bukan engine lokal)
- [x] Null-safe rendering: `net_profit_rp`, `rice_revenue_rp`, `feed_cost_rp`, emisi = "Belum tersedia"
- [x] `maintenance_cost_rp = 0` → tampil "Belum tercatat" (bukan Rp 0)
- [x] `recommended_scenario` & `comparison` hanya muncul jika `is_optimal = false`
- [x] Badge status data (local-calibrated, local-estimate, literature-uncalibrated, dll)
- [x] Satuan utama: kg/are dan ekor/are di semua tampilan utama

### Auth & User
- [x] `AuthModal` — form login & register terintegrasi penuh
- [x] Sidebar menampilkan nama user & email jika sudah login
- [x] Sidebar menampilkan tombol "Masuk / Daftar" jika tamu
- [x] Tombol logout di sidebar
- [x] `useAuth()` dipakai di `Sidebar` dan `AuthModal`

### History Simulasi (LaporanPage)
- [x] List history dengan summary stats dinamis
- [x] Tombol "Detail" → modal detail simulasi penuh (`getDssHistoryDetail`)
- [x] Tombol "Hapus" dengan konfirmasi
- [x] Guest state (401) ditangani dengan pesan informatif

### Print / PDF Export
- [x] Topbar print cover menggunakan `DssSimulationResponse` (bukan legacy engine)
- [x] Semua field null ditangani dengan teks "Belum tersedia"
- [x] Catatan optimality & data readiness masuk ke print cover

### UI & Responsif
- [x] Mobile hamburger menu button di topbar
- [x] Mobile sidebar overlay (klik di luar = tutup sidebar)
- [x] `btn-view-history` CSS untuk tombol detail
- [x] Footer diperbarui sesuai DSS Rev 2

## ⏳ Menunggu Data Backend Lokal

- Kalibrasi `α_local` (3–5 panen lokal) → yield lebih akurat
- `p_gabah_RD` (harga gabah padi-bebek) → `rice_revenue_rp` & `net_profit_rp` bisa dihitung
- `p_feed` (harga pakan lokal) → `feed_cost_rp` bisa dihitung
- Flux CH₄/N₂O musiman → field emisi bisa terisi
- Kalibrasi `λ` survival rate & `K_max_are`
