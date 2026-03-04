import { defineField, defineType } from "sanity";

export const homePageType = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "themeVariant",
      title: "Theme Variant",
      type: "string",
      options: {
        list: [
          { title: "Crimson Ice", value: "crimson-ice" },
          { title: "Obsidian Neon", value: "obsidian-neon" },
          { title: "Mono Editorial", value: "mono-editorial" },
        ],
      },
      initialValue: "crimson-ice",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
        defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
        defineField({ name: "primaryLabel", title: "Primary Button Label", type: "string" }),
        defineField({ name: "primaryUrl", title: "Primary Button URL", type: "string" }),
        defineField({ name: "secondaryLabel", title: "Secondary Button Label", type: "string" }),
        defineField({ name: "secondaryUrl", title: "Secondary Button URL", type: "string" }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      description: "Drag to reorder. These drive the homepage layout.",
      type: "array",
      of: [
        defineField({
          name: "homeGallerySection",
          title: "Gallery Section",
          type: "object",
          fields: [
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
              return { title: selection.title || "Gallery Section", subtitle: "Homepage block" };
            },
          },
        }),
        defineField({
          name: "homeCtaSection",
          title: "CTA Section",
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
            defineField({ name: "buttonLabel", title: "Button Label", type: "string" }),
            defineField({ name: "buttonUrl", title: "Button URL", type: "string" }),
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
              return { title: selection.title || "CTA Section", subtitle: "Homepage block" };
            },
          },
        }),
        defineField({
          name: "homeStatsSection",
          title: "Stats Section",
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [
                defineField({
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
              return { title: selection.title || "Stats Section", subtitle: "Homepage block" };
            },
          },
        }),
        defineField({
          name: "homeSocialSection",
          title: "Social Media Section",
          type: "object",
          fields: [
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
                defineField({
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
          ],
          preview: {
            select: { title: "heading" },
            prepare(selection) {
              return { title: selection.title || "Social Section", subtitle: "Homepage block" };
            },
          },
        }),
        defineField({
          name: "homePostsSection",
          title: "Post Carousel / Slider",
          type: "object",
          fields: [
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
              return { title: selection.title || "Posts Section", subtitle: "Homepage block" };
            },
          },
        }),
        defineField({
          name: "homeMediaSliderSection",
          title: "Media Slider",
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
            defineField({ name: "limit", title: "Items Limit", type: "number", initialValue: 6 }),
            defineField({ name: "sourceCollection", title: "Source Collection", type: "reference", to: [{ type: "collection" }] }),
          ],
          preview: {
            select: { title: "heading" },
            prepare(selection) {
              return { title: selection.title || "Media Slider", subtitle: "Homepage block" };
            },
          },
        }),
        defineField({
          name: "homeContactSection",
          title: "Contact Form Section",
          type: "object",
          fields: [
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
              return { title: selection.title || "Contact Section", subtitle: "Homepage block" };
            },
          },
        }),
        defineField({
          name: "homeFooterSection",
          title: "Footer Designer",
          type: "object",
          fields: [
            defineField({ name: "brand", title: "Brand", type: "string" }),
            defineField({ name: "tagline", title: "Tagline", type: "string" }),
            defineField({
              name: "links",
              title: "Footer Links",
              type: "array",
              of: [
                defineField({
                  type: "object",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
                    defineField({ name: "url", title: "URL", type: "string", validation: (rule) => rule.required() }),
                  ],
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "brand" },
            prepare(selection) {
              return { title: selection.title || "Footer Section", subtitle: "Homepage block" };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Home Page Config", subtitle: "Singleton" };
    },
  },
});
