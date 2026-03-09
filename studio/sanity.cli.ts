import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  reactStrictMode: true,
  api: {
    projectId: process.env.SANITY_PROJECT_ID || "l0gb1nay",
    dataset: process.env.SANITY_DATASET || "production",
  },
});
