import type { ContentType } from '../../src/lib/content/domain';

export function createContentFixture(type: ContentType) {
  return {
    contentId: `fixture-${type}-0001`,
    title: `${type} fixture`,
    slug: `${type}-fixture`,
    type,
    stage: 'know-think',
    status: 'ongoing',
    publishedAt: '2026-07-20',
    updatedAt: '2026-07-24',
    summary: 'A valid schema fixture used only by automated tests.',
    tags: ['fixture'],
    journey: {
      question: 'What should this fixture prove?',
      thinking: 'One unified schema supports every content type.',
    },
    practiceLog: [
      {
        date: '2026-07-22',
        kind: 'learn',
        note: 'Validated the shared content contract.',
      },
    ],
  } as const;
}
