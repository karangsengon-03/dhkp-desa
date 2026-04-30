'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loginWithEmail, getSavedUser, saveUser } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

const SAVED_PWD_KEY = 'dhkp_saved_pwd';

function getSavedPassword(): string {
  if (typeof window === 'undefined') return '';
  try { return localStorage.getItem(SAVED_PWD_KEY) || ''; } catch { return ''; }
}
function setSavedPassword(pwd: string) {
  if (typeof window === 'undefined') return;
  try {
    if (pwd) localStorage.setItem(SAVED_PWD_KEY, pwd);
    else localStorage.removeItem(SAVED_PWD_KEY);
  } catch {}
}

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  // Prefill email + password dari localStorage
  useEffect(() => {
    const saved = getSavedUser();
    if (saved?.email) setEmail(saved.email);
    const savedPwd = getSavedPassword();
    if (savedPwd) setPassword(savedPwd);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      showToast('Email dan password wajib diisi', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      if (remember) {
        saveUser(email, email.split('@')[0]);
        setSavedPassword(password);
      } else {
        setSavedPassword('');
      }
      showToast('Login berhasil!', 'success');
      router.replace('/dashboard');
    } catch {
      showToast('Email atau password salah', 'danger');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="w-full max-w-xs flex flex-col gap-3">
          <div className="w-20 h-20 rounded-2xl skeleton mx-auto" />
          <div className="w-40 h-4 rounded skeleton mx-auto" />
          <div className="w-28 h-3 rounded skeleton mx-auto" />
          <div className="card p-5 mt-2 flex flex-col gap-3">
            <div className="w-full h-10 rounded-lg skeleton" />
            <div className="w-full h-10 rounded-lg skeleton" />
            <div className="w-full h-10 rounded-lg skeleton" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-xs">

        {/* Brand header */}
        <div
          className="rounded-t-2xl px-6 pt-8 pb-6 text-center"
          style={{ background: 'var(--color-primary)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-128.png"
            alt="DHKP"
            className="w-14 h-14 rounded-xl mx-auto mb-3 shadow-lg"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
          />
          <h1 className="text-white font-bold text-lg leading-tight">DHKP Desa</h1>
          <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--color-gold)' }}>
            Karang Sengon
          </p>
        </div>

        {/* Gold divider */}
        <div className="h-1" style={{ background: `linear-gradient(90deg, var(--color-gold-dark), var(--color-gold), var(--color-gold-dark))` }} />

        {/* Form */}
        <div
          className="rounded-b-2xl px-6 py-6"
          style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg)' }}
        >
          <h2
            className="text-sm font-semibold text-center mb-5"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Masuk ke Sistem
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="nama@desa.go.id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showPass
                    ? <EyeOff size={15} style={{ color: 'var(--color-text-disabled)' }} />
                    : <Eye size={15} style={{ color: 'var(--color-text-disabled)' }} />
                  }
                </button>
              </div>
            </div>

            {/* Ingat saya */}
            <label className="flex items-center gap-2 cursor-pointer select-none mt-0.5">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--color-primary)]"
              />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Ingat email & password
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full mt-1"
              style={{ padding: '11px 0', fontSize: '14px' }}
            >
              {submitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Masuk...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Masuk
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: 'var(--color-text-disabled)' }}>
            Desa Karang Sengon · PBB-P2
          </p>
        </div>
      </div>
    </div>
  );
}
