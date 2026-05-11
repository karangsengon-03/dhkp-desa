/**
 * lib/logger.ts
 * Wrapper logging terpusat untuk DHKP Desa Karang Sengon.
 *
 * Aturan:
 * - Tidak pernah log data sensitif warga (NIK, nama, NOP, nomor telepon)
 * - Di production: tidak ada output (Sentry tidak dipakai — berbayar)
 * - Di development: log ke console dengan prefix [DHKP]
 *
 * Catatan: Sentry sengaja dihapus dari project ini karena membutuhkan
 * langganan berbayar dan memperlambat build Vercel. Error di production
 * dapat dipantau via Vercel Functions Logs dan Firebase Console.
 */

type LogLevel = 'info' | 'warn' | 'error';

function isProd() {
  return process.env.NODE_ENV === 'production';
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  // Di production: tidak ada output — tidak ada Sentry, tidak ada console
  if (isProd()) return;

  // Development: log ke console dengan prefix
  const prefix = `[DHKP:${level.toUpperCase()}]`;
  if (level === 'error') {
    console.error(prefix, message, context ?? '');
  } else if (level === 'warn') {
    console.warn(prefix, message, context ?? '');
  } else {
    console.info(prefix, message, context ?? '');
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) =>
    log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) =>
    log('error', message, context),

  /**
   * Log exception — console di dev, silent di production.
   * JANGAN pass objek yang mengandung data warga di sini.
   */
  exception: (error: unknown, context?: Record<string, unknown>) => {
    const message = error instanceof Error ? error.message : String(error);
    log('error', message, context);
  },
};
