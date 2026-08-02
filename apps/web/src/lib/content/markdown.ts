import { satteri } from '@astrojs/markdown-satteri';

import { rejectUnsafeMarkdownSyntax } from './reject-unsafe-markdown-syntax';

export const contentMarkdownProcessor = satteri({
  mdastPlugins: [rejectUnsafeMarkdownSyntax],
});

function getMarkdownBody(source: string): string {
  const lines = source.split(/\r?\n/u);
  const delimiter = lines[0]?.trim();

  if (delimiter !== '---' && delimiter !== '+++') {
    return source;
  }

  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === delimiter);

  return closingIndex === -1 ? source : lines.slice(closingIndex + 1).join('\n');
}

export async function assertSafeMarkdownSource(source: string, fileURL: URL): Promise<void> {
  const renderer = await contentMarkdownProcessor.createRenderer({});

  await renderer.render(getMarkdownBody(source), { fileURL });
}
