import { defineField, defineType } from "sanity";

export const noteType = defineType({
  name: "note",
  title: "Note",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (rule) => rule.required() }),
    defineField({ name: "date", title: "Date", type: "date", validation: (rule) => rule.required() }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "string" }] }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "date",
    },
  },
});
