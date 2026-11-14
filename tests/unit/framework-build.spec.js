// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { build } from 'esbuild';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { frameworkRuntimePlugin, prepareFrameworkOutput } from '../../scripts/build-framework.mjs';
import { frameworkBuildPlugin } from '../../plugins/framework-build-plugin.js';
import { loadProjectCatalog } from '../../packages/platform-server/src/project-catalog.js';
import { createNativeServer } from '../../packages/platform-server/src/server.js';
import { createNativeStore } from '../../packages/project-core/src/platform/store.js';

const root = fileURLToPath(new URL('../..', import.meta.url));
const temporaryRoots = [];
afterEach(async () => {
  for (const temporary of temporaryRoots.splice(0)) {
    if (
      path.dirname(temporary) !== tmpdir() ||
      !path.basename(temporary).startsWith('preview-framework-test-')
    )
      throw new Error('临时目录越界');
    await fs.rm(temporary, { recursive: true, force: true });
  }
});
test('the bundled framework retains only the selected public example and platform documentation', async () => {
  const result = await build({
    absWorkingDir: root,
    stdin: {
      contents: `
        export { NATIVE_MODULES } from './packages/platform-contracts/src/platform.js';
        export { COMPONENT_REGISTRY } from './packages/platform-contracts/src/component-registry.js';
        export { PLATFORM_GUIDES } from './packages/project-shared/src/platform-docs.js';
      `,
      resolveDir: root,
    },
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    plugins: [frameworkRuntimePlugin(root)],
  });
  const module = { exports: {} };
  runInNewContext(result.outputFiles[0].text, { module });
  expect(module.exports.NATIVE_MODULES.map((item) => item.key)).toEqual(['empty', 'example']);
  expect(module.exports.COMPONENT_REGISTRY.map((item) => item.name)).toEqual(['example-vehicle-groups']);
  expect(module.exports.NATIVE_MODULES[1].pages.map((item) => item.key)).toEqual(['vehicle-groups']);
  expect(module.exports.PLATFORM_GUIDES.map((item) => item.id)).toContain('ai');
});

test('accidental business imports fail rather than silently entering the framework API', async () => {
  await expect(
    build({
      absWorkingDir: root,
      stdin: { contents: `import './project-content/private/requirements.js';`, resolveDir: root },
      bundle: true,
      platform: 'node',
      write: false,
      logLevel: 'silent',
      plugins: [
        {
          name: 'synthetic-import',
          setup(builder) {
            builder.onResolve({ filter: /private\/requirements\.js$/ }, () => ({
              path: path.join(root, 'project-content/private/requirements.js'),
            }));
          },
        },
        frameworkRuntimePlugin(root),
      ],
    }),
  ).rejects.toThrow('Framework API cannot import business sources');
});

test('framework browser resolution rejects protected content and isolates optional media and page adapters', async () => {
  const plugin = frameworkBuildPlugin(root);
  for (const relative of [
    'apps/web/src/project-modules/custom/Home.tsx',
    'packages/component-library/src/custom/Button.tsx',
    'apps/web/src/features/orders/order-data.ts',
    'apps/web/src/features/rest/media/private.mp3',
    'packages/platform-contracts/src/registered-projects.local.json',
  ]) {
    const id = path.join(root, relative);
    await expect(plugin.resolveId.call({ resolve: async () => ({ id }) }, id, undefined, {})).rejects.toThrow(
      'Framework cannot import business source',
    );
  }
  const id = path.join(root, 'apps/web/src/features/rest/rest-track.ts');
  expect(await plugin.resolveId.call({ resolve: async () => ({ id }) }, id, undefined, {})).toBe(
    path.join(root, 'templates/framework/rest-track.ts'),
  );
  const example = path.join(root, 'packages/component-library/src/example/lib/RimoEnvironment.jsx');
  expect(
    await plugin.resolveId.call({ resolve: async () => ({ id: example }) }, example, undefined, {}),
  ).toBeNull();
});

test('repeat framework builds discard only owned generated output and reject linked or populated content roots', async () => {
  const temporary = await fs.mkdtemp(path.join(tmpdir(), 'preview-framework-test-'));
  temporaryRoots.push(temporary);
  const output = await prepareFrameworkOutput(temporary);
  const media = path.join(output, 'web/old-recording.mp3');
  await fs.writeFile(media, 'old private media');
  const business = path.join(temporary, 'project-content');
  await fs.mkdir(business);
  await fs.writeFile(path.join(business, 'keep.md'), 'Business source');
  await prepareFrameworkOutput(temporary);
  await expect(fs.stat(media)).rejects.toMatchObject({ code: 'ENOENT' });
  expect(await fs.readFile(path.join(business, 'keep.md'), 'utf8')).toBe('Business source');
  await fs.writeFile(path.join(output, 'project-content/keep.md'), 'Unexpected data');
  await expect(prepareFrameworkOutput(temporary)).rejects.toThrow('资料目录只能包含示例');
  await fs.unlink(path.join(output, 'project-content/keep.md'));
  await fs.rmdir(path.join(output, 'web'));
  await fs.symlink(business, path.join(output, 'web'), 'junction');
  await expect(prepareFrameworkOutput(temporary)).rejects.toThrow('输出目录不可用');
  expect(await fs.readFile(path.join(business, 'keep.md'), 'utf8')).toBe('Business source');
});

test('first administrator setup installs the selected example and retries preserve its menu settings', async () => {
  const temporary = await fs.mkdtemp(path.join(tmpdir(), 'preview-framework-test-'));
  temporaryRoots.push(temporary);
  const catalog = await loadProjectCatalog(path.join(root, 'packages/platform-contracts/src'), {
    local: false,
  });
  const runtime = createNativeServer({
    dataDirectory: path.join(temporary, 'data'),
    contentRoot: path.join(root, 'project-content'),
    publicOrigin: 'http://127.0.0.1:5190',
    moduleCatalog: catalog.moduleCatalog,
    componentRegistry: catalog.componentRegistry,
    allowBootstrap: true,
  });
  try {
    await new Promise((resolve) => runtime.server.listen(0, '127.0.0.1', resolve));
    const response = await fetch(`http://127.0.0.1:${runtime.server.address().port}/api/native/bootstrap`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:5190' },
      body: JSON.stringify({
        username: 'example-admin',
        displayName: 'Example administrator',
        password: 'example-setup-password',
      }),
    });
    expect(response.status).toBe(201);
    expect(runtime.store.pageCatalog().map((page) => [page.projectId, page.pageKey])).toEqual([
      ['example', 'vehicle-groups'],
    ]);
    const session = runtime.store.login('example-admin', 'example-setup-password');
    const project = runtime.store.getProject(session.user, 'example');
    expect(project.name).toBe('示例');
    runtime.store.updateProject(session.user, project.id, { revision: project.revision, name: 'My example' });
    const changed = runtime.store.getProject(session.user, project.id);
    runtime.store.initializeRegisteredProjects(session.user);
    expect(runtime.store.getProject(session.user, project.id)).toEqual(changed);
  } finally {
    await runtime.close();
  }
});

test('a failing initial project keeps administrator setup atomic and allows a successful retry', async () => {
  const temporary = await fs.mkdtemp(path.join(tmpdir(), 'preview-framework-test-'));
  temporaryRoots.push(temporary);
  const catalog = await loadProjectCatalog(path.join(root, 'packages/platform-contracts/src'), {
    local: false,
  });
  const moduleCatalog = structuredClone(catalog.moduleCatalog);
  const example = moduleCatalog.find((module) => module.projectId === 'example');
  const original = example.initialClients[0].pages[0].key;
  example.initialClients[0].pages[0].key = 'missing-page';
  const store = createNativeStore({
    dataDirectory: path.join(temporary, 'data'),
    moduleCatalog,
    documentSources: ['none', 'published'],
  });
  const input = {
    username: 'retry-admin',
    displayName: 'Retry administrator',
    password: 'example-setup-password',
  };
  try {
    expect(() => store.bootstrap(input, { withProjects: true })).toThrow();
    expect(store.initialized()).toBe(false);
    expect(store.pageCatalog()).toEqual([]);
    example.initialClients[0].pages[0].key = original;
    const admin = store.bootstrap(input, { withProjects: true });
    expect(store.getProject(admin, 'example').name).toBe('示例');
  } finally {
    store.close();
  }
});
