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
  return catalogSections.find(
    (section) => section.path === path || (path === '/pages' && section.kind === 'page'),
  );
}

const clientTitlePrefix =
  /^(?:营运|營運|运营|運營|企业|企業|消费者|消費者|用户|用戶|客户|客戶)(?:端|后台|後台)\s*[·:：/|｜—-]?\s*/u;

export function catalogPageTitle(page: Pick<CatalogPage, 'title' | 'clientName'>) {
  const title = page.title.trim();
  const plain = title.replace(clientTitlePrefix, '');
  if (plain !== title) return plain || title;
  const prefix = `${page.clientName} · `;
  return title.startsWith(prefix) ? title.slice(prefix.length).trim() || title : title;
}

export function catalogPageQualifier(page: CatalogPage, pages: CatalogPage[]) {
  const title = catalogPageTitle(page);
  const matches = pages.filter(
    (item) => item.projectId === page.projectId && catalogPageTitle(item) === title,
  );
  if (matches.length < 2) return undefined;
  const prefix = clientTitlePrefix.exec(page.title.trim())?.[0];
  if (prefix) return prefix.replace(/(?:端|后台|後台).*$/u, '').trim();
  if (matches.some((item) => item.clientId !== page.clientId)) return page.clientName;
  if (matches.some((item) => item.category !== page.category)) return page.category;
  return page.pageKey;
}
