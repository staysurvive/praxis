import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';

import { assertMarkdownContentFile, getContentFileKind } from '../src/lib/content/file-policy';
import { contentSchema } from '../src/lib/content/schema';
import { buildPublicPracticeDataset } from '../src/lib/practice';
import { getTodayDateKey } from '../src/lib/date';
import type { ContentFrontmatter } from '../src/lib/content/schema';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(webRoot, '../..');
const contentRoot = path.join(repositoryRoot, 'content');
const outputFile = path.join(webRoot, 'src/generated/practice-activity.json');

// gray-matter enables a JavaScript frontmatter engine by default, so a file
// whose frontmatter opens with `---js` is parsed through eval() — arbitrary
// code execution during the build. Content frontmatter must be inert data, so
// reject every executable engine and only allow the YAML/JSON defaults.
const rejectExecutableFrontmatter = (): never => {
  throw new Error('不支持可执行的 frontmatter 引擎；内容文件请使用 YAML frontmatter');
};

function parseFrontmatter(source: string): Record<string, unknown> {
  return matter(source, {
    language: 'yaml',
    engines: {
      javascript: rejectExecutableFrontmatter,
      js: rejectExecutableFrontmatter,
    },
  }).data;
}

async function findContentFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findContentFiles(absolutePath);
      }

      return getContentFileKind(entry.name) ? [absolutePath] : [];
    }),
  );

  return files.flat().sort((left, right) => left.localeCompare(right));
}

async function main(): Promise<void> {
  const files = await findContentFiles(contentRoot);
  const parsedEntries: ContentFrontmatter[] = [];
  const contentIds = new Set<string>();
  const urls = new Set<string>();

  for (const file of files) {
    const relativePath = path.relative(repositoryRoot, file).replaceAll('\\', '/');
    assertMarkdownContentFile(relativePath);

    const source = await readFile(file, 'utf8');
    const frontmatter = parseFrontmatter(source);
    const parsed = contentSchema.safeParse(frontmatter);

    if (!parsed.success) {
      throw new Error(
        `内容校验失败：${relativePath}\n${parsed.error.issues
          .map((issue) => `- ${issue.path.join('.') || 'frontmatter'}: ${issue.message}`)
          .join('\n')}`,
      );
    }

    if (contentIds.has(parsed.data.contentId)) {
      throw new Error(`contentId 重复：${parsed.data.contentId}（${relativePath}）`);
    }
    contentIds.add(parsed.data.contentId);

    const urlKey = `${parsed.data.type}:${parsed.data.slug}`;
    if (urls.has(urlKey)) {
      throw new Error(`内容 URL 重复：${urlKey}（${relativePath}）`);
    }
    urls.add(urlKey);

    parsedEntries.push(parsed.data);
  }

  const dataset = buildPublicPracticeDataset(parsedEntries, { endDateKey: getTodayDateKey() });
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');

  process.stdout.write(
    `Generated ${path.relative(repositoryRoot, outputFile).replaceAll('\\', '/')} (${dataset.totalEvents} events across ${dataset.activeDays} days)\n`,
  );
}

await main();
