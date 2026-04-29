'use client';

import { AppInfo } from '@/types';

interface PrintRekapHeaderProps {
  appInfo: AppInfo | null;
  tahun: number;
}

export function PrintRekapHeader({ appInfo, tahun }: PrintRekapHeaderProps) {
  return (
    <div className="print-header" style={{ display: 'none' }}>
      <style>{`
        @media print {
          .print-header {
            display: block !important;
            margin-bottom: 24px;
          }
          .print-header-inner {
            display: flex;
            align-items: center;
            gap: 16px;
            border-bottom: 3px solid #1E3A5F;
            padding-bottom: 16px;
            margin-bottom: 16px;
          }
          .print-logo {
            width: 72px;
            height: 72px;
            object-fit: contain;
            flex-shrink: 0;
          }
          .print-logo-placeholder {
            width: 72px;
            height: 72px;
            flex-shrink: 0;
          }
          .print-title-block {
            flex: 1;
            text-align: center;
          }
          .print-title-block h1 {
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #1E3A5F;
            margin-bottom: 2px;
          }
          .print-title-block h2 {
            font-size: 13px;
            font-weight: 600;
            color: #1E3A5F;
            margin-bottom: 2px;
          }
          .print-title-block p {
            font-size: 12px;
            color: #444;
          }
          .print-subtitle {
            text-align: center;
            margin-top: 12px;
          }
          .print-subtitle h3 {
            font-size: 14px;
            font-weight: 700;
            text-decoration: underline;
            text-transform: uppercase;
            color: #111;
          }
          .print-subtitle p {
            font-size: 12px;
            color: #555;
            margin-top: 2px;
          }
        }
      `}</style>

      <div className="print-header-inner">
        {/* Logo Kiri */}
        {appInfo?.logoKiri ? (
          <img src={appInfo.logoKiri} alt="Logo Kiri" className="print-logo" />
        ) : (
          <div className="print-logo-placeholder" />
        )}

        {/* Judul Tengah */}
        <div className="print-title-block">
          <h1>Pemerintah {appInfo?.kotaKab || 'Kabupaten/Kota'}</h1>
          <h2>Kecamatan {appInfo?.kecamatan || '-'}</h2>
          <p>Desa/Kelurahan {appInfo?.desaKelurahan || '-'}</p>
          {appInfo?.propinsi && (
            <p>Provinsi {appInfo.propinsi}</p>
          )}
        </div>

        {/* Logo Kanan */}
        {appInfo?.logoKanan ? (
          <img src={appInfo.logoKanan} alt="Logo Kanan" className="print-logo" />
        ) : (
          <div className="print-logo-placeholder" />
        )}
      </div>

      <div className="print-subtitle">
        <h3>Rekap DHKP (Daftar Himpunan Ketetapan Pajak & Pembayaran)</h3>
        <p>Tahun Pajak {tahun}</p>
        {appInfo?.tempatPembayaran && (
          <p>Tempat Pembayaran: {appInfo.tempatPembayaran}</p>
        )}
      </div>
    </div>
  );
}
