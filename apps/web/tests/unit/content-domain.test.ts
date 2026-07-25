import { describe, expect, it } from 'vitest';

import {
  contentTypes,
  getContentPath,
  getContentTypeFromPath,
  getContentUrl,
} from '../../src/lib/content/domain';

describe('type-first URL contract', () => {
  it.each([
    ['blog', '/blog/example'],
    ['note', '/notes/example'],
    ['journal', '/journal/example'],
    ['project', '/projects/example'],
  ] as const)('maps %s to a stable type-first URL', (type, expected) => {
    expect(getContentUrl(type, 'example')).toBe(expected);
  });

  it('round-trips every content type path', () => {
    for (const type of contentTypes) {
      expect(getContentTypeFromPath(getContentPath(type))).toBe(type);
    }
  });
});
