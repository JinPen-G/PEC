/** Formal API/static adapter. Legacy HTML/tools are never mounted here. Every
 * private request rechecks durable identity and project permissions. */
import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import { URL } from 'node:url';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import { createNativeStore, NativeError, fail } from '../../project-core/src/platform/store.js';
import { createNativeDocuments } from '../../project-core/src/platform/documents.js';
import { resolveExistingPathInsideRoot } from '../../project-core/src/filesystem.js';
import {
  NATIVE_API_PREFIX,
  NATIVE_MODULES,
  nativePublicAssetAllowed,
} from '../../platform-contracts/src/platform.js';
import { createCollaborationHub } from './collaboration-hub.js';
import {
  createProjectContent,
  contentDocuments,
  readContentFile,
  queryBusinessContext,
} from '../../project-core/src/platform/project-content.js';
import { createProjectContextHandler } from './project-context.js';
import { createShowcaseHandler } from './showcase-server.js';
import { sendAudioAsset } from './audio-response.js';
import { clientAddress } from './client-address.js';
import { createRestMedia } from './rest-media.js';
import { COMPONENT_REGISTRY } from '../../platform-contracts/src/component-registry.js';
import { createAgentContext } from '../../project-core/src/platform/agent-context.js';
import { requirementGraphView } from '../../project-core/src/platform/requirement-graph.js';
import {
  readableDocuments,
  requireDocumentAccess,
  pageDocuments,
  readableSourceDocuments,
  requireSourceDocumentAccess,
} from '../../project-core/src/platform/page-documents.js';

const mime = {
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
};
function cookies(request) {
  const value = String(request.headers.cookie || '')
    .split(';')
    .find((part) => part.trim().startsWith('preview_session='));
  return value?.trim().slice('preview_session='.length) ?? '';
}
async function body(request) {
  if (!String(request.headers['content-type']).startsWith('application/json'))
    fail(415, '仅接受JSON请求', 'UNSUPPORTED_MEDIA_TYPE');
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 128 * 1024) fail(413, '请求过大', 'PAYLOAD_TOO_LARGE');
    chunks.push(chunk);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || Array.isArray(value) || typeof value !== 'object') fail(400, '请求内容无效');
    return value;
  } catch (error) {
    if (error instanceof NativeError) throw error;
    fail(400, 'JSON格式错误');
  }
}
export function createNativeServer({
  dataDirectory,
  sources = {},
  staticRoot,
  mediaRoot,
  releaseRoot,
  retainedReleaseRoot = releaseRoot,
  releaseId = 'development',
  contentRoot,
  pageSourceRoot,
  publicOrigin = 'http://127.0.0.1:5190',
  allowBootstrap = false,
  trustLoopbackProxy = false,
  storeOptions = {},
  moduleCatalog = NATIVE_MODULES,
  componentRegistry = COMPONENT_REGISTRY,
}) {
  const origin = new URL(publicOrigin),
    secure = origin.protocol === 'https:';
  const store = createNativeStore({
    ...storeOptions,
    dataDirectory,
    documentSources: ['none', ...Object.keys(sources), 'published'],
    moduleCatalog,
  });
  const legacyDocuments = createNativeDocuments({ sources });
  store.synchronizeProjectSources();
  const content = createProjectContent({
    contentRoot,
    releaseRoot,
    releaseId,
    moduleCatalog,
    pageSourceRoot,
    staticRoot,
  });
  const documents = {
    sources: () => [...legacyDocuments.sources(), { id: 'published', label: 'Git业务资料包（只读）' }],
    async list(project) {
      if (project.sourceId === 'none') return [];
      if (project.sourceId !== 'published') return legacyDocuments.list(project);
      return contentDocuments(await content.snapshot(project));
    },
    async read(project, file) {
      if (project.sourceId === 'none') fail(404, '项目尚未编写需求说明', 'NOT_FOUND');
      if (project.sourceId !== 'published') return legacyDocuments.read(project, file);
      return readContentFile(await content.snapshot(project), file);
    },
  };
  const collaboration = createCollaborationHub(store);
  const restMedia = createRestMedia(mediaRoot);
  const attempts = new Map();
  const setCookie = (response, token, clear = false) =>
    response.setHeader(
      'Set-Cookie',
      `preview_session=${clear ? '' : token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : 28800}${secure ? '; Secure' : ''}`,
    );
  const json = (response, value, status = 200) => {
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(value));
  };
  const agentContext = createAgentContext({
    content,
    registry: componentRegistry,
    pageSourceRoot,
    staticRoot,
    releaseRoot,
    publicOrigin: origin.origin,
  });
  const projectContext = createProjectContextHandler({
    store,
    content,
    agentContext,
    publicOrigin,
    json,
    body,
  });
  const showcase = createShowcaseHandler({
    store,
    content,
    staticRoot,
    releaseRoot,
    pageSourceRoot,
    json,
    cookies,
    publicOrigin: origin.origin,
    agentContext,
    moduleCatalog,
    componentRegistry,
  });
  function requestOrigin(request) {
    if (request.headers.origin !== origin.origin || request.headers['sec-fetch-site'] === 'cross-site')
      fail(403, '请求来源不允许', 'CSRF_REJECTED');
  }
  function rateLimit(request, username) {
    const key = clientAddress(request, trustLoopbackProxy),
      at = Date.now();
    for (const [name, value] of attempts) if (at - value.at > 60_000) attempts.delete(name);
    const entry = attempts.get(key) ?? { at, count: 0 };
    entry.count++;
    attempts.set(key, entry);
    if (attempts.size > 2048 || entry.count > 20) fail(429, '登录尝试过多，请一分钟后重试', 'RATE_LIMITED');
    if (typeof username !== 'string' || username.length > 64) fail(401, '账号或密码错误', 'UNAUTHORIZED');
  }
  const server = createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'same-origin');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    );
    try {
      const url = new URL(request.url, publicOrigin);
      const route = url.pathname;
      const mutation = !['GET', 'HEAD'].includes(request.method);
      if (await showcase(request, response, url)) return;
      if (await projectContext(request, response, url)) return;
      if (route.startsWith(NATIVE_API_PREFIX)) {
        if (route === `${NATIVE_API_PREFIX}/health` && request.method === 'GET')
          return json(response, {
            status: 'ok',
            releaseId,
            protocol: 1,
            databaseSchema: store.databaseSchema,
            contentSchema: 1,
            releaseSchemas: [1, 2, 3],
          });
        if (mutation) requestOrigin(request);
        if (route === `${NATIVE_API_PREFIX}/session` && request.method === 'GET') {
          const session = store.authenticate(cookies(request));
          return json(response, {
            initialized: store.initialized(),
            user: session?.user ?? null,
            csrf: session?.csrf ?? null,
          });
        }
        if (route === `${NATIVE_API_PREFIX}/bootstrap` && request.method === 'POST') {
          const peer = request.socket.remoteAddress;
          if (
            !allowBootstrap ||
            !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer) ||
            !['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname)
          )
            fail(403, '管理员初始化只允许本机受控入口', 'FORBIDDEN');
          const input = await body(request);
          rateLimit(request, input.username);
          store.bootstrap(input);
          return json(response, { initialized: true }, 201);
        }
        if (route === `${NATIVE_API_PREFIX}/login` && request.method === 'POST') {
          const input = await body(request);
          rateLimit(request, input.username);
          const result = store.login(input.username, input.password);
          store.logout(cookies(request));
          setCookie(response, result.token);
          return json(response, { initialized: true, user: result.user, csrf: result.csrf });
        }
        const token = cookies(request),
          session = store.authenticate(token);
        if (!session) fail(401, '请登录后继续', 'UNAUTHORIZED');
        if (mutation && request.headers['x-preview-csrf'] !== session.csrf)
          fail(403, '请求校验失败，请重新登录', 'CSRF_REJECTED');
        const user = session.user;
        const requireSession = () => {
          const current = store.authenticate(token);
          if (!current || current.user.revision !== user.revision)
            fail(401, '登录已变更，请重新登录', 'UNAUTHORIZED');
        };
        const readBody = async () => {
          const input = await body(request);
          requireSession();
          return input;
        };
        if (route === `${NATIVE_API_PREFIX}/logout` && request.method === 'POST') {
          store.logout(token);
          setCookie(response, '', true);
          return json(response, { loggedOut: true });
        }
        if (route === `${NATIVE_API_PREFIX}/password` && request.method === 'POST') {
          const result = store.changePassword(user, await readBody());
          setCookie(response, '', true);
          return json(response, result);
        }
        if (user.mustChangePassword) fail(403, '请先修改初始密码', 'PASSWORD_CHANGE_REQUIRED');
        if (route === `${NATIVE_API_PREFIX}/settings` && request.method === 'GET')
          return json(response, store.getSettings(user));
        if (route === `${NATIVE_API_PREFIX}/settings` && request.method === 'PATCH')
          return json(response, store.saveSettings(user, await readBody()));
        const collaborate = /^\/api\/native\/collaboration\/([^/]+)(?:\/(stream))?$/.exec(route);
        if (route === `${NATIVE_API_PREFIX}/collaboration` && request.method === 'POST') {
          const input = await readBody();
          return json(response, collaboration.join(token, input.projectId), 201);
        }
        if (collaborate && collaborate[2] === 'stream' && request.method === 'GET')
          return collaboration.stream(collaborate[1], token, response);
        if (collaborate && !collaborate[2] && request.method === 'POST')
          return json(response, collaboration.command(collaborate[1], token, await readBody()));
        if (route === `${NATIVE_API_PREFIX}/catalog` && request.method === 'GET')
          return json(response, {
            modules: moduleCatalog,
            sources: user.role === 'admin' ? documents.sources() : [],
            contents: user.role === 'admin' ? await content.catalog() : [],
          });
        if (route === `${NATIVE_API_PREFIX}/context-tokens` && request.method === 'GET')
          return json(response, store.listContextTokens(user, url.searchParams.get('projectId')));
        if (route === `${NATIVE_API_PREFIX}/context-tokens` && request.method === 'POST') {
          const input = await readBody();
          const project = store.getProject(user, input.projectId);
          if (project.contentKey) await content.snapshot(project);
          requireSession();
          return json(response, store.issueContextToken(user, input.projectId, input), 201);
        }
        const contextToken = /^\/api\/native\/context-tokens\/([^/]+)$/.exec(route);
        if (contextToken && request.method === 'DELETE')
          return json(response, store.revokeContextToken(user, contextToken[1]));
        if (route === `${NATIVE_API_PREFIX}/accounts` && request.method === 'GET')
          return json(response, store.listAccounts(user));
        if (route === `${NATIVE_API_PREFIX}/accounts` && request.method === 'POST')
          return json(response, store.createAccount(user, await readBody()), 201);
        const account = /^\/api\/native\/accounts\/([^/]+)$/.exec(route);
        if (account && request.method === 'PATCH')
          return json(response, store.updateAccount(user, decodeURIComponent(account[1]), await readBody()));
        if (route === `${NATIVE_API_PREFIX}/audit` && request.method === 'GET')
          return json(response, store.listAudit(user));
        if (route === `${NATIVE_API_PREFIX}/page-grants` && request.method === 'GET')
          return json(response, store.listPageGrants(user, url.searchParams.get('projectId')));
        if (route === `${NATIVE_API_PREFIX}/page-grants` && request.method === 'PUT') {
          const input = await readBody();
          return json(
            response,
            store.setPageGrant(
              user,
              input.projectId,
              input.clientId,
              input.pageKey,
              input.userId,
              input.allowed,
            ),
          );
        }
        if (route === `${NATIVE_API_PREFIX}/projects` && request.method === 'GET')
          return json(response, store.listProjects(user));
        if (route === `${NATIVE_API_PREFIX}/projects` && request.method === 'POST') {
          const input = await readBody();
          if (input.links?.length) fail(400, '先创建项目，再验证并保存文档关联');
          if (input.sourceId === 'published') await content.snapshot(input);
          requireSession();
          return json(response, store.createProject(user, input), 201);
        }
        const project = /^\/api\/native\/projects\/([^/]+)(?:\/(.*))?$/.exec(route);
        if (project) {
          const id = decodeURIComponent(project[1]),
            suffix = project[2];
          if (!suffix && request.method === 'GET') return json(response, store.getProject(user, id));
          if (suffix === 'readiness' && request.method === 'GET') {
            const current = store.getProject(user, id);
            if (user.role !== 'admin') fail(403, '仅管理员可检查接入状态', 'FORBIDDEN');
            const result = await agentContext.query(
              { project: current, scopes: ['business:read', 'governance:read', 'components:read'] },
              'get_project_context',
            );
            const module = moduleCatalog.find((item) => item.key === current.moduleKey);
            const visible = current.clients
              .filter((client) => client.enabled)
              .flatMap((client) => client.pages.filter((page) => page.visible));
            const snapshot = current.contentKey ? await content.snapshot(current) : null;
            const checks = await agentContext.check(current, moduleCatalog);
            const graph = snapshot ? requirementGraphView(snapshot, current) : null;
            requireSession();
            return json(response, {
              ...result,
              ...checks,
              archived: current.archived,
              registeredPages: module?.pages.length ?? 0,
              visiblePages: visible.length,
              mcpUrl: `${origin.origin}/api/project-context/mcp`,
              unlinkedRequirements:
                snapshot?.manifest.requirements
                  .filter((doc) => !doc.pages.length)
                  .map((doc) => ({ id: doc.id, title: doc.title })) ?? [],
              graph: graph
                ? {
                    availability: graph.availability,
                    freshness: graph.freshness,
                    complete: graph.complete,
                    diagnostics: graph.diagnostics,
                  }
                : null,
            });
          }
          if (!suffix && request.method === 'PATCH') {
            const input = await readBody();
            const existing = store.getProject(user, id);
            store.projectAccess(user, id, true, true);
            if (input.sourceId !== undefined && input.sourceId !== existing.sourceId && user.role !== 'admin')
              fail(403, '文档源仅管理员可以配置', 'FORBIDDEN');
            const candidate = { ...existing, ...input };
            const published = candidate.sourceId === 'published' ? await content.snapshot(candidate) : null;
            if (input.links !== undefined && !Array.isArray(input.links)) fail(400, '文档关联配置无效');
            // Associations cannot point at arbitrary or missing documents. A cleared link is explicit.
            if (input.links)
              for (const link of input.links)
                if (link.documentPath) await documents.read(candidate, link.documentPath);
            if (published && input.links) {
              // Editors may change only associations whose documents they can read;
              // original manifest restrictions remain in effect after reassociation.
              const signature = (links, link) =>
                JSON.stringify(
                  links
                    .filter((item) => item.clientId === link.clientId && item.pageKey === link.pageKey)
                    .map((item) => [item.documentPath, item.anchor])
                    .sort(),
                );
              for (const link of [...existing.links, ...input.links])
                if (link.documentPath && signature(existing.links, link) !== signature(input.links, link))
                  requireDocumentAccess(store, user, existing, published, link.documentPath);
            }
            if (!published && input.links && user.role !== 'admin') {
              for (const link of existing.links) {
                if (!input.links.some((item) => JSON.stringify(item) === JSON.stringify(link)))
                  store.pageAccess(user, id, link.clientId, link.pageKey);
              }
            }
            requireSession();
            return json(response, store.updateProject(user, id, input));
          }
          if (suffix === 'members' && request.method === 'GET')
            return json(response, store.listMembers(user, id));
          if (suffix === 'page-context' && request.method === 'GET') {
            const current = store.getProject(user, id),
              clientId = url.searchParams.get('clientId'),
              pageKey = url.searchParams.get('pageKey');
            store.pageAccess(user, id, clientId, pageKey);
            let links;
            if (current.sourceId === 'published') {
              const snapshot = await content.snapshot(current);
              links = pageDocuments(snapshot, current, clientId, pageKey).map((document) => {
                requireDocumentAccess(store, user, current, snapshot, document.path);
                return {
                  clientId,
                  pageKey,
                  documentPath: document.path,
                  title: document.title,
                  anchor:
                    document.pages.find((page) => page.clientId === clientId && page.pageKey === pageKey)
                      ?.anchor ?? '',
                };
              });
            } else
              links = current.links.filter(
                (link) => link.clientId === clientId && link.pageKey === pageKey && link.documentPath,
              );
            requireSession();
            store.pageAccess(user, id, clientId, pageKey);
            if (store.getProject(user, id).revision !== current.revision)
              fail(409, '项目配置已变更', 'CONFLICT');
            return json(response, { links });
          }
          const member = /^members\/([^/]+)$/.exec(suffix ?? '');
          const pageGrants = /^page-grants\/([^/]+)$/.exec(suffix ?? '');
          if (pageGrants && request.method === 'PUT')
            return json(
              response,
              store.replacePageGrants(user, id, decodeURIComponent(pageGrants[1]), await readBody()),
            );
          if (member && request.method === 'PUT')
            return json(response, store.setMember(user, id, decodeURIComponent(member[1]), await readBody()));
          if (suffix === 'business' && request.method === 'GET') {
            const current = store.getProject(user, id);
            store.projectAccess(user, id);
            const snapshot = await content.snapshot(current, url.searchParams.get('contentRevision'));
            const result = queryBusinessContext(snapshot, current, 'get_project_overview');
            requireSession();
            if (store.getProject(user, id).revision !== current.revision)
              fail(409, '项目配置已变更', 'CONTENT_REVISION_CHANGED');
            store.projectAccess(user, id);
            return json(response, result);
          }
          if (suffix === 'documents' && request.method === 'GET') {
            store.projectAccess(user, id);
            const current = store.getProject(user, id);
            const result =
              current.sourceId === 'published'
                ? readableDocuments(store, user, current, await content.snapshot(current))
                : readableSourceDocuments(store, user, current, await documents.list(current));
            requireSession();
            store.projectAccess(user, id);
            if (store.getProject(user, id).revision !== current.revision)
              fail(409, '项目配置已变更', 'CONTENT_REVISION_CHANGED');
            return json(response, result);
          }
          if (suffix === 'document' && request.method === 'GET') {
            store.projectAccess(user, id);
            const file = url.searchParams.get('path');
            const current = store.getProject(user, id);
            if (current.sourceId === 'published') {
              requireDocumentAccess(store, user, current, await content.snapshot(current), file);
            }
            const result = await documents.read(current, file);
            if (current.sourceId !== 'published')
              await requireSourceDocumentAccess(
                store,
                user,
                current,
                await documents.list(current),
                documents.read,
                file,
              );
            requireSession();
            store.projectAccess(user, id);
            if (store.getProject(user, id).revision !== current.revision)
              fail(409, '项目配置已变更', 'CONTENT_REVISION_CHANGED');
            response.setHeader('ETag', `"${result.revision}"`);
            response.writeHead(200, {
              'Content-Type': mime[result.extension],
              ...(result.extension === '.md' ? {} : { 'Content-Disposition': 'inline' }),
            });
            return response.end(result.bytes);
          }
          if (suffix === 'page-management' && request.method === 'GET') {
            const current = store.getProject(user, id);
            store.projectAccess(user, id, true, true);
            const snapshot = current.sourceId === 'published' ? await content.snapshot(current) : null;
            const accessible = snapshot ? readableDocuments(store, user, current, snapshot) : null;
            const result = current.clients.flatMap((client) =>
              client.pages.map((page) => ({
                clientId: client.id,
                pageKey: page.key,
                documents: snapshot
                  ? pageDocuments(snapshot, current, client.id, page.key)
                      .filter((document) => accessible.some((item) => item.path === document.path))
                      .map(({ path, title }) => ({
                        path,
                        title,
                      }))
                  : current.links
                      .filter(
                        (link) =>
                          link.clientId === client.id && link.pageKey === page.key && link.documentPath,
                      )
                      .map((link) => ({ path: link.documentPath, title: link.documentPath })),
              })),
            );
            requireSession();
            store.projectAccess(user, id, true, true);
            if (store.getProject(user, id).revision !== current.revision)
              fail(409, '项目配置已变更', 'CONFLICT');
            return json(response, { project: current, pages: result });
          }
        }
        fail(404, '接口不存在', 'NOT_FOUND');
      }
      if (route.startsWith('/api/') || route.startsWith('/__') || !['GET', 'HEAD'].includes(request.method))
        fail(404, '入口不存在', 'NOT_FOUND');
      if (!staticRoot && !releaseRoot) fail(404, '此进程仅提供平台API', 'NOT_FOUND');
      const spaRoute =
        /^\/(?:login|sign-in|sign-up|forgot-password|projects|documents|docs(?:\/(?:installation|theming|motion|graph|ai|changelog))?|pages\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+|center(?:\/[a-z0-9-]+)?|manage\/(?:projects|pages|accounts|access|settings|appearance)|projects\/[a-z0-9-]+\/(?:config|settings|menus|access)|p\/[a-z0-9-]+(?:\/[a-z0-9-]+){0,2})$/.test(
          route,
        );
      const relative = spaRoute
        ? 'index.html'
        : decodeURIComponent(route).replace(/^\/+/, '') || 'index.html';
      // The formal build contains code/brand assets only. No public project/document trees.
      if (!nativePublicAssetAllowed(relative)) fail(404, '静态资源不存在', 'NOT_FOUND');
      let activeRoot = staticRoot,
        previousRoot = null;
      if (releaseRoot) {
        const pointer = JSON.parse(await fs.readFile(path.join(releaseRoot, 'current.json'), 'utf8'));
        if (!/^[a-f\d]{12}-[a-f\d]{12}$/.test(pointer.releaseId))
          fail(503, '发行版本指针无效', 'RELEASE_UNAVAILABLE');
        activeRoot = path.join(releaseRoot, pointer.releaseId, 'web');
        if (/^[a-f\d]{12}-[a-f\d]{12}$/.test(pointer.previous ?? ''))
          previousRoot = path.join(releaseRoot, pointer.previous, 'web');
      }
      let file =
        (await restMedia.file(relative)) ??
        (await resolveExistingPathInsideRoot(activeRoot, relative, {
          allowedExtensions: Object.keys(mime),
        }));
      if (!file && previousRoot && relative.startsWith('assets/'))
        file = await resolveExistingPathInsideRoot(previousRoot, relative, {
          allowedExtensions: Object.keys(mime),
        });
      // Open clients may be more than one release behind. Retained hashed assets
      // remain readable; no old index, version pointer or private data is served.
      if (!file && retainedReleaseRoot && /^assets\/[\w.-]+$/.test(relative)) {
        const realReleaseRoot = await fs.realpath(retainedReleaseRoot);
        for (const entry of await fs.readdir(retainedReleaseRoot, { withFileTypes: true })) {
          if (!entry.isDirectory() || !/^[a-f\d]{12}-[a-f\d]{12}$/.test(entry.name)) continue;
          const candidateRoot = path.join(retainedReleaseRoot, entry.name, 'web');
          const realCandidate = await fs.realpath(candidateRoot).catch(() => null);
          if (!realCandidate || path.dirname(path.dirname(realCandidate)) !== realReleaseRoot) continue;
          file = await resolveExistingPathInsideRoot(candidateRoot, relative, {
            allowedExtensions: Object.keys(mime),
          });
          if (file) break;
        }
      }
      if (!file) fail(404, '静态资源不存在', 'NOT_FOUND');
      if (path.extname(file) === '.mp3') return await sendAudioAsset(request, response, file);
      const bytes = request.method === 'HEAD' ? undefined : await fs.readFile(file);
      const payload = relative === 'index.html' && bytes ? await restMedia.index(bytes) : bytes;
      response.writeHead(200, { 'Content-Type': mime[path.extname(file)] });
      response.end(payload);
    } catch (error) {
      if (response.headersSent) {
        response.end();
        return;
      }
      const known = error instanceof NativeError;
      if (known && error.status === 429) response.setHeader('Retry-After', '60');
      json(
        response,
        {
          code: known ? error.code : 'SERVER_ERROR',
          message: known ? error.message : '平台请求失败，请稍后重试',
        },
        known ? error.status : 500,
      );
    }
  });
  return {
    server,
    store,
    close: () =>
      new Promise((resolve) => {
        collaboration.close();
        server.close(() => {
          store.close();
          resolve();
        });
        server.closeIdleConnections();
      }),
  };
}
