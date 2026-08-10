import { describe, expect, it } from 'vitest';

import {
  contentTypes,
  assertKnowledgeSlugAvailability,
  getContentPath,
  getContentTypeFromPath,
  getContentUrl,
  getKnowledgeContextUrl,
  getKnowledgeUrl,
  getPublicContentUrl,
  knowledgeSections,
  legacyCompatibilityMappings,
  isPublicStatus,
} from '../../src/lib/content/domain';

describe('knowledge section registry', () => {
  it('keeps the approved names and slugs in one stable order', () => {
    expect(knowledgeSections.map(({ key, label, slug }) => ({ key, label, slug }))).toEqual([
      {
        key: 'agent-app-development',
        label: 'Agent 应用开发',
        slug: 'agent-app-development',
      },
      { key: 'llm-principles', label: '大模型原理与实现', slug: 'llm-principles' },
      {
        key: 'fine-tuning-inference-deployment',
        label: '微调、推理与部署',
        slug: 'fine-tuning-inference-deployment',
      },
      { key: 'practice-cases', label: '实践与案例', slug: 'practice-cases' },
      { key: 'knowledge-frontier', label: '知识前沿', slug: 'knowledge-frontier' },
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
  it('adds navigation-only section context without changing the canonical path', () => {
    expect(
      getKnowledgeContextUrl(getKnowledgeUrl('agent-app-development'), 'agent-app-development'),
    ).toBe('/knowledge/agent-app-development?section=agent-app-development');
    expect(
      getKnowledgeContextUrl('/knowledge?view=compact#workspace-start', 'practice-cases'),
    ).toBe('/knowledge?view=compact&section=practice-cases#workspace-start');
    expect(getKnowledgeContextUrl('/knowledge/article')).toBe('/knowledge/article');
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
