// @vitest-environment node
import { expect, test } from 'vitest';
import { sourcePaths } from '../../scripts/source-paths.mjs';

test('maps a selected source package without changing sibling or application paths', () => {
  const mapping = sourcePaths('packages/external-widgets');
  expect(mapping.toSource('packages/ui-primitives/vendor/input.tsx')).toBe(
    'packages/external-widgets/vendor/input.tsx',
  );
  expect(mapping.toLocal('packages/external-widgets/vendor/input.tsx')).toBe(
    'packages/ui-primitives/vendor/input.tsx',
  );
  expect(mapping.toLocal('packages/external-widgets-more/input.tsx')).toBe(
    'packages/external-widgets-more/input.tsx',
  );
  expect(mapping.toSource('apps/admin/Example.tsx')).toBe('apps/admin/Example.tsx');
});

test.each(['../outside', '/packages/widgets', 'packages/../outside', 'packages/widgets/../../outside'])(
  'rejects an unsafe upstream package %s',
  (directory) => expect(() => sourcePaths(directory)).toThrow('relative package directory'),
);
