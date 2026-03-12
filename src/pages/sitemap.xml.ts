import type { APIRoute } from "astro";
import { getArtworks, getCmsPageSlugs, getPosts, getProjects } from "../lib/content";
import { setSanityRuntimeEnv } from "../lib/sanity";

const SITE_URL = "https://quantizedvision.com";

const toAbsolute = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

export const GET: APIRoute = async (context) => {
  setSanityRuntimeEnv((context.locals as any)?.runtime?.env);

  const [posts, artworks, projects, pages] = await Promise.all([
    getPosts(),
    getArtworks(),
    getProjects(),
    getCmsPageSlugs(),
  ]);

  const urls = new Map<string, string | undefined>();
  urls.set(toAbsolute("/"), undefined);
  urls.set(toAbsolute("/posts"), undefined);
  urls.set(toAbsolute("/gallery"), undefined);
  urls.set(toAbsolute("/projects"), undefined);

  pages.forEach((row) => {
    if (!row.slug || row.is404) return;
    if (row.isHome || row.slug === "home") {
      urls.set(toAbsolute("/"), undefined);
      return;
    }
    urls.set(toAbsolute(`/${row.slug}`), undefined);
  });

  posts.forEach((post) => {
    urls.set(toAbsolute(`/posts/${post.slug}`), toDate(post.date));
  });

  artworks.forEach((artwork) => {
    if (!artwork.slug) return;
    if (artwork.mediaType === "external" && artwork.externalUrl) return;
    urls.set(toAbsolute(`/gallery/${artwork.slug}`), toDate(artwork.date));
  });

  projects.forEach((project) => {
    if (!project.slug) return;
    urls.set(toAbsolute(`/projects/${project.slug}`), toDate(project.date));
  });

  const body = Array.from(urls.entries())
    .map(([loc, lastmod]) => {
      const lastmodNode = lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : "";
      return `<url><loc>${escapeXml(loc)}</loc>${lastmodNode}</url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=900",
    },
  });
};
