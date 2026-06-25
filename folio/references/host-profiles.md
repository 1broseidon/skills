# Host profiles

Default: **`local`**. Publish only when the user explicitly requests it.

**Silent by default.** Do not advertise publish capabilities, suggest host profiles, or mention surge/gh-pages/cf-pages unless the user asks. The artifact works locally; publish is opt-in.

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

**Open a single artifact:**

```bash
npx --yes serve <site-root>/artifacts/<slug>
```

**Open the whole site (with index):**

```bash
npx --yes serve <site-root>
```

**Caveats:**

- `fetch('./data.json')` fails under `file://` — document server requirement in README and handoff.
- Prefer relative paths only. Artifacts link to each other via root-relative paths (`/artifacts/<slug>/`).

## surge

**Use when:** user wants a fast public URL without repo setup.

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
User asked for a URL without GitHub? → surge (if CLI available and authed)
Site lives in repo docs?             → gh-pages
Already on Cloudflare?               → cf-pages
Otherwise                            → local
```

If multiple fit, ask once. If unanswered, stay on `local`.
