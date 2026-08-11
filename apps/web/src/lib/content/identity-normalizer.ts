import { isContentType } from './domain';
import type { SourceIdentity } from './source-reader';

export interface RawContentIdentity {
  contentId?: unknown;
  type?: unknown;
  slug?: unknown;
}

export function normalizeContentIdentity(
  data: RawContentIdentity,
  sourcePath: string,
): SourceIdentity | undefined {
  if (
    typeof data.contentId !== 'string' ||
    typeof data.type !== 'string' ||
    typeof data.slug !== 'string' ||
    !isContentType(data.type)
  ) {
    return undefined;
  }

  const contentId = data.contentId.trim();
  const slug = data.slug.trim();

  if (contentId.length === 0 || slug.length === 0) {
    return undefined;
  }

  return { contentId, type: data.type, slug, sourcePath };
}
