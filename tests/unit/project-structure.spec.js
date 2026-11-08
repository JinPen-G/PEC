// @vitest-environment node
import { expect, test } from 'vitest';
import { checkEngineeringName } from '../../scripts/check-structure.mjs';
import { checkSourceImports } from '../../scripts/check-architecture.mjs';
test('accepts responsibility names, React names and preserved source filenames', () => {
  expect(checkEngineeringName('scripts/deploy.mjs')).toEqual([]);
  expect(checkEngineeringName('apps/web/src/PlatformApp.tsx')).toEqual([]);
  expect(checkEngineeringName('apps/web/src/i18n/locales/zh-Hant', true)).toEqual([]);
  expect(checkEngineeringName('packages/preview-ui/upstream/site/Original_v2.ts')).toEqual([]);
});
test('rejects version variants, temporary filenames and retired dependency exemptions', () => {
  expect(checkEngineeringName('scripts/native-release.mjs')).not.toEqual([]);
  expect(checkEngineeringName('packages/platform-client/src/native.js')).not.toEqual([]);
  expect(checkEngineeringName('packages/project-core/src/native-platform', true)).not.toEqual([]);
  expect(checkEngineeringName('apps/web/src/Page-final.tsx')).not.toEqual([]);
  expect(checkEngineeringName('apps/web/src/__vue-preview__', true)).not.toEqual([]);
  expect(
    checkSourceImports(
      'packages/project-core/src/prototype-cdn-vendor.js',
      "import manifest from '../../../vendor/prototype-cdn/manifest.json';",
    ),
  ).not.toEqual([]);
});
