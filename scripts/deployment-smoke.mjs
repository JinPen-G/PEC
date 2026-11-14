/** Isolated real-HTTP smoke with synthetic accounts; systemd/SSH/TLS are not simulated acceptance. */
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { packageRelease } from './release.mjs';
import { deployRelease } from './deploy.mjs';
import { readDeploymentConfig, readJson, writeJson } from './deployment-config.mjs';
import { createNativeStore } from '../packages/project-core/src/platform/store.js';
import { DATABASE_SCHEMA } from '../packages/project-core/src/platform/schema.js';
const run = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const workspace = await fs.mkdtemp(path.join(tmpdir(), 'preview-deployment-'));
async function cleanupFixture() {
  const resolvedWorkspace = await fs.realpath(workspace);
  const resolvedTemporaryRoot = await fs.realpath(tmpdir());
  if (
    path.dirname(resolvedWorkspace) !== resolvedTemporaryRoot ||
    !path.basename(resolvedWorkspace).startsWith('preview-deployment-')
  )
    throw new Error('冒烟目录越界，拒绝清理');
  await fs.rm(resolvedWorkspace, { recursive: true, force: true });
}
const installRoot = path.join(workspace, 'install');
const storageRoot = path.join(workspace, 'storage');
const buildRoot = path.join(workspace, 'web');
const contentRoot = path.join(workspace, 'content');
const runtimeRoot = path.join(workspace, 'runtime');
const destination = path.join(workspace, 'packages');
for (const directory of [
  installRoot,
  storageRoot,
  buildRoot,
  destination,
  path.join(contentRoot, 'smoke-project'),
])
  await fs.mkdir(directory, { recursive: true });
await fs.cp(path.join(root, 'output/runtime'), runtimeRoot, { recursive: true });
await fs.writeFile(
  path.join(buildRoot, 'index.html'),
  '<!doctype html><html><title>Smoke one</title></html>',
);
await fs.mkdir(path.join(buildRoot, 'brand'));
await fs.writeFile(
  path.join(buildRoot, 'brand/platform-icon.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg"/>',
);
await fs.writeFile(
  path.join(contentRoot, 'smoke-project/manifest.json'),
  JSON.stringify({
    schemaVersion: 1,
    contentKey: 'smoke-project',
    moduleKey: 'empty',
    title: 'Synthetic project',
    overview: 'overview.md',
    requirements: [],
    assets: [],
  }),
);
await fs.writeFile(
  path.join(contentRoot, 'smoke-project/overview.md'),
  '# Synthetic overview\nVersion one\n',
);
const socket = createServer();
await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve));
const port = socket.address().port;
await new Promise((resolve) => socket.close(resolve));
const configFile = path.join(workspace, 'deploy.json');
await writeJson(configFile, {
  schemaVersion: 1,
  installRoot,
  storageRoot,
  publicOrigin: `http://127.0.0.1:${port}`,
  port,
  service: 'preview.service',
  node: process.execPath,
});
const config = await readDeploymentConfig(configFile);
const store = createNativeStore({ dataDirectory: config.dataRoot });
store.bootstrap({
  username: 'smoke-admin',
  displayName: 'Before migration',
  password: 'smoke-fixture-password',
});
store.close();
const databaseFile = path.join(config.dataRoot, 'platform.sqlite');
function withDatabase(callback) {
  const database = new DatabaseSync(databaseFile);
  try {
    return callback(database);
  } finally {
    database.close();
  }
}
withDatabase((database) =>
  database.exec(
    'DROP TABLE page_grants; DROP TABLE context_token_scopes; DROP TABLE context_tokens; PRAGMA user_version=1;',
  ),
);
let child = null;
const service = async (action) => {
  if (action === 'stop') {
    if (child && child.exitCode === null && child.signalCode === null) {
      const active = child;
      child = null;
      await new Promise((resolve) => {
        active.once('exit', resolve);
        active.kill('SIGTERM');
      });
    }
    return;
  }
  const transaction = await readJson(path.join(config.stateRoot, 'transaction.json'));
  const current = await readJson(path.join(config.releaseRoot, 'current.json'));
  const releaseId = transaction?.candidateReady ? transaction.releaseId : current?.releaseId;
  const directory = path.join(config.releaseRoot, releaseId);
  child = spawn(process.execPath, [path.join(directory, 'runtime/server.mjs')], {
    env: {
      ...process.env,
      PREVIEW_HOST: '127.0.0.1',
      PREVIEW_PORT: String(port),
      PREVIEW_PUBLIC_ORIGIN: config.publicOrigin,
      PREVIEW_DATA_ROOT: config.dataRoot,
      PREVIEW_STATIC_ROOT: path.join(directory, 'web'),
      PREVIEW_CONTENT_ROOT: path.join(directory, 'project-content'),
      PREVIEW_RELEASE_ROOT: config.releaseRoot,
      PREVIEW_RELEASE_ID: releaseId,
    },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  child.stderr.on('data', (bytes) => {
    void fs.appendFile(path.join(workspace, 'runtime.log'), bytes);
  });
};
const checks = [];
async function makeRelease(commit) {
  const release = await packageRelease({
    buildRoot,
    contentRoot,
    runtimeRoot,
    destination,
    commit: commit.repeat(40),
    uiCommit: 'b'.repeat(40),
  });
  const archive = path.join(workspace, `${release.manifest.releaseId}.tar.gz`);
  await run('tar', ['-czf', archive, '-C', destination, release.manifest.releaseId]);
  return { ...release, archive };
}
try {
  const first = await makeRelease('a');
  await deployRelease({ config, archive: first.archive, sequence: 10, service, healthTimeout: 10000 });
  assert.equal(
    withDatabase((database) => database.prepare('PRAGMA user_version').get().user_version),
    DATABASE_SCHEMA,
  );
  assert.equal(
    withDatabase((database) => database.prepare('SELECT display_name FROM accounts').get().display_name),
    'Before migration',
  );
  assert.ok(
    withDatabase((database) =>
      database
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='context_token_scopes'")
        .get(),
    ),
  );
  checks.push(`first deploy migrates schema 1 to ${DATABASE_SCHEMA} and preserves synthetic account`);
  assert.equal((await fetch(`${config.publicOrigin}/brand/platform-icon.svg`)).status, 200);
  assert.equal((await fetch(`${config.publicOrigin}/auth-assets/marcus-johnson.svg`)).status, 404);
  assert.equal((await fetch(`${config.publicOrigin}/auth-assets/undeclared.svg`)).status, 404);
  assert.equal(
    (await (await fetch(`${config.publicOrigin}/api/native/health`)).json()).releaseId,
    first.manifest.releaseId,
  );
  for (const url of ['/runtime/server.mjs', '/project-content/smoke-project/overview.md', '/manifest.json'])
    assert.equal((await fetch(config.publicOrigin + url)).status, 404);
  checks.push('real bundled API serves matching release and rejects direct private paths');
  await fs.writeFile(
    path.join(contentRoot, 'smoke-project/overview.md'),
    '# Synthetic overview\nVersion two\n',
  );
  await fs.appendFile(path.join(runtimeRoot, 'server.mjs'), '\n');
  const second = await makeRelease('c');
  await deployRelease({ config, archive: second.archive, sequence: 12, service, healthTimeout: 10000 });
  assert.equal(
    (await (await fetch(`${config.publicOrigin}/api/native/health`)).json()).releaseId,
    second.manifest.releaseId,
  );
  assert.match(
    await fs.readFile(
      path.join(config.releaseRoot, second.manifest.releaseId, 'project-content/smoke-project/overview.md'),
      'utf8',
    ),
    /Version two/,
  );
  checks.push('API and business content upgrade together');
  await assert.rejects(
    deployRelease({ config, archive: first.archive, sequence: 11, service }),
    /旧发布任务/,
  );
  checks.push('stale deployment cannot change active version');
  withDatabase((database) => database.exec("UPDATE accounts SET display_name='Keep after rollback'"));
  await deployRelease({ config, rollback: true, service, healthTimeout: 10000 });
  assert.equal(
    withDatabase((database) => database.prepare('SELECT display_name FROM accounts').get().display_name),
    'Keep after rollback',
  );
  checks.push('compatible code/content rollback retains current account data');
  withDatabase((database) => database.exec(`PRAGMA user_version=${DATABASE_SCHEMA + 1};`));
  await assert.rejects(deployRelease({ config, rollback: true, service }), /不兼容/);
  withDatabase((database) => database.exec(`PRAGMA user_version=${DATABASE_SCHEMA};`));
  await fs.writeFile(path.join(buildRoot, 'index.html'), '<title>Broken candidate readiness</title>');
  const broken = await makeRelease('d');
  const failingService = async (action) => {
    await service(action);
    if (
      action === 'start' &&
      (await readJson(path.join(config.stateRoot, 'transaction.json')))?.candidateReady
    )
      withDatabase((database) => database.exec("UPDATE accounts SET display_name='Candidate mutation'"));
  };
  await assert.rejects(
    deployRelease({
      config,
      archive: broken.archive,
      sequence: 20,
      service: failingService,
      healthTimeout: 2500,
    }),
    /健康检查/,
  );
  assert.equal(
    (await readJson(path.join(config.releaseRoot, 'current.json'))).releaseId,
    first.manifest.releaseId,
  );
  assert.equal(
    withDatabase((database) => database.prepare('SELECT display_name FROM accounts').get().display_name),
    'Keep after rollback',
  );
  assert.equal(await fs.stat(path.join(config.stateRoot, 'maintenance')).catch(() => null), null);
  checks.push('failed candidate health restores stopped backup and restarts prior API');
  await fs.appendFile(path.join(destination, broken.manifest.releaseId, 'runtime/server.mjs'), 'corrupt');
  const corruptArchive = path.join(workspace, 'corrupt.tar.gz');
  await run('tar', ['-czf', corruptArchive, '-C', destination, broken.manifest.releaseId]);
  await assert.rejects(deployRelease({ config, archive: corruptArchive, sequence: 30, service }), /散列/);
  checks.push('corrupt runtime archive rejected before service stop');
  const backups = (await fs.readdir(config.backupRoot)).filter((name) => name.endsWith('.sqlite'));
  await service('stop');
  const backupName = backups[0];
  const expected = (() => {
    const database = new DatabaseSync(path.join(config.backupRoot, backupName));
    try {
      return database.prepare('SELECT display_name FROM accounts').get().display_name;
    } finally {
      database.close();
    }
  })();
  withDatabase((database) => database.exec("UPDATE accounts SET display_name='Interrupted migration'"));
  await writeJson(path.join(config.stateRoot, 'transaction.json'), {
    id: 'smoke-interrupted',
    releaseId: broken.manifest.releaseId,
    sequence: 99,
    backup: backupName,
    databaseMayChange: true,
    candidateReady: true,
  });
  await deployRelease({ config, recover: true, service, healthTimeout: 10000 });
  assert.equal(
    withDatabase((database) => database.prepare('SELECT display_name FROM accounts').get().display_name),
    expected,
  );
  checks.push('interrupted deployment journal recovers prior release and backup');
  const status = await run(process.execPath, [
    path.join(root, 'output/tools/deploy.mjs'),
    'status',
    '--config',
    configFile,
  ]);
  assert.equal(JSON.parse(status.stdout).current.releaseId, first.manifest.releaseId);
  checks.push('installed standalone deployment tool works without repository dependencies');
  await fs.writeFile(
    path.join(workspace, 'result.json'),
    JSON.stringify(
      {
        status: 'passed',
        checks,
        scope: 'synthetic SQLite, actual bundled API and tar; systemd/SSH/nginx/TLS not exercised',
      },
      null,
      2,
    ),
  );
} finally {
  await service('stop');
  await cleanupFixture();
}
console.log(`Deployment smoke passed (${checks.length} checks); temporary fixtures removed.`);
