const crypto = require("node:crypto");
const { getCliClient } = require("@sanity/cli");

const client = getCliClient({ apiVersion: "2024-01-01", useCdn: false });

const FEEDS = [
  "https://techcrunch.com/tag/artificial-intelligence/feed/",
  "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  "https://hnrss.org/newest?count=30&q=artificial+intelligence",
  "https://hnrss.org/newest?count=30&q=technology",
];

const AUTHOR_NAME = "AI Tech News Bot";
const BASE_TAGS = ["AI", "Technology", "News"];
const MAX_ITEMS = Number(process.env.NEWS_IMPORT_MAX || 30);

function sha1(input) {
  return crypto.createHash("sha1").update(input).digest("hex");
}

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function pickFirstMatch(block, patterns) {
  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match && match[1]) return stripHtml(match[1]);
  }
  return "";
}

function parseRssItems(xml, source) {
  const items = [];
  const rssItems = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const block of rssItems) {
    const title = pickFirstMatch(block, [/<title>([\s\S]*?)<\/title>/i]);
    const link = pickFirstMatch(block, [/<link>([\s\S]*?)<\/link>/i, /<guid[^>]*>([\s\S]*?)<\/guid>/i]);
    const pubDateRaw = pickFirstMatch(block, [/<pubDate>([\s\S]*?)<\/pubDate>/i, /<dc:date>([\s\S]*?)<\/dc:date>/i]);
    const description = pickFirstMatch(block, [/<description>([\s\S]*?)<\/description>/i, /<content:encoded>([\s\S]*?)<\/content:encoded>/i]);
    if (!title || !link) continue;
    items.push({ title, link, pubDateRaw, description, source });
  }

  const atomItems = xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  for (const block of atomItems) {
    const title = pickFirstMatch(block, [/<title[^>]*>([\s\S]*?)<\/title>/i]);
    const link = pickFirstMatch(block, [
      /<link[^>]+href="([^"]+)"[^>]*>/i,
      /<id>([\s\S]*?)<\/id>/i,
    ]);
    const pubDateRaw = pickFirstMatch(block, [/<published>([\s\S]*?)<\/published>/i, /<updated>([\s\S]*?)<\/updated>/i]);
    const description = pickFirstMatch(block, [/<summary[^>]*>([\s\S]*?)<\/summary>/i, /<content[^>]*>([\s\S]*?)<\/content>/i]);
    if (!title || !link) continue;
    items.push({ title, link, pubDateRaw, description, source });
  }

  return items;
}

function normalizeDate(raw) {
  const parsed = Date.parse(raw || "");
  if (Number.isNaN(parsed)) return new Date().toISOString().slice(0, 10);
  return new Date(parsed).toISOString().slice(0, 10);
}

function buildExcerpt(item) {
  const base = stripHtml(item.description) || `${item.title}. Latest AI and technology update from ${item.source}.`;
  return base.length <= 280 ? base : `${base.slice(0, 277).trim()}...`;
}

function estimateReadTime(title, excerpt) {
  const words = `${title} ${excerpt}`.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.min(12, Math.ceil(words / 180)));
}

async function ensureAuthor(name) {
  const slug = toSlug(name);
  const existing = await client.fetch(`*[_type == "author" && slug.current == $slug][0]{_id}`, { slug });
  if (existing?._id) return existing._id.replace(/^drafts\./, "");
  const created = await client.create({
    _id: `author-${slug}`,
    _type: "author",
    name,
    slug: { _type: "slug", current: slug },
    bio: "Automated curator for AI and technology headlines.",
  });
  return created._id.replace(/^drafts\./, "");
}

async function ensureTag(title) {
  const slug = toSlug(title);
  const existing = await client.fetch(`*[_type == "tag" && slug.current == $slug][0]{_id}`, { slug });
  if (existing?._id) return existing._id.replace(/^drafts\./, "");
  const created = await client.create({
    _id: `tag-${slug}`,
    _type: "tag",
    title,
    slug: { _type: "slug", current: slug },
  });
  return created._id.replace(/^drafts\./, "");
}

async function fetchFeed(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "QuantizedVisionNewsBot/1.0",
      accept: "application/rss+xml, application/atom+xml, text/xml, application/xml;q=0.9, */*;q=0.5",
    },
  });
  if (!response.ok) throw new Error(`Feed request failed (${response.status}) for ${url}`);
  return response.text();
}

async function run() {
  const authorId = await ensureAuthor(AUTHOR_NAME);
  const tagIds = [];
  for (const tag of BASE_TAGS) {
    tagIds.push(await ensureTag(tag));
  }

  const allItems = [];
  const feedOutcomes = [];
  for (const feed of FEEDS) {
    try {
      const xml = await fetchFeed(feed);
      const parsed = parseRssItems(xml, feed);
      allItems.push(...parsed);
      feedOutcomes.push({ feed, ok: true, count: parsed.length });
    } catch (error) {
      feedOutcomes.push({ feed, ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  }

  const dedupedByLink = new Map();
  for (const item of allItems) {
    const link = (item.link || "").trim();
    if (!link) continue;
    if (!dedupedByLink.has(link)) dedupedByLink.set(link, item);
  }

  const sortedItems = Array.from(dedupedByLink.values())
    .sort((a, b) => Date.parse(b.pubDateRaw || "") - Date.parse(a.pubDateRaw || ""))
    .slice(0, MAX_ITEMS);

  let created = 0;
  let updated = 0;
  const processed = [];
  for (const item of sortedItems) {
    const sourceHash = sha1(item.link).slice(0, 16);
    const id = `news-note-${sourceHash}`;
    const slugBase = toSlug(item.title) || `news-${sourceHash}`;
    const slug = `${slugBase}-${sourceHash.slice(0, 6)}`.slice(0, 96);
    const excerpt = buildExcerpt(item);

    const payload = {
      _type: "note",
      title: item.title,
      slug: { _type: "slug", current: slug },
      date: normalizeDate(item.pubDateRaw),
      excerpt,
      featured: false,
      workflowStatus: "published",
      readTimeMinutes: estimateReadTime(item.title, excerpt),
      authorRef: { _type: "reference", _ref: authorId },
      tagRefs: tagIds.map((tagId) => ({ _type: "reference", _ref: tagId })),
    };

    const exists = await client.fetch(`*[_id == $id || _id == $draftId][0]{_id}`, { id, draftId: `drafts.${id}` });
    if (exists?._id) {
      await client.patch(exists._id).set(payload).commit();
      updated += 1;
      processed.push({ id, action: "updated", title: item.title, link: item.link });
      continue;
    }

    await client.create({ _id: id, ...payload });
    created += 1;
    processed.push({ id, action: "created", title: item.title, link: item.link });
  }

  console.log(
    JSON.stringify(
      {
        authorId,
        tagIds,
        feeds: feedOutcomes,
        imported: {
          totalParsed: allItems.length,
          deduped: dedupedByLink.size,
          selected: sortedItems.length,
          created,
          updated,
        },
        processed,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
