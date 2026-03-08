import { useState } from "react";
import { Button, Card, Stack, Text } from "@sanity/ui";
import { set, type ObjectInputProps, useClient, useFormValue } from "sanity";

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

export function RegenerateCoverImageInput(props: ObjectInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const client = useClient({ apiVersion: "2024-01-01" });
  const env = import.meta.env as unknown as StudioEnv;
  const workerUrl = (env.SANITY_STUDIO_COVER_WORKER_URL || "").trim();
  const workerToken = (env.SANITY_STUDIO_COVER_WORKER_TOKEN || "").trim();
  const doc = (useFormValue([]) || {}) as Record<string, unknown>;

  const sourceId = typeof doc.sourceId === "string" ? doc.sourceId.trim() : "";
  const title = typeof doc.title === "string" ? doc.title.trim() : "";
  const excerpt = typeof doc.excerpt === "string" ? doc.excerpt.trim() : "";
  const body = typeof doc.body === "string" ? doc.body.trim() : "";

  const disabled =
    props.readOnly ||
    isLoading ||
    !workerUrl ||
    !workerToken ||
    !sourceId ||
    !title ||
    !excerpt;

  const regenerate = async () => {
    try {
      setIsLoading(true);
      setStatus("");
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
        const detail = await generateResponse.text().catch(() => "");
        throw new Error(`Generation failed (${generateResponse.status}): ${detail.slice(0, 180)}`);
      }

      const payload = (await generateResponse.json()) as WorkerGenerateResponse;
      if (!payload.ok) {
        throw new Error(payload.error || "Generation failed");
      }

      const imageResponse = await fetch(`${workerUrl.replace(/\/+$/, "")}/image-any/${encodeURIComponent(sourceId)}`);
      if (!imageResponse.ok) {
        throw new Error(`Image fetch failed (${imageResponse.status})`);
      }

      const blob = await imageResponse.blob();
      const asset = await client.assets.upload("image", blob, {
        filename: `${sourceId}-${Date.now()}.png`,
        contentType: "image/png",
      });

      props.onChange(
        set({
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        }),
      );

      setStatus("Cover regenerated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      <Card padding={3} radius={2} tone="transparent" border>
        <Stack space={3}>
          <Button
            text={isLoading ? "Regenerating..." : "Regenerate Cover"}
            mode="ghost"
            tone="primary"
            onClick={regenerate}
            disabled={disabled}
          />
          {status ? <Text size={1}>{status}</Text> : null}
          {!workerUrl || !workerToken ? (
            <Text size={1} muted>
              Missing Studio worker env vars.
            </Text>
          ) : null}
        </Stack>
      </Card>
    </Stack>
  );
}

