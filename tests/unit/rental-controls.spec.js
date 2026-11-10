// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { checkRentalControls } from '../../scripts/check-rental-controls.mjs';
const fixtures = [];
afterEach(async () => {
  for (const root of fixtures.splice(0)) {
    if (path.dirname(root) !== os.tmpdir() || !path.basename(root).startsWith('preview-controls-'))
      throw new Error('Unsafe test path');
    await fs.rm(root, { recursive: true, force: true });
  }
});
test('fixed controls reject changed raw files, runtime copies, styles and escaping paths', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preview-controls-'));
  fixtures.push(root);
  const hash = (value) => createHash('sha256').update(value).digest('hex');
  const paths = [
    'upstream/rental-controls/component.tsx',
    'src/admin-controls/runtime/component.tsx',
    'src/admin-controls/host-tokens.ts',
    'src/loading-source.css',
  ];
  for (const file of paths) {
    await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await fs.writeFile(path.join(root, file), 'original');
  }
  const manifest = {
    commit: 'a'.repeat(40),
    files: [
      {
        source: 'component.tsx',
        sha256: hash('original'),
        runtime: 'src/admin-controls/runtime/component.tsx',
        runtimeSha256: hash('original'),
      },
    ],
    tokensSha256: hash('original'),
    loadingCssSha256: hash('original'),
  };
  await fs.writeFile(path.join(root, 'controls-source-manifest.json'), JSON.stringify(manifest));
  expect(checkRentalControls(root).errors).toEqual([]);
  for (const file of paths) {
    await fs.writeFile(path.join(root, file), 'changed');
    expect(checkRentalControls(root).errors).toHaveLength(1);
    await fs.writeFile(path.join(root, file), 'original');
  }
  manifest.files[0].source = '../../outside';
  await fs.writeFile(path.join(root, 'controls-source-manifest.json'), JSON.stringify(manifest));
  expect(checkRentalControls(root).errors[0]).toContain('Invalid control source path');
});

test('Git preserves fixed runtime control bytes across newline settings', () => {
  const options = {
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    input: 'body {\r\n  display: block;\r\n}\r\n',
    encoding: 'utf8',
  };
  const original = execFileSync('git', ['hash-object', '--stdin', '--no-filters'], options).trim();
  const runtime =
    'packages/preview-ui/src/admin-controls/runtime/apps/admin/src/components/selection-toolbar/archive/original.css';
  for (const autocrlf of ['false', 'true']) {
    const stored = execFileSync(
      'git',
      ['-c', `core.autocrlf=${autocrlf}`, 'hash-object', '--stdin', '--path', runtime],
      options,
    ).trim();
    expect(stored).toBe(original);
  }
});
