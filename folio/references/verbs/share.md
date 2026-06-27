# folio share

Put a running folio site root behind a **temporary public URL** so someone else can open it right now. The machine stays the host; the URL lives only while the command runs. Nothing is deployed and nothing persists — `share` is not `publish`.

Default provider is **localhost.run** over SSH: no install, no account, the `ssh` client is already present on almost every machine. Use ngrok only when the user asks for it.

## Use when

- "Send me a link", "let me show my teammate", "can they see it" — a quick look from another device or person
- Demoing across a network boundary (phone, a colleague, a screen-share viewer) without deploying
- The artifact is not finished or not meant to live anywhere permanent

**Not for** durable hosting. If the link should outlive the session, survive the machine going to sleep, or be bookmarked — that is `folio publish` (surge / cf). See `references/verbs/publish.md`.

## share vs publish vs local

| Tier | Command | Reach | Lifetime | Host |
| --- | --- | --- | --- | --- |
| **local** | `scripts/serve.js <root>` | loopback (`127.0.0.1`) | while serving | your machine |
| **share** | `scripts/share.js <root>` | temporary public URL | while the process runs | your machine (tunneled) |
| **publish** | `folio publish <root>` | durable public URL | until torn down | surge / gh-pages / cf |

`share` is the default answer to "let someone see this." `publish` is the answer to "host this somewhere for good."

## Preconditions

- Site root passes local verification (or the user accepts known gaps) — `share` exposes exactly what `serve.js` would serve.
- **Security checklist** — the URL is public for as long as the tunnel is up. Re-run `references/security.md`. Confirm no secrets, keys, tokens, or private URLs in any artifact. The static-only discipline still applies — published or shared, an artifact must not depend on a backend the visitor can't reach.

## Flow

1. **Verify locally** — confirm the artifact serves and the primary path works under `serve.js` first. A tunnel to a broken local server is a broken public link.
2. **Security pass** — no secrets in source; mock data labeled; static-only holds.
3. **Open the tunnel** — one command. It starts the local server (or attaches to one already running), opens the tunnel, and prints the observed public URL:
   ```bash
   node <folio-skill>/scripts/share.js <site-root>
   # share: public  https://<sub>.lhr.life
   ```
   - `--ngrok` — use ngrok instead of localhost.run (needs `ngrok` installed and an authtoken).
   - `-p, --port <n>` — tunnel a server you already started on that port instead of spawning a new one.
4. **Record the URL** — copy the **observed** URL from the command's output (evidence level `observed`). Never claim a share URL that the command did not print. Do **not** write it to `.folio/site.json` `published_url` — that field is for durable publishes; a tunnel URL is ephemeral and changes every run.
5. **Verify the link** (optional, when reachable) — `curl -sI <url>/` returns 200; spot-check one artifact path.
6. **Handoff** — the public URL, the fact that it is **temporary** (dies when the process stops / on Ctrl-C), how to reopen (re-run the command — the URL will differ), and the security note that anyone with the link can load it while it is up.

## Providers

| Provider | Flag | Needs | URL shape | Account |
| --- | --- | --- | --- | --- |
| **localhost.run** (default) | none | `ssh` client | `https://<sub>.lhr.life` | none |
| **ngrok** | `--ngrok` | `ngrok` binary + authtoken | `https://<sub>.ngrok-free.app` | free signup |

localhost.run is the default because it needs nothing installed and no signup. Switch to ngrok only when the user names it, or when localhost.run is unreachable and ngrok is already configured.

## Honesty

- The public URL is printed by `share.js` only after it is observed in the provider's own output. If the tunnel exits before a URL appears, the command reports the failure and exits non-zero — it never invents a URL.
- A share link is **not** a publish. Do not record it as a durable URL, do not claim it persists, and do not present it as the deploy. Say plainly that it is temporary and ends with the session.
- If process execution or outbound SSH is blocked in the sandbox, say so — report that the tunnel could not be opened rather than asserting a link that was never created.

## Teardown

Stop the command (Ctrl-C, or `kill <pid>`). The tunnel and the local server `share.js` started are torn down together; the URL stops resolving immediately. There is nothing to un-deploy and no account state to clean up.
