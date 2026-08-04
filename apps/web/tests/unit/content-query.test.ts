import { describe, expect, it } from 'vitest';

import { selectKnowledgeSectionEntries, selectRecentKnowledge } from '../../src/lib/content/query';
import { contentSchema } from '../../src/lib/content/schema';
import { createContentFixture } from '../fixtures/content';

describe('knowledge projections', () => {
  const unclassified = contentSchema.parse({
    ...createContentFixture('journal'),
    contentId: 'fixture-journal-unclassified',
    slug: 'unclassified-journal',
    title: 'Agent 应用开发也不能触发推断',
    tags: ['practice-cases'],
  });
  const classified = contentSchema.parse({
    ...createContentFixture('note'),
    contentId: 'fixture-note-classified',
    slug: 'classified-note',
    knowledgeSections: ['agent-app-development', 'practice-cases'],
  });
  const project = contentSchema.parse(createContentFixture('project'));
  const entries = [unclassified, classified, project];

  it('includes every non-project entry in recent knowledge without requiring classification', () => {
    expect(selectRecentKnowledge(entries).map((entry) => entry.contentId)).toEqual([
      unclassified.contentId,
      classified.contentId,
    ]);
  });

  it('projects one entry into every explicitly selected section', () => {
    expect(
      selectKnowledgeSectionEntries(entries, 'agent-app-development').map(
        (entry) => entry.contentId,
      ),
    ).toEqual([classified.contentId]);
    expect(
      selectKnowledgeSectionEntries(entries, 'practice-cases').map((entry) => entry.contentId),
    ).toEqual([classified.contentId]);
  });

  it('does not infer membership from title, tags, legacy type, or project content', () => {
    expect(selectKnowledgeSectionEntries(entries, 'knowledge-frontier')).toEqual([]);
    expect(selectKnowledgeSectionEntries(entries, 'practice-cases')).not.toContain(unclassified);
    expect(selectKnowledgeSectionEntries(entries, 'practice-cases')).not.toContain(project);
  });
});
