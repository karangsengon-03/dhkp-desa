'use client';

import { useState, useEffect } from 'react';
import { subscribeDHKP } from '@/lib/firestore';
import { DHKPRecord } from '@/types';

export function useDHKP(tahun: number) {
  const [records, setRecords] = useState<DHKPRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeDHKP(tahun, (data) => {
      setRecords(data);
      setLoading(false);
    });
    return unsub;
  }, [tahun]);

  return { records, loading };
}
