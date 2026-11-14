// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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

test.each([
  ['unused.js', 'navigator.clipboard.writeText("npx arc add icon-morph")'],
  ['unused.css', '.retired-showcase { color: black; }'],
  ['renamed.css', '.external-showcase[data-theme="dark"] { color: white; }'],
  ['unused.json', '{"title":"Northwind redesign"}'],
  ['unused.html', '<h1>Fieldwork 2.0 keynote</h1>'],
  ['unused.svg', '<svg><text>Franklin Field</text></svg>'],
  ['unused-avatar.js', 'export const avatar="/auth-assets/marcus-johnson.svg"'],
])('packaging rejects unreferenced retired content in %s before copying a release', async (name, content) => {
  const { buildRoot, destination } = await fixture();
  const before = await fs.readdir(destination);
  await fs.writeFile(path.join(buildRoot, 'assets', name), content);
  await expect(
    packageRelease({ buildRoot, destination, commit: 'c'.repeat(40), uiCommit: 'b'.repeat(40) }),
  ).rejects.toThrow('已退役的原站内容');
  expect(await fs.readdir(destination)).toEqual(before);
});

test('retired content is rejected even when a historical package has consistent file hashes and identity', async () => {
  const { destination, first } = await fixture();
  const bytes = Buffer.from('export const copy="npx arc add icon-morph";');
  await fs.writeFile(path.join(first.release, 'web/assets/app.js'), bytes);
  const hash = (value) => createHash('sha256').update(value).digest('hex');
  const record = first.manifest.files.find((item) => item.path === 'assets/app.js');
  record.bytes = bytes.length;
  record.sha256 = hash(bytes);
  first.manifest.releaseId = `${first.manifest.commit.slice(0, 12)}-${hash(
    JSON.stringify({ records: first.manifest.files, contentRecords: [], runtimeFiles: [] }),
  ).slice(0, 12)}`;
  await fs.writeFile(path.join(first.release, 'manifest.json'), JSON.stringify(first.manifest));
  const candidate = path.join(destination, first.manifest.releaseId);
  await fs.rename(first.release, candidate);
  await expect(verifyRelease(candidate)).rejects.toThrow('已退役的原站内容');
  await expect(activateRelease({ releaseRoot: destination, candidate })).rejects.toThrow('已退役的原站内容');
  await expect(fs.access(path.join(destination, 'current.json'))).rejects.toMatchObject({ code: 'ENOENT' });
});

test('component attribution and third-party notices remain in verified releases', async () => {
  const { buildRoot, destination } = await fixture();
  const attribution = '/* MIT License, Copyright (c) 2026 Elia Kuratli */ export const name = "Preview";';
  const notices = 'Third-party source and license record; former scope: retired-showcase';
  await fs.writeFile(path.join(buildRoot, 'assets/app.js'), attribution);
  await fs.writeFile(path.join(buildRoot, 'assets/third-party-notices.txt'), notices);
  const result = await packageRelease({
    buildRoot,
    destination,
    commit: 'c'.repeat(40),
    uiCommit: 'b'.repeat(40),
  });
  await expect(verifyRelease(result.release)).resolves.toMatchObject({
    releaseId: result.manifest.releaseId,
  });
  expect(await fs.readFile(path.join(result.release, 'web/assets/app.js'), 'utf8')).toBe(attribution);
  expect(await fs.readFile(path.join(result.release, 'web/assets/third-party-notices.txt'), 'utf8')).toBe(
    notices,
  );
});

test('the retired avatar regression fixture cannot be repackaged under a new name and returns GET/HEAD 404', async () => {
  const { root, buildRoot, destination } = await fixture();
  const archived = await fs.readFile(new URL('../fixtures/retired-avatar.svg', import.meta.url));
  expect(createHash('sha256').update(archived).digest('hex')).toBe(
    'ae475ae4ee792bc8b9ed0ac93dbebbd4ca928f723d536c31d190182b710c5d90',
  );
  await expect(fs.access('apps/web/public/auth-assets/marcus-johnson.svg')).rejects.toMatchObject({
    code: 'ENOENT',
  });
  await fs.writeFile(path.join(buildRoot, 'assets/renamed-avatar.svg'), archived);
  await expect(
    packageRelease({ buildRoot, destination, commit: 'c'.repeat(40), uiCommit: 'b'.repeat(40) }),
  ).rejects.toThrow('已退役的原站内容');
  await fs.mkdir(path.join(buildRoot, 'auth-assets'));
  await fs.writeFile(path.join(buildRoot, 'auth-assets/marcus-johnson.svg'), archived);
  const runtime = createNativeServer({ dataDirectory: path.join(root, 'api-data'), staticRoot: buildRoot });
  await new Promise((resolve) => runtime.server.listen(0, '127.0.0.1', resolve));
  try {
    for (const resource of ['auth-assets/marcus-johnson.svg', 'assets/renamed-avatar.svg']) {
      for (const method of ['GET', 'HEAD']) {
        const response = await fetch(`http://127.0.0.1:${runtime.server.address().port}/${resource}`, {
          method,
        });
        expect(response.status).toBe(404);
        expect(response.headers.get('cache-control')).toBe('no-store');
        if (method === 'HEAD') expect(await response.text()).toBe('');
      }
    }
  } finally {
    await runtime.close();
  }
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

test.each(['pointer', 'static'])(
  'clean historical lazy assets remain available and retired ones return GET/HEAD 404 (%s)',
  async (mode) => {
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
    // Represent files already present in releases created before the content gate.
    for (const [release, filename, content] of [
      [first.release, 'retired-old.js', 'export const copy="npx arc add icon-morph";'],
      [second.release, 'retired-previous.css', '.retired-showcase { color: red; }'],
      [third.release, 'retired-active.js', 'export const title="Northwind redesign";'],
    ])
      await fs.writeFile(path.join(release, 'web/assets', filename), content);
    const runtime = createNativeServer({
      dataDirectory: path.join(root, 'api-data'),
      sources: { sample: { root: buildRoot, label: 'Fixture' } },
      ...(mode === 'pointer'
        ? { releaseRoot: destination }
        : { staticRoot: path.join(third.release, 'web'), retainedReleaseRoot: destination }),
    });
    await new Promise((resolve) => runtime.server.listen(0, '127.0.0.1', resolve));
    try {
      const base = `http://127.0.0.1:${runtime.server.address().port}`;
      for (const [filename, version] of [
        ['app.js', 1],
        ['app-two.js', 2],
        ['app-three.js', 3],
      ]) {
        for (const method of ['GET', 'HEAD']) {
          const response = await fetch(`${base}/assets/${filename}`, { method });
          expect(response.status).toBe(200);
          expect(response.headers.get('content-type')).toContain('text/javascript');
          expect(response.headers.get('cache-control')).toBe('no-store');
          expect(await response.text()).toBe(method === 'HEAD' ? '' : `export const version=${version};`);
        }
      }
      for (const filename of ['retired-old.js', 'retired-previous.css', 'retired-active.js']) {
        for (const method of ['GET', 'HEAD']) {
          const response = await fetch(`${base}/assets/${filename}`, { method });
          expect(response.status).toBe(404);
          expect(response.headers.get('cache-control')).toBe('no-store');
          if (method === 'HEAD') expect(await response.text()).toBe('');
          else expect(await response.json()).toMatchObject({ code: 'NOT_FOUND' });
        }
      }
    } finally {
      await runtime.close();
    }
  },
);
