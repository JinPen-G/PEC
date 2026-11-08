import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { motionPreferenceAdapter } from './plugins/motion-preference-plugin.js';

export default defineConfig({
  plugins: [react(), motionPreferenceAdapter()],
  css: { postcss: { plugins: [] } },
  resolve: {
    alias: {
      '@preview/ui/admin': fileURLToPath(new URL('./packages/preview-ui/src/admin.tsx', import.meta.url)),
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
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.js'],
    include: ['./tests/unit/**/*.spec.js', './apps/web/src/**/*.test.ts', './apps/web/src/**/*.test.tsx'],
    clearMocks: true,
    restoreMocks: true,
  },
});
