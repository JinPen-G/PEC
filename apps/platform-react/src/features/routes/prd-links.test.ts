import { describe, expect, it } from 'vitest';

import { mergePagePrdLinks, pagePrdLinkFor, updatePagePrdOverride } from './prd-links';

describe('page PRD link overrides', () => {
  const base = {
    operation: { dashboard: '業務/Dashboard.md', orders: '業務/訂單.md' },
  };

  it('keeps unrelated override records when a route association is changed', () => {
    const updated = updatePagePrdOverride(
      { operation: { dashboard: '業務/新版看板.md' }, enterprise: { employee: '企業/員工.md' } },
      'operation',
      'orders',
      '業務/訂單詳情.md',
    );

    expect(updated).toEqual({
      operation: { dashboard: '業務/新版看板.md', orders: '業務/訂單詳情.md' },
      enterprise: { employee: '企業/員工.md' },
    });
  });

  it('uses null as an explicit cancellation without mutating the base configuration', () => {
    const overrides = updatePagePrdOverride({}, 'operation', 'dashboard', null);
    const merged = mergePagePrdLinks(base, overrides);

    expect(overrides).toEqual({ operation: { dashboard: null } });
    expect(merged).toEqual({ operation: { orders: '業務/訂單.md' } });
    expect(pagePrdLinkFor(merged, 'operation', 'dashboard')).toBe('');
    expect(base.operation.dashboard).toBe('業務/Dashboard.md');
  });
});
