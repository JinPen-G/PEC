import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

import { htmlPrototypePlugin } from './plugins/html-prototype-plugin.js';
import { cleanDistPlugin } from './plugins/clean-dist-plugin.js';
import { deploymentVersionPlugin } from './plugins/deployment-version-plugin.js';
import { platformSettingsPlugin } from './plugins/platform-settings-plugin.js';
import { prdContentPlugin } from './plugins/prd-content-plugin.js';
import { projectPackagesPlugin } from './plugins/project-packages-plugin.js';
import { projectRoutesPlugin } from './plugins/project-routes-plugin.js';
import { loadProjectMounts } from './packages/project-core/src/index.js';
import { manualChunks } from './apps/platform-react/vite.chunks.js';

const appRoot = fileURLToPath(new URL('./apps/platform-react/', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('./', import.meta.url));
const projectsRoot = fileURLToPath(new URL('./projects/', import.meta.url));
const projectMountsPath = fileURLToPath(new URL('./project-mounts.local.json', import.meta.url));
const platformSettingsPath = fileURLToPath(new URL('./platform-settings.json', import.meta.url));
const loadMounts = () => loadProjectMounts(projectMountsPath);
const buildVersion = Date.now().toString(36);

export default defineConfig({
  root: appRoot,
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    cleanDistPlugin(),
    deploymentVersionPlugin({ version: buildVersion }),
    platformSettingsPlugin({ settingsPath: platformSettingsPath }),
    projectPackagesPlugin({ projectsRoot, mountsPath: projectMountsPath, loadMounts }),
    htmlPrototypePlugin({ projectsRoot, mountsPath: projectMountsPath, loadMounts, buildVersion }),
    prdContentPlugin({ projectsRoot, mountsPath: projectMountsPath, loadMounts }),
    projectRoutesPlugin({ projectRoot: repositoryRoot, loadMounts }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/platform-react/src/', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5188,
    strictPort: true,
    fs: { allow: [repositoryRoot] },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist/', import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      output: { manualChunks },
    },
  },
});
