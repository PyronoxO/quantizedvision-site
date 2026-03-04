import { defineField, defineType } from "sanity";
import { ColorPickerStringInput } from "../components/ColorPickerStringInput";
import { FontSelectInput } from "../components/FontSelectInput";
import { FontSizeSliderInput } from "../components/FontSizeSliderInput";
import { NumberSliderInput } from "../components/NumberSliderInput";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "navigation",
      title: "Navigation",
      type: "array",
      description: "Header menu links. Use a page reference for internal links or URL for external.",
      of: [
        defineField({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
            defineField({
              name: "pageRef",
              title: "Internal Page",
              type: "reference",
              to: [{ type: "page" }],
              description: "Preferred for internal links.",
            }),
            defineField({
              name: "url",
              title: "External URL",
              type: "url",
              description: "Use for external links only.",
            }),
            defineField({
              name: "openInNewTab",
              title: "Open in new tab",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: "label", pageTitle: "pageRef.title", url: "url" },
            prepare(selection) {
              return {
                title: selection.title || "Menu Item",
                subtitle: selection.pageTitle || selection.url || "Unlinked item",
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "design",
      title: "Global Design System",
      type: "object",
      fields: [
        defineField({
          name: "headingFont",
          title: "Heading Font",
          type: "string",
          initialValue: "orbitron",
          components: { input: FontSelectInput },
        }),
        defineField({
          name: "bodyFont",
          title: "Body Font",
          type: "string",
          initialValue: "space-grotesk",
          components: { input: FontSelectInput },
        }),
        defineField({
          name: "uiFont",
          title: "UI / Buttons Font",
          type: "string",
          initialValue: "rajdhani",
          components: { input: FontSelectInput },
        }),
        defineField({
          name: "h1Size",
          title: "H1 Font Size",
          type: "string",
          initialValue: "5.5",
          components: { input: FontSizeSliderInput },
        }),
        defineField({
          name: "h2Size",
          title: "H2 Font Size",
          type: "string",
          initialValue: "3",
          components: { input: FontSizeSliderInput },
        }),
        defineField({
          name: "h3Size",
          title: "H3 Font Size",
          type: "string",
          initialValue: "1.9",
          components: { input: FontSizeSliderInput },
        }),
        defineField({
          name: "h4Size",
          title: "H4 Font Size",
          type: "string",
          initialValue: "1.4",
          components: { input: FontSizeSliderInput },
        }),
        defineField({
          name: "h5Size",
          title: "H5 Font Size",
          type: "string",
          initialValue: "1.2",
          components: { input: FontSizeSliderInput },
        }),
        defineField({
          name: "h6Size",
          title: "H6 Font Size",
          type: "string",
          initialValue: "1.04",
          components: { input: FontSizeSliderInput },
        }),
        defineField({
          name: "bodySize",
          title: "Body Font Size",
          type: "string",
          initialValue: "1",
          components: { input: FontSizeSliderInput },
        }),
        defineField({
          name: "textColor",
          title: "Text Color",
          type: "string",
          initialValue: "#ecf2ff",
          components: { input: ColorPickerStringInput },
        }),
        defineField({
          name: "mutedColor",
          title: "Muted Text Color",
          type: "string",
          initialValue: "#94a2c9",
          components: { input: ColorPickerStringInput },
        }),
        defineField({
          name: "accentColor",
          title: "Accent Color",
          type: "string",
          initialValue: "#e11d48",
          components: { input: ColorPickerStringInput },
        }),
        defineField({
          name: "linkColor",
          title: "Link Color",
          type: "string",
          initialValue: "#c8d0ea",
          components: { input: ColorPickerStringInput },
        }),
        defineField({
          name: "sectionDividerOpacity",
          title: "Section Divider Opacity (0-1)",
          type: "number",
          initialValue: 0.08,
          components: { input: NumberSliderInput },
          validation: (rule) => rule.min(0).max(1),
        }),
        defineField({
          name: "seamLeftTintOpacity",
          title: "Seam Left Tint Opacity (0-1)",
          type: "number",
          initialValue: 0.11,
          components: { input: NumberSliderInput },
          validation: (rule) => rule.min(0).max(1),
        }),
        defineField({
          name: "seamRightTintOpacity",
          title: "Seam Right Tint Opacity (0-1)",
          type: "number",
          initialValue: 0.14,
          components: { input: NumberSliderInput },
          validation: (rule) => rule.min(0).max(1),
        }),
        defineField({
          name: "seamTopEdgeOpacity",
          title: "Seam Top Edge Opacity (0-1)",
          type: "number",
          initialValue: 0.16,
          components: { input: NumberSliderInput },
          validation: (rule) => rule.min(0).max(1),
        }),
        defineField({
          name: "seamBottomEdgeOpacity",
          title: "Seam Bottom Edge Opacity (0-1)",
          type: "number",
          initialValue: 0.14,
          components: { input: NumberSliderInput },
          validation: (rule) => rule.min(0).max(1),
        }),
        defineField({
          name: "aboutHeroGap",
          title: "About Hero To Module Gap (rem)",
          type: "number",
          initialValue: 3.4,
          components: { input: NumberSliderInput },
          validation: (rule) => rule.min(0).max(10),
        }),
        defineField({
          name: "aboutFirstModuleHeadingSize",
          title: "About First Module Heading Size (rem)",
          type: "number",
          initialValue: 2.05,
          components: { input: NumberSliderInput },
          validation: (rule) => rule.min(0.8).max(6),
        }),
        defineField({
          name: "aboutFirstModuleBodySize",
          title: "About First Module Body Size (rem)",
          type: "number",
          initialValue: 1.16,
          components: { input: NumberSliderInput },
          validation: (rule) => rule.min(0.7).max(3),
        }),
        defineField({
          name: "customTypeScale",
          title: "Legacy Custom Type Scale",
          type: "boolean",
          hidden: true,
          readOnly: true,
        }),
        defineField({
          name: "typeScalePreset",
          title: "Legacy Type Scale Preset",
          type: "string",
          hidden: true,
          readOnly: true,
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Site Settings",
        subtitle: "Global template styles",
      };
    },
  },
});
