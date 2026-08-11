import { uiCopy } from '../../config/copy';
import { buildHeatmapCalendar, buildHeatmapMonths } from '../../lib/practice';
import type { HeatmapCell, NormalizedPracticeEvent, PracticeDataset } from '../../lib/practice';

export interface PracticeHeatmapViewModel {
  cells: readonly HeatmapCell[];
  weekLabels: readonly (string | undefined)[];
  totalEvents: number;
  activeDays: number;
  contentCount: number;
  recentEvents: readonly NormalizedPracticeEvent[];
  summary: string;
}

function formatMonthLabel(month: number): string {
  return new Intl.DateTimeFormat(uiCopy.locale, {
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2000, month - 1, 1)));
}

export function buildPracticeHeatmapViewModel(
  dataset: PracticeDataset,
  endDateKey: string,
): PracticeHeatmapViewModel {
  const cells = buildHeatmapCalendar(dataset, endDateKey);
  const monthLabels = new Map(
    buildHeatmapMonths(cells)
      .slice(1)
      .map((month) => [month.weekIndex, formatMonthLabel(month.month)]),
  );
  const weekLabels = Array.from({ length: cells.length / 7 }, (_, weekIndex) =>
    monthLabels.get(weekIndex),
  );
  const firstDate = cells.at(0)?.date;
  const visibleEvents = dataset.events.filter(
    (event) => (!firstDate || event.date >= firstDate) && event.date <= endDateKey,
  );
  const activeDays = new Set(visibleEvents.map((event) => event.date)).size;

  return {
    cells,
    weekLabels,
    totalEvents: visibleEvents.length,
    activeDays,
    contentCount: new Set(visibleEvents.map((event) => event.contentId)).size,
    recentEvents: [...visibleEvents].reverse().slice(0, 8),
    summary: uiCopy.heatmap.summary(visibleEvents.length, activeDays),
  };
}
