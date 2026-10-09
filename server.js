const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
// Fixed origin for host redirects (www and the bare *.up.railway.app host). Only
// the path and query of the request are carried over, so a crafted URL (//evil,
// /\evil, absolute-form, encoded slashes, CR/LF) can never point off-site.
const CANONICAL_ROOT = 'https://koretheoracle.com/';
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests"
].join('; ');

const INDEX_HTML = fs
  .readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .replaceAll('https://philipryandeal.github.io/koretheoracle/', 'https://koretheoracle.com/');
// Read once at startup so a 404 never touches the disk.
const NOT_FOUND_HTML = fs.readFileSync(path.join(ROOT, '404.html'));

function canonicalUrl(req) {
  const incoming = new URL(req.originalUrl, 'http://localhost');
  const target = new URL(CANONICAL_ROOT);
  target.pathname = incoming.pathname;
  target.search = incoming.search;
  return target.href;
}

app.disable('x-powered-by');

// Security headers on every response (pages, files, redirects, 404s, errors),
// then the canonical-host redirect. /health stays reachable on any host.
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-Frame-Options', 'DENY');

  const hostname = (req.hostname || '').toLowerCase();
  if ((hostname === 'www.koretheoracle.com' || hostname.endsWith('.up.railway.app')) && req.path !== '/health') {
    return res.redirect(301, canonicalUrl(req));
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ ok: true, house: 'Kore the Oracle' });
});

// Small static files are read once at startup and served from memory, so no
// request touches the disk.
const ICON_CACHE = 'public, max-age=300, must-revalidate';
const STATIC_FILES = {
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
  '/robots.txt': ['robots.txt', 'text/plain; charset=utf-8'],
  '/sitemap.xml': ['sitemap.xml', 'application/xml'],
  '/favicon.svg': ['favicon.svg', 'image/svg+xml', ICON_CACHE],
  '/favicon.png': ['favicon.png', 'image/png', ICON_CACHE],
  '/apple-touch-icon.png': ['favicon.png', 'image/png', ICON_CACHE],
  '/apple-touch-icon-precomposed.png': ['favicon.png', 'image/png', ICON_CACHE],
  '/favicon.ico': ['favicon.ico', 'image/x-icon', ICON_CACHE],
};

for (const [route, [file, type, cacheControl]] of Object.entries(STATIC_FILES)) {
  const body = fs.readFileSync(path.join(ROOT, file));
  app.get(route, (req, res) => {
    if (cacheControl) res.set('Cache-Control', cacheControl);
    res.type(type).send(body);
  });
}

app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.type('html').send(INDEX_HTML);
});

// Anything not served above (any method) gets the house's 404 page from memory.
app.use((req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.status(404).type('html').send(NOT_FOUND_HTML);
});

// Malformed requests (bad encodings, file errors) get a plain error, still with
// the headers above, never a stack trace.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  res.status(status >= 400 && status < 600 ? status : 500).type('text').send(status === 404 ? 'Not found' : 'Error');
});

app.listen(PORT, () => {
  console.log(`Kore the Oracle is listening on port ${PORT}`);
});
