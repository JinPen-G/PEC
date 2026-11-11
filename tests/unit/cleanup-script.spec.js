// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, expect, test } from 'vitest';

const script = fileURLToPath(new URL('../../scripts/clean-generated.ps1', import.meta.url));
const temporaryRoots = [];
const windowsTest = test.skipIf(process.platform !== 'win32');
const literal = (value) => `'${value.replaceAll("'", "''")}'`;

afterEach(async () => {
  for (const root of temporaryRoots.splice(0)) {
    if (path.dirname(root) !== os.tmpdir() || !path.basename(root).startsWith('preview-cleanup-test-')) {
      throw new Error('Unsafe cleanup test fixture');
    }
    await fs.rm(root, { recursive: true, force: true });
  }
});

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'preview-cleanup-test-'));
  temporaryRoots.push(root);
  execFileSync('git', ['init', '--quiet', root]);
  await fs.writeFile(path.join(root, '.gitignore'), '/output/\n/.preview-data/\n/node_modules/\n');
  await fs.mkdir(path.join(root, 'output/web'), { recursive: true });
  await fs.writeFile(path.join(root, 'output/web/index.html'), 'generated');
  return root;
}

function powershell(root, probe) {
  return execFileSync(
    'powershell.exe',
    [
      '-NoLogo', '-NoProfile', '-NonInteractive', '-Command',
      `$ErrorActionPreference = 'Stop'; . ${literal(script)}; $root = ${literal(root)}; ` +
        "function Remove-Item { throw 'Real deletion is forbidden in this test' }; " + probe,
    ],
    { encoding: 'utf8', timeout: 30000 },
  ).trim();
}

test('cleanup only exposes a manual confirmation switch and defaults Enter to cancel', async () => {
  const source = await fs.readFile(script, 'utf8');
  expect(source.startsWith('\ufeff[CmdletBinding()]')).toBe(true);
  expect(source).toContain('param([switch]$ConfirmCleanup)');
  expect(source).toContain('$form.AcceptButton = $cancel');
  expect(source).toContain('$form.CancelButton = $cancel');
  expect(source).not.toMatch(/ExecutionPolicy|Start-Process|EncodedCommand|RunAs|cmd\s+\/c/i);
});

windowsTest('planning excludes private data, manifests, final evidence and real dependencies', async () => {
  const root = await fixture();
  for (const file of [
    '.preview-data/platform.sqlite', '.preview-data/archives/source.md',
    '.preview-data/backups/safe.sqlite', 'node_modules/library/index.js',
    'output/rimo-import/pages.json', 'output/evidence/rimo-import/vehicle.png',
    'output/evidence/rimo-import/batch-vehicle.png',
  ]) {
    await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await fs.writeFile(path.join(root, file), 'preserved');
  }
  const planned = JSON.parse(powershell(root,
    '@(Get-CleanupPlan $root | Select-Object -ExpandProperty Relative) | ConvertTo-Json -Compress'));
  expect(planned).toEqual(['output/evidence/rimo-import/vehicle.png', 'output/web']);
  powershell(root, 'Invoke-GeneratedCleanup -WorkspaceRoot $root');
  expect(await fs.readFile(path.join(root, 'output/web/index.html'), 'utf8')).toBe('generated');
});

windowsTest('referenced screenshots are kept even when newer captures exist', async () => {
  const root = await fixture();
  const directory = path.join(root, 'output/evidence/rimo-import');
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'vehicle.png'), 'first');
  await fs.writeFile(path.join(directory, 'batch-vehicle.png'), 'second');
  await fs.writeFile(path.join(root, 'README.md'), 'Keep vehicle.png as acceptance evidence.');
  expect(powershell(root,
    '(Get-CleanupPlan $root | Select-Object -ExpandProperty Relative) -join ","')).toBe('output/web');
});

windowsTest('empty generated directories remain valid zero-byte cleanup candidates', async () => {
  const root = await fixture();
  await fs.mkdir(path.join(root, 'node_modules/.vite-temp'), { recursive: true });
  const planned = JSON.parse(powershell(root,
    'Get-CleanupPlan $root | Where-Object Relative -eq "node_modules/.vite-temp" | ConvertTo-Json -Compress'));
  expect(planned).toMatchObject({ Files: 0, Bytes: 0, Relative: 'node_modules/.vite-temp' });
});

windowsTest('tracked files and nonignored files fail closed', async () => {
  const root = await fixture();
  execFileSync('git', ['-C', root, 'add', '-f', '--', 'output/web/index.html']);
  expect(powershell(root,
    'try { Get-CleanupPlan $root | Out-Null; "unsafe" } catch { "rejected" }')).toBe('rejected');
  const unignored = await fixture();
  await fs.writeFile(path.join(unignored, '.gitignore'), '');
  expect(powershell(unignored,
    'try { Get-CleanupPlan $root | Out-Null; "unsafe" } catch { "rejected" }')).toBe('rejected');
});

windowsTest('outside paths and directory junctions are rejected before traversal', async () => {
  const root = await fixture();
  const outside = await fixture();
  await fs.symlink(outside, path.join(root, 'output/web/linked'), 'junction');
  expect(powershell(root,
    'try { Get-CleanupPlan $root | Out-Null; "unsafe" } catch { "rejected" }')).toBe('rejected');
  expect(powershell(root,
    'try { Resolve-CleanupPath $root "../outside"; "unsafe" } catch { "rejected" }')).toBe('rejected');
});

windowsTest('canceling confirmation never calls deletion', async () => {
  const root = await fixture();
  powershell(root,
    'function Assert-CleanupIdle {}; function Show-CleanupConfirmation { return $false }; ' +
    'Invoke-GeneratedCleanup -WorkspaceRoot $root -ConfirmCleanup');
  expect(await fs.readFile(path.join(root, 'output/web/index.html'), 'utf8')).toBe('generated');
});

windowsTest('a changed plan after confirmation refuses deletion', async () => {
  const root = await fixture();
  expect(powershell(root,
    'function Assert-CleanupIdle {}; function Show-CleanupConfirmation { ' +
    'Set-Content -LiteralPath (Join-Path $root "output/web/index.html") -Value "changed during confirmation"; return $true }; ' +
    'try { Invoke-GeneratedCleanup -WorkspaceRoot $root -ConfirmCleanup; "unsafe" } catch { "rejected" }')
    .endsWith('rejected')).toBe(true);
  expect(await fs.readFile(path.join(root, 'output/web/index.html'), 'utf8')).toContain('changed during confirmation');
});
