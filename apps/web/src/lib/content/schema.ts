import { z } from 'zod';

import { contentTypes, isKnowledgeSectionKey, practiceKinds, stages, statuses } from './domain';

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: string): boolean {
  if (!dateKeyPattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export const dateKeySchema = z
  .string()
  .regex(dateKeyPattern, '日期必须使用 YYYY-MM-DD 格式')
  .refine(isDateKey, '日期不是有效的自然日');

export const journeySchema = z
  .object({
    question: z.string().trim().min(1).optional(),
    thinking: z.string().trim().min(1).optional(),
    action: z.string().trim().min(1).optional(),
    outcome: z.string().trim().min(1).optional(),
    reflection: z.string().trim().min(1).optional(),
    nextStep: z.string().trim().min(1).optional(),
  })
  .strict();

export const practiceLogEntrySchema = z
  .object({
    date: dateKeySchema,
    kind: z.enum(practiceKinds),
    note: z.string().trim().min(1).max(240).optional(),
  })
  .strict();

const knowledgeSectionKeySchema = z
  .string()
  .refine(isKnowledgeSectionKey, 'knowledgeSections 包含未知入口');

const knowledgeSectionsSchema = z
  .array(knowledgeSectionKeySchema)
  .transform((sections) => [...new Set(sections)]);

export const contentSchema = z
  .object({
    contentId: z
      .string()
      .trim()
      .min(4)
      .max(96)
      .regex(/^[a-z0-9][a-z0-9-]*$/, 'contentId 只能包含小写字母、数字和连字符'),
    title: z.string().trim().min(1).max(120),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9][a-z0-9-]*$/, 'slug 只能包含小写字母、数字和连字符'),
    type: z.enum(contentTypes),
    stage: z.enum(stages),
    status: z.enum(statuses),
    publishedAt: dateKeySchema,
    updatedAt: dateKeySchema,
    summary: z.string().trim().min(1).max(240),
    tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
    knowledgeSections: knowledgeSectionsSchema.optional(),
    journey: journeySchema.optional(),
    practiceLog: z.array(practiceLogEntrySchema).max(200).default([]),
  })
  .strict()
  .superRefine((entry, context) => {
    if (entry.type === 'project' && entry.knowledgeSections !== undefined) {
      context.addIssue({
        code: 'custom',
        path: ['knowledgeSections'],
        message: '项目内容不能设置 knowledgeSections',
      });
    }

    if (entry.updatedAt < entry.publishedAt) {
      context.addIssue({
        code: 'custom',
        path: ['updatedAt'],
        message: 'updatedAt 不能早于 publishedAt',
      });
    }

    const seenEvents = new Set<string>();
    let initialPublishCount = 0;

    entry.practiceLog.forEach((event, index) => {
      const eventKey = `${event.date}:${event.kind}:${event.note ?? ''}`;
      if (seenEvents.has(eventKey)) {
        context.addIssue({
          code: 'custom',
          path: ['practiceLog', index],
          message: 'practiceLog 中存在重复事件',
        });
      }
      seenEvents.add(eventKey);

      if (event.kind === 'publish' && event.date === entry.publishedAt) {
        initialPublishCount += 1;
      }
    });

    if (initialPublishCount > 1) {
      context.addIssue({
        code: 'custom',
        path: ['practiceLog'],
        message: '发布日期最多只能显式记录一个 publish 事件',
      });
    }
  });

export type Journey = z.infer<typeof journeySchema>;
export type PracticeLogEntry = z.infer<typeof practiceLogEntrySchema>;
export type ContentFrontmatter = z.infer<typeof contentSchema>;
