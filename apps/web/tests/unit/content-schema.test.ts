import { describe, expect, it } from 'vitest';

import { contentTypes } from '../../src/lib/content/domain';
import { contentSchema } from '../../src/lib/content/schema';
import { createContentFixture } from '../fixtures/content';

describe('content schema', () => {
  it.each(contentTypes)('accepts the unified %s fixture', (type) => {
    expect(contentSchema.safeParse(createContentFixture(type)).success).toBe(true);
  });

  it('keeps journey additive instead of stage-discriminated', () => {
    const fixture = {
      ...createContentFixture('project'),
      stage: 'act-achieve',
      journey: {
        question: 'How can Praxis become durable?',
        thinking: 'Use one evolving record.',
        action: 'Build the first slice.',
        outcome: 'The site builds statically.',
        reflection: 'Keep the data contract small.',
        nextStep: 'Publish and observe real use.',
      },
    } as const;

    const parsed = contentSchema.parse(fixture);
    expect(parsed.contentId).toBe(fixture.contentId);
    expect(parsed.journey?.reflection).toBe(fixture.journey.reflection);
  });

  it('rejects invalid metadata with an actionable issue', () => {
    const fixture = { ...createContentFixture('blog'), contentId: 'INVALID ID' };
    const parsed = contentSchema.safeParse(fixture);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.path.includes('contentId'))).toBe(true);
    }
  });

  it('rejects an updatedAt date before publishedAt', () => {
    const fixture = {
      ...createContentFixture('note'),
      publishedAt: '2026-07-24',
      updatedAt: '2026-07-20',
    };

    expect(contentSchema.safeParse(fixture).success).toBe(false);
  });

  it('rejects duplicate practice events', () => {
    const event = {
      date: '2026-07-22',
      kind: 'practice',
      note: 'Repeated event',
    } as const;
    const fixture = {
      ...createContentFixture('journal'),
      practiceLog: [event, event],
    };

    expect(contentSchema.safeParse(fixture).success).toBe(false);
  });
});
