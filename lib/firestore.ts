import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { DHKPRecord, GlobalLock, AppInfo } from '@/types';

// ── DHKP Records ────────────────────────────────────────────
export function subscribeDHKP(tahun: number, callback: (records: DHKPRecord[]) => void): () => void {
  const ref = collection(db, 'dhkp', String(tahun), 'records');
  const q = query(ref, orderBy('nomor', 'asc'));
  return onSnapshot(q, (snap) => {
    const records: DHKPRecord[] = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    } as DHKPRecord));
    callback(records);
  });
}

export async function getDHKP(tahun: number): Promise<DHKPRecord[]> {
  const ref = collection(db, 'dhkp', String(tahun), 'records');
  const q = query(ref, orderBy('nomor', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as DHKPRecord));
}

export async function addRecord(tahun: number, data: Omit<DHKPRecord, 'id'>): Promise<string> {
  const ref = collection(db, 'dhkp', String(tahun), 'records');
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateRecord(
  tahun: number,
  id: string,
  data: Partial<DHKPRecord>
): Promise<void> {
  const ref = doc(db, 'dhkp', String(tahun), 'records', id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteRecord(tahun: number, id: string): Promise<void> {
  const ref = doc(db, 'dhkp', String(tahun), 'records', id);
  await deleteDoc(ref);
}

// ── Global Lock ──────────────────────────────────────────────
export function subscribeGlobalLock(callback: (lock: GlobalLock) => void): () => void {
  const ref = doc(db, 'settings', 'globalLock');
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as GlobalLock);
    } else {
      callback({ isLocked: false, lockedBy: '', lockedAt: undefined });
    }
  });
}

export async function setGlobalLock(isLocked: boolean, lockedBy: string): Promise<void> {
  const ref = doc(db, 'settings', 'globalLock');
  await updateDoc(ref, { isLocked, lockedBy, lockedAt: serverTimestamp() }).catch(async () => {
    const { setDoc } = await import('firebase/firestore');
    await setDoc(ref, { isLocked, lockedBy, lockedAt: serverTimestamp() });
  });
}

// ── App Info ─────────────────────────────────────────────────
export async function getAppInfo(): Promise<AppInfo | null> {
  const ref = doc(db, 'settings', 'appInfo');
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as AppInfo) : null;
}

export async function updateAppInfo(data: Partial<AppInfo>): Promise<void> {
  const ref = doc(db, 'settings', 'appInfo');
  const { setDoc } = await import('firebase/firestore');
  await setDoc(ref, data, { merge: true });
}
