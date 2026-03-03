import { defineField, defineType } from "sanity";

export const redirectType = defineType({
  name: "redirect",
  title: "Redirects",
  type: "document",
  fields: [
    defineField({
      name: "from",
      title: "From Path",
      type: "string",
      description: "Example: /old-page",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "to",
      title: "To Path or URL",
      type: "string",
      description: "Example: /new-page or https://example.com",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "statusCode",
      title: "Status Code",
      type: "number",
      initialValue: 301,
      options: {
        list: [
          { title: "301 (Permanent)", value: 301 },
          { title: "302 (Temporary)", value: 302 },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      from: "from",
      to: "to",
      statusCode: "statusCode",
      enabled: "enabled",
    },
    prepare(selection) {
      const prefix = selection.enabled === false ? "Disabled" : String(selection.statusCode || 301);
      return {
        title: `${selection.from || "/"} -> ${selection.to || "/"}`,
        subtitle: prefix,
      };
    },
  },
});
