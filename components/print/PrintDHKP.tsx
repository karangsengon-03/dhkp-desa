'use client';

/**
 * PrintDHKP
 * Template cetak yang meniru format dokumen DHKP pemda asli.
 * Dipanggil dari halaman Rekap.
 * Hanya tampil saat @media print.
 */

import { DHKPRecord, AppInfo } from '@/types';
import { formatRupiah } from '@/lib/format';

const PAGE_SIZE = 20; // baris per halaman cetak

interface PrintDHKPProps {
  records: DHKPRecord[];
  appInfo: AppInfo | null;
  tahun: number;
}

function formatTglCetak(isoStr: string) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function PrintDHKP({ records, appInfo, tahun }: PrintDHKPProps) {
  // Bagi records ke halaman
  const pages: DHKPRecord[][] = [];
  for (let i = 0; i < records.length; i += PAGE_SIZE) {
    pages.push(records.slice(i, i + PAGE_SIZE));
  }
  const totalPages = pages.length;

  // Hitung total global
  const totalPajakGlobal = records.reduce((s, r) => s + r.pajakTerhutang, 0);

  return (
    <div className="print-only">
      <style>{`
        @media screen { .print-only { display: none !important; } }
        @media print {
          * { box-sizing: border-box; }
          .print-only { display: block !important; }
          body { background: #fff !important; margin: 0; padding: 0; font-family: 'Courier New', Courier, monospace; font-size: 8.5pt; color: #000; }
          .dhkp-page { width: 100%; page-break-after: always; padding: 10mm 8mm; }
          .dhkp-page:last-child { page-break-after: avoid; }

          /* Header lembaga */
          .lbg-header { display: flex; align-items: center; gap: 10px; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
          .lbg-logo { width: 60px; height: 60px; object-fit: contain; flex-shrink: 0; }
          .lbg-logo-placeholder { width: 60px; height: 60px; flex-shrink: 0; }
          .lbg-title { flex: 1; text-align: center; }
          .lbg-title p { margin: 0; line-height: 1.4; }
          .lbg-title .t-big { font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
          .lbg-title .t-med { font-size: 9.5pt; font-weight: bold; }
          .lbg-title .t-sm { font-size: 8pt; }

          /* Judul dokumen */
          .doc-title { text-align: center; margin: 6px 0; }
          .doc-title .dt-main { font-size: 13pt; font-weight: bold; text-decoration: underline; letter-spacing: 2px; }
          .doc-title .dt-sub { font-size: 9pt; }

          /* Info box kanan */
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 4px; }
          .info-row { display: flex; font-size: 8pt; line-height: 1.6; }
          .info-label { width: 110px; flex-shrink: 0; }
          .info-colon { width: 12px; flex-shrink: 0; }
          .info-val { font-weight: 600; }

          /* Table */
          .dhkp-tbl { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 7.5pt; }
          .dhkp-tbl th, .dhkp-tbl td { border: 1px solid #555; padding: 2px 4px; vertical-align: top; }
          .dhkp-tbl thead th { background: #e8e8e8; font-weight: bold; text-align: center; font-size: 7pt; }
          .dhkp-tbl td.num { text-align: right; white-space: nowrap; }
          .dhkp-tbl td.ctr { text-align: center; }
          .dhkp-tbl tfoot td { background: #e8e8e8; font-weight: bold; font-size: 7.5pt; }

          /* Halaman info */
          .page-info { text-align: right; font-size: 7.5pt; margin-bottom: 4px; }

          @page { size: A4 landscape; margin: 8mm; }
        }
      `}</style>

      {pages.map((pageRecords, pageIdx) => {
        const globalOffset = pageIdx * PAGE_SIZE;
        const totalPajakPage = pageRecords.reduce((s, r) => s + r.pajakTerhutang, 0);
        // Akumulatif s.d. halaman ini
        const totalPajakCumul = records
          .slice(0, globalOffset + pageRecords.length)
          .reduce((s, r) => s + r.pajakTerhutang, 0);

        return (
          <div key={pageIdx} className="dhkp-page">
            {/* Info halaman */}
            <div className="page-info">
              Halaman {pageIdx + 1} Dari {totalPages} Halaman
            </div>

            {/* Header lembaga */}
            <div className="lbg-header">
              {appInfo?.logoKiri
                ? <img src={appInfo.logoKiri} alt="Logo Kiri" className="lbg-logo" />
                : <div className="lbg-logo-placeholder" />
              }
              <div className="lbg-title">
                <p className="t-sm">Pemerintah {appInfo?.kotaKab || 'Kabupaten/Kota'}</p>
                <p className="t-med">BADAN PENDAPATAN DAERAH</p>
                {appInfo?.tempatPembayaran && <p className="t-sm">Tempat Pembayaran: {appInfo.tempatPembayaran}</p>}
              </div>
              {appInfo?.logoKanan
                ? <img src={appInfo.logoKanan} alt="Logo Kanan" className="lbg-logo" />
                : <div className="lbg-logo-placeholder" />
              }
            </div>

            {/* Judul dokumen */}
            <div className="doc-title">
              <p className="dt-main">DAFTAR HIMPUNAN KETETAPAN PAJAK &amp; PEMBAYARAN BUKU 1,2,3</p>
              <p className="dt-sub">TAHUN {tahun}</p>
            </div>

            {/* Info kiri */}
            <div className="info-grid">
              <div>
                <div className="info-row"><span className="info-label">TEMPAT PEMBAYARAN</span><span className="info-colon">:</span><span className="info-val">{appInfo?.tempatPembayaran || '-'}</span></div>
                <div className="info-row"><span className="info-label">PROPINSI</span><span className="info-colon">:</span><span className="info-val">{appInfo?.propinsi || '-'}</span></div>
                <div className="info-row"><span className="info-label">KOTA/KAB</span><span className="info-colon">:</span><span className="info-val">{appInfo?.kotaKab || '-'}</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="info-row" style={{ justifyContent: 'flex-end' }}><span className="info-label">KECAMATAN</span><span className="info-colon">:</span><span className="info-val">{appInfo?.kecamatan || '-'}</span></div>
                <div className="info-row" style={{ justifyContent: 'flex-end' }}><span className="info-label">KELURAHAN</span><span className="info-colon">:</span><span className="info-val">{appInfo?.desaKelurahan || '-'}</span></div>
              </div>
            </div>

            {/* Tabel */}
            <table className="dhkp-tbl">
              <thead>
                <tr>
                  <th rowSpan={2} style={{ width: 26 }}>NOMOR</th>
                  <th rowSpan={2}>NOP</th>
                  <th rowSpan={2} style={{ width: 54 }}>NOMOR INDUK</th>
                  <th rowSpan={2}>NAMA WAJIB PAJAK</th>
                  <th rowSpan={2}>ALAMAT OBJEK PAJAK / WAJIB PAJAK</th>
                  <th rowSpan={2} style={{ width: 66 }}>PAJAK TERHUTANG</th>
                  <th rowSpan={2} style={{ width: 60 }}>PERUBAHAN PAJAK</th>
                  <th rowSpan={2} style={{ width: 46 }}>TANGGAL BAYAR</th>
                  <th colSpan={2} style={{ width: 90 }}>LUAS</th>
                  <th rowSpan={2} style={{ width: 60 }}>DIKELOLA</th>
                </tr>
                <tr>
                  <th style={{ width: 45 }}>TANAH</th>
                  <th style={{ width: 45 }}>BNG</th>
                </tr>
              </thead>
              <tbody>
                {pageRecords.map((r, i) => (
                  <tr key={r.id}>
                    <td className="ctr">{globalOffset + i + 1}</td>
                    <td style={{ fontSize: '7pt', whiteSpace: 'nowrap' }}>{r.nop || '-'}</td>
                    <td>{r.nomorInduk || '-'}</td>
                    <td>{r.namaWajibPajak}</td>
                    <td style={{ fontSize: '7pt' }}>{r.alamatObjekPajak || '-'}</td>
                    <td className="num">{r.pajakTerhutang ? r.pajakTerhutang.toLocaleString('id-ID') : '-'}</td>
                    <td className="num" style={{ color: r.perubahanPajak > 0 ? '#1a5c1a' : r.perubahanPajak < 0 ? '#8b0000' : undefined }}>
                      {r.perubahanPajak !== 0 ? r.perubahanPajak.toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="ctr" style={{ fontSize: '7pt' }}>{formatTglCetak(r.tanggalBayar)}</td>
                    <td className="num">{r.luasTanah || 0}</td>
                    <td className="num">{r.luasBangunan || 0}</td>
                    <td style={{ fontSize: '7pt' }}>{r.dikelolaOleh || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', paddingRight: 6 }}>Total Halaman Ini</td>
                  <td className="num">{totalPajakPage.toLocaleString('id-ID')}</td>
                  <td colSpan={5} />
                </tr>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', paddingRight: 6 }}>Total Sampai Dengan Halaman Ini</td>
                  <td className="num">{totalPajakCumul.toLocaleString('id-ID')}</td>
                  <td colSpan={5} />
                </tr>
                {/* Halaman terakhir: tampilkan grand total */}
                {pageIdx === totalPages - 1 && (
                  <tr style={{ background: '#d0d8e8' }}>
                    <td colSpan={5} style={{ textAlign: 'right', paddingRight: 6 }}>GRAND TOTAL</td>
                    <td className="num">{totalPajakGlobal.toLocaleString('id-ID')}</td>
                    <td colSpan={5} />
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        );
      })}
    </div>
  );
}
