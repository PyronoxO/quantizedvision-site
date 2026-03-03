import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

type RuntimeEnv = Record<string, unknown> | undefined;

let runtimeEnv: RuntimeEnv;

function readEnv(key: string): string {
  const runtimeValue = runtimeEnv?.[key];
  if (typeof runtimeValue === "string" && runtimeValue.trim()) return runtimeValue.trim();
  const buildValue = (import.meta.env as Record<string, string | undefined>)[key];
  if (typeof buildValue === "string" && buildValue.trim()) return buildValue.trim();
  return "";
}

function getSanityConfig() {
  const projectId = readEnv("SANITY_PROJECT_ID");
  const dataset = readEnv("SANITY_DATASET");
  const apiVersion = readEnv("SANITY_API_VERSION") || "2024-01-01";
  const token = readEnv("SANITY_API_READ_TOKEN");
  return { projectId, dataset, apiVersion, token, isConfigured: Boolean(projectId && dataset) };
}

export function setSanityRuntimeEnv(env: RuntimeEnv) {
  runtimeEnv = env;
}

export function isSanityConfigured() {
  return getSanityConfig().isConfigured;
}

export function getSanityClient(preview = false) {
  const { projectId, dataset, apiVersion, token, isConfigured } = getSanityConfig();
  if (!isConfigured) return null;
  return createClient({
    projectId,
    dataset,
    apiVersion,
    // Keep CMS edits visible immediately (no CDN lag).
    useCdn: false,
    token,
    perspective: preview ? "previewDrafts" : "published",
  });
}

export function sanityImageUrl(source: unknown): string | null {
  if (!source) return null;
  const client = getSanityClient(false);
  if (!client) return null;
  const builder = createImageUrlBuilder(client);
  return builder.image(source).auto("format").fit("max").url();
}
