export const contentFilePattern = '**/*.md';

export type ContentFileKind = 'markdown' | 'mdx';

export function getContentFileKind(filePath: string): ContentFileKind | undefined {
  if (filePath.endsWith('.md')) {
    return 'markdown';
  }

  if (filePath.endsWith('.mdx')) {
    return 'mdx';
  }

  return undefined;
}

export function isContentFileCandidate(filePath: string): boolean {
  const normalizedPath = filePath.toLowerCase();
  return normalizedPath.endsWith('.md') || normalizedPath.endsWith('.mdx');
}

export function assertMarkdownContentFile(filePath: string): void {
  const normalizedPath = filePath.toLowerCase();

  if (filePath.endsWith('.md')) {
    return;
  }

  if (normalizedPath.endsWith('.mdx')) {
    throw new Error(
      `MDX content is not allowed: ${filePath}. Rename it to .md and use Markdown syntax instead.`,
    );
  }

  if (normalizedPath.endsWith('.md')) {
    throw new Error(
      `Markdown content must use the lowercase .md extension: ${filePath}. Rename the file extension to .md.`,
    );
  }

  throw new Error(
    `Unsupported authored content file: ${filePath}. Use the lowercase .md extension.`,
  );
}
