import type { KnowledgeSectionKey } from '../../lib/content/domain';

export interface KnowledgeTocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface KnowledgeSidebarSection {
  key: KnowledgeSectionKey;
  href: string;
  number: string;
  label: string;
  description: string;
  topics: readonly string[];
  count: number;
  isCurrent: boolean;
}

export interface KnowledgeSidebarEntry {
  key: string;
  href: string;
  title: string;
  summary: string;
  tags: readonly string[];
  typeLabel: string;
  updatedAt: string;
  isCurrent: boolean;
}
