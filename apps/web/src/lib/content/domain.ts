export const contentTypes = ['blog', 'note', 'journal', 'project'] as const;
export type ContentType = (typeof contentTypes)[number];

export const knowledgeSections = [
  {
    key: 'agent-app-development',
    slug: 'agent-app-development',
    label: 'Agent 应用开发',
    description: 'Agent 应用层知识',
  },
  {
    key: 'llm-principles',
    slug: 'llm-principles',
    label: '大模型原理与实现',
    description: '模型原理和实现知识',
  },
  {
    key: 'fine-tuning-inference-deployment',
    slug: 'fine-tuning-inference-deployment',
    label: '微调、推理与部署',
    description: '模型工程与交付知识',
  },
  {
    key: 'practice-cases',
    slug: 'practice-cases',
    label: '实践与案例',
    description: '从真实项目和实验中提炼的可迁移知识',
  },
  {
    key: 'knowledge-frontier',
    slug: 'knowledge-frontier',
    label: '知识前沿',
    description: '正在研究的问题、假设和认知边界',
  },
] as const;
export type KnowledgeSection = (typeof knowledgeSections)[number];
export type KnowledgeSectionKey = KnowledgeSection['key'];

export const stages = ['know-think', 'think-act', 'act-achieve'] as const;
export type Stage = (typeof stages)[number];

export const statuses = ['draft', 'ongoing', 'completed', 'reflected'] as const;
export type Status = (typeof statuses)[number];

export const practiceKinds = ['publish', 'learn', 'practice', 'reflect', 'milestone'] as const;
export type PracticeKind = (typeof practiceKinds)[number];

export const journeyKeys = [
  'question',
  'thinking',
  'action',
  'outcome',
  'reflection',
  'nextStep',
] as const;
export type JourneyKey = (typeof journeyKeys)[number];

export const contentTypePaths = {
  blog: 'blog',
  note: 'notes',
  journal: 'journal',
  project: 'projects',
} as const satisfies Record<ContentType, string>;

export const knowledgePath = '/knowledge';

export const legacyProjectDetail = {
  contentId: 'praxis-project-0001',
  slug: 'praxis-foundation',
  path: '/projects/praxis-foundation',
} as const;

export const legacyCompatibilityMappings = [
  { from: '/blog', to: knowledgePath },
  { from: '/notes', to: knowledgePath },
  { from: '/journal', to: knowledgePath },
  {
    from: '/notes/ai-code-security-review',
    to: `${knowledgePath}/ai-code-security-review`,
  },
  {
    from: '/journal/what-green-gates-miss',
    to: `${knowledgePath}/what-green-gates-miss`,
  },
] as const;

export interface PublicContentIdentity {
  contentId: string;
  slug: string;
  type: ContentType;
}

const pathToContentType = contentTypes.reduce<Record<string, ContentType>>((paths, type) => {
  paths[contentTypePaths[type]] = type;
  return paths;
}, {});

export function isContentType(value: string): value is ContentType {
  return contentTypes.some((type) => type === value);
}

export function isKnowledgeSectionKey(value: string): value is KnowledgeSectionKey {
  return knowledgeSections.some((section) => section.key === value);
}

export function getKnowledgeSectionByKey(key: KnowledgeSectionKey): KnowledgeSection | undefined {
  return knowledgeSections.find((section) => section.key === key);
}

export function getKnowledgeSectionBySlug(slug: string): KnowledgeSection | undefined {
  return knowledgeSections.find((section) => section.slug === slug);
}

export function isPublicStatus(status: Status): boolean {
  return status !== 'draft';
}

export function getContentTypeFromPath(path: string): ContentType | undefined {
  return pathToContentType[path];
}

export function getContentPath(type: ContentType): string {
  return contentTypePaths[type];
}

export function getContentUrl(type: ContentType, slug?: string): string {
  const base = `/${getContentPath(type)}`;
  return slug ? `${base}/${slug}` : base;
}

export function getKnowledgeUrl(slug?: string): string {
  return slug ? `${knowledgePath}/${slug}` : knowledgePath;
}

export function getPublicContentUrl(entry: PublicContentIdentity): string {
  if (entry.type !== 'project') {
    return getKnowledgeUrl(entry.slug);
  }

  return entry.contentId === legacyProjectDetail.contentId
    ? legacyProjectDetail.path
    : `/${contentTypePaths.project}#${entry.slug}`;
}

export function assertKnowledgeSlugAvailability(entries: readonly PublicContentIdentity[]): void {
  const contentBySlug = new Map<string, string>();

  for (const entry of entries) {
    if (entry.type === 'project') {
      continue;
    }

    const reservedSection = getKnowledgeSectionBySlug(entry.slug);
    if (reservedSection) {
      throw new Error(
        `知识内容 slug “${entry.slug}” 与固定入口 “${reservedSection.label}” 冲突：${entry.contentId}`,
      );
    }

    const existingContentId = contentBySlug.get(entry.slug);
    if (existingContentId) {
      throw new Error(
        `知识内容 slug “${entry.slug}” 重复：${existingContentId}、${entry.contentId}`,
      );
    }

    contentBySlug.set(entry.slug, entry.contentId);
  }
}
