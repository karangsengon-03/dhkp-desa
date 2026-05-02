# README-DHKP-DESA.md
# DHKP Desa Karang Sengon — Master Document

> **Versi Dokumen:** 1.0.0
> **Terakhir Diperbarui:** Fase 5 — Audit Final & Deploy Prep ✅ Selesai
> **Status Proyek:** Fase 5 — Audit Final & Deploy Prep ✅ Selesai

---

## DAFTAR ISI

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Design System](#3-design-system)
4. [Spesifikasi Komponen](#4-spesifikasi-komponen)
5. [Struktur File](#5-struktur-file)
6. [Aturan Wajib (Non-Negotiable)](#6-aturan-wajib-non-negotiable)
7. [Rencana Fase Eksekusi](#7-rencana-fase-eksekusi)
8. [Log Perubahan Per Fase](#8-log-perubahan-per-fase)
9. [Panduan Deploy](#9-panduan-deploy)
10. [Panduan Import Data 702 Record](#10-panduan-import-data-702-record)
11. [Known Issues & Catatan Teknis](#11-known-issues--catatan-teknis)

---

## 1. PROJECT OVERVIEW

**Nama Aplikasi:** DHKP Desa Karang Sengon
**Kepanjangan:** Daftar Himpunan Ketetapan Pajak & Pembayaran
**Lokasi:** Desa Karang Sengon, Kec. Klabang, Kab. Bondowoso, Jawa Timur
**Tahun Data:** 2026 ke atas (tidak ada data sebelum 2026)
**Total Objek Pajak:** 702 record (tahun 2026)

**Tujuan Aplikasi:**
Mengelola data Pajak Bumi dan Bangunan (PBB-P2) tingkat desa — pencatatan wajib pajak, status pembayaran, rekap, cetak, dan ekspor data — secara digital menggantikan buku fisik DHKP.

**URL Produksi:** Deploy via GitHub → Vercel (auto-deploy)
**Firebase Project:** `dhkp-desa` (Firestore + Auth)

**Nama di UI:**
- Header baris 1: `DHKP` (bold)
- Header baris 2: `Desa Karang Sengon`
- Sidebar baris 1: `DHKP`
- Sidebar baris 2: `Desa`
- Tab browser / PWA title: `DHKP Desa Karang Sengon`
- Splash screen: tidak ada, pakai loading skeleton

---

## 2. TECH STACK

| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Framework | Next.js (App Router) | ^15.x |
| UI Language | TypeScript + React | ^18.x |
| Styling | Tailwind CSS + CSS Variables | ^3.x |
| Font | Plus Jakarta Sans (next/font/google) | — |
| Icon | Lucide React (100% — zero emoji) | ^0.400.0 |
| Database | Firebase Firestore | ^10.x |
| Auth | Firebase Authentication | ^10.x |
| Export/Import | SheetJS (xlsx) | ^0.18.x |
| PWA | Custom sw.js + next.config.ts | — |
| Deploy | Vercel (via GitHub auto-deploy) | — |

**Catatan penting:**
- TIDAK menggunakan next-pwa — service worker dikelola manual via `public/sw.js` + `next.config.ts`
- TIDAK ada library UI eksternal (MUI, shadcn, dll) — semua komponen custom
- TIDAK ada emoji di seluruh aplikasi — 100% Lucide React icons

---

## 3. DESIGN SYSTEM

### 3.1 Prinsip Desain
- **Government/Official** — formal, rapi, dokumen-like, bukan consumer app
- **Mobile-first** — didesain untuk 375px, scale up ke desktop
- **Elegan & Premium** — kesan resmi, tidak murahan
- **Aksesibel** — kontras tinggi, touch target minimum 44×44px, readable untuk orangtua

### 3.2 Sidebar Behavior
- Selalu hamburger di semua ukuran layar (mobile & desktop)
- Klik hamburger → sidebar slide dari kiri (overlay)
- Klik menu item → sidebar auto-close
- Klik area luar sidebar → sidebar auto-close
- Tidak ada persistent sidebar, tidak ada bottom navigation

### 3.3 Color Tokens

#### Light Mode
```css
/* Brand */
--c-navy:          #1E3A5F   /* primary action, header sidebar bg */
--c-navy-dark:     #152A45   /* hover state */
--c-navy-light:    #EBF0F7   /* bg aksen ringan, selected state */
--c-navy-mid:      #2D5080   /* secondary navy, border aksen */
--c-gold:          #C9A227   /* aksen premium, badge, tombol sekunder */
--c-gold-dark:     #A68420   /* hover gold */
--c-gold-light:    #FBF4E0   /* bg ringan aksen gold */

/* Semantic */
--c-success:       #2E7D32
--c-success-light: #E8F5E9
--c-danger:        #C62828
--c-danger-light:  #FFEBEE
--c-warning:       #BF6000
--c-warning-light: #FFF3E0

/* Surface */
--c-bg:            #F4F1EC   /* background halaman, off-white hangat */
--c-surface:       #FFFFFF   /* card, modal, input */
--c-surface-2:     #F9F7F3   /* alternate row tabel, hover row */
--c-surface-3:     #F0EDE7   /* disabled state bg */
--c-border:        #DDD8CE   /* border umum */
--c-border-strong: #C8C2B6   /* border input, divider kuat */

/* Text */
--c-text-1:        #1A1A1A   /* heading, label penting */
--c-text-2:        #4A4A4A   /* body teks utama */
--c-text-3:        #6E6E6E   /* secondary, placeholder label */
--c-text-4:        #A0A0A0   /* disabled, hint, timestamp */
--c-text-inv:      #FFFFFF   /* teks di atas background gelap */

/* Shadow */
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05)
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
--shadow-md: 0 4px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)
--shadow-lg: 0 8px 16px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)
```

#### Dark Mode (`[data-theme="dark"]`)
```css
--c-navy:          #5B8EC9
--c-navy-dark:     #4A7AB5
--c-navy-light:    #0F1D2E
--c-navy-mid:      #3A6090
--c-gold:          #D4AF37
--c-gold-dark:     #B8982E
--c-gold-light:    #1E1600

--c-success:       #4CAF50
--c-success-light: #071A08
--c-danger:        #EF5350
--c-danger-light:  #1A0505
--c-warning:       #FF8F00
--c-warning-light: #1A0E00

--c-bg:            #0C1520
--c-surface:       #14202E
--c-surface-2:     #1A2838
--c-surface-3:     #0F1928
--c-border:        #243040
--c-border-strong: #2E3E50

--c-text-1:        #EDF0F4
--c-text-2:        #B8C4D0
--c-text-3:        #7A8FA0
--c-text-4:        #4A5E70
--c-text-inv:      #0C1520

--shadow-xs: 0 1px 2px rgba(0,0,0,0.30)
--shadow-sm: 0 1px 3px rgba(0,0,0,0.40)
--shadow-md: 0 4px 8px rgba(0,0,0,0.50)
--shadow-lg: 0 8px 16px rgba(0,0,0,0.60)
```

### 3.4 Spacing Tokens (kelipatan 4px — TIDAK boleh ada nilai lain)
```css
--sp-1:  4px
--sp-2:  8px
--sp-3:  12px
--sp-4:  16px
--sp-5:  20px
--sp-6:  24px
--sp-8:  32px
--sp-10: 40px
--sp-12: 48px
```

### 3.5 Typography Tokens (HANYA 5 ukuran — tidak boleh ada nilai lain)
```css
--text-xs:   12px   /* caption, label kecil, timestamp, badge */
--text-sm:   13px   /* label form, teks tabel, nav item */
--text-base: 14px   /* body utama, konten umum */
--text-lg:   16px   /* judul section, heading card */
--text-xl:   18px   /* judul halaman (hanya 1x per halaman, di page header) */
```

**Font Weight (hanya 4 nilai):**
- `400` — body teks biasa
- `500` — label, secondary info
- `600` — emphasis, sub-heading
- `700` — heading utama, nilai penting

### 3.6 Border Radius Tokens (HANYA 5 nilai)
```css
--radius-xs:   2px      /* tag mini, divider accent */
--radius-sm:   4px      /* button, input, badge, chip */
--radius-md:   6px      /* card, dropdown, tooltip */
--radius-lg:   8px      /* modal, bottom sheet */
--radius-full: 9999px   /* avatar, toggle, pill */
```

### 3.7 Icon Size Tokens (HANYA 3 nilai)
```css
--icon-sm: 14px   /* inline dalam teks, badge icon */
--icon-md: 16px   /* dalam button, dalam input */
--icon-lg: 18px   /* navigasi sidebar, header action */
```

### 3.8 Touch Target
```css
--touch-min: 44px   /* minimum untuk SEMUA elemen interaktif di mobile */
```

### 3.9 Layout Tokens
```css
--header-height-mobile:  52px
--header-height-desktop: 56px
--sidebar-width:         260px
--content-pad-mobile:    16px
--content-pad-tablet:    20px
--content-pad-desktop:   24px
--content-max-width:     1280px
```

---

## 4. SPESIFIKASI KOMPONEN

### 4.1 Header
```
Height: 52px mobile / 56px desktop
Background: var(--c-surface) — putih/terang, border-bottom 1px c-border
Shadow: shadow-sm

Kiri:
  - Hamburger button: 44×44px touch target, icon 18px, warna c-navy
  - Brand: "DHKP" 14px w-700 c-navy | "Desa Karang Sengon" 12px w-500 c-text-3

Kanan (kiri ke kanan):
  - Kunci Global button: 32px height, padding 0 10px, rounded sm
      Terkunci: bg c-danger-light, border c-danger, text c-danger, icon Lock 14px
      Terbuka: bg c-success-light, border c-success, text c-success, icon Unlock 14px
      Label: "Terkunci" / "Terbuka" — sembunyikan di < 480px
  - Theme toggle: 44×44px, icon Sun/Moon 18px
  - Avatar: 28×28px lingkaran, bg c-navy, text white 12px w-700, initial nama
```

### 4.2 Sidebar
```
Width: 260px
Background: c-navy (tetap navy di dark mode)
Overlay backdrop: rgba(0,0,0,0.45) blur 2px
Animation: slide kiri 200ms ease-out, overlay fade 200ms

Header Sidebar:
  - Row: padding 16px, border-bottom 1px rgba(255,255,255,0.1)
  - Baris 1: "DHKP" 16px w-700 white
  - Baris 2: "Desa" 12px w-400 rgba(255,255,255,0.6)
  - Tombol X tutup: pojok kanan, 44×44px, icon X 18px white

Nav Items:
  - Height: 44px, padding 0 14px, gap 10px
  - Font: 14px w-500 rgba(255,255,255,0.75)
  - Icon: 18px, warna sama dengan teks
  - Hover: bg rgba(255,255,255,0.08), teks white w-600
  - Active: border-left 3px solid c-gold, bg rgba(255,255,255,0.12)
            teks white w-700, icon warna c-gold

Divider sebelum Keluar: 1px solid rgba(255,255,255,0.1)

Footer Sidebar:
  - Nama user: 12px w-500 rgba(255,255,255,0.5), truncate
  - Tombol Keluar: nav-item style, icon LogOut 18px, text c-danger-light
```

### 4.3 Button
```
Border-radius: var(--radius-sm) = 4px
Font: 14px w-600
Transition: 150ms ease
Touch target minimum: 44px height untuk size md/lg

Sizes:
  sm:  height 32px, padding 0 12px, font 13px, icon 14px
  md:  height 40px, padding 0 16px, font 14px, icon 16px
  lg:  height 44px, padding 0 20px, font 14px, icon 16px

Variants:
  primary:   bg c-navy, text white, border c-navy
             hover: bg c-navy-dark, shadow-sm, translateY(-1px)
  secondary: bg c-gold, text white, border c-gold
             hover: bg c-gold-dark, shadow-sm, translateY(-1px)
  danger:    bg c-danger, text white, border c-danger
             hover: opacity 0.88, shadow-sm
  ghost:     bg transparent, text c-text-2, border c-border-strong
             hover: bg c-navy-light, border c-navy, text c-navy
  disabled:  opacity 0.45, cursor not-allowed (semua variant)

Loading state: spinner inline 16px + teks "Memuat..."
```

### 4.4 Input
```
Height: 40px
Padding: 0 12px
Font: 14px w-400 c-text-2
Border: 1.5px solid c-border, radius var(--radius-sm) = 4px
Background: c-surface
Transition: 150ms

Focus: border c-navy, box-shadow 0 0 0 2px c-navy-light
Placeholder: c-text-4
Disabled: bg c-surface-3, opacity 0.65, cursor not-allowed
Error: border c-danger, teks error 12px c-danger di bawah

Label: 12px w-600 c-text-3, margin-bottom 6px, display block
```

### 4.5 Card
```
Background: c-surface
Border: 1px solid c-border
Border-radius: var(--radius-md) = 6px
Padding default: 16px
Shadow: shadow-xs
```

### 4.6 Badge
```
Height: 20px
Padding: 0 8px
Font: 12px w-600
Border-radius: var(--radius-sm) = 4px  ← bukan pill/rounded-full
Gap icon-teks: 4px

Variants:
  success: bg c-success-light, text c-success
  danger:  bg c-danger-light,  text c-danger
  warning: bg c-warning-light, text c-warning
  info:    bg c-navy-light,    text c-navy
  default: bg c-surface-3,    text c-text-3
```

### 4.7 Toggle
```
Width: 40px, Height: 24px
Border-radius: radius-full
Touch target: 44×44px (padding kompensasi sekitar toggle)
Transition: 200ms ease

ON:  bg c-navy, thumb white
OFF: bg c-border-strong, thumb white
Disabled: opacity 0.45
```

### 4.8 Modal
```
Backdrop: rgba(0,0,0,0.45) blur 2px
Container: bg c-surface, border-radius radius-lg = 8px
           shadow-lg, max-width 480px, margin auto, padding 24px
Animation: fade + scale 0.96→1.00, 150ms ease-out
Header: judul 16px w-700 c-text-1, tombol X pojok kanan 44×44px
Footer: flex row, gap 8px, justify-end, button Cancel (ghost) + button Aksi (primary/danger)
```

### 4.9 Toast
```
Posisi: pojok kanan bawah, margin 16px
Width: max 360px, min 240px
Border-radius: radius-md = 6px
Shadow: shadow-md
Durasi default: 3000ms, auto dismiss
Animation: slide dari kanan + fade in/out

Variants (border-left 3px):
  success: bg c-surface, border c-success, icon CheckCircle c-success
  danger:  bg c-surface, border c-danger,  icon XCircle c-danger
  warning: bg c-surface, border c-warning, icon AlertTriangle c-warning
  info:    bg c-surface, border c-navy,    icon Info c-navy
```

### 4.10 Tabel DHKP
```
Satu mode: font 13px, row height 44px
Pagination: 20 record per halaman
Scroll: horizontal scroll dengan momentum (-webkit-overflow-scrolling: touch)

Kolom (urutan final, kiri ke kanan):
  No | NOP | No. Induk | Nama WP | Alamat Objek |
  Pajak Terhutang | Perubahan Pajak | Tgl Bayar |
  Luas Tanah | Luas Bgn | Dikelola Oleh | Status | Aksi

Sticky: kolom "No" sticky-left, kolom "Aksi" sticky-right

Header row:
  Background: c-navy, text white
  Font: 12px w-700 uppercase, letter-spacing 0.03em
  Height: 40px, padding 0 12px
  Border-right antar kolom: 1px rgba(255,255,255,0.08)

Data rows:
  Height: 44px, padding 0 12px
  Font: 13px w-400 c-text-2
  Border-bottom: 1px c-border
  Baris ganjil: bg c-surface
  Baris genap: bg c-surface-2 (alternate, sangat tipis bedanya)
  Hover: bg c-navy-light
  Lunas row: bg c-success-light
  Angka/NOP: font-variant-numeric tabular-nums, text-align right

Kolom Status:
  Lunas:       icon CheckCircle 14px c-success + badge "Lunas" success
  Belum Lunas: icon Minus 14px c-text-4 + badge "Belum" default

Kolom Aksi:
  Icon button Edit:  28×28px touch (+ padding), icon Pencil 14px c-navy
  Icon button Hapus: 28×28px touch (+ padding), icon Trash2 14px c-danger
  Disabled (terkunci): opacity 0.35, cursor not-allowed

Footer tabel (per halaman — ikuti dokumen asli):
  "Total Halaman Ini"             | angka pajak bold, bg c-surface-2
  "Total Sampai Dengan Halaman Ini" | angka pajak bold, bg c-surface-3

Pagination:
  Posisi: bawah tabel
  Info: "Halaman X dari Y · Z record"
  Tombol: First ‹‹ | Prev ‹ | [1][2][3]...[N] | Next › | Last ››
  Nomor aktif: bg c-navy, text white
  Nomor lain: bg c-surface, text c-text-2, border c-border

Nomor urut kolom No:
  Mengikuti pagination — halaman 2 mulai dari 21, dst
  Formula: ((currentPage - 1) * 20) + index + 1
```

### 4.11 Stat Card (Dashboard)
```
Padding: 14px
Border-radius: radius-md = 6px
Border: 1px c-border
Shadow: shadow-xs
Hover: shadow-sm + translateY(-1px), transition 150ms

Icon box: 36×36px, border-radius radius-md
Value: 18px w-700 c-text-1
Sub (opsional): 12px w-500 warna sesuai konteks
Label: 12px w-500 c-text-3
```

### 4.12 Format Angka (konsisten di seluruh aplikasi)
```
Pajak Terhutang di tabel:    tanpa "Rp", titik pemisah ribuan   → 316.602
Pajak di dashboard card:     dengan "Rp"                        → Rp 38.233.478
Pajak di cetak/print:        tanpa "Rp", ikuti dokumen asli     → 316.602
Luas Tanah/Bangunan:         angka + " m²"                      → 9.020 m²
Footer total tabel:          tanpa "Rp", bold                   → 2.829.006
Perubahan Pajak = 0:         tampil "0" bukan "-"
Perubahan Pajak kosong:      tampil "-"
```

### 4.13 Animasi & Transisi
```
Halaman masuk:    fade + translateY(6px→0), 180ms ease-out
Button hover:     translateY(-1px), 150ms ease
Button active:    translateY(0), 100ms ease
Modal buka:       fade + scale(0.96→1.00), 150ms ease-out
Modal tutup:      fade + scale(1.00→0.96), 120ms ease-in
Sidebar buka:     translateX(-260px→0), 200ms ease-out
Sidebar tutup:    translateX(0→-260px), 180ms ease-in
Toggle:           200ms ease
Toast masuk:      translateX(100%→0) + fade, 220ms ease-out
Toast keluar:     translateX(0→100%) + fade, 180ms ease-in
Semua transition: hardware accelerated (transform/opacity only)
```

---

## 5. STRUKTUR FILE

```
dhkp-desa/
├── README-DHKP-DESA.md          ← dokumen ini (master, selalu diupdate)
├── .env.local                   ← Firebase config (tidak di-commit)
├── next.config.ts               ← konfigurasi Next.js + SW headers
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── vercel.json
│
├── public/
│   ├── sw.js                    ← service worker manual (auto-update)
│   ├── manifest.json            ← PWA manifest
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   └── icons/
│       ├── icon-72.png
│       ├── icon-96.png
│       ├── icon-128.png
│       ├── icon-144.png
│       ├── icon-152.png
│       ├── icon-192.png
│       ├── icon-384.png
│       └── icon-512.png
│
├── app/
│   ├── globals.css              ← SATU-SATUNYA sumber design tokens
│   ├── layout.tsx               ← root layout, font, meta, ToastProvider
│   ├── page.tsx                 ← redirect ke /dashboard
│   ├── favicon.ico
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── data/page.tsx
│   ├── rekap/page.tsx
│   ├── riwayat/page.tsx
│   ├── export-import/page.tsx
│   └── pengaturan/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         ← wrapper halaman, skeleton, auth guard
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Toggle.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── dhkp/
│   │   ├── RecordTable.tsx
│   │   ├── RecordModal.tsx
│   │   ├── LockBanner.tsx
│   │   ├── DeleteConfirmModal.tsx
│   │   └── ImportPreviewModal.tsx
│   └── print/
│       ├── PrintDHKP.tsx        ← format mirip dokumen pemda asli
│       └── PrintRekapHeader.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useDHKP.ts
│   ├── useGlobalLock.ts
│   └── useTheme.ts
│
├── lib/
│   ├── firebase.ts              ← init Firebase app
│   ├── auth.ts                  ← login, logout, saveUser, getSavedUser
│   ├── firestore.ts             ← semua CRUD Firestore
│   ├── changelog.ts             ← logChange, getChangelog
│   └── format.ts                ← formatRupiah, formatTanggal, todayISO
│
└── types/
    ├── index.ts                 ← DHKPRecord, AppInfo, GlobalLock, ChangelogEntry
    ├── firebase.d.ts
    └── lucide.d.ts
```

---

## 6. ATURAN WAJIB (NON-NEGOTIABLE)

Aturan ini berlaku untuk SELURUH fase dan SELURUH file. Pelanggaran harus diperbaiki sebelum fase selesai.

```
RULE-01: ZERO hardcode warna — semua pakai var(--c-*)
RULE-02: ZERO hardcode font-size — semua pakai var(--text-*)
RULE-03: ZERO hardcode spacing di luar token — pakai var(--sp-*) atau Tailwind kelipatan 4
RULE-04: ZERO emoji — 100% Lucide React icons
RULE-05: ZERO inline style kecuali nilai dinamis dari JavaScript
RULE-06: Semua elemen interaktif: minimum touch target 44×44px
RULE-07: Semua warna harus kontras minimum WCAG AA (4.5:1 untuk teks normal)
RULE-08: Dark mode: SEMUA var(--c-*) harus ada definisi di [data-theme="dark"]
RULE-09: Tidak ada library UI eksternal (MUI, shadcn, Radix, dll)
RULE-10: Semua import icon dari 'lucide-react' — tidak ada SVG inline manual
RULE-11: Tidak ada next-pwa — service worker via sw.js manual
RULE-12: Font hanya dari next/font/google di layout.tsx — tidak ada @import di CSS
RULE-13: Angka pajak di tabel: tanpa "Rp", format titik ribuan Indonesia
RULE-14: Nomor baris tabel mengikuti pagination (halaman 2 mulai 21)
RULE-15: Semua komponen UI: gunakan komponen dari components/ui/ — tidak buat ulang inline
```

---

## 7. RENCANA FASE EKSEKUSI

### FASE 1 — Design System & Foundation
**Target:** Semua token, komponen UI, layout shell konsisten 100%

#### globals.css
- [ ] Tulis ulang total — semua token didefinisikan
- [ ] Color tokens light mode lengkap
- [ ] Color tokens dark mode lengkap
- [ ] Spacing tokens
- [ ] Typography tokens
- [ ] Border radius tokens
- [ ] Icon size tokens
- [ ] Shadow tokens
- [ ] Layout tokens (header height, sidebar width, dll)
- [ ] Base reset (*, html, body)
- [ ] Utility classes (.card, .btn, .input-field, .badge, .nav-item, dll)
- [ ] Animasi & transisi keyframes
- [ ] Scrollbar styling
- [ ] Print styles
- [ ] Skeleton animation

#### layout.tsx
- [ ] Font via next/font/google (Plus Jakarta Sans)
- [ ] Anti-flash theme script di <head>
- [ ] Meta tags lengkap
- [ ] Viewport meta

#### components/ui/Button.tsx
- [ ] Semua variant (primary, secondary, danger, ghost)
- [ ] Semua size (sm, md, lg)
- [ ] Loading state
- [ ] Disabled state
- [ ] Token konsisten

#### components/ui/Input.tsx
- [ ] Label + input + error message
- [ ] Focus state
- [ ] Disabled state
- [ ] Token konsisten

#### components/ui/Card.tsx
- [ ] Token konsisten
- [ ] Variant opsional (default, interactive)

#### components/ui/Badge.tsx
- [ ] Semua variant
- [ ] Border-radius 4px (bukan pill)
- [ ] Token konsisten

#### components/ui/Toggle.tsx
- [ ] Animasi smooth 200ms
- [ ] Touch target 44×44px
- [ ] ON/OFF state
- [ ] Disabled state

#### components/ui/Modal.tsx
- [ ] Backdrop blur
- [ ] Animasi buka/tutup
- [ ] Header + content + footer layout
- [ ] Tutup via backdrop click dan tombol X

#### components/ui/Toast.tsx
- [ ] Semua variant (success, danger, warning, info)
- [ ] Auto dismiss 3000ms
- [ ] Animasi slide kanan
- [ ] Stack multiple toasts

#### components/layout/Header.tsx
- [ ] Height 52px mobile / 56px desktop
- [ ] Background c-surface (bukan navy)
- [ ] Brand text dua baris
- [ ] Kunci Global button (realtime state dari Firestore)
- [ ] Theme toggle
- [ ] Avatar
- [ ] Touch target semua elemen ≥ 44px

#### components/layout/Sidebar.tsx
- [ ] Background c-navy
- [ ] Overlay backdrop blur
- [ ] Animasi slide 200ms
- [ ] Auto-close saat klik menu item
- [ ] Auto-close saat klik backdrop
- [ ] Nav items dengan active state (gold left border)
- [ ] Header (DHKP + Desa + tombol X)
- [ ] Footer (nama user + Keluar)
- [ ] Touch target semua ≥ 44px

#### components/layout/AppShell.tsx
- [ ] Skeleton loading yang mirip layout asli (bukan spinner)
- [ ] Auth guard (redirect ke /login jika tidak login)
- [ ] Layout wrapper
- [ ] useEffect untuk handle redirect

#### public/sw.js
- [ ] Cache versioning dengan hash build
- [ ] skipWaiting() + clients.claim()
- [ ] Broadcast channel ke halaman saat update tersedia
- [ ] Strategi cache: network-first untuk halaman, cache-first untuk assets statis

#### Komponen banner update
- [ ] UpdateBanner component
- [ ] Muncul saat SW mendeteksi versi baru
- [ ] Tombol "Muat Ulang" yang langsung reload
- [ ] Tidak blocking — banner di atas, konten tetap accessible

**Audit Fase 1:**
- [ ] Scan semua file Fase 1: tidak ada RULE-01 s.d. RULE-15 yang dilanggar
- [ ] Dark mode test: semua token ada
- [ ] Build test lokal (npm run build tidak error)

---

### FASE 2 — Halaman Utama
**Target:** Login, Dashboard, Data DHKP konsisten dengan design system

#### app/login/page.tsx
- [ ] Skeleton loading (bukan spinner)
- [ ] Brand header (navy + gold)
- [ ] Form: email + password + show/hide + checkbox ingat
- [ ] Simpan email DAN password ke localStorage saat login berhasil
- [ ] Prefill dari localStorage saat buka
- [ ] Validasi dan error message
- [ ] Government/official style
- [ ] Semua token konsisten

#### app/dashboard/page.tsx
- [ ] Page header dengan judul + dropdown tahun
- [ ] Lock banner (jika terkunci)
- [ ] 6 stat cards: Total Objek, Sudah Lunas, Belum Lunas, Persentase, Luas Tanah, Luas Bangunan
- [ ] 3 finance cards: Total Pajak, Total Dibayar, Total Tunggakan
- [ ] Progress bar pembayaran
- [ ] Status kunci data card
- [ ] Skeleton loading untuk semua card
- [ ] Semua token konsisten

#### app/data/page.tsx
- [ ] Page header + filter tahun + tombol Tambah
- [ ] Lock banner
- [ ] Badge filter: Semua / Lunas / Belum Lunas
- [ ] Search bar
- [ ] RecordTable dengan pagination
- [ ] Pagination controls
- [ ] Empty state (icon + teks + tombol jika tidak terkunci)
- [ ] Loading skeleton

#### components/dhkp/RecordTable.tsx
- [ ] 13 kolom sesuai urutan final
- [ ] Sticky kolom No (kiri) dan Aksi (kanan)
- [ ] Scroll horizontal momentum
- [ ] Header row navy
- [ ] Alternate row
- [ ] Hover row
- [ ] Lunas row (hijau muda)
- [ ] Kolom Status: icon + badge
- [ ] Kolom Aksi: Edit + Hapus icon button
- [ ] Footer: Total Halaman Ini + Total Sampai Dengan Halaman Ini
- [ ] Nomor urut mengikuti pagination
- [ ] Format angka: tanpa Rp, titik ribuan
- [ ] Disabled state saat terkunci

#### components/dhkp/RecordModal.tsx
- [ ] Form tambah/edit konsisten dengan design system
- [ ] Semua field: NOP, No Induk, Nama WP, Alamat, Pajak, Perubahan, Luas Tanah, Luas Bgn, Dikelola
- [ ] Validasi
- [ ] Loading state saat simpan

#### components/dhkp/DeleteConfirmModal.tsx
- [ ] Tampilkan nama WP yang dihapus
- [ ] Tombol Batal + Hapus
- [ ] Loading state

#### components/dhkp/LockBanner.tsx
- [ ] Konsisten dengan design system
- [ ] Tampil hanya jika terkunci

**Audit Fase 2:**
- [ ] Scan semua file Fase 2: tidak ada pelanggaran RULE-01 s.d. RULE-15
- [ ] Test pagination: nomor urut benar lintas halaman
- [ ] Test sticky kolom di mobile
- [ ] Build test lokal

---

### FASE 3 — Halaman Sekunder
**Target:** Rekap, Riwayat, Export-Import, Pengaturan

#### app/rekap/page.tsx
- [ ] Judul: "Rekap Lunas"
- [ ] Statistik per petugas (Dikelola Oleh)
- [ ] Tombol Cetak Rekap + Cetak Data DHKP
- [ ] Konsisten dengan design system

#### app/riwayat/page.tsx
- [ ] List changelog dengan filter tahun
- [ ] Format tanggal dan waktu
- [ ] Empty state
- [ ] Konsisten dengan design system

#### app/export-import/page.tsx
- [ ] Export Excel per tahun
- [ ] Import Excel dengan progress realtime
  - [ ] Progress bar: "X dari 702 berhasil diimpor"
  - [ ] Update per-record, realtime
  - [ ] Error handling per record
  - [ ] Tombol batalkan import
- [ ] Preview data sebelum import
- [ ] Konsisten dengan design system

#### app/pengaturan/page.tsx
- [ ] Section Akun & Keamanan (nama, email, reset password via email)
- [ ] Section Informasi Desa (propinsi, kota/kab, kecamatan, desa, tempat bayar)
- [ ] Section Logo (upload logo kiri + kanan, preview, hapus)
- [ ] Section Kunci Data Global (toggle + status + info dikunci oleh siapa)
- [ ] Section Backup (download semua tahun ke Excel multi-sheet)
- [ ] Section Info Aplikasi (versi, platform, nama desa)
- [ ] Semua section dengan section-header konsisten
- [ ] Konsisten dengan design system

#### components/dhkp/ImportPreviewModal.tsx
- [ ] Preview tabel data yang akan diimport
- [ ] Tombol Lanjutkan + Batal
- [ ] Konsisten dengan design system

**Audit Fase 3:**
- [ ] Scan semua file Fase 3: tidak ada pelanggaran
- [ ] Test import progress realtime
- [ ] Build test lokal

---

### FASE 4 — Print & Cetak
**Target:** Template cetak mirip dokumen DHKP pemda asli

#### components/print/PrintDHKP.tsx
- [ ] Layout landscape A4
- [ ] Header lembaga (logo kiri, nama lembaga center, logo kanan)
- [ ] Judul dokumen: DAFTAR HIMPUNAN KETETAPAN PAJAK & PEMBAYARAN BUKU 1,2,3
- [ ] Info: Tempat Bayar, Propinsi, Kota/Kab, Kecamatan, Kelurahan
- [ ] Tabel 11 kolom sesuai dokumen asli
- [ ] 20 baris per halaman cetak
- [ ] Footer per halaman: Total Halaman Ini + Total Sampai Dengan Halaman Ini
- [ ] Grand total di halaman terakhir
- [ ] Nomor halaman: "Halaman X Dari Y Halaman"
- [ ] Font monospace (Courier New) mengikuti dokumen asli
- [ ] Print CSS: @page landscape, margin 8mm

#### components/print/PrintRekapHeader.tsx
- [ ] Header untuk cetak rekap
- [ ] Konsisten dengan dokumen asli

**Audit Fase 4:**
- [ ] Test cetak dari browser
- [ ] Bandingkan dengan dokumen PDF asli secara visual
- [ ] Build test lokal

---

### FASE 5 — Audit Final & Deploy Prep
**Target:** Zero error, zero pelanggaran, siap deploy ke Vercel via GitHub

#### Audit Konsistensi
- [ ] Script Python scan semua .tsx .ts: flag hardcode warna, font-size, spacing
- [ ] Script Python scan: flag emoji, SVG inline, library UI terlarang
- [ ] Fix semua temuan dari script audit
- [ ] Manual review setiap halaman: mobile 375px + desktop 1440px

#### TypeScript & Build
- [ ] `npm run build` — zero error, zero warning kritis
- [ ] TypeScript: zero `any` yang tidak disengaja
- [ ] Semua props interface terdefinisi
- [ ] Semua async/await ada error handling

#### PWA Final Check
- [ ] manifest.json lengkap (nama, ikon, theme_color, dll)
- [ ] sw.js berfungsi: install, activate, fetch, cache
- [ ] Banner update tampil saat ada versi baru
- [ ] Installable di Android & iOS

#### Performance
- [ ] Tidak ada re-render berlebihan (useMemo/useCallback di tempat yang tepat)
- [ ] Gambar (logo) di-compress sebelum simpan ke Firestore
- [ ] Lazy load komponen besar jika memungkinkan

#### README Final
- [ ] Semua fase ditandai ✅ selesai
- [ ] Known issues kosong (atau terdokumentasi dengan workaround)
- [ ] Deploy guide diupdate
- [ ] Import guide diupdate

**ZIP Final:**
- [ ] Semua file lengkap
- [ ] README-DHKP-DESA.md terupdate
- [ ] .env.local TIDAK ikut di ZIP (hanya .env.example)
- [ ] Siap push ke GitHub → auto-deploy Vercel

---

## 8. LOG PERUBAHAN PER FASE

### Fase 0 — Perencanaan (saat ini)
**Status:** ✅ Selesai
**Tanggal:** —
**Dikerjakan:**
- Diskusi panjang requirements dengan klien
- Finalisasi design brief (typography, warna, radius, spacing, behavior)
- Penyusunan README master ini

**File yang ada (kondisi awal masuk Fase 1):**
- Semua file dari ZIP terakhir (dhkp-desa-FINAL.zip)
- Catatan: `lib/` folder ada dan lengkap (diambil dari sesi 2)
- Catatan: globals.css sudah ada tapi belum pakai token system ketat
- Catatan: beberapa komponen UI belum konsisten (hardcode warna, font-size)
- Catatan: `getChangelog` sudah di-re-export dari `lib/firestore.ts`

**Yang perlu diperhatikan di Fase 1:**
- `globals.css` perlu ditulis ulang total — token lama tidak konsisten
- `Header.tsx` ada dua versi (dari sesi6 overlay vs sesi5 asli) — pakai sesi6
- `Sidebar.tsx` label "Rekap & Statistik" sudah dikoreksi ke "Rekap Lunas"
- Komponen `Button.tsx` sudah ada tapi belum pakai token baru
- `sw.js` perlu ditambahkan logika auto-update + broadcast channel

---

### Fase 1 — Design System & Foundation
**Status:** ✅ Selesai
**Tanggal:** 2026-05-01
**Dikerjakan:**
- globals.css ditulis ulang total — semua token --c-*, --text-*, --sp-*, --radius-*, --icon-*, --shadow-*, layout tokens
- Token dark mode lengkap di [data-theme="dark"]
- Button.tsx: semua variant + size pakai token baru (btn-sm/md/lg)
- Input.tsx: label + input + error, semua token, Textarea included
- Card.tsx: card + card-interactive
- Badge.tsx: 5 variant, border-radius 4px (bukan pill)
- Toggle.tsx: 40×24px track, touch target 44×44px, 200ms transition
- Modal.tsx: backdrop blur, animate-modal-in, header+content+footer layout
- Toast.tsx: pojok kanan bawah, border-left 3px, 4 variant, auto-dismiss 3s
- Header.tsx: brand 2 baris (DHKP / Desa Karang Sengon), kunci global, theme toggle, avatar, semua 44px touch
- Sidebar.tsx: bg c-navy, slide 200ms, auto-close, gold active border, lock status footer
- AppShell.tsx: skeleton loading mirip layout asli, auth guard, padding token
- UpdateBanner.tsx: broadcast channel dari SW, tombol Muat Ulang
- sw.js: manual tanpa workbox, network-first halaman, cache-first assets, broadcast SW_UPDATED
- layout.tsx: Plus Jakarta Sans 400/500/600/700, anti-flash script, SW register script
- next.config.ts: hapus @ducanh2912/next-pwa, headers no-cache untuk sw.js + manifest
- @ducanh2912/next-pwa diuninstall dari package.json

**File yang diubah:**
- app/globals.css ✅
- app/layout.tsx ✅
- components/ui/Button.tsx ✅
- components/ui/Input.tsx ✅
- components/ui/Card.tsx ✅
- components/ui/Badge.tsx ✅
- components/ui/Toggle.tsx ✅
- components/ui/Modal.tsx ✅
- components/ui/Toast.tsx ✅
- components/ui/UpdateBanner.tsx ✅ (baru)
- components/layout/Header.tsx ✅
- components/layout/Sidebar.tsx ✅
- components/layout/AppShell.tsx ✅
- public/sw.js ✅
- next.config.ts ✅
- README-DHKP-DESA.md ✅

---

---

### Fase 2 — Halaman Utama
**Status:** ✅ Selesai
**Tanggal:** 2026-05-02
**Dikerjakan:**
- app/login/page.tsx: skeleton loading, brand header navy+gold, form token baru (--c-*), ingat email+password
- app/dashboard/page.tsx: skeleton lengkap (stat+finance+progress+lock), semua token --c-*, FinCard inline tanpa fin-card class
- app/data/page.tsx: skeleton tabel, empty state, FilterBadge, PaginBtn pakai token baru
- components/dhkp/RecordTable.tsx: sticky No (kiri) + Aksi (kanan), class col-sticky-left/right, row-lunas, token baru
- components/dhkp/RecordModal.tsx: Field error class input-error, toggle inline, token baru
- components/dhkp/DeleteConfirmModal.tsx: token baru
- components/dhkp/LockBanner.tsx: token baru

**File yang diubah:**
- `app/login/page.tsx` ✅
- `app/dashboard/page.tsx` ✅
- `app/data/page.tsx` ✅
- `components/dhkp/RecordTable.tsx` ✅
- `components/dhkp/RecordModal.tsx` ✅
- `components/dhkp/DeleteConfirmModal.tsx` ✅
- `components/dhkp/LockBanner.tsx` ✅
- `README-DHKP-DESA.md` ✅

---

### Fase 3 — Halaman Sekunder
**Status:** ✅ Selesai
**Tanggal:** 2026-05-02
**Dikerjakan:**
- app/rekap/page.tsx: stat cards, finance cards, progress bar, tabel rekap per petugas, tombol cetak, semua token --c-*
- app/riwayat/page.tsx: list changelog, filter tahun + search, format timestamp, empty state, token baru
- app/export-import/page.tsx: export DHKP + riwayat, import dengan progress bar realtime (X dari N berhasil), token baru
- app/pengaturan/page.tsx: Akun, Info Desa, Logo upload, Kunci Global, Backup, Info App, semua token --c-*
- components/dhkp/ImportPreviewModal.tsx: preview bottom sheet, stat valid/error, tabel preview, tombol konfirmasi

**File yang diubah:**
-  ✅
-  ✅
-  ✅
-  ✅
-  ✅
-  ✅

---

### Fase 4 — Print & Cetak
**Status:** ✅ Selesai
**Tanggal:** 2026-05-02
**Dikerjakan:**
- `components/print/PrintDHKP.tsx`: layout landscape A4, header lembaga (logo kiri/kanan + nama instansi), judul dokumen + sub-judul tahun, info box (tempat bayar/propinsi/kota/kecamatan/kelurahan), tabel 11 kolom, 20 baris/halaman + baris kosong pengisi, footer per halaman (Jumlah Halaman Ini + Total Sampai Dengan Halaman Ini), Grand Total di halaman terakhir, area tanda tangan petugas di halaman terakhir, nomor halaman pojok kanan atas, font Courier New, @page landscape margin 8mm
- `components/print/PrintRekapHeader.tsx`: header rekap clean (logo kiri/kanan, judul instansi, subtitle rekap), border-top navy tebal
- `app/rekap/page.tsx`: integrasi PrintDHKP — tombol "Cetak Data DHKP" (btn-primary) dan "Cetak Rekap" (btn-secondary), printMode state via useEffect + setTimeout 80ms agar render selesai sebelum print(), afterprint listener untuk reset mode, conditional render isDhkpPrint untuk swap konten

**File yang diubah:**
- `components/print/PrintDHKP.tsx` ✅
- `components/print/PrintRekapHeader.tsx` ✅
- `app/rekap/page.tsx` ✅
- `README-DHKP-DESA.md` ✅

---

### Fase 5 — Audit Final & Deploy Prep
**Status:** ✅ Selesai
**Tanggal:** 2026-05-02
**Dikerjakan:**
- Audit script Python: scan semua .tsx/.ts — flag hardcode warna, emoji, forbidden libs
- Fix RULE-01 violations: `color="#fff"` di icon props → `style={{ color: 'var(--c-text-inv)' }}` (export-import, pengaturan)
- Fix Toggle.tsx: thumb `background: '#ffffff'` → `'var(--c-text-inv)'`
- Fix UpdateBanner.tsx: `color: '#ffffff'` → `'var(--c-text-inv)'`
- Fix Sidebar.tsx: close button `color: '#ffffff'` → `'var(--c-text-inv)'`
- Fix rekap/page.tsx: inline print styles `#ddd` → `var(--c-border)`, `#1E3A5F` → `var(--c-navy)`
- Fix PrintRekapHeader.tsx: `#1E3A5F` → `var(--c-navy, #1E3A5F)`, `#444/111/555` → CSS var dengan fallback
- PrintDHKP.tsx: hardcode warna intentional (komponen cetak A4 B&W) — ditandai komentar
- layout.tsx `themeColor`: intentional (Next.js Viewport API, tidak support CSS var)
- TypeScript: `npx tsc --noEmit` → zero error
- next.config.ts: inject `BUILD_HASH` timestamp ke `sw.js` saat build
- deploy.bat: backup sw.js → build → restore sw.js → git push → Vercel auto-deploy
- .env.example: template environment variables
- README-DHKP-DESA.md: update final

**File yang diubah:**
- `components/ui/Toggle.tsx` ✅
- `components/ui/UpdateBanner.tsx` ✅
- `components/layout/Sidebar.tsx` ✅
- `app/export-import/page.tsx` ✅
- `app/pengaturan/page.tsx` ✅
- `app/rekap/page.tsx` ✅
- `components/print/PrintRekapHeader.tsx` ✅
- `components/print/PrintDHKP.tsx` ✅ (komentar intentional)
- `next.config.ts` ✅ (BUILD_HASH inject)
- `deploy.bat` ✅ (baru)
- `.env.example` ✅ (baru)
- `README-DHKP-DESA.md` ✅

---

---

## 9. PANDUAN DEPLOY

### Persiapan
1. Push semua file ke repository GitHub
2. Pastikan `.env.local` TIDAK ikut di commit (ada di `.gitignore`)
3. Di Vercel → Settings → Environment Variables, tambahkan:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

### Deploy
1. Vercel otomatis deploy saat ada push ke branch `main`
2. Cek build log di Vercel dashboard
3. Setelah deploy, buka URL produksi dan test:
   - Login berfungsi
   - Data terbaca dari Firestore
   - Service worker teraktivasi

### Jika Ada Error Build
- Cek log Vercel untuk detail error
- Error paling umum: missing env variable, TypeScript error, missing import

---

## 10. PANDUAN IMPORT DATA 702 RECORD

### Format File Excel
File: `DHKP_2026_KarangSengon_IMPORT.xlsx`

Kolom yang harus ada (urutan bebas, header harus tepat):
```
No | NOP | No. Induk | Nama Wajib Pajak | Alamat Objek Pajak / Wajib Pajak |
Pajak Terhutang | Perubahan Pajak | Lunas | Tgl Bayar |
Luas Tanah (m²) | Luas Bangunan (m²) | Dikelola Oleh | Keterangan
```

Nilai kolom:
- `Lunas`: "Lunas" atau "Belum"
- `Tgl Bayar`: format YYYY-MM-DD atau kosong
- `Pajak Terhutang`: angka saja tanpa titik/koma (contoh: 316602)
- `Luas Tanah`: angka saja (contoh: 9020)

### Proses Import
1. Buka aplikasi → menu Export / Import
2. Pilih tab "Import"
3. Pilih tahun (2026)
4. Upload file Excel
5. Preview data akan tampil — cek kebenaran data
6. Klik "Lanjutkan Import"
7. Progress bar akan tampil realtime: "X dari 702 berhasil diimpor"
8. Jika ada error per record, akan tampil di log

### Catatan Penting
- Import tidak menghapus data yang sudah ada — hanya menambah
- Jika NOP sudah ada, record akan di-skip (tidak duplikat)
- Koreksi data bisa dilakukan via Edit langsung di aplikasi setelah import
- File Excel koreksi tersedia: `DHKP_2026_KarangSengon_IMPORT.xlsx`
- Record yang perlu diverifikasi manual (latar kuning di Excel):
  - No. 40 HANDOKO — luas tanah tidak terbaca di scan PDF
  - No. 280 MISWAR — pajak & luas tidak terbaca di scan PDF
- Selisih dengan dokumen asli: Rp 119.526 (perlu koreksi manual)

---

## 11. KNOWN ISSUES & CATATAN TEKNIS

### Issues Aktif
*(kosong — akan diisi saat ditemukan)*

### Catatan Teknis
- **Kunci Global:** State disimpan di Firestore (`settings/globalLock`). Realtime via `onSnapshot`. Saat apps dibuka kembali, state terbaca dari Firestore — konsisten di semua device/user.
- **Range Tahun:** Dimulai 2026. Logika tampil: tahun sekarang + 2. Misal tahun 2026 → tampil 2026, 2027, 2028.
- **Service Worker:** Manual via `public/sw.js`. Cache versioning menggunakan timestamp build yang di-inject via `next.config.ts`. Tidak menggunakan next-pwa.
- **Font:** Plus Jakarta Sans via `next/font/google` di `layout.tsx`. Tidak ada `@import` di CSS.
- **Dark Mode:** Anti-flash via inline script di `<head>` yang baca localStorage sebelum React hydrate.
- **Password:** Disimpan di localStorage (bukan sessionStorage) agar persisten. Ini trade-off keamanan vs UX yang disepakati untuk konteks desa.
- **Import Data:** Proses per-record ke Firestore dengan `addDoc`. Progress dilaporkan via state React yang update per operasi.

---

*README ini adalah dokumen hidup — diupdate di setiap akhir fase oleh Claude.*
*Nama file: `README-DHKP-DESA.md` | Selalu ada di root folder ZIP*
