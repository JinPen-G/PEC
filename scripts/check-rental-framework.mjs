/** Verify local upstream bytes and immutable runtime copies without accessing Rental OS. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import { rentalLoginStyles } from './rental-login-styles.mjs';
import { rentalSettingsStyles, rentalSidePanelStyles } from './rental-settings-styles.mjs';

const ROOT = fileURLToPath(new URL('../packages/preview-ui/', import.meta.url));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
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
  for (const error of result.errors) console.error(error);
  console.log(`Rental UI 来源检查：${result.files} 份固定源码，${result.errors.length} 个错误。`);
  process.exitCode = result.errors.length ? 1 : 0;
}
