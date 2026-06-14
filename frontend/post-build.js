/**
 * post-build.js — runs after `react-scripts build`
 * 1. Defers render-blocking React CSS chunks
 * 2. Minifies unminified JS files in /assets/js
 * 3. Converts logo-skin-8.gif → logo-skin-8.webp (sharp required)
 */
const fs = require('fs');
const path = require('path');

const BUILD = path.join(__dirname, 'build');

if (!fs.existsSync(BUILD)) {
  console.log('post-build: build/ not found, skipping.');
  process.exit(0);
}

// ── 1. Defer render-blocking CSS chunks ────────────────────────────────────
const buildIndex = path.join(BUILD, 'index.html');
let html = fs.readFileSync(buildIndex, 'utf8');
html = html.replace(
  /<link\s+href="([^"]*\.css)"\s+rel="stylesheet">/g,
  (match, href) => {
    if (href.includes('/static/css/')) {
      return `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`;
    }
    return match;
  }
);
fs.writeFileSync(buildIndex, html);
console.log('post-build: Deferred render-blocking CSS chunks.');

// ── 2. Minify unminified JS files ──────────────────────────────────────────
const filesToMinify = [
  'assets/js/lc_lightbox.lite.js',
  'assets/js/custom.js',
  'assets/js/jquery.scrollbar.js',
  'assets/js/bootstrap-datepicker.js',
];

let terser;
try {
  terser = require('terser');
} catch {
  console.log('post-build: terser not found, skipping JS minification. Run: npm install --save-dev terser');
}

if (terser) {
  (async () => {
    for (const rel of filesToMinify) {
      const filePath = path.join(BUILD, rel);
      if (!fs.existsSync(filePath)) continue;
      const code = fs.readFileSync(filePath, 'utf8');
      try {
        const result = await terser.minify(code, { compress: true, mangle: true });
        if (result.code) {
          const before = code.length;
          const after = result.code.length;
          fs.writeFileSync(filePath, result.code);
          console.log(`post-build: Minified ${rel} (${Math.round(before/1024)}KB → ${Math.round(after/1024)}KB)`);
        }
      } catch (e) {
        console.warn(`post-build: Could not minify ${rel}:`, e.message);
      }
    }
  })();
}


