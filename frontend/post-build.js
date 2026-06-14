/**
 * post-build.js
 * Runs after `react-scripts build` to convert render-blocking CSS links
 * (main.*.css, chunk.css) to non-blocking preload links in the built index.html.
 */
const fs = require('fs');
const path = require('path');

const buildIndex = path.join(__dirname, 'build', 'index.html');

if (!fs.existsSync(buildIndex)) {
  console.log('post-build: build/index.html not found, skipping.');
  process.exit(0);
}

let html = fs.readFileSync(buildIndex, 'utf8');

// Convert all <link rel="stylesheet" href="...css/main.*.css"> to preload+noscript
html = html.replace(
  /<link\s+href="([^"]*\.css)"\s+rel="stylesheet">/g,
  (match, href) => {
    // Keep bootstrap as render-blocking since we handle it in template
    // Convert React-generated CSS chunks to non-blocking
    if (href.includes('/static/css/')) {
      return `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`;
    }
    return match;
  }
);

fs.writeFileSync(buildIndex, html);
console.log('post-build: Deferred render-blocking CSS links in build/index.html');
