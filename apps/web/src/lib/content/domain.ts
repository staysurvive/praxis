export const contentTypes = ['blog', 'note', 'journal', 'project'] as const;
export type ContentType = (typeof contentTypes)[number];

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

const pathToContentType = contentTypes.reduce<Record<string, ContentType>>((paths, type) => {
  paths[contentTypePaths[type]] = type;
  return paths;
}, {});

export function isContentType(value: string): value is ContentType {
  return contentTypes.some((type) => type === value);
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
