# Project Status Snapshot

Date: 2026-03-11

## Completed (current production)

- Social sharing flow stabilized across post pages:
  - LinkedIn now opens composer with prefilled text + URL.
  - X sharing working with live `.com` URLs.
  - Facebook button now uses reliable `copy link + open Facebook` flow.
- Domain migration completed:
  - `quantizedvision.com` and `www.quantizedvision.com` are active on Cloudflare Pages.
  - `PUBLIC_SITE_URL` in Pages production set to `https://quantizedvision.com`.
- Social preview reliability improved:
  - Post OG images now use fixed-size Sanity transforms (`1200x630`, JPG) for crawler compatibility.
- Featured gallery resiliency remains in place:
  - Local cover caching in Sanity for external artwork sources.
  - Frontend fallback + retry behavior for unstable external thumbnails.
- All recent patches pushed to GitHub `main` and deployed to Cloudflare Pages production.

## Known behavior

- Facebook’s native popup share flow can hang on some desktop sessions; direct paste in Facebook composer works consistently.
- Meta/LinkedIn preview updates can lag due to crawler cache and may require manual re-scrape.

## Next Phase (recommended)

- Harden social metadata:
  - Add explicit `og:image:type` and cache-busting strategy for critical post updates.
- Editorial pipeline hardening:
  - Final QA pass on CSV rewrite/import workflow using 10+ article batch.
  - Add post-import validation checklist in Studio docs.
- Ops hardening:
  - Add a short runbook for domain/DNS/social-debugger procedures.
