import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// The CMS writes an empty optional field as '' (or null). These helpers treat that as "not set"
// so an empty field can never stop the build.
const blank = (v: unknown) => (v === null || v === '' ? undefined : v);
const optionalDate = z.preprocess(blank, z.coerce.date().optional());
const optionalText = z.preprocess(blank, z.string().optional());
const optionalBool = z.preprocess(blank, z.boolean().optional());
// The same fields on pages, articles and stories (see the CMS form order):
// title, search description, intro, dates, notice (none / coming soon / nothing here yet), message.
const shared = {
  description: optionalText,            // for search engines; the intro is used when this is empty
  intro: optionalText,                  // the introduction text under the title
  showDate: optionalBool,               // show "Published ..." under the title
  showUpdated: optionalBool,            // show "Updated ..." under the title
  updated: optionalDate,
  notice: z.preprocess(blank, z.enum(['none', 'coming', 'empty']).optional()),
  comingSoon: optionalBool,             // older switch, still understood
  comingSoonMessage: optionalText,      // the sentence on the notice card
};

// The colours a label can have. The colours themselves are defined in global.css.
// (Labels used fixed colour names before; those old names still work, see colorOf() in src/lib/content.ts.)

// Labels: one file per label, edited like a page (src/content/labels for the Knowledge Center,
// src/content/gallery-labels for the Gallery). The colour and menu order are on top of the page fields.
const labelFields = {
  name: z.string(),                     // the label's title
  color: z.string().default('#1596e0'),
  order: z.coerce.number().default(50),
  description: optionalText,            // for search engines
  intro: optionalText,                  // the introduction text under the title
  showDate: optionalBool,               // show "Published ..." under the title
  date: optionalDate,
  notice: z.preprocess(blank, z.enum(['none', 'coming', 'empty']).optional()),
  comingSoonMessage: optionalText,      // the sentence on the notice card
};
const labels = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/labels' }),
  schema: z.object(labelFields),
});
const galleryLabels = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery-labels' }),
  schema: z.object(labelFields),
});

// Articles: each one points to one or more labels
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    // Label ids. An article may have none (it then only shows under "All").
    labels: z.array(z.string()).default([]),
    date: z.coerce.date(),
    ...shared,
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    ...shared,
  }),
});

const shops = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/shops' }),
  schema: z.object({
    name: z.string(),
    city: z.string(),
    types: z.array(z.string()).default([]),
    url: optionalText,
    note: optionalText,
  }),
});

// Pages: every page of the site (built-in and new), with its text and where its link shows (menu + position)
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    menu: z.preprocess(blank, z.enum(['header', 'footer', 'both', 'none']).default('none')),
    position: z.preprocess(blank, z.coerce.number().default(100)),
    footerPosition: z.preprocess(blank, z.coerce.number().default(100)),
    date: optionalDate,
    ...shared,
  }),
});

// Gallery: one entry = a title, an explanation and one or more photos.
// "order" decides the position on the Gallery page (1 comes first).
// Photos live in public/images/uploads; here we only store the path and the alt text.
const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: optionalDate,
    order: z.coerce.number().default(100),
    // Gallery label ids (the Gallery labels, not the Knowledge Center labels). All photos of the entry share them.
    labels: z.array(z.string()).default([]),
    photos: z
      .array(z.object({
        image: z.string(),
        alt: z.string().min(1, 'Describe what is in the photo'),
        // Where the photo comes from. Shown as a coloured label.
        source: z.preprocess(blank, z.enum(['own', 'ai', 'external']).optional()),
        credit: optionalText,
      }))
      .min(1),
  }),
});

// Important notes: shown in a panel on the home page, only while at least one exists.
const notices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notices' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['Correction', 'Site update', 'Policy', 'Other']).default('Other'),
    date: z.coerce.date(),
  }),
});

export const collections = { labels, galleryLabels, guides, journal, shops, pages, gallery, notices };
