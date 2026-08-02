interface RawHtmlNode {
  position?: {
    start: {
      line: number;
      column: number;
    };
  };
}

interface RawUrlNode {
  url: string;
  position?: {
    start: {
      line: number;
      column: number;
    };
  };
}

interface MarkdownPluginContext {
  data: Record<string, unknown>;
  source: string;
}

interface MarkdownSyntaxViolation {
  column: number;
  line: number;
  message: string;
}

const markdownPolicyChecked = 'praxis.markdownPolicyChecked';

function formatPosition(line: number, column: number): string {
  return ` at line ${line}, column ${column}`;
}

function createPolicyError(message: string, line: number, column: number): Error {
  return new Error(`${message}${formatPosition(line, column)}.`);
}

function assertSafeUrl(node: RawUrlNode, nodeType: 'link' | 'image'): void {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(node.url, 'https://praxis.invalid');
  } catch {
    throw createPolicyError(
      `${nodeType === 'link' ? 'Link' : 'Image'} URL is invalid`,
      node.position?.start.line ?? 1,
      node.position?.start.column ?? 1,
    );
  }

  const allowedProtocols =
    nodeType === 'link'
      ? new Set(['http:', 'https:', 'mailto:', 'tel:'])
      : new Set(['http:', 'https:']);
  if (allowedProtocols.has(parsedUrl.protocol)) {
    return;
  }

  throw createPolicyError(
    `${nodeType === 'link' ? 'Link' : 'Image'} URL protocol is not allowed`,
    node.position?.start.line ?? 1,
    node.position?.start.column ?? 1,
  );
}

function findMdxExpressionColumn(line: string): number | undefined {
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '\\') {
      index += 1;
      continue;
    }

    if (character === '`') {
      let delimiterEnd = index;
      while (line[delimiterEnd] === '`') {
        delimiterEnd += 1;
      }

      const delimiter = line.slice(index, delimiterEnd);
      const closingDelimiter = line.indexOf(delimiter, delimiterEnd);
      if (closingDelimiter === -1) {
        return undefined;
      }

      index = closingDelimiter + delimiter.length - 1;
      continue;
    }

    if (character === '{') {
      return index + 1;
    }
  }

  return undefined;
}

function findUnsafeMarkdownSyntax(source: string): MarkdownSyntaxViolation | undefined {
  const lines = source.split(/\r?\n/u);
  let fence: string | undefined;

  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/u);

    if (fenceMatch) {
      const delimiter = fenceMatch[1];

      if (!fence) {
        fence = delimiter;
      } else if (delimiter[0] === fence[0] && delimiter.length >= fence.length) {
        fence = undefined;
      }

      continue;
    }

    if (fence) {
      continue;
    }

    const esmMatch = line.match(/^\s*(?:import|export)\b/u);
    if (esmMatch) {
      return {
        line: lineNumber,
        column: esmMatch[0].length - 5,
        message: 'MDX ESM syntax is not allowed in authored Markdown',
      };
    }

    const expressionColumn = findMdxExpressionColumn(line);
    if (expressionColumn) {
      return {
        line: lineNumber,
        column: expressionColumn,
        message:
          'MDX-style expressions are not allowed in authored Markdown; escape braces or use a code span/block instead',
      };
    }
  }

  return undefined;
}

export const rejectUnsafeMarkdownSyntax = {
  name: 'praxis-reject-unsafe-markdown-syntax',
  html(node: RawHtmlNode) {
    const position = node.position?.start;

    if (position) {
      throw createPolicyError(
        'Raw HTML is not allowed in authored Markdown. Use Markdown syntax instead',
        position.line,
        position.column,
      );
    }

    throw new Error('Raw HTML is not allowed in authored Markdown. Use Markdown syntax instead.');
  },
  text(_node: unknown, context: MarkdownPluginContext) {
    if (context.data[markdownPolicyChecked]) {
      return;
    }

    context.data[markdownPolicyChecked] = true;
    const violation = findUnsafeMarkdownSyntax(context.source);

    if (violation) {
      throw createPolicyError(violation.message, violation.line, violation.column);
    }
  },
  link(node: RawUrlNode) {
    assertSafeUrl(node, 'link');
  },
  image(node: RawUrlNode) {
    assertSafeUrl(node, 'image');
  },
};

export { findUnsafeMarkdownSyntax };
