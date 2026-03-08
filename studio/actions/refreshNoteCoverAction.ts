import { useState } from "react";
import { useClient, useDocumentOperation } from "sanity";
import type { DocumentActionComponent } from "sanity";

type StudioEnv = {
  SANITY_STUDIO_COVER_WORKER_URL?: string;
  SANITY_STUDIO_COVER_WORKER_TOKEN?: string;
};

type WorkerGenerateResponse = {
  ok?: boolean;
  error?: string;
};

function buildCoverPrompt(title: string, excerpt: string, body: string): string {
  const excerptOneLine = excerpt.replace(/\s+/g, " ").trim();
  const bodyOneLine = body.replace(/\s+/g, " ").trim();
  const bodySnippet = bodyOneLine.split(" ").slice(0, 40).join(" ");
  return [
    "Cinematic editorial realism, single scene, 16:9.",
    `Article: ${title}.`,
    `Why it matters: ${excerptOneLine}.`,
    `Context: ${bodySnippet}.`,
    "Modern tech setting, clear subject focus, no text overlay, no logos, no watermark, no split-screen, no collage.",
  ].join(" ");
}

export const refreshNoteCoverAction: DocumentActionComponent = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { patch } = useDocumentOperation(props.id, props.type);
  const client = useClient({ apiVersion: "2024-01-01" });
  const doc = props.draft || props.published;

  if (props.type !== "note") {
    return null;
  }

  const sourceId = typeof doc?.sourceId === "string" ? doc.sourceId.trim() : "";
  const title = typeof doc?.title === "string" ? doc.title.trim() : "";
  const excerpt = typeof doc?.excerpt === "string" ? doc.excerpt.trim() : "";
  const body = typeof doc?.body === "string" ? doc.body.trim() : "";
  const env = import.meta.env as unknown as StudioEnv;
  const workerUrl = (env.SANITY_STUDIO_COVER_WORKER_URL || "").trim();
  const workerToken = (env.SANITY_STUDIO_COVER_WORKER_TOKEN || "").trim();

  const disabled = isLoading || !sourceId || !title || !excerpt || !workerUrl || !workerToken;

  return {
    label: isLoading ? "Refreshing cover..." : "Refresh Cover",
    title: "Generate and attach a new cover from rewritten content",
    disabled,
    onHandle: async () => {
      try {
        setIsLoading(true);
        const prompt = buildCoverPrompt(title, excerpt, body);
        const generateResponse = await fetch(`${workerUrl.replace(/\/+$/, "")}/generate`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${workerToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sourceId,
            prompt,
            allowBranding: false,
          }),
        });

        if (!generateResponse.ok) {
          const text = await generateResponse.text().catch(() => "");
          throw new Error(`Cover generation failed (${generateResponse.status}). ${text}`);
        }

        const payload = (await generateResponse.json()) as WorkerGenerateResponse;
        if (!payload.ok) {
          throw new Error(payload.error || "Cover generation returned an error");
        }

        const imageResponse = await fetch(`${workerUrl.replace(/\/+$/, "")}/image-any/${encodeURIComponent(sourceId)}`);
        if (!imageResponse.ok) {
          throw new Error(`Could not fetch generated image (${imageResponse.status})`);
        }

        const blob = await imageResponse.blob();
        const filename = `${sourceId}-${Date.now()}.png`;
        const asset = await client.assets.upload("image", blob, { filename, contentType: "image/png" });
        patch.execute([
          {
            set: {
              cover: {
                _type: "image",
                asset: {
                  _type: "reference",
                  _ref: asset._id,
                },
              },
            },
          },
        ]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown cover generation error";
        window.alert(message);
      } finally {
        setIsLoading(false);
        props.onComplete();
      }
    },
  };
};
