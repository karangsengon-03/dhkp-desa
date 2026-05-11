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

setPersistence(auth, browserLocalPersistence).catch(() => {});

function isHttps(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

function setSessionCookie() {
  if (typeof document === 'undefined') return;
  const secureFlag = isHttps() ? '; Secure' : '';
  document.cookie = `dhkp_session=1; path=/; SameSite=Strict; max-age=604800${secureFlag}`;
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
  // Sengaja TIDAK hapus dhkp_saved_user — email & password tetap tersimpan
  // untuk kemudahan login ulang. Apps ini hanya diakses admin internal desa.
  return signOut(auth);
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Tidak ada user yang login');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return updatePassword(user, newPassword);
}

/**
 * Simpan kredensial ke localStorage untuk fitur "Ingat email & kata sandi".
 * Apps ini adalah internal tool admin desa — tidak ada data sensitif warga di sini.
 * Keamanan data warga ada di Firestore Security Rules (UID allowlist).
 */
export function getSavedCredentials(): { email: string; password: string; displayName: string } | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('dhkp_saved_user');
  if (!saved) return null;
  try {
    return JSON.parse(saved) as { email: string; password: string; displayName: string };
  } catch {
    return null;
  }
}

export function saveCredentials(email: string, password: string, displayName: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('dhkp_saved_user', JSON.stringify({ email, password, displayName }));
}

// Alias lama — backward compat
export const getSavedUser = getSavedCredentials;
export function saveUser(email: string, displayName: string) {
  // Panggil dengan password kosong — akan di-overwrite oleh saveCredentials
  if (typeof window === 'undefined') return;
  const existing = getSavedCredentials();
  localStorage.setItem('dhkp_saved_user', JSON.stringify({
    email,
    password: existing?.password ?? '',
    displayName,
  }));
}
export function clearSavedUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('dhkp_saved_user');
}
