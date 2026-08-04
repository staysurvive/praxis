import type { KnowledgeSectionKey } from './domain';
import type { ContentFrontmatter } from './schema';

type KnowledgeProjectionEntry = Pick<ContentFrontmatter, 'knowledgeSections' | 'type'>;

export function selectKnowledgeSectionEntries<T extends KnowledgeProjectionEntry>(
  entries: readonly T[],
  section: KnowledgeSectionKey,
): T[] {
  return entries.filter(
    (entry) => entry.type !== 'project' && entry.knowledgeSections?.includes(section),
  );
}

export function selectRecentKnowledge<T extends KnowledgeProjectionEntry>(
  entries: readonly T[],
): T[] {
  return entries.filter((entry) => entry.type !== 'project');
}
