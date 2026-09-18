import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function createViteApiPlugin() {
  return {
    name: 'samadhan-api-server',
    configureServer(server) {
      server.middlewares.use(createApiHandler());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createApiHandler());
    },
  };
}

function createApiHandler() {
  return async (req, res, next) => {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/api/analyze-issue') {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }

      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
      });

      req.on('end', async () => {
        try {
          const body = raw ? JSON.parse(raw) : {};
          const reqMock = { method: 'POST', body };
          const resMock = {
            status(code) {
              res.statusCode = code;
              return this;
            },
            setHeader(k, v) {
              res.setHeader(k, v);
              return this;
            },
            json(data) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            },
          };

          const { default: handler } = await import('./api/analyze-issue.js');
          await handler(reqMock, resMock);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
        }
      });
      return;
    }

    if (url.pathname === '/api/geocode') {
      try {
        const query = Object.fromEntries(url.searchParams.entries());
        const reqMock = { method: 'GET', query };
        const resMock = {
          status(code) {
            res.statusCode = code;
            return this;
          },
          setHeader(k, v) {
            res.setHeader(k, v);
            return this;
          },
          json(data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          },
        };

        const { default: handler } = await import('./api/geocode.js');
        await handler(reqMock, resMock);
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err?.message || 'Geocoding Error' }));
      }
      return;
    }

    next();
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env for local serverless handlers
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';

  return {
    plugins: [
      react(),
      tailwindcss(),
      createViteApiPlugin(),
    ],
  };
});