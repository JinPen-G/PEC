/** Static import-boundary checks for owned platform sources; does not execute
 * application code. Nonliteral dynamic imports, runtime calls and authorization
 * are outside this check. Tests and generated previews are not production layers. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { isBuiltin } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from '@babel/parser';
import { COMPONENT_REGISTRY } from '../packages/platform-contracts/src/component-registry.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RULES = Object.freeze({
  'platform-contracts': { dependencies: ['project-shared'], node: false },
  'platform-client': { dependencies: ['platform-contracts'], node: false },
  'project-shared': { dependencies: [], node: false },
  'component-library': {
    dependencies: [],
    node: false,
    external: [
      'react',
      'react-dom',
      ...new Set(
        COMPONENT_REGISTRY.flatMap((item) => item.dependencies)
          .map((name) => name.match(/^(@[^/]+\/[^@]+|[^@]+)(?:@.*)?$/)?.[1])
          .filter(Boolean),
      ),
    ],
  },
  'project-core': {
    dependencies: ['project-shared'],
    node: true,
    external: ['graphology', 'graphology-shortest-path', '@babel/parser'],
  },
  'platform-server': {
    dependencies: ['project-core', 'platform-contracts'],
    node: true,
    external: ['@modelcontextprotocol/sdk'],
  },
  'preview-ui': {
    dependencies: [],
    node: false,
    external: [
      'react',
      'react-dom',
      '@animate-ui/react',
      '@base-ui/react',
      '@hugeicons/react',
      '@hugeicons/core-free-icons',
      'motion',
      'lucide-react',
      'cn',
      'class-variance-authority',
      '@radix-ui/react-select',
      '@radix-ui/react-switch',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-tabs',
      '@tanstack/react-table',
      '@dnd-kit/core',
      '@dnd-kit/modifiers',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'antd',
      'cmdk',
      'clsx',
      'dayjs',
      'react-router-dom',
    ],
  },
  web: {
    dependencies: [
      'platform-client',
      'platform-contracts',
      'project-shared',
      'preview-ui',
      'component-library',
    ],
    node: false,
  },
  api: { dependencies: ['platform-server'], node: true },
});

function layer(file) {
  return /^(?:packages|apps)\/([^/]+)\//u.exec(file.replaceAll('\\', '/'))?.[1];
}

function dependencies(node, found = []) {
  if (!node || typeof node !== 'object') return found;
  if (
    ['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type) &&
    node.source?.value
  )
    found.push(node.source.value);
  if (node.type === 'ImportExpression' && node.source?.type === 'StringLiteral')
    found.push(node.source.value);
  if (
    node.type === 'CallExpression' &&
    (node.callee?.type === 'Import' || node.callee?.name === 'require') &&
    node.arguments?.[0]?.type === 'StringLiteral'
  ) {
    found.push(node.arguments[0].value);
  }
  for (const [key, value] of Object.entries(node)) {
    if (['loc', 'comments', 'tokens', 'errors'].includes(key)) continue;
    if (Array.isArray(value)) value.forEach((child) => dependencies(child, found));
    else if (value && typeof value === 'object') dependencies(value, found);
  }
  return found;
}

export function checkSourceImports(file, source, root = ROOT) {
  const owner = layer(file);
  const rule = RULES[owner];
  if (!rule) return [];
  const errors = [];
  const ast = parse(source, {
    sourceType: 'unambiguous',
    plugins: [['typescript', { dts: file.endsWith('.d.ts') }], 'jsx'],
    createImportExpressions: true,
  });
  for (const specifier of new Set(dependencies(ast))) {
    if (isBuiltin(specifier)) {
      if (!rule.node) errors.push(`${file}: ${owner} 不允许 Node 依赖 ${specifier}`);
      if (owner === 'project-core' && /^(?:node:)?(?:https?|net|tls|dgram|child_process)$/u.test(specifier)) {
        errors.push(`${file}: project-core 不负责网络或进程适配 ${specifier}`);
      }
      continue;
    }
    let target;
    if (specifier.startsWith('.')) {
      target = path.relative(root, path.resolve(root, path.dirname(file), specifier)).replaceAll('\\', '/');
    } else if (
      specifier === '@/lib/motion-tokens' ||
      specifier === '@preview/ui' ||
      specifier.startsWith('@preview/ui/')
    ) {
      target = 'packages/preview-ui/src/index.ts';
    } else if (specifier.startsWith('@preview/library/')) {
      target = `packages/component-library/src/${specifier.slice('@preview/library/'.length)}`;
    } else if (specifier.startsWith('@/')) {
      target = `apps/web/src/${specifier.slice(2)}`;
    } else if (specifier.startsWith('@preview/')) {
      target = `packages/${specifier.slice('@preview/'.length)}/src/index.js`;
    }
    const dependency = target && layer(target);
    if (dependency && dependency !== owner && !rule.dependencies.includes(dependency)) {
      errors.push(`${file}: ${owner} 不允许依赖 ${dependency} (${specifier})`);
    } else if (target && !dependency) {
      errors.push(`${file}: ${owner} 不允许通过相对路径依赖平台层外文件 (${specifier})`);
    } else if (
      !target &&
      owner !== 'web' &&
      !(rule.external ?? []).some((name) => specifier === name || specifier.startsWith(`${name}/`))
    ) {
      errors.push(`${file}: ${owner} 出现未声明外部依赖 ${specifier}`);
    }
  }
  return errors;
}

function sourceFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isSymbolicLink()) return [];
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return /\.(?:[cm]?js|[jt]sx?)$/u.test(file) && !/\.(?:test|spec)\./u.test(file) ? [file] : [];
  });
}

export function checkArchitecture(root = ROOT) {
  const errors = [];
  let files = 0;
  for (const owner of Object.keys(RULES)) {
    const base = owner === 'web' || owner === 'api' ? 'apps' : 'packages';
    const directory = owner === 'api' ? path.join(root, base, owner) : path.join(root, base, owner, 'src');
    if (!existsSync(directory)) errors.push(`${base}/${owner}/src: 缺少正式源码目录`);
    for (const absolute of sourceFiles(directory)) {
      files++;
      const file = path.relative(root, absolute).replaceAll('\\', '/');
      try {
        errors.push(...checkSourceImports(file, readFileSync(absolute, 'utf8'), root));
      } catch (error) {
        errors.push(`${file}: 无法解析源码 (${error.message})`);
      }
    }
  }
  return { files, errors };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const result = checkArchitecture();
  for (const error of result.errors) console.error(error);
  console.log(`平台分层检查：${result.files} 个源码文件，${result.errors.length} 个错误。`);
  process.exitCode = result.errors.length ? 1 : 0;
}
