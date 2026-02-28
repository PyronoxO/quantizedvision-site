import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

const projectId = import.meta.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET;
const apiVersion = import.meta.env.SANITY_API_VERSION || "2024-01-01";
const token = import.meta.env.SANITY_API_READ_TOKEN;

export const isSanityConfigured = Boolean(projectId && dataset);

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      token,
      perspective: "published",
    })
  : null;

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

export function sanityImageUrl(source: unknown): string | null {
  if (!builder || !source) return null;
  return builder.image(source).auto("format").fit("max").url();
}
