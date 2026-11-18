import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://thatisfishy.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
