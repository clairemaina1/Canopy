import { ArticleRequestError, generateArticleDraft } from '../src/server/article-writer';

type RequestLike = {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};
type ResponseLike = {
  setHeader(name: string, value: string): void;
  status(code: number): ResponseLike;
  json(body: unknown): void;
};

function headerValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request: RequestLike, response: ResponseLike) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Use POST to generate an article draft.' });
    return;
  }

  try {
    const host = headerValue(request.headers['x-forwarded-host']) ?? headerValue(request.headers.host);
    const clientKey = headerValue(request.headers['x-forwarded-for'])?.split(',')[0].trim() ?? 'unknown';
    const text = await generateArticleDraft(request.body, {
      origin: headerValue(request.headers.origin),
      host,
      clientKey,
    });
    response.status(200).json({ text });
  } catch (error) {
    const statusCode = error instanceof ArticleRequestError ? error.statusCode : 502;
    const message = error instanceof ArticleRequestError
      ? error.message
      : 'Canopy could not reach its writing model. Try again in a moment.';
    response.status(statusCode).json({ error: message });
  }
}
