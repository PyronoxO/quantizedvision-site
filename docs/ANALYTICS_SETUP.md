# Lightweight Analytics Setup

This project supports optional lightweight tracking with Plausible.

## Env vars (Cloudflare Pages)
- `PUBLIC_PLAUSIBLE_DOMAIN=quantizedvision.com`
- `PUBLIC_PLAUSIBLE_SCRIPT_SRC=https://plausible.io/js/script.js`

## What gets tracked
- Pageviews (via Plausible script)
- Outbound link clicks (`outbound_link_click`)
- Social share clicks on post pages (`social_share_click`)

## Event properties
- `outbound_link_click`: `{ href }`
- `social_share_click`: `{ network, post }`

## Notes
- If env vars are not set, tracking is disabled automatically.
- This keeps the site functional without analytics in development or staging.
