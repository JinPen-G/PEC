import { promises as fs } from 'node:fs';
import path from 'node:path';

import {
  applyContentOnlyMode,
  isInsideRoot,
  resolveExistingPathInsideRoot,
  scanHtmlPrototypePages,
  toWebPath,
  walkFiles,
} from '../packages/project-core/src/index.js';

const PUBLIC_EXTENSIONS = new Set([
  '.avif',
  '.css',
  '.gif',
  '.html',
  '.htm',
  '.ico',
  '.jpeg',
  '.jpg',
  '.js',
  '.json',
  '.mjs',
  '.mp3',
  '.mp4',
  '.png',
  '.svg',
  '.ttf',
  '.wasm',
  '.webmanifest',
  '.webp',
  '.woff',
  '.woff2',
]);
const VIRTUAL_MODULE_ID = 'virtual:project-html-pages';
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;
const HTML_PAGES_API_PATH = '/__projects/html-pages';

export { applyContentOnlyMode, scanHtmlPrototypePages } from '../packages/project-core/src/index.js';

function decodePathSegment(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}

async function resolvePublicFile(root, relativePath) {
  const normalizedPath = String(relativePath || '')
    .replaceAll('\\', '/')
    .replace(/^\/+/, '');
  return resolveExistingPathInsideRoot(root, normalizedPath, {
    allowedExtensions: PUBLIC_EXTENSIONS,
  });
}

function mimeTypeFor(filePath) {
  return (
    {
      '.css': 'text/css; charset=utf-8',
      '.gif': 'image/gif',
      '.html': 'text/html; charset=utf-8',
      '.htm': 'text/html; charset=utf-8',
      '.ico': 'image/x-icon',
      '.jpeg': 'image/jpeg',
      '.jpg': 'image/jpeg',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.mjs': 'text/javascript; charset=utf-8',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.ttf': 'font/ttf',
      '.wasm': 'application/wasm',
      '.webmanifest': 'application/manifest+json',
      '.webp': 'image/webp',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    }[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
  );
}

function isLocalRequest(req) {
  const address = String(req.socket?.remoteAddress || '').replace('::ffff:', '');
  return address === '' || address === '127.0.0.1' || address === '::1' || address === 'localhost';
}

function sourceContentDisposition(filePath) {
  const fileName = path.basename(filePath);
  const fallbackName = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\\r\n]/g, '_');
  return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export function htmlPrototypePlugin({
  projectsRoot,
  mountsPath = '',
  loadMounts = async () => ({ projects: {} }),
  buildVersion = '',
}) {
  const root = path.resolve(projectsRoot);
  const localMountsPath = mountsPath ? path.resolve(mountsPath) : '';
  let isBuild = false;
  let scanState = { projects: {}, roots: {}, sections: {} };
  let refreshTimer = null;

  async function refreshState() {
    scanState = await scanHtmlPrototypePages(root, { mounts: await loadMounts() });
    return scanState;
  }

  return {
    name: 'html-prototype',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    resolveId(id) {
      return id === VIRTUAL_MODULE_ID ? RESOLVED_VIRTUAL_MODULE_ID : undefined;
    },
    async load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) return undefined;
      const state = await refreshState();
      return `export default ${JSON.stringify(state.projects)};`;
    },
    async configureServer(server) {
      await refreshState();
      server.watcher.add(root);
      if (localMountsPath) server.watcher.add(localMountsPath);
      Object.values(scanState.roots)
        .flat()
        .forEach((source) => server.watcher.add(source.root));
      server.watcher.on('all', (_eventName, changedPath) => {
        const absolutePath = path.resolve(changedPath);
        const relativePath = toWebPath(path.relative(root, absolutePath));
        const isProjectConfigChange =
          absolutePath === root || /^([a-z][a-z0-9-]*)\/project\.json$/i.test(relativePath);
        const isMountChange = Boolean(localMountsPath && absolutePath === localMountsPath);
        const isPrototypeChange = Object.values(scanState.roots)
          .flat()
          .some((source) => absolutePath === source.root || isInsideRoot(source.root, absolutePath));
        if (!isProjectConfigChange && !isPrototypeChange && !isMountChange) return;
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(async () => {
          try {
            await refreshState();
            Object.values(scanState.roots)
              .flat()
              .forEach((source) => server.watcher.add(source.root));
            const virtualModule = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
            if (virtualModule && (isProjectConfigChange || isPrototypeChange || isMountChange)) {
              server.moduleGraph.invalidateModule(virtualModule);
            }
            if (isPrototypeChange || isMountChange) server.ws.send({ type: 'full-reload' });
          } catch (error) {
            server.config.logger.error(`[html-prototype] 原型目录刷新失败：${error.message}`);
          }
        }, 120);
      });

      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url || '/', 'http://localhost');
        if (requestUrl.pathname === HTML_PAGES_API_PATH) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(
            JSON.stringify({
              generatedAt: new Date().toISOString(),
              projects: scanState.projects,
              sections: scanState.sections,
            }),
          );
          return;
        }
        const prefix = '/__projects/html-content/';
        if (!requestUrl.pathname.startsWith(prefix)) return next();
        const pathParts = requestUrl.pathname.slice(prefix.length).split('/').filter(Boolean);
        const projectId = decodePathSegment(pathParts.shift() || '');
        const clientId = decodePathSegment(pathParts.shift() || '_');
        const relativePath = pathParts.map(decodePathSegment).join('/');
        const prototypeSource = (scanState.roots[projectId] || []).find(
          (source) => (source.sourceId || source.clientId || '_') === clientId,
        );
        const target = prototypeSource ? await resolvePublicFile(prototypeSource.root, relativePath) : null;
        if (!target) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ message: 'HTML 原型文件不存在或路径无效。' }));
          return;
        }
        try {
          const isHtml = /\.html?$/i.test(target);
          const downloadSource = requestUrl.searchParams.get('download') === 'source';
          if (downloadSource && (!isHtml || !isLocalRequest(req))) {
            res.statusCode = isHtml ? 403 : 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(
              JSON.stringify({
                message: isHtml ? '页面源文件下载仅允许本机使用。' : '当前文件不是 HTML 页面。',
              }),
            );
            return;
          }
          const content = isHtml
            ? Buffer.from(
                downloadSource || prototypeSource.shellMode === 'full'
                  ? await fs.readFile(target, 'utf8')
                  : applyContentOnlyMode(await fs.readFile(target, 'utf8')),
                'utf8',
              )
            : await fs.readFile(target);
          res.statusCode = 200;
          res.setHeader('Content-Type', mimeTypeFor(target));
          res.setHeader('Cache-Control', 'no-store');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          if (downloadSource) res.setHeader('Content-Disposition', sourceContentDisposition(target));
          res.end(content);
        } catch (error) {
          res.statusCode = error.code === 'ENOENT' ? 404 : 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ message: 'HTML 原型文件读取失败。', detail: error.message }));
        }
      });
    },
    async buildStart() {
      if (!isBuild) return;
      const state = await refreshState();
      this.emitFile({
        type: 'asset',
        fileName: 'projects/html-pages.json',
        source: JSON.stringify(
          { generatedAt: new Date().toISOString(), projects: state.projects, sections: state.sections },
          null,
          2,
        ),
      });
      for (const [projectId, sources] of Object.entries(state.roots)) {
        for (const prototypeSource of sources) {
          for (const absolutePath of await walkFiles(prototypeSource.root, {
            extensions: PUBLIC_EXTENSIONS,
          })) {
            const relativePath = toWebPath(path.relative(prototypeSource.root, absolutePath));
            const sourceId = prototypeSource.sourceId || prototypeSource.clientId || '';
            const clientPrefix = sourceId ? `${sourceId}/` : '';
            const source = await fs.readFile(absolutePath);
            const output = /\.html?$/i.test(absolutePath)
              ? Buffer.from(
                  prototypeSource.shellMode === 'full'
                    ? source.toString('utf8')
                    : applyContentOnlyMode(source.toString('utf8')),
                  'utf8',
                )
              : source;
            this.emitFile({
              type: 'asset',
              fileName: `projects/${projectId}/prototype/${buildVersion ? `releases/${buildVersion}/` : ''}${clientPrefix}${relativePath}`,
              source: output,
            });
          }
        }
      }
    },
  };
}
