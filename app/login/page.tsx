'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loginWithEmail, getSavedUser, saveUser } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { ROUTES } from '@/lib/routes';

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
    if (!loading && user) router.replace(ROUTES.dashboard);
  }, [user, loading, router]);

  useEffect(() => {
    const saved = getSavedUser();
    if (saved?.email) setEmail(saved.email);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      showToast('Email dan kata sandi wajib diisi', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      if (remember) saveUser(email, email.split('@')[0]);
      showToast('Berhasil masuk ke sistem', 'success');
      router.replace(ROUTES.dashboard);
    } catch {
      showToast('Email atau kata sandi salah', 'danger');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--c-navy)',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo & Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/*
            Menggunakan next/image untuk optimasi otomatis (WebP, lazy load).
            unoptimized=false (default) agar Next.js bisa serve format optimal.
          */}
          <Image
            src="/icons/icon-128.png"
            alt="DHKP"
            width={72}
            height={72}
            priority
            style={{
              borderRadius: 16,
              margin: '0 auto 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              display: 'block',
            }}
          />
          <h1 style={{
            fontSize: 28, fontWeight: 800,
            color: '#ffffff', letterSpacing: '-0.5px',
            marginBottom: 4,
          }}>
            DHKP
          </h1>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--c-gold)' }}>
            Desa Karang Sengon
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '32px 28px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <p style={{
            fontSize: 15, fontWeight: 600,
            color: '#1A1A1A', textAlign: 'center',
            marginBottom: 24,
          }}>
            Masuk ke Sistem
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block', fontSize: 13,
                  fontWeight: 600, color: '#595959',
                  marginBottom: 8,
                }}
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="nama@desa.go.id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="login-input"
              />
            </div>

            {/* Kata Sandi */}
            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: 'block', fontSize: 13,
                  fontWeight: 600, color: '#595959',
                  marginBottom: 8,
                }}
              >
                Kata Sandi
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="login-input"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  style={{
                    position: 'absolute', right: 0, top: 0,
                    width: 48, height: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', color: '#767676',
                    borderRadius: '0 8px 8px 0',
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Ingat email — baris sendiri, jelas */}
            <label style={{
              display: 'flex', alignItems: 'center',
              gap: 10, cursor: 'pointer',
              padding: '4px 0',
            }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{
                  width: 18, height: 18,
                  flexShrink: 0, cursor: 'pointer',
                  accentColor: '#1E3A5F',
                }}
              />
              <span style={{ fontSize: 14, color: '#595959', userSelect: 'none' }}>
                Ingat email saya
              </span>
            </label>

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, width: '100%', height: 52,
                background: submitting ? '#4A6A8F' : '#1E3A5F',
                color: '#ffffff', border: 'none',
                borderRadius: 8, fontSize: 16,
                fontWeight: 700, fontFamily: 'inherit',
                cursor: submitting ? 'not-allowed' : 'pointer',
                marginTop: 4,
                transition: 'background 150ms ease',
              }}
            >
              {submitting ? (
                <>
                  <span style={{
                    width: 18, height: 18,
                    border: '2px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Masuk...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk
                </>
              )}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: 20,
            fontSize: 13, color: '#A0A0A0',
          }}>
            Desa Karang Sengon · PBB-P2
          </p>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }

          /*
           * .login-input: input styling khusus halaman login.
           * Menggunakan CSS class (bukan inline style) agar :focus-visible global
           * dari globals.css tetap berfungsi untuk keyboard navigation.
           * Border-color pada focus dihandle via box-shadow agar tidak konflik
           * dengan :focus-visible outline.
           */
          .login-input {
            display: block;
            width: 100%;
            height: 48px;
            padding: 0 14px;
            font-size: 15px;
            font-family: inherit;
            color: #1A1A1A;
            background: #F8F9FA;
            border: 1.5px solid #DDD8CE;
            border-radius: 8px;
            box-sizing: border-box;
            transition: border-color 150ms ease, box-shadow 150ms ease;
          }
          .login-input:focus,
          .login-input:focus-visible {
            outline: 2px solid transparent; /* outline transparan agar tidak double dengan box-shadow di bawah */
            outline-offset: 2px;
            border-color: #1E3A5F;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(30,58,95,0.15);
          }
        `}</style>
      </div>
    </div>
  );
}
