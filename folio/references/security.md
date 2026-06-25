# Security

Static artifacts can still leak secrets, execute untrusted input, or expose users when published.

## Non-negotiable

1. **No secrets** in HTML, JS, CSS, JSON data, or README — including query params with tokens.
2. **No API calls.** Folio artifacts are static documents. They do not `fetch()` external endpoints, connect WebSockets, or send XHR. Data is embedded or loaded from a local file.
3. **Mock data** must not resemble real PII; use obviously synthetic names/IDs when demonstrating.
4. **User input** (forms, textareas, URL hash params): do not `eval`, `innerHTML` with unsanitized input, or `document.write` user strings.
5. **Third-party scripts** must be ledgered; prefer pinned CDN URLs with version in path when possible. Do not fabricate SRI integrity hashes — pin the version or omit the hash.
6. **Published artifacts** (`surge`, public gh-pages): treat as world-readable. No staging URLs with embedded credentials.

## Public publish checklist

- [ ] No `.env`, API keys, or internal hostnames in source
- [ ] No `localhost` fetches assumed for visitors
- [ ] No `fetch()` to external APIs (static-only rule)
- [ ] External scripts are intentional ledger rows
- [ ] Forms do not POST to endpoints without user approval
- [ ] Auth credentials are not stored in artifact source or README
