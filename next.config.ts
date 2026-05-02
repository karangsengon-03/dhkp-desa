import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

// Inject BUILD_HASH ke sw.js saat build
const buildHash = Date.now().toString(36);
const swPath = path.join(process.cwd(), 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (swContent.includes('__BUILD_HASH__')) {
    fs.writeFileSync(swPath, swContent.replace(/__BUILD_HASH__/g, buildHash));
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},

  // Headers: no-cache untuk sw.js dan manifest
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },
};

export default nextConfig;
