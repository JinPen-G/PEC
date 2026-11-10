/** Published governance and installable sources extend project context under
 * explicit token scopes; ordinary PRD text never grants source permissions. */
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fail } from './store.js';
import { resolveExistingPathInsideRoot } from '../filesystem.js';
import {
  componentRegistryClosure,
  loadComponentRegistryItem,
  registryItemResponse,
} from './component-registry.js';

const hash = (value) => createHash('sha256').update(value).digest('hex');
export function requireScope(identity, scope) {
  if (!identity.scopes.includes(scope)) fail(403, '凭证未获此项读取权限', 'SCOPE_REQUIRED');
}
export function requireProjectComponent(project, registry, name) {
  const closure = componentRegistryClosure(registry, name);
  for (const item of closure) {
    if (
      project.archived ||
      project.moduleKey !== item.moduleKey ||
      !project.clients.some(
        (client) => client.enabled && client.pages.some((page) => page.key === item.pageKey && page.visible),
      )
    )
      fail(403, '组件或依赖未在本项目上架', 'FORBIDDEN');
  }
  return closure;
}
export function createAgentContext({
  content,
  registry,
  pageSourceRoot,
  staticRoot,
  releaseRoot,
  publicOrigin,
}) {
  async function buildRoot() {
    let root = staticRoot;
    if (releaseRoot) {
      const pointer = JSON.parse(await fs.readFile(path.join(releaseRoot, 'current.json'), 'utf8'));
      if (!/^[a-f\d]{12}-[a-f\d]{12}$/.test(pointer.releaseId))
        fail(503, '发行指针无效', 'REGISTRY_UNAVAILABLE');
      const release = path.join(releaseRoot, pointer.releaseId);
      if ((await fs.lstat(release)).isSymbolicLink()) fail(503, '发行目录无效', 'REGISTRY_UNAVAILABLE');
      root = path.join(release, 'web');
    }
    return root;
  }
  async function readItemAt(project, name, root) {
    requireProjectComponent(project, registry, name);
    let item;
    if (root) {
      const file = await resolveExistingPathInsideRoot(root, `page-source/registry/${name}.json`, {
        allowedExtensions: ['.json'],
      });
      if (!file) fail(503, '组件尚未构建', 'REGISTRY_UNAVAILABLE');
      item = JSON.parse(await fs.readFile(file, 'utf8'));
    } else {
      if (!pageSourceRoot) fail(503, '组件源码未配置', 'REGISTRY_UNAVAILABLE');
      item = await loadComponentRegistryItem(pageSourceRoot, registry, name);
    }
    return registryItemResponse(item, registry, project.id, publicOrigin);
  }
  async function readItem(project, name) {
    return readItemAt(project, name, await buildRoot());
  }
  async function readInstallItem(project, name) {
    const closure = requireProjectComponent(project, registry, name);
    const root = await buildRoot();
    const files = new Map(),
      dependencies = new Map();
    let primary,
      bytes = 0;
    for (const descriptor of closure) {
      const item = await readItemAt(project, descriptor.name, root);
      primary ??= item;
      for (const dependency of item.dependencies) {
        const packageName = dependency.match(/^(@[^/]+\/[^@]+|[^@]+)(?:@.*)?$/)?.[1];
        if (dependencies.has(packageName) && dependencies.get(packageName) !== dependency)
          fail(422, '组件依赖版本冲突，请统一后发布', 'REGISTRY_INVALID');
        dependencies.set(packageName, dependency);
      }
      for (const file of item.files) {
        if (files.has(file.target)) continue;
        bytes += Buffer.byteLength(file.content, 'utf8');
        if (bytes > 16 * 1024 * 1024) fail(413, '组件及依赖源码包过大', 'PAYLOAD_TOO_LARGE');
        files.set(file.target, file);
      }
    }
    if (root !== (await buildRoot())) fail(409, '组件发行版本已变更，请重试', 'REGISTRY_REVISION_CHANGED');
    return {
      ...primary,
      files: [...files.values()],
      dependencies: [...dependencies.values()],
      registryDependencies: [],
    };
  }
  function listItems(project) {
    return registry
      .filter((item) => {
        try {
          requireProjectComponent(project, registry, item.name);
          return true;
        } catch (error) {
          if (error.status !== 403) throw error;
          return false;
        }
      })
      .map((item) => ({
        name: item.name,
        title: item.title,
        description: item.description,
        kind: item.kind,
        pageKey: item.pageKey,
        installUrl: `${publicOrigin}/r/${project.id}/${item.name}.json`,
      }));
  }
  async function query(identity, operation, args = {}) {
    if (args.projectId !== undefined && args.projectId !== identity.project.id)
      fail(404, '项目不存在或无权访问', 'NOT_FOUND');
    const project = identity.project;
    const offset = Number(args.offset ?? 0),
      limit = Number(args.limit ?? (operation.startsWith('read_') ? 16000 : 20));
    if (
      !Number.isInteger(offset) ||
      offset < 0 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > (operation.startsWith('read_') ? 64000 : 100)
    )
      fail(400, '读取分页无效');
    const page = (items) => ({
      projectId: project.id,
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      nextOffset: offset + limit < items.length ? offset + limit : null,
    });
    if (operation === 'get_project_context') {
      const readable = identity.scopes.some((scope) => ['business:read', 'governance:read'].includes(scope));
      const snapshot =
        readable && project.contentKey ? await content.snapshot(project, args.contentRevision) : null;
      return {
        projectId: project.id,
        title: project.name,
        scopes: identity.scopes,
        contentRevision: snapshot?.revision ?? null,
        requirements: identity.scopes.includes('business:read')
          ? { configured: Boolean(snapshot), count: snapshot?.manifest.requirements.length ?? 0 }
          : null,
        governance: identity.scopes.includes('governance:read')
          ? { configured: Boolean(snapshot), count: snapshot?.manifest.governance?.length ?? 0 }
          : null,
        components: identity.scopes.includes('components:read') ? { count: listItems(project).length } : null,
        workflow: [
          '读取已发布治理规则',
          '读取相关PRD与图谱影响及维护状态',
          '按需获取组件完整依赖与源码',
          '结合项目约束验证改动',
        ],
      };
    }
    if (['list_governance_rules', 'read_governance_rule'].includes(operation)) {
      requireScope(identity, 'governance:read');
      if (!project.contentKey) {
        if (operation === 'read_governance_rule') fail(404, '治理规则未配置', 'CONTENT_NOT_FOUND');
        return { ...page([]), configured: false, contentRevision: null };
      }
      const snapshot = await content.snapshot(project, args.contentRevision);
      const rules = (snapshot.manifest.governance ?? []).map((rule) => ({
        id: rule.id,
        title: rule.title,
        revision: hash(snapshot.files.get(rule.path)),
      }));
      if (operation === 'list_governance_rules')
        return { ...page(rules), configured: true, contentRevision: snapshot.revision };
      const rule = snapshot.manifest.governance?.find((rule) => rule.id === args.id);
      if (!rule) fail(404, '治理规则未发布', 'CONTENT_NOT_FOUND');
      const markdown = snapshot.files.get(rule.path).toString('utf8');
      return {
        projectId: project.id,
        id: rule.id,
        title: rule.title,
        contentRevision: snapshot.revision,
        revision: hash(markdown),
        markdown: markdown.slice(offset, offset + limit),
        offset,
        totalLength: markdown.length,
        nextOffset: offset + limit < markdown.length ? offset + limit : null,
      };
    }
    requireScope(identity, 'components:read');
    if (operation === 'list_components') {
      if (args.query !== undefined && (typeof args.query !== 'string' || args.query.length > 160))
        fail(400, '搜索条件无效');
      const keyword = (args.query ?? '').toLowerCase();
      return page(
        listItems(project).filter((item) =>
          `${item.name} ${item.title} ${item.description}`.toLowerCase().includes(keyword),
        ),
      );
    }
    const item = await readItem(project, args.name);
    const revision = hash(JSON.stringify(item));
    if (args.registryRevision && args.registryRevision !== revision)
      fail(409, '组件版本已变更，请重新读取清单', 'REGISTRY_REVISION_CHANGED');
    if (operation === 'get_component')
      return {
        projectId: project.id,
        name: item.name,
        title: item.title,
        description: item.description,
        type: item.type,
        registryRevision: revision,
        dependencies: item.dependencies,
        registryDependencies: item.registryDependencies,
        files: item.files.map((file) => ({
          target: file.target,
          characters: file.content.length,
          revision: hash(file.content),
        })),
        installUrl: `${publicOrigin}/r/${project.id}/${item.name}.json`,
      };
    if (operation === 'read_component_file') {
      const file = item.files.find((file) => file.target === args.file);
      if (!file) fail(404, '组件文件未登记', 'NOT_FOUND');
      return {
        projectId: project.id,
        name: item.name,
        file: file.target,
        registryRevision: revision,
        revision: hash(file.content),
        source: file.content.slice(offset, offset + limit),
        offset,
        totalLength: file.content.length,
        nextOffset: offset + limit < file.content.length ? offset + limit : null,
      };
    }
    fail(404, '读取工具不存在', 'NOT_FOUND');
  }
  async function check(project, modules) {
    const issues = [];
    const module = modules.find((item) => item.key === project.moduleKey);
    const root = await buildRoot();
    let entries = [];
    if (root) {
      const manifest = await resolveExistingPathInsideRoot(root, 'page-manifest.json', {
        allowedExtensions: ['.json'],
      });
      if (!manifest) fail(503, '页面发行清单缺失', 'RELEASE_UNAVAILABLE');
      entries = JSON.parse(await fs.readFile(manifest, 'utf8')).entries;
      if (!Array.isArray(entries)) fail(503, '页面发行清单无效', 'RELEASE_UNAVAILABLE');
    }
    for (const client of project.clients.filter((client) => client.enabled)) {
      for (const page of client.pages.filter((page) => page.visible)) {
        const registered = module?.pages.find((item) => item.key === page.key);
        if (!registered?.source) {
          issues.push({ code: 'PAGE_NOT_REGISTERED', pageKey: page.key });
          continue;
        }
        if (root) {
          const compiled = entries.find(
            (entry) => entry.moduleKey === project.moduleKey && entry.pageKey === page.key,
          );
          if (
            !compiled ||
            !(await resolveExistingPathInsideRoot(root, compiled.entry, { allowedExtensions: ['.js'] }))
          )
            issues.push({ code: 'PAGE_NOT_BUILT', pageKey: page.key });
        } else if (
          !pageSourceRoot ||
          !(await resolveExistingPathInsideRoot(
            pageSourceRoot,
            `apps/web/src/project-modules/${module.projectId ?? module.key}/${page.key}/${registered.source}`,
            { allowedExtensions: ['.tsx'] },
          ))
        )
          issues.push({ code: 'PAGE_SOURCE_MISSING', pageKey: page.key });
      }
    }
    for (const item of listItems(project)) {
      try {
        await readItem(project, item.name);
      } catch (error) {
        if (!error.status) throw error;
        issues.push({ code: error.code, component: item.name });
      }
    }
    return { issues, mode: root ? 'release' : 'development' };
  }
  return { query, readItem, readInstallItem, listItems, check };
}
