'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loginWithEmail, getSavedUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Kondisi 1: sudah login → redirect dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Kondisi 2: ada saved user → prefill email
  useEffect(() => {
    const saved = getSavedUser();
    if (saved?.email) setEmail(saved.email);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Email dan password wajib diisi', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      // saveUser dipanggil setelah berhasil
      const { saveUser } = await import('@/lib/auth');
      saveUser(email, email.split('@')[0]);
      showToast('Login berhasil!', 'success');
      router.replace('/dashboard');
    } catch {
      showToast('Email atau password salah', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        <div className="w-full max-w-sm">
          <div className="w-16 h-16 rounded-2xl skeleton mx-auto mb-6" />
          <div className="w-48 h-5 rounded skeleton mx-auto mb-2" />
          <div className="w-32 h-3.5 rounded skeleton mx-auto mb-8" />
          <div className="card p-6 flex flex-col gap-4">
            <div className="w-full h-11 rounded-lg skeleton" />
            <div className="w-full h-11 rounded-lg skeleton" />
            <div className="w-full h-11 rounded-lg skeleton" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Card */}
      <div className="w-full max-w-sm">
        {/* Header branding */}
        <div
          className="rounded-t-2xl px-8 py-8 text-center"
          style={{ background: 'var(--color-primary)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-128.png"
            alt="DHKP"
            className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg"
          />
          <h1 className="text-white font-bold text-xl leading-tight">
            DHKP Desa
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-gold)' }}>
            Karang Sengon
          </p>
        </div>

        {/* Gold stripe */}
        <div className="h-1.5" style={{ background: 'var(--color-gold)' }} />

        {/* Form */}
        <div
          className="rounded-b-2xl px-8 py-8 shadow-lg"
          style={{ background: 'var(--color-surface)' }}
        >
          <h2
            className="text-base font-semibold mb-6 text-center"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Masuk ke Sistem
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="nama@desa.go.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass
                    ? <EyeOff size={16} style={{ color: 'var(--color-text-disabled)' }} />
                    : <Eye size={16} style={{ color: 'var(--color-text-disabled)' }} />
                  }
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="mt-2 w-full"
            >
              <LogIn size={18} />
              Masuk
            </Button>
          </form>

          <p
            className="text-center text-xs mt-6"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            Desa Karang Sengon · PBB-P2
          </p>
        </div>
      </div>
    </div>
  );
}
