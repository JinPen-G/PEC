// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { build } from 'vite';
import { showcaseBuildPlugin, protectedLibraryChunk } from '../../plugins/showcase-build-plugin.js';
import { createNativeServer } from '../../packages/platform-server/src/server.js';
import { loadComponentRegistryItem } from '../../packages/project-core/src/platform/component-registry.js';

const fixtures = [];
afterEach(async () => {
  for (const fixture of fixtures.splice(0)) {
    if (fixture.runtime) await fixture.runtime.close();
    if (
      path.dirname(fixture.root) !== tmpdir() ||
      !path.basename(fixture.root).startsWith('preview-composition-')
    )
      throw new Error('Temporary root escaped');
    await fs.rm(fixture.root, { recursive: true, force: true });
  }
});
test('a built block retains shared helpers and lazy component styles through preview and authorized installation', async () => {
  const root = await fs.mkdtemp(path.join(tmpdir(), 'preview-composition-'));
  const fixture = { root };
  fixtures.push(fixture);
  const sourceRoot = 'packages/component-library/src/fixture';
  const targetRoot = '@components/preview/fixture';
  const file = (suffix) => ({ path: `${sourceRoot}/${suffix}`, target: `${targetRoot}/${suffix}` });
  const registry = [
    {
      name: 'inbox',
      title: 'Inbox',
      description: 'Fixture block',
      moduleKey: 'fixture-module',
      pageKey: 'inbox',
      kind: 'block',
      dependencies: [],
      registryDependencies: ['status'],
      files: [file('blocks/inbox/Inbox.tsx'), file('lib/format.ts')],
    },
    {
      name: 'status',
      title: 'Status',
      description: 'Fixture component',
      moduleKey: 'fixture-module',
      pageKey: 'status',
      kind: 'component',
      dependencies: [],
      registryDependencies: [],
      files: [file('components/status/Status.tsx'), file('components/status/status.css')],
    },
  ];
  const pages = [
    {
      key: 'inbox',
      source: 'InboxPage.tsx',
      kind: 'block',
      registryItem: 'inbox',
      sourceFiles: registry.flatMap((item) => item.files.map((file) => file.path)),
    },
    {
      key: 'status',
      source: 'StatusPage.tsx',
      kind: 'component',
      registryItem: 'status',
      sourceFiles: registry[1].files.map((file) => file.path),
    },
  ];
  const modules = [
    { key: 'fixture-module', projectId: 'fixture', clientId: 'web', surface: 'showcase', pages },
  ];
  const files = {
    'index.html': '<script type="module" src="/bootstrap.ts"></script>',
    'bootstrap.ts': 'console.log("public shell");',
    'apps/web/src/project-modules/fixture/inbox/InboxPage.tsx':
      'export { default } from "../../../../../../packages/component-library/src/fixture/blocks/inbox/Inbox";',
    'apps/web/src/project-modules/fixture/status/StatusPage.tsx':
      'export { default } from "../../../../../../packages/component-library/src/fixture/components/status/Status";',
    [`${sourceRoot}/blocks/inbox/Inbox.tsx`]:
      'import { format } from "../../lib/format"; export default async function Inbox() { const module = await import("../../components/status/Status"); return format(module.default()); }',
    [`${sourceRoot}/lib/format.ts`]: 'export const format = (value: string) => `PRIVATE_HELPER: ${value}`;',
    [`${sourceRoot}/components/status/Status.tsx`]:
      'import "./status.css"; export default function Status() { return "LAZY_STATUS"; }',
    [`${sourceRoot}/components/status/status.css`]: '.fixture-status { color: purple; }',
  };
  for (const [file, source] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await fs.writeFile(path.join(root, file), source);
  }
  const web = path.join(root, 'web');
  await build({
    configFile: false,
    root,
    logLevel: 'error',
    css: { postcss: { plugins: [] } },
    plugins: [showcaseBuildPlugin(root, { moduleCatalog: modules, componentRegistry: registry })],
    build: {
      outDir: web,
      minify: false,
      rollupOptions: {
        output: {
          onlyExplicitManualChunks: true,
          manualChunks: protectedLibraryChunk,
          entryFileNames: (chunk) =>
            `${chunk.name.startsWith('page-') ? 'page-assets' : 'assets'}/[name]-[hash].js`,
          chunkFileNames: (chunk) =>
            `${chunk.name.startsWith('page-') ? 'page-assets' : 'assets'}/[name]-[hash].js`,
          assetFileNames: (asset) =>
            `${asset.names?.some((name) => name.startsWith('page-')) ? 'page-assets' : 'assets'}/[name]-[hash][extname]`,
        },
      },
    },
  });
  const manifest = JSON.parse(await fs.readFile(path.join(web, 'page-manifest.json'), 'utf8'));
  const inbox = manifest.entries.find((entry) => entry.pageKey === 'inbox');
  expect(inbox.assets.some((file) => file.includes('-shared-'))).toBe(true);
  expect(inbox.assets.some((file) => file.includes('components-status') && file.endsWith('.css'))).toBe(true);
  for (const file of await fs.readdir(path.join(web, 'assets'))) {
    expect(await fs.readFile(path.join(web, 'assets', file), 'utf8')).not.toMatch(
      /PRIVATE_HELPER|LAZY_STATUS/,
    );
  }
  const install = await loadComponentRegistryItem(root, registry, 'inbox');
  expect(install.registryDependencies).toEqual(['status']);
  fixture.runtime = createNativeServer({
    dataDirectory: path.join(root, 'data'),
    staticRoot: web,
    moduleCatalog: modules,
    componentRegistry: registry,
  });
  const store = fixture.runtime.store;
  const admin = store.bootstrap({
    username: 'fixture-admin',
    displayName: 'Fixture',
    password: 'fixture-password',
  });
  const project = store.createProject(admin, {
    id: 'fixture',
    name: 'Fixture',
    sourceId: 'none',
    clients: [
      {
        id: 'web',
        name: 'Web',
        layout: 'desktop',
        enabled: true,
        position: 0,
        defaultPage: 'inbox',
        pages: pages.map((page, position) => ({
          key: page.key,
          label: page.key,
          visible: true,
          access: 'restricted',
          position,
        })),
      },
    ],
  });
  await new Promise((resolve) => fixture.runtime.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${fixture.runtime.server.address().port}`;
  const token = store.issueContextToken(admin, project.id, {
    label: 'component-install',
    scopes: ['components:read'],
  });
  const headers = { authorization: `Bearer ${token.secret}` };
  const installResponse = await fetch(`${base}/r/fixture/inbox.json`, { headers });
  expect(installResponse.status).toBe(200);
  const packageItem = await installResponse.json();
  expect(packageItem.registryDependencies).toEqual([]);
  expect(packageItem.files.map((file) => file.target)).toEqual(
    registry.flatMap((item) => item.files.map((file) => file.target)),
  );
  expect((await fetch(`${base}/r/fixture/status.json`, { headers })).status).toBe(200);
  const session = store.login('fixture-admin', 'fixture-password');
  const cached = [];
  for (const asset of inbox.assets) {
    expect((await fetch(`${base}/${asset}`)).status).toBe(403);
    const response = await fetch(`${base}/${asset}`, {
      headers: { cookie: `preview_session=${session.token}` },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-cache');
    const etag = response.headers.get('etag');
    expect(etag).toMatch(/^"[a-f0-9]{64}"$/);
    await response.arrayBuffer();
    cached.push({ asset, etag });
    const revalidated = await fetch(`${base}/${asset}`, {
      headers: {
        cookie: `preview_session=${session.token}`,
        'if-none-match': etag,
      },
    });
    expect(revalidated.status).toBe(304);
    expect(await revalidated.text()).toBe('');
    expect((await fetch(`${base}/${asset}`, { headers: { 'if-none-match': etag } })).status).toBe(403);
  }
  const firstAsset = cached[0];
  await fs.appendFile(path.join(web, firstAsset.asset), '\n/* Updated asset */\n');
  const changed = await fetch(`${base}/${firstAsset.asset}`, {
    headers: { cookie: `preview_session=${session.token}`, 'if-none-match': firstAsset.etag },
  });
  expect(changed.status).toBe(200);
  expect(changed.headers.get('etag')).not.toBe(firstAsset.etag);
  expect(await changed.text()).toContain('Updated asset');
  project.clients[0].pages[1].visible = false;
  store.updateProject(admin, project.id, project);
  expect((await fetch(`${base}/r/fixture/inbox.json`, { headers })).status).toBe(403);
  const current = store.getProject(admin, project.id);
  current.clients[0].defaultPage = '';
  current.clients[0].pages.forEach((page) => {
    page.visible = false;
  });
  store.updateProject(admin, project.id, current);
  for (const { asset, etag } of cached) {
    const response = await fetch(`${base}/${asset}`, {
      headers: {
        cookie: `preview_session=${session.token}`,
        'if-none-match': etag,
      },
    });
    expect(response.status).toBe(403);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await response.arrayBuffer();
  }
}, 30000);
