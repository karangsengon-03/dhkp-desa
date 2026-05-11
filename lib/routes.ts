/**
 * lib/routes.ts
 * Satu-satunya sumber kebenaran untuk semua URL path di DHKP.
 * Gunakan ROUTES.xxx di mana pun ada navigasi — jangan hardcode string path.
 */

export const ROUTES = {
  home:        '/',
  login:       '/login',
  dashboard:   '/dashboard',
  data:        '/data',
  rekap:       '/rekap',
  riwayat:     '/riwayat',
  exportImport: '/export-import',
  pengaturan:  '/pengaturan',
  offline:     '/offline',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
