import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    topic: z.string(),
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

export const collections = { guides, journal, shops };
