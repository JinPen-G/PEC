import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { loadProjectCatalog } from '../packages/platform-server/src/project-catalog.js';
import { componentRegistryClosure } from '../packages/project-core/src/platform/component-registry.js';
import {
  checkProjectRegistration,
  validateProjectRegistration,
  saveProjectRegistration,
} from '../packages/project-core/src/platform/project-registration.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const {
  projects: catalog,
  moduleCatalog: NATIVE_MODULES,
  componentRegistry: COMPONENT_REGISTRY,
} = await loadProjectCatalog(path.join(root, 'packages/platform-contracts/src'));
const args = process.argv.slice(2);
const fileIndex = args.indexOf('--file');
if (fileIndex < 0 || !args[fileIndex + 1])
  throw new Error('使用 project:register -- --file <project.json> [--check] [--replace]');
const input = JSON.parse(await fs.readFile(path.resolve(args[fileIndex + 1]), 'utf8'));
const replace = args.includes('--replace');
const previous = catalog.find((item) => item.module.projectId === input.module?.projectId);
if (replace && (!previous || previous.module.key !== input.module?.key))
  throw new Error('只允许更新已登记项目，项目与模块身份必须保持');
const existingModules = replace
  ? NATIVE_MODULES.filter((module) => module.key !== previous.module.key)
  : NATIVE_MODULES;
const existingRegistry = replace
  ? COMPONENT_REGISTRY.filter((item) => item.moduleKey !== previous.module.key)
  : COMPONENT_REGISTRY;
const definition = validateProjectRegistration(input, existingModules, existingRegistry);
const registry = [...existingRegistry, ...definition.registry];
const module = {
  ...definition.module,
  pages: definition.module.pages.map((page) => ({
    ...page,
    sourceFiles: page.registryItem
      ? componentRegistryClosure(registry, page.registryItem).flatMap((item) =>
          item.files.map((file) => file.path),
        )
      : undefined,
  })),
};
const report = await checkProjectRegistration(root, definition, [...existingModules, module], registry);
console.log(JSON.stringify(report, null, 2));
if (!args.includes('--check')) {
  await saveProjectRegistration(root, definition, catalog, { replace });
  console.log('项目源码已登记。重启开发服务或完整构建后，在后台创建同编码项目，初始菜单按清单生效。');
}
