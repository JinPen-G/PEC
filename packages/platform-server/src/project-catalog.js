/** Read explicitly named project catalogs without making local data a framework dependency. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import registeredProjects from '../../platform-contracts/src/registered-projects.json' with { type: 'json' };
import builtinModules from '../../platform-contracts/src/builtin-modules.json' with { type: 'json' };
import { validateProjectRegistrations } from '../../project-core/src/platform/project-registration.js';
import { componentRegistryClosure } from '../../project-core/src/platform/component-registry.js';
import { resolveExistingPathInsideRoot } from '../../project-core/src/filesystem.js';

export async function loadProjectCatalog(directory, { local = true } = {}) {
  async function read(name, fallback) {
    if (!local) return fallback;
    const filename = path.join(directory, name);
    const stat = await fs.lstat(filename).catch((error) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (!stat) return fallback;
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('项目登记必须为普通JSON文件');
    const resolved = await resolveExistingPathInsideRoot(directory, name, { allowedExtensions: ['.json'] });
    if (!resolved) throw new Error('项目登记路径不可用');
    return JSON.parse(await fs.readFile(resolved, 'utf8'));
  }
  const projects = await read('registered-projects.local.json', registeredProjects);
  const builtins = await read('builtin-modules.local.json', builtinModules);
  validateProjectRegistrations(projects, builtins);
  const componentRegistry = projects.flatMap((project) => project.registry ?? []);
  const moduleCatalog = [
    ...builtins,
    ...projects.map(({ module }) => ({
      ...module,
      surface: 'showcase',
      pages: module.pages.map((page) => ({
        ...page,
        sourceFiles: page.registryItem
          ? [
              ...new Set(
                componentRegistryClosure(componentRegistry, page.registryItem).flatMap((item) =>
                  item.files.map((file) => file.path),
                ),
              ),
            ].sort()
          : page.sourceFiles,
      })),
    })),
  ];
  return { projects, builtins, moduleCatalog, componentRegistry };
}
