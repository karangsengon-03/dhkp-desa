# DHKP Desa Karang Sengon — Fix Tracker
## Status: SELESAI SEMUA — Fase 4 ✅
## Terakhir diupdate: 2026-05-04 (Claude, selesai Fase 4 — FINAL)

---

## INSTRUKSI UNTUK CLAUDE DI CHAT BARU

Kamu adalah **senior full-stack engineer + UI/UX designer** dengan standar **perfeksionis god-mode**.
File yang kamu terima:
- `dhkp-desa-fase1.zip` → source code lengkap apps DHKP Desa Karang Sengon (post Fase 1)
- `readme-dhkp-fix.md` → file ini (tracker progress + instruksi semua fase)

**Cara kerja wajib:**
1. Baca README ini seluruhnya sebelum mulai apapun
2. Kerjakan HANYA fase yang disebutkan user (contoh: "mulai fase 2")
3. Di akhir setiap fase, TANPA DIMINTA:
   - Update README ini: centang ✅ item selesai, tambahkan catatan perubahan, isi tanggal
   - Kirim **full ZIP** seluruh source (SEMUA file, bukan hanya yang berubah)
   - Kirim README yang sudah diupdate sebagai file terpisah
4. ZIP WAJIB berisi SEMUA file tanpa kecuali — bahkan file yang tidak diubah sekalipun. Tidak boleh ada file yang hilang dari sesi ke sesi.
5. Jika ada perbaikan di fase berjalan yang menyentuh file dari fase sebelumnya: tambahkan catatan `[PERUBAHAN LINTAS FASE]` di section fase yang bersangkutan agar terlacak.
6. Jangan deploy ke Vercel/GitHub — hanya di fase final yang disebutkan user.

**Tech stack:**
- Next.js 16 App Router + TypeScript
- Tailwind CSS + CSS custom properties (design tokens di `globals.css`)
- Firebase v10 (Firestore + Auth)
- Lucide React icons
- XLSX (SheetJS)

**Penting — konteks proyek:**
- Apps pemerintah desa untuk pengelolaan data pajak bumi dan bangunan (PBB-P2)
- Pengguna: perangkat desa termasuk lansia → aksesibilitas sangat penting
- Deployed via Vercel (auto-deploy dari GitHub push)

---

## INVENTARIS FILE SAAT INI (dari dhkp-desa-fase1.zip)

```
app/
├── dashboard/page.tsx          # Halaman beranda/ringkasan statistik
├── data/page.tsx               # Halaman tabel data DHKP + CRUD [FIX #3 PaginBtn]
├── export-import/page.tsx      # Halaman ekspor/impor Excel
├── pengaturan/page.tsx         # Halaman pengaturan & info desa
├── rekap/page.tsx              # Halaman rekap lunas/belum
├── riwayat/page.tsx            # Halaman riwayat perubahan data
├── login/page.tsx              # Halaman login [FIX #1 hapus password localStorage]
├── error.tsx                   # [BARU FIX #9] Error boundary halaman
├── not-found.tsx               # [BARU FIX #9] Halaman 404
├── offline/page.tsx            # [BARU FIX #9] Halaman offline
├── layout.tsx                  # Root layout (font latin-ext, SW register, theme) [FIX #11]
├── page.tsx                    # Root redirect → /login
└── globals.css                 # Design tokens + semua CSS global [FIX #3 #4 #5 #12]

components/
├── dhkp/
│   ├── DeleteConfirmModal.tsx  # Modal konfirmasi hapus
│   ├── ImportPreviewModal.tsx  # Modal preview import Excel [FIX #2 maskNOP]
│   ├── LockBanner.tsx          # Banner data terkunci
│   ├── RecordFormFields.tsx    # [BARU FIX #14] Field inputs form DHKP (dipecah dari RecordModal)
│   ├── RecordModal.tsx         # Modal tambah/edit record DHKP [FIX #13 Zod, #14 split]
│   └── RecordTable.tsx         # Tabel data DHKP dengan aksi [FIX #2 #18]
├── export-import/
│   ├── SeksiExport.tsx         # [BARU FIX #14] Seksi export data & riwayat
│   └── SeksiImport.tsx         # [BARU FIX #14] Seksi import dari Excel
├── layout/
│   ├── AppShell.tsx            # Layout wrapper (sidebar + header)
│   ├── Header.tsx              # Header bar
│   └── Sidebar.tsx             # Sidebar navigasi
├── pengaturan/
│   ├── SectionHeader.tsx       # [BARU FIX #14] Shared header section dengan ikon
│   ├── SeksiAkun.tsx           # [BARU FIX #14] Seksi akun & keamanan
│   ├── SeksiInfoDesa.tsx       # [BARU FIX #14] Seksi informasi desa + logo
│   └── SeksiKunci.tsx          # [BARU FIX #14] Seksi kunci data global
├── print/
│   ├── PrintDHKP.tsx           # Komponen cetak DHKP (popup)
│   └── PrintRekapHeader.tsx    # Header untuk cetak rekap
└── ui/
    ├── Badge.tsx               # Komponen badge/label
    ├── Button.tsx              # Komponen tombol
    ├── Card.tsx                # Komponen card
    ├── Input.tsx               # Komponen input/textarea
    ├── Modal.tsx               # Komponen modal base
    ├── Toast.tsx               # Sistem notifikasi toast
    ├── Toggle.tsx              # Komponen toggle switch
    └── UpdateBanner.tsx        # Banner update SW tersedia

hooks/
├── useAuth.ts                  # Hook Firebase Auth state [FIX #6 User | null]
├── useDHKP.ts                  # Hook subscribe data DHKP
├── useGlobalLock.ts            # Hook subscribe global lock state
└── useTheme.ts                 # Hook dark/light mode

lib/
├── auth.ts                     # Fungsi login/logout/persist user [FIX #1 setPersistence]
├── changelog.ts                # Fungsi CRUD changelog Firestore
├── firebase.ts                 # Inisialisasi Firebase app
├── firestore.ts                # Semua fungsi CRUD Firestore
├── format.ts                   # Fungsi format angka & tanggal
├── masking.ts                  # [BARU FIX #2] Fungsi masking NOP & Nomor Induk
├── env.ts                      # [BARU FIX #10] Zod env validation
└── format.ts                   # Refactor lengkap [FIX #7]: formatTanggal, formatTanggalPendek, formatTimestamp, dll.

types/
├── index.ts                    # Semua TypeScript interfaces & types
├── dhkp.schema.ts              # [BARU FIX #13] Zod schema recordFormSchema + RecordFormData
├── firebase.d.ts               # Type declaration Firebase [FIX FASE3: hapus broad declare module]
└── lucide.d.ts                 # Type declaration Lucide

public/
├── sw.js                       # Service Worker (network-first)
├── manifest.json               # PWA manifest
├── icons/                      # PWA icons (8 ukuran)
└── [favicon files]

Root config:
├── next.config.ts              # Next.js config + BUILD_HASH injection
├── tailwind.config.js          # Tailwind config + font
├── tsconfig.json               # TypeScript config [FIX #6 strict: true]
├── package.json                # Dependencies
├── vercel.json                 # Vercel headers config
├── deploy.bat                  # Script deploy Windows
├── .env.example                # [BARU FIX #17] Template env vars
└── .gitignore
```

---

## RINGKASAN 22 ISSUE YANG AKAN DIPERBAIKI

| No | Issue | Prioritas | Fase | Status |
|----|-------|-----------|------|--------|
| 1 | Password plain-text di localStorage | 🔴 KRITIS | 1 | ✅ |
| 2 | Tidak ada data masking NOP/Nomor Induk | 🔴 KRITIS | 1 | ✅ |
| 3 | Touch target di bawah 48px | 🔴 KRITIS | 1 | ✅ |
| 4 | Print stylesheet tidak memadai | 🔴 KRITIS | 1 | ✅ |
| 5 | --text-xs: 12px (min harus 13px) | 🟠 TINGGI | 1 | ✅ |
| 6 | TypeScript strict: false | 🟠 TINGGI | 1 | ✅ |
| 7 | formatTanggal() output DD/MM/YYYY bukan "15 Januari 2025" | 🟠 TINGGI | 2 | ✅ |
| 8 | Istilah teknikal di UI: Dashboard, record, backup, Upload | 🟠 TINGGI | 2 | ✅ |
| 9 | Tidak ada app/error.tsx, not-found.tsx, offline/page.tsx | 🟠 TINGGI | 2 | ✅ |
| 10 | Tidak ada lib/env.ts (Zod env validation) | 🟠 TINGGI | 2 | ✅ |
| 11 | Font subsets hanya latin, tanpa latin-ext | 🟠 TINGGI | 2 | ✅ |
| 12 | Focus indicator :focus-visible tidak dikustomisasi | 🟠 TINGGI | 2 | ✅ |
| 13 | Tidak ada Zod form validation (validasi manual di RecordModal) | 🔵 SEDANG | 3 | ✅ |
| 14 | File terlalu besar: RecordModal (355), pengaturan (347), export-import (340), PrintDHKP (344) | 🔵 SEDANG | 3 | ✅ |
| 15 | Timestamp riwayat/changelog format numerik, bukan bahasa Indonesia | 🔵 SEDANG | 3 | ✅ |
| 16 | Kontras warna text-3/text-4 belum diaudit | 🔵 SEDANG | 3 | ✅ |
| 17 | .env.local ikut masuk ZIP distribusi | 🔵 SEDANG | 1 | ✅ |
| 18 | Jarak antar tombol aksi tabel mobile < 8px | 🔵 SEDANG | 3 | ✅ |
| 19 | Tidak ada README.md dan CHANGES.md | 🟢 RENDAH | 4 | ✅ |
| 20 | Paket xlsx versi lama (0.18.x) | 🟢 RENDAH | 4 | ✅ |
| 21 | Tidak ada Sentry error monitoring | 🟢 RENDAH | 4 | ✅ |
| 22 | Tidak ada test (Vitest) untuk format & masking | 🟢 RENDAH | 4 | ✅ |

---

## FASE 1 — KRITIS: Keamanan, Touch Target, Tipografi Minimum, Print
**Scope:** Issue #1, 2, 3, 4, 5, 6, 17
**Status: ✅ SELESAI — 2026-05-03**

### Checklist Fase 1:

#### 🔐 #1 — Hapus password dari localStorage
- [x] **`app/login/page.tsx`**: Hapus `getSavedPassword()`, `setSavedPassword()`, `SAVED_PWD_KEY`, state prefill password dari localStorage, pemanggilan `setSavedPassword()`. Label checkbox diubah "Ingat email saja".
- [x] **`lib/auth.ts`**: Tambahkan `setPersistence(auth, browserLocalPersistence)` agar Firebase Auth otomatis menjaga sesi.

#### 🔒 #2 — Data masking NOP & Nomor Induk
- [x] **`lib/masking.ts`** (FILE BARU): `maskNOP()` (6 karakter + `***` + 2 terakhir) dan `maskNomorInduk()` (3 karakter + `*****` + 2 terakhir). Handle null/empty → `'-'`.
- [x] **`components/dhkp/RecordTable.tsx`**: Import masking, terapkan ke kolom NOP & Nomor Induk. Tombol Eye (Lucide size 14) toggle reveal per-baris via `Set<string>`. Satu tombol Eye mengontrol kedua kolom (NOP + Nomor Induk) sekaligus per baris.
- [x] **`components/dhkp/ImportPreviewModal.tsx`**: `maskNOP()` diterapkan ke kolom NOP di tabel preview.

#### 👆 #3 — Touch target minimum 48px
- [x] **`app/globals.css`**: `--touch-min: 48px`, `btn-sm` → `height: 48px`, `btn-md` → `height: var(--touch-min)`, `filter-chip` → `height: 48px`, `input-field` → `height: var(--touch-min)`.
- [x] **`app/globals.css`**: `page-btn` → `min-width: 40px; height: 44px` (exception pagination kompak, ada komentar).
- [x] **`app/data/page.tsx`**: `PaginBtn` dari `w-7 h-7` (28px) → `minWidth: 44, height: 44` via inline style.

#### 🖨️ #4 — Print stylesheet lengkap
- [x] **`app/globals.css`**: Blok `@media print` diganti versi lengkap — hide nav/header/button, reset warna B&W, `@page { size: A4; margin: 2cm }`, tipografi 12pt, page-break classes, table rules, link URL display.

#### 🔤 #5 — Teks minimum 13px
- [x] **`app/globals.css`**: `--text-xs: 13px` (dari 12px). Semua elemen yang pakai token ini otomatis terupdate.

#### 🔷 #6 — TypeScript strict mode
- [x] **`tsconfig.json`**: `"strict": true`.
- [x] **`hooks/useAuth.ts`**: `useState<User | null>(null)` — import `User` dari firebase/auth.

#### 🗂️ #17 — Hapus .env.local dari ZIP
- [x] **`.env.example`** (FILE BARU): Template dengan 6 placeholder env vars.
- [x] `.env.local` tidak disertakan di ZIP output.
- [x] `.gitignore` sudah ada `.env*` — tidak perlu diubah.

### Output Fase 1:
- [x] ZIP: `dhkp-desa-fase1.zip` (full source, TANPA .env.local, sertakan .env.example)
- [x] README diupdate
- [x] Tidak ada TypeScript error baru yang diintroduksi (strict errors yang umum sudah diantisipasi)

---

## FASE 2 — TINGGI: Bahasa Indonesia, Error Handling, Env Validation, Font
**Scope:** Issue #7, 8, 9, 10, 11, 12
**Status: ✅ SELESAI — 2026-05-03**
**Gunakan ZIP dari: `dhkp-desa-fase1.zip`**

### Checklist Fase 2:

#### 📅 #7 — Format tanggal bahasa Indonesia
- [x] **`lib/format.ts`**: Refactor total. Tambahkan `formatTanggal`, `formatTanggalPendek`, `formatTanggalResmi`, `formatWaktuRelatif`, `formatTahunBulan`, `formatTimestamp`.
- [x] **`components/dhkp/RecordTable.tsx`**: Ganti `formatTanggal()` ke versi baru.
- [x] **`app/riwayat/page.tsx`**: Ganti `formatTimestamp()` lokal dengan import dari `lib/format.ts`.
- [x] **`app/pengaturan/page.tsx`**: Ganti inline `toLocaleString` dengan `formatTimestamp()`.
- [x] **`app/export-import/page.tsx`**: Sama, ganti inline `toLocaleString` dengan `formatTimestamp()`.
- [x] **`components/print/PrintDHKP.tsx`**: Ganti `fmtTgl()` lokal dengan `formatTanggalPendek()`.

#### 🗣️ #8 — Ganti istilah teknikal di UI
- [x] **`app/dashboard/page.tsx`**: `"Dashboard"` → `"Beranda"`.
- [x] **`components/layout/Sidebar.tsx`**: Label nav `'Dashboard'` → `'Beranda'`.
- [x] **`app/export-import/page.tsx`**: `"Upload"` → `"Unggah"`.
- [x] **`app/pengaturan/page.tsx`**: `backup` → `cadangan`, `Download` → `Unduh`, `record` → `data`.
- [x] **`app/data/page.tsx`**: Toast `'Gagal menghapus record'` → `'Gagal menghapus data'`.
- [x] **`components/dhkp/RecordModal.tsx`**: Toast `'Record berhasil...'` → `'Data berhasil...'`.
- [x] **`components/dhkp/DeleteConfirmModal.tsx`**: Tombol konfirmasi: `'Ya, Hapus Data Ini'`.

#### ⚠️ #9 — Error boundary & missing pages
- [x] **`app/error.tsx`** (FILE BARU): Error boundary dengan `AlertTriangle`, tombol "Muat Ulang Halaman" + "Kembali ke Beranda".
- [x] **`app/not-found.tsx`** (FILE BARU): 404 dengan ikon `FileQuestion`, tombol "Kembali ke Beranda".
- [x] **`app/offline/page.tsx`** (FILE BARU): Offline page dengan ikon `WifiOff`, tombol "Coba Lagi".
- [x] **`public/sw.js`**: Tambahkan fallback ke `/offline` saat fetch gagal.

#### ✅ #10 — Zod env validation
- [x] Tambahkan `"zod": "^3.23.8"` ke `package.json`.
- [x] **`lib/env.ts`** (FILE BARU): Schema validasi 6 env vars Firebase.
- [x] **`lib/firebase.ts`**: Import `env` dari `lib/env.ts`.

#### 🔤 #11 — Font latin-ext
- [x] **`app/layout.tsx`**: `subsets: ['latin', 'latin-ext']`.

#### 🎯 #12 — Focus indicator
- [x] **`app/globals.css`**: Tambahkan `:focus-visible { outline: 3px solid var(--c-navy); outline-offset: 2px; border-radius: var(--radius-sm); }` + dark mode variant.

### Output Fase 2:
- [x] ZIP: `dhkp-desa-fase2.zip` (full source)
- [x] README diupdate
- [x] Tidak ada TypeScript error
- [x] Tidak ada ESLint error

---

## FASE 3 — SEDANG: Form Validation, Refactor, Kontras, Jarak Tombol
**Scope:** Issue #13, 14, 15, 16, 18
**Status: ✅ SELESAI — 2026-05-04**
**Gunakan ZIP dari: `dhkp-desa-fase2.zip`**

### Checklist Fase 3:

#### 📋 #13 — Zod form validation di RecordModal
- [x] **`types/dhkp.schema.ts`** (FILE BARU): Zod schema `recordFormSchema` + `RecordFormData` type.
- [x] **`components/dhkp/RecordModal.tsx`**: Ganti `validate()` manual dengan `recordFormSchema.safeParse(form)`. Error Zod tampil di bawah field.

#### 📁 #14 — Pecah file besar
- [x] **`components/dhkp/RecordModal.tsx`** (355 baris): Pecah → `RecordModal.tsx` (~130 baris) + `RecordFormFields.tsx` (BARU, field inputs ~130 baris).
- [x] **`app/pengaturan/page.tsx`** (347 baris): Pecah → `pengaturan/page.tsx` (~115 baris, orchestrator) + `SeksiAkun.tsx` + `SeksiInfoDesa.tsx` + `SeksiKunci.tsx` + shared `SectionHeader.tsx`.
- [x] **`app/export-import/page.tsx`** (340 baris): Pecah → `export-import/page.tsx` (~25 baris, orchestrator) + `SeksiExport.tsx` (BARU) + `SeksiImport.tsx` (BARU).
- [x] **`components/print/PrintDHKP.tsx`** (344 baris): Tambahkan komentar struktur bagian (STYLES/HELPERS/HEADER/TABLE/TTD/GRAND TOTAL). Tidak dipecah — seluruh JSX adalah template cetak statis yang erat terikat satu sama lain.

#### ⏰ #15 — Timestamp format konsisten
- [x] Verifikasi semua halaman pakai `formatTimestamp()` dari `lib/format.ts`. Semua halaman (riwayat, pengaturan, export-import) sudah konsisten.
- [x] **`app/riwayat/page.tsx`**: Dikonfirmasi — sudah pakai `formatTimestamp()` dari `lib/format.ts`. Tidak ada perubahan diperlukan.

#### 🎨 #16 — Audit kontras warna
- [x] **`app/globals.css`**: `--c-text-4: #A0A0A0` → `#767676` (4.54:1 ✅ AA). `--c-text-3: #6E6E6E` → `#595959` (7.0:1 ✅ AA, ditingkatkan). Didokumentasikan dengan komentar rasio kontras.

#### 📱 #18 — Jarak tombol aksi mobile ✅ (dikerjakan di Fase 1)
- [x] **`components/dhkp/RecordTable.tsx`**: `gap-1` → `gap-2` (8px). Tombol aksi `w-7 h-7` → `w-8 h-8`.

### Output Fase 3:
- [x] ZIP: `dhkp-desa-fase3.zip` (full source)
- [x] README diupdate
- [x] Tidak ada TypeScript error (0 errors `tsc --noEmit`)
- [x] Tidak ada ESLint error

---

## FASE 4 — RENDAH: README, Dependencies, Monitoring, Tests
**Scope:** Issue #19, 20, 21, 22
**Status: ✅ SELESAI — 2026-05-04**
**Gunakan ZIP dari: `dhkp-desa-fase3.zip`**

### Checklist Fase 4:

#### 📄 #19 — README.md dan CHANGES.md
- [x] **`README.md`** (FILE BARU di root proyek): Nama, tech stack, setup lokal, struktur folder, cara deploy, link Vercel, catatan keamanan.
- [x] **`CHANGES.md`** (FILE BARU di root proyek): Log semua perubahan dari semua fase (Fase 1–4).

#### 📦 #20 — Update paket xlsx
- [x] **`package.json`**: `xlsx ^0.18.5` sudah versi stabil terbaru (konfirmasi via `npm show xlsx version`). Tidak ada breaking change — tidak ada perubahan diperlukan.

#### 🔍 #21 — Sentry error monitoring
- [x] Install `@sentry/nextjs ^10.51.0`.
- [x] **`sentry.client.config.ts`** (FILE BARU): init Sentry klien, `replayIntegration()`, `maskAllInputs: true`, hanya aktif di production.
- [x] **`sentry.server.config.ts`** (FILE BARU): init Sentry server.
- [x] **`sentry.edge.config.ts`** (FILE BARU): init Sentry edge runtime.
- [x] **`next.config.ts`**: wrap dengan `withSentryConfig()`, `hideSourceMaps: true`, `widenClientFileUpload: true`, `silent: true`.
- [x] **`app/error.tsx`**: tambah `Sentry.captureException(error)` di `useEffect`.
- [x] **`.env.example`**: tambah `NEXT_PUBLIC_SENTRY_DSN=` (opsional).
- [x] Sentry hanya aktif jika DSN diisi — tidak wajib untuk development lokal.

#### 🧪 #22 — Unit test dasar
- [x] Install `vitest ^4.1.5`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `jsdom`.
- [x] **`vitest.config.ts`** (FILE BARU): environment jsdom, setupFiles, alias `@/`.
- [x] **`vitest.setup.ts`** (FILE BARU): import `@testing-library/jest-dom/vitest`.
- [x] **`lib/__tests__/format.test.ts`** (FILE BARU): 27 test cases — `formatRupiah`, `formatTanggal`, `formatTanggalPendek`, `formatTanggalResmi`, `formatTahunBulan`, `formatTimestamp`, `formatWaktuRelatif`, `todayISO`.
- [x] **`lib/__tests__/masking.test.ts`** (FILE BARU): 15 test cases — `maskNOP`, `maskNomorInduk`.
- [x] **`package.json`**: tambah script `"test": "vitest run"`, `"test:watch": "vitest"`, `"coverage": "vitest run --coverage"`.
- [x] **Semua 42 test pass** ✅

### Output Fase 4 (FINAL):
- [x] ZIP: `dhkp-desa-FINAL.zip` (full source, production-ready)
- [x] README.md proyek
- [x] CHANGES.md lengkap
- [x] README tracker diupdate semua centang
- [x] Tidak ada TypeScript error
- [x] Tidak ada ESLint error
- [x] Test berjalan: **42/42 pass** (`npm test`)

---

## LOG PERUBAHAN LINTAS FASE

> Format: `[Fase N → file/path] Deskripsi perubahan dan alasannya`

- [Fase 1 → components/dhkp/RecordTable.tsx] Fix #18 (gap tombol aksi) dikerjakan bersamaan dengan Fix #2 (masking) karena file yang sama dimodifikasi — lebih efisien daripada buka ulang di Fase 3.
- [Fase 2 → app/pengaturan/page.tsx] Fix #7 (formatTimestamp) dan Fix #8 (ganti 'backup'/'Download'/'record') dikerjakan bersamaan karena file yang sama.
- [Fase 2 → app/export-import/page.tsx] Fix #7 (formatTimestamp export) dan Fix #8 (teks 'Unggah') dikerjakan bersamaan.
- [Fase 3 → types/firebase.d.ts] Ditemukan broad `declare module` yang merusak semua Firebase types (User, DocumentData, dll. collapse ke `any`) — difix saat Fase 3 karena mengganggu TypeScript check pasca-penambahan Zod schema baru.

---

## CATATAN PENTING

### Tentang package-lock.json
Setiap kali `package.json` berubah (penambahan dependency), `package-lock.json` juga ikut diupdate. Pastikan kedua file masuk ke ZIP.

### Tentang .env.local
**JANGAN PERNAH** masukkan `.env.local` ke ZIP. Selalu sertakan `.env.example` saja.

### Tentang TypeScript errors setelah strict: true
Setelah fase 1 mengaktifkan strict mode, mungkin muncul TS error di berbagai file. Perbaiki semua sebelum lanjut ke fase berikutnya. Pattern umum yang perlu difix:
- `data?.field ?? defaultValue` untuk nullable
- Type guard untuk Firestore Timestamp vs plain object
- Return type explicit untuk fungsi async

### Tentang design tokens
Semua nilai warna, spacing, tipografi HARUS dari CSS custom properties (var(--c-*), var(--sp-*), var(--text-*), dll). Tidak boleh ada nilai hardcode baru. Nilai hardcode yang sudah ada di `PrintDHKP.tsx` (warna cetak) adalah exception justified karena konteks print.

### Versi saat masuk ke proses fix
- Apps version: dhkp-desa-fixed.zip (post-Session 5) → post-Fase1: dhkp-desa-fase1.zip
- Next.js: ^16.2.4
- React: ^19.2.4
- Firebase: ^10.14.1
- TypeScript: ^5.9.3
- Tailwind: ^4.2.4

---

## STATUS UPDATE LOG

| Fase | Tanggal Mulai | Tanggal Selesai | Dikerjakan oleh |
|------|--------------|-----------------|-----------------|
| Fase 1 | 2026-05-03 | 2026-05-03 | Claude (Sonnet 4.6) |
| Fase 2 | 2026-05-03 | 2026-05-03 | Claude (Sonnet 4.6) |
| Fase 3 | 2026-05-04 | 2026-05-04 | Claude (Sonnet 4.6) |
| Fase 4 | 2026-05-04 | 2026-05-04 | Claude (Sonnet 4.6) |
