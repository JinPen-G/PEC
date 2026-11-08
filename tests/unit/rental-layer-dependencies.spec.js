// @vitest-environment node
import { createRequire } from 'node:module';
import { realpathSync } from 'node:fs';
import { expect, test } from 'vitest';
const require = createRequire(import.meta.url);
test('nested Rental overlays share one pointer-lock and focus-scope implementation', () => {
  const menu = createRequire(require.resolve('@radix-ui/react-dropdown-menu')).resolve(
    '@radix-ui/react-menu',
  );
  const owners = [
    require.resolve('@radix-ui/react-dialog'),
    require.resolve('@radix-ui/react-popover'),
    require.resolve('@radix-ui/react-select'),
    menu,
  ];
  for (const dependency of ['@radix-ui/react-dismissable-layer', '@radix-ui/react-focus-scope']) {
    const implementations = owners.map((owner) => realpathSync(createRequire(owner).resolve(dependency)));
    expect(new Set(implementations).size, `${dependency} must not retain separate global modal state`).toBe(
      1,
    );
  }
});
