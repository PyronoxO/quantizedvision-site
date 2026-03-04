import React from "react";
import { defineField, defineType } from "sanity";

function toCompactSlug(input: string, max = 56): string {
  return input
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#@][\p{L}\p{N}_-]+/gu, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, max)
    .replace(/-+$/g, "");
}

export const artworkType = defineType({
  name: "artwork",
  title: "Artwork",
  type: "document",
  groups: [
    { name: "main", title: "Main" },
    { name: "taxonomy", title: "Taxonomy" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required(), group: "main" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 56,
        slugify: (input) => toCompactSlug(input, 56),
      },
      validation: (rule) =>
        rule
          .required()
          .custom((value) => {
            const slugValue = value?.current;
            if (!slugValue) return "Slug is required.";
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugValue)) {
              return "Use lowercase letters, numbers, and dashes only (example: my-artwork-01).";
            }
            return true;
          }),
      group: "main",
    }),
    defineField({ name: "date", title: "Date", type: "date", validation: (rule) => rule.required(), group: "main" }),
    defineField({
      name: "collectionRef",
      title: "Collection",
      description: "Pick from Collections list (create once, reuse everywhere).",
      type: "reference",
      to: [{ type: "collection" }],
      group: "taxonomy",
    }),
    defineField({
      name: "categoryRefs",
      title: "Categories",
      description: "Reusable categories for grouping/filtering.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      group: "taxonomy",
    }),
    defineField({
      name: "tagRefs",
      title: "Tags",
      description: "Reusable tags for fine-grained filtering.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
      group: "taxonomy",
    }),
    defineField({ name: "tools", title: "Tools", type: "array", of: [{ type: "string" }], group: "main" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3, group: "main" }),
    defineField({
      name: "mediaType",
      title: "Media Type",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
          { title: "External Link", value: "external" },
        ],
      },
      initialValue: "image",
      group: "main",
    }),
    defineField({
      name: "cover",
      title: "Cover Media",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType === "external",
      group: "main",
    }),
    defineField({
      name: "galleryImages",
      title: "Bulk Photos",
      description: "Drag and drop multiple photos here for bulk upload.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      options: { layout: "grid" },
      hidden: ({ parent }) => parent?.mediaType !== "image",
      group: "main",
    }),
    defineField({
      name: "externalUrl",
      title: "External URL (TikTok/Instagram/YouTube)",
      type: "url",
      hidden: ({ parent }) => parent?.mediaType !== "external",
      group: "main",
    }),
    defineField({
      name: "externalThumbnail",
      title: "External Thumbnail URL",
      description: "Optional preview image URL for external posts (auto-filled by Fetch metadata).",
      type: "url",
      hidden: ({ parent }) => parent?.mediaType !== "external",
      group: "main",
    }),
  ],
  preview: {
    select: {
      title: "title",
      collection: "collectionRef.title",
      media: "cover",
      externalThumbnail: "externalThumbnail",
      mediaType: "mediaType",
    },
    prepare(selection: { title?: string; collection?: string; media?: unknown; externalThumbnail?: string; mediaType?: string }) {
      const thumbnailMedia =
        selection.mediaType === "external" && selection.externalThumbnail
          ? React.createElement("img", {
              src: selection.externalThumbnail,
              alt: "",
              style: { width: "100%", height: "100%", objectFit: "cover" },
            })
          : selection.media;

      return {
        title: selection.title,
        subtitle: selection.collection || "artwork",
        media: thumbnailMedia,
      };
    },
  },
});
