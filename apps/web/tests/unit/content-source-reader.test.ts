import { exec } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { markdownContentLoader } from '../../src/lib/content/content-loader';
import { normalizeContentIdentity } from '../../src/lib/content/identity-normalizer';
import {
  assertUniqueSourceIdentities,
  discoverAuthoredSourceFiles,
} from '../../src/lib/content/source-reader';
import type { LoaderContext } from 'astro/loaders';
import type { SourceIdentity } from '../../src/lib/content/source-reader';

const globMockState = vi.hoisted(() => ({
  base: new URL('file:///project/content/'),
  entries: [] as Array<{ entry: string; data: Record<string, unknown> }>,
  generateId: undefined as
    ((input: { entry: string; base: URL; data: Record<string, unknown> }) => string) | undefined,
}));

vi.mock('astro/loaders', () => ({
  glob: (options: {
    generateId?: (input: { entry: string; base: URL; data: Record<string, unknown> }) => string;
  }) => {
    globMockState.generateId = options.generateId;
    return {
      name: 'glob-loader',
      load: async () => {
        for (const fixture of globMockState.entries) {
          options.generateId?.({ ...fixture, base: globMockState.base });
        }
      },
    };
  },
}));

const temporaryDirectories: string[] = [];
const execAsync = promisify(exec);
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

async function createContentDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'praxis-content-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  globMockState.base = new URL('file:///project/content/');
  globMockState.entries = [];
  globMockState.generateId = undefined;
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
    globMockState.base = pathToFileURL(`${path.join(projectDirectory, 'content')}${path.sep}`);

    const loader = markdownContentLoader();
    const root = pathToFileURL(`${webDirectory}${path.sep}`);

    await expect(
      loader.load({ config: { root }, store: { values: () => [] } } as unknown as LoaderContext),
    ).rejects.toThrow('contentId 重复：praxis-note-0001');
  });

  it('rejects a duplicate identity added after the initial load', async () => {
    const projectDirectory = await createContentDirectory();
    const webDirectory = path.join(projectDirectory, 'apps', 'web');
    const contentDirectory = path.join(projectDirectory, 'content', 'notes');
    await Promise.all([
      mkdir(webDirectory, { recursive: true }),
      mkdir(contentDirectory, { recursive: true }),
    ]);
    await writeFile(path.join(contentDirectory, 'first.md'), '# First');
    globMockState.base = pathToFileURL(`${path.join(projectDirectory, 'content')}${path.sep}`);
    const root = pathToFileURL(`${webDirectory}${path.sep}`);
    const storeEntries = [
      {
        data: { contentId: 'praxis-note-0001', type: 'note', slug: 'first-note' },
        filePath: '../../content/notes/first.md',
      },
    ];

    const loader = markdownContentLoader();
    await loader.load({
      config: { root },
      store: { values: () => storeEntries },
    } as unknown as LoaderContext);

    expect(globMockState.generateId).toBeDefined();
    expect(() =>
      globMockState.generateId?.({
        entry: 'notes/second.md',
        base: globMockState.base,
        data: { contentId: 'praxis-note-0001', type: 'note', slug: 'second-note' },
      }),
    ).toThrow('contentId 重复：praxis-note-0001');
  });

  it('allows a valid identity replacement for the same source file', async () => {
    const projectDirectory = await createContentDirectory();
    const webDirectory = path.join(projectDirectory, 'apps', 'web');
    const contentDirectory = path.join(projectDirectory, 'content', 'notes');
    await Promise.all([
      mkdir(webDirectory, { recursive: true }),
      mkdir(contentDirectory, { recursive: true }),
    ]);
    await writeFile(path.join(contentDirectory, 'first.md'), '# First');
    globMockState.base = pathToFileURL(`${path.join(projectDirectory, 'content')}${path.sep}`);
    const root = pathToFileURL(`${webDirectory}${path.sep}`);
    const storeEntries = [
      {
        data: { contentId: 'foo', type: 'note', slug: 'first-note' },
        filePath: '../../content/notes/first.md',
      },
    ];

    const loader = markdownContentLoader();
    await loader.load({
      config: { root },
      store: { values: () => storeEntries },
    } as unknown as LoaderContext);

    expect(() =>
      globMockState.generateId?.({
        entry: 'notes/first.md',
        base: globMockState.base,
        data: { contentId: 'bar', type: 'note', slug: 'replacement-note' },
      }),
    ).not.toThrow();
  });

  it('rejects a duplicate type:slug identity after a change', async () => {
    const projectDirectory = await createContentDirectory();
    const webDirectory = path.join(projectDirectory, 'apps', 'web');
    const contentDirectory = path.join(projectDirectory, 'content', 'notes');
    await Promise.all([
      mkdir(webDirectory, { recursive: true }),
      mkdir(contentDirectory, { recursive: true }),
    ]);
    await writeFile(path.join(contentDirectory, 'first.md'), '# First');
    globMockState.base = pathToFileURL(`${path.join(projectDirectory, 'content')}${path.sep}`);
    const root = pathToFileURL(`${webDirectory}${path.sep}`);
    const storeEntries = [
      {
        data: { contentId: 'foo', type: 'note', slug: 'first-note' },
        filePath: '../../content/notes/first.md',
      },
      {
        data: { contentId: 'bar', type: 'note', slug: 'second-note' },
        filePath: '../../content/notes/second.md',
      },
    ];

    const loader = markdownContentLoader();
    await loader.load({
      config: { root },
      store: { values: () => storeEntries },
    } as unknown as LoaderContext);

    expect(() =>
      globMockState.generateId?.({
        entry: 'notes/first.md',
        base: globMockState.base,
        data: { contentId: 'baz', type: 'note', slug: 'second-note' },
      }),
    ).toThrow('内容 URL 重复：note:second-note');
  });

  it('allows an identity to be reintroduced after unlink', async () => {
    const projectDirectory = await createContentDirectory();
    const webDirectory = path.join(projectDirectory, 'apps', 'web');
    const contentDirectory = path.join(projectDirectory, 'content', 'notes');
    await Promise.all([
      mkdir(webDirectory, { recursive: true }),
      mkdir(contentDirectory, { recursive: true }),
    ]);
    await writeFile(path.join(contentDirectory, 'first.md'), '# First');
    globMockState.base = pathToFileURL(`${path.join(projectDirectory, 'content')}${path.sep}`);
    const root = pathToFileURL(`${webDirectory}${path.sep}`);
    const storeEntries = [
      {
        data: { contentId: 'foo', type: 'note', slug: 'first-note' },
        filePath: '../../content/notes/first.md',
      },
    ];

    const loader = markdownContentLoader();
    await loader.load({
      config: { root },
      store: { values: () => storeEntries },
    } as unknown as LoaderContext);
    storeEntries.splice(0, 1);

    expect(() =>
      globMockState.generateId?.({
        entry: 'notes/second.md',
        base: globMockState.base,
        data: { contentId: 'foo', type: 'note', slug: 'first-note' },
      }),
    ).not.toThrow();
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

  it('normalizes identity fields using the schema-defined trim semantics', () => {
    const normalized = normalizeContentIdentity(
      { contentId: '  praxis-note-0001  ', type: 'note', slug: '  first-note  ' },
      'content/notes/first-note.md',
    );

    expect(normalized).toEqual({
      contentId: 'praxis-note-0001',
      type: 'note',
      slug: 'first-note',
      sourcePath: 'content/notes/first-note.md',
    });
    expect(normalized).toBeDefined();
    if (normalized) {
      expect(normalizeContentIdentity(normalized, normalized.sourcePath)).toEqual(normalized);
    }
  });

  it('rejects collisions after identity normalization', () => {
    const first = normalizeContentIdentity(
      { contentId: '  praxis-note-0001', type: 'note', slug: 'first-note' },
      'content/notes/first.md',
    );
    const second = normalizeContentIdentity(
      { contentId: 'praxis-note-0001', type: 'note', slug: ' second-note ' },
      'content/notes/second.md',
    );

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (first && second) {
      expect(() => assertUniqueSourceIdentities([first, second])).toThrow(
        'contentId 重复：praxis-note-0001',
      );
    }
  });

  it('rejects type:slug collisions after slug normalization', () => {
    const first = normalizeContentIdentity(
      { contentId: 'praxis-note-0001', type: 'note', slug: ' shared-note ' },
      'content/notes/first.md',
    );
    const second = normalizeContentIdentity(
      { contentId: 'praxis-note-0002', type: 'note', slug: 'shared-note' },
      'content/notes/second.md',
    );

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (first && second) {
      expect(() => assertUniqueSourceIdentities([first, second])).toThrow(
        '内容 URL 重复：note:shared-note',
      );
    }
  });

  it('runs the practice generator through the shared identity pipeline', async () => {
    const { stdout } = await execAsync('npm run generate:practice', {
      cwd: repositoryRoot,
    });

    expect(stdout).toContain('Generated apps/web/src/generated/practice-activity.json');
    expect(stdout).toContain('11 events across 3 days');
  });
});
