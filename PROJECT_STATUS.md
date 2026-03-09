# Project Status Snapshot

Date: 2026-03-09

## Completed in this pass

- Fixed broken homepage featured gallery cards.
- Added resilient image loading for gallery cards.
- Fixed featured gallery card link targets.
- Upgraded Sanity external metadata action to cache thumbnails as local Sanity assets.

## Technical Root Cause

- Most featured gallery entries are `mediaType: "external"` and were relying on remote social thumbnail URLs.
- Those URLs are short-lived or intermittently inaccessible, so images disappeared and cards looked broken.

## Permanent Mitigation

- On metadata fetch, Studio now uploads a local Sanity image asset and stores it in `artwork.cover`.
- Frontend now prefers `cover` first, then external URL, then local static fallback.
- Frontend retries external images and restores them automatically when reachable.

## Follow-up (recommended)

- Run `Fetch metadata` once on legacy external artwork docs that still do not have local `cover`.
- After that, new breakages from expiring remote thumbnails should be minimal.
