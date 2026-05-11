'use client';

import { AppShell } from '@/components/layout/AppShell';
import { LockBanner } from '@/components/dhkp/LockBanner';
import { useGlobalLock } from '@/hooks/useGlobalLock';
import { DHKPRecord } from '@/types';
import { SeksiExport } from '@/components/export-import/SeksiExport';
import { SeksiImport } from '@/components/export-import/SeksiImport';

/** Tipe baris import yang dipakai di SeksiImport dan ImportPreviewModal */
export interface ImportRow {
  row: Partial<DHKPRecord>;
  errors: string[];
}

export default function ExportImportPage() {
  const lock = useGlobalLock();

  return (
    <AppShell pageTitle="Ekspor & Impor">
      <LockBanner lock={lock} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
        <SeksiExport />
        <SeksiImport isLocked={lock.isLocked} />
      </div>
    </AppShell>
  );
}
