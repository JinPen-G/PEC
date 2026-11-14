/** Import a fixed UI-only dependency closure. Rental OS is read exclusively with
 * git show/ls-tree; runtime adapters never connect to its auth, API or Copilot. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { sourcePaths } from './source-paths.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : '');
const source = path.resolve(option('--source'));
const commit = option('--commit');
const paths = sourcePaths(option('--primitives-root') || undefined);
if (!option('--source') || !/^[a-f\d]{40}$/.test(commit) || source === root)
  throw new Error('Use --source <read-only repository> --commit <fixed SHA>');
const git = (...params) =>
  execFileSync('git', ['--no-optional-locks', ...params], { cwd: source, maxBuffer: 32 * 1024 * 1024 });
const names = new Set(
  git(
    'ls-tree',
    '-r',
    '--name-only',
    commit,
    '--',
    'apps/admin/src/components',
    'apps/admin/src/app/designTokens.ts',
    'apps/admin/src/app/serverFormSnapshot.ts',
    paths.toSource('packages/ui-primitives'),
    'packages/ui-tablecn',
    'packages/ui-motiq',
  )
    .toString('utf8')
    .trim()
    .split('\n')
    .map(paths.toLocal),
);
const resolve = (file) =>
  [file, `${file}.ts`, `${file}.tsx`, `${file}.css`, `${file}/index.ts`, `${file}/index.tsx`].find((name) =>
    names.has(name),
  );
const ui = path.join(root, 'packages/preview-ui');
const originalRoot = path.join(ui, 'upstream/rental-controls');
const runtimeRoot = path.join(ui, 'src/admin-controls/runtime');
const environment = path.join(ui, 'src/admin-controls/environment.tsx');
const tokens = path.join(ui, 'src/admin-controls/host-tokens.ts');
const adapters = new Set([
  '@/app/locale',
  '@/features/auth/authStore',
  '@/lib/usePrefersReducedMotion',
  '@/features/copilot/CopilotProvider',
  '@/features/copilot/context',
]);
function targetFor(file, specifier) {
  if (adapters.has(specifier)) return { adapter: environment };
  if (specifier === '@rental-os/shared') return { adapter: tokens };
  let target;
  if (specifier.startsWith('.'))
    target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
  else if (specifier.startsWith('@/registry/'))
    target = `packages/ui-primitives/vendor/registry/${specifier.slice('@/registry/'.length)}`;
  else if (specifier === '@/lib/motion-tokens') target = 'packages/ui-primitives/vendor/lib/motion-tokens';
  else if (
    specifier.startsWith('@/lib/') &&
    resolve(`packages/ui-primitives/vendor/lib/${specifier.slice('@/lib/'.length)}`)
  )
    target = `packages/ui-primitives/vendor/lib/${specifier.slice('@/lib/'.length)}`;
  else if (specifier.startsWith('@/')) target = `apps/admin/src/${specifier.slice(2)}`;
  else return null;
  const found = resolve(target);
  if (!found || found.endsWith('/ui/index.ts'))
    throw new Error(`Unreviewed dependency: ${file} -> ${specifier}`);
  return { file: found };
}
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const previousFile = path.join(ui, 'controls-source-manifest.json');
const previous = fs.existsSync(previousFile) ? JSON.parse(fs.readFileSync(previousFile, 'utf8')) : null;
if (previous && previous.commit !== commit)
  throw new Error('Use a new snapshot directory for an upstream version change');
function write(file, bytes, expected) {
  if (!path.resolve(file).startsWith(ui + path.sep)) throw new Error('Destination outside Preview UI');
  if (
    fs.existsSync(file) &&
    hash(fs.readFileSync(file)) !== hash(bytes) &&
    (!expected || hash(fs.readFileSync(file)) !== expected)
  )
    throw new Error(`Preserve modified file: ${path.relative(root, file)}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
}
const seeds = [
  'Table',
  'Form',
  'Input',
  'Select',
  'Modal',
  'Tabs',
  'Alert',
  'Empty',
  'Pagination',
  'Switch',
  'SearchField',
  'Feedback',
  'DatePicker',
  'Dropdown',
  'Checkbox',
];
const queue = [
  ...seeds.map((name) => `apps/admin/src/components/ui/${name}.tsx`),
  'apps/admin/src/components/LoadingState.tsx',
  'apps/admin/src/components/ui/input-colors.css',
];
const records = [],
  seen = new Set(),
  external = new Set();
while (queue.length) {
  const file = queue.shift();
  if (seen.has(file)) continue;
  seen.add(file);
  const bytes = git('show', `${commit}:${paths.toSource(file)}`);
  let transformed = bytes.toString('utf8');
  const imports = /\.(?:tsx?|jsx?)$/.test(file)
    ? ts.preProcessFile(transformed, true, true).importedFiles
    : [];
  for (const item of [...imports].sort((a, b) => b.pos - a.pos)) {
    const target = targetFor(file, item.fileName);
    if (!target) {
      external.add(item.fileName);
      continue;
    }
    if (target.file) queue.push(target.file);
    let relative = path
      .relative(
        path.dirname(path.join(runtimeRoot, file)),
        target.adapter ?? path.join(runtimeRoot, target.file),
      )
      .replaceAll('\\', '/');
    if (!relative.startsWith('.')) relative = `./${relative}`;
    if (/\.(tsx?|jsx?)$/.test(relative)) relative = relative.replace(/\.(tsx?|jsx?)$/, '');
    // TypeScript positions include the quotes; replace only the source string.
    const start = transformed.indexOf(item.fileName, item.pos);
    if (start < 0 || start > item.end) throw new Error(`Cannot adapt import: ${file}`);
    transformed = transformed.slice(0, start) + relative + transformed.slice(start + item.fileName.length);
  }
  const old = previous?.files.find((record) => record.source === file);
  write(path.join(originalRoot, file), bytes);
  write(path.join(runtimeRoot, file), transformed, old?.runtimeSha256);
  records.push({
    source: file,
    sha256: hash(bytes),
    runtime: path.relative(ui, path.join(runtimeRoot, file)).replaceAll('\\', '/'),
    runtimeSha256: hash(transformed),
  });
}
for (const file of [
  'packages/ui-primitives/LICENSE',
  'packages/ui-tablecn/LICENSE.md',
  'packages/ui-motiq/LICENSE',
  'packages/ui-motiq/README.md',
  'apps/admin/src/styles.css',
]) {
  const bytes = git('show', `${commit}:${paths.toSource(file)}`);
  write(path.join(originalRoot, file), bytes);
  records.push({ source: file, sha256: hash(bytes) });
}
const platform = git('show', `${commit}:packages/shared/src/platform.ts`).toString('utf8');
const declarations = [
  ...platform.matchAll(/^export const ADMIN_UI_CORNER_RADIUS_(?:MIN|MAX|DEFAULT|FULL) = \d+;/gm),
].map((match) => match[0]);
if (declarations.length !== 4) throw new Error('Corner token contract changed');
write(
  tokens,
  `/** Four fixed UI constants only; Rental OS business contracts are excluded. */\n${declarations.join('\n')}\n`,
  previous?.tokensSha256,
);
const css = fs.readFileSync(path.join(originalRoot, 'apps/admin/src/styles.css'), 'utf8');
const loading = css.slice(css.indexOf('.query-state-loading {'), css.indexOf('\n.password-change-stage {'));
if (!loading.includes('@keyframes rental-pixel-on')) throw new Error('Loading CSS contract changed');
const loadingCss = `${loading}\n@media (prefers-reduced-motion: reduce) {\n  .rental-loading-cell { animation: none !important; opacity: .48; transform: none; }\n}\n`;
write(path.join(ui, 'src/loading-source.css'), loadingCss, previous?.loadingCssSha256);
const manifest = {
  schemaVersion: 1,
  source: 'Rental OS',
  commit,
  files: records,
  external: [...external].sort(),
  tokensSha256: hash(fs.readFileSync(tokens)),
  loadingCssSha256: hash(loadingCss),
  adaptations: [
    'Import paths only in runtime copies',
    'Host locale and UI identity adapters; no Rental OS auth/API/Copilot',
    'Four UI corner constants only; no shared business contracts',
    'Original pixel loading CSS and reduced-motion rule',
  ],
};
fs.writeFileSync(previousFile, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Imported ${records.length} fixed Rental OS control files into Preview.`);
