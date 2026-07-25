import { describe, expect, it } from 'vitest';

import {
  contentTypes,
  getContentPath,
  getContentTypeFromPath,
  getContentUrl,
  isPublicStatus,
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

  it('keeps draft content out of every public projection', () => {
    expect(isPublicStatus('draft')).toBe(false);
    expect(isPublicStatus('ongoing')).toBe(true);
    expect(isPublicStatus('completed')).toBe(true);
    expect(isPublicStatus('reflected')).toBe(true);
  });
});
