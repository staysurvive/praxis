import { describe, expect, it } from 'vitest';

import { uiCopy } from '../../src/config/copy';
import { buildPracticeHeatmapViewModel } from '../../src/features/practice/heatmap-model';
import { buildPracticeDataset } from '../../src/lib/practice';
import type { PracticeSourceEntry } from '../../src/lib/practice';

function createEntry(
  contentId: string,
  publishedAt: string,
  practiceLog: PracticeSourceEntry['practiceLog'] = [],
): PracticeSourceEntry {
  return {
    contentId,
    type: 'project',
    stage: 'think-act',
    publishedAt,
    practiceLog,
  };
}

describe('practice heatmap view model', () => {
  it('projects the existing 53-week calendar range and empty cells', () => {
    const model = buildPracticeHeatmapViewModel(
      buildPracticeDataset([createEntry('practice-calendar', '2026-07-20')]),
      '2026-07-24',
    );

    expect(model.cells).toHaveLength(371);
    expect(model.weekLabels).toHaveLength(53);
    expect(model.cells.at(0)?.date).toBe('2025-07-20');
    expect(model.cells.at(-1)).toMatchObject({ date: '2026-07-25', inRange: false });
    expect(
      model.cells.slice(0, 7).map((cell) => new Date(`${cell.date}T00:00:00Z`).getUTCDay()),
    ).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(model.cells.filter((cell) => cell.inRange).at(-1)?.date).toBe('2026-07-24');
    expect(model.cells.find((cell) => cell.date === '2026-07-20')?.count).toBe(1);
    expect(model.cells.find((cell) => cell.date === '2026-07-21')).toMatchObject({
      count: 0,
      level: 0,
      inRange: true,
    });
  });

  it('clips statistics to the visible window without changing count semantics', () => {
    const dataset = buildPracticeDataset([
      createEntry('practice-visible-a', '2025-07-19', [
        { date: '2025-07-20', kind: 'practice' },
        { date: '2026-07-25', kind: 'milestone' },
      ]),
      createEntry('practice-visible-b', '2026-01-01', [{ date: '2026-01-01', kind: 'learn' }]),
    ]);
    const model = buildPracticeHeatmapViewModel(dataset, '2026-07-24');

    expect(model.totalEvents).toBe(3);
    expect(model.activeDays).toBe(2);
    expect(model.contentCount).toBe(2);
    expect(model.recentEvents.map((event) => event.date)).toEqual([
      '2026-01-01',
      '2026-01-01',
      '2025-07-20',
    ]);
    expect(model.summary).toBe(uiCopy.heatmap.summary(3, 2));
  });

  it('keeps the most recent eight events in reverse source order', () => {
    const practiceLog = Array.from({ length: 9 }, (_, index) => ({
      date: `2026-07-${String(index + 2).padStart(2, '0')}`,
      kind: 'practice' as const,
    }));
    const model = buildPracticeHeatmapViewModel(
      buildPracticeDataset([createEntry('practice-recent', '2026-07-01', practiceLog)]),
      '2026-07-24',
    );

    expect(model.totalEvents).toBe(10);
    expect(model.recentEvents).toHaveLength(8);
    expect(model.recentEvents.map((event) => event.date)).toEqual([
      '2026-07-10',
      '2026-07-09',
      '2026-07-08',
      '2026-07-07',
      '2026-07-06',
      '2026-07-05',
      '2026-07-04',
      '2026-07-03',
    ]);
  });

  it('owns all twelve localized month labels at the presentation boundary', () => {
    const model = buildPracticeHeatmapViewModel(buildPracticeDataset([]), '2026-07-24');
    const labels = model.weekLabels.filter((label): label is string => Boolean(label));

    expect(labels).toEqual([
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
    ]);
  });

  it('is deterministic for equal domain input and end dates', () => {
    const dataset = buildPracticeDataset([
      createEntry('practice-deterministic', '2026-07-20', [
        { date: '2026-07-22', kind: 'reflect', note: 'Stable input' },
      ]),
    ]);

    expect(buildPracticeHeatmapViewModel(dataset, '2026-07-24')).toEqual(
      buildPracticeHeatmapViewModel(dataset, '2026-07-24'),
    );
  });
});
