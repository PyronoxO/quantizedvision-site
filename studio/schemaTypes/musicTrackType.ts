import { defineField, defineType } from "sanity";

export const musicTrackType = defineType({
  name: "musicTrack",
  title: "Music Production Track",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Track Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "artist",
      title: "Artist",
      type: "string",
      initialValue: "Quantized Vision",
    }),
    defineField({
      name: "releaseDate",
      title: "Release Date",
      type: "date",
    }),
    defineField({
      name: "soundcloudUrl",
      title: "SoundCloud URL",
      type: "url",
      description: "Paste track URL, then click document action: Fetch SoundCloud metadata.",
      validation: (rule) =>
        rule.required().uri({
          scheme: ["https"],
        }),
    }),
    defineField({
      name: "embedUrl",
      title: "Embed URL (Optional Override)",
      type: "url",
      description: "Leave empty to auto-generate from SoundCloud URL.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "cover",
      title: "Cover",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "featured",
      title: "Pin to top",
      type: "boolean",
      description: "If enabled, this track appears first on /music.",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "artist",
      media: "cover",
    },
    prepare(selection) {
      return {
        title: selection.title || "Untitled track",
        subtitle: selection.subtitle || "Music Production Track",
        media: selection.media,
      };
    },
  },
});
