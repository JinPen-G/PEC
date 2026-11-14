/** Local project and media adapters stay outside the tracked framework source. */
import { lstatSync } from 'node:fs';
import path from 'node:path';

const optionalSources = [
  [
    'packages/platform-contracts/src/registered-projects.json',
    'packages/platform-contracts/src/registered-projects.local.json',
  ],
  [
    'packages/platform-contracts/src/builtin-modules.json',
    'packages/platform-contracts/src/builtin-modules.local.json',
  ],
  ['apps/web/src/features/pages/page-registry.tsx', 'apps/web/src/features/pages/page-registry.local.tsx'],
  ['apps/web/src/features/rest/rest-track.ts', 'apps/web/src/features/rest/rest-track.local.ts'],
];

export function localProjectSources(root) {
  const replacements = new Map();
  for (const [source, local] of optionalSources) {
    const target = path.resolve(root, local);
    let stat;
    try {
      stat = lstatSync(target);
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('本地项目适配文件必须为普通文件');
    replacements.set(path.resolve(root, source).replaceAll('\\', '/'), target);
  }
  return replacements;
}

export function projectSourcePlugin(root) {
  const replacements = localProjectSources(root);
  return {
    name: 'preview-local-project-sources',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      return resolved ? (replacements.get(resolved.id.replaceAll('\\', '/')) ?? null) : null;
    },
  };
}

export function projectRuntimePlugin(root) {
  const replacements = localProjectSources(root);
  return {
    name: 'preview-local-project-runtime',
    setup(builder) {
      builder.onResolve({ filter: /(?:registered-projects|builtin-modules)\.json$/ }, (args) => {
        const filename = path.resolve(args.resolveDir, args.path).replaceAll('\\', '/');
        const replacement = replacements.get(filename);
        return replacement ? { path: replacement } : undefined;
      });
    },
  };
}
