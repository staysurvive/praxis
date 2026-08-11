import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { markdownContentLoader } from '../../src/lib/content/content-loader';
import {
  assertUniqueSourceIdentities,
  discoverAuthoredSourceFiles,
} from '../../src/lib/content/source-reader';
import type { LoaderContext } from 'astro/loaders';
import type { SourceIdentity } from '../../src/lib/content/source-reader';

const globMockState = vi.hoisted(() => ({
  entries: [] as Array<{ entry: string; data: Record<string, unknown> }>,
}));

vi.mock('astro/loaders', () => ({
  glob: (options: {
    generateId?: (input: { entry: string; base: URL; data: Record<string, unknown> }) => string;
  }) => ({
    name: 'glob-loader',
    load: async () => {
      for (const fixture of globMockState.entries) {
        options.generateId?.({ ...fixture, base: new URL('file:///content/') });
      }
    },
  }),
}));

const temporaryDirectories: string[] = [];

async function createContentDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'praxis-content-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  globMockState.entries = [];
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe('Astro content loader identity validation', () => {
  it('rejects duplicate identities collected by the official glob loader', async () => {
    const projectDirectory = await createContentDirectory();
    const webDirectory = path.join(projectDirectory, 'apps', 'web');
    const contentDirectory = path.join(projectDirectory, 'content', 'notes');
    await Promise.all([
      mkdir(webDirectory, { recursive: true }),
      mkdir(contentDirectory, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(path.join(contentDirectory, 'first.md'), '# First'),
      writeFile(path.join(contentDirectory, 'second.md'), '# Second'),
    ]);
    globMockState.entries = [
      {
        entry: 'notes/first.md',
        data: { contentId: 'praxis-note-0001', type: 'note', slug: 'first-note' },
      },
      {
        entry: 'notes/second.md',
        data: { contentId: 'praxis-note-0001', type: 'note', slug: 'second-note' },
      },
    ];

    const loader = markdownContentLoader();
    const root = pathToFileURL(`${webDirectory}${path.sep}`);

    await expect(loader.load({ config: { root } } as unknown as LoaderContext)).rejects.toThrow(
      'contentId 重复：praxis-note-0001',
    );
  });
});

describe('authored source discovery', () => {
  it('returns lowercase Markdown files in stable source-path order', async () => {
    const contentDirectory = await createContentDirectory();
    await mkdir(path.join(contentDirectory, 'nested'));
    await Promise.all([
      writeFile(path.join(contentDirectory, 'z-last.md'), '# Last'),
      writeFile(path.join(contentDirectory, 'nested', 'a-first.md'), '# First'),
      writeFile(path.join(contentDirectory, 'ignored.txt'), 'Ignored'),
    ]);

    const files = await discoverAuthoredSourceFiles(pathToFileURL(contentDirectory));

    expect(files.map((file) => file.relativePath)).toEqual(['nested/a-first.md', 'z-last.md']);
  });

  it('rejects uppercase Markdown extensions instead of silently diverging from Astro glob', async () => {
    const contentDirectory = await createContentDirectory();
    await writeFile(path.join(contentDirectory, 'example.MD'), '# Uppercase extension');

    await expect(discoverAuthoredSourceFiles(pathToFileURL(contentDirectory))).rejects.toThrow(
      'lowercase .md extension',
    );
  });

  it('rejects MDX files', async () => {
    const contentDirectory = await createContentDirectory();
    await writeFile(path.join(contentDirectory, 'example.mdx'), '# MDX');

    await expect(discoverAuthoredSourceFiles(pathToFileURL(contentDirectory))).rejects.toThrow(
      'MDX content is not allowed',
    );
  });
});

describe('source identity validation', () => {
  const baseIdentity: SourceIdentity = {
    contentId: 'praxis-note-0001',
    type: 'note',
    slug: 'first-note',
    sourcePath: 'content/notes/first-note.md',
  };

  it('rejects duplicate contentId values', () => {
    expect(() =>
      assertUniqueSourceIdentities([
        baseIdentity,
        {
          ...baseIdentity,
          slug: 'second-note',
          sourcePath: 'content/notes/second-note.md',
        },
      ]),
    ).toThrow('contentId 重复：praxis-note-0001');
  });

  it('rejects duplicate type:slug identities', () => {
    expect(() =>
      assertUniqueSourceIdentities([
        baseIdentity,
        {
          ...baseIdentity,
          contentId: 'praxis-note-0002',
          sourcePath: 'content/notes/duplicate-note.md',
        },
      ]),
    ).toThrow('内容 URL 重复：note:first-note');
  });

  it('keeps article identity separate across existing content types', () => {
    expect(() =>
      assertUniqueSourceIdentities([
        baseIdentity,
        {
          ...baseIdentity,
          contentId: 'praxis-blog-0001',
          type: 'blog',
          sourcePath: 'content/blog/first-note.md',
        },
      ]),
    ).not.toThrow();
  });
});
