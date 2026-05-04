#!/usr/bin/env node
/**
 * scripts/inject-sw-hash.js
 *
 * Dijalankan SEBELUM next build via package.json "prebuild".
 * 1. Baca sw.template.js (selalu berisi __BUILD_HASH__)
 * 2. Replace __BUILD_HASH__ dengan timestamp unik
 * 3. Tulis ke public/sw.js (yang dipakai browser)
 *
 * public/sw.js TIDAK di-commit ke git — diabaikan via .gitignore.
 * public/sw.template.js yang di-commit.
 */

const fs   = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '..', 'public', 'sw.template.js');
const outputPath   = path.join(__dirname, '..', 'public', 'sw.js');

if (!fs.existsSync(templatePath)) {
  console.error('[inject-sw-hash] ERROR: sw.template.js tidak ditemukan!');
  process.exit(1);
}

const buildHash = Date.now().toString(36);
const template  = fs.readFileSync(templatePath, 'utf8');
const output    = template.replace(/__BUILD_HASH__/g, buildHash);

fs.writeFileSync(outputPath, output, 'utf8');
console.log(`[inject-sw-hash] sw.js diupdate dengan hash: ${buildHash}`);
