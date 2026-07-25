import type { ContentType, PracticeKind, Stage } from './content/domain';
import type { ContentFrontmatter, PracticeLogEntry } from './content/schema';

export interface PracticeSourceEntry {
  contentId: string;
  type: ContentType;
  stage: Stage;
  publishedAt: string;
  practiceLog: PracticeLogEntry[];
}

export interface NormalizedPracticeEvent {
  contentId: string;
  type: ContentType;
  stage: Stage;
  date: string;
  kind: PracticeKind;
  note?: string;
  source: 'publishedAt' | 'practiceLog';
}

export type PracticeKindCounts = Record<PracticeKind, number>;

export interface PracticeDay {
  date: string;
  count: number;
  kinds: PracticeKindCounts;
  events: NormalizedPracticeEvent[];
}

export interface PracticeDataset {
  version: 1;
  totalEvents: number;
  activeDays: number;
  contentCount: number;
  events: NormalizedPracticeEvent[];
  days: PracticeDay[];
}

export interface HeatmapCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  inRange: boolean;
}

function compareEvents(left: NormalizedPracticeEvent, right: NormalizedPracticeEvent): number {
  return (
    left.date.localeCompare(right.date) ||
    left.contentId.localeCompare(right.contentId) ||
    left.kind.localeCompare(right.kind) ||
    (left.note ?? '').localeCompare(right.note ?? '')
  );
}

function createKindCounts(): PracticeKindCounts {
  return {
    publish: 0,
    learn: 0,
    practice: 0,
    reflect: 0,
    milestone: 0,
  } satisfies PracticeKindCounts;
}

export function normalizePracticeEvents(
  entries: readonly PracticeSourceEntry[],
): NormalizedPracticeEvent[] {
  const events = entries.flatMap<NormalizedPracticeEvent>((entry) => {
    const hasExplicitInitialPublish = entry.practiceLog.some(
      (event) => event.kind === 'publish' && event.date === entry.publishedAt,
    );

    const normalized = entry.practiceLog.map<NormalizedPracticeEvent>((event) => ({
      contentId: entry.contentId,
      type: entry.type,
      stage: entry.stage,
      date: event.date,
      kind: event.kind,
      ...(event.note ? { note: event.note } : {}),
      source: 'practiceLog',
    }));

    if (!hasExplicitInitialPublish) {
      normalized.push({
        contentId: entry.contentId,
        type: entry.type,
        stage: entry.stage,
        date: entry.publishedAt,
        kind: 'publish',
        source: 'publishedAt',
      });
    }

    return normalized;
  });

  return events.sort(compareEvents);
}

export function buildPracticeDataset(entries: readonly PracticeSourceEntry[]): PracticeDataset {
  const events = normalizePracticeEvents(entries);
  const byDate = new Map<string, NormalizedPracticeEvent[]>();

  for (const event of events) {
    const dayEvents = byDate.get(event.date) ?? [];
    dayEvents.push(event);
    byDate.set(event.date, dayEvents);
  }

  const days = [...byDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map<PracticeDay>(([date, dayEvents]) => {
      const kinds = createKindCounts();
      for (const event of dayEvents) {
        kinds[event.kind] += 1;
      }

      return {
        date,
        count: dayEvents.length,
        kinds,
        events: dayEvents,
      };
    });

  return {
    version: 1,
    totalEvents: events.length,
    activeDays: days.length,
    contentCount: new Set(entries.map((entry) => entry.contentId)).size,
    events,
    days,
  };
}

function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function levelForCount(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

export function buildHeatmapCalendar(
  dataset: PracticeDataset,
  endDateKey: string,
  weeks = 53,
): HeatmapCell[] {
  const endDate = parseDateKey(endDateKey);
  const endOfWeek = addUtcDays(endDate, 6 - endDate.getUTCDay());
  const startDate = addUtcDays(endOfWeek, -(weeks * 7 - 1));
  const counts = new Map(dataset.days.map((day) => [day.date, day.count]));

  return Array.from({ length: weeks * 7 }, (_, index) => {
    const date = addUtcDays(startDate, index);
    const dateKey = formatDateKey(date);
    const count = counts.get(dateKey) ?? 0;

    return {
      date: dateKey,
      count,
      level: levelForCount(count),
      inRange: date <= endDate,
    };
  });
}

export function toPracticeSourceEntry(data: ContentFrontmatter): PracticeSourceEntry {
  return {
    contentId: data.contentId,
    type: data.type,
    stage: data.stage,
    publishedAt: data.publishedAt,
    practiceLog: data.practiceLog,
  };
}
