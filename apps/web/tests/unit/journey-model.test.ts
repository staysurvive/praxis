import { describe, expect, it } from 'vitest';

import { buildJourneyViewModel } from '../../src/features/journey/model';
import type { ContentSummary } from '../../src/lib/content';
import { getPublicContentUrl } from '../../src/lib/content/domain';
import type { ContentType } from '../../src/lib/content/domain';
import { contentSchema } from '../../src/lib/content/schema';
import type { ContentFrontmatter } from '../../src/lib/content/schema';
import { buildPracticeDataset, toPracticeSourceEntry } from '../../src/lib/practice';
import type { PracticeSourceEntry } from '../../src/lib/practice';
import { createContentFixture } from '../fixtures/content';

function createSummary(
  type: ContentType,
  overrides: Partial<ContentFrontmatter> = {},
): ContentSummary {
  const data = contentSchema.parse({ ...createContentFixture(type), ...overrides });

  return {
    id: `${type}/${data.slug}`,
    ...data,
    url: getPublicContentUrl(data),
  };
}

const knowledgeSource = createSummary('note', {
  contentId: 'journey-note-0001',
  slug: 'journey-note',
  title: 'Journey note',
  publishedAt: '2026-07-25',
  updatedAt: '2026-07-25',
  practiceLog: [
    { date: '2026-07-25', kind: 'reflect', note: 'Recorded reflection.' },
    { date: '2026-07-25', kind: 'milestone', note: 'Recorded milestone.' },
  ],
});
const projectSource = createSummary('project', {
  contentId: 'journey-project-0002',
  slug: 'journey-project',
  title: 'Journey project',
  publishedAt: '2026-07-24',
  updatedAt: '2026-07-24',
  practiceLog: [{ date: '2026-07-26', kind: 'practice', note: 'Built the project.' }],
});

describe('journey view model', () => {
  it('projects one honest empty state from an empty dataset', () => {
    expect(buildJourneyViewModel(buildPracticeDataset([]), [])).toEqual({
      totalEvents: 0,
      activeDays: 0,
      contentCount: 0,
      hasEvents: false,
      days: [],
    });
  });

  it('joins events to their exact Knowledge and Project sources', () => {
    const model = buildJourneyViewModel(
      buildPracticeDataset([
        toPracticeSourceEntry(knowledgeSource),
        toPracticeSourceEntry(projectSource),
      ]),
      [knowledgeSource, projectSource],
    );
    const events = model.days.flatMap((day) => day.events);
    const knowledgeEvent = events.find(
      (event) => event.source.contentId === knowledgeSource.contentId,
    );
    const projectEvent = events.find((event) => event.source.contentId === projectSource.contentId);

    expect(knowledgeEvent?.source).toMatchObject({
      title: knowledgeSource.title,
      type: 'note',
      url: knowledgeSource.url,
      destination: 'knowledge',
    });
    expect(projectEvent?.source).toMatchObject({
      title: projectSource.title,
      type: 'project',
      url: projectSource.url,
      destination: 'project',
    });
    expect(model.contentCount).toBe(2);
  });

  it('groups newest days first while preserving dataset order within each day', () => {
    const dataset = buildPracticeDataset([
      toPracticeSourceEntry(knowledgeSource),
      toPracticeSourceEntry(projectSource),
    ]);
    const model = buildJourneyViewModel(dataset, [knowledgeSource, projectSource]);

    expect(model.days.map((day) => day.date)).toEqual(['2026-07-26', '2026-07-25', '2026-07-24']);
    expect(
      model.days.find((day) => day.date === '2026-07-25')?.events.map((event) => event.kind),
    ).toEqual(
      dataset.events.filter((event) => event.date === '2026-07-25').map((event) => event.kind),
    );
    expect(model.totalEvents).toBe(dataset.events.length);
    expect(model.activeDays).toBe(3);
    expect(model.hasEvents).toBe(true);
  });

  it('preserves explicit notes and milestone kinds', () => {
    const model = buildJourneyViewModel(
      buildPracticeDataset([toPracticeSourceEntry(knowledgeSource)]),
      [knowledgeSource],
    );
    const events = model.days.flatMap((day) => day.events);

    expect(events.find((event) => event.kind === 'reflect')).toMatchObject({
      origin: 'practiceLog',
      note: 'Recorded reflection.',
    });
    expect(events.find((event) => event.kind === 'milestone')).toMatchObject({
      origin: 'practiceLog',
      note: 'Recorded milestone.',
    });
  });

  it('projects a source-title fallback only for synthetic publication events', () => {
    const model = buildJourneyViewModel(
      buildPracticeDataset([toPracticeSourceEntry(knowledgeSource)]),
      [knowledgeSource],
    );
    const publishEvent = model.days
      .flatMap((day) => day.events)
      .find((event) => event.origin === 'publishedAt');

    expect(publishEvent).toMatchObject({
      kind: 'publish',
      origin: 'publishedAt',
      publicationFallbackTitle: knowledgeSource.title,
    });
    expect(publishEvent).not.toHaveProperty('note');
  });

  it('is deterministic for equal domain input', () => {
    const dataset = buildPracticeDataset([toPracticeSourceEntry(projectSource)]);

    expect(buildJourneyViewModel(dataset, [projectSource])).toEqual(
      buildJourneyViewModel(dataset, [projectSource]),
    );
  });

  it('fails clearly when an event references missing public content', () => {
    const missingSource: PracticeSourceEntry = {
      contentId: 'journey-missing-0001',
      type: 'note',
      stage: 'know-think',
      publishedAt: '2026-07-24',
      practiceLog: [],
    };

    expect(() => buildJourneyViewModel(buildPracticeDataset([missingSource]), [])).toThrow(
      'Journey 事件无法找到公开来源内容：journey-missing-0001',
    );
  });

  it('fails clearly when an event and source disagree on content type', () => {
    const invalidSource: PracticeSourceEntry = {
      ...toPracticeSourceEntry(knowledgeSource),
      type: 'project',
    };

    expect(() =>
      buildJourneyViewModel(buildPracticeDataset([invalidSource]), [knowledgeSource]),
    ).toThrow('Journey 事件来源类型不一致：journey-note-0001');
  });
});
