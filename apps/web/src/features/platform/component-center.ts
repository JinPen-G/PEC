/** The center and public sidebar share the project's registered category names.
 * Page/component identity comes from code registration, never from its label. */
import {
  NATIVE_MODULES,
  nativePageUrl,
  type NativeProject,
} from '../../../../../packages/platform-contracts/src/platform';
export type CenterKind = 'requirements' | 'components';
export interface CenterItem {
  id: string;
  clientId: string;
  pageKey: string;
  title: string;
  category: string;
  kind: CenterKind;
  visible: boolean;
  access: 'public' | 'restricted';
  href: string;
}
export function componentCenterItems(project: NativeProject): CenterItem[] {
  const registered = NATIVE_MODULES.find((module) => module.key === project.moduleKey)?.pages ?? [];
  return [...project.clients]
    .sort((a, b) => a.position - b.position)
    .flatMap((client) =>
      [...client.pages]
        .sort((a, b) => a.position - b.position)
        .map((page) => ({
          id: `${client.id}/${page.key}`,
          clientId: client.id,
          pageKey: page.key,
          title: page.label,
          category: page.group || client.name,
          kind:
            registered.find((descriptor) => descriptor.key === page.key)?.kind === 'component'
              ? 'components'
              : 'requirements',
          visible: client.enabled && page.visible,
          access: page.access ?? 'restricted',
          href: nativePageUrl(project, client.id, page.key),
        })),
    );
}
export function centerUrl(projectId: string, kind: CenterKind = 'requirements', category = '') {
  const params = new URLSearchParams({ kind });
  if (category) params.set('category', category);
  return `/center/${projectId}?${params}`;
}
export function centerCategories(items: CenterItem[]) {
  return [...new Set(items.map((item) => item.category))];
}
