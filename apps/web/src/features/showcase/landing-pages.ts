export interface LandingPage {
  projectId: string;
  clientId: string;
  pageKey: string;
  title: string;
  category: string;
  access: string;
  allowed?: boolean;
  featuredOrder?: number;
}

export function selectLandingPages(pages: LandingPage[], projectId: string) {
  const featured = pages.filter(
    (page) =>
      page.projectId === projectId &&
      page.access === 'public' &&
      page.allowed !== false &&
      Number.isInteger(page.featuredOrder) &&
      page.featuredOrder! >= 1 &&
      page.featuredOrder! <= 6,
  );
  const unique = new Map(featured.map((page) => [`${page.clientId}/${page.pageKey}`, page]));
  return [...unique.values()]
    .sort((first, second) => first.featuredOrder! - second.featuredOrder!)
    .slice(0, 6);
}
