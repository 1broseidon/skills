# Host profiles

Default: **`local`**. Publish only when the user explicitly requests it.

**Silent by default.** Do not advertise publish capabilities, suggest host profiles, or mention surge/gh-pages/cf-pages unless the user asks. The artifact works locally; publish is opt-in.

## Three ways to reach an artifact

Match the reach to what the user actually asked for. Don't jump to a durable deploy when they only want to show someone.

| Tier | How | Reach | Lifetime |
| --- | --- | --- | --- |
| **local** | `scripts/serve.js` (loopback) | your machine | while serving |
| **share** | `scripts/share.js` (tunnel) | temporary public URL | while the process runs |
| **publish** | a host profile below | durable public URL | until torn down |

**"Let someone see this right now" → share, not publish.** A tunnel (default localhost.run — no install, no account) exposes the running local server at a temporary URL; the machine stays the host and the link dies with the process. That is almost always what "send me a link" means. See `references/verbs/share.md`. The profiles below are for **durable** hosting elsewhere — when the link must outlive the session.

## Profile summary

| Profile | Output | Publish command (typical) | Auth |
| --- | --- | --- | --- |
| `local` | Folder on disk | none — serve locally | none |
| `surge` | Site root → one domain | `npx --yes surge <site-root> <domain>.surge.sh` | Surge account (CLI login or env vars) |
| `gh-pages` | Branch or `/docs` | `git push`, or Actions | GitHub repo write |
| `cf-pages` | CF Pages project | `wrangler pages deploy <site-root>` | Cloudflare account |
| `cf-worker` | Worker + assets | `wrangler deploy` | Cloudflare account |

## Auth probe

Before attempting any deploy, run the auth probe for the chosen profile. **Do not attempt to authenticate on the user's behalf.**

```bash
# surge
npx --yes surge whoami 2>&1

# gh-pages
gh auth status 2>&1

# cf-pages / cf-worker
npx --yes wrangler whoami 2>&1
```

**If authed:** proceed with deploy. Record the account identity in the handoff (not in the artifact source).

**If not authed:** tell the user once what to run. Wait for them to confirm before retrying.

| Profile | User runs | Non-interactive alternative |
| --- | --- | --- |
| `surge` | `npx surge login` | `export SURGE_LOGIN=… SURGE_TOKEN=…` |
| `gh-pages` | `gh auth login` | `export GH_TOKEN=…` |
| `cf-pages` | `npx wrangler login` | `export CLOUDFLARE_API_TOKEN=…` |

Never store credentials in the artifact, the README, or the manifest. Auth is a gate on the publish verb, not a property of the artifact.

## local

**Use when:** agent or human opens from workspace; default for all runs.

**Recommended — one command** (ensures `artifacts/`, regenerates the index/search page from the ledger, picks an open port, serves the site root):

```bash
node <folio-skill>/scripts/serve.js <site-root>
```

**Or serve manually:**

```bash
cd <site-root> && python3 -m http.server 8000 --bind 127.0.0.1   # whole site (with index)
npx --yes serve <site-root>/artifacts/<slug>                      # a single artifact
```

**Caveats:**

- `fetch('./data.json')` fails under `file://` — serve over HTTP, and document the server requirement in README and handoff.
- Prefer relative paths only. Artifacts link to each other via root-relative paths (`/artifacts/<slug>/`).

**Full local-run guide** — two run modes, the `serve.js` launcher, runtime probe order for Python/Node/PHP/BusyBox, serve-from-site-root rule, reuse-before-spawn, port/bind selection, backgrounding, and exec-blocked honesty: see `references/local-server.md`.

## surge

**Use when:** user wants a durable public URL without repo setup (for a temporary link to show someone, use `share` instead).

**Prereqs:** `npx surge whoami` succeeds.

**Publish (whole site root):**

```bash
cd <site-root>
npx --yes surge . <domain>.surge.sh
```

The domain is read from `.folio/site.json`. One domain hosts all artifacts as paths (`/artifacts/<slug>/`). Record the URL from CLI output (evidence level `observed`). Subdomain availability is not guaranteed — do not invent domains.

**Verify all paths:**

```bash
curl -sI https://<domain>.surge.sh/
curl -sI https://<domain>.surge.sh/artifacts/<slug>/   # for each artifact
```

**Teardown:** `npx surge teardown <domain>` — mention in handoff if ephemeral demo.

## gh-pages

**Use when:** site belongs with a GitHub repo as a static site.

**Patterns:**

- `gh-pages` branch containing site root
- `/docs` folder on default branch (Jekyll disabled or configured)

Do not assume branch protection, Actions, or custom domain — inventory the repo first.

## cf-pages

**Use when:** Cloudflare Pages is already used or user names Wrangler Pages.

**Typical:**

```bash
npx --yes wrangler pages deploy <site-root> --project-name=<name>
```

Read project `wrangler.toml` / existing Pages project if present. Do not fabricate project names.

## cf-worker

**Use when:** user explicitly wants a Worker serving static assets (not the default CF path).

Defer to [wrangler](https://developers.cloudflare.com/workers/) skill for Worker config. Folio only supplies the static bundle; Worker wiring is a separate boundary.

## Picking a profile

```text
Just want to show someone right now?  → share (tunnel; see verbs/share.md)
Link must persist (bookmark, deploy)? ↓
  Site lives in a repo's docs?        → gh-pages
  Already on Cloudflare?              → cf-pages (or cf-worker)
  Fast durable URL, no repo?          → surge (if CLI available and authed)
Otherwise                             → local
```

A bare "can I get a URL?" usually means **share**, not a deploy — confirm whether the link needs to persist before publishing. If multiple durable profiles fit, ask once. If unanswered, stay on `local`.
