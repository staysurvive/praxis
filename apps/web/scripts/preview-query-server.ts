import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  invalidKnowledgeQueryPath,
  knowledgePath,
  resolveKnowledgeQueryPath,
} from '../src/lib/content/domain';

const distRoot = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const port = readNumberFlag('--port', 4321);
const host = readStringFlag('--host', '127.0.0.1');

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

function readStringFlag(flag: string, fallback: string): string {
  const index = process.argv.indexOf(flag);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function readNumberFlag(flag: string, fallback: number): number {
  const value = Number(readStringFlag(flag, String(fallback)));
  return Number.isInteger(value) && value > 0 && value < 65_536 ? value : fallback;
}

function getRequestUrl(request: IncomingMessage): URL | undefined {
  if (!request.url) {
    return undefined;
  }

  try {
    return new URL(request.url, 'http://praxis.local');
  } catch {
    return undefined;
  }
}

function getPublicPath(url: URL): string {
  if (url.pathname === knowledgePath && url.search) {
    return resolveKnowledgeQueryPath(url.searchParams) ?? invalidKnowledgeQueryPath;
  }

  return url.pathname;
}

function getStaticFile(publicPath: string): string | undefined {
  if (!publicPath.startsWith('/') || publicPath.includes('\\')) {
    return undefined;
  }

  const candidate = resolve(distRoot, `.${publicPath}`);
  if (candidate !== distRoot && !candidate.startsWith(`${distRoot}${sep}`)) {
    return undefined;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  const indexFile = resolve(candidate, 'index.html');
  if (existsSync(indexFile) && statSync(indexFile).isFile()) {
    return indexFile;
  }

  const htmlFile = `${candidate}.html`;
  return existsSync(htmlFile) && statSync(htmlFile).isFile() ? htmlFile : undefined;
}

function sendNotFound(response: ServerResponse, method: string): void {
  const errorFile = resolve(distRoot, '404.html');
  response.statusCode = 404;
  response.setHeader('content-type', contentTypes['.html']);

  if (method === 'HEAD') {
    response.end();
    return;
  }

  if (!existsSync(errorFile)) {
    response.end('Not Found');
    return;
  }

  createReadStream(errorFile).pipe(response);
}

function serve(request: IncomingMessage, response: ServerResponse): void {
  const url = getRequestUrl(request);
  if (!url) {
    response.statusCode = 400;
    response.end('Bad Request');
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.statusCode = 405;
    response.setHeader('allow', 'GET, HEAD');
    response.end();
    return;
  }

  const publicPath = getPublicPath(url);
  const file = getStaticFile(publicPath);
  if (!file) {
    sendNotFound(response, request.method);
    return;
  }

  response.statusCode = 200;
  response.setHeader(
    'content-type',
    contentTypes[extname(file).toLowerCase()] ?? 'application/octet-stream',
  );
  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(file)
    .on('error', () => sendNotFound(response, request.method ?? 'GET'))
    .pipe(response);
}

const server = createServer(serve);
server.listen(port, host, () => {
  process.stdout.write(`Praxis preview running at http://${host}:${port}\n`);
});
