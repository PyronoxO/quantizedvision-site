export type Lane = "visual-heavy" | "mad-hatter" | "hybrid";
export type MediaType = "image" | "video" | "external";

export interface Artwork {
  title: string;
  slug: string;
  date: string;
  lane: Lane | string;
  tools: string[];
  tags: string[];
  cover: string;
  description: string;
  mediaType?: MediaType;
  externalUrl?: string;
}

export interface Project {
  title: string;
  slug: string;
  date: string;
  summary: string;
  stack: string[];
  cover?: string;
  externalUrl?: string;
}

export interface Note {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
}
