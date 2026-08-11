import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import matter from 'gray-matter';

import { contentSchema } from '../src/lib/content/schema';
import {
  assertUniqueSourceIdentities,
  discoverAuthoredSourceFiles,
} from '../src/lib/content/source-reader';
import { buildPublicPracticeDataset } from '../src/lib/practice';
import { getTodayDateKey } from '../src/lib/date';
import type { ContentFrontmatter } from '../src/lib/content/schema';
import type { SourceIdentity } from '../src/lib/content/source-reader';

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

async function main(): Promise<void> {
  const files = await discoverAuthoredSourceFiles(pathToFileURL(contentRoot));
  const parsedEntries: ContentFrontmatter[] = [];
  const identities: SourceIdentity[] = [];

  for (const { fileURL } of files) {
    const file = fileURLToPath(fileURL);
    const relativePath = path.relative(repositoryRoot, file).replaceAll('\\', '/');

    const source = await readFile(fileURL, 'utf8');
    const frontmatter = parseFrontmatter(source);
    const parsed = contentSchema.safeParse(frontmatter);

    if (!parsed.success) {
      throw new Error(
        `内容校验失败：${relativePath}\n${parsed.error.issues
          .map((issue) => `- ${issue.path.join('.') || 'frontmatter'}: ${issue.message}`)
          .join('\n')}`,
      );
    }

    parsedEntries.push(parsed.data);
    identities.push({
      contentId: parsed.data.contentId,
      type: parsed.data.type,
      slug: parsed.data.slug,
      sourcePath: relativePath,
    });
  }

  assertUniqueSourceIdentities(identities);

  const dataset = buildPublicPracticeDataset(parsedEntries, { endDateKey: getTodayDateKey() });
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');

  process.stdout.write(
    `Generated ${path.relative(repositoryRoot, outputFile).replaceAll('\\', '/')} (${dataset.totalEvents} events across ${dataset.activeDays} days)\n`,
  );
}

await main();
