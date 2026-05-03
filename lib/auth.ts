import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { auth } from './firebase';

// Aktifkan Firebase Auth persistence — sesi login tetap aktif setelah browser ditutup.
// Ini menggantikan kebutuhan menyimpan password secara manual di localStorage.
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Gagal set persistence tidak fatal — Firebase tetap bisa login
});

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Tidak ada user yang login');

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return updatePassword(user, newPassword);
}

export function getSavedUser(): { email: string; displayName: string } | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('dhkp_saved_user');
  if (!saved) return null;
  try {
    return JSON.parse(saved) as { email: string; displayName: string };
  } catch {
    return null;
  }
}

export function saveUser(email: string, displayName: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('dhkp_saved_user', JSON.stringify({ email, displayName }));
}

export function clearSavedUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('dhkp_saved_user');
}
