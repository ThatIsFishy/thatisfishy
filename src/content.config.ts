import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// The colours a label can have. The colours themselves are defined in global.css.
const colors = ['ocean', 'sea', 'sun', 'violet', 'coral', 'pink', 'teal', 'orange'] as const;

// Labels: one small file per label in src/content/labels
const labels = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/labels' }),
  schema: z.object({
    name: z.string(),
    color: z.enum(colors).default('ocean'),
    order: z.coerce.number().default(50),
    description: z.string().optional(),
  }),
});

// Articles: each one points to one or more labels
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    labels: z.array(reference('labels')).min(1),
    description: z.string(),
    date: z.coerce.date(),
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
  }),
});

const shops = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/shops' }),
  schema: z.object({
    name: z.string(),
    city: z.string(),
    types: z.array(z.string()).default([]),
    url: z.string().optional(),
    note: z.string().optional(),
  }),
});

// Page texts: the introductions and the small pages, editable in the CMS
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { labels, guides, journal, shops, pages };
