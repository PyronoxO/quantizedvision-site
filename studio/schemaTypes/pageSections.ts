import { defineArrayMember, defineField } from "sanity";
import { NumberSliderInput } from "../components/NumberSliderInput";

const linkFields = [
  defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
  defineField({ name: "url", title: "URL", type: "string", validation: (rule) => rule.required() }),
];

const sectionOptionFields = [
  defineField({
    name: "options",
    title: "Section Options",
    type: "object",
    fields: [
      defineField({
        name: "hidden",
        title: "Hide Section",
        description: "Hide this section on the frontend without deleting it.",
        type: "boolean",
        initialValue: false,
      }),
      defineField({
        name: "anchorId",
        title: "Anchor ID",
        description: "Optional in-page anchor (example: contact-us).",
        type: "string",
        validation: (rule) => rule.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, { name: "anchor-id" }).warning("Use letters, numbers and dashes."),
      }),
      defineField({
        name: "startAt",
        title: "Start Showing At",
        type: "datetime",
        description: "Optional publish window start.",
      }),
      defineField({
        name: "endAt",
        title: "Stop Showing At",
        type: "datetime",
        description: "Optional publish window end.",
      }),
    ],
  }),
];

const seamStyleField = defineField({
  name: "style",
  title: "Module Style Overrides",
  type: "object",
  fields: [
    defineField({
      name: "dividerOpacity",
      title: "Divider Opacity (0-1)",
      type: "number",
      components: { input: NumberSliderInput },
      validation: (rule) => rule.min(0).max(1),
    }),
    defineField({
      name: "leftTintOpacity",
      title: "Left Tint Opacity (0-1)",
      type: "number",
      components: { input: NumberSliderInput },
      validation: (rule) => rule.min(0).max(1),
    }),
    defineField({
      name: "rightTintOpacity",
      title: "Right Tint Opacity (0-1)",
      type: "number",
      components: { input: NumberSliderInput },
      validation: (rule) => rule.min(0).max(1),
    }),
    defineField({
      name: "topEdgeOpacity",
      title: "Top Edge Opacity (0-1)",
      type: "number",
      components: { input: NumberSliderInput },
      validation: (rule) => rule.min(0).max(1),
    }),
    defineField({
      name: "bottomEdgeOpacity",
      title: "Bottom Edge Opacity (0-1)",
      type: "number",
      components: { input: NumberSliderInput },
      validation: (rule) => rule.min(0).max(1),
    }),
    defineField({
      name: "headingSize",
      title: "Heading Size (rem)",
      type: "number",
      components: { input: NumberSliderInput },
      validation: (rule) => rule.min(0.8).max(4),
    }),
    defineField({
      name: "bodySize",
      title: "Body Size (rem)",
      type: "number",
      components: { input: NumberSliderInput },
      validation: (rule) => rule.min(0.7).max(2),
    }),
    defineField({
      name: "gapTop",
      title: "Top Gap (rem)",
      type: "number",
      components: { input: NumberSliderInput },
      validation: (rule) => rule.min(0).max(8),
    }),
  ],
});

export const pageSectionArrayOf = [
  defineArrayMember({
    name: "homeGallerySection",
    title: "Gallery Section",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
      defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
      defineField({
        name: "styleVariant",
        title: "Style Variant",
        type: "string",
        options: {
          list: [
            { title: "Masonry", value: "masonry" },
            { title: "Cards", value: "cards" },
          ],
        },
        initialValue: "masonry",
      }),
      defineField({ name: "limit", title: "Items Limit", type: "number", initialValue: 6 }),
      defineField({ name: "sourceCollection", title: "Source Collection", type: "reference", to: [{ type: "collection" }] }),
    ],
    preview: {
      select: { title: "heading" },
      prepare(selection) {
        return { title: selection.title || "Gallery Section", subtitle: "Page block" };
      },
    },
  }),
  defineArrayMember({
    name: "homeCtaSection",
    title: "CTA Section",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
      defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
      defineField({ name: "buttonLabel", title: "Button Label", type: "string" }),
      defineField({ name: "buttonUrl", title: "Button URL", type: "string" }),
      seamStyleField,
      defineField({
        name: "accent",
        title: "Accent",
        type: "string",
        options: {
          list: [
            { title: "Red", value: "red" },
            { title: "Blue", value: "blue" },
          ],
        },
        initialValue: "red",
      }),
    ],
    preview: {
      select: { title: "heading" },
      prepare(selection) {
        return { title: selection.title || "CTA Section", subtitle: "Page block" };
      },
    },
  }),
  defineArrayMember({
    name: "homeStatsSection",
    title: "Stats Section",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "heading", title: "Heading", type: "string" }),
      defineField({
        name: "items",
        title: "Items",
        type: "array",
        of: [
          defineArrayMember({
            type: "object",
            fields: [
              defineField({ name: "value", title: "Value", type: "string", validation: (rule) => rule.required() }),
              defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
            ],
          }),
        ],
        validation: (rule) => rule.min(1),
      }),
    ],
    preview: {
      select: { title: "heading" },
      prepare(selection) {
        return { title: selection.title || "Stats Section", subtitle: "Page block" };
      },
    },
  }),
  defineArrayMember({
    name: "homeSocialSection",
    title: "Social Media Section",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "heading", title: "Heading", type: "string" }),
      defineField({
        name: "alignment",
        title: "Alignment",
        type: "string",
        options: {
          list: [
            { title: "Left", value: "left" },
            { title: "Center", value: "center" },
            { title: "Right", value: "right" },
          ],
        },
        initialValue: "left",
      }),
      defineField({
        name: "iconSize",
        title: "Icon Size",
        type: "string",
        options: {
          list: [
            { title: "Small", value: "sm" },
            { title: "Medium", value: "md" },
            { title: "Large", value: "lg" },
            { title: "Extra Large", value: "xl" },
          ],
        },
        initialValue: "md",
      }),
      defineField({
        name: "links",
        title: "Links",
        type: "array",
        of: [
          defineArrayMember({
            type: "object",
            fields: [
              defineField({
                name: "platform",
                title: "Platform Icon",
                type: "string",
                options: {
                  list: [
                    { title: "Instagram", value: "instagram" },
                    { title: "TikTok", value: "tiktok" },
                    { title: "YouTube", value: "youtube" },
                    { title: "Facebook", value: "facebook" },
                    { title: "X (Twitter)", value: "x" },
                    { title: "LinkedIn", value: "linkedin" },
                    { title: "Generic Link", value: "link" },
                  ],
                },
                initialValue: "link",
                validation: (rule) => rule.required(),
              }),
              defineField({ name: "url", title: "URL", type: "string", validation: (rule) => rule.required() }),
            ],
          }),
        ],
        validation: (rule) => rule.min(1),
      }),
      seamStyleField,
    ],
    preview: {
      select: { title: "heading" },
      prepare(selection) {
        return { title: selection.title || "Social Section", subtitle: "Page block" };
      },
    },
  }),
  defineArrayMember({
    name: "homePostsSection",
    title: "Post Carousel / Slider",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
      defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
      defineField({
        name: "styleVariant",
        title: "Style Variant",
        type: "string",
        options: {
          list: [
            { title: "Carousel", value: "carousel" },
            { title: "Slider", value: "slider" },
          ],
        },
        initialValue: "carousel",
      }),
      defineField({ name: "limit", title: "Items Limit", type: "number", initialValue: 6 }),
    ],
    preview: {
      select: { title: "heading" },
      prepare(selection) {
        return { title: selection.title || "Posts Section", subtitle: "Page block" };
      },
    },
  }),
  defineArrayMember({
    name: "homeMediaSliderSection",
    title: "Media Slider",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
      defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
      defineField({ name: "limit", title: "Items Limit", type: "number", initialValue: 6 }),
      defineField({ name: "sourceCollection", title: "Source Collection", type: "reference", to: [{ type: "collection" }] }),
    ],
    preview: {
      select: { title: "heading" },
      prepare(selection) {
        return { title: selection.title || "Media Slider", subtitle: "Page block" };
      },
    },
  }),
  defineArrayMember({
    name: "artworkArchiveSection",
    title: "Artwork Archive (Full Gallery)",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Exhibition Wall", validation: (rule) => rule.required() }),
      defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
      defineField({ name: "enableFilters", title: "Enable Collection Filters", type: "boolean", initialValue: true }),
    ],
    preview: {
      select: { title: "heading" },
      prepare(selection) {
        return { title: selection.title || "Artwork Archive", subtitle: "Full gallery block" };
      },
    },
  }),
  defineArrayMember({
    name: "postArchiveSection",
    title: "Post Archive",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Posts", validation: (rule) => rule.required() }),
      defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
      defineField({ name: "limit", title: "Items Limit", type: "number", initialValue: 50 }),
    ],
    preview: {
      select: { title: "heading" },
      prepare(selection) {
        return { title: selection.title || "Post Archive", subtitle: "Full posts list block" };
      },
    },
  }),
  defineArrayMember({
    name: "projectArchiveSection",
    title: "Project Archive",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "heading", title: "Heading", type: "string", initialValue: "Projects", validation: (rule) => rule.required() }),
      defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
      defineField({ name: "limit", title: "Items Limit", type: "number", initialValue: 50 }),
    ],
    preview: {
      select: { title: "heading" },
      prepare(selection) {
        return { title: selection.title || "Project Archive", subtitle: "Full projects list block" };
      },
    },
  }),
  defineArrayMember({
    name: "homeContactSection",
    title: "Contact Form Section",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
      defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
      defineField({
        name: "recipientEmail",
        title: "Recipient Email",
        description: "All form submissions will be sent to this address.",
        type: "string",
        validation: (rule) => rule.required().email(),
      }),
      defineField({ name: "subjectLabel", title: "Subject Label", type: "string", initialValue: "Subject" }),
      defineField({ name: "emailLabel", title: "Email Label", type: "string", initialValue: "Email" }),
      defineField({ name: "phoneLabel", title: "Phone Label", type: "string", initialValue: "Phone" }),
      defineField({ name: "messageLabel", title: "Message Label", type: "string", initialValue: "Message" }),
      defineField({ name: "submitLabel", title: "Submit Button Label", type: "string", initialValue: "Submit" }),
      defineField({ name: "subjectPlaceholder", title: "Subject Placeholder", type: "string", initialValue: "Select a project subject" }),
      defineField({ name: "emailPlaceholder", title: "Email Placeholder", type: "string", initialValue: "your@email.com" }),
      defineField({ name: "phonePlaceholder", title: "Phone Placeholder", type: "string", initialValue: "+1 555 123 4567" }),
      defineField({ name: "messagePlaceholder", title: "Message Placeholder", type: "string", initialValue: "Tell me about your project..." }),
      defineField({
        name: "successRedirectUrl",
        title: "Success Redirect URL",
        description: "Optional URL to redirect after successful submit.",
        type: "string",
      }),
    ],
    preview: {
      select: { title: "heading" },
      prepare(selection) {
        return { title: selection.title || "Contact Section", subtitle: "Page block" };
      },
    },
  }),
  defineArrayMember({
    name: "homeFooterSection",
    title: "Footer Designer",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "brand", title: "Brand", type: "string" }),
      defineField({ name: "tagline", title: "Tagline", type: "string" }),
      seamStyleField,
      defineField({
        name: "links",
        title: "Footer Links",
        type: "array",
        of: [defineArrayMember({ type: "object", fields: linkFields })],
      }),
    ],
    preview: {
      select: { title: "brand" },
      prepare(selection) {
        return { title: selection.title || "Footer Section", subtitle: "Page block" };
      },
    },
  }),
  defineArrayMember({
    name: "homeSearchSection",
    title: "Search Section",
    type: "object",
    fields: [
      ...sectionOptionFields,
      defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
      defineField({ name: "placeholder", title: "Search Placeholder", type: "string", initialValue: "Search artworks, posts, projects..." }),
      defineField({ name: "emptyMessage", title: "No Results Message", type: "string", initialValue: "No matching results yet." }),
      defineField({ name: "limit", title: "Max Results", type: "number", initialValue: 10 }),
    ],
    preview: {
      select: { title: "heading" },
      prepare(selection) {
        return { title: selection.title || "Search Section", subtitle: "Page block" };
      },
    },
  }),
];
