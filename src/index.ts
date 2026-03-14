import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { runAgent } from './agent.js';
import { createGeminiProvider } from './providers/gemini.js';
import { getAllTools } from './tools/registry.js';
import { logAgentResult } from './logger.js';

const app = new Hono();

app.use('*', cors());

const provider = createGeminiProvider(getAllTools());

app.use('/*', serveStatic({ root: './public' }));

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.post('/ask', async (c) => {
  const body = await c.req.json();
  const question = body.question;

  if (!question || typeof question !== 'string') {
    return c.json({ error: "Missing 'question' field" }, 400);
  }

  const result = await runAgent(question, provider);

  logAgentResult(result);

  return c.json(result);
});

const port = Number(process.env['PORT'] ?? 3000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`🐸 Agentic Tool Router running on http://localhost:${port}`);
});
