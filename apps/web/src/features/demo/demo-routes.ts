import type { CatalogPage } from '@/features/showcase/showcase-catalog';

export const isDemoRoute = (pathname: string) => /^\/demo(?:\/|$)/.test(pathname);
export const demoPageUrl = (page: Pick<CatalogPage, 'projectId' | 'clientId' | 'pageKey'>) =>
  `/demo/${page.projectId}/${page.clientId}/${page.pageKey}`;
export function demoPageRoute(pathname: string) {
  const match = /^\/demo\/([a-z0-9-]+)\/([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(pathname);
  return match ? { projectId: match[1], clientId: match[2], pageKey: match[3] } : null;
}
