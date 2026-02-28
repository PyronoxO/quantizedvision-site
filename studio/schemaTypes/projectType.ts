import { defineField, defineType } from "sanity";

export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: "date", title: "Date", type: "date", validation: (rule) => rule.required() }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: "stack", title: "Stack", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "cover", title: "Cover Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "externalUrl", title: "External URL", type: "url" }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "date",
      media: "cover",
    },
  },
});
