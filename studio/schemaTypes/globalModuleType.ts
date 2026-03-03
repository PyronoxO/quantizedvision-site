import { defineArrayMember, defineField, defineType } from "sanity";
import { pageSectionArrayOf } from "./pageSections";

export const globalModuleType = defineType({
  name: "globalModule",
  title: "Global Module",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
    defineField({
      name: "placement",
      title: "Placement",
      type: "string",
      options: {
        list: [
          { title: "Before page modules", value: "before" },
          { title: "After page modules", value: "after" },
        ],
      },
      initialValue: "after",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "scope",
      title: "Scope",
      type: "string",
      options: {
        list: [
          { title: "All pages", value: "all" },
          { title: "Only selected paths", value: "include" },
          { title: "All except selected paths", value: "exclude" },
        ],
      },
      initialValue: "all",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "paths",
      title: "Path filters",
      description: "Examples: /about, /posts, /work/*",
      type: "array",
      hidden: ({ parent }) => parent?.scope === "all",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "sections",
      title: "Modules",
      description: "Reusable modules injected globally by scope and placement.",
      type: "array",
      of: pageSectionArrayOf,
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      enabled: "enabled",
      placement: "placement",
      scope: "scope",
    },
    prepare(selection) {
      return {
        title: selection.title || "Global Module",
        subtitle: `${selection.enabled ? "enabled" : "disabled"} • ${selection.placement || "after"} • ${selection.scope || "all"}`,
      };
    },
  },
});
