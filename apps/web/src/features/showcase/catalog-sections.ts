import type { CatalogPage } from './showcase-catalog';

export const catalogSections = [
  { kind: 'component', title: '组件', path: '/components' },
  { kind: 'block', title: '区块', path: '/blocks' },
  { kind: 'page', title: 'Screens', path: '/screens' },
] as const;

export type CatalogKind = (typeof catalogSections)[number]['kind'];

export function catalogKind(page: Pick<CatalogPage, 'kind'>): CatalogKind {
  return page.kind ?? 'page';
}

export function sectionForPath(path: string) {
  return catalogSections.find((section) => section.path === path || (path === '/pages' && section.kind === 'page'));
}
