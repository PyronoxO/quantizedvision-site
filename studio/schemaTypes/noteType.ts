import { defineField, defineType } from "sanity";
import { RegenerateCoverImageInput } from "../components/RegenerateCoverImageInput";

export const noteType = defineType({
  name: "note",
  title: "Post",
  type: "document",
  groups: [
    { name: "main", title: "Main" },
    { name: "editorial", title: "Editorial" },
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
    defineField({
      name: "cover",
      title: "Preview Image",
      type: "image",
      options: { hotspot: true },
      components: { input: RegenerateCoverImageInput },
      group: "main",
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 4, validation: (rule) => rule.required(), group: "main" }),
    defineField({
      name: "body",
      title: "Body",
      type: "text",
      rows: 12,
      group: "main",
    }),
    defineField({
      name: "sourceUrl",
      title: "Source URL",
      type: "url",
      group: "editorial",
    }),
    defineField({
      name: "sourceId",
      title: "Source ID",
      type: "string",
      group: "editorial",
    }),
    defineField({
      name: "sourceNewsRef",
      title: "Source Queue Item",
      type: "reference",
      to: [{ type: "sourceNewsItem" }],
      group: "editorial",
    }),
    defineField({
      name: "authorRef",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      group: "editorial",
    }),
    defineField({
      name: "featured",
      title: "Featured Post",
      type: "boolean",
      initialValue: false,
      group: "editorial",
    }),
    defineField({
      name: "workflowStatus",
      title: "Workflow Status",
      type: "string",
      initialValue: "published",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "In Review", value: "review" },
          { title: "Published", value: "published" },
        ],
      },
      validation: (rule) => rule.required(),
      group: "editorial",
    }),
    defineField({
      name: "readTimeMinutes",
      title: "Read Time (minutes)",
      type: "number",
      group: "editorial",
      validation: (rule) => rule.min(1).max(120),
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
      featured: "featured",
      workflowStatus: "workflowStatus",
    },
    prepare(selection) {
      const status = selection.workflowStatus ? `[${selection.workflowStatus}]` : "";
      return {
        title: selection.title,
        subtitle: `${status}${selection.featured ? " Featured ·" : ""} ${selection.subtitle || ""}`.trim(),
        media: selection.media,
      };
    },
  },
});
