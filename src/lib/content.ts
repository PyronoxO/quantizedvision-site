import artworksJson from "../data/artworks.json";
import type {
  Artwork,
  GlobalModuleConfig,
  HomeDesignSettings,
  HomePageConfig,
  HomeSection,
  PageConfig,
  Post,
  Project,
  RedirectRule,
  SiteSettings,
} from "../types/content";
import {
  globalModulesQuery,
  homePageQuery,
  noteQuery,
  pageSlugsQuery,
  pagesQuery,
  projectQuery,
  redirectsQuery,
  artworkQuery,
  siteSettingsQuery,
} from "./queries";
import { getSanityClient, isSanityConfigured, sanityImageUrl } from "./sanity";

type SanityMedia = {
  asset?: {
    url?: string;
  };
};

type RefItem = {
  title?: string;
  slug?: string;
};

type SanityArtwork = {
  title: string;
  slug: string;
  date: string;
  tools?: string[];
  description?: string;
  mediaType?: Artwork["mediaType"];
  externalUrl?: string;
  externalThumbnail?: string;
  cover?: SanityMedia;
  galleryImages?: SanityMedia[];
  collectionRef?: RefItem;
  categoryRefs?: RefItem[];
  tagRefs?: RefItem[];
};

type SanityProject = Omit<Project, "cover"> & {
  cover?: SanityMedia;
  collectionRef?: RefItem;
  categoryRefs?: RefItem[];
  tagRefs?: RefItem[];
};

type SanityPost = Omit<Post, "tags"> & {
  tagRefs?: RefItem[];
  cover?: SanityMedia;
  authorRef?: { name?: string };
};

type FetchOptions = {
  preview?: boolean;
};

type SiteSettingsDoc = SiteSettings;

type SanityPage = PageConfig & {
  sections?: HomeSection[];
  seo?: PageConfig["seo"] & { ogImage?: SanityMedia };
};

type SanityGlobalModule = GlobalModuleConfig & {
  sections?: HomeSection[];
};

type PageSlugRecord = {
  slug?: string;
  isHome?: boolean;
  is404?: boolean;
};

function mapArtwork(item: SanityArtwork): Artwork {
  const categories = (item.categoryRefs ?? []).map((ref) => ref.title).filter((v): v is string => Boolean(v));
  const tags = (item.tagRefs ?? []).map((ref) => ref.title).filter((v): v is string => Boolean(v));
  const lane = categories[0] || "uncategorized";
  const galleryImages = (item.galleryImages ?? []).map((image) => sanityImageUrl(image) || image.asset?.url || "").filter(Boolean);
  const cover = sanityImageUrl(item.cover) || item.cover?.asset?.url || galleryImages[0] || "";

  return {
    title: item.title,
    slug: item.slug,
    date: item.date,
    lane,
    lanes: categories,
    collection: item.collectionRef?.title || undefined,
    categories,
    tools: item.tools ?? [],
    tags,
    description: item.description ?? "",
    mediaType: item.mediaType,
    externalUrl: item.externalUrl,
    externalThumbnail: item.externalThumbnail,
    cover,
    galleryImages,
  };
}

function mapProject(item: SanityProject): Project {
  return {
    title: item.title,
    slug: item.slug,
    date: item.date,
    summary: item.summary,
    stack: item.stack ?? [],
    collection: item.collectionRef?.title || undefined,
    categories: (item.categoryRefs ?? []).map((ref) => ref.title).filter((v): v is string => Boolean(v)),
    tags: (item.tagRefs ?? []).map((ref) => ref.title).filter((v): v is string => Boolean(v)),
    externalUrl: item.externalUrl,
    cover: sanityImageUrl(item.cover) || item.cover?.asset?.url || undefined,
  };
}

function mapPost(item: SanityPost): Post {
  const tags = (item.tagRefs ?? []).map((ref) => ref.title).filter((v): v is string => Boolean(v));
  return {
    title: item.title,
    slug: item.slug,
    date: item.date,
    excerpt: item.excerpt,
    tags,
    cover: sanityImageUrl(item.cover) || item.cover?.asset?.url || undefined,
    featured: Boolean(item.featured),
    workflowStatus: (item.workflowStatus as Post["workflowStatus"]) || "published",
    readTimeMinutes: item.readTimeMinutes,
    author: item.authorRef?.name || undefined,
  };
}

export async function getArtworks(options: FetchOptions = {}): Promise<Artwork[]> {
  const client = getSanityClient(Boolean(options.preview));
  if (!isSanityConfigured || !client) {
    return artworksJson as Artwork[];
  }

  try {
    const result = await client.fetch<SanityArtwork[]>(artworkQuery);
    return result.map(mapArtwork).filter((item) => item.cover || item.externalUrl);
  } catch {
    return artworksJson as Artwork[];
  }
}

export async function getProjects(options: FetchOptions = {}): Promise<Project[]> {
  const client = getSanityClient(Boolean(options.preview));
  if (!isSanityConfigured || !client) {
    return [];
  }

  try {
    const result = await client.fetch<SanityProject[]>(projectQuery);
    return result.map(mapProject);
  } catch {
    return [];
  }
}

export async function getPosts(options: FetchOptions = {}): Promise<Post[]> {
  const client = getSanityClient(Boolean(options.preview));
  if (!isSanityConfigured || !client) {
    return [];
  }

  try {
    const result = await client.fetch<SanityPost[]>(noteQuery);
    return result
      .map(mapPost)
      .filter((post) => (post.workflowStatus || "published") === "published")
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  } catch {
    return [];
  }
}

export async function getHomePageConfig(options: FetchOptions = {}): Promise<HomePageConfig | null> {
  const client = getSanityClient(Boolean(options.preview));
  if (!isSanityConfigured || !client) {
    return null;
  }

  try {
    const result = await client.fetch<HomePageConfig | null>(homePageQuery);
    return result;
  } catch {
    return null;
  }
}

export async function getSiteDesignSettings(options: FetchOptions = {}): Promise<HomeDesignSettings | null> {
  const settings = await getSiteSettings(options);
  return settings?.design ?? null;
}

export async function getSiteSettings(options: FetchOptions = {}): Promise<SiteSettings | null> {
  const client = getSanityClient(Boolean(options.preview));
  if (!isSanityConfigured || !client) {
    return null;
  }

  try {
    const result = await client.fetch<SiteSettingsDoc | null>(siteSettingsQuery);
    return result ?? null;
  } catch {
    return null;
  }
}

function toRegex(pathPattern: string): RegExp {
  const escaped = pathPattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "i");
}

function matchesModuleScope(module: GlobalModuleConfig, pathname: string): boolean {
  const scope = module.scope || "all";
  const filters = (module.paths || []).map((path) => path.trim()).filter(Boolean);
  if (scope === "all") return true;
  if (filters.length === 0) return scope !== "include";
  const matched = filters.some((pattern) => {
    const normalized = pattern.startsWith("/") ? pattern : `/${pattern}`;
    return toRegex(normalized).test(pathname);
  });
  return scope === "include" ? matched : !matched;
}

async function getPagesAndGlobalModules(options: FetchOptions = {}): Promise<{ pages: PageConfig[]; globalModules: GlobalModuleConfig[] }> {
  const client = getSanityClient(Boolean(options.preview));
  if (!isSanityConfigured || !client) {
    return { pages: [], globalModules: [] };
  }

  try {
    const [pages, globalModules] = await Promise.all([
      client.fetch<SanityPage[]>(pagesQuery),
      client.fetch<SanityGlobalModule[]>(globalModulesQuery),
    ]);
    return {
      pages: (pages || []).map((page) => ({
        ...page,
        seo: page.seo
          ? {
              ...page.seo,
              ogImage: sanityImageUrl(page.seo.ogImage) || page.seo.ogImage?.asset?.url || undefined,
            }
          : undefined,
        sections: Array.isArray(page.sections) ? page.sections : [],
      })),
      globalModules: (globalModules || []).map((module) => ({ ...module, sections: Array.isArray(module.sections) ? module.sections : [] })),
    };
  } catch {
    return { pages: [], globalModules: [] };
  }
}

function attachGlobalModules(page: PageConfig, globalModules: GlobalModuleConfig[], pathname: string): PageConfig {
  const activeModules = globalModules.filter((module) => module.enabled !== false && matchesModuleScope(module, pathname));
  const before = activeModules.filter((module) => module.placement === "before").flatMap((module) => module.sections || []);
  const after = activeModules.filter((module) => module.placement !== "before").flatMap((module) => module.sections || []);

  return {
    ...page,
    sections: [...before, ...(page.sections || []), ...after],
  };
}

export async function getAllCmsPages(options: FetchOptions = {}): Promise<PageConfig[]> {
  const { pages, globalModules } = await getPagesAndGlobalModules(options);
  return pages.map((page) => {
    const pathname = page.isHome || page.slug === "home" ? "/" : `/${page.slug}`;
    return attachGlobalModules(page, globalModules, pathname);
  });
}

export async function getCmsPageByPath(pathname: string, options: FetchOptions = {}): Promise<PageConfig | null> {
  const normalizedPath = pathname === "/" ? "/" : `/${pathname.replace(/^\/+|\/+$/g, "")}`;
  const { pages, globalModules } = await getPagesAndGlobalModules(options);
  if (!pages.length) return null;

  const selected =
    normalizedPath === "/"
      ? pages.find((page) => page.isHome || page.slug === "home")
      : pages.find((page) => page.slug === normalizedPath.replace(/^\//, ""));

  if (!selected) return null;
  return attachGlobalModules(selected, globalModules, normalizedPath);
}

export async function getCmsPageSlugs(options: FetchOptions = {}): Promise<{ slug: string; isHome?: boolean; is404?: boolean }[]> {
  const client = getSanityClient(Boolean(options.preview));
  if (!isSanityConfigured || !client) {
    return [];
  }

  try {
    const rows = await client.fetch<PageSlugRecord[]>(pageSlugsQuery);
    return (rows || [])
      .map((item) => ({ slug: (item.slug || "").trim(), isHome: Boolean(item.isHome), is404: Boolean(item.is404) }))
      .filter((item) => Boolean(item.slug));
  } catch {
    return [];
  }
}

export async function get404Page(options: FetchOptions = {}): Promise<PageConfig | null> {
  const { pages, globalModules } = await getPagesAndGlobalModules(options);
  const selected = pages.find((page) => page.is404 || page.slug === "404");
  if (!selected) return null;
  return attachGlobalModules(selected, globalModules, "/404");
}

export async function getRedirectRules(options: FetchOptions = {}): Promise<RedirectRule[]> {
  const client = getSanityClient(Boolean(options.preview));
  if (!isSanityConfigured || !client) {
    return [];
  }
  try {
    const rows = await client.fetch<RedirectRule[]>(redirectsQuery);
    return (rows || []).filter((row) => Boolean(row?.from && row?.to));
  } catch {
    return [];
  }
}
