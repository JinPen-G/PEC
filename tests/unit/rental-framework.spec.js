// @vitest-environment node
import { expect, test } from 'vitest';
import { promises as fs, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkRentalFramework, checkRentalConsole } from '../../scripts/check-rental-framework.mjs';
import { rentalConsoleStyles, rentalConsoleMotion } from '../../scripts/rental-console-styles.mjs';
import { checkSourceImports } from '../../scripts/check-architecture.mjs';
import { checkDocumentation } from '../../scripts/check-docs.mjs';
import { rentalLoginStyles } from '../../scripts/rental-login-styles.mjs';
import postcss from 'postcss';
import { motionPreferenceStyles } from '../../plugins/motion-preference-plugin.js';

async function removeTemporaryFixture(directory) {
  if (
    path.dirname(directory) !== os.tmpdir() ||
    !path.basename(directory).startsWith('preview-framework-check-')
  ) {
    throw new Error('Fixture escapes temporary directory');
  }
  await fs.rm(directory, { recursive: true, force: true });
}

test('fixed upstream UI snapshot and runtime copies retain their source hashes', () => {
  const result = checkRentalFramework();
  expect(result.files).toBeGreaterThan(40);
  expect(result.errors).toEqual([]);
  expect(checkRentalConsole().errors).toEqual([]);
});

test('console adaptation retains fixed geometry and scopes neutral colors away from embedded screens', () => {
  const sourceRoot = new URL('../../packages/preview-ui/', import.meta.url);
  const css = rentalConsoleStyles(
    readFileSync(
      new URL(
        'upstream/rental-console/apps/admin/src/components/animate-sidebar/sidebar-adapter.css',
        sourceRoot,
      ),
      'utf8',
    ),
    readFileSync(new URL('upstream/rental-console/apps/admin/src/app/designTokens.ts', sourceRoot), 'utf8'),
  );
  const parsed = postcss.parse(css);
  const paletteRules = [];
  parsed.walkRules((rule) => {
    if (rule.nodes.some((node) => node.prop === '--rental-sidebar-selected-bg' && node.value.startsWith('color-mix(')))
      paletteRules.push(rule.selector);
  });
  expect(paletteRules).toHaveLength(2);
  expect(paletteRules.every((selector) => selector.includes(':has(.preview-console-host:not(.preview-screen-stage))'))).toBe(true);
  expect(css).toContain('--rental-shell-panel-inset: 8px;');
  expect(css).toContain('--rental-shell-sidebar-width: 248px;');
  expect(css).toContain('--rental-shell-sidebar-collapsed-width: 56px;');
  expect(css).toContain('--rental-shell-top-row-height: 54px;');
  expect(css).toContain('--rental-layout-context-height: 52px;');
  expect(css).toContain('--rental-typography-body-line-height: 20px;');
  expect(css).not.toContain('.app-frame-stage');
  expect(css).toContain('white-space: nowrap');
  expect(css).toContain('width: 6px');
  expect(css).toContain('.preview-context-time');
  expect(css).not.toContain('position: fixed');
  parsed.walkRules((rule) => {
    expect(rule.selector).toContain('.preview-console-host:not(.preview-screen-stage)');
  });
});

test('console token extraction resolves only fixed data and rejects executable expressions', () => {
  const sourceRoot = new URL('../../packages/preview-ui/', import.meta.url);
  const tokens = readFileSync(new URL('upstream/rental-console/apps/admin/src/app/designTokens.ts', sourceRoot), 'utf8');
  const styles = readFileSync(new URL('upstream/rental-console/apps/admin/src/components/animate-sidebar/sidebar-adapter.css', sourceRoot), 'utf8');
  expect(rentalConsoleMotion(tokens)).toContain('"visualDuration": 0.3');
  expect(rentalConsoleMotion(tokens)).toContain('"bounce": 0');
  expect(() => rentalConsoleStyles(styles, tokens.replace('panelInset: 8', 'panelInset: globalThis.parseInt("8")')))
    .toThrow('Unsupported fixed console token expression');
  expect(() => rentalConsoleStyles(styles, tokens.replace('sidebarWidth: 248', 'sidebarWidth: 248.5')))
    .toThrow('Incomplete fixed console metrics');
});

test('console verification rejects changed sources, generated CSS and escaping paths', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'preview-framework-check-'));
  try {
    const sourceRoot = new URL('../../packages/preview-ui/', import.meta.url);
    const manifest = JSON.parse(
      await fs.readFile(new URL('console-source-manifest.json', sourceRoot), 'utf8'),
    );
    for (const record of manifest.files) {
      const file = `upstream/rental-console/${record.source}`;
      const target = path.join(directory, file);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.copyFile(new URL(file, sourceRoot), target);
    }
    await fs.mkdir(path.join(directory, 'src'));
    await fs.copyFile(
      new URL('src/console-source.css', sourceRoot),
      path.join(directory, 'src/console-source.css'),
    );
    await fs.copyFile(new URL('src/console-motion.ts', sourceRoot), path.join(directory, 'src/console-motion.ts'));
    await fs.writeFile(path.join(directory, 'console-source-manifest.json'), JSON.stringify(manifest));
    await fs.appendFile(
      path.join(directory, 'upstream/rental-console', manifest.files[0].source),
      '\n// damaged\n',
    );
    await fs.appendFile(path.join(directory, 'src/console-source.css'), '\n/* damaged */\n');
    await fs.appendFile(path.join(directory, 'src/console-motion.ts'), '\nexport const damaged = true;\n');
    expect(checkRentalConsole(directory).errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Console source changed:'),
        'Console source adapter changed',
        'Console motion adapter changed',
      ]),
    );
    manifest.files.push({ source: '../../outside', sha256: '' });
    await fs.writeFile(path.join(directory, 'console-source-manifest.json'), JSON.stringify(manifest));
    expect(checkRentalConsole(directory).errors).toContain('Invalid console snapshot path');
  } finally {
    await removeTemporaryFixture(directory);
  }
});
test('shared UI allows its declared primitives but cannot import application auth or server code', () => {
  expect(
    checkSourceImports('packages/preview-ui/src/test.tsx', 'import { motion } from "motion/react";'),
  ).toEqual([]);
  expect(
    checkSourceImports('packages/preview-ui/src/test.tsx', 'import x from "@/features/auth/store";'),
  ).toHaveLength(1);
  expect(checkSourceImports('packages/preview-ui/src/test.tsx', 'import fs from "node:fs";')).toHaveLength(1);
});

test('login extraction preserves source declarations and removes unrelated global selectors', () => {
  const css = rentalLoginStyles(
    'body { color: red; } .login-stage { height: 100dvh; } @media (max-width: 640px) { .app-shell, .login-frame { margin: 0; } .business-page { padding: 1px; } }',
  );
  expect(css).toContain('.login-stage { height: 100dvh; }');
  expect(css).toContain('.login-frame { margin: 0; }');
  expect(css).not.toMatch(/body|app-shell|business-page|color: red/u);
});

test('motion CSS honors the browser override while preserving unrelated media queries', async () => {
  const result = await postcss([motionPreferenceStyles()]).process(
    '@media (prefers-reduced-motion: reduce) { .control { transition: none; } } @media (max-width: 640px) { .control { width: 100%; } }',
    { from: undefined },
  );
  expect(result.css).toContain('html[data-reduced-motion="true"]');
  expect(result.css).not.toContain('prefers-reduced-motion: reduce');
  expect(result.css).toContain('@media (max-width: 640px)');
});

test('source verification rejects modified snapshots, runtime copies and CSS adapters', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'preview-framework-check-'));
  try {
    // Full provenance is checked above. The corruption test needs only the two
    // runtime records and source/style adapters, avoiding unrelated image copies.
    const sourceRoot = new URL('../../packages/preview-ui/', import.meta.url);
    const manifest = JSON.parse(await fs.readFile(new URL('source-manifest.json', sourceRoot), 'utf8'));
    const damaged = [
      'apps/admin/src/components/animate-sidebar/runtime/input.tsx',
      'apps/admin/src/components/animate-sidebar/runtime/button.tsx',
    ];
    const required = [
      ...damaged.map((file) => `upstream/rental-admin/${file}`),
      'src/animate-sidebar/runtime/input.tsx',
      'src/animate-sidebar/runtime/button.tsx',
      'upstream/rental-admin/apps/admin/src/components/animate-sidebar/animate-sidebar.css',
      'upstream/rental-admin/apps/admin/src/styles.css',
      'upstream/rental-admin/apps/admin/src/features/ai-operator/ai-operator.css',
      'upstream/rental-admin/apps/admin/src/features/copilot/archive/ai-side-panel/side-panel.css',
      'src/animate-sidebar/animate-sidebar.css',
      'src/login-source.css',
      'src/settings-source.css',
      'src/side-panel-source.css',
    ];
    for (const file of required) {
      const target = path.join(directory, file);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.copyFile(new URL(file, sourceRoot), target);
    }
    await fs.writeFile(
      path.join(directory, 'source-manifest.json'),
      JSON.stringify({
        ...manifest,
        files: manifest.files.filter((record) => damaged.includes(record.source)),
      }),
    );
    const snapshot = path.join(
      directory,
      'upstream/rental-admin/apps/admin/src/components/animate-sidebar/runtime/input.tsx',
    );
    const runtime = path.join(directory, 'src/animate-sidebar/runtime/button.tsx');
    await fs.appendFile(snapshot, '\n// modified snapshot\n');
    await fs.appendFile(runtime, '\n// modified runtime\n');
    await fs.appendFile(
      path.join(directory, 'src/animate-sidebar/animate-sidebar.css'),
      '\n/* modified adapter */\n',
    );
    await fs.appendFile(path.join(directory, 'src/login-source.css'), '\n/* modified login */\n');
    await fs.appendFile(path.join(directory, 'src/settings-source.css'), '\n/* modified settings */\n');
    await fs.appendFile(path.join(directory, 'src/side-panel-source.css'), '\n/* escaped panel reset */\n');
    const result = checkRentalFramework(directory);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Upstream changed:'),
        expect.stringContaining('Runtime changed:'),
        'Sidebar scanning adapter changed',
        'Login source adapter changed',
        'Settings source adapter changed',
        'Side panel scope adapter changed',
      ]),
    );
    await fs.mkdir(path.join(directory, 'packages/preview-ui'), { recursive: true });
    await fs.writeFile(path.join(directory, 'package.json'), '{"scripts":{}}');
    await fs.writeFile(path.join(directory, 'packages/preview-ui/README.md'), '[missing](missing.md)');
    expect(checkDocumentation(directory).errors).toContain(
      'packages/preview-ui/README.md: 链接目标不存在 missing.md',
    );
  } finally {
    await removeTemporaryFixture(directory);
  }
});
