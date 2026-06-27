#!/usr/bin/env node
// share.js — Folio temporary public link (ephemeral tunnel)
//
// One command to put a folio site root behind a temporary public URL so you can
// show it to someone right now. The machine stays the host; the URL lives only
// as long as this process. Nothing is deployed and nothing persists — this is
// NOT publish. For durable hosting elsewhere use `folio publish` (surge / cf).
//
// Default provider is localhost.run over SSH: no install, no account. The `ssh`
// client is already on almost every machine, so the zero-friction path is the
// default. Pass --ngrok to use ngrok instead (needs the `ngrok` binary and a
// configured authtoken).
//
// Zero npm dependencies (Node stdlib only). Stop with Ctrl-C; the tunnel and the
// local server (if this script started it) are torn down together.
//
// Usage:
//   node share.js                      # serve current dir + tunnel via localhost.run
//   node share.js <site-root>          # serve a site root + tunnel
//   node share.js <site-root> --ngrok  # use ngrok instead of localhost.run
//   node share.js --port 8000          # tunnel a server already running on :8000
//
// Flags:
//   --ngrok          Use ngrok instead of localhost.run.
//   -p, --port <n>   Tunnel an already-running local server on this port instead
//                    of starting one. Skips spawning serve.js.
//   --no-index       Passed through to serve.js (skip index regeneration).
//   -h, --help       Show help.
//
// Honesty: the public URL is printed only after it is observed in the tunnel
// provider's own output. If the tunnel exits before a URL appears, its stderr is
// reported and this script exits non-zero. Never claim a share URL that was not
// observed here.

'use strict';

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

// Track children so a single teardown path closes everything (declared before
// arg parsing so fail() can reach them even on an early parse error).
let serveChild = null;
let tunnelChild = null;
let shuttingDown = false;

// ---- argument parsing -------------------------------------------------------

const argv = process.argv.slice(2);
let siteRootArg = null;
let existingPort = null;
let useNgrok = false;
let regenIndex = true;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--ngrok') {
    useNgrok = true;
  } else if (a === '-p' || a === '--port') {
    existingPort = parseInt(argv[++i], 10);
  } else if (a.startsWith('--port=')) {
    existingPort = parseInt(a.slice('--port='.length), 10);
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

if (existingPort !== null && (isNaN(existingPort) || existingPort < 1 || existingPort > 65535)) {
  fail('invalid --port value; expected 1–65535');
}

const provider = useNgrok ? 'ngrok' : 'localhost.run';

// ---- helpers ----------------------------------------------------------------

function fail(msg) {
  process.stderr.write('share: ' + msg + '\n');
  // Tear down anything we started before bailing, so we never orphan a server.
  if (tunnelChild) { try { tunnelChild.kill('SIGTERM'); } catch (e) {} }
  if (serveChild) { try { serveChild.kill('SIGTERM'); } catch (e) {} }
  process.exit(1);
}

function note(msg) {
  process.stdout.write('share: ' + msg + '\n');
}

function printHelp() {
  process.stdout.write([
    'Folio temporary public link (ephemeral tunnel)',
    '',
    'Usage: node share.js [site-root] [--ngrok] [-p port] [--no-index]',
    '',
    '  site-root      Directory to serve (default: current directory).',
    '  --ngrok        Use ngrok instead of localhost.run (default).',
    '  -p, --port n   Tunnel a server already running on this port instead',
    '                 of starting one (skips serve.js).',
    '  --no-index     Passed to serve.js: skip regenerating index.html.',
    '',
    'The URL is temporary: it closes when this process stops (Ctrl-C).',
    'For durable hosting elsewhere, use folio publish (surge / cf).',
    ''
  ].join('\n'));
}

function has(bin) {
  const r = spawnSync(bin, ['--version'], { stdio: 'ignore' });
  return !(r.error && r.error.code === 'ENOENT');
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  if (tunnelChild) { try { tunnelChild.kill('SIGTERM'); } catch (e) {} }
  if (serveChild) { try { serveChild.kill('SIGTERM'); } catch (e) {} }
  setTimeout(function () { process.exit(code || 0); }, 200).unref();
}

process.on('SIGINT', function () { note('closing tunnel'); shutdown(0); });
process.on('SIGTERM', function () { shutdown(0); });

// ---- step 1: get a local port to tunnel -------------------------------------

if (existingPort !== null) {
  // Attach to a server the user already started — do not spawn our own.
  note('tunneling existing server on port ' + existingPort);
  startTunnel(existingPort);
} else {
  const siteRoot = path.resolve(siteRootArg || '.');
  if (!fs.existsSync(siteRoot) || !fs.statSync(siteRoot).isDirectory()) {
    fail('site root does not exist or is not a directory: ' + siteRoot);
  }

  const serveScript = path.join(__dirname, 'serve.js');
  if (!fs.existsSync(serveScript)) {
    fail('cannot find serve.js next to share.js (expected ' + serveScript + ')');
  }

  const serveArgs = [serveScript, siteRoot];
  if (!regenIndex) serveArgs.push('--no-index');

  note('starting local server for ' + siteRoot);
  serveChild = spawn(process.execPath, serveArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

  let port = null;
  let buf = '';

  serveChild.stdout.on('data', function (chunk) {
    const text = chunk.toString();
    process.stdout.write(text); // surface serve.js output (url, pid)
    buf += text;
    if (port === null) {
      const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
      if (m) {
        port = parseInt(m[1], 10);
        startTunnel(port);
      }
    }
  });
  serveChild.stderr.on('data', function (chunk) {
    process.stderr.write(chunk);
  });
  serveChild.on('exit', function (code) {
    if (port === null) fail('local server exited before reporting a port (code ' + code + ')');
    else if (!shuttingDown) { note('local server stopped'); shutdown(code || 0); }
  });

  // If serve.js never prints a port, do not hang forever.
  setTimeout(function () {
    if (port === null) fail('timed out waiting for the local server to start');
  }, 10000).unref();
}

// ---- step 2: open the tunnel ------------------------------------------------

function startTunnel(port) {
  if (useNgrok) startNgrok(port);
  else startLocalhostRun(port);
}

function startLocalhostRun(port) {
  if (!has('ssh')) {
    fail('ssh not found — install OpenSSH, or use --ngrok. ' +
         'localhost.run needs only the ssh client (no account).');
  }
  // nokey@ gives an ephemeral URL without registering an SSH key.
  // accept-new auto-trusts the host key on first connect; keepalives hold it open.
  const args = [
    '-o', 'StrictHostKeyChecking=accept-new',
    '-o', 'ServerAliveInterval=30',
    '-o', 'ExitOnForwardFailure=yes',
    '-R', '80:localhost:' + port,
    'nokey@localhost.run'
  ];
  note('opening tunnel: http://127.0.0.1:' + port + ' -> localhost.run');
  tunnelChild = spawn('ssh', args, { stdio: ['ignore', 'pipe', 'pipe'] });

  let announced = false;
  let buf = '';
  const onData = function (chunk) {
    // Buffer everything; the assigned URL can arrive split across chunks, and
    // localhost.run also prints a welcome banner with admin/docs links we must
    // not mistake for the tunnel URL.
    buf += chunk.toString();
    if (buf.length > 65536) buf = buf.slice(-65536);
    if (!announced) {
      // localhost.run announces: "<sub>.lhr.life tunneled with tls termination,
      // https://<sub>.lhr.life". Key off that line; fall back to a real tunnel
      // subdomain (*.lhr.life) — never the admin.localhost.run banner link.
      const m = buf.match(/tunneled with tls termination,\s*(https:\/\/\S+)/i) ||
                buf.match(/(https:\/\/[a-z0-9-]+\.lhr\.life)\b/i);
      if (m) { announced = true; announce(m[1].replace(/[).,]+$/, '')); }
    }
  };
  tunnelChild.stdout.on('data', onData);
  tunnelChild.stderr.on('data', onData);
  tunnelChild.on('exit', function (code) {
    if (!announced) {
      // Show the tail so the real cause (e.g. permission denied) is visible.
      const tail = buf.trim().split('\n').slice(-8).join('\n');
      if (tail) process.stderr.write(tail + '\n');
      fail('localhost.run tunnel closed before a URL appeared (ssh exit ' + code + ')');
    } else if (!shuttingDown) { note('tunnel closed'); shutdown(code || 0); }
  });

  setTimeout(function () {
    if (!announced) note('still waiting for localhost.run to assign a URL…');
  }, 8000).unref();
}

function startNgrok(port) {
  if (!has('ngrok')) {
    fail('ngrok not found — install it (https://ngrok.com/download) and run ' +
         '`ngrok config add-authtoken <token>`, or drop --ngrok to use ' +
         'localhost.run (no install, no account).');
  }
  const args = ['http', String(port), '--log=stdout', '--log-format=logfmt'];
  note('opening tunnel: http://127.0.0.1:' + port + ' -> ngrok');
  tunnelChild = spawn('ngrok', args, { stdio: ['ignore', 'pipe', 'pipe'] });

  let announced = false;
  tunnelChild.stdout.on('data', function (chunk) {
    const text = chunk.toString();
    if (!announced) {
      const m = text.match(/url=(https:\/\/[^\s"]+)/);
      if (m && /ngrok/.test(m[1])) { announced = true; announce(m[1]); }
    }
    if (/err=|lvl=error|lvl=warn/i.test(text)) process.stderr.write(text);
  });
  tunnelChild.stderr.on('data', function (chunk) { process.stderr.write(chunk); });
  tunnelChild.on('exit', function (code) {
    if (!announced) {
      fail('ngrok exited before a URL appeared (code ' + code + '). ' +
           'A missing authtoken is the usual cause: `ngrok config add-authtoken <token>`.');
    } else if (!shuttingDown) { note('tunnel closed'); shutdown(code || 0); }
  });
}

function announce(url) {
  process.stdout.write('\n');
  note('public  ' + url);
  note('via     ' + provider + ' (ephemeral — closes on Ctrl-C, nothing deployed)');
  note('exposure: public — anyone with the link can load this while the tunnel is up.');
  note('          Confirm no secrets in the artifact; static-only still applies.');
  process.stdout.write('\n');
}
