# Sanity Setup

## 1) Configure Astro Environment

1. Copy `.env.example` to `.env`.
2. Set values:

```bash
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
SANITY_API_READ_TOKEN=
```

`SANITY_API_READ_TOKEN` is optional for public datasets.

## 2) Run Sanity Studio

From repo root:

```bash
cd studio
npm run dev
```

Open `http://127.0.0.1:3333`.

## 3) Content Types

- `artwork`: gallery entries
- `project`: project case studies
- `note`: short notes/logs

## 4) Connect Astro to Sanity

Astro pages now read from Sanity when `SANITY_PROJECT_ID` and `SANITY_DATASET` are set.

- Gallery: `src/pages/gallery.astro`
- Projects: `src/pages/projects.astro`
- Notes: `src/pages/notes.astro`

If env vars are missing, gallery falls back to `src/data/artworks.json`.

## 5) Deploy Environment Variables (Cloudflare Pages)

In Cloudflare Pages project settings:

- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- Optional: `SANITY_API_READ_TOKEN`

After setting env vars, trigger a redeploy.
