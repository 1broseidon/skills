# Running locally

This is the canonical guide to **running the artifact system on the local host**.
It is system-agnostic: it names what to do, then gives runtime-specific commands
for whatever is installed. Default host profile is `local`; this file covers it
in full. For publish targets see `references/host-profiles.md`.

## Two run modes

| Mode | What it is | When | Cost |
| --- | --- | --- | --- |
| **Plain `file://`** | Double-click `index.html`, or open the file path in a browser | A single self-contained artifact with everything inlined — no `fetch`, no ES module imports | Zero setup; **breaks** relative `fetch('./data/…')` and module imports |
| **Dynamic local server** (recommended) | Spin up an HTTP server on an open port, serve the **site root** | Anything with a `data/` file, ES modules, cross-artifact links, or a site index/search page | One command; everything works as it will when published |

Plain HTML is fine and is a legitimate handoff. But the moment an artifact loads
a local data file, imports a module, or belongs to a multi-artifact site, serve
it over HTTP. The dynamic mode is the same way the artifact behaves once
published, so verification under it is honest.

## One-command launch (recommended)

The bundled launcher does the whole dynamic-mode setup in one step — zero npm
dependencies, Node stdlib only:

```bash
node <folio-skill>/scripts/serve.js <site-root>
```

It:

1. **Ensures the artifacts folder exists.** Every folio site root has an
   `artifacts/` directory; the launcher creates it if missing.
2. **Regenerates the index/search page from the ledger.** If `<site-root>/.folio/site.json`
   exists, it runs `gen-index.js` to rebuild `index.html` — the default index +
   client-side search page — so the list and the filter match the manifest
   ledger. (Standalone folder with no `site.json`? It skips this and just serves.)
3. **Finds an open port.** Tries `8000`, then `8080`, then `8888`, then an
   OS-assigned free port. It never collides with a port already in use.
4. **Serves the site root** over HTTP, bound to `127.0.0.1` (loopback only), and
   prints the URL and PID.

```text
serve: serving /path/to/site-root
serve: url:  http://127.0.0.1:8000/
serve: pid:  48213   (stop: kill 48213, or Ctrl-C)
```

Flags:

| Flag | Effect |
| --- | --- |
| `-p, --port <n>` | Preferred port (still falls back if taken) |
| `--host <addr>` | Bind address; default `127.0.0.1`. Use `0.0.0.0` only for LAN/remote access — it exposes the server on the network; note that in the handoff |
| `--no-index` | Skip index regeneration (serve files as-is) |

Re-run it any time. Files are read from disk per request, so edits are visible on
the next reload without a restart; re-running also rebuilds the index after
`site.json` changes.

## Manual fallback (no Node, or one-off)

If Node is unavailable, serve the site root with whatever runtime is present.
Detect what is installed and use the first match:

| Runtime | Detect | Serve command |
|---|---|---|
| Python 3 | `python3 --version` | `python3 -m http.server <port> --bind 127.0.0.1` |
| Python 2 | `python --version` | `python -m SimpleHTTPServer <port>` |
| Node / npx | `command -v npx` | `npx --yes serve -l <port>` or `npx --yes http-server -p <port>` |
| PHP | `command -v php` | `php -S 127.0.0.1:<port>` |
| BusyBox | `command -v busybox` | `busybox httpd -f -p <port>` |

The manual path does **not** regenerate the index — run
`node <folio-skill>/scripts/gen-index.js <site-root>` first if the site index or
search needs to reflect recent manifest changes.

### Serve from the site root — not an artifact subdirectory

Always start the server from `<site-root>`, not from `artifacts/<slug>/`.
Root-relative paths like `/artifacts/<slug>/style.css` and cross-artifact links
break when the server root is a subdirectory. This is the most common serving
mistake.

```bash
# Correct — serve from site root
cd <site-root>
python3 -m http.server 8000 --bind 127.0.0.1

# Wrong — artifacts/<slug>/ paths will 404
cd <site-root>/artifacts/<slug>
python3 -m http.server 8000
```

### Port selection

Default port: **8000**. If 8000 is taken, try 8080, then 8888, then any free
port (`python3 -m http.server 0` prints the assigned port). `serve.js` does this
walk automatically.

### Reuse before spawn

Before starting a new server, check whether the port already has a listener:

```bash
ss -tlnp | grep :8000      # Linux
lsof -i :8000              # macOS / fallback
curl -so /dev/null -w "%{http_code}" http://127.0.0.1:8000/
```

If a server is already responding on the site root, reuse it — do not start a
second process on the same port. Static file servers read from disk on every
request, so new or edited files are visible immediately without a restart.

### Bind address

- `127.0.0.1` — loopback only; safe default. Use this unless the user explicitly
  needs LAN or remote access.
- `0.0.0.0` — all interfaces; exposes the server on the local network. Only bind
  here when asked; note the exposure in the handoff.

### Backgrounding and stopping

```bash
# Background for an agent session
python3 -m http.server 8000 --bind 127.0.0.1 &
SERVER_PID=$!

# Or survive shell exit
nohup python3 -m http.server 8000 --bind 127.0.0.1 > /tmp/folio-server.log 2>&1 &

# Stop when done
kill $SERVER_PID
```

`serve.js` prints its PID and stops cleanly on `SIGINT`/`SIGTERM`. Record the PID
in the handoff so the user can stop it.

## Why a server, not `file://`

`fetch('./data/...')` and ES module relative imports fail under `file://` due to
the browser's same-origin policy. A local HTTP server sidesteps this entirely.
Cross-reference: `references/verification.md` — the `fetch/data` check in the
local verification table.

## The default index and search page

The site root's `index.html` is itself a folio artifact (`kind: landing`). It
embeds `.folio/site.json` inline and renders every artifact grouped by kind with
a **client-side search box** (type to filter by title, description, or slug; `/`
focuses it, `Esc` clears). It is generated, never hand-written, so it always
reflects the ledger:

```bash
node <folio-skill>/scripts/gen-index.js <site-root>
```

`serve.js` runs this for you on launch. See `references/site-index.md` for the
site-root model and the standalone-to-site upgrade.

## Honesty when exec is blocked

If the sandbox blocks process execution or network access, it cannot confirm a
live HTTP response. In that case:

- Probe the port with `curl` or `ss` and report the actual HTTP code (or that no
  server is reachable).
- If a live load genuinely cannot be performed, record the result as **"verified
  by static parse, not a live load"** rather than claiming the page rendered. Do
  not assert a 200 that was not observed.
