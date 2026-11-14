// @vitest-environment node
import { expect, test, vi } from 'vitest';
import { fileURLToPath } from 'node:url';
import {
  assertPublicBundleIsolation,
  showcaseBuildPlugin,
  protectedLibraryChunk,
  protectedPageAssets,
} from '../../plugins/showcase-build-plugin.js';
import { TEST_MODULES, TEST_REGISTRY } from '../fixtures/project-catalog.js';

test('browser bundles include the unchanged copyright for vendored primitives', async () => {
  const root = fileURLToPath(new URL('../..', import.meta.url));
  const emitted = [];
  const plugin = showcaseBuildPlugin(root, { moduleCatalog: [], componentRegistry: [] });
  await plugin.generateBundle.call(
    { emitFile: (file) => emitted.push(file) },
    {},
    {
      'assets/app.js': {
        type: 'chunk',
        fileName: 'assets/app.js',
        imports: [],
        dynamicImports: [],
        modules: { [`${root.replaceAll('\\', '/')}/packages/preview-ui/src/Button.tsx`]: {} },
      },
    },
  );
  const notices = emitted.find((file) => file.fileName === 'assets/third-party-notices.txt');
  expect(notices.source).toContain('Copyright (c) 2026 Elia Kuratli');
  expect(notices.source).toContain('Animate UI homepage adaptations');
  expect(notices.source).toContain('Copyright (c) 2025 Elliot Sutton');
  expect(notices.source).toContain('Commons Clause Restriction');
  expect(notices.source).toContain('The above copyright notice and this permission notice shall be included');
});
function developmentMiddleware() {
  let middleware;
  showcaseBuildPlugin('/workspace', {
    moduleCatalog: TEST_MODULES,
    componentRegistry: TEST_REGISTRY,
  }).configureServer({
    middlewares: {
      use(handler) {
        middleware = handler;
      },
    },
  });
  return middleware;
}
test('shared library helpers are protected separately while item folders remain grouped', () => {
  const first = protectedLibraryChunk('D:/preview/packages/component-library/src/sample/lib/format.ts');
  const second = protectedLibraryChunk('D:/preview/packages/component-library/src/sample/lib/private.ts');
  expect(first).toMatch(/^page-library-sample-shared-/);
  expect(first).not.toBe(second);
  expect(
    protectedLibraryChunk('D:\\preview\\packages\\component-library\\src\\sample\\lib\\format.ts?import'),
  ).toBe(first);
  expect(
    protectedLibraryChunk('/preview/packages/component-library/src/sample/components/button/Button.tsx'),
  ).toBe('page-library-sample-components-button');
  expect(protectedLibraryChunk('/preview/node_modules/react/index.js')).toBeUndefined();
});
test('page manifest includes nested lazy chunks and their styles without exposing unrelated pages', () => {
  const bundle = {
    'page-assets/entry.js': {
      type: 'chunk',
      imports: ['assets/react.js'],
      dynamicImports: ['page-assets/dialog.js'],
    },
    'page-assets/dialog.js': {
      type: 'chunk',
      imports: ['page-assets/helper.js'],
      dynamicImports: [],
      viteMetadata: { importedCss: new Set(['page-assets/dialog.css']) },
    },
    'page-assets/helper.js': { type: 'chunk', imports: [], dynamicImports: ['page-assets/dialog.js'] },
    'page-assets/dialog.css': { type: 'asset' },
    'page-assets/private.js': { type: 'chunk', imports: [], dynamicImports: [] },
  };
  expect(protectedPageAssets(bundle, 'page-assets/entry.js')).toEqual([
    'page-assets/entry.js',
    'page-assets/dialog.js',
    'page-assets/helper.js',
    'page-assets/dialog.css',
  ]);
  delete bundle['page-assets/dialog.css'];
  expect(() => protectedPageAssets(bundle, 'page-assets/entry.js')).toThrow('Missing protected');
});
test('development page paths authorize using the registered module identity', async () => {
  const requestPermission = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 200 });
  const middleware = developmentMiddleware();
  for (const pathname of [
    '/src/project-modules/fixture/item-groups/GroupsPage.tsx?import',
    '/@fs/workspace/apps/web/src/project-modules/fixture/item-transfer/item-transfer.css',
  ]) {
    const next = vi.fn();
    const response = { end: vi.fn() };
    await middleware({ url: pathname, headers: { cookie: 'preview_session=fixture' } }, response, next);
    const pageKey = pathname.includes('item-groups') ? 'item-groups' : 'item-transfer';
    expect(requestPermission).toHaveBeenLastCalledWith(
      `http://127.0.0.1:5190/api/native/showcase/module-permission?moduleKey=fixture-module&pageKey=${pageKey}`,
      { headers: { cookie: 'preview_session=fixture' } },
    );
    expect(next).toHaveBeenCalledOnce();
    expect(response.end).not.toHaveBeenCalled();
  }
});
test('development page access preserves rejection and does not authorize unregistered paths', async () => {
  const requestPermission = vi.spyOn(globalThis, 'fetch');
  const middleware = developmentMiddleware();
  for (const status of [401, 403]) {
    requestPermission.mockResolvedValue({ ok: false, status });
    const next = vi.fn();
    const response = { end: vi.fn() };
    await middleware(
      {
        url: '/src/project-modules/fixture/item-transfer/TransferPage.tsx',
        headers: {},
      },
      response,
      next,
    );
    expect(response.statusCode).toBe(status);
    expect(next).not.toHaveBeenCalled();
  }
  requestPermission.mockRejectedValue(new Error('API unavailable'));
  const unavailable = { end: vi.fn() };
  const nextUnavailable = vi.fn();
  await middleware(
    { url: '/src/project-modules/fixture/item-groups/GroupsPage.tsx', headers: {} },
    unavailable,
    nextUnavailable,
  );
  expect(unavailable.statusCode).toBe(503);
  expect(nextUnavailable).not.toHaveBeenCalled();
  requestPermission.mockClear();
  for (const pathname of [
    '/src/project-modules/unregistered/item-groups/GroupsPage.tsx',
    '/src/project-modules/fixture/unregistered/Page.tsx',
  ]) {
    const response = { end: vi.fn() };
    const next = vi.fn();
    await middleware({ url: pathname, headers: {} }, response, next);
    expect(response.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  }
  expect(requestPermission).not.toHaveBeenCalled();
});
test('public bootstrap and lazy administration cannot depend on a protected page chunk', () => {
  const chunk = {
    type: 'chunk',
    fileName: 'assets/index.js',
    imports: ['assets/shared.js'],
    dynamicImports: [],
    modules: { '/src/app.tsx': {} },
  };
  expect(() => assertPublicBundleIsolation({ chunk })).not.toThrow();
  expect(() =>
    assertPublicBundleIsolation({ chunk: { ...chunk, imports: ['page-assets/business.js'] } }),
  ).toThrow('depends on protected');
  expect(() =>
    assertPublicBundleIsolation({ chunk: { ...chunk, dynamicImports: ['page-assets/business.js'] } }),
  ).toThrow('depends on protected');
  expect(() =>
    assertPublicBundleIsolation({
      chunk: { ...chunk, modules: { 'D:/app/src/project-modules/private/Page.tsx': {} } },
    }),
  ).toThrow('source escaped');
});
