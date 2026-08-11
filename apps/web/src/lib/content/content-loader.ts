import { readFile } from 'node:fs/promises';

import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';

import { isContentType } from './domain';
import { contentFilePattern } from './file-policy';
import { assertSafeMarkdownSource } from './markdown';
import { assertUniqueSourceIdentities, discoverAuthoredSourceFiles } from './source-reader';
import type { SourceIdentity } from './source-reader';

const contentBase = '../../content';

async function assertSafeContentSources(root: URL): Promise<void> {
  const contentDirectory = new URL(`${contentBase}/`, root);
  const files = await discoverAuthoredSourceFiles(contentDirectory);

  for (const { fileURL } of files) {
    const source = await readFile(fileURL, 'utf8');
    await assertSafeMarkdownSource(source, fileURL);
  }
}

export function markdownContentLoader(): Loader {
  let activeIdentities: SourceIdentity[] | undefined;
  const sourceLoader = glob({
    base: contentBase,
    pattern: contentFilePattern,
    generateId: ({ data, entry }) => {
      if (
        activeIdentities &&
        typeof data.contentId === 'string' &&
        typeof data.type === 'string' &&
        isContentType(data.type) &&
        typeof data.slug === 'string'
      ) {
        activeIdentities.push({
          contentId: data.contentId,
          type: data.type,
          slug: data.slug,
          sourcePath: entry,
        });
      }

      return typeof data.contentId === 'string' && data.contentId.length > 0
        ? data.contentId
        : entry;
    },
  });

  return {
    name: 'praxis-markdown-content-loader',
    async load(context) {
      await assertSafeContentSources(context.config.root);
      const identities: SourceIdentity[] = [];
      activeIdentities = identities;

      try {
        await sourceLoader.load(context);
        assertUniqueSourceIdentities(identities);
      } finally {
        activeIdentities = undefined;
      }
    },
  };
}

export { assertSafeContentSources };
