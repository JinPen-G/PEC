import registeredProjects from './registered-projects.json' with { type: 'json' };

export const COMPONENT_REGISTRY = Object.freeze(
  registeredProjects.flatMap((project) => project.registry ?? []),
);

export function componentRegistryFiles(name) {
  const files = new Set(),
    seen = new Set();
  const visit = (key) => {
    if (seen.has(key)) return;
    seen.add(key);
    const item = COMPONENT_REGISTRY.find((entry) => entry.name === key);
    if (!item) throw new Error('组件依赖未登记');
    for (const file of item.files) files.add(file.path);
    for (const child of item.registryDependencies) visit(child);
  };
  visit(name);
  return [...files].sort();
}
