# DHKP Desa Karang Sengon

**Daftar Himpunan Ketetapan Pajak & Pembayaran**  
Aplikasi manajemen data pajak bumi dan bangunan (PBB) tingkat desa.

---

## Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS v4
- **Backend**: Firebase (Authentication + Firestore)
- **Deploy**: Vercel (auto-deploy via GitHub)
- **PWA**: @ducanh2912/next-pwa

---

## Fitur

| Halaman | Keterangan |
|---|---|
| Login | Firebase Auth (email + password) |
| Dashboard | Statistik ringkas, akses cepat |
| Data DHKP | CRUD lengkap, toggle lunas, search & filter |
| Rekap | Statistik per tahun, per petugas, print |
| Riwayat | Log semua perubahan data |
| Export/Import | Export XLSX data & riwayat, Import batch dari XLSX |
| Pengaturan | Info desa, upload logo, Global Lock |

---

## Setup & Development

### 1. Clone & Install

```bash
git clone https://github.com/karangsengon-03/dhkp-desa.git
cd dhkp-desa
npm install
```

### 2. Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> Di Vercel: tambahkan semua variable ini di **Settings → Environment Variables**.

### 3. Development

```bash
npm run dev
```

### 4. Build

```bash
npm run build
```

---

## Deploy ke Vercel

1. Push ke GitHub: `https://github.com/karangsengon-03/dhkp-desa`
2. Buka [vercel.com](https://vercel.com) → **Add New Project** → Import repo
3. Tambahkan semua `NEXT_PUBLIC_FIREBASE_*` di Environment Variables
4. Klik **Deploy**

Selanjutnya setiap `git push` ke branch `main` akan auto-deploy.

---

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null
        && request.auth.uid in [
          'UID_ANGGA_DISINI',
          'UID_PETUGAS_LAIN'
        ];
    }
  }
}
```

---

## Lisensi

Internal use — Desa Karang Sengon © 2025
