/** Derive build/server sources from the same registered page catalog used by
 * administration. Directory scans and arbitrary runtime source are disallowed. */
import { NATIVE_MODULES } from './platform.js';
export const showcaseModules = (modules) =>
  Object.freeze(
    Object.fromEntries(
      modules
        .filter((module) => module.surface === 'showcase')
        .map((module) => [
          module.key,
          Object.fromEntries(
            module.pages.map((page) => [
              page.key,
              {
                root: `apps/web/src/project-modules/${module.projectId || module.key}/${page.key}`,
                source: page.source,
                registryItem: page.registryItem,
              },
            ]),
          ),
        ]),
    ),
  );
export const SHOWCASE_MODULES = showcaseModules(NATIVE_MODULES);
