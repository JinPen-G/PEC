/** Public catalog, guarded page preview/source and related business PRD. Every
 * protected runtime file must belong to a registered, authorized page. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { SHOWCASE_MODULES, showcaseModules } from '../../platform-contracts/src/showcase.js';
import { COMPONENT_REGISTRY } from '../../platform-contracts/src/component-registry.js';
import {
  loadComponentRegistryItem,
  requireComponentRegistryAccess,
  registryItemResponse,
} from '../../project-core/src/platform/component-registry.js';
import { readContentFile } from '../../project-core/src/platform/project-content.js';
import { fail } from '../../project-core/src/platform/store.js';
import { requireScope, requireProjectComponent } from '../../project-core/src/platform/agent-context.js';
import { resolveExistingPathInsideRoot } from '../../project-core/src/filesystem.js';
import {
  pageDocuments,
  requireDocumentAccess,
  readableDocuments,
  readableProjectGuides,
} from '../../project-core/src/platform/page-documents.js';
import {
  requirementGraphView,
  queryRequirementGraph,
} from '../../project-core/src/platform/requirement-graph.js';

export function createShowcaseHandler({
  store,
  content,
  staticRoot,
  releaseRoot,
  pageSourceRoot,
  json,
  cookies,
  publicOrigin,
  agentContext,
  moduleCatalog,
  componentRegistry = COMPONENT_REGISTRY,
}) {
  const registeredPages = moduleCatalog ? showcaseModules(moduleCatalog) : SHOWCASE_MODULES;
  async function buildRoot() {
    if (!releaseRoot) return staticRoot;
    const pointer = JSON.parse(await fs.readFile(path.join(releaseRoot, 'current.json'), 'utf8'));
    if (!/^[a-f\d]{12}-[a-f\d]{12}$/.test(pointer.releaseId))
      fail(503, '发行指针无效', 'RELEASE_UNAVAILABLE');
    const directory = path.join(releaseRoot, pointer.releaseId);
    if ((await fs.lstat(directory)).isSymbolicLink()) fail(503, '发行目录无效', 'RELEASE_UNAVAILABLE');
    return path.join(directory, 'web');
  }
  async function descriptors() {
    const root = await buildRoot();
    if (!root) return { root: null, entries: [] };
    const manifest = JSON.parse(await fs.readFile(path.join(root, 'page-manifest.json'), 'utf8'));
    if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.entries))
      fail(503, '页面发行清单无效', 'RELEASE_UNAVAILABLE');
    return { root, entries: manifest.entries };
  }
  function authorizedModule(user, moduleKey, pageKey) {
    const permitted = store
      .pageCatalog(user)
      .find(
        (entry) =>
          entry.allowed &&
          store.pageAccess(user, entry.projectId, entry.clientId, entry.pageKey).project.moduleKey ===
            moduleKey &&
          entry.pageKey === pageKey,
      );
    if (!permitted) fail(403, '此页面运行资源需要授权', 'FORBIDDEN');
    return permitted;
  }
  return async (request, response, url) => {
    const user = store.authenticate(cookies(request))?.user ?? null;
    if (url.pathname.startsWith('/r/')) {
      if (request.method !== 'GET') fail(405, '仅支持读取', 'METHOD_NOT_ALLOWED');
      const match = /^\/r\/([a-z0-9-]+)\/([a-z0-9-]+)\.json$/.exec(url.pathname);
      if (!match) fail(404, '组件安装清单不存在', 'NOT_FOUND');
      const [, projectId, name] = match;
      if (request.headers.authorization) {
        const authorization = request.headers.authorization;
        if (!authorization.startsWith('Bearer ')) fail(401, '需要项目读取凭证', 'UNAUTHORIZED');
        const secret = authorization.slice(7);
        const initial = store.authenticateContextToken(secret);
        requireScope(initial, 'components:read');
        if (initial.project.id !== projectId) fail(404, '项目不存在或无权访问', 'NOT_FOUND');
        const item = await agentContext.readInstallItem(initial.project, name);
        const current = store.authenticateContextToken(secret);
        requireScope(current, 'components:read');
        requireProjectComponent(current.project, componentRegistry, name);
        if (current.project.revision !== initial.project.revision)
          fail(409, '项目已变更，请重试', 'CONFLICT');
        json(response, item);
        return true;
      }
      requireComponentRegistryAccess(store, user, projectId, componentRegistry, name);
      const root = await buildRoot();
      let item;
      if (root) {
        const file = await resolveExistingPathInsideRoot(root, `page-source/registry/${name}.json`, {
          allowedExtensions: ['.json'],
        });
        if (!file) fail(503, '组件尚未构建', 'REGISTRY_UNAVAILABLE');
        item = JSON.parse(await fs.readFile(file, 'utf8'));
      } else {
        if (!pageSourceRoot) fail(503, '组件源码不可用', 'REGISTRY_UNAVAILABLE');
        item = await loadComponentRegistryItem(pageSourceRoot, componentRegistry, name);
      }
      const result = registryItemResponse(item, componentRegistry, projectId, publicOrigin);
      requireComponentRegistryAccess(
        store,
        store.authenticate(cookies(request))?.user ?? null,
        projectId,
        componentRegistry,
        name,
      );
      json(response, result);
      return true;
    }
    if (url.pathname.startsWith('/page-assets/')) {
      if (request.method !== 'GET') fail(405, '仅支持读取', 'METHOD_NOT_ALLOWED');
      const { root, entries } = await descriptors();
      const file = decodeURIComponent(url.pathname.slice(1));
      const candidates = entries.filter((item) => item.assets.includes(file));
      if (!root || !candidates.length) fail(404, '页面资源不存在', 'NOT_FOUND');
      const entry = candidates.find((item) => {
        try {
          authorizedModule(user, item.moduleKey, item.pageKey);
          return true;
        } catch (error) {
          if (error.status !== 403) throw error;
          return false;
        }
      });
      if (!entry) fail(403, '此页面运行资源需要授权', 'FORBIDDEN');
      const resolved = await resolveExistingPathInsideRoot(root, file, {
        allowedExtensions: ['.js', '.css'],
      });
      if (!resolved) fail(404, '页面资源不存在', 'NOT_FOUND');
      const bytes = await fs.readFile(resolved);
      authorizedModule(store.authenticate(cookies(request))?.user ?? null, entry.moduleKey, entry.pageKey);
      response.writeHead(200, {
        'Content-Type': file.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/css; charset=utf-8',
      });
      response.end(bytes);
      return true;
    }
    if (!url.pathname.startsWith('/api/native/showcase')) return false;
    if (request.method !== 'GET') fail(405, '展示资料仅支持读取', 'METHOD_NOT_ALLOWED');
    if (url.pathname === '/api/native/showcase/projects') {
      const projects = new Map();
      for (const page of store.pageCatalog(user))
        projects.set(page.projectId, { id: page.projectId, name: page.projectName });
      json(response, { projects: [...projects.values()] });
      return true;
    }
    if (url.pathname === '/api/native/showcase') {
      const projectId = url.searchParams.get('projectId');
      // Anonymous callers cannot enumerate every backend project via the library.
      json(response, {
        pages: store
          .pageCatalog(user)
          .filter((page) => (projectId ? page.projectId === projectId : user?.role === 'admin')),
      });
      return true;
    }
    if (url.pathname === '/api/native/showcase/module-permission') {
      authorizedModule(user, url.searchParams.get('moduleKey'), url.searchParams.get('pageKey'));
      json(response, { allowed: true });
      return true;
    }
    if (url.pathname === '/api/native/showcase/registry-permission') {
      const name = url.searchParams.get('name');
      const permitted = store.pageCatalog(user).some((page) => {
        try {
          requireComponentRegistryAccess(store, user, page.projectId, componentRegistry, name);
          return true;
        } catch (error) {
          if (error.status !== 403) throw error;
          return false;
        }
      });
      if (!permitted) fail(403, '组件需要授权', 'FORBIDDEN');
      json(response, { allowed: true });
      return true;
    }
    const graphRoute =
      /^\/api\/native\/showcase\/([a-z0-9-]+)\/(graph|graph-query|graph-document|guides)$/.exec(url.pathname);
    if (graphRoute) {
      const [, projectId, resource] = graphRoute;
      const first = store.pageCatalog(user).find((page) => page.projectId === projectId);
      let project;
      if (first) project = store.pageAccess(user, projectId, first.clientId, first.pageKey).project;
      else project = store.getProject(user, projectId);
      const snapshot =
        project.sourceId === 'none' && !project.contentKey
          ? null
          : await content.snapshot(project, url.searchParams.get('contentRevision') ?? undefined);
      const allowed = snapshot ? readableDocuments(store, user, project, snapshot) : [];
      const requireCurrentAccess = () => {
        const nowUser = store.authenticate(cookies(request))?.user ?? null;
        const nowProject = first
          ? store.pageAccess(nowUser, projectId, first.clientId, first.pageKey).project
          : store.getProject(nowUser, projectId);
        if (nowProject.revision !== project.revision || nowUser?.revision !== user?.revision)
          fail(409, '项目权限或配置已变更，请刷新', 'CONFLICT');
        return nowUser;
      };
      const allowedPage = (page) => {
        try {
          store.pageAccess(user, projectId, page.clientId, page.pageKey);
          return true;
        } catch (error) {
          if (![401, 403, 404].includes(error.status)) throw error;
          return false;
        }
      };
      if (resource === 'guides') {
        const current = requireCurrentAccess();
        const guides = readableProjectGuides(store, current, project, snapshot);
        json(response, {
          projectId,
          projectName: project.name,
          availability: snapshot?.manifest.guides?.length ? 'ready' : 'unconfigured',
          contentRevision: snapshot?.revision ?? null,
          guides,
          restrictedGuideIds: (snapshot?.manifest.guides ?? [])
            .filter((guide) => !guides.some((allowedGuide) => allowedGuide.id === guide.id))
            .map((guide) => guide.id),
        });
        return true;
      }
      if (resource === 'graph-document') {
        const document = allowed.find((item) => item.id === url.searchParams.get('id'));
        if (!document) fail(404, '需求不存在或无权访问', 'NOT_FOUND');
        const current = requireCurrentAccess();
        requireDocumentAccess(store, current, project, snapshot, document.path);
        json(response, {
          id: document.id,
          title: document.title,
          markdown: snapshot.files.get(document.path).toString('utf8'),
        });
        return true;
      }
      const view = requirementGraphView(snapshot, project, {
        documents: allowed,
        allowedPage,
        scope: 'authorized-web',
      });
      const args = Object.fromEntries(url.searchParams);
      const operation = resource === 'graph' ? 'get_requirement_graph' : args.operation;
      delete args.operation;
      const permitted = [
        'get_requirement_graph',
        'list_graph_topics',
        'search_graph_nodes',
        'get_graph_node',
        'get_graph_neighbors',
        'find_graph_path',
        'analyze_requirement_impact',
      ];
      if (!permitted.includes(operation)) fail(404, '图谱工具不存在', 'NOT_FOUND');
      const result = queryRequirementGraph(view, operation, { ...args, projectId });
      requireCurrentAccess();
      json(response, result);
      return true;
    }
    const match =
      /^\/api\/native\/showcase\/([a-z0-9-]+)\/([a-z0-9-]+)\/([a-z0-9-]+)(?:\/(source|markdown|document|asset))?$/.exec(
        url.pathname,
      );
    if (!match) fail(404, '展示页面不存在', 'NOT_FOUND');
    const [, projectId, clientId, pageKey, resource] = match;
    const initial = store.pageAccess(user, projectId, clientId, pageKey);
    const recheck = () => {
      const current = store.pageAccess(
        store.authenticate(cookies(request))?.user ?? null,
        projectId,
        clientId,
        pageKey,
      );
      if (current.project.revision !== initial.project.revision)
        fail(409, '页面权限或配置已变更', 'CONFLICT');
    };
    const descriptor = registeredPages[initial.project.moduleKey]?.[pageKey];
    if (!descriptor) fail(404, '页面尚未接入展示包', 'NOT_FOUND');
    const { root, entries } = await descriptors();
    const compiled = entries.find(
      (item) => item.moduleKey === initial.project.moduleKey && item.pageKey === pageKey,
    );
    if (root && !compiled) fail(503, '页面尚未构建', 'RELEASE_UNAVAILABLE');
    if (resource === 'source') {
      const file = root
        ? await resolveExistingPathInsideRoot(root, compiled.source, { allowedExtensions: ['.tsx'] })
        : pageSourceRoot &&
          (await resolveExistingPathInsideRoot(pageSourceRoot, `${descriptor.root}/${descriptor.source}`, {
            allowedExtensions: ['.tsx'],
          }));
      if (!file) fail(404, '页面源码不存在', 'NOT_FOUND');
      const source = await fs.readFile(file, 'utf8');
      recheck();
      json(response, { fileName: descriptor.source, source });
      return true;
    }
    const snapshot = initial.project.sourceId === 'none' ? null : await content.snapshot(initial.project);
    if (resource === 'document') {
      if (!snapshot) fail(404, '业务需求未发布', 'CONTENT_NOT_FOUND');
      const file = url.searchParams.get('path');
      requireDocumentAccess(store, user, initial.project, snapshot, file);
      const document = readableDocuments(store, user, initial.project, snapshot).find(
        (item) => item.path === file,
      );
      if (!document) fail(404, '业务需求未发布', 'CONTENT_NOT_FOUND');
      recheck();
      json(response, {
        path: file,
        title: document.title,
        markdown: snapshot.files.get(file).toString('utf8'),
      });
      return true;
    }
    const documents = snapshot ? pageDocuments(snapshot, initial.project, clientId, pageKey) : [];
    for (const document of documents)
      requireDocumentAccess(store, user, initial.project, snapshot, document.path);
    for (const document of documents.filter((item) => item.summary))
      requireDocumentAccess(store, user, initial.project, snapshot, document.summary);
    const markdown = documents
      .map((item) => snapshot.files.get(item.path).toString('utf8'))
      .join('\n\n---\n\n');
    if (resource === 'asset') {
      if (!snapshot) fail(404, '说明资源未发布', 'NOT_FOUND');
      const file = url.searchParams.get('path');
      requireDocumentAccess(store, user, initial.project, snapshot, file);
      if (!snapshot.manifest.assets.includes(file)) fail(404, '说明资源未发布', 'NOT_FOUND');
      const result = readContentFile(snapshot, file);
      recheck();
      response.writeHead(200, {
        'Content-Type':
          { '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }[result.extension] ??
          'application/octet-stream',
      });
      response.end(result.bytes);
      return true;
    }
    if (resource === 'markdown') {
      recheck();
      response.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' });
      response.end(markdown);
      return true;
    }
    recheck();
    json(response, {
      projectId,
      projectName: initial.project.name,
      clientId,
      pageKey,
      title: initial.page.label,
      description: componentRegistry.find((item) => item.name === descriptor.registryItem)?.description ?? '',
      descriptionEn: componentRegistry.find((item) => item.name === descriptor.registryItem)?.descriptionEn,
      category: initial.page.group,
      access: initial.page.access ?? 'restricted',
      contentRevision: snapshot?.revision ?? '',
      releaseId: snapshot?.releaseId ?? null,
      entry: root
        ? `/${compiled.entry}`
        : `/${descriptor.root.replace(/^apps\/web\//, '')}/${descriptor.source}`,
      styles: root ? compiled.assets.filter((file) => file.endsWith('.css')).map((file) => `/${file}`) : [],
      documents,
      markdown,
      summaryMarkdown: documents
        .filter((item) => item.summary)
        .map((item) => snapshot.files.get(item.summary).toString('utf8'))
        .join('\n\n'),
      summaryPath: documents.find((item) => item.summary)?.summary ?? null,
      registry: descriptor.registryItem
        ? {
            name: descriptor.registryItem,
            kind: componentRegistry.find((item) => item.name === descriptor.registryItem)?.kind,
            url: `/r/${projectId}/${descriptor.registryItem}.json`,
          }
        : null,
    });
    return true;
  };
}
