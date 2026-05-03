'use client';

import { useRef } from 'react';
import { Image as ImageIcon, Save, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { AppInfo } from '@/types';
import { updateAppInfo } from '@/lib/firestore';
import { SectionHeader } from './SectionHeader';

interface SeksiInfoDesaProps {
  appInfo: AppInfo;
  saving: boolean;
  onSaving: (v: boolean) => void;
  onChange: (field: keyof AppInfo, value: string) => void;
}

export function SeksiInfoDesa({ appInfo, saving, onSaving, onChange }: SeksiInfoDesaProps) {
  const { showToast } = useToast();
  const logoKiriRef = useRef<HTMLInputElement>(null);
  const logoKananRef = useRef<HTMLInputElement>(null);

  function handleLogoUpload(field: 'logoKiri' | 'logoKanan', e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      showToast('Ukuran logo maksimal 500 KB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(field, ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleSave() {
    onSaving(true);
    try {
      await updateAppInfo(appInfo);
      showToast('Pengaturan berhasil disimpan', 'success');
    } catch {
      showToast('Gagal menyimpan pengaturan', 'danger');
    } finally {
      onSaving(false);
    }
  }

  return (
    <div className="card" style={{ padding: 'var(--sp-5)' }}>
      <SectionHeader
        icon={<Building2 size={18} style={{ color: 'var(--c-text-inv)' }} />}
        iconBg="var(--c-gold)"
        title="Informasi Desa"
        sub="Data yang tampil di header cetak dan rekap"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
        {(([
          ['propinsi', 'Propinsi', 'Contoh: Jawa Timur'],
          ['kotaKab', 'Kota / Kabupaten', 'Contoh: Kabupaten Bondowoso'],
          ['kecamatan', 'Kecamatan', 'Contoh: Klabang'],
          ['desaKelurahan', 'Desa / Kelurahan', 'Contoh: Karang Sengon'],
          ['tempatPembayaran', 'Tempat Pembayaran', 'Contoh: Bank Jatim'],
        ]) as [keyof AppInfo, string, string][]).map(([field, label, placeholder]) => (
          <Input
            key={field}
            label={label}
            value={appInfo[field] as string}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={placeholder}
          />
        ))}
      </div>

      {/* Logo Upload */}
      <div style={{ marginBottom: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
          <ImageIcon size={13} style={{ color: 'var(--c-text-3)' }} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--c-text-3)' }}>Logo Header</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-4)' }}>PNG/SVG · maks 500 KB</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
          {(['logoKiri', 'logoKanan'] as const).map((field) => (
            <div key={field}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--c-text-3)', marginBottom: 6 }}>
                Logo {field === 'logoKiri' ? 'Kiri' : 'Kanan'}
              </div>
              <div
                onClick={() => (field === 'logoKiri' ? logoKiriRef : logoKananRef).current?.click()}
                style={{ border: '2px dashed var(--c-border)', borderRadius: 'var(--radius-md)', minHeight: 90, padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 6, transition: 'border-color 150ms' }}
              >
                {appInfo[field] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={appInfo[field] as string} alt={field} style={{ maxHeight: 68, maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <>
                    <ImageIcon size={26} style={{ color: 'var(--c-text-4)' }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--c-text-3)' }}>Klik untuk unggah</span>
                  </>
                )}
              </div>
              <input
                ref={field === 'logoKiri' ? logoKiriRef : logoKananRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleLogoUpload(field, e)}
              />
              {appInfo[field] && (
                <button
                  onClick={() => onChange(field, '')}
                  style={{ marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--c-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Hapus logo
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}
        >
          <Save size={14} />
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  );
}
