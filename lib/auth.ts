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

/**
 * Set cookie penanda sesi untuk middleware.
 * Cookie ini dipakai middleware.ts untuk redirect server-side sebelum React hydrate.
 * Bukan pengganti Firebase Auth — hanya penanda "sudah pernah login".
 *
 * Flag Secure ditambahkan secara kondisional:
 * - Di production (HTTPS): Secure aktif → cegah transmisi via HTTP
 * - Di localhost (HTTP): Secure tidak ditambahkan → tidak akan diblokir browser
 */
function isHttps(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

function setSessionCookie() {
  if (typeof document === 'undefined') return;
  const secureFlag = isHttps() ? '; Secure' : '';
  document.cookie = `dhkp_session=1; path=/; SameSite=Strict; max-age=604800${secureFlag}`; // 7 hari
}

function clearSessionCookie() {
  if (typeof document === 'undefined') return;
  const secureFlag = isHttps() ? '; Secure' : '';
  document.cookie = `dhkp_session=; path=/; SameSite=Strict; max-age=0${secureFlag}`;
}

export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  setSessionCookie();
  return result;
}

export async function logout() {
  clearSessionCookie();
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
