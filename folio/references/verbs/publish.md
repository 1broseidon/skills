# folio publish

Deploy a site root (all artifacts) to a host profile for **durable** hosting elsewhere — a URL that outlives the session and the machine. **Do not publish** unless the user invoked publish or explicitly asked to host it somewhere permanent.

**Publish is not the quick-share path.** If the user just wants to show someone the artifact right now, that is `folio share` — a temporary tunnel to the locally running server (default localhost.run, no install, no account). Reach for publish only when the link must persist. See `references/verbs/share.md`.

## Preconditions

- Site root contains `index.html` and `artifacts/` tree
- `.folio/site.json` exists with domain and artifact registry
- Artifacts pass local verification (or user accepts known gaps)

## Flow

1. **Auth probe** — run the profile's auth check (see `host-profiles.md` § Auth probe). If not authed, tell the user what to run and stop. Do not retry until they confirm.
2. **Read site manifest** — get domain from `.folio/site.json`. If missing or null, ask the user to name one. Do not invent domains.
3. **Security checklist** — re-run for public profiles. Read `security.md`.
4. **Static-only check** — confirm no `fetch()` to external APIs across all artifacts in the tree. Published artifacts must not depend on backends the visitor can't reach.
5. **Regenerate index** — `node <folio-skill>/scripts/gen-index.js <site-root>`. Re-emits `index.html` from `.folio/site.json` so the filter and list match the manifest. Never hand-edit the embedded JSON.
6. **Deploy** — run profile-specific command against the site root (see `host-profiles.md`).
7. **Record URL** — copy the **observed** URL from command output. Update `.folio/site.json` `published_url` and `last_published`. Update each artifact's `last_published`. Never claim a URL without evidence.
8. **Verify** — `curl -sI <url>` on the index, then `curl -sI` on each artifact path. All must return 200.
9. **Handoff** — domain URL, artifact path list, rerun instructions, teardown note if ephemeral.

## Profile notes

### surge

```bash
npx --yes surge whoami              # auth probe
cd <site-root>
npx --yes surge . <domain>.surge.sh
```

Verify:
```bash
curl -sI https://<domain>.surge.sh/                                    # index
curl -sI https://<domain>.surge.sh/artifacts/<slug>/                   # each artifact
```

Teardown: `npx surge teardown <domain>` — mention in handoff if ephemeral.

### gh-pages

Requires repo context. The site root becomes the repo's static site. Inventory remotes and existing Pages config before pushing. Do not force-push without explicit approval.

### cf-pages

```bash
npx --yes wrangler whoami           # auth probe
npx --yes wrangler pages deploy <site-root> --project-name=<name>
```

Project must exist or be created with user approval.

## Failures

If auth probe fails, report the missing credential and what the user should run. Do not invent alternate URLs or retry.

If deploy fails with a transient error (network timeout, processing error), retry once. If it fails again, report stderr verbatim. Do not invent alternate URLs. Leave site in local profile state.