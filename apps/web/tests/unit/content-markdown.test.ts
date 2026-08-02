import { describe, expect, it } from 'vitest';

import {
  assertMarkdownContentFile,
  contentFilePattern,
  getContentFileKind,
} from '../../src/lib/content/file-policy';
import { contentMarkdownProcessor } from '../../src/lib/content/markdown';
import { findUnsafeMarkdownSyntax } from '../../src/lib/content/reject-unsafe-markdown-syntax';

describe('authored Markdown policy', () => {
  it('accepts ordinary Markdown through the production processor', async () => {
    const renderer = await contentMarkdownProcessor.createRenderer({});
    const rendered = await renderer.render('Safe **Markdown** content.');

    expect(rendered.code).toContain('<p>Safe <strong>Markdown</strong> content.</p>');
  });

  it('rejects raw HTML with event attributes before rendering', async () => {
    const renderer = await contentMarkdownProcessor.createRenderer({});

    await expect(
      renderer.render('An <img src="/avatar.png" onerror="alert(1)"> image.'),
    ).rejects.toThrow('Raw HTML is not allowed in authored Markdown');
  });

  it('rejects executable link and image protocols', async () => {
    const renderer = await contentMarkdownProcessor.createRenderer({});

    await expect(renderer.render('[run](javascript:alert(1))')).rejects.toThrow(
      'Link URL protocol is not allowed',
    );
    await expect(
      renderer.render('![pixel](data:image/svg+xml,<svg/onload=alert(1)>)'),
    ).rejects.toThrow('Image URL protocol is not allowed');
    await expect(renderer.render('[safe](/notes/security)')).resolves.toHaveProperty(
      'code',
      '<p><a href="/notes/security">safe</a></p>\n',
    );
  });

  it('rejects MDX expressions and ESM while allowing escaped braces and code', async () => {
    const renderer = await contentMarkdownProcessor.createRenderer({});

    await expect(renderer.render('{process.exit(1)}')).rejects.toThrow(
      'MDX-style expressions are not allowed in authored Markdown',
    );
    await expect(renderer.render('export const value = 1')).rejects.toThrow(
      'MDX ESM syntax is not allowed in authored Markdown',
    );
    await expect(
      renderer.render('Use \\{literal braces\\} and `{code}` safely.'),
    ).resolves.toHaveProperty(
      'code',
      '<p>Use {literal braces} and <code>{code}</code> safely.</p>\n',
    );
  });

  it('does not mistake fenced code examples for MDX syntax', () => {
    expect(findUnsafeMarkdownSyntax('```ts\nexport const value = { enabled: true };\n```')).toBe(
      undefined,
    );
  });

  it('discovers Markdown files and rejects MDX content files', () => {
    expect(contentFilePattern).toBe('**/*.md');
    expect(getContentFileKind('content/notes/example.md')).toBe('markdown');
    expect(getContentFileKind('content/notes/example.mdx')).toBe('mdx');
    expect(() => assertMarkdownContentFile('content/notes/example.mdx')).toThrow(
      'MDX content is not allowed',
    );
  });
});
