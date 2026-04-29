# BLUEPRINT DHKP Desa — FINAL (Sesi 5)

> Project ini SELESAI. Semua fitur sudah diimplementasi.
> Gunakan file ini sebagai referensi jika ada maintenance di masa depan.

---

## Identitas Project

| Item | Detail |
|---|---|
| Nama App | DHKP Desa Karang Sengon |
| GitHub Repo | `karangsengon-03/dhkp-desa` |
| Deploy | Vercel (auto dari GitHub push ke `main`) |
| Firebase Project | `dhkp-desa` |
| Stack | Next.js 16.2.4 · TypeScript · Tailwind v4 · Firebase 10 |

---

## Firebase Config

```ts
const firebaseConfig = {
  apiKey: "AIzaSyBylx5wlya1EWcH8NXBSjET7s2_PYCP3AU",
  authDomain: "dhkp-desa.firebaseapp.com",
  projectId: "dhkp-desa",
  storageBucket: "dhkp-desa.firebasestorage.app",
  messagingSenderId: "370358546818",
  appId: "1:370358546818:web:b013b175c91573a8529f9b"
};
```

Tersimpan di `.env.local` via `NEXT_PUBLIC_FIREBASE_*`.  
Di Vercel: Settings → Environment Variables.

---

## Struktur Firestore

```
dhkp/
  {tahun}/           ← string tahun, misal "2025"
    records/
      {id}/          ← DHKPRecord

settings/
  globalLock         ← { isLocked, lockedBy, lockedAt }
  appInfo            ← { kecamatan, desaKelurahan, tempatPembayaran, propinsi, kotaKab, logoKiri, logoKanan }

changelog/
  {id}/              ← ChangelogEntry
```

---

## Struktur File Lengkap

```
dhkp-desa/
├── app/
│   ├── layout.tsx              ✅
│   ├── globals.css             ✅ Design system
│   ├── favicon.ico             ✅ Multi-size (16/32/48)
│   ├── page.tsx                ✅ redirect → /login
│   ├── login/page.tsx          ✅
│   ├── dashboard/page.tsx      ✅
│   ├── data/page.tsx           ✅
│   ├── rekap/page.tsx          ✅
│   ├── riwayat/page.tsx        ✅
│   ├── export-import/page.tsx  ✅
│   └── pengaturan/page.tsx     ✅
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        ✅
│   │   ├── Header.tsx          ✅
│   │   └── Sidebar.tsx         ✅
│   ├── ui/
│   │   ├── Button.tsx          ✅
│   │   ├── Card.tsx            ✅
│   │   ├── Input.tsx           ✅
│   │   ├── Badge.tsx           ✅
│   │   ├── Toggle.tsx          ✅
│   │   ├── Modal.tsx           ✅
│   │   └── Toast.tsx           ✅
│   ├── dhkp/
│   │   ├── LockBanner.tsx      ✅
│   │   ├── RecordTable.tsx     ✅
│   │   ├── RecordModal.tsx     ✅
│   │   ├── DeleteConfirmModal.tsx ✅
│   │   └── ImportPreviewModal.tsx ✅
│   └── print/
│       └── PrintRekapHeader.tsx ✅
│
├── hooks/
│   ├── useAuth.ts              ✅
│   ├── useDHKP.ts              ✅
│   ├── useGlobalLock.ts        ✅
│   └── useTheme.ts             ✅
│
├── lib/
│   ├── firebase.ts             ✅
│   ├── auth.ts                 ✅
│   ├── firestore.ts            ✅
│   ├── changelog.ts            ✅
│   └── format.ts               ✅
│
├── public/
│   ├── manifest.json           ✅ PWA manifest
│   ├── sw.js                   ✅ Service Worker
│   ├── favicon-32x32.png       ✅
│   ├── apple-touch-icon.png    ✅ 180x180
│   └── icons/
│       ├── icon-72.png  ... icon-512.png   ✅ 8 ukuran
│
├── types/index.ts              ✅
├── vercel.json                 ✅ Vercel config + cache headers
├── next.config.ts              ✅ PWA + SSR (tidak pakai output:export)
└── .env.local                  ✅
```

---

## Design System

**Color Palette:**

| Token | Light | Dark |
|---|---|---|
| `--color-primary` | `#1E3A5F` (Deep Navy) | `#4A7AB5` |
| `--color-gold` | `#C9A227` | `#D4AF37` |
| `--color-bg` | `#F5F3EE` | `#0F1923` |
| `--color-surface` | `#FFFFFF` | `#1A2535` |
| `--color-success` | `#2E7D32` | `#4CAF50` |
| `--color-danger` | `#C62828` | `#EF5350` |

**Font:** Plus Jakarta Sans (Google Fonts)

---

## Cara Deploy

### Pertama kali:
1. Push semua file ke `https://github.com/karangsengon-03/dhkp-desa`
2. Buka vercel.com → Add New Project → Import repo `karangsengon-03/dhkp-desa`
3. Tambahkan semua `NEXT_PUBLIC_FIREBASE_*` di Environment Variables
4. Klik Deploy

### Selanjutnya:
Setiap `git push` ke branch `main` → Vercel auto build + deploy otomatis.

---

## Quirks & Solusi Penting

| Masalah | Solusi |
|---|---|
| Firebase 12 `.d.ts` | `types/firebase.d.ts` → `declare module 'firebase/*'` |
| Next 16 Turbopack + next-pwa | `turbopack: {}` di root NextConfig |
| next-pwa lama (5.x) | Pakai `@ducanh2912/next-pwa` v10 |
| Tailwind v4 postcss | Plugin key: `@tailwindcss/postcss` |
| TypeScript strict | `strict: false`, `skipLibCheck: true` |
| Modal prop | `open` bukan `isOpen` |
| `useToast` | `showToast(msg, 'success'/'danger'/'warning'/'info')` |

---

## Status Sesi — SELESAI ✅

| Sesi | Isi |
|---|---|
| Sesi 1 | Setup, Auth, Layout, Design System, Dashboard, Login, semua UI components |
| Sesi 2 | Halaman Data DHKP — CRUD, toggle lunas, lock guard, search, filter |
| Sesi 3 | Rekap & Statistik + Riwayat Perubahan + Print |
| Sesi 4 | Export/Import XLSX + Pengaturan (AppInfo + Lock + Logo) |
| Sesi 5 | Icons/Favicon baru, vercel.json, manifest.json final, README, packaging |
