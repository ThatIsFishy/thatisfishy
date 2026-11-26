import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkPhotos from './src/lib/remark-photos.mjs';
import remarkRefs from './src/lib/remark-refs.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shareCard } from './src/lib/share-card.mjs';

// After the build: make the share pictures for pages without a heading photo (see src/lib/share-card.mjs).
// Each such page has <meta name="share-card"> with its title; the picture is saved where its og:image points.
const shareCards = {
  name: 'share-cards',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      const pages = [];
      const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
        const f = path.join(d, e.name);
        if (e.isDirectory()) walk(f); else if (e.name.endsWith('.html')) pages.push(f);
      });
      walk(root);
      let made = 0;
      for (const f of pages) {
        const html = fs.readFileSync(f, 'utf8');
        const card = html.match(/<meta name="share-card" content="([^"]*)"/);
        const img = html.match(/<meta property="og:image" content="([^"]*)"/);
        if (!card || !img) continue;
        const out = path.join(root, decodeURIComponent(new URL(unesc(img[1])).pathname));
        if (fs.existsSync(out)) continue;
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, await shareCard(JSON.parse(unesc(card[1]))));
        made++;
      }
      logger.info(`${made} share pictures made`);
    },
  },
};
import { SHOW_SHOPS, SHOW_RATING } from './src/consts.ts';

export default defineConfig({
  site: 'https://thatisfishy.com',
  trailingSlash: 'always',
  // Turns photo lines in articles into positioned figures (see src/lib/remark-photos.mjs),
  // and source markers into numbers with the "Sources and useful links" box (see src/lib/remark-refs.mjs)
  markdown: { processor: unified({ remarkPlugins: [remarkRefs, remarkPhotos] }) },
  integrations: [
    shareCards,
    // If Shop Finder is switched off in src/consts.ts, leave it out of the sitemap too.
    sitemap({
      filter: (page) => !page.includes('/contact/thanks/') && (SHOW_SHOPS || !page.includes('/shop-finder/')) && (SHOW_RATING || !page.includes('/rating-system/')),
    }),
  ],
});
