import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import { uiCopy } from '../../config/copy';
import { getContentUrl, isPublicStatus } from './domain';
import type { ContentType, Stage, Status } from './domain';
import type { ContentFrontmatter } from './schema';

export type ContentCollectionEntry = CollectionEntry<'content'>;

export interface ContentFilter {
  type?: ContentType;
  stage?: Stage;
  status?: Status;
  tag?: string;
  includeDrafts?: boolean;
}

export interface ContentSummary extends ContentFrontmatter {
  id: string;
  url: string;
  typeLabel: string;
  stageLabel: string;
  statusLabel: string;
}

function matchesFilter(entry: ContentCollectionEntry, filter: ContentFilter): boolean {
  const { data } = entry;

  return (
    (filter.includeDrafts || isPublicStatus(data.status)) &&
    (!filter.type || data.type === filter.type) &&
    (!filter.stage || data.stage === filter.stage) &&
    (!filter.status || data.status === filter.status) &&
    (!filter.tag || data.tags.includes(filter.tag))
  );
}

function compareEntries(left: ContentCollectionEntry, right: ContentCollectionEntry): number {
  return (
    right.data.updatedAt.localeCompare(left.data.updatedAt) ||
    right.data.publishedAt.localeCompare(left.data.publishedAt) ||
    left.data.title.localeCompare(right.data.title, 'zh-CN')
  );
}

export function toContentSummary(entry: ContentCollectionEntry): ContentSummary {
  return {
    id: entry.id,
    ...entry.data,
    url: getContentUrl(entry.data.type, entry.data.slug),
    typeLabel: uiCopy.contentTypes[entry.data.type],
    stageLabel: uiCopy.stages[entry.data.stage],
    statusLabel: uiCopy.statuses[entry.data.status],
  };
}

export async function getContentEntries(
  filter: ContentFilter = {},
): Promise<ContentCollectionEntry[]> {
  const entries = await getCollection('content', (entry) => matchesFilter(entry, filter));
  return entries.sort(compareEntries);
}

export async function listEntries(filter: ContentFilter = {}): Promise<ContentSummary[]> {
  return (await getContentEntries(filter)).map(toContentSummary);
}

export async function getEntryBySlug(
  type: ContentType,
  slug: string,
): Promise<ContentCollectionEntry | undefined> {
  const entries = await getContentEntries({ type });
  return entries.find((entry) => entry.data.slug === slug);
}

export async function getEntryByContentId(
  contentId: string,
): Promise<ContentCollectionEntry | undefined> {
  const entries = await getContentEntries({ includeDrafts: true });
  return entries.find((entry) => entry.data.contentId === contentId);
}

export async function getLatestEntries(limit = 4): Promise<ContentSummary[]> {
  return (await listEntries()).slice(0, limit);
}

export async function renderContentEntry(entry: ContentCollectionEntry) {
  return render(entry);
}
