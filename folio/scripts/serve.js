#!/usr/bin/env node
// serve.js — Folio local run launcher
//
// One command to run a folio site root the dynamic way: ensure the artifacts
// folder exists, regenerate the index/search page from .folio/site.json, find
// an open port, and serve over HTTP bound to loopback.
//
// Zero npm dependencies (Node stdlib only). Safe to re-run.
//
// Usage:
//   node serve.js                      # site-root = current directory
//   node serve.js <site-root>          # explicit site root
//   node serve.js <site-root> -p 8080  # request a specific port
//   node serve.js <site-root> --host 0.0.0.0   # expose on LAN (opt-in)
//   node serve.js <site-root> --no-index       # skip index regeneration
//
// Flags:
//   -p, --port <n>   Preferred port. Falls back to 8080, 8888, then an
//                    OS-assigned free port if the request is taken.
//   --host <addr>    Bind address. Default 127.0.0.1 (loopback only).
//                    Use 0.0.0.0 only when LAN/remote access is wanted.
//   --no-index       Do not regenerate index.html before serving.
//
// Why this exists: an artifact opens fine from file://, but relative
// fetch('./data/...') and ES module imports fail there. Serving over HTTP from
// the site root makes those work and keeps the generated index/search honest —
// it is rebuilt from the manifest ledger on every launch.

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawnSync } = require('child_process');

// ---- argument parsing -------------------------------------------------------

const argv = process.argv.slice(2);
let siteRootArg = null;
let preferredPort = null;
let host = '127.0.0.1';
let regenIndex = true;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '-p' || a === '--port') {
    preferredPort = parseInt(argv[++i], 10);
  } else if (a.startsWith('--port=')) {
    preferredPort = parseInt(a.slice('--port='.length), 10);
  } else if (a === '--host') {
    host = argv[++i];
  } else if (a.startsWith('--host=')) {
    host = a.slice('--host='.length);
  } else if (a === '--no-index') {
    regenIndex = false;
  } else if (a === '-h' || a === '--help') {
    printHelp();
    process.exit(0);
  } else if (a.startsWith('-')) {
    fail('unknown flag: ' + a + ' (try --help)');
  } else if (siteRootArg === null) {
    siteRootArg = a;
  } else {
    fail('unexpected argument: ' + a);
  }
}

if (preferredPort !== null && (isNaN(preferredPort) || preferredPort < 0 || preferredPort > 65535)) {
  fail('invalid --port value; expected 0–65535');
}

const siteRoot = path.resolve(siteRootArg || '.');
const PORT_CANDIDATES = [preferredPort, 8000, 8080, 8888].filter(
  (p, i, all) => p !== null && p !== undefined && all.indexOf(p) === i
);

// ---- helpers ----------------------------------------------------------------

function fail(msg) {
  process.stderr.write('serve: ' + msg + '\n');
  process.exit(1);
}

function note(msg) {
  process.stdout.write('serve: ' + msg + '\n');
}

function printHelp() {
  process.stdout.write([
    'Folio local run launcher',
    '',
    'Usage: node serve.js [site-root] [-p port] [--host addr] [--no-index]',
    '',
    '  site-root      Directory to serve (default: current directory).',
    '  -p, --port n   Preferred port (falls back to 8080, 8888, then free).',
    '  --host addr    Bind address (default 127.0.0.1; use 0.0.0.0 for LAN).',
    '  --no-index     Skip regenerating index.html from .folio/site.json.',
    ''
  ].join('\n'));
}

// Minimal content-type table. Unknown types fall back to octet-stream.
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf'
};

function contentType(p) {
  return MIME[path.extname(p).toLowerCase()] || 'application/octet-stream';
}

// ---- preflight: site root + artifacts folder --------------------------------

if (!fs.existsSync(siteRoot)) {
  fail('site root does not exist: ' + siteRoot);
}
if (!fs.statSync(siteRoot).isDirectory()) {
  fail('site root is not a directory: ' + siteRoot);
}

// Ensure the artifacts folder exists by default — every folio site root has one.
const artifactsDir = path.join(siteRoot, 'artifacts');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
  note('created artifacts/ (was missing)');
}

// ---- regenerate the index/search page from the manifest ---------------------

const manifestPath = path.join(siteRoot, '.folio', 'site.json');
if (regenIndex) {
  if (fs.existsSync(manifestPath)) {
    const genIndex = path.join(__dirname, 'gen-index.js');
    const r = spawnSync(process.execPath, [genIndex, siteRoot], { encoding: 'utf8' });
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.status !== 0) {
      if (r.stderr) process.stderr.write(r.stderr);
      note('index regeneration failed; serving existing files');
    }
  } else {
    note('no .folio/site.json — serving as a standalone folder (no index regen)');
  }
}

// ---- static request handler -------------------------------------------------

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'Cache-Control': 'no-cache' }, headers || {}));
  res.end(body);
}

function handle(req, res) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  } catch (e) {
    return send(res, 400, 'Bad Request', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  // Resolve against the site root and guard against path traversal.
  const rel = urlPath.replace(/^\/+/, '');
  let target = path.resolve(siteRoot, rel);
  if (target !== siteRoot && !target.startsWith(siteRoot + path.sep)) {
    return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  fs.stat(target, function (err, stat) {
    if (!err && stat.isDirectory()) {
      // Directory: redirect to trailing slash, then serve index.html.
      if (!urlPath.endsWith('/')) {
        return send(res, 301, '', { Location: urlPath + '/' });
      }
      target = path.join(target, 'index.html');
    }
    fs.readFile(target, function (readErr, data) {
      if (readErr) {
        return send(res, 404, 'Not found: ' + urlPath, {
          'Content-Type': 'text/plain; charset=utf-8'
        });
      }
      send(res, 200, data, { 'Content-Type': contentType(target) });
    });
  });
}

// ---- port selection + listen ------------------------------------------------

function tryListen(ports, idx) {
  const server = http.createServer(handle);
  const isLast = idx >= ports.length;
  const port = isLast ? 0 : ports[idx]; // 0 = OS-assigned free port

  server.on('error', function (err) {
    if (err.code === 'EADDRINUSE' && !isLast) {
      note('port ' + port + ' in use, trying next');
      tryListen(ports, idx + 1);
    } else if (err.code === 'EADDRINUSE') {
      fail('no free port found');
    } else {
      fail(err.message);
    }
  });

  server.listen(port, host, function () {
    const actual = server.address().port;
    const shownHost = host === '0.0.0.0' ? hostLanHint() : host;
    note('serving ' + siteRoot);
    note('url:  http://' + shownHost + ':' + actual + '/');
    note('pid:  ' + process.pid + '   (stop: kill ' + process.pid + ', or Ctrl-C)');
    if (host === '0.0.0.0') {
      note('warning: bound to 0.0.0.0 — reachable from the local network');
    }
  });

  function shutdown() {
    server.close(function () { process.exit(0); });
    // Force-exit if connections linger.
    setTimeout(function () { process.exit(0); }, 500).unref();
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

function hostLanHint() {
  // Best-effort first non-internal IPv4 for the LAN hint; falls back to host.
  try {
    const nets = require('os').networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const ni of nets[name]) {
        if (ni.family === 'IPv4' && !ni.internal) return ni.address;
      }
    }
  } catch (e) { /* ignore */ }
  return '0.0.0.0';
}

tryListen(PORT_CANDIDATES, 0);
