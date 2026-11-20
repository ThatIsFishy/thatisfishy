import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SHOW_SHOPS } from './src/consts.ts';

export default defineConfig({
  site: 'https://thatisfishy.com',
  trailingSlash: 'always',
  integrations: [
    // If Shops is switched off in src/consts.ts, leave it out of the sitemap too.
    sitemap({ filter: (page) => SHOW_SHOPS || !page.includes('/shops/') }),
  ],
});
