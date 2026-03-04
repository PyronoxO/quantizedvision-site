export type MediaType = "image" | "video" | "external";
export type HomeThemeVariant = "crimson-ice" | "obsidian-neon" | "mono-editorial";

export interface SectionOptions {
  hidden?: boolean;
  anchorId?: string;
  startAt?: string;
  endAt?: string;
}

export interface ModuleStyleOverrides {
  dividerOpacity?: number;
  leftTintOpacity?: number;
  rightTintOpacity?: number;
  topEdgeOpacity?: number;
  bottomEdgeOpacity?: number;
  headingSize?: number;
  bodySize?: number;
  gapTop?: number;
}

export interface HomeDesignSettings {
  headingFont?: string;
  bodyFont?: string;
  uiFont?: string;
  h1Size?: number | string;
  h2Size?: number | string;
  h3Size?: number | string;
  h4Size?: number | string;
  h5Size?: number | string;
  h6Size?: number | string;
  bodySize?: number | string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
  linkColor?: string;
  sectionDividerOpacity?: number | string;
  seamLeftTintOpacity?: number | string;
  seamRightTintOpacity?: number | string;
  seamTopEdgeOpacity?: number | string;
  seamBottomEdgeOpacity?: number | string;
  aboutHeroGap?: number | string;
  aboutFirstModuleHeadingSize?: number | string;
  aboutFirstModuleBodySize?: number | string;
}

export interface NavigationItem {
  label: string;
  url?: string;
  openInNewTab?: boolean;
  page?: {
    title?: string;
    slug?: string;
    isHome?: boolean;
  };
}

export interface SiteSettings {
  design?: HomeDesignSettings;
  navigation?: NavigationItem[];
}

export interface HomeHero {
  eyebrow?: string;
  title: string;
  body?: string;
  primaryLabel?: string;
  primaryUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
  mediaItems?: { imageUrl?: string; alt?: string }[];
  enableSlider?: boolean;
  autoplay?: boolean;
  autoplayMs?: number;
  transitionMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

export interface HomeGallerySection {
  _type: "homeGallerySection";
  options?: SectionOptions;
  heading: string;
  description?: string;
  styleVariant?: "masonry" | "cards";
  limit?: number;
  sourceCollection?: string;
}

export interface HomeSocialSection {
  _type: "homeSocialSection";
  options?: SectionOptions;
  style?: ModuleStyleOverrides;
  heading?: string;
  alignment?: "left" | "center" | "right";
  iconSize?: "sm" | "md" | "lg" | "xl";
  links: { platform?: "instagram" | "tiktok" | "youtube" | "facebook" | "x" | "linkedin" | "link"; label?: string; url: string }[];
}

export interface HomePostsSection {
  _type: "homePostsSection";
  options?: SectionOptions;
  heading: string;
  description?: string;
  styleVariant?: "carousel" | "slider";
  limit?: number;
}

export interface HomeMediaSliderSection {
  _type: "homeMediaSliderSection";
  options?: SectionOptions;
  heading: string;
  description?: string;
  limit?: number;
  sourceCollection?: string;
}

export interface ArtworkArchiveSection {
  _type: "artworkArchiveSection";
  options?: SectionOptions;
  heading: string;
  description?: string;
  enableFilters?: boolean;
}

export interface PostArchiveSection {
  _type: "postArchiveSection";
  options?: SectionOptions;
  heading: string;
  description?: string;
  limit?: number;
}

export interface ProjectArchiveSection {
  _type: "projectArchiveSection";
  options?: SectionOptions;
  heading: string;
  description?: string;
  limit?: number;
}

export interface HomeContactSection {
  _type: "homeContactSection";
  options?: SectionOptions;
  heading: string;
  body?: string;
  recipientEmail: string;
  subjectLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  messageLabel?: string;
  submitLabel?: string;
  subjectPlaceholder?: string;
  emailPlaceholder?: string;
  phonePlaceholder?: string;
  messagePlaceholder?: string;
  successRedirectUrl?: string;
}

export interface HomeFooterSection {
  _type: "homeFooterSection";
  options?: SectionOptions;
  style?: ModuleStyleOverrides;
  brand?: string;
  tagline?: string;
  links?: { label: string; url: string }[];
}

export interface HomeSearchSection {
  _type: "homeSearchSection";
  options?: SectionOptions;
  heading: string;
  placeholder?: string;
  emptyMessage?: string;
  limit?: number;
}

export interface HomeCtaSection {
  _type: "homeCtaSection";
  options?: SectionOptions;
  style?: ModuleStyleOverrides;
  heading: string;
  body?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  accent?: "red" | "blue";
}

export interface HomeStatsSection {
  _type: "homeStatsSection";
  options?: SectionOptions;
  heading?: string;
  items: { value: string; label: string }[];
}

export type HomeSection =
  | HomeGallerySection
  | HomeCtaSection
  | HomeStatsSection
  | HomeSocialSection
  | HomePostsSection
  | HomeMediaSliderSection
  | ArtworkArchiveSection
  | PostArchiveSection
  | ProjectArchiveSection
  | HomeContactSection
  | HomeFooterSection
  | HomeSearchSection;

export interface HomePageConfig {
  themeVariant: HomeThemeVariant;
  hero: HomeHero;
  sections: HomeSection[];
}

export interface PageSeo {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface PageConfig {
  title: string;
  slug: string;
  isHome?: boolean;
  is404?: boolean;
  themeVariant: HomeThemeVariant;
  hero: HomeHero;
  sections: HomeSection[];
  seo?: PageSeo;
}

export interface GlobalModuleConfig {
  title: string;
  enabled?: boolean;
  placement?: "before" | "after";
  scope?: "all" | "include" | "exclude";
  paths?: string[];
  sections: HomeSection[];
}

export interface Artwork {
  title: string;
  slug: string;
  date: string;
  lane: string;
  lanes?: string[];
  collection?: string;
  categories?: string[];
  tools: string[];
  tags: string[];
  cover: string;
  galleryImages?: string[];
  description: string;
  mediaType?: MediaType;
  externalUrl?: string;
  externalThumbnail?: string;
}

export interface Project {
  title: string;
  slug: string;
  date: string;
  summary: string;
  stack: string[];
  collection?: string;
  categories?: string[];
  tags?: string[];
  cover?: string;
  externalUrl?: string;
}

export interface Post {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
  cover?: string;
  featured?: boolean;
  workflowStatus?: "draft" | "review" | "published";
  readTimeMinutes?: number;
  author?: string;
}

export interface RedirectRule {
  from: string;
  to: string;
  statusCode?: number;
}
