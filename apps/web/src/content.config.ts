import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { contentSchema } from './lib/content/schema';

const content = defineCollection({
  loader: glob({
    base: '../../content',
    pattern: '**/*.{md,mdx}',
    generateId: ({ data, entry }) =>
      typeof data.contentId === 'string' && data.contentId.length > 0 ? data.contentId : entry,
  }),
  schema: contentSchema,
});

export const collections = { content };
