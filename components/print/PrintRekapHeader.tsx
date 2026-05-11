'use client';

import { AppInfo } from '@/types';

interface PrintRekapHeaderProps {
  appInfo: AppInfo | null;
  tahun: number;
}

export function PrintRekapHeader({ appInfo, tahun }: PrintRekapHeaderProps) {
  return (
    <div className="print-rekap-header">
      <style>{`
        @media screen { .print-rekap-header { display: none !important; } }
        @media print {
          .print-rekap-header {
            display: block !important;
            margin-bottom: 20px;
          }
          .prh-inner {
            display: flex;
            align-items: center;
            gap: 14px;
            border-top: 3px solid var(--c-navy, #1E3A5F);
            border-bottom: 1px solid var(--c-navy, #1E3A5F);
            padding: 10px 0;
            margin-bottom: 12px;
          }
          .prh-logo {
            width: 64px;
            height: 64px;
            object-fit: contain;
            flex-shrink: 0;
          }
          .prh-placeholder {
            width: 64px;
            height: 64px;
            flex-shrink: 0;
          }
          .prh-titles {
            flex: 1;
            text-align: center;
          }
          .prh-titles .t1 {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--c-navy, #1E3A5F);
            margin-bottom: 2px;
          }
          .prh-titles .t2 {
            font-size: 11px;
            font-weight: 600;
            color: var(--c-navy, #1E3A5F);
            margin-bottom: 2px;
          }
          .prh-titles .t3 {
            font-size: 10px;
            color: var(--c-text-2, #444);
          }
          .prh-subtitle {
            text-align: center;
            margin-top: 8px;
          }
          .prh-subtitle .s1 {
            font-size: 13px;
            font-weight: 700;
            text-decoration: underline;
            text-transform: uppercase;
            color: var(--c-text-1, #111);
          }
          .prh-subtitle .s2 {
            font-size: 10px;
            color: var(--c-text-3, #555);
            margin-top: 2px;
          }
        }
      `}</style>

      <div className="prh-inner">
        {appInfo?.logoKiri
          ? (
            // eslint-disable-next-line @next/next/no-img-element
            // Justifikasi: URL Firebase Storage dinamis — next/image tidak bisa mengoptimalkan
            // URL eksternal tanpa konfigurasi domain. Komponen ini print-only, dirender sekali.
            <img src={appInfo.logoKiri} alt="Logo Kiri" className="prh-logo" />
          )
          : <div className="prh-placeholder" />}

        <div className="prh-titles">
          <div className="t1">Pemerintah {appInfo?.kotaKab || 'Kabupaten/Kota'}</div>
          <div className="t2">
            Kecamatan {appInfo?.kecamatan || '-'} &mdash; Desa/Kelurahan {appInfo?.desaKelurahan || '-'}
          </div>
          {appInfo?.propinsi && <div className="t3">Provinsi {appInfo.propinsi}</div>}
        </div>

        {appInfo?.logoKanan
          ? (
            // eslint-disable-next-line @next/next/no-img-element
            // Justifikasi: sama seperti logo kiri — URL Firebase Storage dinamis, print-only.
            <img src={appInfo.logoKanan} alt="Logo Kanan" className="prh-logo" />
          )
          : <div className="prh-placeholder" />}
      </div>

      <div className="prh-subtitle">
        <div className="s1">Rekap DHKP (Daftar Himpunan Ketetapan Pajak &amp; Pembayaran)</div>
        <div className="s2">Tahun Pajak {tahun}</div>
        {appInfo?.tempatPembayaran && (
          <div className="s2">Tempat Pembayaran: {appInfo.tempatPembayaran}</div>
        )}
      </div>
    </div>
  );
}
