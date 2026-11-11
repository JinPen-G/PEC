import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nativeSidebarStyles } from './plugins/sidebar-styles.js';
import { motionPreferenceAdapter, motionPreferenceStyles } from './plugins/motion-preference-plugin.js';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

import { manualChunks } from './apps/web/vite-chunks.js';
import { nativeVersionPlugin } from './plugins/version-plugin.js';
import { showcaseBuildPlugin, protectedLibraryChunk } from './plugins/showcase-build-plugin.js';

const appRoot = fileURLToPath(new URL('./apps/web/', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('./', import.meta.url));

// Core/UI builds isolate the framework; native builds include registered React pages.
export default defineConfig(({ mode }) => {
  const core = mode === 'core';
  // UI review needs no project files, host settings or legacy management APIs.
  const ui = mode === 'ui';
  if (mode === 'legacy') throw new Error('HTML 挂载模式已移除，请使用 npm run dev');
  const native = !ui && !core;
  return {
    root: appRoot,
    envDir: false,
    base: '/',
    css: { postcss: { plugins: [nativeSidebarStyles(), motionPreferenceStyles()] } },
    plugins: [
      tailwindcss(),
      react(),
      motionPreferenceAdapter(),
      ...(native ? [nativeVersionPlugin(repositoryRoot), showcaseBuildPlugin(repositoryRoot)] : []),
    ],
    resolve: {
      alias: {
        '@preview/library': fileURLToPath(new URL('./packages/component-library/src/', import.meta.url)),
        '@preview/ui/admin': fileURLToPath(new URL('./packages/preview-ui/src/admin.tsx', import.meta.url)),
        '@preview/ui/rest-player': fileURLToPath(new URL('./packages/preview-ui/src/rest-player.ts', import.meta.url)),
        '@preview/ui/loading': fileURLToPath(
          new URL('./packages/preview-ui/src/LoadingState.tsx', import.meta.url),
        ),
        '@/registry': fileURLToPath(
          new URL(
            './packages/preview-ui/upstream/rental-admin/packages/ui-arc/vendor/registry/',
            import.meta.url,
          ),
        ),
        '@/registry/components/button/button': fileURLToPath(
          new URL(
            './packages/preview-ui/upstream/rental-admin/packages/ui-arc/vendor/registry/components/button/button.tsx',
            import.meta.url,
          ),
        ),
        '@preview/ui': fileURLToPath(new URL('./packages/preview-ui/src/index.ts', import.meta.url)),
        '@/lib/motion-tokens': fileURLToPath(
          new URL(
            './packages/preview-ui/upstream/rental-admin/packages/ui-arc/vendor/lib/motion-tokens.ts',
            import.meta.url,
          ),
        ),
        '@': fileURLToPath(new URL('./apps/web/src/', import.meta.url)),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5188,
      strictPort: true,
      fs: { allow: [repositoryRoot] },
      ...(native
        ? {
            proxy: {
              '/api/native': { target: 'http://127.0.0.1:5190', changeOrigin: false },
              '/r/': { target: 'http://127.0.0.1:5190', changeOrigin: false },
              '/api/project-context': { target: 'http://127.0.0.1:5190', changeOrigin: false },
            },
          }
        : {}),
    },
    build: {
      outDir: fileURLToPath(
        new URL(
          native ? './output/web/' : ui ? './output/ui/' : core ? './output/core/' : './dist/',
          import.meta.url,
        ),
      ),
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Page chunks contain only explicitly assigned project modules. Shared
          // locale/UI dependencies must never migrate into a protected chunk.
          onlyExplicitManualChunks: true,
          manualChunks: (id) => {
            const normalized = id.replaceAll('\\', '/');
            const libraryChunk = protectedLibraryChunk(normalized);
            if (libraryChunk) return libraryChunk;
            const page = /\/project-modules\/([^/]+)\/([^/]+)\//.exec(normalized);
            if (page) return `page-${page[1]}-${page[2]}`;
            const project = /\/project-modules\/([^/]+)\//.exec(normalized);
            return project ? `page-${project[1]}-shared` : manualChunks(id);
          },
          chunkFileNames: (chunk) =>
            chunk.name.startsWith('page-') ? 'page-assets/[name]-[hash].js' : 'assets/[name]-[hash].js',
          entryFileNames: (chunk) =>
            chunk.name.startsWith('page-') ? 'page-assets/[name]-[hash].js' : 'assets/[name]-[hash].js',
          assetFileNames: (asset) =>
            asset.names?.some((name) => name.startsWith('page-'))
              ? 'page-assets/[name]-[hash][extname]'
              : 'assets/[name]-[hash][extname]',
        },
      },
    },
  };
});
