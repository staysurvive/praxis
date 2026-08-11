import type { ContentSummary } from '../../lib/content';
import type { ContentType, PracticeKind } from '../../lib/content/domain';
import type { PracticeDataset } from '../../lib/practice';

export type JourneyDestination = 'knowledge' | 'project';

export interface JourneySourceViewModel {
  contentId: string;
  title: string;
  type: ContentType;
  url: string;
  destination: JourneyDestination;
}

export interface JourneyEventViewModel {
  kind: PracticeKind;
  origin: 'publishedAt' | 'practiceLog';
  note?: string;
  publicationFallbackTitle?: string;
  source: JourneySourceViewModel;
}

export interface JourneyDayViewModel {
  date: string;
  events: readonly JourneyEventViewModel[];
}

export interface JourneyViewModel {
  totalEvents: number;
  activeDays: number;
  contentCount: number;
  hasEvents: boolean;
  days: readonly JourneyDayViewModel[];
}

function getDestination(type: ContentType): JourneyDestination {
  return type === 'project' ? 'project' : 'knowledge';
}

export function buildJourneyViewModel(
  dataset: PracticeDataset,
  entries: readonly ContentSummary[],
): JourneyViewModel {
  const contentById = new Map(entries.map((entry) => [entry.contentId, entry]));
  const eventsByDate = new Map<string, JourneyEventViewModel[]>();
  const referencedContentIds = new Set<string>();

  for (const event of dataset.events) {
    const entry = contentById.get(event.contentId);

    if (!entry) {
      throw new Error(`Journey 事件无法找到公开来源内容：${event.contentId}`);
    }

    if (entry.type !== event.type) {
      throw new Error(
        `Journey 事件来源类型不一致：${event.contentId}（事件 ${event.type}，内容 ${entry.type}）`,
      );
    }

    const projectedEvent: JourneyEventViewModel = {
      kind: event.kind,
      origin: event.source,
      ...(event.note ? { note: event.note } : {}),
      ...(event.source === 'publishedAt' && !event.note
        ? { publicationFallbackTitle: entry.title }
        : {}),
      source: {
        contentId: entry.contentId,
        title: entry.title,
        type: entry.type,
        url: entry.url,
        destination: getDestination(entry.type),
      },
    };
    const dayEvents = eventsByDate.get(event.date) ?? [];

    dayEvents.push(projectedEvent);
    eventsByDate.set(event.date, dayEvents);
    referencedContentIds.add(event.contentId);
  }

  const days = [...eventsByDate.entries()]
    .sort(([leftDate], [rightDate]) => rightDate.localeCompare(leftDate))
    .map<JourneyDayViewModel>(([date, events]) => ({ date, events }));

  return {
    totalEvents: dataset.events.length,
    activeDays: days.length,
    contentCount: referencedContentIds.size,
    hasEvents: dataset.events.length > 0,
    days,
  };
}
