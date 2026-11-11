/** Registration reads an explicit local manifest and validates all consumers
 * before it can be saved. It never executes uploaded source or edits a database. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { resolveExistingPathInsideRoot, writeFileAtomic } from '../filesystem.js';
import { loadContentPackage, loadPrototypeRevisions } from './project-content.js';
import { loadComponentRegistryItem, validateComponentRegistry } from './component-registry.js';
import { fail } from './store.js';
import { requirementGraphView } from './requirement-graph.js';

const id = (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{1,63}$/.test(value);
const requireValue = (value, message) => {
  if (!value) fail(422, message, 'REGISTRATION_INVALID');
};
function allowedKeys(value, keys) {
  requireValue(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).every((key) => keys.includes(key)),
    '接入清单包含未知字段',
  );
}
export function validateProjectRegistration(input, existingModules = [], existingRegistry = []) {
  allowedKeys(input, ['schemaVersion', 'module', 'registry']);
  const module = input?.module;
  allowedKeys(module, [
    'key',
    'projectId',
    'clientId',
    'contentKey',
    'label',
    'surface',
    'pages',
    'initialClients',
  ]);
  requireValue(
    input?.schemaVersion === 1 && module && id(module.key) && id(module.projectId),
    '项目登记标识无效',
  );
  requireValue(
    !existingModules.some(
      (item) => item.key === module.key || (item.projectId ?? item.key) === module.projectId,
    ),
    '项目代码或模块已登记',
  );
  requireValue(
    typeof module.label === 'string' && module.label.trim() && module.label.length <= 160,
    '项目名称无效',
  );
  requireValue(module.surface === 'showcase' && id(module.clientId), '项目展示入口无效');
  requireValue(!module.contentKey || id(module.contentKey), '业务资料标识无效');
  requireValue(Array.isArray(module.pages) && module.pages.length <= 128, '项目页面清单无效');
  const keys = new Set();
  const featuredOrders = new Set();
  for (const page of module.pages) {
    allowedKeys(page, ['key', 'label', 'source', 'kind', 'registryItem', 'featuredOrder']);
    requireValue(id(page.key) && !keys.has(page.key), '页面标识重复或无效');
    keys.add(page.key);
    requireValue(typeof page.label === 'string' && page.label.trim(), '页面名称缺失');
    requireValue(
      typeof page.source === 'string' && /^[A-Z][A-Za-z0-9]*\.tsx$/.test(page.source),
      '页面需要独立React入口',
    );
    requireValue(['page', 'component', 'block'].includes(page.kind ?? 'page'), '页面类型无效');
    if (page.featuredOrder !== undefined) {
      requireValue(
        Number.isInteger(page.featuredOrder) &&
          page.featuredOrder >= 1 &&
          page.featuredOrder <= 6 &&
          !featuredOrders.has(page.featuredOrder),
        '首页精选序号须为不重复的1–6',
      );
      featuredOrders.add(page.featuredOrder);
    }
    requireValue(page.sourceFiles === undefined, '依赖源码由Registry统一推导，请勿另写sourceFiles');
  }
  const registry = input.registry ?? [];
  validateComponentRegistry([...existingRegistry, ...registry]);
  for (const item of registry) {
    const page = module.pages.find((page) => page.key === item.pageKey);
    requireValue(
      item.moduleKey === module.key && page?.registryItem === item.name && page.kind === item.kind,
      'Registry与展示页面必须互相绑定',
    );
    requireValue(
      item.files.every((file) => file.path.startsWith(`packages/component-library/src/${module.projectId}/`)),
      '组件文件必须位于本项目库目录',
    );
  }
  for (const page of module.pages)
    requireValue(
      !page.registryItem || registry.some((item) => item.name === page.registryItem),
      '页面安装项未登记',
    );
  const clients = module.initialClients ?? [];
  requireValue(Array.isArray(clients) && clients.length <= 16, '初始菜单客户端无效或过多');
  const clientIds = new Set();
  for (const client of clients) {
    allowedKeys(client, ['id', 'name', 'icon', 'layout', 'enabled', 'position', 'defaultPage', 'pages']);
    requireValue(
      id(client.id) && !clientIds.has(client.id) && !['documents', 'config'].includes(client.id),
      '初始客户端标识重复或无效',
    );
    clientIds.add(client.id);
    requireValue(
      typeof client.name === 'string' &&
        client.name.trim() &&
        ['desktop', 'mobile'].includes(client.layout) &&
        typeof client.enabled === 'boolean',
      '初始客户端无效',
    );
    requireValue(Number.isInteger(client.position) && client.position >= 0, '客户端排序无效');
    requireValue(Array.isArray(client.pages) && client.pages.length <= 40, '初始菜单无效');
    const menuKeys = new Set();
    for (const page of client.pages) {
      allowedKeys(page, ['key', 'label', 'group', 'visible', 'access', 'position']);
      requireValue(keys.has(page.key) && !menuKeys.has(page.key), '初始菜单未登记或重复');
      menuKeys.add(page.key);
      requireValue(
        typeof page.label === 'string' &&
          page.label.trim() &&
          typeof page.visible === 'boolean' &&
          ['public', 'restricted'].includes(page.access),
        '初始菜单需明确名称、显隐及访问范围',
      );
      requireValue(Number.isInteger(page.position) && page.position >= 0, '菜单排序无效');
    }
    requireValue(
      !client.defaultPage || client.pages.some((page) => page.key === client.defaultPage && page.visible),
      '默认菜单必须可见',
    );
  }
  return { schemaVersion: 1, module, registry };
}
export function validateProjectRegistrations(definitions, builtins = []) {
  requireValue(Array.isArray(definitions), '项目登记清单无效');
  const moduleIds = new Set(builtins.map((module) => module.key));
  const projectIds = new Set(builtins.map((module) => module.projectId ?? module.key));
  for (const definition of definitions) {
    requireValue(
      definition?.module && id(definition.module.key) && id(definition.module.projectId),
      '项目登记标识无效',
    );
    requireValue(
      !moduleIds.has(definition.module.key) && !projectIds.has(definition.module.projectId),
      '项目代码或模块已登记',
    );
    moduleIds.add(definition.module.key);
    projectIds.add(definition.module.projectId);
  }
  let modules = [...builtins];
  for (const definition of definitions) {
    validateProjectRegistration(
      definition,
      modules,
      definitions.filter((item) => item !== definition).flatMap((item) => item.registry ?? []),
    );
    modules = [...modules, definition.module];
  }
  return definitions;
}
export async function checkProjectRegistration(root, input, modules, registry) {
  const { module } = input;
  for (const page of module.pages) {
    const relative = `apps/web/src/project-modules/${module.projectId}/${page.key}/${page.source}`;
    const file = await resolveExistingPathInsideRoot(root, relative, { allowedExtensions: ['.tsx'] });
    requireValue(file, `缺少页面入口：${relative}`);
    const source = await fs.readFile(file, 'utf8');
    requireValue(/export\s+(?:default\b|\{[^}]*\bdefault\b)/.test(source), `页面缺少默认导出：${page.key}`);
    let current = root;
    for (const segment of relative.split('/')) {
      current = path.join(current, segment);
      requireValue(!(await fs.lstat(current)).isSymbolicLink(), '页面目录不允许符号链接');
    }
  }
  const moduleRegistry = registry.filter((item) => item.moduleKey === module.key);
  for (const item of moduleRegistry) {
    const closure = registry.filter((candidate) => item.registryDependencies.includes(candidate.name));
    requireValue(
      closure.every((dependency) => dependency.moduleKey === module.key),
      '组件依赖必须在同一项目模块内登记',
    );
  }
  for (const item of input.registry ?? []) await loadComponentRegistryItem(root, registry, item.name);
  const warnings = [];
  if (module.contentKey) {
    const snapshot = await loadContentPackage(path.join(root, 'project-content'), module.contentKey, modules);
    requireValue(snapshot.manifest.moduleKey === module.key, '业务资料绑定模块不一致');
    const hashes = await loadPrototypeRevisions({
      moduleCatalog: modules,
      moduleKey: module.key,
      pageSourceRoot: root,
    });
    const clients = module.initialClients ?? [{ id: module.clientId, pages: module.pages }];
    snapshot.prototypeRevisions = Object.fromEntries(
      clients.flatMap((client) =>
        client.pages
          .filter((page) => hashes[page.key])
          .map((page) => [`${client.id}/${page.key}`, hashes[page.key]]),
      ),
    );
    const graph = requirementGraphView(snapshot, {
      id: module.projectId,
      moduleKey: module.key,
      clients,
      links: [],
    });
    if (graph.availability !== 'ready')
      warnings.push({ code: 'GRAPH_NOT_READY', availability: graph.availability });
    warnings.push(...(graph.diagnostics ?? []));
  } else warnings.push({ code: 'CONTENT_NOT_CONFIGURED' });
  return {
    projectId: module.projectId,
    pages: module.pages.length,
    components: input.registry?.length ?? 0,
    warnings,
  };
}
export async function saveProjectRegistration(root, input, expectedCatalog, { replace = false } = {}) {
  const relative = 'packages/platform-contracts/src/registered-projects.json';
  const file = await resolveExistingPathInsideRoot(root, relative, { allowedExtensions: ['.json'] });
  requireValue(file, '项目登记目录不可用');
  const lock = await fs.open(`${file}.lock`, 'wx');
  try {
    const current = JSON.parse(await fs.readFile(file, 'utf8'));
    requireValue(JSON.stringify(current) === JSON.stringify(expectedCatalog), '登记清单已变更，请重新执行');
    const previous = current.find((item) => item.module.projectId === input.module.projectId);
    requireValue(
      replace ? previous?.module.key === input.module.key : !previous,
      '替换必须保持原项目与模块身份',
    );
    const next = replace ? current.map((item) => (item === previous ? input : item)) : [...current, input];
    requireValue(
      new Set(next.map((item) => item.module.key)).size === next.length &&
        new Set(next.map((item) => item.module.projectId)).size === next.length,
      '登记清单存在重复项目或模块',
    );
    await writeFileAtomic(file, JSON.stringify(next, null, 2) + '\n');
  } finally {
    await lock.close();
    await fs.unlink(`${file}.lock`);
  }
}
