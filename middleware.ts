import { NextRequest, NextResponse } from 'next/server';

/**
 * middleware.ts
 * Proteksi route server-side untuk DHKP Desa Karang Sengon.
 *
 * Strategi: Firebase Auth menyimpan sesi di localStorage (browserLocalPersistence),
 * bukan cookie HTTP. Middleware tidak bisa verifikasi Firebase token secara langsung
 * tanpa Firebase Admin SDK (yang butuh service account — tidak sesuai arsitektur apps desa ini).
 *
 * Solusi: Cek cookie penanda sesi "dhkp_session" yang di-set saat login dan di-clear saat logout.
 * Ini bukan auth penuh, tapi cukup untuk mencegah akses langsung ke halaman protected
 * sebelum JS/React hydrate dan useAuth-redirect berjalan.
 *
 * Lapisan keamanan data tetap ada di Firestore Security Rules.
 */

const PUBLIC_PATHS = ['/login', '/offline'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewatkan path publik, asset statis, dan API internal Next.js
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/favicon-32x32.png' ||
    pathname === '/apple-touch-icon.png' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Redirect root ke login jika belum ada sesi
  if (pathname === '/') {
    return NextResponse.next(); // app/page.tsx handle redirect ke /login
  }

  // Cek cookie sesi
  const session = request.cookies.get('dhkp_session');
  if (!session?.value) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
