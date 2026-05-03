# DHKP Desa Karang Sengon

Aplikasi web pengelolaan **Daftar Himpunan Ketetapan Pajak (DHKP)** untuk Desa Karang Sengon, Kecamatan Klabang, Kabupaten Bondowoso.

Dibangun sebagai Progressive Web App (PWA) berbasis Next.js + Firebase, dirancang untuk perangkat desa termasuk pengguna lanjut usia — aksesibilitas dan kemudahan penggunaan adalah prioritas utama.

---

## Fitur Utama

- **Data DHKP** — Kelola data wajib pajak bumi dan bangunan (PBB-P2) per tahun, lengkap dengan status lunas/belum.
- **Rekap** — Ringkasan statistik pembayaran: jumlah lunas, belum lunas, total pajak terhutang.
- **Ekspor/Impor Excel** — Ekspor data ke XLSX (format resmi DHKP + riwayat perubahan); impor dari file Excel dengan validasi & preview.
- **Riwayat Perubahan** — Log audit setiap perubahan data dengan nama petugas dan waktu.
- **Pengaturan** — Informasi desa (nama, kecamatan, logo kiri/kanan), kunci data global, manajemen akun.
- **Global Lock** — Admin dapat mengunci data agar tidak bisa diedit perangkat lain.
- **PWA** — Dapat diinstal di perangkat mobile, service worker network-first.
- **Dark Mode** — Dukungan tema gelap/terang.

---

## Tech Stack

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| Next.js | ^16.2.4 | App Router, React Server Components |
| React | ^19.2.4 | |
| TypeScript | ^5.9.3 | strict mode aktif |
| Tailwind CSS | ^4.2.4 | Design tokens di `globals.css` |
| Firebase | ^10.14.1 | Firestore (data) + Auth (login) |
| Lucide React | ^0.400.0 | Ikon |
| XLSX (SheetJS) | ^0.18.5 | Ekspor/impor Excel |
| Zod | ^3.23.8 | Validasi form & env vars |
| Sentry | ^10.x | Error monitoring (opsional) |
| Vitest | ^4.x | Unit testing |

---

## Setup Lokal

### Prasyarat

- Node.js 18+
- npm 9+
- Akun Firebase dengan project aktif

### Langkah

1. **Clone repository**
   ```bash
   git clone https://github.com/karangsengon-03/dhkp-desa.git
   cd dhkp-desa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Buat file `.env.local`** dari template:
   ```bash
   cp .env.example .env.local
   ```
   Isi semua nilai Firebase di `.env.local`. Lihat bagian [Konfigurasi Firebase](#konfigurasi-firebase).

4. **Jalankan development server**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000).

### Konfigurasi Firebase

Buka [Firebase Console](https://console.firebase.google.com) → Project Settings → Web App → Firebase SDK snippet.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nama-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nama-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nama-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

Aktifkan di Firebase Console:
- **Authentication** → Sign-in method → Email/Password
- **Firestore Database** → Buat database (mode production)

### Konfigurasi Sentry (Opsional)

Untuk error monitoring di production:
1. Buat project di [sentry.io](https://sentry.io)
2. Tambahkan ke `.env.local`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

---

## Struktur Folder

```
app/                    # Next.js App Router pages
├── dashboard/          # Beranda & statistik ringkasan
├── data/               # Tabel data DHKP + CRUD
├── export-import/      # Ekspor/impor Excel
├── pengaturan/         # Pengaturan desa & akun
├── rekap/              # Rekap lunas/belum
├── riwayat/            # Riwayat perubahan
├── login/              # Halaman login
├── error.tsx           # Error boundary global
├── not-found.tsx       # Halaman 404
├── offline/            # Halaman offline (PWA)
└── globals.css         # Design tokens & CSS global

components/
├── dhkp/               # Komponen spesifik DHKP (modal, tabel, form)
├── export-import/      # Seksi ekspor & impor
├── layout/             # AppShell, Header, Sidebar
├── pengaturan/         # Seksi-seksi halaman pengaturan
├── print/              # Template cetak DHKP & rekap
└── ui/                 # Komponen UI generik (Button, Modal, Toast, dll.)

hooks/                  # React hooks (useAuth, useDHKP, useGlobalLock, useTheme)
lib/                    # Utilitas & integrasi (auth, firestore, format, masking, env)
types/                  # TypeScript interfaces, Zod schemas, type declarations
public/                 # Assets statis, manifest PWA, service worker, ikon
```

---

## Scripts

```bash
npm run dev       # Development server (Turbopack)
npm run build     # Build production
npm run start     # Jalankan production build lokal
npm run lint      # ESLint check
npm test          # Unit tests (Vitest)
npm run coverage  # Test coverage report
```

---

## Deploy

### Via Vercel (Auto-deploy)

Repository terhubung ke Vercel dengan auto-deploy dari branch `main`:

1. Push ke `main` → Vercel otomatis build & deploy
2. Pastikan **Environment Variables** sudah diisi di Vercel Dashboard (Project → Settings → Environment Variables)
3. URL production: [https://dhkp-desa.vercel.app](https://dhkp-desa.vercel.app)

### Manual (Windows)

```bat
deploy.bat
```

Script ini menjalankan `git add`, `git commit`, dan `git push` ke GitHub, yang kemudian memicu auto-deploy Vercel.

---

## Catatan Keamanan

- **Jangan commit `.env.local`** — sudah ada di `.gitignore`
- NOP (Nomor Objek Pajak) dan Nomor Induk di-mask di tampilan tabel — hanya tampil sebagian
- Firestore security rules harus dikonfigurasi di Firebase Console untuk membatasi akses berdasarkan UID
- Password tidak pernah disimpan di localStorage — hanya Firebase Auth token

---

## Kontributor

- **Angga** — Developer utama
- **Riski** — Sekretaris Desa, pengujian & masukan

---

## Lisensi

Proprietary — Pemerintah Desa Karang Sengon, Kecamatan Klabang, Kabupaten Bondowoso.
