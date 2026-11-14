// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { createNativeServer } from '../../packages/platform-server/src/server.js';
import { clientAddress } from '../../packages/platform-server/src/client-address.js';
import { checkStructure } from '../../scripts/check-structure.mjs';

const fixtures = [];
const password = 'fixture-pilot-password';

test('release worktrees allow Git metadata files while rejecting unrelated root files', async () => {
  const item = await fixture();
  await fs.writeFile(path.join(item.root, '.git'), 'gitdir: ../main/.git/worktrees/pilot\n');
  expect(checkStructure(item.root).errors).toEqual([]);
  await fs.writeFile(path.join(item.root, 'unapproved.txt'), 'fixture');
  expect(checkStructure(item.root).errors).toHaveLength(1);
  expect(checkStructure(item.root).errors[0]).toContain('unapproved.txt');
});
afterEach(async () => {
  for (const fixture of fixtures.splice(0)) {
    await fixture.runtime?.close();
    if (
      path.dirname(fixture.root) !== tmpdir() ||
      !path.basename(fixture.root).startsWith('preview-pilot-test-')
    )
      throw new Error('Unsafe pilot fixture');
    await fs.rm(fixture.root, { recursive: true, force: true });
  }
});
async function fixture(options = {}) {
  const root = await fs.mkdtemp(path.join(tmpdir(), 'preview-pilot-test-'));
  const item = { root, ...options };
  fixtures.push(item);
  return item;
}
async function start(item, options = {}) {
  item.runtime = createNativeServer({
    dataDirectory: path.join(item.root, 'data'),
    publicOrigin: 'http://pilot.example:8088',
    ...options,
  });
  await new Promise((resolve) => item.runtime.server.listen(0, '127.0.0.1', resolve));
  item.base = `http://127.0.0.1:${item.runtime.server.address().port}`;
  return item;
}

test('proxy client addresses require explicit trust, a loopback peer and one valid address', () => {
  const request = { socket: { remoteAddress: '127.0.0.1' }, headers: { 'x-forwarded-for': '198.51.100.10' } };
  expect(clientAddress(request)).toBe('127.0.0.1');
  expect(clientAddress(request, true)).toBe('198.51.100.10');
  expect(clientAddress({ ...request, socket: { remoteAddress: '203.0.113.2' } }, true)).toBe('203.0.113.2');
  for (const value of ['198.51.100.10, 198.51.100.11', 'unknown', ['198.51.100.10']])
    expect(clientAddress({ ...request, headers: { 'x-forwarded-for': value } }, true)).toBe('127.0.0.1');
});

test.each([true, false])(
  'login quotas separate only explicitly trusted proxy clients (%s)',
  async (trustLoopbackProxy) => {
    const item = await start(await fixture(), { trustLoopbackProxy });
    item.runtime.store.bootstrap({ username: 'pilot-admin', displayName: 'Pilot', password });
    async function login(address, suppliedPassword) {
      const response = await fetch(`${item.base}/api/native/login`, {
        method: 'POST',
        headers: {
          origin: 'http://pilot.example:8088',
          'content-type': 'application/json',
          'x-forwarded-for': address,
        },
        body: JSON.stringify({ username: 'pilot-admin', password: suppliedPassword }),
      });
      await response.arrayBuffer();
      return response.status;
    }
    for (let count = 0; count < 20; count++) expect(await login('198.51.100.10', 'incorrect')).toBe(401);
    expect(await login('198.51.100.10', password)).toBe(429);
    expect(await login('198.51.100.20', password)).toBe(trustLoopbackProxy ? 200 : 429);
  },
);

test('persistent media survives the release directory and serves only fixed URLs with byte ranges', async () => {
  const item = await fixture();
  const media = path.join(item.root, 'media');
  const web = path.join(item.root, 'web');
  await fs.mkdir(media);
  await fs.mkdir(web);
  await fs.writeFile(
    path.join(web, 'index.html'),
    '<html><meta name="preview-rest-audio" content="" /><meta name="preview-rest-artwork" content="" /></html>',
  );
  await fs.writeFile(path.join(media, 'rest-track.mp3'), '0123456789');
  await fs.writeFile(path.join(media, 'rest-artwork.jpg'), 'fixture-image');
  await fs.writeFile(path.join(media, 'private.mp3'), 'must-stay-private');
  await start(item, { staticRoot: web, mediaRoot: media });
  const index = await fetch(item.base);
  expect(index.headers.get('content-security-policy')).toContain("media-src 'self' blob:");
  const html = await index.text();
  expect(html).toContain('content="/assets/rest-track.mp3"');
  expect(html).toContain('content="/brand/rest-artwork.jpg"');
  const audio = await fetch(`${item.base}/assets/rest-track.mp3`, { headers: { range: 'bytes=2-5' } });
  expect(audio.status).toBe(206);
  expect(await audio.text()).toBe('2345');
  expect(audio.headers.get('content-range')).toBe('bytes 2-5/10');
  expect((await fetch(`${item.base}/assets/private.mp3`)).status).toBe(404);
  expect((await fetch(`${item.base}/media/rest-track.mp3`)).status).toBe(404);
  await item.runtime.close();
  item.runtime = null;
  const nextWeb = path.join(item.root, 'next-web');
  await fs.mkdir(nextWeb);
  await fs.copyFile(path.join(web, 'index.html'), path.join(nextWeb, 'index.html'));
  await start(item, { staticRoot: nextWeb, mediaRoot: media });
  const restored = await fetch(`${item.base}/assets/rest-track.mp3`);
  expect(restored.status).toBe(200);
  expect(await restored.text()).toBe('0123456789');
});

test('hashed public assets can be reused while mutable entries and rejected assets revalidate', async () => {
  const item = await fixture();
  const web = path.join(item.root, 'web');
  await fs.mkdir(path.join(web, 'assets'), { recursive: true });
  await fs.mkdir(path.join(web, 'brand'));
  const assets = {
    'index.html': '<html>Current entry</html>',
    'assets/app-aB3_dE9f.js': 'export const version = 1;',
    'assets/app-Zx8wVt2q.css': '.application { color: inherit; }',
    'assets/app.js': 'export const mutable = true;',
    'assets/rejected-aB3_dE9f.js': 'const title = "Northwind redesign";',
    'brand/version.json': '{"buildId":"current"}',
  };
  for (const [filename, content] of Object.entries(assets))
    await fs.writeFile(path.join(web, filename), content);
  await start(item, { staticRoot: web });
  for (const method of ['GET', 'HEAD']) {
    for (const filename of ['assets/app-aB3_dE9f.js', 'assets/app-Zx8wVt2q.css']) {
      const response = await fetch(`${item.base}/${filename}`, { method });
      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
      await response.arrayBuffer();
    }
    for (const filename of [
      'index.html',
      'assets/app.js',
      'brand/version.json',
      'assets/missing-aB3_dE9f.js',
      'assets/rejected-aB3_dE9f.js',
    ]) {
      const response = await fetch(`${item.base}/${filename}`, { method });
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(response.status).toBe(filename.includes('missing') || filename.includes('rejected') ? 404 : 200);
      await response.arrayBuffer();
    }
    const session = await fetch(`${item.base}/api/native/session`, { method: 'GET' });
    expect(session.headers.get('cache-control')).toBe('no-store');
    await session.arrayBuffer();
  }
});

test('first-admin CLI prepares registered projects and retries without changing existing menus', async () => {
  const item = await fixture();
  const data = path.join(item.root, 'data');
  const args = [
    'scripts/initialize-admin.mjs',
    '--data',
    data,
    '--username',
    'pilot-admin',
    '--name',
    'Pilot',
    '--with-projects',
  ];
  const catalogRoot = path.join(item.root, 'catalog');
  await fs.mkdir(catalogRoot);
  await fs.writeFile(path.join(catalogRoot, 'builtin-modules.local.json'), '[]');
  await fs.writeFile(
    path.join(catalogRoot, 'registered-projects.local.json'),
    JSON.stringify([
      {
        schemaVersion: 1,
        module: {
          key: 'fixture-module',
          projectId: 'fixture-project',
          clientId: 'web',
          label: 'Fixture',
          surface: 'showcase',
          pages: [{ key: 'home-page', label: 'Home', source: 'HomePage.tsx' }],
          initialClients: [
            {
              id: 'web',
              name: 'Web',
              layout: 'desktop',
              enabled: true,
              position: 0,
              defaultPage: 'home-page',
              pages: [{ key: 'home-page', label: 'Home', visible: true, access: 'public', position: 0 }],
            },
          ],
        },
        registry: [],
      },
    ]),
  );
  const env = { ...process.env, PREVIEW_ADMIN_PASSWORD: password, PREVIEW_PROJECT_CATALOG_ROOT: catalogRoot };
  const first = execFileSync(process.execPath, args, { env, encoding: 'utf8' });
  expect(first).not.toContain(password);
  const database = new DatabaseSync(path.join(data, 'platform.sqlite'));
  let before;
  try {
    expect(database.prepare('SELECT COUNT(*) AS count FROM projects').get().count).toBeGreaterThan(0);
    database.prepare("UPDATE projects SET name='Keep pilot name', archived=1, revision=revision+1").run();
    before = database.prepare('SELECT * FROM projects ORDER BY id').all();
  } finally {
    database.close();
  }
  execFileSync(process.execPath, args, { env, encoding: 'utf8' });
  const reopened = new DatabaseSync(path.join(data, 'platform.sqlite'));
  try {
    expect(reopened.prepare('SELECT * FROM projects ORDER BY id').all()).toEqual(before);
    expect(reopened.prepare('SELECT COUNT(*) AS count FROM accounts').get().count).toBe(1);
    expect(reopened.prepare('SELECT COUNT(*) AS count FROM sessions').get().count).toBe(0);
  } finally {
    reopened.close();
  }
});

test('installer accepts an independent HTTP pilot port and rejects API collisions before installation', async () => {
  const script = await fs.readFile('deploy/server/install.sh', 'utf8');
  const validation = /<<'NODE'\r?\n([\s\S]*?)\r?\nNODE/.exec(script)[1];
  for (const [origin, port, accepted] of [
    ['http://192.0.2.10:8088', '5190', true],
    ['http://localhost:8088', '5192', true],
    ['https://preview.example.com', '5192', true],
    ['http://192.0.2.10:5190', '5190', false],
    ['http://192.0.2.10:0', '5190', false],
    ['https://preview.example.com/path', '5190', false],
    ['http://192.0.2.10:8088', '0', false],
  ]) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-', origin, port], {
      input: validation,
      encoding: 'utf8',
    });
    expect(result.status === 0, `${origin} / ${port}`).toBe(accepted);
  }
});
