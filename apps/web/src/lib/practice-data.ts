import { z } from 'zod';

import rawPracticeDataset from '../generated/practice-activity.json';
import { contentTypes, practiceKinds, stages } from './content/domain';
import type { PracticeDataset } from './practice';

const eventSchema = z
  .object({
    contentId: z.string(),
    type: z.enum(contentTypes),
    stage: z.enum(stages),
    date: z.string(),
    kind: z.enum(practiceKinds),
    note: z.string().optional(),
    source: z.enum(['publishedAt', 'practiceLog']),
  })
  .strict();

const kindCountsSchema = z.record(z.enum(practiceKinds), z.number().int().nonnegative());

const datasetSchema = z
  .object({
    version: z.literal(1),
    totalEvents: z.number().int().nonnegative(),
    activeDays: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    events: z.array(eventSchema),
    days: z.array(
      z
        .object({
          date: z.string(),
          count: z.number().int().nonnegative(),
          kinds: kindCountsSchema,
          events: z.array(eventSchema),
        })
        .strict(),
    ),
  })
  .strict();

export const practiceDataset: PracticeDataset = datasetSchema.parse(rawPracticeDataset);
