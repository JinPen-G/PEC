import { describe, expect, it } from 'vitest';
import { selectLandingPages, type LandingPage } from './landing-pages';

const page = (pageKey: string, featuredOrder?: number): LandingPage => ({
  projectId: 'sample',
  clientId: 'web',
  pageKey,
  title: pageKey,
  category: 'Products',
  access: 'public',
  allowed: true,
  featuredOrder,
});

describe('curated home gallery', () => {
  it('shows only six explicit selections in editorial order, not catalog order', () => {
    const pages = Array.from({ length: 71 }, (_, index) => page(`page-${index}`));
    for (let index = 0; index < 6; index++) pages[70 - index].featuredOrder = index + 1;
    const before = structuredClone(pages);
    expect(selectLandingPages(pages, 'sample').map((item) => item.pageKey)).toEqual([
      'page-70',
      'page-69',
      'page-68',
      'page-67',
      'page-66',
      'page-65',
    ]);
    expect(pages).toEqual(before);
  });

  it('does not replace hidden, restricted or revoked selections with arbitrary pages', () => {
    expect(
      selectLandingPages(
        [
          page('selected', 1),
          { ...page('private', 2), access: 'restricted' },
          { ...page('revoked', 3), allowed: false },
          page('unselected'),
        ],
        'sample',
      ).map((item) => item.pageKey),
    ).toEqual(['selected']);
    expect(selectLandingPages([page('unselected')], 'sample')).toEqual([]);
  });

  it('keeps projects separate and never duplicates a client/page entry', () => {
    const selected = page('selected', 1);
    expect(
      selectLandingPages([selected, selected, { ...page('other', 1), projectId: 'other' }], 'sample'),
    ).toEqual([selected]);
    expect(selectLandingPages([selected], 'other')).toEqual([]);
  });

  it('bounds malformed catalog entries even when bypassing registration validation', () => {
    expect(
      selectLandingPages(
        [page('zero', 0), page('late', 7), page('fraction', 1.5), page('valid', 1)],
        'sample',
      ),
    ).toEqual([page('valid', 1)]);
    expect(
      selectLandingPages(
        Array.from({ length: 9 }, (_, index) => page(`duplicate-order-${index}`, 1)),
        'sample',
      ),
    ).toHaveLength(6);
  });
});
