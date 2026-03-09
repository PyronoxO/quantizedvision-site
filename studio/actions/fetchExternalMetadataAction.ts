import { useState } from "react";
import type { DocumentActionComponent } from "sanity";
import { useClient, useDocumentOperation } from "sanity";

type OEmbedPayload = {
  title?: string;
  author_name?: string;
  provider_name?: string;
  thumbnail_url?: string;
};

function toShortTitle(raw?: string): string {
  if (!raw) return "";
  const noUrls = raw.replace(/https?:\/\/\S+/gi, " ");
  const beforeHashtags = noUrls.split("#")[0] || noUrls;
  const compact = beforeHashtags.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  return compact.length > 64 ? `${compact.slice(0, 64).trim()}...` : compact;
}

function resolvePrimaryEndpoints(url: string): string[] {
  const lowered = url.toLowerCase();
  if (lowered.includes("tiktok.com")) {
    return [
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
    ];
  }
  if (lowered.includes("youtube.com") || lowered.includes("youtu.be")) {
    return [
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
    ];
  }
  if (lowered.includes("instagram.com")) {
    return [
      `https://www.instagram.com/oembed?url=${encodeURIComponent(url)}&omitscript=true`,
      `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
    ];
  }
  return [`https://noembed.com/embed?url=${encodeURIComponent(url)}`];
}

async function fetchFirstWorkingPayload(url: string): Promise<OEmbedPayload | null> {
  const endpoints = resolvePrimaryEndpoints(url);

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) continue;
      const payload = (await response.json()) as OEmbedPayload;
      if (payload.title || payload.thumbnail_url || payload.author_name || payload.provider_name) {
        return payload;
      }
    } catch {
      // Try next endpoint.
    }
  }

  return null;
}

export const fetchExternalMetadataAction: DocumentActionComponent = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { patch } = useDocumentOperation(props.id, props.type);
  const client = useClient({ apiVersion: "2024-01-01" });
  const document = props.draft || props.published;
  const externalUrl = typeof document?.externalUrl === "string" ? document.externalUrl.trim() : "";
  const mediaType = document?.mediaType;
  const isExternal = mediaType === "external";

  if (props.type !== "artwork") {
    return null;
  }

  return {
    label: isLoading ? "Fetching metadata..." : "Fetch metadata",
    title: "Pull title and description from external URL",
    disabled: isLoading || !isExternal || !externalUrl,
    onHandle: async () => {
      try {
        setIsLoading(true);
        const payload = await fetchFirstWorkingPayload(externalUrl);
        if (!payload) {
          const isInstagram = externalUrl.toLowerCase().includes("instagram.com");
          if (isInstagram) {
            window.alert(
              "Instagram metadata was blocked by provider restrictions. Add title/thumbnail manually in this entry."
            );
          } else {
            window.alert("Could not fetch metadata from this URL. Add title/thumbnail manually.");
          }
          return;
        }

        const generatedDescription =
          payload.author_name || payload.provider_name
            ? `External post from ${payload.provider_name || "social"}${payload.author_name ? ` by ${payload.author_name}` : ""}.`
            : "External post.";
        const titleFromProvider = toShortTitle(payload.title);
        const existingTitle = typeof document?.title === "string" ? document.title.trim() : "";
        const shouldAutofillTitle = !existingTitle || existingTitle.toLowerCase() === "untitled";

        const setPatch: Record<string, unknown> = {
          mediaType: "external",
        };

        if (titleFromProvider && shouldAutofillTitle) {
          setPatch.title = titleFromProvider;
        }
        if (payload.thumbnail_url) {
          setPatch.externalThumbnail = payload.thumbnail_url;
          // Persist a stable local copy so expiring social CDN URLs don't break gallery cards later.
          try {
            const imageResponse = await fetch(payload.thumbnail_url);
            if (imageResponse.ok) {
              const imageBlob = await imageResponse.blob();
              const filenameBase = (document?.slug as { current?: string } | undefined)?.current || props.id || "external-artwork";
              const asset = await client.assets.upload("image", imageBlob, {
                filename: `${filenameBase}-external-thumb.jpg`,
                contentType: imageBlob.type || "image/jpeg",
              });
              setPatch.cover = {
                _type: "image",
                asset: {
                  _type: "reference",
                  _ref: asset._id,
                },
              };
            }
          } catch {
            // Keep externalThumbnail even if local asset caching fails.
          }
        }
        if (typeof document?.description !== "string" || !document.description.trim()) {
          setPatch.description = payload.title?.trim() || generatedDescription;
        }
        if (typeof document?.date !== "string" || !document.date.trim()) {
          setPatch.date = new Date().toISOString().slice(0, 10);
        }

        patch.execute([{ set: setPatch }]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown metadata error";
        window.alert(`Could not fetch metadata. ${message}`);
      } finally {
        setIsLoading(false);
        props.onComplete();
      }
    },
  };
};
