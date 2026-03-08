import { defineField, defineType } from "sanity";

export const sourceNewsItemType = defineType({
  name: "sourceNewsItem",
  title: "Source News Item",
  type: "document",
  fields: [
    defineField({
      name: "sourceId",
      title: "Source ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Source Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sourceUrl",
      title: "Source URL",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rawExcerpt",
      title: "Raw Excerpt",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "sourceName",
      title: "Source Name",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "ingested",
      options: {
        list: [
          { title: "Ingested", value: "ingested" },
          { title: "Selected", value: "selected" },
          { title: "Exported", value: "exported" },
          { title: "Imported", value: "imported" },
          { title: "Needs Approval", value: "needs_approval" },
          { title: "Published", value: "published" },
          { title: "Rejected", value: "rejected" },
          { title: "Archived", value: "archived" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "approvedForExport",
      title: "Approved For Export",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "exportedAt",
      title: "Exported At",
      type: "datetime",
    }),
    defineField({
      name: "importedNoteRef",
      title: "Imported Note",
      type: "reference",
      to: [{ type: "note" }],
    }),
    defineField({
      name: "importedAt",
      title: "Imported At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "sourceName",
      status: "status",
    },
    prepare(selection) {
      const source = selection.subtitle ? `${selection.subtitle}` : "Unknown source";
      const status = selection.status ? ` [${selection.status}]` : "";
      return {
        title: selection.title || "Untitled source item",
        subtitle: `${source}${status}`,
      };
    },
  },
});
