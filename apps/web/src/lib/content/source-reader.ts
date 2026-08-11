import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { assertMarkdownContentFile, isContentFileCandidate } from './file-policy';
import type { PublicContentIdentity } from './domain';

export interface AuthoredSourceFile {
  fileURL: URL;
  relativePath: string;
}

export interface SourceIdentity extends PublicContentIdentity {
  sourcePath: string;
}

async function discoverDirectory(
  directoryPath: string,
  relativeDirectory = '',
): Promise<AuthoredSourceFile[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const discovered = await Promise.all(
    entries.map(async (entry): Promise<AuthoredSourceFile[]> => {
      const absolutePath = path.join(directoryPath, entry.name);
      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        return discoverDirectory(absolutePath, relativePath);
      }

      if (!isContentFileCandidate(entry.name)) {
        return [];
      }

      assertMarkdownContentFile(relativePath);
      return [{ fileURL: pathToFileURL(absolutePath), relativePath }];
    }),
  );

  return discovered.flat();
}

export async function discoverAuthoredSourceFiles(
  contentDirectory: URL,
): Promise<AuthoredSourceFile[]> {
  if (contentDirectory.protocol !== 'file:') {
    throw new Error(`Authored content directory must be a file URL: ${contentDirectory.href}`);
  }

  const files = await discoverDirectory(fileURLToPath(contentDirectory));
  return files.sort((left, right) =>
    left.relativePath < right.relativePath ? -1 : left.relativePath > right.relativePath ? 1 : 0,
  );
}

export function assertUniqueSourceIdentities(identities: readonly SourceIdentity[]): void {
  const contentIds = new Set<string>();
  const typeSlugIdentities = new Set<string>();

  for (const identity of identities) {
    if (contentIds.has(identity.contentId)) {
      throw new Error(`contentId 重复：${identity.contentId}（${identity.sourcePath}）`);
    }
    contentIds.add(identity.contentId);

    const typeSlugIdentity = `${identity.type}:${identity.slug}`;
    if (typeSlugIdentities.has(typeSlugIdentity)) {
      throw new Error(`内容 URL 重复：${typeSlugIdentity}（${identity.sourcePath}）`);
    }
    typeSlugIdentities.add(typeSlugIdentity);
  }
}
