/** One native platform process, independent storage and controlled static build. */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import { createNativeServer } from '../../packages/platform-server/src/server.js';
const root = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const value = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const host = value('--host', process.env.PREVIEW_HOST || '127.0.0.1'),
  port = Number(value('--port', process.env.PREVIEW_PORT || '5190'));
const origin = value('--origin', process.env.PREVIEW_PUBLIC_ORIGIN || `http://${host}:${port}`);
const runtime = createNativeServer({
  dataDirectory: path.resolve(
    value('--data', process.env.PREVIEW_DATA_ROOT || path.join(root, '.preview-data')),
  ),
  staticRoot: args.includes('--api-only')
    ? null
    : process.env.PREVIEW_STATIC_ROOT || path.join(root, 'output/web'),
  releaseRoot: args.includes('--releases') ? path.resolve(value('--releases')) : undefined,
  retainedReleaseRoot: process.env.PREVIEW_RELEASE_ROOT,
  releaseId: process.env.PREVIEW_RELEASE_ID,
  contentRoot: process.env.PREVIEW_CONTENT_ROOT || path.join(root, 'project-content'),
  pageSourceRoot: args.includes('--api-only') ? root : undefined,
  publicOrigin: origin,
  allowBootstrap: args.includes('--bootstrap'),
});
runtime.server.listen(port, host, () => console.log(`Preview native platform: ${origin}`));
runtime.server.on('error', (error) => {
  console.error(`平台服务无法启动：${error.code ?? 'SERVER_ERROR'}`);
  runtime.store.close();
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    void runtime.close().then(() => process.exit(0));
  });
