import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./deskStructure";
import { fetchExternalMetadataAction } from "./actions/fetchExternalMetadataAction";
import { refreshNoteCoverAction } from "./actions/refreshNoteCoverAction";

export default defineConfig({
  name: "default",
  title: "Quantized Vision Studio",
  projectId: process.env.SANITY_PROJECT_ID || "l0gb1nay",
  dataset: process.env.SANITY_DATASET || "production",
  plugins: [structureTool({ structure })],
  document: {
    actions: (prev, context) => {
      if (context.schemaType === "artwork") {
        return [...prev, fetchExternalMetadataAction];
      }
      if (context.schemaType === "note") {
        return [...prev, refreshNoteCoverAction];
      }
      return prev;
    },
  },
  schema: {
    types: schemaTypes,
  },
});
