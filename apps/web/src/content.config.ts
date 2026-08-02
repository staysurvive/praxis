import { defineCollection } from 'astro:content';

import { markdownContentLoader } from './lib/content/content-loader';
import { contentSchema } from './lib/content/schema';

const content = defineCollection({
  loader: markdownContentLoader(),
  schema: contentSchema,
});

export const collections = { content };
