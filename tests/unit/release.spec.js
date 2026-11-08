// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { packageRelease, verifyRelease, activateRelease } from '../../scripts/release.mjs';
import { createNativeStore } from '../../packages/project-core/src/platform/store.js';
import { createNativeServer } from '../../packages/platform-server/src/server.js';

const directories = [];
afterEach(async () => {
  for (const directory of directories.splice(0)) {
    if (path.dirname(directory) !== tmpdir() || !path.basename(directory).startsWith('preview-release-test-'))
      throw new Error('Invalid fixture root');
    await fs.rm(directory, { recursive: true, force: true });
  }
});
async function fixture() {
  const root = await fs.mkdtemp(path.join(tmpdir(), 'preview-release-test-'));
  directories.push(root);
  const buildRoot = path.join(root, 'build'),
    destination = path.join(root, 'releases');
  await fs.mkdir(buildRoot);
  await fs.mkdir(destination);
  await fs.mkdir(path.join(buildRoot, 'assets'));
  await fs.writeFile(path.join(buildRoot, 'index.html'), '<title>version 1</title>');
  await fs.writeFile(path.join(buildRoot, 'assets/app.js'), 'export const version=1;');
  const first = await packageRelease({
    buildRoot,
    destination,
    commit: 'a'.repeat(40),
    uiCommit: 'b'.repeat(40),
  });
  return { root, buildRoot, destination, first };
}
test('verified activation, consecutive stale job rejection and compatible rollback preserve private data', async () => {
  const { root, buildRoot, destination, first } = await fixture();
  const privateFile = path.join(root, 'platform.sqlite');
  await fs.writeFile(privateFile, 'preserve-private-database');
  await activateRelease({ releaseRoot: destination, candidate: first.release, sequence: 10 });
  await fs.writeFile(path.join(buildRoot, 'assets/app.js'), 'export const version=2;');
  const second = await packageRelease({
    buildRoot,
    destination,
    commit: 'c'.repeat(40),
    uiCommit: 'b'.repeat(40),
  });
  await activateRelease({ releaseRoot: destination, candidate: second.release, sequence: 12 });
  await expect(
    activateRelease({ releaseRoot: destination, candidate: first.release, sequence: 11 }),
  ).rejects.toThrow('旧发布任务');
  expect(JSON.parse(await fs.readFile(path.join(destination, 'current.json'), 'utf8')).releaseId).toBe(
    second.manifest.releaseId,
  );
  await activateRelease({ releaseRoot: destination, candidate: first.release, rollback: true });
  expect(await fs.readFile(privateFile, 'utf8')).toBe('preserve-private-database');
});
test('corrupt/missing resource fails before pointer changes; private build paths are rejected', async () => {
  const { buildRoot, destination, first } = await fixture();
  await activateRelease({ releaseRoot: destination, candidate: first.release });
  const pointer = await fs.readFile(path.join(destination, 'current.json'), 'utf8');
  await fs.appendFile(path.join(first.release, 'web/assets/app.js'), 'corruption');
  await expect(verifyRelease(first.release)).rejects.toThrow('散列');
  await expect(activateRelease({ releaseRoot: destination, candidate: first.release })).rejects.toThrow(
    '散列',
  );
  expect(await fs.readFile(path.join(destination, 'current.json'), 'utf8')).toBe(pointer);
  await fs.writeFile(path.join(buildRoot, 'private.md'), 'secret');
  await expect(
    packageRelease({ buildRoot, destination, commit: 'a'.repeat(40), uiCommit: 'b'.repeat(40) }),
  ).rejects.toThrow('未允许');
});
test('online SQLite backup restores into an empty directory and refuses an existing database', async () => {
  const { root } = await fixture(),
    data = path.join(root, 'data'),
    restored = path.join(root, 'restored');
  const store = createNativeStore({ dataDirectory: data });
  store.bootstrap({ username: 'fixture-admin', displayName: 'Fixture', password: 'fixture-backup-password' });
  try {
    const command = path.resolve('scripts/backup.mjs');
    const backupFile = execFileSync(
      process.execPath,
      [command, 'backup', '--data', data, '--output', path.join(root, 'backups')],
      { encoding: 'utf8' },
    ).trim();
    execFileSync(process.execPath, [
      command,
      'restore',
      '--data',
      restored,
      '--backup',
      backupFile,
      '--service-stopped',
    ]);
    const recovered = createNativeStore({ dataDirectory: restored });
    try {
      expect(recovered.login('fixture-admin', 'fixture-backup-password').user.role).toBe('admin');
    } finally {
      recovered.close();
    }
    expect(() =>
      execFileSync(
        process.execPath,
        [command, 'restore', '--data', restored, '--backup', backupFile, '--service-stopped'],
        { stdio: 'pipe' },
      ),
    ).toThrow();
  } finally {
    store.close();
  }
});

test('retained lazy assets remain available across multiple frontend activations', async () => {
  const { root, buildRoot, destination, first } = await fixture();
  await activateRelease({ releaseRoot: destination, candidate: first.release });
  await fs.unlink(path.join(buildRoot, 'assets/app.js'));
  await fs.writeFile(path.join(buildRoot, 'assets/app-two.js'), 'export const version=2;');
  const second = await packageRelease({
    buildRoot,
    destination,
    commit: 'c'.repeat(40),
    uiCommit: 'b'.repeat(40),
  });
  await activateRelease({ releaseRoot: destination, candidate: second.release });
  await fs.unlink(path.join(buildRoot, 'assets/app-two.js'));
  await fs.writeFile(path.join(buildRoot, 'assets/app-three.js'), 'export const version=3;');
  const third = await packageRelease({
    buildRoot,
    destination,
    commit: 'd'.repeat(40),
    uiCommit: 'b'.repeat(40),
  });
  await activateRelease({ releaseRoot: destination, candidate: third.release });
  const runtime = createNativeServer({
    dataDirectory: path.join(root, 'api-data'),
    sources: { sample: { root: buildRoot, label: 'Fixture' } },
    releaseRoot: destination,
  });
  await new Promise((resolve) => runtime.server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${runtime.server.address().port}/assets/app.js`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('version=1');
  } finally {
    await runtime.close();
  }
});
