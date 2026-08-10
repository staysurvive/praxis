import type { Connect } from 'vite';
import type { Plugin } from 'vite';

import {
  invalidKnowledgeQueryPath,
  knowledgePath,
  resolveKnowledgeQueryPath,
} from '../src/lib/content/domain';

function rewriteKnowledgeQueryRequest(request: Connect.IncomingMessage): void {
  if (!request.url) {
    return;
  }

  const url = new URL(request.url, 'http://praxis.local');
  if (url.pathname !== knowledgePath || !url.search) {
    return;
  }

  url.pathname = resolveKnowledgeQueryPath(url.searchParams) ?? invalidKnowledgeQueryPath;
  request.url = `${url.pathname}${url.search}${url.hash}`;
}

function installKnowledgeQueryMiddleware(middlewares: Connect.Server): void {
  const rewriteMiddleware: Connect.NextHandleFunction = (request, _response, next) => {
    rewriteKnowledgeQueryRequest(request);
    next();
  };

  middlewares.stack.unshift({ route: '', handle: rewriteMiddleware });
}

export function knowledgeQueryRouting(): Plugin {
  return {
    name: 'praxis-knowledge-query-routing',
    enforce: 'pre',
    configureServer(server) {
      installKnowledgeQueryMiddleware(server.middlewares);
    },
  };
}
