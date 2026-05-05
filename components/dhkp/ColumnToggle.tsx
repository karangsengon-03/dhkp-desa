'use client';

import { useState, useRef, useEffect } from 'react';
import { Columns, Check } from 'lucide-react';

export type ColKey =
  | 'nop' | 'nomorInduk' | 'namaWajibPajak' | 'alamatObjekPajak'
  | 'pajakTerhutang' | 'perubahanPajak' | 'statusLunas' | 'tanggalBayar'
  | 'luasTanah' | 'luasBangunan' | 'dikelolaOleh';

export const COL_LABELS: Record<ColKey, string> = {
  nop:              'NOP',
  nomorInduk:       'No. Induk',
  namaWajibPajak:   'Nama Wajib Pajak',
  alamatObjekPajak: 'Alamat Objek',
  pajakTerhutang:   'Pajak Terhutang',
  perubahanPajak:   'Perubahan Pajak',
  statusLunas:      'Status Lunas',
  tanggalBayar:     'Tanggal Bayar',
  luasTanah:        'Luas Tanah',
  luasBangunan:     'Luas Bangunan',
  dikelolaOleh:     'Dikelola Oleh',
};

export const ALL_COLS: ColKey[] = Object.keys(COL_LABELS) as ColKey[];

const LS_KEY = 'dhkp_visible_cols';

export function useVisibleCols() {
  const [visible, setVisible] = useState<Set<ColKey>>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) return new Set(JSON.parse(saved) as ColKey[]);
    } catch { /* ignore */ }
    return new Set(ALL_COLS); // default: semua tampil
  });

  function toggle(col: ColKey) {
    setVisible(prev => {
      const next = new Set(prev);
      if (next.has(col)) {
        if (next.size <= 2) return prev; // minimal 2 kolom selalu tampil
        next.delete(col);
      } else {
        next.add(col);
      }
      localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function showAll() {
    const full = new Set(ALL_COLS);
    setVisible(full);
    localStorage.setItem(LS_KEY, JSON.stringify([...full]));
  }

  return { visible, toggle, showAll };
}

interface Props {
  visible: Set<ColKey>;
  onToggle: (col: ColKey) => void;
  onShowAll: () => void;
}

export function ColumnToggle({ visible, onToggle, onShowAll }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hiddenCount = ALL_COLS.length - visible.size;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 40, padding: '0 14px',
          background: open ? 'var(--c-navy)' : 'var(--c-surface)',
          color: open ? '#fff' : 'var(--c-t2)',
          border: `1.5px solid ${open ? 'var(--c-navy)' : 'var(--c-border-md)'}`,
          borderRadius: 8, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', whiteSpace: 'nowrap',
          transition: 'all 150ms ease',
        }}
      >
        <Columns size={15} />
        Kolom
        {hiddenCount > 0 && (
          <span style={{
            background: 'var(--c-gold)', color: '#1A1000',
            fontSize: 11, fontWeight: 700,
            padding: '1px 6px', borderRadius: 99,
            marginLeft: 2,
          }}>
            -{hiddenCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          zIndex: 50, width: 220,
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border-md)',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px 8px',
            borderBottom: '1px solid var(--c-border)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-t1)' }}>Pilih Kolom</span>
            <button
              onClick={onShowAll}
              style={{
                fontSize: 12, fontWeight: 600, color: 'var(--c-navy)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              Tampilkan Semua
            </button>
          </div>
          <div style={{ padding: '6px 0', maxHeight: 320, overflowY: 'auto' }}>
            {ALL_COLS.map(col => (
              <button
                key={col}
                onClick={() => onToggle(col)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 14px',
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: 14, color: 'var(--c-t2)',
                  transition: 'background 100ms ease',
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--c-navy-soft)')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: visible.has(col) ? 'var(--c-navy)' : 'transparent',
                  border: `2px solid ${visible.has(col) ? 'var(--c-navy)' : 'var(--c-border-md)'}`,
                  transition: 'all 120ms ease',
                }}>
                  {visible.has(col) && <Check size={11} color="#fff" strokeWidth={3} />}
                </div>
                <span style={{ fontWeight: visible.has(col) ? 600 : 400 }}>
                  {COL_LABELS[col]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
