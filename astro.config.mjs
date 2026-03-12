// @ts-check

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://quantizedvision.com',
  output: 'server',
  adapter: cloudflare(),
  session: {
    // Prevent Cloudflare adapter from forcing a KV SESSION binding we do not use.
    driver: 'memory',
  },
  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
