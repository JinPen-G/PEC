// @vitest-environment node
import { expect, test } from 'vitest';
import { assertPublicBundleIsolation } from '../../plugins/showcase-build-plugin.js';
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
