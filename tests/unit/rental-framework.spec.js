// @vitest-environment node
import { expect, test } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkRentalFramework } from '../../scripts/check-rental-framework.mjs';
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
