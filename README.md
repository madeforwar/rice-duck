# React + TypeScript + Vite

Frontend Vite + React + TypeScript untuk DSS padi-bebek.

## DSS Rev4 frontend contract

Frontend membaca backend DSS pada prefix `/api/v1/dss`.
Base URL API diatur lewat `VITE_API_BASE_URL` dan fallback ke `http://127.0.0.1:8000`.

### Request simulate

Field utama yang dipakai frontend:

- `duck_count`
- `land_area_are`
- `planting_date`
- `rice_variety`
- `planting_system`
- `duck_age_days`
- `duck_buy_price_rp_per_duck` optional

Perilaku form Rev4:

- `land_area_are` wajib `> 0`
- `duck_age_days` wajib `> 0`
- label input umur memakai teks `Umur bebek saat masuk sawah`
- helper text umur menjelaskan bahwa umur dipakai untuk status kesiapan, harga beli, batas durasi, tanggal tarik, dan kualitas rekomendasi
- input `duck_buy_price_rp_per_duck` hanya dimunculkan saat umur bebek di luar 14–30 hari, karena backend Rev4 memang menerima field ini

### Response Rev4 yang didukung frontend

Frontend contract sudah disiapkan untuk field backend Rev4 berikut:

- `duck_age_assessment`
- `duration_constraints`
- `quality_output`
- `actual_scenario`
- `recommended_scenario`
- `comparison`
- `economics`
- `ecology`
- `environment`
- `validation`
- `data_readiness`

### Tampilan hasil Rev4

Setelah simulasi berhasil, frontend menampilkan:

- **Kondisi Aktual & Rekomendasi** — kartu skenario dengan luas lahan yang selalu terbaca (tidak lagi `undefined are` untuk rekomendasi).
- **Umur Bebek & Kualitas Rekomendasi** — kartu khusus yang menampilkan status umur, harga beli yang digunakan, batas durasi dari umur, durasi maksimum rekomendasi, target umur tarik, dan kualitas rekomendasi (Tinggi/Sedang/Rendah). Kartu ini juga menampilkan peringatan jika harga beli aktual belum diisi saat umur di luar 14–30 hari.
- **Emisi & Lingkungan** — ditampilkan sebagai limitasi penelitian, bukan output numerik aktif. Data emisi belum tersedia dari pengukuran lokal Astungkara Way pada Rev4.
- **History** — hanya menampilkan total simulasi tersimpan; kolom Rata-rata Yield, Varietas Terpopuler, dan Status Dominan yang belum tersedia telah disembunyikan. CO₂e di detail history ditampilkan sebagai limitasi penelitian.



- Umur bebek dipakai untuk status umur, harga beli bebek yang digunakan, batas durasi, tanggal tarik, dan kualitas rekomendasi.
- Pengaruh umur bebek terhadap profit hanya masuk lewat harga beli bebek (`p_duck_buy_age`).
- Umur bebek tidak mengubah langsung yield, feed, survival, kotoran, N/P/K, nilai ekologi, bobot jual, atau emisi pada Rev4.
- Modul emisi tetap limitation penelitian pada Rev4 dan bukan output numerik aktif utama.

### Status backend penting

Frontend menyiapkan label aman untuk status Rev4 seperti:

- `ready`
- `partial`
- `estimation_only`
- `local-estimate`
- `local-input`
- `literature-uncalibrated`
- `missing-actual-price`
- `required-user-input`
- `data-collection-fallback`
- `limitation`

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
