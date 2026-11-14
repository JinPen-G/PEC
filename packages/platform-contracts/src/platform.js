/** Native platform protocol; browser inputs cannot grant roles or execute source. */
export const NATIVE_API_PREFIX = '/api/native';
export function nativePublicAssetAllowed(relative) {
  return relative === 'index.html' || /^(assets|brand)\//.test(relative);
}
import { componentRegistryFiles } from './component-registry.js';
import registeredProjects from './registered-projects.json' with { type: 'json' };
import builtinModules from './builtin-modules.json' with { type: 'json' };
export const NATIVE_MODULES = Object.freeze([
  ...builtinModules,
  ...registeredProjects.map(({ module }) => ({
    ...module,
    surface: 'showcase',
    pages: module.pages.map((page) => ({
      ...page,
      sourceFiles: page.registryItem ? componentRegistryFiles(page.registryItem) : page.sourceFiles,
    })),
  })),
]);
export const NATIVE_ROLES = Object.freeze(['admin', 'member']);
export const PROJECT_ROLES = Object.freeze(['editor', 'viewer']);
export const NATIVE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,63}$/;
export function nativePageAllowed(moduleKey, pageKey) {
  return NATIVE_MODULES.some(
    (module) => module.key === moduleKey && module.pages.some((page) => page.key === pageKey),
  );
}
export function nativePageUrl(project, clientId, pageKey) {
  const prefix =
    NATIVE_MODULES.find((module) => module.key === project.moduleKey)?.surface === 'showcase'
      ? '/pages'
      : '/p';
  return `${prefix}/${project.id}/${clientId}/${pageKey}`;
}
