import { describe, expect, it } from 'vitest';

import { uiCopy } from '../../src/config/copy';
import {
  projectKnowledgeArticleModel,
  projectKnowledgeArticleToc,
  projectKnowledgeIndexModel,
} from '../../src/features/knowledge/model';
import type { ContentSummary } from '../../src/lib/content';
import {
  getKnowledgeNavigationUrl,
  getKnowledgeUrl,
  getPublicContentUrl,
  knowledgeSections,
} from '../../src/lib/content/domain';
import type { ContentType } from '../../src/lib/content/domain';
import { contentSchema } from '../../src/lib/content/schema';
import type { ContentFrontmatter } from '../../src/lib/content/schema';
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
    typeLabel: uiCopy.contentTypes[data.type],
    stageLabel: uiCopy.stages[data.stage],
    statusLabel: uiCopy.statuses[data.status],
  };
}

const agentArticle = createSummary('note', {
  contentId: 'fixture-note-agent-0001',
  slug: 'agent-article',
  title: 'Agent article',
  knowledgeSections: ['agent-app-development'],
});
const multiSectionArticle = createSummary('blog', {
  contentId: 'fixture-blog-multi-0001',
  slug: 'multi-section-article',
  title: 'Multi-section article',
  knowledgeSections: ['practice-cases', 'agent-app-development'],
});
const unclassifiedArticle = createSummary('journal', {
  contentId: 'fixture-journal-unclassified-0001',
  slug: 'unclassified-article',
  title: 'Unclassified article',
  knowledgeSections: undefined,
});
const project = createSummary('project', {
  contentId: 'fixture-project-0002',
  slug: 'project-without-detail',
});
const entries = [agentArticle, multiSectionArticle, unclassifiedArticle, project];

describe('knowledge index model', () => {
  it('projects one shared sidebar and recent-entry model from public summaries', () => {
    const model = projectKnowledgeIndexModel(entries);
    const agentSection = model.layout.sidebarSections.find(
      (section) => section.key === 'agent-app-development',
    );

    expect(model.layout.canonicalPath).toBe(getKnowledgeUrl());
    expect(model.layout.navigationPath).toBe(getKnowledgeNavigationUrl());
    expect(model.layout.overviewHref).toBe(getKnowledgeUrl());
    expect(model.layout.overviewIsCurrent).toBe(true);
    expect(agentSection).toMatchObject({ count: 2, isCurrent: false });
    expect(model.view.recentEntries.map((entry) => entry.key)).toEqual([
      agentArticle.contentId,
      multiSectionArticle.contentId,
      unclassifiedArticle.contentId,
    ]);
    expect(model.view.recentEntries[0]?.href).toBe(
      getKnowledgeNavigationUrl({
        section: agentArticle.knowledgeSections?.[0],
        item: agentArticle.slug,
      }),
    );
    expect(model.view.recentEntries.every((entry) => !entry.isCurrent)).toBe(true);
  });

  it('keeps all section counts and recent entries empty without public knowledge', () => {
    const model = projectKnowledgeIndexModel([project]);

    expect(model.view.recentEntries).toEqual([]);
    expect(model.view.sections).toHaveLength(knowledgeSections.length);
    expect(model.view.sections.every((section) => section.count === 0)).toBe(true);
  });
});

describe('knowledge section model', () => {
  it('projects the active section, entries, sidebar, and adjacent navigation', () => {
    const model = projectKnowledgeArticleModel(
      { kind: 'section', sectionKey: 'agent-app-development' },
      entries,
    );

    expect(model.kind).toBe('section');
    if (model.kind !== 'section') return;

    expect(model.view.section.key).toBe('agent-app-development');
    expect(model.view.entries.map((entry) => entry.contentId)).toEqual([
      agentArticle.contentId,
      multiSectionArticle.contentId,
    ]);
    expect(model.view.entries[1]?.navigationHref).toBe(
      getKnowledgeNavigationUrl({
        section: multiSectionArticle.knowledgeSections?.[0],
        item: multiSectionArticle.slug,
      }),
    );
    expect(model.layout.sidebarSections.find((section) => section.isCurrent)?.key).toBe(
      'agent-app-development',
    );
    expect(model.view.previousSection).toBeUndefined();
    expect(model.view.nextSection).toEqual({
      href: getKnowledgeNavigationUrl({ section: 'llm-principles' }),
      label: knowledgeSections[1].label,
    });
    expect(model.view.overviewHref).toBe(getKnowledgeUrl());
  });

  it('preserves an empty final section without inventing entries or next navigation', () => {
    const model = projectKnowledgeArticleModel(
      { kind: 'section', sectionKey: 'knowledge-frontier' },
      entries,
    );

    expect(model.kind).toBe('section');
    if (model.kind !== 'section') return;

    expect(model.view.entries).toEqual([]);
    expect(model.view.previousSection).toEqual({
      href: getKnowledgeNavigationUrl({ section: 'practice-cases' }),
      label: knowledgeSections[3].label,
    });
    expect(model.view.nextSection).toBeUndefined();
  });

  it('rejects a missing section definition with the existing build-time error', () => {
    expect(() => projectKnowledgeArticleModel({ kind: 'section' }, entries)).toThrow(
      '无法为知识入口找到注册表定义：missing-section-key',
    );
  });
});

describe('knowledge article model', () => {
  it('projects metadata, current state, navigation, TOC, and practice events', () => {
    const model = projectKnowledgeArticleModel(
      { kind: 'content', contentId: agentArticle.contentId },
      entries,
    );
    const tocItems = projectKnowledgeArticleToc([
      { depth: 1, slug: 'title', text: 'Title' },
      { depth: 2, slug: 'overview', text: 'Overview' },
      { depth: 3, slug: 'details', text: 'Details' },
      { depth: 4, slug: 'ignored', text: 'Ignored' },
    ]);

    expect(model.kind).toBe('content');
    if (model.kind !== 'content') return;

    expect(model.layout).toMatchObject({
      title: agentArticle.title,
      description: agentArticle.summary,
      canonicalPath: agentArticle.url,
      navigationPath: getKnowledgeNavigationUrl({
        section: 'agent-app-development',
        item: agentArticle.slug,
      }),
      seoType: 'article',
      publishedAt: agentArticle.publishedAt,
      updatedAt: agentArticle.updatedAt,
      tags: agentArticle.tags,
    });
    expect(model.layout.sidebarSections.find((section) => section.isCurrent)?.key).toBe(
      'agent-app-development',
    );
    expect(model.layout.recentEntries.find((entry) => entry.isCurrent)?.key).toBe(
      agentArticle.contentId,
    );
    expect(model.view.backHref).toBe(
      getKnowledgeNavigationUrl({ section: 'agent-app-development' }),
    );
    expect(model.view.practiceEvents).toHaveLength(2);
    expect(tocItems).toEqual([
      { id: 'overview', text: 'Overview', depth: 2 },
      { id: 'details', text: 'Details', depth: 3 },
    ]);
  });

  it('keeps an unclassified article reachable without a fabricated current section', () => {
    const model = projectKnowledgeArticleModel(
      { kind: 'content', contentId: unclassifiedArticle.contentId },
      entries,
    );

    expect(model.kind).toBe('content');
    if (model.kind !== 'content') return;

    expect(model.layout.navigationPath).toBe(
      getKnowledgeNavigationUrl({ item: unclassifiedArticle.slug }),
    );
    expect(model.layout.sidebarSections.every((section) => !section.isCurrent)).toBe(true);
    expect(model.view.backHref).toBe(getKnowledgeUrl());
    expect(model.view.backLabel).toBe(uiCopy.knowledge.detailBackLabel);
    expect(projectKnowledgeArticleToc([])).toEqual([]);
  });

  it('rejects a missing public knowledge article with the existing build-time error', () => {
    expect(() =>
      projectKnowledgeArticleModel({ kind: 'content', contentId: 'missing-content-id' }, entries),
    ).toThrow('无法为知识路由找到公开内容：missing-content-id');
  });
});
