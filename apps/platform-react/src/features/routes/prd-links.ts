import type { PagePrdLinks } from '../../../../../packages/platform-contracts/src/index.js';

export function clonePagePrdLinks(source: PagePrdLinks = {}): PagePrdLinks {
  return Object.fromEntries(Object.entries(source).map(([clientId, pages]) => [clientId, { ...pages }]));
}

/**
 * 項目清單內的關聯是隻讀基礎層，.platform/page-prd-links.json 是可編輯覆蓋層。
 * null 代表顯式取消基礎層中的關聯，不能在保存前刪除該鍵。
 */
export function mergePagePrdLinks(base: PagePrdLinks = {}, overrides: PagePrdLinks = {}): PagePrdLinks {
  const next = clonePagePrdLinks(base);
  for (const [clientId, pages] of Object.entries(overrides)) {
    next[clientId] ||= {};
    for (const [pageName, path] of Object.entries(pages)) {
      if (path === null || path === '') delete next[clientId][pageName];
      else next[clientId][pageName] = path;
    }
  }
  return next;
}

export function updatePagePrdOverride(
  overrides: PagePrdLinks = {},
  clientId: string,
  pageName: string,
  documentPath: string | null,
): PagePrdLinks {
  const next = clonePagePrdLinks(overrides);
  next[clientId] ||= {};
  next[clientId][pageName] = documentPath || null;
  return next;
}

export function pagePrdLinkFor(links: PagePrdLinks, clientId: string, pageName: string) {
  return links?.[clientId]?.[pageName] || '';
}
