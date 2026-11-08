/** Verify the imported controls without consulting or changing Rental OS. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = fileURLToPath(new URL('../packages/preview-ui/', import.meta.url));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function checkRentalControls(root = ROOT) {
  const manifest = JSON.parse(readFileSync(path.join(root, 'controls-source-manifest.json'), 'utf8'));
  const errors = [];
  const verify = (base, relative, expected) => {
    const absolute = path.resolve(base, relative);
    if (!absolute.startsWith(path.resolve(base) + path.sep)) {
      errors.push(`Invalid control source path: ${relative}`);
      return;
    }
    try {
      if (hash(readFileSync(absolute)) !== expected) errors.push(`Control source changed: ${relative}`);
    } catch {
      errors.push(`Control source missing: ${relative}`);
    }
  };
  if (!/^[a-f\d]{40}$/.test(manifest.commit)) errors.push('Controls require a fixed source commit');
  for (const item of manifest.files) {
    verify(path.join(root, 'upstream/rental-controls'), item.source, item.sha256);
    if (item.runtime) {
      if (!item.runtime.startsWith('src/admin-controls/runtime/'))
        errors.push(`Invalid runtime control path: ${item.runtime}`);
      else verify(root, item.runtime, item.runtimeSha256);
    }
  }
  verify(root, 'src/admin-controls/host-tokens.ts', manifest.tokensSha256);
  verify(root, 'src/loading-source.css', manifest.loadingCssSha256);
  return { files: manifest.files.length, commit: manifest.commit, errors };
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const result = checkRentalControls();
  for (const error of result.errors) console.error(error);
  console.log(`Rental controls: ${result.files} source files, ${result.errors.length} errors.`);
  process.exitCode = result.errors.length ? 1 : 0;
}
