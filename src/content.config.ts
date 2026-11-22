import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// The CMS writes an empty optional field as '' (or null). These helpers treat that as "not set"
// so an empty field can never stop the build.
const blank = (v: unknown) => (v === null || v === '' ? undefined : v);
const optionalDate = z.preprocess(blank, z.coerce.date().optional());
const optionalText = z.preprocess(blank, z.string().optional());

// The colours a label can have. The colours themselves are defined in global.css.
// (Labels used fixed colour names before; those old names still work, see colorOf() in src/lib/content.ts.)

// Labels: one small file per label in src/content/labels
const labels = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/labels' }),
  schema: z.object({
    name: z.string(),
    color: z.string().default('#1596e0'),
    order: z.coerce.number().default(50),
    description: optionalText,
    emptyMessage: optionalText,
  }),
});

// Articles: each one points to one or more labels
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    // Label ids. An article may have none (it then only shows under "All").
    labels: z.array(z.string()).default([]),
    description: z.string(),
    date: z.coerce.date(),
    updated: optionalDate,
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: optionalDate,
    description: optionalText,
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

// Page texts: the introductions and the small pages, editable in the CMS
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: optionalText,
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

export const collections = { labels, guides, journal, shops, pages, gallery, notices };
