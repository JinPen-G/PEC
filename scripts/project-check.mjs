import { fileURLToPath } from 'node:url';
import { loadProjectCatalog } from '../packages/platform-server/src/project-catalog.js';
import { checkProjectRegistration } from '../packages/project-core/src/platform/project-registration.js';
import { validateComponentRegistry } from '../packages/project-core/src/platform/component-registry.js';
import { validateProjectRegistrations } from '../packages/project-core/src/platform/project-registration.js';
const root = fileURLToPath(new URL('..', import.meta.url));
const {
  projects: registeredProjects,
  moduleCatalog: NATIVE_MODULES,
  componentRegistry: COMPONENT_REGISTRY,
} = await loadProjectCatalog(fileURLToPath(new URL('../packages/platform-contracts/src/', import.meta.url)));
validateComponentRegistry(COMPONENT_REGISTRY);
validateProjectRegistrations(
  registeredProjects,
  NATIVE_MODULES.filter((module) => module.surface !== 'showcase'),
);
for (const module of NATIVE_MODULES.filter((item) => item.surface === 'showcase')) {
  const report = await checkProjectRegistration(
    root,
    { module, registry: COMPONENT_REGISTRY.filter((item) => item.moduleKey === module.key) },
    NATIVE_MODULES,
    COMPONENT_REGISTRY,
  );
  console.log(JSON.stringify(report));
}
