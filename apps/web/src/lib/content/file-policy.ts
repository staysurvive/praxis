export const contentFilePattern = '**/*.md';

export type ContentFileKind = 'markdown' | 'mdx';

export function getContentFileKind(filePath: string): ContentFileKind | undefined {
  const normalizedPath = filePath.toLowerCase();

  if (normalizedPath.endsWith('.md')) {
    return 'markdown';
  }

  if (normalizedPath.endsWith('.mdx')) {
    return 'mdx';
  }

  return undefined;
}

export function assertMarkdownContentFile(filePath: string): void {
  if (getContentFileKind(filePath) === 'mdx') {
    throw new Error(
      `MDX content is not allowed: ${filePath}. Rename it to .md and use Markdown syntax instead.`,
    );
  }
}
