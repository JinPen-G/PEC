/** Import a fixed, read-only Rental OS UI snapshot into Preview. Never runs
 * installs, builds, checkouts or writes in the source repository. Existing local
 * edits in an imported snapshot are rejected rather than overwritten. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { rentalLoginStyles } from './rental-login-styles.mjs';
import { rentalSettingsStyles, rentalSidePanelStyles } from './rental-settings-styles.mjs';
import { sourcePaths } from './source-paths.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const value = (name) => args[args.indexOf(name) + 1];
if (!args.includes('--source') || !args.includes('--commit')) {
  throw new Error('Required: --source <read-only Rental OS repo> --commit <full SHA>');
}
const source = path.resolve(value('--source'));
const commit = value('--commit');
const paths = sourcePaths(args.includes('--primitives-root') ? value('--primitives-root') : undefined);
if (!/^[a-f\d]{40}$/u.test(commit) || source === root) throw new Error('Invalid source or fixed commit');
const destination = path.join(root, 'packages/preview-ui/upstream/rental-admin');
const derived = path.join(root, 'packages/preview-ui/src/animate-sidebar');
const env = { ...process.env, GIT_OPTIONAL_LOCKS: '0' };
const git = (parameters) => execFileSync('git', ['--no-optional-locks', ...parameters], { cwd: source, env });
const prefixes = [
  'apps/admin/src/components/animate-sidebar/',
  'apps/admin/src/features/copilot/archive/ai-side-panel/',
  'packages/ui-primitives/vendor/registry/components/input/',
  'packages/ui-primitives/vendor/registry/components/password-field/',
  'packages/ui-primitives/vendor/registry/components/segmented-control/',
  'packages/ui-primitives/vendor/registry/components/theme-switch/',
  'packages/ui-primitives/vendor/registry/components/color-picker/',
  'packages/ui-primitives/vendor/registry/components/slider/',
  'packages/ui-primitives/vendor/registry/components/switch/',
  'packages/ui-primitives/vendor/registry/components/select/',
  'packages/ui-primitives/vendor/registry/components/text-morph/',
  'apps/admin/src/features/sound/',
];
const individual = new Set([
  'apps/admin/src/components/AppShell.tsx',
  'apps/admin/src/features/auth/LoginPage.tsx',
  'apps/admin/src/components/WorkspaceClock.tsx',
  'apps/admin/src/app/userAvatar.ts',
  'apps/admin/src/assets/default-user-avatar.jpg',
  'apps/admin/public/brand/login-graphite.webp',
  'packages/ui-primitives/vendor/registry/blocks/login-centered/login-centered.module.css',
  'apps/admin/src/features/copilot/CopilotLayout.tsx',
  'apps/admin/src/features/copilot/copilot.css',
  'apps/admin/config/nativeSidebarStyles.ts',
  'apps/admin/config/motionPreferenceAdapter.ts',
  'apps/admin/src/lib/usePrefersReducedMotion.ts',
  'apps/admin/src/app/MotionPreferenceProvider.tsx',
  'apps/admin/src/styles.css',
  'apps/admin/src/app/designTokens.ts',
  'apps/admin/src/app/arcTokens.ts',
  'apps/admin/src/app/theme.tsx',
  'apps/admin/src/app/motionPreferences.ts',
  'apps/admin/src/features/appearance/AppearancePage.tsx',
  'apps/admin/src/features/appearance/MotionSettingCard.tsx',
  'apps/admin/src/features/rental-core/RentalOrdersPage.tsx',
  'apps/admin/src/features/rental-core/RentalOrdersPage.module.css',
  'apps/admin/src/features/rental-core/rentalOrderColumns.tsx',
  'apps/admin/src/components/ui/data-table/DataTable.module.css',
  'packages/ui-tablecn/LICENSE.md',
  'packages/ui-tablecn/README.md',
  'apps/admin/src/features/ai-operator/AiOperatorNavigation.tsx',
  'apps/admin/src/features/ai-operator/ai-operator.css',
  'apps/admin/src/components/ui/Slider.tsx',
  'apps/admin/src/components/ui/ColorPicker.tsx',
  'apps/admin/src/components/ui/Segmented.tsx',
  'apps/admin/src/components/ui/Select.tsx',
  'apps/admin/src/components/ui/Switch.tsx',
  'apps/admin/src/components/PageHeader.tsx',
  'apps/admin/src/components/ui/arc-bridge.css',
  'apps/admin/src/components/ui/input-radius.css',
  'packages/shared/src/platform.ts',
  'packages/ui-primitives/README.md',
  'packages/ui-primitives/LICENSE',
  'packages/ui-primitives/vendor/registry/foundation.css',
  'packages/ui-primitives/vendor/registry/components/button/button.tsx',
  'packages/ui-primitives/vendor/registry/components/button/button.module.css',
  'packages/ui-primitives/vendor/lib/motion-tokens.ts',
  'packages/ui-primitives/vendor/registry/motion-tokens.ts',
]);
const files = git([
  'ls-tree',
  '-r',
  '--name-only',
  commit,
  '--',
  ...prefixes.map(paths.toSource),
  ...[...individual].map(paths.toSource),
])
  .toString('utf8')
  .trim()
  .split('\n')
  .map(paths.toLocal)
  .filter((file) => individual.has(file) || prefixes.some((prefix) => file.startsWith(prefix)));
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const write = (target, bytes) => {
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Destination escapes Preview');
  if (existsSync(target)) {
    if (digest(readFileSync(target)) !== digest(bytes)) {
      throw new Error(
        `Existing snapshot differs; choose a new version directory: ${path.relative(root, target)}`,
      );
    }
    return;
  }
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, bytes);
};
const records = [];
for (const file of files) {
  const bytes = git(['show', `${commit}:${paths.toSource(file)}`]);
  write(path.join(destination, file), bytes);
  records.push({ source: file, sha256: digest(bytes) });
  const runtimePrefix = 'apps/admin/src/components/animate-sidebar/runtime/';
  if (file.startsWith(runtimePrefix))
    write(path.join(derived, 'runtime', file.slice(runtimePrefix.length)), bytes);
}
const cssSource = git([
  'show',
  `${commit}:apps/admin/src/components/animate-sidebar/animate-sidebar.css`,
]).toString('utf8');
// Source scanning includes Preview integration files; source styles stay unchanged.
const css = cssSource.replace('@source "../AppShell.tsx";', '@source "../*.tsx";');
write(path.join(derived, 'animate-sidebar.css'), css);
const scopeSource = git(['show', `${commit}:apps/admin/config/nativeSidebarStyles.ts`]).toString('utf8');
const plugin = ts.transpileModule(scopeSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
write(path.join(root, 'plugins/sidebar-styles.js'), plugin);
const motionSource = git(['show', `${commit}:apps/admin/config/motionPreferenceAdapter.ts`])
  .toString('utf8')
  .replace(
    '../src/lib/usePrefersReducedMotion.ts',
    '../apps/web/src/features/motion/use-motion-preference.ts',
  );
write(
  path.join(root, 'plugins/motion-preference-plugin.js'),
  ts.transpileModule(motionSource, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText,
);
write(
  path.join(root, 'packages/preview-ui/src/login-source.css'),
  rentalLoginStyles(git(['show', `${commit}:apps/admin/src/styles.css`]).toString('utf8')),
);
mkdirSync(path.join(root, 'packages/preview-ui'), { recursive: true });
write(
  path.join(root, 'packages/preview-ui/src/settings-source.css'),
  rentalSettingsStyles(
    git(['show', `${commit}:apps/admin/src/styles.css`]).toString('utf8'),
    git(['show', `${commit}:apps/admin/src/features/ai-operator/ai-operator.css`]).toString('utf8'),
  ),
);
write(
  path.join(root, 'packages/preview-ui/src/side-panel-source.css'),
  rentalSidePanelStyles(
    git(['show', `${commit}:apps/admin/src/features/copilot/archive/ai-side-panel/side-panel.css`]).toString(
      'utf8',
    ),
  ),
);
writeFileSync(
  path.join(root, 'packages/preview-ui/source-manifest.json'),
  JSON.stringify(
    {
      schemaVersion: 1,
      source: 'Rental OS',
      commit,
      files: records,
      licenses: [
        'apps/admin/src/components/animate-sidebar/LICENSE.md',
        'packages/ui-primitives/LICENSE',
        'packages/ui-tablecn/LICENSE.md',
      ],
      integration: 'Preview-only; runtime copies and CSS scanning are adapters, not upstream modifications.',
    },
    null,
    2,
  ) + '\n',
);
console.log(`Imported ${records.length} fixed-source files into Preview; Rental OS was read only.`);
