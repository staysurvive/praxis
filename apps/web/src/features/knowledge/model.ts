import { uiCopy } from '../../config/copy';
import type { ContentCollectionEntry, ContentSummary } from '../../lib/content';
import {
  getKnowledgeNavigationUrl,
  getKnowledgeSectionByKey,
  getKnowledgeUrl,
  knowledgeSections,
} from '../../lib/content/domain';
import type { KnowledgeSection, KnowledgeSectionKey } from '../../lib/content/domain';
import { selectKnowledgeSectionEntries, selectRecentKnowledge } from '../../lib/content/query';
import { normalizePracticeEvents, toPracticeSourceEntry } from '../../lib/practice';
import type { NormalizedPracticeEvent } from '../../lib/practice';

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

export type KnowledgeSectionEntry = ContentSummary & {
  navigationHref: string;
};

export interface KnowledgeSectionNavigation {
  href: string;
  label: string;
}

export interface KnowledgeHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface KnowledgeLayoutViewModel {
  title: string;
  description: string;
  canonicalPath: string;
  navigationPath: string;
  seoType: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
  tags: readonly string[];
  overviewHref: string;
  sidebarSections: readonly KnowledgeSidebarSection[];
  recentEntries: readonly KnowledgeSidebarEntry[];
  overviewIsCurrent: boolean;
}

export interface KnowledgeIndexModel {
  layout: KnowledgeLayoutViewModel;
  tocItems: readonly KnowledgeTocItem[];
  view: {
    sections: readonly KnowledgeSidebarSection[];
    recentEntries: readonly KnowledgeSidebarEntry[];
  };
}

export interface KnowledgeArticleModelRequest {
  kind: 'section' | 'content';
  sectionKey?: KnowledgeSectionKey;
  contentId?: string;
}

export interface KnowledgeSectionPageModel {
  kind: 'section';
  layout: KnowledgeLayoutViewModel;
  tocItems: readonly KnowledgeTocItem[];
  view: {
    section: KnowledgeSection;
    entries: readonly KnowledgeSectionEntry[];
    previousSection?: KnowledgeSectionNavigation;
    nextSection?: KnowledgeSectionNavigation;
    overviewHref: string;
  };
}

export interface KnowledgeContentPageModel {
  kind: 'content';
  layout: KnowledgeLayoutViewModel;
  view: {
    summary: ContentSummary;
    practiceEvents: readonly NormalizedPracticeEvent[];
    backHref: string;
    backLabel: string;
  };
}

export type KnowledgeArticleProjection = KnowledgeSectionPageModel | KnowledgeContentPageModel;
export type KnowledgeArticleModel =
  KnowledgeSectionPageModel | (KnowledgeContentPageModel & { entry: ContentCollectionEntry });

const overviewTocItems = [
  { id: 'workspace-start', text: uiCopy.knowledge.startReadingTitle, depth: 2 },
  { id: 'workspace-chapters', text: uiCopy.knowledge.browseChaptersTitle, depth: 2 },
  { id: 'workspace-recent', text: uiCopy.knowledge.recentTitle, depth: 2 },
] satisfies readonly KnowledgeTocItem[];

const sectionTocItems = [
  { id: 'section-positioning', text: uiCopy.knowledge.positioningTitle, depth: 2 },
  { id: 'section-topics', text: uiCopy.knowledge.topicsTitle, depth: 2 },
  { id: 'section-entries', text: uiCopy.knowledge.entriesTitle, depth: 2 },
  { id: 'section-navigation', text: uiCopy.knowledge.continueTitle, depth: 2 },
] satisfies readonly KnowledgeTocItem[];

function buildSidebarSections(
  entries: readonly ContentSummary[],
  activeSectionKey?: KnowledgeSectionKey,
): KnowledgeSidebarSection[] {
  return knowledgeSections.map((section) => ({
    key: section.key,
    href: getKnowledgeNavigationUrl({ section: section.key }),
    number: section.number,
    label: section.label,
    description: section.description,
    topics: section.topics,
    count: selectKnowledgeSectionEntries(entries, section.key).length,
    isCurrent: activeSectionKey === section.key,
  }));
}

function buildSidebarEntries(
  entries: readonly ContentSummary[],
  currentContentId?: string,
): KnowledgeSidebarEntry[] {
  return entries.map((entry) => ({
    key: entry.contentId,
    href: getKnowledgeNavigationUrl({
      section: entry.knowledgeSections?.[0],
      item: entry.slug,
    }),
    title: entry.title,
    summary: entry.summary,
    tags: entry.tags,
    typeLabel: entry.typeLabel,
    updatedAt: entry.updatedAt,
    isCurrent: entry.contentId === currentContentId,
  }));
}

function buildSectionNavigation(
  section: KnowledgeSection | undefined,
): KnowledgeSectionNavigation | undefined {
  return section
    ? {
        href: getKnowledgeNavigationUrl({ section: section.key }),
        label: section.label,
      }
    : undefined;
}

export function projectKnowledgeIndexModel(
  entries: readonly ContentSummary[],
): KnowledgeIndexModel {
  const recentEntries = selectRecentKnowledge(entries);
  const sidebarSections = buildSidebarSections(recentEntries);
  const sidebarEntries = buildSidebarEntries(recentEntries);
  const overviewHref = getKnowledgeUrl();

  return {
    layout: {
      title: uiCopy.knowledge.title,
      description: uiCopy.knowledge.description,
      canonicalPath: overviewHref,
      navigationPath: getKnowledgeNavigationUrl(),
      seoType: 'website',
      tags: [],
      overviewHref,
      sidebarSections,
      recentEntries: sidebarEntries,
      overviewIsCurrent: true,
    },
    tocItems: overviewTocItems,
    view: {
      sections: sidebarSections,
      recentEntries: sidebarEntries,
    },
  };
}

export async function getKnowledgeIndexModel(): Promise<KnowledgeIndexModel> {
  const { listEntries } = await import('../../lib/content');
  return projectKnowledgeIndexModel(await listEntries());
}

export function projectKnowledgeArticleToc(
  headings: readonly KnowledgeHeading[],
): KnowledgeTocItem[] {
  return headings.flatMap((heading): KnowledgeTocItem[] => {
    if (heading.depth !== 2 && heading.depth !== 3) {
      return [];
    }

    return [{ id: heading.slug, text: heading.text, depth: heading.depth }];
  });
}

export function projectKnowledgeArticleModel(
  request: KnowledgeArticleModelRequest,
  entries: readonly ContentSummary[],
): KnowledgeArticleProjection {
  const recentEntries = selectRecentKnowledge(entries);
  const overviewHref = getKnowledgeUrl();

  if (request.kind === 'section') {
    const section = request.sectionKey ? getKnowledgeSectionByKey(request.sectionKey) : undefined;

    if (!section) {
      throw new Error(
        `无法为知识入口找到注册表定义：${request.sectionKey ?? 'missing-section-key'}`,
      );
    }

    const sectionIndex = knowledgeSections.findIndex((candidate) => candidate.key === section.key);
    const previousSection = sectionIndex > 0 ? knowledgeSections[sectionIndex - 1] : undefined;
    const nextSection =
      sectionIndex >= 0 && sectionIndex < knowledgeSections.length - 1
        ? knowledgeSections[sectionIndex + 1]
        : undefined;
    const sidebarSections = buildSidebarSections(recentEntries, section.key);
    const sidebarEntries = buildSidebarEntries(recentEntries);

    return {
      kind: 'section',
      layout: {
        title: section.label,
        description: section.description,
        canonicalPath: getKnowledgeUrl(section.slug),
        navigationPath: getKnowledgeNavigationUrl({ section: section.key }),
        seoType: 'website',
        tags: [],
        overviewHref,
        sidebarSections,
        recentEntries: sidebarEntries,
        overviewIsCurrent: false,
      },
      tocItems: sectionTocItems,
      view: {
        section,
        entries: selectKnowledgeSectionEntries(recentEntries, section.key).map((entry) => ({
          ...entry,
          navigationHref: getKnowledgeNavigationUrl({
            section: entry.knowledgeSections?.[0],
            item: entry.slug,
          }),
        })),
        previousSection: buildSectionNavigation(previousSection),
        nextSection: buildSectionNavigation(nextSection),
        overviewHref,
      },
    };
  }

  const summary = request.contentId
    ? recentEntries.find((entry) => entry.contentId === request.contentId)
    : undefined;

  if (!summary) {
    throw new Error(`无法为知识路由找到公开内容：${request.contentId ?? 'missing-content-id'}`);
  }

  const articleSectionKey = summary.knowledgeSections?.[0];
  const articleSection = articleSectionKey
    ? getKnowledgeSectionByKey(articleSectionKey)
    : undefined;
  const sidebarSections = buildSidebarSections(recentEntries, articleSection?.key);
  const sidebarEntries = buildSidebarEntries(recentEntries, summary.contentId);

  return {
    kind: 'content',
    layout: {
      title: summary.title,
      description: summary.summary,
      canonicalPath: summary.url,
      navigationPath: getKnowledgeNavigationUrl({
        section: articleSectionKey,
        item: summary.slug,
      }),
      seoType: 'article',
      publishedAt: summary.publishedAt,
      updatedAt: summary.updatedAt,
      tags: summary.tags,
      overviewHref,
      sidebarSections,
      recentEntries: sidebarEntries,
      overviewIsCurrent: false,
    },
    view: {
      summary,
      practiceEvents: normalizePracticeEvents([toPracticeSourceEntry(summary)]),
      backHref: articleSection
        ? getKnowledgeNavigationUrl({ section: articleSection.key })
        : overviewHref,
      backLabel: articleSection?.label ?? uiCopy.knowledge.detailBackLabel,
    },
  };
}

export async function getKnowledgeArticleModel(
  request: KnowledgeArticleModelRequest,
): Promise<KnowledgeArticleModel> {
  const { getContentEntries, toContentSummary } = await import('../../lib/content');
  const publicEntries = await getContentEntries();
  const projection = projectKnowledgeArticleModel(request, publicEntries.map(toContentSummary));

  if (projection.kind === 'section') {
    return projection;
  }

  const entry = publicEntries.find(
    (candidate) => candidate.data.contentId === projection.view.summary.contentId,
  );
  if (!entry) {
    throw new Error(`无法为知识路由找到公开内容：${request.contentId ?? 'missing-content-id'}`);
  }

  return { ...projection, entry };
}
