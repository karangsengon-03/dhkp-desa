'use client';

/**
 * PrintDHKP
 * Template cetak dokumen DHKP mirip format pemda asli.
 * Landscape A4, font Courier New, 20 baris/halaman.
 * Dipanggil dari app/rekap/page.tsx saat mode cetak DHKP.
 *
 * Struktur komponen (tidak dipecah karena semua JSX adalah template cetak statis):
 *   ├── [STYLES]       — blok <style> khusus @media print, semua class .dhkp-*
 *   ├── [HELPERS]      — fmtAngka(), fmtPerubahan() (format angka untuk printer)
 *   ├── [PAGE LOOP]    — map pages → .dhkp-page (header + tabel + ttd)
 *   │   ├── [HEADER]   — nomor halaman + header lembaga + judul dokumen
 *   │   ├── [INFO ROW] — info kecamatan/desa/propinsi
 *   │   ├── [TABLE]    — tabel DHKP 20 baris/halaman
 *   │   └── [TTD]      — tanda tangan (halaman terakhir saja)
 *   └── [GRAND TOTAL]  — baris grand total di tfoot halaman terakhir
 */

import { DHKPRecord, AppInfo } from '@/types';
import { formatTanggalPendek } from '@/lib/format';

const PAGE_SIZE = 20;

interface PrintDHKPProps {
  records: DHKPRecord[];
  appInfo: AppInfo | null;
  tahun: number;
}


function fmtAngka(n: number | undefined | null) {
  if (n === null || n === undefined || n === 0) return '0';
  return n.toLocaleString('id-ID');
}

function fmtPerubahan(n: number | undefined | null) {
  if (n === null || n === undefined) return '-';
  if (n === 0) return '0';
  return n.toLocaleString('id-ID');
}

export function PrintDHKP({ records, appInfo, tahun }: PrintDHKPProps) {
  const pages: DHKPRecord[][] = [];
  for (let i = 0; i < records.length; i += PAGE_SIZE) {
    pages.push(records.slice(i, i + PAGE_SIZE));
  }
  const totalPages = pages.length;
  const totalPajakGlobal = records.reduce((s, r) => s + (r.pajakTerhutang || 0), 0);

  return (
    <div className="print-only">
      <style>{`
        @media screen { .print-only { display: none !important; } }
        @media print {
          /* INTENTIONAL: komponen cetak A4 — warna statis untuk output printer B&W */
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .print-only { display: block !important; }
          html, body {
            background: #fff !important;
            font-family: 'Courier New', Courier, monospace;
            font-size: 8pt;
            color: #000;
          }

          @page { size: A4 landscape; margin: 8mm 8mm 8mm 8mm; }

          .dhkp-page {
            width: 100%;
            page-break-after: always;
            padding: 0;
          }
          .dhkp-page:last-child { page-break-after: avoid; }

          /* Info halaman pojok kanan atas */
          .pg-info {
            text-align: right;
            font-size: 7.5pt;
            margin-bottom: 3px;
          }

          /* Header lembaga */
          .lbg-wrap {
            display: flex;
            align-items: center;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 5px 0;
            margin-bottom: 3px;
            gap: 8px;
          }
          .lbg-logo {
            width: 52px;
            height: 52px;
            object-fit: contain;
            flex-shrink: 0;
          }
          .lbg-placeholder { width: 52px; height: 52px; flex-shrink: 0; }
          .lbg-center { flex: 1; text-align: center; }
          .lbg-center .t1 { font-size: 10.5pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.4px; line-height: 1.3; }
          .lbg-center .t2 { font-size: 9pt; font-weight: bold; line-height: 1.3; }
          .lbg-center .t3 { font-size: 7.5pt; line-height: 1.4; }

          /* Judul dokumen */
          .doc-title { text-align: center; margin: 4px 0; }
          .doc-title .main { font-size: 12pt; font-weight: bold; text-decoration: underline; letter-spacing: 1.5px; text-transform: uppercase; }
          .doc-title .sub { font-size: 9pt; font-weight: bold; margin-top: 1px; }

          /* Info baris atas tabel */
          .info-row-wrap {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            font-size: 7.5pt;
          }
          .info-col { display: flex; flex-direction: column; gap: 1px; }
          .info-item { display: flex; gap: 0; }
          .info-lbl { width: 120px; }
          .info-sep { width: 12px; text-align: center; }
          .info-val { font-weight: 700; }

          /* Tabel utama */
          .dhkp-tbl {
            width: 100%;
            border-collapse: collapse;
            font-size: 7pt;
          }
          .dhkp-tbl th, .dhkp-tbl td {
            border: 1px solid #333;
            padding: 1.5px 3px;
            vertical-align: middle;
          }
          .dhkp-tbl thead th {
            background: #d8d8d8 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-weight: bold;
            text-align: center;
            font-size: 6.5pt;
            line-height: 1.3;
          }
          .dhkp-tbl tbody td { vertical-align: top; line-height: 1.35; }
          .dhkp-tbl td.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
          .dhkp-tbl td.ctr { text-align: center; }
          .dhkp-tbl tfoot td {
            background: #e8e8e8 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-weight: bold;
            font-size: 7.5pt;
          }
          .dhkp-tbl tfoot td.num { text-align: right; font-variant-numeric: tabular-nums; }

          /* Grand total row */
          .row-grand td {
            background: #c8d4e4 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-weight: bold;
            font-size: 8pt;
          }

          /* Empty baris padding agar tabel penuh */
          .row-empty td { border-color: #aaa; }

          /* Tanda tangan area (halaman terakhir) */
          .ttd-wrap {
            margin-top: 12px;
            display: flex;
            justify-content: flex-end;
          }
          .ttd-block {
            text-align: center;
            font-size: 8pt;
          }
          .ttd-block .ttd-place { margin-bottom: 2px; }
          .ttd-block .ttd-space { height: 48px; }
          .ttd-block .ttd-name { font-weight: bold; text-decoration: underline; }
          .ttd-block .ttd-nip { font-size: 7pt; }
        }
      `}</style>

      {pages.map((pageRecords, pageIdx) => {
        const globalOffset = pageIdx * PAGE_SIZE;
        const totalPajakPage = pageRecords.reduce((s, r) => s + (r.pajakTerhutang || 0), 0);
        const totalPajakCumul = records
          .slice(0, globalOffset + pageRecords.length)
          .reduce((s, r) => s + (r.pajakTerhutang || 0), 0);
        const isLastPage = pageIdx === totalPages - 1;

        // Isi baris kosong agar tabel selalu 20 baris
        const emptyRows = PAGE_SIZE - pageRecords.length;

        return (
          <div key={pageIdx} className="dhkp-page">
            {/* Nomor halaman */}
            <div className="pg-info">
              Halaman {pageIdx + 1} Dari {totalPages} Halaman
            </div>

            {/* Header lembaga */}
            <div className="lbg-wrap">
              {appInfo?.logoKiri
                ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  // Justifikasi: src adalah URL Firebase Storage dinamis — next/image tidak bisa
                  // mengoptimalkan URL eksternal tanpa konfigurasi domain dan akan menambah overhead
                  // yang tidak perlu untuk komponen print-only yang dirender sekali.
                  <img src={appInfo.logoKiri} alt="Logo kiri" className="lbg-logo" />
                )
                : <div className="lbg-placeholder" />}
              <div className="lbg-center">
                <div className="t1">PEMERINTAH {(appInfo?.kotaKab || 'KABUPATEN/KOTA').toUpperCase()}</div>
                <div className="t2">BADAN PENDAPATAN DAERAH</div>
                {appInfo?.tempatPembayaran && (
                  <div className="t3">Tempat Pembayaran: {appInfo.tempatPembayaran}</div>
                )}
              </div>
              {appInfo?.logoKanan
                ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  // Justifikasi: sama seperti logo kiri — URL Firebase Storage dinamis, komponen print-only.
                  <img src={appInfo.logoKanan} alt="Logo kanan" className="lbg-logo" />
                )
                : <div className="lbg-placeholder" />}
            </div>

            {/* Judul dokumen */}
            <div className="doc-title">
              <div className="main">DAFTAR HIMPUNAN KETETAPAN PAJAK &amp; PEMBAYARAN BUKU 1,2,3</div>
              <div className="sub">TAHUN {tahun}</div>
            </div>

            {/* Info baris */}
            <div className="info-row-wrap">
              <div className="info-col">
                <div className="info-item">
                  <span className="info-lbl">TEMPAT PEMBAYARAN</span>
                  <span className="info-sep">:</span>
                  <span className="info-val">{appInfo?.tempatPembayaran || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-lbl">PROPINSI</span>
                  <span className="info-sep">:</span>
                  <span className="info-val">{appInfo?.propinsi || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-lbl">KOTA / KAB</span>
                  <span className="info-sep">:</span>
                  <span className="info-val">{appInfo?.kotaKab || '-'}</span>
                </div>
              </div>
              <div className="info-col" style={{ textAlign: 'right' }}>
                <div className="info-item" style={{ justifyContent: 'flex-end' }}>
                  <span className="info-lbl" style={{ textAlign: 'right' }}>KECAMATAN</span>
                  <span className="info-sep">:</span>
                  <span className="info-val">{appInfo?.kecamatan || '-'}</span>
                </div>
                <div className="info-item" style={{ justifyContent: 'flex-end' }}>
                  <span className="info-lbl" style={{ textAlign: 'right' }}>KELURAHAN/DESA</span>
                  <span className="info-sep">:</span>
                  <span className="info-val">{appInfo?.desaKelurahan || '-'}</span>
                </div>
              </div>
            </div>

            {/* Tabel */}
            <table className="dhkp-tbl">
              <thead>
                <tr>
                  <th rowSpan={2} style={{ width: 24 }}>NO.</th>
                  <th rowSpan={2} style={{ width: 88 }}>NOP</th>
                  <th rowSpan={2} style={{ width: 52 }}>NO.<br/>INDUK</th>
                  <th rowSpan={2} style={{ width: 90 }}>NAMA<br/>WAJIB PAJAK</th>
                  <th rowSpan={2} style={{ width: 90 }}>ALAMAT OBJEK PAJAK /<br/>WAJIB PAJAK</th>
                  <th rowSpan={2} style={{ width: 62 }}>PAJAK<br/>TERHUTANG</th>
                  <th rowSpan={2} style={{ width: 56 }}>PERUBAHAN<br/>PAJAK</th>
                  <th rowSpan={2} style={{ width: 44 }}>TGL<br/>BAYAR</th>
                  <th colSpan={2} style={{ width: 84 }}>LUAS (m²)</th>
                  <th rowSpan={2} style={{ width: 56 }}>DIKELOLA<br/>OLEH</th>
                </tr>
                <tr>
                  <th style={{ width: 42 }}>TANAH</th>
                  <th style={{ width: 42 }}>BGN</th>
                </tr>
              </thead>
              <tbody>
                {pageRecords.map((r, i) => (
                  <tr key={r.id}>
                    <td className="ctr" style={{ fontSize: '6.5pt' }}>{globalOffset + i + 1}</td>
                    <td style={{ fontSize: '6.5pt', letterSpacing: '-0.2px' }}>{r.nop || '-'}</td>
                    <td style={{ fontSize: '6.5pt' }}>{r.nomorInduk || '-'}</td>
                    <td style={{ fontSize: '7pt' }}>{r.namaWajibPajak}</td>
                    <td style={{ fontSize: '6.5pt' }}>{r.alamatObjekPajak || '-'}</td>
                    <td className="num">{fmtAngka(r.pajakTerhutang)}</td>
                    <td className="num">{fmtPerubahan(r.perubahanPajak)}</td>
                    <td className="ctr" style={{ fontSize: '6.5pt' }}>{formatTanggalPendek(r.tanggalBayar)}</td>
                    <td className="num">{fmtAngka(r.luasTanah)}</td>
                    <td className="num">{fmtAngka(r.luasBangunan)}</td>
                    <td style={{ fontSize: '6.5pt' }}>{r.dikelolaOleh || '-'}</td>
                  </tr>
                ))}
                {/* Baris kosong pengisi agar tabel selalu 20 baris */}
                {Array.from({ length: emptyRows }).map((_, ei) => (
                  <tr key={`empty-${ei}`} className="row-empty">
                    <td className="ctr" style={{ color: '#bbb', fontSize: '6pt' }}>{globalOffset + pageRecords.length + ei + 1}</td>
                    <td /><td /><td /><td /><td /><td /><td /><td /><td /><td />
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', paddingRight: 5, fontSize: '7.5pt' }}>
                    Jumlah / Total Halaman Ini
                  </td>
                  <td className="num">{fmtAngka(totalPajakPage)}</td>
                  <td colSpan={5} />
                </tr>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', paddingRight: 5, fontSize: '7.5pt' }}>
                    Total Sampai Dengan Halaman Ini
                  </td>
                  <td className="num">{fmtAngka(totalPajakCumul)}</td>
                  <td colSpan={5} />
                </tr>
                {isLastPage && (
                  <tr className="row-grand">
                    <td colSpan={5} style={{ textAlign: 'right', paddingRight: 5 }}>
                      JUMLAH GRAND TOTAL
                    </td>
                    <td className="num">{fmtAngka(totalPajakGlobal)}</td>
                    <td colSpan={5} />
                  </tr>
                )}
              </tfoot>
            </table>

            {/* Tanda tangan — hanya halaman terakhir */}
            {isLastPage && (
              <div className="ttd-wrap">
                <div className="ttd-block">
                  <div className="ttd-place">
                    {appInfo?.desaKelurahan || 'Desa/Kelurahan'}, _____ {tahun}
                  </div>
                  <div>Petugas Pemungut,</div>
                  <div className="ttd-space" />
                  <div className="ttd-name">( _________________________ )</div>
                  <div className="ttd-nip">NIP. ____________________</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
