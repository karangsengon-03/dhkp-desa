# Changelog — DHKP Desa Karang Sengon

Semua perubahan signifikan pada proyek ini didokumentasikan di sini.
Format: `[Prioritas] Deskripsi — file yang diubah`

---

## Audit Fix — 2026-05-10
**Scope: Perbaikan keamanan, aksesibilitas, performa offline, dan kualitas kode**

### 🔴 KRITIS

#### #C1 — Security Headers HTTP
- `next.config.ts`: tambah `securityHeaders` array lengkap: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `Content-Security-Policy` (disesuaikan untuk Firebase + Vercel Analytics). Headers diterapkan ke semua route `/(.*)`

#### #C2 — Firestore Security Rules
- `firestore.rules` (FILE BARU): rules per collection — `dhkp/{tahun}/records`, `settings`, `changelog`. Semua memerlukan `request.auth != null`. Changelog tidak bisa di-update atau delete. Field immutable `createdAt` tidak bisa diubah setelah dibuat.

#### #C3 — Cookie Sesi Flag `Secure`
- `lib/auth.ts`: tambah fungsi `isHttps()` — cookie `dhkp_session` sekarang menyertakan flag `Secure` secara kondisional (aktif di production HTTPS, tidak aktif di localhost HTTP). Berlaku untuk `setSessionCookie()` dan `clearSessionCookie()`.

### 🟠 PENTING

#### #P1 — Firestore Offline Persistence
- `lib/firebase.ts`: ganti `getFirestore(app)` dengan `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`. Data Firestore sekarang tersimpan di IndexedDB dan tersync otomatis saat koneksi pulih.

#### #P2 — Focus Visible Input Login
- `app/login/page.tsx`: hapus `outline: 'none'` inline dari input email dan password. Ganti dengan CSS class `.login-input` yang mendefinisikan `focus` dan `focus-visible` state secara eksplisit dengan `border-color + box-shadow`. Keyboard navigation sekarang berfungsi sempurna di halaman login.
- `app/login/page.tsx`: ganti `<img>` dengan `next/image` (`Image` component) dengan `width`, `height`, dan `priority` prop. Hapus eslint-disable comment yang tidak lagi diperlukan.

#### #P3 — any Tanpa Komentar di SeksiImport
- `components/export-import/SeksiImport.tsx`: tambah komentar `// reason:` sebelum `(diff as any)[f]` yang menjelaskan justifikasi teknikal.

#### #P4 — Format Nilai Keuangan di Riwayat
- `app/riwayat/page.tsx`: fungsi `formatVal` sekarang menggunakan `formatRupiah` dari `@/lib/format` untuk field `pajakTerhutang` dan `perubahanPajak`. Konsisten dengan tampilan di halaman lain.

### 🟡 PERLU FIX

#### #F1 — Offline Indicator Banner
- `components/layout/AppShell.tsx`: `useNetworkStatus` sudah ada sejak sebelumnya (toast). Tidak ada perubahan di sini karena sudah berfungsi via toast.

#### #F2 — Import Path Test Files
- `lib/__tests__/masking.test.ts`: ganti `from '../masking'` → `from '@/lib/masking'`
- `lib/__tests__/format.test.ts`: ganti `from '../format'` → `from '@/lib/format'`

#### #F3 — Select Field Focus Aksesibilitas
- `app/globals.css`: `.select-field:focus` sekarang menyertakan `box-shadow: 0 0 0 3px var(--c-navy-soft)` — konsisten dengan `.input-field:focus`.

### 🔵 SARAN

#### #S1 — Hapus Sentry
- `next.config.ts`: hapus `withSentryConfig` wrapper dan import `@sentry/nextjs`. Sentry tidak dipakai (berbayar, memperlambat build).
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`: dihapus.
- `lib/logger.ts`: hapus import dinamis Sentry. Production: silent. Development: console.
- `package.json`: hapus `@sentry/nextjs` dari dependencies.

#### #S2 — Skiplink Aksesibilitas
- `components/layout/AppShell.tsx`: tambah skip link `<a href="#main-content">Langsung ke konten</a>` — tersembunyi secara visual, muncul saat difokus via keyboard. `<main>` mendapat `id="main-content"`.

#### #S3 — Manifest.json
- `public/manifest.json`: tambah `"lang": "id"` dan `"categories": ["government", "productivity"]`.



Semua perubahan signifikan pada proyek ini didokumentasikan di sini.
Format: `[Prioritas] Deskripsi — file yang diubah`

---

## Fase 4 — 2026-05-04
**Scope: Dokumentasi, Dependencies, Monitoring, Testing**

### 📄 #19 — README & CHANGES
- Tambah `README.md` di root: nama proyek, tech stack, setup lokal, struktur folder, cara deploy, catatan keamanan.
- Tambah `CHANGES.md` ini: log lengkap semua perubahan dari semua fase.

### 📦 #20 — Cek update paket xlsx
- `xlsx`: versi saat ini `^0.18.5` sudah merupakan rilis stabil terbaru. Tidak ada pembaruan yang diperlukan.
- Tidak ada breaking change.

### 🔍 #21 — Sentry error monitoring
- Install `@sentry/nextjs` ^10.x.
- Tambah `sentry.client.config.ts`: inisialisasi Sentry di sisi klien, integrations `replayIntegration`.
- Tambah `sentry.server.config.ts`: inisialisasi Sentry di sisi server.
- Tambah `sentry.edge.config.ts`: inisialisasi Sentry di edge runtime.
- Update `next.config.ts`: wrap dengan `withSentryConfig()`, `hideSourceMaps: true`, `widenClientFileUpload: true`.
- Update `app/error.tsx`: tambah `Sentry.captureException(error)` di `useEffect`.
- Update `.env.example`: tambah `NEXT_PUBLIC_SENTRY_DSN=` (opsional, bisa dikosongkan).
- Sentry hanya aktif jika `NEXT_PUBLIC_SENTRY_DSN` diisi — tidak wajib untuk development.

### 🧪 #22 — Unit tests dasar
- Install `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `jsdom`.
- Tambah `vitest.config.ts`: config environment jsdom, setupFiles, path alias `@/` → `./`.
- Tambah `vitest.setup.ts`: import `@testing-library/jest-dom/vitest`.
- Tambah `lib/__tests__/format.test.ts`: 20 test cases untuk semua fungsi di `lib/format.ts`.
- Tambah `lib/__tests__/masking.test.ts`: 12 test cases untuk semua fungsi di `lib/masking.ts`.
- Update `package.json`: tambah script `"test"` dan `"coverage"`.

---

## Fase 3 — 2026-05-04
**Scope: Form Validation, Refactor File Besar, Kontras Warna, Jarak Tombol**

### 📋 #13 — Zod form validation
- Tambah `types/dhkp.schema.ts` (FILE BARU): Zod schema `recordFormSchema` + exported type `RecordFormData`.
- Update `components/dhkp/RecordModal.tsx`: ganti fungsi `validate()` manual dengan `recordFormSchema.safeParse(form)`. Error Zod ditampilkan di bawah field terkait dengan warna merah.

### 📁 #14 — Pecah file besar
- `components/dhkp/RecordModal.tsx` (355 baris → ~130 baris): field inputs dipindah ke `RecordFormFields.tsx` (FILE BARU).
- `app/pengaturan/page.tsx` (347 baris → ~115 baris): dipecah menjadi `SeksiAkun.tsx`, `SeksiInfoDesa.tsx`, `SeksiKunci.tsx`, dan shared `SectionHeader.tsx` (semua FILE BARU).
- `app/export-import/page.tsx` (340 baris → ~25 baris orchestrator): logika dipindah ke `SeksiExport.tsx` dan `SeksiImport.tsx` (FILE BARU).
- `components/print/PrintDHKP.tsx` (344 baris): tidak dipecah (template cetak statis erat), namun diberi komentar struktur bagian: STYLES / HELPERS / HEADER / TABLE / TTD / GRAND TOTAL.

### ⏰ #15 — Timestamp format konsisten
- Verifikasi seluruh halaman (riwayat, pengaturan, export-import) sudah konsisten menggunakan `formatTimestamp()` dari `lib/format.ts`. Tidak ada perubahan diperlukan.

### 🎨 #16 — Audit kontras warna
- `app/globals.css`: `--c-text-4: #A0A0A0` → `#767676` (rasio kontras 4.54:1, lolos WCAG AA). `--c-text-3: #6E6E6E` → `#595959` (rasio kontras 7.0:1, lolos WCAG AA Enhanced). Nilai didokumentasikan dengan komentar.

### 📱 #18 — Jarak tombol aksi tabel mobile
- *(Dikerjakan di Fase 1 bersamaan dengan fix #2 — file yang sama)* `components/dhkp/RecordTable.tsx`: `gap-1` → `gap-2` (8px). Tombol aksi `w-7 h-7` → `w-8 h-8` (32px).

### 🐛 Perbaikan lintas fase
- `types/firebase.d.ts`: Hapus broad `declare module 'firebase/...'` yang menyebabkan semua Firebase types (User, DocumentData, dll.) kolaps ke `any` saat strict mode aktif.

---

## Fase 2 — 2026-05-03
**Scope: Format Tanggal, Istilah UI, Error Pages, Env Validation, Font, Focus**

### 📅 #7 — Format tanggal bahasa Indonesia
- Refactor total `lib/format.ts`: tambah `formatTanggal()` (output "15 Januari 2025"), `formatTanggalPendek()`, `formatTanggalResmi()`, `formatTahunBulan()`, `formatTimestamp()`, `formatWaktuRelatif()`, `todayISO()`.
- Update `components/dhkp/RecordTable.tsx`, `app/riwayat/page.tsx`, `app/pengaturan/page.tsx`, `app/export-import/page.tsx`, `components/print/PrintDHKP.tsx`: ganti semua format tanggal inline/lokal ke fungsi dari `lib/format.ts`.

### 🗣️ #8 — Ganti istilah teknikal di UI
- `app/dashboard/page.tsx`, `components/layout/Sidebar.tsx`: `"Dashboard"` → `"Beranda"`.
- `app/export-import/page.tsx`: `"Upload"` → `"Unggah"`.
- `app/pengaturan/page.tsx`: `backup` → `cadangan`, `Download` → `Unduh`, `record` → `data`.
- `app/data/page.tsx`: toast `'Gagal menghapus record'` → `'Gagal menghapus data'`.
- `components/dhkp/RecordModal.tsx`: toast `'Record berhasil...'` → `'Data berhasil...'`.
- `components/dhkp/DeleteConfirmModal.tsx`: tombol `'Ya, Hapus Data Ini'`.

### ⚠️ #9 — Error boundary & halaman khusus
- Tambah `app/error.tsx`: Error boundary dengan ikon `AlertTriangle`, tombol "Muat Ulang Halaman" + "Kembali ke Beranda", tampilkan pesan error di development mode.
- Tambah `app/not-found.tsx`: Halaman 404 dengan ikon `FileQuestion`.
- Tambah `app/offline/page.tsx`: Halaman offline PWA dengan ikon `WifiOff`.
- Update `public/sw.js`: fallback ke `/offline` saat fetch jaringan gagal.

### ✅ #10 — Zod env validation
- Tambah `zod: ^3.23.8` ke `package.json`.
- Tambah `lib/env.ts`: schema validasi 6 env vars Firebase, gagal build jika ada yang hilang.
- Update `lib/firebase.ts`: import `env` dari `lib/env.ts`, gunakan nilai tervalidasi.

### 🔤 #11 — Font latin-ext
- `app/layout.tsx`: `subsets: ['latin']` → `subsets: ['latin', 'latin-ext']`. Mendukung karakter Indonesia seperti é, ñ, dst.

### 🎯 #12 — Focus indicator kustom
- `app/globals.css`: tambah `:focus-visible { outline: 3px solid var(--c-navy); outline-offset: 2px; }` beserta variant dark mode. Aksesibilitas keyboard meningkat.

---

## Fase 1 — 2026-05-03
**Scope: Keamanan Kritis, Masking, Touch Target, Print, Font Size, TypeScript Strict**

### 🔐 #1 — Password plain-text di localStorage
- `lib/auth.ts`: ganti `localStorage` manual dengan `setPersistence(browserLocalPersistence)` dari Firebase Auth. Password tidak pernah disimpan.
- `app/login/page.tsx`: hapus logika baca/tulis password dari localStorage.

### 🔒 #2 — Data masking NOP & Nomor Induk
- Tambah `lib/masking.ts` (FILE BARU): fungsi `maskNOP()` dan `maskNomorInduk()`.
- Update `components/dhkp/RecordTable.tsx`: tampilkan NOP dan Nomor Induk dalam bentuk masked di tabel.
- Update `components/export-import/SeksiImport.tsx` (via ImportPreviewModal): mask data di modal preview impor.

### 👆 #3 — Touch target minimum 48px
- `app/globals.css`: semua tombol `.btn` mendapat `min-height: 48px; min-width: 48px`. Padding disesuaikan.
- Update pagination di `app/data/page.tsx`: tombol navigasi halaman sesuai standar touch target.

### 🖨️ #4 — Print stylesheet
- `app/globals.css`: tambah `@media print` komprehensif — sembunyikan sidebar/header/tombol aksi, atur page break, warna teks hitam-putih.
- `components/print/PrintDHKP.tsx`: inline styles untuk konteks cetak.

### 🔤 #5 — Font size minimum
- `app/globals.css`: `--text-xs: 12px` → `13px`. Memenuhi standar aksesibilitas minimum.

### ✅ #6 — TypeScript strict mode
- `tsconfig.json`: `strict: false` → `strict: true`.
- Perbaiki semua TypeScript error yang muncul di seluruh codebase: nullable types, return types, Firestore Timestamp guards.
- `hooks/useAuth.ts`: type `User | null` eksplisit.

### 🛡️ #17 — Cegah .env.local masuk ZIP
- Tambah `.env.example` (FILE BARU): template semua env vars tanpa nilai nyata.
- Verifikasi `.gitignore` sudah mengecualikan `.env.local`.

---

## Versi Awal (Pre-Fix)
- **dhkp-desa-fixed.zip** → basis awal sebelum fase perbaikan dimulai (post Session 5)
- Versi Next.js: ^16.2.4, React: ^19.2.4, Firebase: ^10.14.1
