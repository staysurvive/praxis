import { readFile } from 'node:fs/promises';

import { glob } from 'astro/loaders';
import type { DataStore, Loader } from 'astro/loaders';

import { contentFilePattern } from './file-policy';
import { normalizeContentIdentity } from './identity-normalizer';
import { assertSafeMarkdownSource } from './markdown';
import { assertUniqueSourceIdentities, discoverAuthoredSourceFiles } from './source-reader';
import type { SourceIdentity } from './source-reader';

const contentBase = '../../content';

interface IdentityValidationState {
  initialLoad: boolean;
  initialIdentities: SourceIdentity[];
  root: URL;
  store: DataStore;
}

function getSourceURL(entry: string, base: URL): URL {
  return new URL(encodeURI(entry), base);
}

function getStoredIdentities(state: IdentityValidationState, candidateURL: URL): SourceIdentity[] {
  return state.store.values().flatMap((entry) => {
    if (!entry.filePath) {
      return [];
    }

    const sourceURL = new URL(entry.filePath, state.root);
    if (sourceURL.href === candidateURL.href) {
      return [];
    }

    const identity = normalizeContentIdentity(entry.data, sourceURL.href);
    return identity ? [identity] : [];
  });
}

async function assertSafeContentSources(root: URL): Promise<void> {
  const contentDirectory = new URL(`${contentBase}/`, root);
  const files = await discoverAuthoredSourceFiles(contentDirectory);

  for (const { fileURL } of files) {
    const source = await readFile(fileURL, 'utf8');
    await assertSafeMarkdownSource(source, fileURL);
  }
}

export function markdownContentLoader(): Loader {
  let validationState: IdentityValidationState | undefined;
  const sourceLoader = glob({
    base: contentBase,
    pattern: contentFilePattern,
    generateId: ({ base, data, entry }) => {
      const identity = normalizeContentIdentity(data, entry);

      if (validationState && identity) {
        if (validationState.initialLoad) {
          validationState.initialIdentities.push(identity);
        } else {
          assertUniqueSourceIdentities([
            ...getStoredIdentities(validationState, getSourceURL(entry, base)),
            identity,
          ]);
        }
      }

      return (
        identity?.contentId ??
        (typeof data.contentId === 'string' && data.contentId.length > 0 ? data.contentId : entry)
      );
    },
  });

  return {
    name: 'praxis-markdown-content-loader',
    async load(context) {
      await assertSafeContentSources(context.config.root);
      const state: IdentityValidationState = {
        initialLoad: true,
        initialIdentities: [],
        root: context.config.root,
        store: context.store,
      };
      validationState = state;

      try {
        await sourceLoader.load(context);
        assertUniqueSourceIdentities(state.initialIdentities);
        state.initialLoad = false;
      } catch (error) {
        validationState = undefined;
        throw error;
      }
    },
  };
}

export { assertSafeContentSources };
