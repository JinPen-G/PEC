export interface ComponentRegistryEntry {
  name: string;
  title: string;
  description: string;
  kind: 'component' | 'block';
  moduleKey: string;
  pageKey: string;
  dependencies: readonly string[];
  registryDependencies: readonly string[];
  files: readonly { path: string; target: string }[];
}
export const COMPONENT_REGISTRY: readonly ComponentRegistryEntry[];
export function componentRegistryFiles(name: string): string[];

export interface ComponentRegistryReference {
  name: string;
  kind: 'component' | 'block';
  url: string;
}
export interface ComponentRegistryItem {
  $schema: string;
  name: string;
  type: 'registry:component' | 'registry:block';
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: { path: string; target: string; type: 'registry:component' | 'registry:block'; content: string }[];
}
