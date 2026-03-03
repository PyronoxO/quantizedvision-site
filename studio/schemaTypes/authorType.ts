import { defineField, defineType } from "sanity";

export const authorType = defineType({
  name: "author",
  title: "Authors",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 3 }),
    defineField({ name: "avatar", title: "Avatar", type: "image", options: { hotspot: true } }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "slug.current",
      media: "avatar",
    },
  },
});
