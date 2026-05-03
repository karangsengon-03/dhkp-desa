'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loginWithEmail, getSavedUser, saveUser } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';

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

  useEffect(() => {
    const saved = getSavedUser();
    if (saved?.email) setEmail(saved.email);
    // Password TIDAK disimpan — Firebase Auth persistence menjaga sesi otomatis
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
        style={{ background: 'var(--c-bg)' }}
      >
        <div className="w-full max-w-xs flex flex-col gap-3">
          <div className="w-16 h-16 rounded-xl skeleton mx-auto" />
          <div className="w-40 h-5 rounded skeleton mx-auto" />
          <div className="w-28 h-3 rounded skeleton mx-auto" />
          <div className="h-1 w-full rounded skeleton" />
          <div className="card p-5 flex flex-col gap-3">
            <div className="w-24 h-3 rounded skeleton" />
            <div className="w-full h-10 rounded-lg skeleton" />
            <div className="w-24 h-3 rounded skeleton" />
            <div className="w-full h-10 rounded-lg skeleton" />
            <div className="w-36 h-4 rounded skeleton" />
            <div className="w-full h-10 rounded-lg skeleton" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--c-bg)' }}
    >
      <div className="w-full max-w-xs">

        {/* Brand header — navy bg */}
        <div
          className="rounded-t-2xl px-6 pt-8 pb-6 text-center"
          style={{ background: 'var(--c-navy)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-128.png"
            alt="DHKP"
            className="w-14 h-14 rounded-xl mx-auto mb-3"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.35)' }}
          />
          <h1
            className="font-bold leading-tight"
            style={{ color: 'var(--c-text-inv)', fontSize: 'var(--text-xl)' }}
          >
            DHKP
          </h1>
          <p
            className="mt-0.5 font-semibold"
            style={{ color: 'var(--c-gold)', fontSize: 'var(--text-sm)' }}
          >
            Desa Karang Sengon
          </p>
        </div>

        {/* Gold stripe */}
        <div
          className="h-1"
          style={{
            background: 'linear-gradient(90deg, var(--c-gold-dark), var(--c-gold), var(--c-gold-dark))',
          }}
        />

        {/* Form card */}
        <div
          className="rounded-b-2xl px-6 py-6"
          style={{ background: 'var(--c-surface)', boxShadow: 'var(--shadow-lg)' }}
        >
          <p
            className="font-semibold text-center mb-5"
            style={{ color: 'var(--c-text-1)', fontSize: 'var(--text-sm)' }}
          >
            Masuk ke Sistem
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            {/* Email */}
            <div>
              <label
                className="block font-semibold mb-1.5"
                style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}
              >
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
              <label
                className="block font-semibold mb-1.5"
                style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}
              >
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
                  className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPass
                    ? <EyeOff size={15} style={{ color: 'var(--c-text-4)' }} />
                    : <Eye size={15} style={{ color: 'var(--c-text-4)' }} />
                  }
                </button>
              </div>
            </div>

            {/* Ingat email */}
            <label className="flex items-center gap-2 cursor-pointer select-none mt-0.5 py-1">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--c-navy)' }}
              />
              <span style={{ color: 'var(--c-text-3)', fontSize: 'var(--text-xs)' }}>
                Ingat email saya
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-md w-full mt-1"
            >
              {submitting ? (
                <>
                  <span
                    className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.4)', borderTopColor: 'var(--c-text-inv)' }}
                  />
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

          <p
            className="text-center mt-5"
            style={{ color: 'var(--c-text-4)', fontSize: 'var(--text-xs)' }}
          >
            Desa Karang Sengon · PBB-P2
          </p>
        </div>
      </div>
    </div>
  );
}
