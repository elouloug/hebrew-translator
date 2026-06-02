import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

function loadDotEnv() {
  try {
    const lines = readFileSync('.env', 'utf8').split('\n');
    for (const line of lines) {
      const eq = line.indexOf('=');
      if (eq > 0) {
        const key = line.slice(0, eq).trim();
        const val = line.slice(eq + 1).trim();
        if (key) process.env[key] = val;
      }
    }
  } catch { /* no .env file */ }
}

function apiPlugin() {
  return {
    name: 'api-routes',
    async configureServer(server) {
      loadDotEnv();

      server.middlewares.use('/api/translate', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            req.body = JSON.parse(body);
          } catch {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid JSON.' }));
            return;
          }

          // Shim Vercel-style res.status().json() onto Node's ServerResponse
          res.status = (code) => { res.statusCode = code; return res; };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };

          try {
            const { default: handler } = await import('./api/translate.js');
            await handler(req, res);
          } catch (err) {
            console.error(err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Server error.' }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
});
