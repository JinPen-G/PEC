/** Only explicitly registered library files are distributed. Dependency access
 * is checked in the same project before any source is returned. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { resolveExistingPathInsideRoot } from '../filesystem.js';
import { fail } from './store.js';
import { parse } from '@babel/parser';

const identifier = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const validIdentifier = (value) => typeof value === 'string' && value.length <= 64 && identifier.test(value);
const sourcePath = /^packages\/component-library\/src\/(?:[a-zA-Z0-9-]+\/)+[a-zA-Z0-9.-]+\.(?:[jt]sx?|css)$/;
const targetPath = /^@components\/preview\/(?:[a-zA-Z0-9-]+\/)+[a-zA-Z0-9.-]+\.(?:[jt]sx?|css)$/;
const dependency = /^(?:@[a-z0-9-]+\/)?[a-z0-9-]+(?:@[~^]?\d+(?:\.\d+){0,2})?$/;
export function componentSourceImports(content, filename) {
  const tree = parse(content, { sourceType: 'module', plugins: ['jsx', ...(filename.endsWith('.ts') || filename.endsWith('.tsx') ? ['typescript'] : [])] });
  const imports = [];
  const visit = node => {
    if (!node || typeof node !== 'object') return;
    if (['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration'].includes(node.type) && node.source)
      imports.push(node.source.value);
    if (node.type === 'CallExpression' && node.callee?.type === 'Import') {
      requireValue(node.arguments[0]?.type === 'StringLiteral', '组件动态引用必须明确登记');
      imports.push(node.arguments[0].value);
    }
    for (const [key, value] of Object.entries(node)) {
      if (['loc','start','end','comments','leadingComments','trailingComments','tokens'].includes(key)) continue;
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') visit(value);
    }
  };
  visit(tree.program);
  return [...new Set(imports)];
}
function requireValue(value, message = '组件安装清单无效') {
  if (!value) fail(422, message, 'REGISTRY_INVALID');
}
export function validateComponentRegistry(catalog) {
  requireValue(Array.isArray(catalog) && catalog.length <= 256);
  const names = new Set(),
    targets = new Map();
  for (const item of catalog) {
    requireValue(item && validIdentifier(item.name) && !names.has(item.name));
    names.add(item.name);
    requireValue(['component', 'block'].includes(item.kind));
    requireValue(validIdentifier(item.moduleKey) && validIdentifier(item.pageKey));
    requireValue(typeof item.title === 'string' && item.title.length > 0 && item.title.length <= 200);
    requireValue(typeof item.description === 'string' && item.description.length <= 2000);
    requireValue(item.descriptionEn === undefined || typeof item.descriptionEn === 'string' && item.descriptionEn.length <= 2000);
    requireValue(
      Array.isArray(item.dependencies) &&
        item.dependencies.length <= 64 &&
        item.dependencies.every((name) => typeof name === 'string' && dependency.test(name)),
    );
    requireValue(
      Array.isArray(item.registryDependencies) &&
        item.registryDependencies.length <= 64 &&
        item.registryDependencies.every(validIdentifier),
    );
    requireValue(Array.isArray(item.files) && item.files.length > 0 && item.files.length <= 64);
    const files = new Set();
    for (const file of item.files) {
      requireValue(sourcePath.test(file.path) && targetPath.test(file.target));
      requireValue(!file.path.includes('..') && !file.target.includes('..') && !files.has(file.path));
      requireValue(!targets.has(file.target) || targets.get(file.target) === file.path, '安装目标冲突');
      files.add(file.path);
      targets.set(file.target, file.path);
    }
  }
  const visiting = new Set(),
    visited = new Set();
  const visit = (name) => {
    requireValue(names.has(name), '组件依赖未登记');
    requireValue(!visiting.has(name), '组件依赖存在循环');
    if (visited.has(name)) return;
    visiting.add(name);
    for (const child of catalog.find((item) => item.name === name).registryDependencies) visit(child);
    visiting.delete(name);
    visited.add(name);
  };
  for (const name of names) visit(name);
  return catalog;
}
export function componentRegistryClosure(catalog, name) {
  validateComponentRegistry(catalog);
  const root = catalog.find((item) => item.name === name);
  if (!root) fail(404, '组件未登记', 'NOT_FOUND');
  const result = new Map();
  const visit = (item) => {
    if (result.has(item.name)) return;
    result.set(item.name, item);
    for (const child of item.registryDependencies) visit(catalog.find((entry) => entry.name === child));
  };
  visit(root);
  return [...result.values()];
}
export function requireComponentRegistryAccess(store, user, projectId, catalog, name) {
  const items = componentRegistryClosure(catalog, name);
  const pages = store.pageCatalog(user).filter((page) => page.projectId === projectId);
  for (const item of items) {
    const page = pages.find((entry) => entry.pageKey === item.pageKey && entry.allowed);
    if (
      !page ||
      store.pageAccess(user, projectId, page.clientId, page.pageKey).project.moduleKey !== item.moduleKey
    )
      fail(403, '组件或其依赖未上架或需要授权', 'FORBIDDEN');
  }
  return items;
}
export async function loadComponentRegistryItem(root, catalog, name) {
  const closure = componentRegistryClosure(catalog, name),
    item = closure[0];
  const files = [];
  let size = 0;
  for (const file of item.files) {
    const resolved = await resolveExistingPathInsideRoot(root, file.path, {
      allowedExtensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    });
    if (!resolved) fail(503, '组件源码不存在或范围无效', 'REGISTRY_UNAVAILABLE');
    let directory = root;
    for (const segment of file.path.split('/')) {
      directory = path.join(directory, segment);
      if ((await fs.lstat(directory)).isSymbolicLink())
        fail(422, '组件源码不允许符号链接', 'REGISTRY_INVALID');
    }
    const stat = await fs.stat(resolved);
    size += stat.size;
    requireValue(stat.size <= 1024 * 1024 && size <= 4 * 1024 * 1024, '组件源码过大');
    const content = await fs.readFile(resolved, 'utf8');
    files.push({ ...file, type: `registry:${item.kind}`, content });
  }
  const available = closure.flatMap((entry) => entry.files);
  for (const file of files.filter((entry) => /\.[jt]sx?$/.test(entry.path))) {
    for (const specifier of componentSourceImports(file.content, file.path)) {
      if (specifier.startsWith('.')) {
        const source = path.posix.normalize(path.posix.join(path.posix.dirname(file.path), specifier));
        const target = path.posix.normalize(path.posix.join(path.posix.dirname(file.target), specifier));
        requireValue(
          available.some(
            (entry) =>
              [source, `${source}.ts`, `${source}.tsx`, `${source}.js`, `${source}.jsx`, `${source}/index.ts`, `${source}/index.tsx`, `${source}/index.js`, `${source}/index.jsx`].includes(
                entry.path,
              ) &&
              [target, `${target}.ts`, `${target}.tsx`, `${target}.js`, `${target}.jsx`, `${target}/index.ts`, `${target}/index.tsx`, `${target}/index.js`, `${target}/index.jsx`].includes(
                entry.target,
              ),
          ),
          '组件引用了未登记文件或安装路径不一致',
        );
      } else {
        const packageName = specifier.startsWith('@')
          ? specifier.split('/').slice(0, 2).join('/')
          : specifier.split('/')[0];
        requireValue(
          ['react', 'react-dom'].includes(packageName) ||
            item.dependencies.some((name) => name === packageName || name.startsWith(`${packageName}@`)),
          '组件引用了未声明依赖',
        );
      }
    }
  }
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: item.name,
    type: `registry:${item.kind}`,
    title: item.title,
    description: item.description,
    dependencies: [...item.dependencies],
    registryDependencies: [...item.registryDependencies],
    files,
  };
}
export function registryItemResponse(item, catalog, projectId, origin) {
  const descriptor = catalog.find((entry) => entry.name === item.name);
  requireValue(descriptor && item.type === `registry:${descriptor.kind}`);
  requireValue(
    item.$schema === 'https://ui.shadcn.com/schema/registry-item.json' &&
      item.title === descriptor.title &&
      item.description === descriptor.description,
  );
  requireValue(
    JSON.stringify(item.files?.map(({ path, target }) => ({ path, target }))) ===
      JSON.stringify(descriptor.files),
  );
  requireValue(item.files.every((file) => typeof file.content === 'string' && file.type === item.type));
  requireValue(JSON.stringify(item.dependencies) === JSON.stringify(descriptor.dependencies));
  requireValue(JSON.stringify(item.registryDependencies) === JSON.stringify(descriptor.registryDependencies));
  return {
    ...item,
    registryDependencies: descriptor.registryDependencies.map(
      (name) => `${origin}/r/${projectId}/${name}.json`,
    ),
  };
}
