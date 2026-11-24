import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { ArticleRequestError, generateArticleDraft } from './src/server/article-writer';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function headerValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function articleApiPlugin(): Plugin {
  return {
    name: 'canopy-article-api',
    configureServer(server) {
      server.middlewares.use('/api/write-article', async (request, response) => {
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        const sendJson = (status: number, body: unknown) => {
          response.statusCode = status;
          response.end(JSON.stringify(body));
        };

        if (request.method !== 'POST') {
          response.setHeader('Allow', 'POST');
          sendJson(405, { error: 'Use POST to generate an article draft.' });
          return;
        }

        try {
          const chunks: Buffer[] = [];
          let totalBytes = 0;
          for await (const chunk of request) {
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            totalBytes += buffer.byteLength;
            if (totalBytes > 100_000) {
              throw new ArticleRequestError('Keep the combined article notes under 30,000 characters.', 413);
            }
            chunks.push(buffer);
          }

          let body: unknown;
          try {
            body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          } catch {
            throw new ArticleRequestError('Send valid article notes and settings, then try again.', 400);
          }

          const host = headerValue(request.headers['x-forwarded-host']) ?? headerValue(request.headers.host);
          const clientKey = headerValue(request.headers['x-forwarded-for'])?.split(',')[0].trim() ?? request.socket.remoteAddress ?? 'unknown';
          const text = await generateArticleDraft(body, {
            origin: headerValue(request.headers.origin),
            host,
            clientKey,
          });
          sendJson(200, { text });
        } catch (error) {
          const statusCode = error instanceof ArticleRequestError ? error.statusCode : 502;
          const message = error instanceof ArticleRequestError
            ? error.message
            : 'Canopy could not reach its writing model. Try again in a moment.';
          sendJson(statusCode, { error: message });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const runtimeEnv = loadEnv(mode, projectRoot, '');
  for (const [key, value] of Object.entries(runtimeEnv)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [react(), articleApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(projectRoot, './src'),
      },
    },
    optimizeDeps: {
      include: ['prop-types', 'react-transition-group'],
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});
