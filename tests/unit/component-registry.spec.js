// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { COMPONENT_REGISTRY } from '../../packages/platform-contracts/src/component-registry.js';
import { NATIVE_MODULES } from '../../packages/platform-contracts/src/platform.js';
import { createNativeServer } from '../../packages/platform-server/src/server.js';
import { loadPrototypeRevisions } from '../../packages/project-core/src/platform/project-content.js';
import {
  validateComponentRegistry,
  componentRegistryClosure,
  loadComponentRegistryItem,
  registryItemResponse,
  requireComponentRegistryAccess,
  componentSourceImports,
} from '../../packages/project-core/src/platform/component-registry.js';
import { assertPublicBundleIsolation, showcaseBuildPlugin } from '../../plugins/showcase-build-plugin.js';
import { checkSourceImports } from '../../scripts/check-architecture.mjs';
import { createAgentContext } from '../../packages/project-core/src/platform/agent-context.js';

const root = fileURLToPath(new URL('../..', import.meta.url));
const resources = [];
const vehicleGroups = COMPONENT_REGISTRY.find((item) => item.name === 'rimo-vehicle-groups');
const vehicleTransfer = COMPONENT_REGISTRY.find((item) => item.name === 'rimo-vehicle-transfer');
test('source dependencies are parsed as syntax, not as words inside examples or comments', () => {
  const source = `
    import { useState } from 'react';
    export { value } from './state.js';
    const label = 'import';
    const example = 'import Secret from "private-package"';
    export default () => <button>{label}{example}</button>;
  `;
  expect(componentSourceImports(source, 'Example.jsx')).toEqual(['react', './state.js']);
  expect(componentSourceImports('export const load = () => import("./Block.jsx");', 'index.js')).toEqual(['./Block.jsx']);
  expect(() => componentSourceImports('export const load = path => import(path);', 'index.js')).toThrow('明确登记');
});
test('combined installation rejects incompatible dependency versions instead of selecting one silently', async () => {
  const registry = [
    { ...vehicleGroups, registryDependencies: [vehicleTransfer.name] },
    { ...vehicleTransfer, dependencies: vehicleTransfer.dependencies.map((name) => name.startsWith('lucide-react@') ? 'lucide-react@^2.0.0' : name) },
  ];
  const context = createAgentContext({
    registry,
    pageSourceRoot: root,
    publicOrigin: 'https://preview.example',
  });
  const project = {
    id: 'fixture-project',
    moduleKey: 'rimo-native',
    clients: [{ enabled: true, pages: registry.map((item) => ({ key: item.pageKey, visible: true })) }],
  };
  await expect(context.readInstallItem(project, registry[0].name)).rejects.toThrow('版本冲突');
});
test('installable library sources cannot depend on the website, platform UI or Node', () => {
  for (const specifier of ['@/features/platform/platform-api', '@preview/ui', 'node:fs']) {
    expect(
      checkSourceImports('packages/component-library/src/Block.tsx', `import source from '${specifier}';`),
    ).not.toEqual([]);
  }
  expect(
    checkSourceImports(
      'apps/web/src/project-modules/Example.tsx',
      "import Block from '@preview/library/sample/blocks/Block';",
    ),
  ).toEqual([]);
});
afterEach(async () => {
  for (const resource of resources.splice(0)) {
    if (resource.runtime) await resource.runtime.close();
    if (!resource.directory.startsWith(`${path.resolve(tmpdir())}${path.sep}preview-registry-`))
      throw new Error('Temporary path escaped');
    await fs.rm(resource.directory, { recursive: true, force: true });
  }
});
async function temporary() {
  const directory = await fs.mkdtemp(path.join(tmpdir(), 'preview-registry-'));
  const resource = { directory };
  resources.push(resource);
  return resource;
}
function projectInput(id) {
  return {
    id,
    name: id,
    moduleKey: 'rimo-native',
    sourceId: 'none',
    clients: [
      {
        id: 'operation',
        name: 'Operation',
        enabled: true,
        layout: 'desktop',
        position: 0,
        defaultPage: 'vehicle-groups',
        pages: [
          { key: 'vehicle-groups', label: 'Groups', visible: true, position: 0, access: 'public' },
          { key: 'vehicle-transfer', label: 'Transfers', visible: true, position: 1, access: 'restricted' },
        ],
      },
    ],
  };
}
async function serverFixture(staticRoot) {
  const item = await temporary();
  item.runtime = createNativeServer({
    dataDirectory: path.join(item.directory, 'data'),
    pageSourceRoot: root,
    staticRoot,
    publicOrigin: 'http://127.0.0.1:5191',
  });
  await new Promise((resolve) => item.runtime.server.listen(0, '127.0.0.1', resolve));
  item.base = `http://127.0.0.1:${item.runtime.server.address().port}`;
  item.store = item.runtime.store;
  item.admin = item.store.bootstrap({
    username: 'registry-admin',
    displayName: 'Registry admin',
    password: 'fixture-password',
  });
  item.project = item.store.createProject(item.admin, projectInput('registry-project'));
  return item;
}
test('catalog rejects undeclared files, conflicting install paths and unsafe package dependencies', () => {
  expect(validateComponentRegistry(COMPONENT_REGISTRY)).toBe(COMPONENT_REGISTRY);
  for (const patch of [
    { name: '../private' },
    { kind: 'page' },
    { dependencies: ['file:../../private'] },
    { files: [{ path: 'docs/private.ts', target: '@components/preview/private/private.ts' }] },
    {
      files: [
        {
          path: 'packages/component-library/src/../secret.ts',
          target: '@components/preview/private/private.ts',
        },
      ],
    },
    { files: [{ ...COMPONENT_REGISTRY[0].files[0], target: '../../private.tsx' }] },
  ])
    expect(() => validateComponentRegistry([{ ...COMPONENT_REGISTRY[0], ...patch }])).toThrow();
  const conflicting = {
    ...vehicleTransfer,
    files: [{ ...vehicleTransfer.files.at(-1), target: vehicleGroups.files.at(-1).target }],
  };
  expect(() => validateComponentRegistry([vehicleGroups, conflicting])).toThrow('冲突');
});
test('dependency closure rejects missing and cyclic items and rewrites local dependencies to project-scoped URLs', async () => {
  const catalog = [
    { ...vehicleGroups, registryDependencies: [vehicleTransfer.name] },
    vehicleTransfer,
  ];
  expect(componentRegistryClosure(catalog, catalog[0].name).map((item) => item.name)).toEqual(
    catalog.map((item) => item.name),
  );
  expect(() => validateComponentRegistry([{ ...catalog[0], registryDependencies: ['missing'] }])).toThrow(
    '未登记',
  );
  expect(() =>
    validateComponentRegistry([catalog[0], { ...catalog[1], registryDependencies: [catalog[0].name] }]),
  ).toThrow('循环');
  const item = await loadComponentRegistryItem(root, catalog, catalog[0].name);
  expect(
    registryItemResponse(item, catalog, 'registry-project', 'https://preview.example').registryDependencies,
  ).toEqual(['https://preview.example/r/registry-project/rimo-vehicle-transfer.json']);
  expect(() =>
    registryItemResponse({ ...item, files: [] }, catalog, 'registry-project', 'https://preview.example'),
  ).toThrow();
});
test('installed blocks compile independently of Preview with their declared files and npm dependencies', async () => {
  const item = await temporary();
  for (const descriptor of COMPONENT_REGISTRY) {
    const source = await loadComponentRegistryItem(root, COMPONENT_REGISTRY, descriptor.name);
    const files = [];
    for (const file of source.files) {
      const destination = path.join(item.directory, file.target.replace('@components/', 'components/'));
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, file.content);
      files.push(destination);
    }
    const result = await build({
      entryPoints: [files.find((file) => file.includes(`${path.sep}blocks${path.sep}`) && /\.[jt]sx?$/.test(file))],
      bundle: true,
      write: false,
      outdir: path.join(item.directory, 'build'),
      platform: 'browser',
      format: 'esm',
      external: ['react', 'react/jsx-runtime', ...descriptor.dependencies.map((name) => name.match(/^(@[^/]+\/[^@]+|[^@]+)(?:@.*)?$/)[1])],
      jsx: 'automatic',
    });
    expect(result.outputFiles.some((file) => file.path.endsWith('.css'))).toBe(true);
    expect(result.outputFiles.find((file) => file.path.endsWith('.js')).text).not.toMatch(
      /@preview\/|@\/features/,
    );
  }
}, 30000);
test('missing source and undeclared relative imports fail instead of producing partial install packages', async () => {
  const item = await temporary();
  await expect(
    loadComponentRegistryItem(item.directory, COMPONENT_REGISTRY, COMPONENT_REGISTRY[0].name),
  ).rejects.toThrow('源码不存在');
  const file = COMPONENT_REGISTRY[0].files[0];
  const target = path.join(item.directory, file.path);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, 'import "./missing.css"; export default function Block() { return null; }');
  await expect(
    loadComponentRegistryItem(
      item.directory,
      [{ ...COMPONENT_REGISTRY[0], files: [file] }],
      COMPONENT_REGISTRY[0].name,
    ),
  ).rejects.toThrow('未登记');
});
test('public registry installs while restricted, hidden, archived and cross-project source remain guarded', async () => {
  const item = await serverFixture();
  const publicUrl = `${item.base}/r/${item.project.id}/rimo-vehicle-groups.json`;
  const privateUrl = `${item.base}/r/${item.project.id}/rimo-vehicle-transfer.json`;
  const response = await fetch(publicUrl);
  expect(response.status).toBe(200);
  expect((await response.json()).files.map((file) => file.path)).toEqual(vehicleGroups.files.map((file) => file.path));
  expect((await fetch(privateUrl)).status).toBe(403);
  expect((await fetch(`${item.base}/r/missing-project/rimo-vehicle-groups.json`)).status).toBe(403);
  expect(
    (await fetch(publicUrl, { method: 'POST', headers: { origin: 'http://127.0.0.1:5191' } })).status,
  ).not.toBe(200);
  const user = item.store.createAccount(item.admin, {
    username: 'registry-reader',
    displayName: 'Reader',
    role: 'member',
    password: 'fixture-password',
  });
  item.store.changePassword(user, { currentPassword: 'fixture-password', password: 'reader-password' });
  item.store.setPageGrant(item.admin, item.project.id, 'operation', 'vehicle-transfer', user.id, true);
  const login = item.store.login(user.username, 'reader-password');
  const headers = { cookie: `preview_session=${login.token}` };
  expect((await fetch(privateUrl, { headers })).status).toBe(200);
  const other = item.store.createProject(item.admin, projectInput('other-project'));
  expect((await fetch(`${item.base}/r/${other.id}/rimo-vehicle-transfer.json`, { headers })).status).toBe(
    403,
  );
  item.store.setPageGrant(item.admin, item.project.id, 'operation', 'vehicle-transfer', user.id, false);
  expect((await fetch(privateUrl, { headers })).status).toBe(403);
  const dependencyCatalog = [
    { ...vehicleGroups, registryDependencies: [vehicleTransfer.name] },
    vehicleTransfer,
  ];
  expect(() =>
    requireComponentRegistryAccess(
      item.store,
      null,
      item.project.id,
      dependencyCatalog,
      vehicleGroups.name,
    ),
  ).toThrow('依赖');
  let project = item.store.getProject(item.admin, item.project.id);
  project.clients[0].pages[0].visible = false;
  project.clients[0].defaultPage = '';
  project = item.store.updateProject(item.admin, project.id, {
    revision: project.revision,
    clients: project.clients,
  });
  expect((await fetch(publicUrl)).status).toBe(403);
  project.clients[0].pages[0].visible = true;
  project = item.store.updateProject(item.admin, project.id, {
    revision: project.revision,
    clients: project.clients,
    archived: true,
  });
  expect((await fetch(publicUrl)).status).toBe(403);
  expect((await fetch(`${item.base}/page-source/registry/rimo-vehicle-groups.json`)).status).not.toBe(200);
});
test('compiled registry uses the release snapshot and rejects missing or mismatched artifacts', async () => {
  const files = await temporary();
  const directory = path.join(files.directory, 'web');
  await fs.mkdir(path.join(directory, 'page-source/registry'), { recursive: true });
  const item = await serverFixture(directory);
  const url = `${item.base}/r/${item.project.id}/rimo-vehicle-groups.json`;
  expect((await fetch(url)).status).toBe(503);
  const source = await loadComponentRegistryItem(root, COMPONENT_REGISTRY, 'rimo-vehicle-groups');
  const destination = path.join(directory, 'page-source/registry/rimo-vehicle-groups.json');
  await fs.writeFile(destination, JSON.stringify(source));
  expect((await fetch(url)).status).toBe(200);
  await fs.writeFile(destination, JSON.stringify({ ...source, dependencies: ['undeclared'] }));
  expect((await fetch(url)).status).toBe(422);
});
test('library changes participate in prototype freshness and public bundles cannot import library chunks', async () => {
  const item = await temporary();
  const module = NATIVE_MODULES.find((entry) => entry.key === 'rimo-native');
  const page = module.pages[0];
  const adapter = `apps/web/src/project-modules/rimo-rental/${page.key}/${page.source}`;
  for (const file of [adapter, ...page.sourceFiles]) {
    const target = path.join(item.directory, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, 'fixture');
  }
  const options = { moduleCatalog: NATIVE_MODULES, moduleKey: 'rimo-native', pageSourceRoot: item.directory };
  const before = await loadPrototypeRevisions(options);
  await fs.appendFile(path.join(item.directory, page.sourceFiles[0]), 'changed');
  const after = await loadPrototypeRevisions(options);
  expect(before[page.key]).toMatch(/^[a-f0-9]{64}$/);
  expect(after[page.key]).not.toBe(before[page.key]);
  const nested = path.join(item.directory, path.dirname(adapter), 'examples/example-data.json');
  await fs.mkdir(path.dirname(nested), { recursive: true });
  await fs.writeFile(nested, '{"count":1}');
  const withExample = await loadPrototypeRevisions(options);
  await fs.writeFile(nested, '{"count":2}');
  expect((await loadPrototypeRevisions(options))[page.key]).not.toBe(withExample[page.key]);
  expect(withExample[page.key]).not.toBe(after[page.key]);
  expect(() =>
    assertPublicBundleIsolation({
      chunk: {
        type: 'chunk',
        fileName: 'assets/bootstrap.js',
        imports: [],
        modules: { 'D:/project/packages/component-library/src/private/Block.tsx': {} },
      },
    }),
  ).toThrow('source escaped');
});
test('development library source is authorized using registry access, not merely its filesystem location', async () => {
  let handler;
  showcaseBuildPlugin(root).configureServer({
    middlewares: {
      use(value) {
        handler = value;
      },
    },
  });
  const response = { end() {} };
  let called = false;
  await handler(
    { url: '/@fs/workspace/packages/component-library/src/unregistered/Secret.tsx', headers: {} },
    response,
    () => {
      called = true;
    },
  );
  expect(response.statusCode).toBe(403);
  expect(called).toBe(false);
});
