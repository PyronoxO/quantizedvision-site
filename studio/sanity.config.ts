import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "default",
  title: "Quantized Vision Studio",
  projectId: process.env.SANITY_PROJECT_ID || "l0gb1nay",
  dataset: process.env.SANITY_DATASET || "production",
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
});
