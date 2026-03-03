import { defineField, defineType } from "sanity";
import { pageSectionArrayOf } from "./pageSections";
import { HeroTimingSliderInput } from "../components/HeroTimingSliderInput";

export const pageType = defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: [
    { name: "main", title: "Main" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required(), group: "main" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Use 'home' for homepage root (/).",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
      group: "main",
    }),
    defineField({
      name: "isHome",
      title: "Set as Homepage",
      type: "boolean",
      initialValue: false,
      description: "If enabled, this page renders at /",
      group: "main",
    }),
    defineField({
      name: "is404",
      title: "Set as 404 Page",
      type: "boolean",
      initialValue: false,
      description: "If enabled, this page renders for /404.",
      group: "main",
    }),
    defineField({
      name: "themeVariant",
      title: "Theme Variant",
      type: "string",
      options: {
        list: [
          { title: "Crimson Ice", value: "crimson-ice" },
          { title: "Obsidian Neon", value: "obsidian-neon" },
          { title: "Mono Editorial", value: "mono-editorial" },
        ],
      },
      initialValue: "crimson-ice",
      validation: (rule) => rule.required(),
      group: "main",
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
        defineField({ name: "primaryLabel", title: "Primary Button Label", type: "string" }),
        defineField({ name: "primaryUrl", title: "Primary Button URL", type: "string" }),
        defineField({ name: "secondaryLabel", title: "Secondary Button Label", type: "string" }),
        defineField({ name: "secondaryUrl", title: "Secondary Button URL", type: "string" }),
        defineField({
          name: "mediaItems",
          title: "Hero Media (Independent from Gallery)",
          description: "Upload one or more hero images. If multiple are added, the hero can run as a slider.",
          type: "array",
          of: [
            defineField({
              type: "object",
              fields: [
                defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true }, validation: (rule) => rule.required() }),
                defineField({ name: "alt", title: "Alt Text", type: "string" }),
              ],
              preview: {
                select: { title: "alt", media: "image" },
                prepare(selection) {
                  return { title: selection.title || "Hero image", media: selection.media };
                },
              },
            }),
          ],
        }),
        defineField({
          name: "enableSlider",
          title: "Enable Hero Slider",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "autoplay",
          title: "Autoplay Slider",
          type: "boolean",
          initialValue: true,
          hidden: ({ parent }) => !parent?.enableSlider,
        }),
        defineField({
          name: "autoplayMs",
          title: "Autoplay Interval (ms)",
          type: "number",
          initialValue: 4500,
          validation: (rule) => rule.min(1200).max(15000),
          components: { input: HeroTimingSliderInput },
          hidden: ({ parent }) => !parent?.enableSlider || !parent?.autoplay,
        }),
        defineField({
          name: "transitionMs",
          title: "Transition Duration (ms)",
          type: "number",
          initialValue: 850,
          validation: (rule) => rule.min(150).max(3000),
          components: { input: HeroTimingSliderInput },
          hidden: ({ parent }) => !parent?.enableSlider,
        }),
        defineField({
          name: "showArrows",
          title: "Show Previous/Next Arrows",
          type: "boolean",
          initialValue: true,
          hidden: ({ parent }) => !parent?.enableSlider,
        }),
        defineField({
          name: "showDots",
          title: "Show Bottom Dots",
          type: "boolean",
          initialValue: true,
          hidden: ({ parent }) => !parent?.enableSlider,
        }),
      ],
      validation: (rule) => rule.required(),
      group: "main",
    }),
    defineField({
      name: "sections",
      title: "Page Modules",
      description: "Drag to reorder modules.",
      type: "array",
      of: pageSectionArrayOf,
      group: "main",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      group: "seo",
      fields: [
        defineField({ name: "metaTitle", title: "Meta Title", type: "string" }),
        defineField({ name: "metaDescription", title: "Meta Description", type: "text", rows: 3 }),
        defineField({ name: "canonicalUrl", title: "Canonical URL", type: "url" }),
        defineField({ name: "ogTitle", title: "OG Title", type: "string" }),
        defineField({ name: "ogDescription", title: "OG Description", type: "text", rows: 3 }),
        defineField({ name: "ogImage", title: "OG Image", type: "image", options: { hotspot: true } }),
        defineField({ name: "noIndex", title: "No index", type: "boolean", initialValue: false }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      isHome: "isHome",
      is404: "is404",
    },
    prepare(selection) {
      const slug = typeof selection.slug === "string" ? selection.slug : "";
      const route = selection.isHome ? "/" : selection.is404 ? "/404" : `/${slug}`;
      return {
        title: selection.title || "Untitled Page",
        subtitle: route,
      };
    },
  },
});
