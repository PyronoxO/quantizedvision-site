import { useState } from "react";
import type { DocumentActionComponent } from "sanity";
import { useClient, useDocumentOperation } from "sanity";

type OEmbedPayload = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  html?: string;
};

type SoundCloudPageMeta = {
  imageUrl?: string;
  releaseDate?: string;
};

const API_VERSION = "2024-01-01";

function extractEmbedSrc(html?: string): string | undefined {
  if (!html) return undefined;
  const match = html.match(/src="([^"]+)"/i);
  return match?.[1];
}

function buildEmbedUrl(url: string): string {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    url
  )}&color=%2300bcd4&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=false`;
}

function normalizeSoundCloudUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    if (!url.hostname.includes("soundcloud.com")) return rawUrl.trim();
    // Strip sharing query params; keep canonical track URL.
    return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
  } catch {
    return rawUrl.trim();
  }
}

function inferFromSoundCloudUrl(rawUrl: string): { title?: string; artist?: string } {
  try {
    const url = new URL(rawUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const artist = parts[0]?.replace(/[-_]+/g, " ").trim();
    const title = parts[1]?.replace(/[-_]+/g, " ").trim();
    const toTitleCase = (s?: string) =>
      s
        ? s
            .split(" ")
            .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
            .join(" ")
        : undefined;
    return {
      artist: toTitleCase(artist),
      title: toTitleCase(title),
    };
  } catch {
    return {};
  }
}

async function fetchSoundCloudMeta(url: string): Promise<OEmbedPayload | null> {
  const endpoints = [
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
    `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) continue;
      const payload = (await res.json()) as OEmbedPayload;
      if (payload.title || payload.author_name || payload.thumbnail_url || payload.html) return payload;
    } catch {
      // try next endpoint
    }
  }
  return null;
}

function normalizeToDateOnly(value?: string): string | undefined {
  if (!value) return undefined;
  const candidate = value.trim();
  const ymd = candidate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

async function fetchSoundCloudPageMeta(url: string): Promise<SoundCloudPageMeta> {
  // Use a CORS-friendly proxy to read SoundCloud page HTML from Studio runtime.
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) return {};
  const html = await response.text();

  const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1];
  const twitterImage = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i)?.[1];

  const releaseDateCandidates = [
    html.match(/<meta\s+property=["']music:release_date["']\s+content=["']([^"']+)["']/i)?.[1],
    html.match(/<meta\s+itemprop=["']datePublished["']\s+content=["']([^"']+)["']/i)?.[1],
    html.match(/"release_date"\s*:\s*"([^"]+)"/i)?.[1],
    html.match(/"display_date"\s*:\s*"([^"]+)"/i)?.[1],
  ];

  const releaseDate = releaseDateCandidates.map(normalizeToDateOnly).find(Boolean);

  return {
    imageUrl: ogImage || twitterImage || undefined,
    releaseDate,
  };
}

export const fetchSoundCloudMetadataAction: DocumentActionComponent = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { patch } = useDocumentOperation(props.id, props.type);
  const client = useClient({ apiVersion: API_VERSION });
  const document = props.draft || props.published;
  const rawUrl = typeof document?.soundcloudUrl === "string" ? document.soundcloudUrl.trim() : "";

  if (props.type !== "musicTrack") return null;

  return {
    label: isLoading ? "Fetching SoundCloud..." : "Fetch SoundCloud metadata",
    title: "Auto-fill title, artist, embed URL and cover from SoundCloud",
    disabled: isLoading || !rawUrl,
    onHandle: async () => {
      try {
        setIsLoading(true);
        const normalizedUrl = normalizeSoundCloudUrl(rawUrl);
        const payload = await fetchSoundCloudMeta(normalizedUrl);
        const inferred = inferFromSoundCloudUrl(normalizedUrl);
        const pageMeta = await fetchSoundCloudPageMeta(normalizedUrl);

        const setPatch: Record<string, unknown> = {};
        if (payload?.title) setPatch.title = payload.title.trim();
        else if (inferred.title && (!(typeof document?.title === "string") || !document.title.trim())) setPatch.title = inferred.title;

        if (payload?.author_name) setPatch.artist = payload.author_name.trim();
        else if (inferred.artist && (!(typeof document?.artist === "string") || !document.artist.trim())) setPatch.artist = inferred.artist;

        setPatch.embedUrl = extractEmbedSrc(payload?.html) || buildEmbedUrl(normalizedUrl);

        if (
          pageMeta.releaseDate &&
          (typeof document?.releaseDate !== "string" || !document.releaseDate.trim())
        ) {
          setPatch.releaseDate = pageMeta.releaseDate;
        }

        if (typeof document?.description !== "string" || !document.description.trim()) {
          setPatch.description = payload?.title?.trim() || inferred.title || "SoundCloud track.";
        }

        const thumbnailCandidate = payload?.thumbnail_url || pageMeta.imageUrl;

        if (thumbnailCandidate) {
          try {
            const imageRes = await fetch(thumbnailCandidate);
            if (imageRes.ok) {
              const blob = await imageRes.blob();
              const safeId = (props.id || "track").replace(/[^\w-]+/g, "-");
              const asset = await client.assets.upload("image", blob, {
                filename: `soundcloud-${safeId}.jpg`,
                contentType: blob.type || "image/jpeg",
              });
              setPatch.cover = {
                _type: "image",
                asset: { _type: "reference", _ref: asset._id },
              };
            }
          } catch {
            // keep metadata patch even if image upload fails
          }
        }

        patch.execute([{ set: setPatch }]);
        if (!payload) {
          window.alert("Limited metadata returned by SoundCloud. Embed URL was set and title/artist were inferred from URL.");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        window.alert(`Could not fetch SoundCloud metadata. ${message}`);
      } finally {
        setIsLoading(false);
        props.onComplete();
      }
    },
  };
};
