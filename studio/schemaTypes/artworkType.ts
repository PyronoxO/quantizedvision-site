import { defineField, defineType } from "sanity";

export const artworkType = defineType({
  name: "artwork",
  title: "Artwork",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: "date", title: "Date", type: "date", validation: (rule) => rule.required() }),
    defineField({
      name: "lane",
      title: "Lane",
      type: "string",
      options: {
        list: [
          { title: "Visual Heavy", value: "visual-heavy" },
          { title: "Mad Hatter", value: "mad-hatter" },
          { title: "Hybrid", value: "hybrid" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "tools", title: "Tools", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
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
    }),
    defineField({
      name: "cover",
      title: "Cover Media",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType === "external",
    }),
    defineField({
      name: "externalUrl",
      title: "External URL (TikTok/Instagram/YouTube)",
      type: "url",
      hidden: ({ parent }) => parent?.mediaType !== "external",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "lane",
      media: "cover",
    },
  },
});
