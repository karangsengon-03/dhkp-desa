import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { ChangelogEntry } from '@/types';

export async function logChange(
  recordId: string,
  tahun: number,
  namaWajibPajak: string,
  editedBy: string,
  field: string,
  nilaiLama: string | number | boolean,
  nilaiBaru: string | number | boolean
): Promise<void> {
  const ref = collection(db, 'changelog');
  await addDoc(ref, {
    recordId,
    tahun,
    namaWajibPajak,
    editedBy,
    field,
    nilaiLama,
    nilaiBaru,
    editedAt: serverTimestamp(),
  });
}

export async function getChangelog(): Promise<ChangelogEntry[]> {
  const ref = collection(db, 'changelog');
  const q = query(ref, orderBy('editedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChangelogEntry));
}
