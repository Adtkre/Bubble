/**
 * BUBBLE - Local Static & API Server
 * Seamlessly handles static web assets and /api serverless endpoints
 * with zero dependencies, identical to Vercel production.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// Map of API routes to their handler modules
const API_ROUTES = {
  '/api/auth/signup': './api/auth/signup',
  '/api/auth/login': './api/auth/login',
  '/api/auth/me': './api/auth/me',
  '/api/admin/stats': './api/admin/stats',
  '/api/admin/users': './api/admin/users',
  '/api/admin/logs': './api/admin/logs',
  '/api/projects': './api/projects/index'
};

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('?');
  const pathname = urlParts[0];

  // Route API endpoints
  if (pathname.startsWith('/api/')) {
    const cleanPath = pathname.replace(/\/$/, '');
    const handlerPath = API_ROUTES[cleanPath];

    if (handlerPath) {
      try {
        const handler = require(handlerPath);
        return await handler(req, res);
      } catch (err) {
        console.error(`API Error on ${cleanPath}:`, err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Internal API error' }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: `API endpoint not found: ${pathname}` }));
    }
  }

  // Serve Static Assets
  let parsedUrl = pathname;
  if (parsedUrl === '/') {
    parsedUrl = '/index.html';
  }

  const safePath = path.normalize(parsedUrl).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${parsedUrl}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  Bubble Visual Coding Platform + Database API`);
  console.log(`  Local App URL:    http://localhost:${PORT}/dashboard.html`);
  console.log(`  Admin Portal URL: http://localhost:${PORT}/admin.html`);
  console.log(`  Default Admin:    admin@bubble.dev / admin123`);
  console.log(`======================================================\n`);
});
