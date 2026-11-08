/** Registered page chunks are emitted outside public assets. Their source is
 * exported explicitly, and runtime files remain behind server authorization. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { SHOWCASE_MODULES } from '../packages/platform-contracts/src/showcase.js';
import { NATIVE_MODULES } from '../packages/platform-contracts/src/platform.js';
import { loadPrototypeRevisions } from '../packages/project-core/src/platform/project-content.js';
export function assertPublicBundleIsolation(bundle) {
  for (const item of Object.values(bundle)) {
    if (item.type !== 'chunk' || item.fileName.startsWith('page-assets/')) continue;
    if ([...item.imports, ...(item.dynamicImports ?? [])].some((file) => file.startsWith('page-assets/')))
      throw new Error(`Public bundle depends on protected page: ${item.fileName}`);
    if (
      Object.keys(item.modules ?? {}).some((id) => id.replaceAll('\\', '/').includes('/src/project-modules/'))
    )
      throw new Error(`Project source escaped protected bundle: ${item.fileName}`);
  }
}
export function showcaseBuildPlugin(root) {
  let building = false;
  return {
    name: 'preview-showcase-build',
    configResolved(config) {
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
        if (!match) {
          next();
          return;
        }
        try {
          const check = await fetch(
            `http://127.0.0.1:5190/api/native/showcase/module-permission?moduleKey=${encodeURIComponent(match[1])}&pageKey=${encodeURIComponent(match[2])}`,
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
      for (const [moduleKey, pages] of Object.entries(SHOWCASE_MODULES))
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
      this.emitFile({
        type: 'asset',
        fileName: 'assets/third-party-notices.txt',
        source: notices.join('\n\n---\n\n'),
      });
      const entries = [];
      for (const [moduleKey, pages] of Object.entries(SHOWCASE_MODULES)) {
        const prototypeRevisions = await loadPrototypeRevisions({
          moduleCatalog: NATIVE_MODULES,
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
          const runtimeAssets = new Set();
          const visit = (fileName) => {
            if (runtimeAssets.has(fileName) || !fileName.startsWith('page-assets/')) return;
            runtimeAssets.add(fileName);
            const chunk = bundle[fileName];
            if (chunk?.type === 'chunk') {
              for (const dependency of chunk.imports) visit(dependency);
              for (const css of chunk.viteMetadata?.importedCss ?? []) {
                if (!css.startsWith('page-assets/'))
                  throw new Error('Page CSS escaped authorization boundary');
                runtimeAssets.add(css);
              }
            }
          };
          visit(chunks[0].fileName);
          entries.push({
            moduleKey,
            pageKey,
            entry: chunks[0].fileName,
            source: `page-source/${moduleKey}/${pageKey}.tsx`,
            assets: [...runtimeAssets],
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
