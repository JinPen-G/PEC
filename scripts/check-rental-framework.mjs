/** Verify local upstream bytes and immutable runtime copies without accessing Rental OS. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import { rentalLoginStyles } from './rental-login-styles.mjs';
import { rentalSettingsStyles, rentalSidePanelStyles } from './rental-settings-styles.mjs';
import { rentalConsoleStyles, rentalConsoleMotion } from './rental-console-styles.mjs';

const ROOT = fileURLToPath(new URL('../packages/preview-ui/', import.meta.url));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function checkRentalConsole(root = ROOT) {
  const errors = [];
  const manifest = JSON.parse(readFileSync(path.join(root, 'console-source-manifest.json'), 'utf8'));
  const sourceRoot = path.resolve(root, 'upstream/rental-console');
  for (const record of manifest.files) {
    const source = path.resolve(sourceRoot, record.source);
    if (!source.startsWith(sourceRoot + path.sep)) {
      errors.push('Invalid console snapshot path');
      continue;
    }
    try {
      if (hash(readFileSync(source)) !== record.sha256)
        errors.push(`Console source changed: ${record.source}`);
    } catch {
      errors.push(`Missing console snapshot: ${record.source}`);
    }
  }
  try {
    const expected = rentalConsoleStyles(
      readFileSync(
        path.join(sourceRoot, 'apps/admin/src/components/animate-sidebar/sidebar-adapter.css'),
        'utf8',
      ),
      readFileSync(path.join(sourceRoot, 'apps/admin/src/app/designTokens.ts'), 'utf8'),
    );
    if (readFileSync(path.join(root, 'src/console-source.css'), 'utf8') !== expected)
      errors.push('Console source adapter changed');
    if (readFileSync(path.join(root, 'src/console-motion.ts'), 'utf8') !== rentalConsoleMotion(
      readFileSync(path.join(sourceRoot, 'apps/admin/src/app/designTokens.ts'), 'utf8'),
    )) errors.push('Console motion adapter changed');
  } catch {
    errors.push('Console source adapter unavailable');
  }
  return { files: manifest.files.length, commit: manifest.commit, errors };
}
export function checkRentalFramework(root = ROOT) {
  const manifest = JSON.parse(readFileSync(path.join(root, 'source-manifest.json'), 'utf8'));
  const errors = [];
  for (const record of manifest.files) {
    const source = path.resolve(root, 'upstream/rental-admin', record.source);
    if (!source.startsWith(path.resolve(root, 'upstream/rental-admin') + path.sep)) {
      errors.push('Invalid snapshot path');
      continue;
    }
    try {
      const bytes = readFileSync(source);
      if (hash(bytes) !== record.sha256) errors.push(`Upstream changed: ${record.source}`);
      const prefix = 'apps/admin/src/components/animate-sidebar/runtime/';
      if (
        record.source.startsWith(prefix) &&
        hash(
          readFileSync(path.join(root, 'src/animate-sidebar/runtime', record.source.slice(prefix.length))),
        ) !== record.sha256
      )
        errors.push(`Runtime changed: ${record.source}`);
    } catch {
      errors.push(`Missing snapshot: ${record.source}`);
    }
  }
  const css = readFileSync(
    path.join(root, 'upstream/rental-admin/apps/admin/src/components/animate-sidebar/animate-sidebar.css'),
    'utf8',
  ).replace('@source "../AppShell.tsx";', '@source "../*.tsx";');
  if (readFileSync(path.join(root, 'src/animate-sidebar/animate-sidebar.css'), 'utf8') !== css)
    errors.push('Sidebar scanning adapter changed');
  if (
    readFileSync(path.join(root, 'src/login-source.css'), 'utf8') !==
    rentalLoginStyles(
      readFileSync(path.join(root, 'upstream/rental-admin/apps/admin/src/styles.css'), 'utf8'),
    )
  )
    errors.push('Login source adapter changed');
  if (
    readFileSync(path.join(root, 'src/settings-source.css'), 'utf8') !==
    rentalSettingsStyles(
      readFileSync(path.join(root, 'upstream/rental-admin/apps/admin/src/styles.css'), 'utf8'),
      readFileSync(
        path.join(root, 'upstream/rental-admin/apps/admin/src/features/ai-operator/ai-operator.css'),
        'utf8',
      ),
    )
  )
    errors.push('Settings source adapter changed');
  if (
    readFileSync(path.join(root, 'src/side-panel-source.css'), 'utf8') !==
    rentalSidePanelStyles(
      readFileSync(
        path.join(
          root,
          'upstream/rental-admin/apps/admin/src/features/copilot/archive/ai-side-panel/side-panel.css',
        ),
        'utf8',
      ),
    )
  )
    errors.push('Side panel scope adapter changed');
  return { files: manifest.files.length, commit: manifest.commit, errors };
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const result = checkRentalFramework();
  const consoleResult = checkRentalConsole();
  const errors = [...result.errors, ...consoleResult.errors];
  for (const error of errors) console.error(error);
  console.log(
    `Rental UI 来源检查：${result.files} 份框架与 ${consoleResult.files} 份控制台来源，${errors.length} 个错误。`,
  );
  process.exitCode = errors.length ? 1 : 0;
}
