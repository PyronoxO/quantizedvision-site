import artworksJson from "../data/artworks.json";
import type { Artwork, Note, Project } from "../types/content";
import { noteQuery, projectQuery, artworkQuery } from "./queries";
import { isSanityConfigured, sanityClient, sanityImageUrl } from "./sanity";

type SanityMedia = {
  asset?: {
    url?: string;
  };
};

type SanityArtwork = Omit<Artwork, "cover"> & {
  cover?: SanityMedia;
};

type SanityProject = Omit<Project, "cover"> & {
  cover?: SanityMedia;
};

function mapArtwork(item: SanityArtwork): Artwork {
  return {
    title: item.title,
    slug: item.slug,
    date: item.date,
    lane: item.lane,
    tools: item.tools ?? [],
    tags: item.tags ?? [],
    description: item.description ?? "",
    mediaType: item.mediaType,
    externalUrl: item.externalUrl,
    cover: sanityImageUrl(item.cover) || item.cover?.asset?.url || "",
  };
}

function mapProject(item: SanityProject): Project {
  return {
    title: item.title,
    slug: item.slug,
    date: item.date,
    summary: item.summary,
    stack: item.stack ?? [],
    externalUrl: item.externalUrl,
    cover: sanityImageUrl(item.cover) || item.cover?.asset?.url || undefined,
  };
}

export async function getArtworks(): Promise<Artwork[]> {
  if (!isSanityConfigured || !sanityClient) {
    return artworksJson as Artwork[];
  }

  try {
    const result = await sanityClient.fetch<SanityArtwork[]>(artworkQuery);
    return result.map(mapArtwork).filter((item) => item.cover || item.externalUrl);
  } catch {
    return artworksJson as Artwork[];
  }
}

export async function getProjects(): Promise<Project[]> {
  if (!isSanityConfigured || !sanityClient) {
    return [];
  }

  try {
    const result = await sanityClient.fetch<SanityProject[]>(projectQuery);
    return result.map(mapProject);
  } catch {
    return [];
  }
}

export async function getNotes(): Promise<Note[]> {
  if (!isSanityConfigured || !sanityClient) {
    return [];
  }

  try {
    return await sanityClient.fetch<Note[]>(noteQuery);
  } catch {
    return [];
  }
}
