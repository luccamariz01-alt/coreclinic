const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
  // Basic hardening for a static server:
  // - avoid path traversal by enforcing the resolved path stays inside __dirname
  // - handle malformed % encoding
  // - set a few defensive headers
  let urlPath = '/';
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0] || '/');
  } catch (_) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  if (urlPath === '/' || urlPath === '') urlPath = '/login.html';

  const safePath = path
    .normalize(urlPath)
    .replace(/^([/\\])+/, '');

  const filePath = path.join(__dirname, safePath);
  const rootPath = path.resolve(__dirname) + path.sep;
  const resolved = path.resolve(filePath);

  if (!resolved.startsWith(rootPath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(resolved);
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(resolved, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://wcmowsufrfrjajxpmcgn.supabase.co; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
    });
    res.end(data);
  });
}).listen(8080, () => {
  console.log('Servidor rodando em http://localhost:8080/login.html');
});
