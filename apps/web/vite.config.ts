import tailwindcss from '@tailwindcss/vite';
import { cmsAppEntryPlugin } from './config/CmsAppEntryPlugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig, Plugin } from 'vite';
import { frontendSecurityHeadersPlugin } from '../frontend-security/ViteFrontendSecurityHeaders';
import { assertPublicBuildDataMode, prototypeCapabilityEnabled } from './src/config/PublicDataModePolicy';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function disableHmrPlugin(): Plugin {
  return {
    name: 'disable-hmr-plugin',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        if (process.env.DISABLE_HMR === 'true') {
          return html.replace(/<script type="module" src="(?:\/admin)?\/@vite\/client"><\/script>/g, '');
        }
        return html;
      }
    }
  };
}

function expressApiPlugin(): Plugin {
  let cachedApp: any = null;
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.httpServer?.on('close', async () => {
        try {
          const workerModule = await server.ssrLoadModule(path.resolve(__dirname, '../api/src/infrastructure/workers/PollingWorkerRuntime.ts'));
          await workerModule.stopPollingWorkers?.();
        } catch {
          // Ignore cleanup errors on server shutdown
        }
      });
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/admin') {
          res.writeHead(301, { Location: '/admin/' });
          res.end();
          return;
        }
        if (req.url && (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?'))) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ data: [], success: true }));
          return;
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const rootDir = path.resolve(__dirname, '../..');
  const disableHmr = process.env.DISABLE_HMR === 'true';
  process.env.CI = 'true';
  process.env.PRISMA_TELEMETRY_DISABLED = '1';
  process.env.VITE_PUBLIC_TEMPLATE_DATA_MODE = 'prototype';
  return {
    root: __dirname,
    envDir: __dirname,
    define: {
      'import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE': JSON.stringify('prototype'),
      '__MANARATAK_PROTOTYPE_DATA_ENABLED__': 'true',
    },
    plugins: [frontendSecurityHeadersPlugin(), react(), tailwindcss(), cmsAppEntryPlugin(),
      expressApiPlugin(), disableHmrPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@manaratak/application': path.resolve(rootDir, 'packages/application/src/index.ts'),
        '@manaratak/config': path.resolve(rootDir, 'packages/config/src/index.ts'),
        '@manaratak/core': path.resolve(rootDir, 'packages/core/src/index.ts'),
        '@manaratak/domain': path.resolve(rootDir, 'packages/domain/src/index.ts'),
        '@manaratak/infrastructure': path.resolve(rootDir, 'packages/infrastructure/src/index.ts'),
        '@manaratak/shared': path.resolve(rootDir, 'packages/shared/src/index.ts'),
        '@manaratak/types': path.resolve(rootDir, 'packages/types/src/index.ts'),
        '@manaratak/ui': path.resolve(rootDir, 'packages/ui/src/index.tsx'),
      },
    },
    build: {
      sourcemap: false,
      minify: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('admin-preview')) {
              return 'admin-preview-data';
            }
          }
        }
      }
    },
    server: {
      proxy: {
        '/mailpit': {
          target: 'http://127.0.0.1:8025',
          changeOrigin: true,
          ws: true,
        },
        '/admin': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          ws: !disableHmr,
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res) => {
              if (res && 'writeHead' in res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'text/plain' });
                res.end('Admin Service Unavailable');
              }
            });
          },
        },
        '/study-destinations': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          ws: !disableHmr,
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res) => {
              if (res && 'writeHead' in res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'text/plain' });
                res.end('Service Unavailable');
              }
            });
          },
        },
        '/academic-taxonomy': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          ws: !disableHmr,
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res) => {
              if (res && 'writeHead' in res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'text/plain' });
                res.end('Service Unavailable');
              }
            });
          },
        },
      },
      hmr: disableHmr ? false : undefined,
      port: 3000,
      host: '0.0.0.0',
      watch: {
        ignored: ['**/tmp/**', '**/*.log', '**/dist/**', '**/.prisma/**']
      }
    },
    ssr: {
      external: ['@prisma/client', 'bcrypt', 'jsonwebtoken']
    }
  };
});
