import { practiceDataset } from '../../lib/practice-data';

export const prerender = true;

export function GET(): Response {
  return new Response(`${JSON.stringify(practiceDataset, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
