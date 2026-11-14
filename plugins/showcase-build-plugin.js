/** Registered page chunks are emitted outside public assets. Their source is
 * exported explicitly, and runtime files remain behind server authorization. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { showcaseModules } from '../packages/platform-contracts/src/showcase.js';
import { NATIVE_MODULES } from '../packages/platform-contracts/src/platform.js';
import { COMPONENT_REGISTRY } from '../packages/platform-contracts/src/component-registry.js';
import { loadComponentRegistryItem } from '../packages/project-core/src/platform/component-registry.js';
import { loadPrototypeRevisions } from '../packages/project-core/src/platform/project-content.js';
import { loadProjectCatalog } from '../packages/platform-server/src/project-catalog.js';
export function protectedLibraryChunk(id) {
  const normalized = id.replaceAll('\\', '/').split('?')[0];
  const library = /\/component-library\/src\/([^/]+)\/(.+)$/.exec(normalized);
  if (!library) return undefined;
  const item = /^(components|blocks)\/([^/]+)\//.exec(library[2]);
  if (item) return `page-library-${library[1]}-${item[1]}-${item[2]}`;
  return `page-library-${library[1]}-shared-${createHash('sha256').update(library[2]).digest('hex').slice(0, 12)}`;
}
export function protectedPageAssets(bundle, entry) {
  const assets = new Set();
  const visit = (fileName) => {
    if (assets.has(fileName) || !fileName.startsWith('page-assets/')) return;
    const chunk = bundle[fileName];
    if (!chunk) throw new Error(`Missing protected page asset: ${fileName}`);
    assets.add(fileName);
    if (chunk.type !== 'chunk') return;
    for (const dependency of [...chunk.imports, ...(chunk.dynamicImports ?? [])]) visit(dependency);
    for (const css of chunk.viteMetadata?.importedCss ?? []) {
      if (!css.startsWith('page-assets/')) throw new Error('Page CSS escaped authorization boundary');
      if (!bundle[css]) throw new Error(`Missing protected page asset: ${css}`);
      assets.add(css);
    }
  };
  visit(entry);
  return [...assets];
}
export function assertPublicBundleIsolation(bundle) {
  for (const item of Object.values(bundle)) {
    if (item.type !== 'chunk' || item.fileName.startsWith('page-assets/')) continue;
    if ([...item.imports, ...(item.dynamicImports ?? [])].some((file) => file.startsWith('page-assets/')))
      throw new Error(`Public bundle depends on protected page: ${item.fileName}`);
    if (
      Object.keys(item.modules ?? {}).some((id) =>
        /\/(?:src\/project-modules|component-library\/src)\//.test(id.replaceAll('\\', '/')),
      )
    )
      throw new Error(`Project source escaped protected bundle: ${item.fileName}`);
  }
}
export function showcaseBuildPlugin(root, options) {
  let { moduleCatalog = NATIVE_MODULES, componentRegistry = COMPONENT_REGISTRY } = options ?? {};
  let pageModules = showcaseModules(moduleCatalog);
  let building = false;
  return {
    name: 'preview-showcase-build',
    async configResolved(config) {
      if (!options) {
        const catalog = await loadProjectCatalog(path.join(root, 'packages/platform-contracts/src'));
        moduleCatalog = catalog.moduleCatalog;
        componentRegistry = catalog.componentRegistry;
        pageModules = showcaseModules(moduleCatalog);
      }
      building = config.command === 'build';
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        let pathname;
        try {
          pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        } catch {
          response.statusCode = 400;
          response.end();
          return;
        }
        const match = /\/(?:src\/)?project-modules\/([^/]+)\/([^/]+)\//.exec(pathname);
        const libraryIndex = pathname.indexOf('/packages/component-library/src/');
        if (libraryIndex >= 0) {
          const source = pathname.slice(libraryIndex + 1);
          const items = componentRegistry.filter((item) => item.files.some((file) => file.path === source));
          try {
            for (const item of items) {
              const check = await fetch(
                `http://127.0.0.1:5190/api/native/showcase/registry-permission?name=${encodeURIComponent(item.name)}`,
                { headers: { cookie: request.headers.cookie ?? '' } },
              );
              if (check.ok) {
                next();
                return;
              }
              if (![401, 403].includes(check.status)) {
                response.statusCode = check.status;
                response.end('Component authorization unavailable');
                return;
              }
            }
            response.statusCode = 403;
            response.end('Component authorization required');
          } catch {
            response.statusCode = 503;
            response.end('Preview API unavailable');
          }
          return;
        }
        if (!match) {
          next();
          return;
        }
        const registered = Object.entries(pageModules).find(
          ([, pages]) => pages[match[2]]?.root === `apps/web/src/project-modules/${match[1]}/${match[2]}`,
        );
        if (!registered) {
          response.statusCode = 403;
          response.end('Page authorization required');
          return;
        }
        try {
          const check = await fetch(
            `http://127.0.0.1:5190/api/native/showcase/module-permission?moduleKey=${encodeURIComponent(registered[0])}&pageKey=${encodeURIComponent(match[2])}`,
            { headers: { cookie: request.headers.cookie ?? '' } },
          );
          if (!check.ok) {
            response.statusCode = check.status;
            response.end('Page authorization required');
            return;
          }
          next();
        } catch {
          response.statusCode = 503;
          response.end('Preview API unavailable');
        }
      });
    },
    async buildStart() {
      if (!building) return;
      for (const [moduleKey, pages] of Object.entries(pageModules))
        for (const [pageKey, descriptor] of Object.entries(pages))
          this.emitFile({
            type: 'chunk',
            id: path.join(root, descriptor.root, descriptor.source),
            name: `page-${moduleKey}-${pageKey}`,
            preserveSignature: 'strict',
          });
    },
    async generateBundle(_options, bundle) {
      assertPublicBundleIsolation(bundle);
      // Keep dependency notices beside the bundled browser code.
      const dependencyRoots = new Set(
        Object.values(bundle)
          .filter((item) => item.type === 'chunk')
          .flatMap((item) => Object.keys(item.modules))
          .map(
            (id) =>
              id
                .replaceAll('\\', '/')
                .replace(/^\0/, '')
                .match(/^(.*\/node_modules\/(?:@[^/]+\/)?[^/]+)/)?.[1],
          )
          .filter(Boolean),
      );
      const notices = [];
      const actualRoots = new Set();
      for (const candidate of dependencyRoots) {
        let directory = candidate;
        // Bundled libraries can report virtual nested modules; retain the real package notice.
        while (
          !(await fs
            .stat(path.join(directory, 'package.json'))
            .then((stat) => stat.isFile())
            .catch((error) => {
              if (error.code !== 'ENOENT') throw error;
              return false;
            }))
        ) {
          const parent = path.dirname(directory);
          if (parent === directory || !parent.replaceAll('\\', '/').includes('/node_modules')) {
            directory = null;
            break;
          }
          directory = parent;
        }
        if (directory) actualRoots.add(directory);
      }
      for (const directory of [...actualRoots].sort()) {
        const metadata = JSON.parse(await fs.readFile(path.join(directory, 'package.json'), 'utf8'));
        const names = (await fs.readdir(directory)).filter((name) =>
          /^(license|copying|notice)(\.|$)/i.test(name),
        );
        const body = await Promise.all(
          names.map(async (name) => `${name}\n${await fs.readFile(path.join(directory, name), 'utf8')}`),
        );
        notices.push(
          `${metadata.name}@${metadata.version} (${metadata.license ?? 'SEE LICENSE'})\n${body.join('\n')}`,
        );
      }
      // Copied primitives do not appear in node_modules; ship their full notices too.
      const usesPlatformUi = Object.values(bundle).some(
        (item) =>
          item.type === 'chunk' &&
          Object.keys(item.modules).some((id) => id.replaceAll('\\', '/').includes('/packages/preview-ui/')),
      );
      for (const [label, license] of usesPlatformUi
        ? [
            [
              'UI primitives — Elia Kuratli (MIT)',
              'packages/preview-ui/upstream/site-library/free-source/LICENSE',
            ],
            [
              'Sidebar integration',
              'packages/preview-ui/upstream/rental-admin/apps/admin/src/components/animate-sidebar/LICENSE.md',
            ],
            ['Table integration', 'packages/preview-ui/upstream/rental-admin/packages/ui-tablecn/LICENSE.md'],
            ['Animate UI homepage adaptations', 'packages/preview-ui/upstream/animate-home/LICENSE.md'],
            [
              'Table motion integration',
              'packages/preview-ui/upstream/rental-controls/packages/ui-motiq/LICENSE',
            ],
          ]
        : []) {
        notices.push(`${label}\n${await fs.readFile(path.join(root, license), 'utf8')}`);
      }
      this.emitFile({
        type: 'asset',
        fileName: 'assets/third-party-notices.txt',
        source: notices.join('\n\n---\n\n'),
      });
      const entries = [];
      for (const item of componentRegistry) {
        const source = await loadComponentRegistryItem(root, componentRegistry, item.name);
        this.emitFile({
          type: 'asset',
          fileName: `page-source/registry/${item.name}.json`,
          source: JSON.stringify(source),
        });
      }
      for (const [moduleKey, pages] of Object.entries(pageModules)) {
        const prototypeRevisions = await loadPrototypeRevisions({
          moduleCatalog,
          moduleKey,
          pageSourceRoot: root,
        });
        for (const [pageKey, descriptor] of Object.entries(pages)) {
          const suffix = `${descriptor.root}/${descriptor.source}`;
          const chunks = Object.values(bundle).filter(
            (item) =>
              item.type === 'chunk' &&
              item.facadeModuleId?.replaceAll('\\', '/').endsWith(suffix) &&
              item.exports.includes('default'),
          );
          if (chunks.length !== 1 || !chunks[0].fileName.startsWith('page-assets/'))
            throw new Error(`Page source escaped protected bundle: ${pageKey}`);
          const source = await fs.readFile(path.join(root, suffix), 'utf8');
          this.emitFile({ type: 'asset', fileName: `page-source/${moduleKey}/${pageKey}.tsx`, source });
          entries.push({
            moduleKey,
            pageKey,
            entry: chunks[0].fileName,
            source: `page-source/${moduleKey}/${pageKey}.tsx`,
            assets: protectedPageAssets(bundle, chunks[0].fileName),
            prototypeRevision: prototypeRevisions[pageKey],
          });
        }
      }
      this.emitFile({
        type: 'asset',
        fileName: 'page-manifest.json',
        source: JSON.stringify({ schemaVersion: 1, entries }, null, 2),
      });
    },
  };
}
