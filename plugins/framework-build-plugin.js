import path from 'node:path';

export const frameworkBusinessSource = (id) => {
  const normalized = id.replaceAll('\\', '/');
  if (/(?:^|\/)[^/]*\.local\./.test(normalized)) return true;
  if (/\/(?:project-modules|component-library\/src|project-content)\/example\//.test(normalized))
    return false;
  return /(?:^|\/)(?:project-modules\/|component-library\/src\/|features\/orders\/|project-content\/|features\/rest\/media\/[^/]+\.(?:mp3|jpe?g|png|webp)$)/.test(
    normalized,
  );
};

/** Public defaults retain the selected example and reject local project imports. */
export function frameworkBuildPlugin(root) {
  const replacements = new Map(
    [
      ['packages/platform-contracts/src/builtin-modules.json', 'templates/framework/builtin-modules.json'],
      ['apps/web/src/features/pages/page-registry.tsx', 'templates/framework/page-registry.tsx'],
      ['apps/web/src/features/rest/rest-track.ts', 'templates/framework/rest-track.ts'],
    ].map(([from, to]) => [path.join(root, from).replaceAll('\\', '/'), path.join(root, to)]),
  );
  return {
    name: 'preview-framework-boundary',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved) return null;
      const id = resolved.id.replaceAll('\\', '/');
      if (frameworkBusinessSource(id)) throw new Error(`Framework cannot import business source: ${id}`);
      return replacements.has(id) ? replacements.get(id) : null;
    },
  };
}
