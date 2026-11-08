/** Stable systemd launcher pins API, web and content to one verified release. */
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import path from 'node:path';
import process from 'node:process';
import { readDeploymentConfig, prepareDeploymentPaths, readJson, RELEASE_ID } from './deployment-config.mjs';
import { verifyRelease } from './release.mjs';
const position = process.argv.indexOf('--config');
const config = await readDeploymentConfig(
  position < 0 ? '/etc/preview/deploy.json' : process.argv[position + 1],
);
await prepareDeploymentPaths(config);
const transaction = await readJson(path.join(config.stateRoot, 'transaction.json'));
const current = await readJson(path.join(config.releaseRoot, 'current.json'));
const releaseId = transaction?.candidateReady ? transaction.releaseId : current?.releaseId;
if (!RELEASE_ID.test(releaseId || '')) throw new Error('没有可启动的完整发行版本');
const directory = path.join(config.releaseRoot, releaseId);
const manifest = await verifyRelease(directory);
if (manifest.schemaVersion !== 3 || manifest.releaseId !== releaseId) throw new Error('服务只启动完整发行');
const child = spawn(config.node, [path.join(directory, 'runtime/server.mjs')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PREVIEW_HOST: '127.0.0.1',
    PREVIEW_PORT: String(config.port),
    PREVIEW_PUBLIC_ORIGIN: config.publicOrigin,
    PREVIEW_DATA_ROOT: config.dataRoot,
    PREVIEW_STATIC_ROOT: path.join(directory, 'web'),
    PREVIEW_CONTENT_ROOT: path.join(directory, 'project-content'),
    PREVIEW_RELEASE_ROOT: config.releaseRoot,
    PREVIEW_RELEASE_ID: releaseId,
  },
});
let failedReadiness = false;
child.on('error', () => {
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.exitCode = failedReadiness ? 1 : (code ?? (signal === 'SIGTERM' ? 0 : 1));
});
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
if (!transaction) {
  let ready = false;
  for (let attempt = 0; attempt < 60 && child.exitCode === null; attempt++) {
    try {
      const response = await fetch(config.healthUrl, { signal: AbortSignal.timeout(1000) });
      const health = response.ok ? await response.json() : null;
      if (health?.releaseId === releaseId && health.status === 'ok') {
        ready = true;
        break;
      }
    } catch {
      /* Keep maintenance until the pinned process is ready. */
    }
    await delay(500);
  }
  if (ready)
    await fs.unlink(path.join(config.stateRoot, 'maintenance')).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  else {
    failedReadiness = true;
    child.kill('SIGTERM');
  }
}
