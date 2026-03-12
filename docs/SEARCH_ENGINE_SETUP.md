# Search Engine Setup (Google, Bing, Yahoo)

## 1) Google Search Console (Priority)
- Open Google Search Console and add **Domain property**: `quantizedvision.com`
- Verify with DNS TXT at Porkbun (recommended).
- Submit sitemap:
  - `https://quantizedvision.com/sitemap-index.xml`
  - optional extra: `https://quantizedvision.com/sitemap.xml`

Alternative verification (meta tag):
- Set `PUBLIC_GOOGLE_SITE_VERIFICATION` in Cloudflare Pages env.
- Redeploy site.

## 2) Bing Webmaster Tools
- Open Bing Webmaster Tools.
- Import your site from Google Search Console (fastest), or add manually.
- Submit sitemap:
  - `https://quantizedvision.com/sitemap-index.xml`
  - optional extra: `https://quantizedvision.com/sitemap.xml`

Alternative verification (meta tag):
- Set `PUBLIC_BING_SITE_VERIFICATION` in Cloudflare Pages env.
- Redeploy site.

## 3) Yahoo Search
- Yahoo search indexing is powered by Bing.
- There is no separate Yahoo submission needed in most cases.
- If indexed in Bing, it is typically eligible for Yahoo.

## Post-deploy checks
- `https://quantizedvision.com/robots.txt` returns 200 and lists sitemap URLs.
- `https://quantizedvision.com/sitemap-index.xml` returns 200.
- `https://quantizedvision.com/sitemap.xml` returns 200.
- In GSC/Bing: run URL inspection on:
  - home page
  - one post page
  - one gallery page
