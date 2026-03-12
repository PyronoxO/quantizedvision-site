import type { APIRoute } from "astro";
import { getPosts } from "../lib/content";
import { setSanityRuntimeEnv } from "../lib/sanity";

const SITE_URL = "https://quantizedvision.com";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const GET: APIRoute = async (context) => {
  setSanityRuntimeEnv((context.locals as any)?.runtime?.env);
  const posts = await getPosts();
  const ordered = [...posts].sort((a, b) => {
    const at = new Date(a.date).getTime() || 0;
    const bt = new Date(b.date).getTime() || 0;
    return bt - at;
  });

  const items = ordered
    .map((post) => {
      const link = `${SITE_URL}/posts/${post.slug}`;
      const pubDate = new Date(post.date);
      const dateString = Number.isNaN(pubDate.getTime()) ? new Date().toUTCString() : pubDate.toUTCString();
      const description = escapeXml(post.excerpt || "");
      const title = escapeXml(post.title || "Untitled");
      return `<item><title>${title}</title><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${dateString}</pubDate><description>${description}</description></item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Quantized Vision Posts</title><link>${SITE_URL}/posts</link><description>Latest posts from Quantized Vision.</description><language>en-US</language>${items}</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900",
    },
  });
};

