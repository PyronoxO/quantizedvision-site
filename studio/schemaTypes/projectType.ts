import { defineField, defineType } from "sanity";

export const projectType = defineType({
  name: "project",
  title: "Project",
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
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
      group: "main",
    }),
    defineField({ name: "date", title: "Date", type: "date", validation: (rule) => rule.required(), group: "main" }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 4, validation: (rule) => rule.required(), group: "main" }),
    defineField({ name: "stack", title: "Stack", type: "array", of: [{ type: "string" }], group: "main" }),
    defineField({ name: "cover", title: "Cover Image", type: "image", options: { hotspot: true }, group: "main" }),
    defineField({ name: "externalUrl", title: "External URL", type: "url", group: "main" }),
    defineField({
      name: "collectionRef",
      title: "Collection",
      type: "reference",
      to: [{ type: "collection" }],
      group: "taxonomy",
    }),
    defineField({
      name: "categoryRefs",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      group: "taxonomy",
    }),
    defineField({
      name: "tagRefs",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
      group: "taxonomy",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "date",
      media: "cover",
    },
  },
});
