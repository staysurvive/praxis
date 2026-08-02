import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';

import { assertMarkdownContentFile, contentFilePattern, getContentFileKind } from './file-policy';
import { assertSafeMarkdownSource } from './markdown';

const contentBase = '../../content';

async function findContentFiles(directory: URL): Promise<URL[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fileURL = new URL(
        `${encodeURIComponent(entry.name)}${entry.isDirectory() ? '/' : ''}`,
        directory,
      );

      if (entry.isDirectory()) {
        return findContentFiles(fileURL);
      }

      return getContentFileKind(entry.name) ? [fileURL] : [];
    }),
  );

  return files.flat().sort((left, right) => left.href.localeCompare(right.href));
}

async function assertSafeContentSources(root: URL): Promise<void> {
  const contentDirectory = new URL(`${contentBase}/`, root);
  const files = await findContentFiles(contentDirectory);

  for (const fileURL of files) {
    const relativePath = path
      .relative(fileURLToPath(root), fileURLToPath(fileURL))
      .replaceAll('\\', '/');
    assertMarkdownContentFile(relativePath);

    const source = await readFile(fileURL, 'utf8');
    await assertSafeMarkdownSource(source, fileURL);
  }
}

export function markdownContentLoader(): Loader {
  const sourceLoader = glob({
    base: contentBase,
    pattern: contentFilePattern,
    generateId: ({ data, entry }) =>
      typeof data.contentId === 'string' && data.contentId.length > 0 ? data.contentId : entry,
  });

  return {
    name: 'praxis-markdown-content-loader',
    async load(context) {
      await assertSafeContentSources(context.config.root);
      await sourceLoader.load(context);
    },
  };
}

export { assertSafeContentSources };
