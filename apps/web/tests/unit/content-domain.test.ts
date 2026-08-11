import { describe, expect, it } from 'vitest';

import {
  contentTypes,
  assertKnowledgeSlugAvailability,
  getContentPath,
  getContentTypeFromPath,
  getContentUrl,
  getKnowledgeNavigationUrl,
  getKnowledgeUrl,
  getPublicContentUrl,
  knowledgeSections,
  legacyCompatibilityMappings,
  isPublicStatus,
  resolveKnowledgeQueryPath,
} from '../../src/lib/content/domain';

describe('knowledge section registry', () => {
  it('keeps the approved names and slugs in one stable order', () => {
    expect(
      knowledgeSections.map(({ alias, key, label, slug }) => ({ alias, key, label, slug })),
    ).toEqual([
      {
        alias: 'agents',
        key: 'agent-app-development',
        label: 'Agent 应用开发',
        slug: 'agent-app-development',
      },
      {
        alias: 'llm',
        key: 'llm-principles',
        label: '大模型原理与实现',
        slug: 'llm-principles',
      },
      {
        alias: 'model-engineering',
        key: 'fine-tuning-inference-deployment',
        label: '微调、推理与部署',
        slug: 'fine-tuning-inference-deployment',
      },
      {
        alias: 'practice',
        key: 'practice-cases',
        label: '实践与案例',
        slug: 'practice-cases',
      },
      {
        alias: 'frontier',
        key: 'knowledge-frontier',
        label: '知识前沿',
        slug: 'knowledge-frontier',
      },
    ]);
  });

  it('provides complete and uniquely numbered documentation metadata', () => {
    expect(knowledgeSections.map((section) => section.number)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
    ]);
    expect(new Set(knowledgeSections.map((section) => section.number)).size).toBe(
      knowledgeSections.length,
    );

    for (const section of knowledgeSections) {
      expect(section.introduction.trim().length).toBeGreaterThan(0);
      expect(section.topics.length).toBeGreaterThan(0);
      expect(section.topics.every((topic) => topic.trim().length > 0)).toBe(true);
    }
  });
});

describe('type-first URL contract', () => {
  it.each([
    ['blog', '/blog/example'],
    ['note', '/notes/example'],
    ['journal', '/journal/example'],
    ['project', '/projects/example'],
  ] as const)('maps %s to a stable type-first URL', (type, expected) => {
    expect(getContentUrl(type, 'example')).toBe(expected);
  });

  it('round-trips every content type path', () => {
    for (const type of contentTypes) {
      expect(getContentTypeFromPath(getContentPath(type))).toBe(type);
    }
  });

  it('keeps draft content out of every public projection', () => {
    expect(isPublicStatus('draft')).toBe(false);
    expect(isPublicStatus('ongoing')).toBe(true);
    expect(isPublicStatus('completed')).toBe(true);
    expect(isPublicStatus('reflected')).toBe(true);
  });
});

describe('public URL contract', () => {
  it('keeps query navigation separate from canonical knowledge paths', () => {
    expect(getKnowledgeNavigationUrl()).toBe('/knowledge');
    expect(getKnowledgeNavigationUrl({ section: 'agent-app-development' })).toBe(
      '/knowledge?section=agents',
    );
    expect(
      getKnowledgeNavigationUrl({
        section: 'fine-tuning-inference-deployment',
        item: 'assigned-article',
      }),
    ).toBe('/knowledge?section=model-engineering&item=assigned-article');
    expect(getKnowledgeNavigationUrl({ item: 'unassigned-article' })).toBe(
      '/knowledge?item=unassigned-article',
    );
    expect(() => getKnowledgeNavigationUrl({ item: knowledgeSections[0].slug })).toThrow(
      /无效知识条目/,
    );
    expect(getKnowledgeUrl('unassigned-article')).toBe('/knowledge/unassigned-article');
  });

  it('resolves valid query navigation to the existing static route', () => {
    expect(resolveKnowledgeQueryPath(new URLSearchParams())).toBe('/knowledge');
    expect(resolveKnowledgeQueryPath(new URLSearchParams('section=agents'))).toBe(
      '/knowledge/agent-app-development',
    );
    expect(resolveKnowledgeQueryPath(new URLSearchParams('item=unassigned-article'))).toBe(
      '/knowledge/unassigned-article',
    );
    expect(
      resolveKnowledgeQueryPath(new URLSearchParams('section=practice&item=assigned-article')),
    ).toBe('/knowledge/assigned-article');
  });

  it.each([
    'section=unknown',
    'section=',
    'item=',
    'item=../unsafe',
    'item=UPPERCASE',
    'item=agent-app-development',
    'section=agents&section=llm',
    'item=first&item=second',
    'view=compact',
  ])('rejects invalid query navigation: %s', (search) => {
    expect(resolveKnowledgeQueryPath(new URLSearchParams(search))).toBeUndefined();
  });

  it('uses one knowledge canonical for every non-project content type', () => {
    for (const type of ['blog', 'note', 'journal'] as const) {
      expect(getPublicContentUrl({ contentId: `fixture-${type}`, type, slug: 'shared-slug' })).toBe(
        '/knowledge/shared-slug',
      );
    }
  });

  it('keeps the current project detail and anchors future projects on the single page', () => {
    expect(
      getPublicContentUrl({
        contentId: 'praxis-project-0001',
        type: 'project',
        slug: 'praxis-foundation',
      }),
    ).toBe('/projects/praxis-foundation');
    expect(
      getPublicContentUrl({
        contentId: 'fixture-project-0002',
        type: 'project',
        slug: 'future-project',
      }),
    ).toBe('/projects#future-project');
  });

  it('owns exactly the five approved compatibility mappings', () => {
    expect(legacyCompatibilityMappings).toEqual([
      { from: '/blog', to: '/knowledge' },
      { from: '/notes', to: '/knowledge' },
      { from: '/journal', to: '/knowledge' },
      {
        from: '/notes/ai-code-security-review',
        to: '/knowledge/ai-code-security-review',
      },
      {
        from: '/journal/what-green-gates-miss',
        to: '/knowledge/what-green-gates-miss',
      },
    ]);
  });

  it('rejects section/content and content/content slug conflicts', () => {
    expect(() =>
      assertKnowledgeSlugAvailability([
        { contentId: 'fixture-note', type: 'note', slug: 'practice-cases' },
      ]),
    ).toThrow(/固定入口/);

    expect(() =>
      assertKnowledgeSlugAvailability([
        { contentId: 'fixture-note', type: 'note', slug: 'shared-slug' },
        { contentId: 'fixture-journal', type: 'journal', slug: 'shared-slug' },
      ]),
    ).toThrow(/slug.*重复/);
  });

  it('does not reserve project slugs in the knowledge namespace', () => {
    expect(() =>
      assertKnowledgeSlugAvailability([
        { contentId: 'fixture-project', type: 'project', slug: 'practice-cases' },
      ]),
    ).not.toThrow();
  });
});
