import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkPhotos from './src/lib/remark-photos.mjs';
import remarkRefs from './src/lib/remark-refs.mjs';
import { SHOW_SHOPS, SHOW_RATING } from './src/consts.ts';

export default defineConfig({
  site: 'https://thatisfishy.com',
  trailingSlash: 'always',
  // Turns photo lines in articles into positioned figures (see src/lib/remark-photos.mjs),
  // and source markers into numbers with the "Sources and useful links" box (see src/lib/remark-refs.mjs)
  markdown: { processor: unified({ remarkPlugins: [remarkRefs, remarkPhotos] }) },
  integrations: [
    // If Shop Finder is switched off in src/consts.ts, leave it out of the sitemap too.
    sitemap({
      filter: (page) => !page.includes('/contact/thanks/') && (SHOW_SHOPS || !page.includes('/shop-finder/')) && (SHOW_RATING || !page.includes('/rating-system/')),
    }),
  ],
});
