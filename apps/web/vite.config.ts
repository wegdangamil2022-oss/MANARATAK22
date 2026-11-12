import tailwindcss from '@tailwindcss/vite';
import { cmsAppEntryPlugin } from './config/CmsAppEntryPlugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig, Plugin } from 'vite';
import { frontendSecurityHeadersPlugin } from '../frontend-security/ViteFrontendSecurityHeaders';

const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

function disableHmrPlugin(): Plugin {
  return {
    name: 'disable-hmr-plugin',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        if (process.env.DISABLE_HMR === 'true') {
          return html.replace(/<script type="module" src="\/@vite\/client"><\/script>/g, '');
        }
        return html;
      }
    }
  };
}

function expressApiPlugin(): Plugin {
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?'))) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ data: [], success: true }));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  const rootDir = path.resolve(__dirname, '../..');
  const disableHmr = process.env.DISABLE_HMR === 'true';
  process.env.CI = 'true';
  process.env.VITE_PUBLIC_TEMPLATE_DATA_MODE = 'prototype';
  return {
    root: __dirname,
    envDir: __dirname,
    define: {
      'import.meta.env.VITE_PUBLIC_TEMPLATE_DATA_MODE': JSON.stringify('prototype'),
      '__MANARATAK_PROTOTYPE_DATA_ENABLED__': 'true',
    },
    plugins: [
      frontendSecurityHeadersPlugin(),
      react(),
      tailwindcss(),
      cmsAppEntryPlugin(),
      expressApiPlugin(),
      disableHmrPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@manaratak/shared': path.resolve(rootDir, 'packages/shared/src/index.ts'),
        '@manaratak/types': path.resolve(rootDir, 'packages/types/src/index.ts'),
        '@manaratak/ui': path.resolve(rootDir, 'packages/ui/src/index.tsx'),
      },
    },
    build: {
      sourcemap: false,
      minify: false,
    },
    server: {
      hmr: disableHmr ? false : undefined,
      port: 3000,
      host: '0.0.0.0',
      watch: {
        ignored: ['**/tmp/**', '**/*.log', '**/dist/**']
      }
    },
  };
});
