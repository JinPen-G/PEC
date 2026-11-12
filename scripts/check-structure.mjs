/** Check owned engineering names and root layout; original resources and source snapshots retain their names. */
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const directories = new Set([
  '.git',
  '.github',
  '.claude',
  '.vscode',
  '.idea',
  '.preview-data',
  'apps',
  'packages',
  'plugins',
  'scripts',
  'tests',
  'templates',
  'docs',
  'deploy',
  'resources',
  'projects',
  'project-content',
  'vendor',
  'node_modules',
  'output',
]);
const rootFiles = new Set([
  '.git',
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  'LICENSE.md',
  'NOTICE',
  '.gitignore',
  '.gitattributes',
  '.prettierignore',
  '.prettierrc.json',
  '.editorconfig',
  '.npmrc',
  'package.json',
  'package-lock.json',
  'eslint.config.js',
  'vite.config.js',
  'vitest.config.js',
  'playwright.config.js',
  'postcss.config.js',
  'tailwind.config.js',
  'start-dev.cmd',
  'start-server.cmd',
  'build-web.cmd',
  'build-server.cmd',
]);
const sourceRoots = ['apps', 'packages', 'plugins', 'scripts', 'tests', 'templates', 'deploy'];
const preserved = [
  'packages/preview-ui/upstream/',
  'packages/preview-ui/src/admin-controls/runtime/',
  'packages/preview-ui/src/animate-sidebar/runtime/',
  'packages/preview-ui/src/site/auth-registry/',
  'packages/preview-ui/src/site/fonts/',
  'apps/web/public/',
];
export function checkEngineeringName(relative, directory = false) {
  if (preserved.some((prefix) => relative.startsWith(prefix))) return [];
  const name = path.posix.basename(relative);
  if (directory) {
    if (
      /^(?:native|legacy)-/.test(name) ||
      /-(?:native|legacy)$/.test(name) ||
      relative === 'packages/platform-mcp' ||
      relative === 'templates/project-package'
    )
      return [`${relative}: 已退役或按历史实现区分的目录`];
    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || /^zh-(?:Hans|Hant)$/.test(name)) return [];
    return [`${relative}: 目录使用英文 kebab-case`];
  }
  if (!/\.(?:[cm]?js|[jt]sx?|css|json|sh|service|conf)$/.test(name)) return [];
  const stem = name
    .replace(/\.(?:[cm]?js|[jt]sx?|css|json|sh|service|conf)$/, '')
    .replace(/\.(?:test|spec|d|module)$/, '');
  if (
    /^(?:native|legacy)(?:-|$)/.test(stem) ||
    /^(?:Native|Legacy)(?:Platform|Page|App)/.test(stem) ||
    /-(?:native|legacy|new|old|final|latest|temp|tmp|v\d+)$/.test(stem)
  )
    return [`${relative}: 按职责命名，不能用历史版本或临时状态后缀`];
  if (
    /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(stem) ||
    (/\.[jt]sx?$/.test(name) && /^[A-Z][A-Za-z0-9]*$/.test(stem))
  )
    return [];
  return [`${relative}: 文件使用 kebab-case，React 组件使用 PascalCase`];
}
export function checkStructure(projectRoot = root) {
  const errors = [];
  for (const entry of readdirSync(projectRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && !directories.has(entry.name)) errors.push(`${entry.name}: 未登记的根目录`);
    if (entry.isFile() && !rootFiles.has(entry.name) && !/^\.env(?:\.[a-z0-9-]+)*$/.test(entry.name))
      errors.push(`${entry.name}: 根目录仅保留工程入口与配置`);
  }
  let checked = 0;
  function visit(relative) {
    const absolute = path.join(projectRoot, relative);
    if (!existsSync(absolute) || preserved.some((prefix) => `${relative}/`.startsWith(prefix))) return;
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      const file = `${relative}/${entry.name}`;
      if (entry.isSymbolicLink()) {
        errors.push(`${file}: 工程源码目录不使用符号链接`);
        continue;
      }
      errors.push(...checkEngineeringName(file, entry.isDirectory()));
      if (entry.isDirectory()) visit(file);
      else checked++;
    }
  }
  for (const directory of sourceRoots) visit(directory);
  return { checked, errors };
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const result = checkStructure();
  for (const error of result.errors) console.error(error);
  console.log(`工程结构检查：${result.checked} 份文件，${result.errors.length} 个错误。`);
  process.exitCode = result.errors.length ? 1 : 0;
}
