import { describe, expect, it } from 'vitest';

import type { PracticeSourceEntry } from '../../src/lib/practice';
import {
  buildHeatmapCalendar,
  buildPracticeDataset,
  normalizePracticeEvents,
} from '../../src/lib/practice';

const baseEntry: PracticeSourceEntry = {
  contentId: 'praxis-project-0001',
  type: 'project',
  stage: 'think-act',
  publishedAt: '2026-07-20',
  practiceLog: [],
};

describe('practice event normalization', () => {
  it('creates exactly one synthetic publish event', () => {
    const events = normalizePracticeEvents([baseEntry]);

    expect(events).toEqual([
      expect.objectContaining({
        date: '2026-07-20',
        kind: 'publish',
        source: 'publishedAt',
      }),
    ]);
  });

  it('uses an explicit initial publish without double counting', () => {
    const events = normalizePracticeEvents([
      {
        ...baseEntry,
        practiceLog: [
          {
            date: '2026-07-20',
            kind: 'publish',
            note: 'Published with a meaningful note.',
          },
        ],
      },
    ]);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      source: 'practiceLog',
      note: 'Published with a meaningful note.',
    });
  });

  it('counts multiple meaningful events on one day by kind', () => {
    const dataset = buildPracticeDataset([
      {
        ...baseEntry,
        practiceLog: [
          { date: '2026-07-22', kind: 'learn' },
          { date: '2026-07-22', kind: 'practice' },
          { date: '2026-07-22', kind: 'milestone' },
        ],
      },
    ]);

    const day = dataset.days.find((item) => item.date === '2026-07-22');
    expect(day?.count).toBe(3);
    expect(day?.kinds).toMatchObject({ learn: 1, practice: 1, milestone: 1 });
  });

  it('does not accept updatedAt as an event input', () => {
    const withUpdatedAt = { ...baseEntry, updatedAt: '2026-07-24' };
    const dataset = buildPracticeDataset([withUpdatedAt]);

    expect(dataset.totalEvents).toBe(1);
    expect(dataset.events.every((event) => event.date !== withUpdatedAt.updatedAt)).toBe(true);
  });

  it('builds a fixed 53-week calendar ending around the requested date', () => {
    const dataset = buildPracticeDataset([baseEntry]);
    const cells = buildHeatmapCalendar(dataset, '2026-07-24');

    expect(cells).toHaveLength(371);
    expect(cells.find((cell) => cell.date === '2026-07-20')?.count).toBe(1);
    expect(cells.filter((cell) => !cell.inRange).length).toBeGreaterThan(0);
  });
});
