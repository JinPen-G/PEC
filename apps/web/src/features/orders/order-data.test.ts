import { expect, test } from 'vitest';
import { createDemoOrders, queryDemoOrders } from './order-data';
test('synthetic orders retain stable identities across reloads and meaningful filters', () => {
  const rows = createDemoOrders();
  expect(rows).toEqual(createDemoOrders());
  expect(rows.length).toBeGreaterThan(50);
  expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
  expect(queryDemoOrders(rows, { status: 'completed' }).every((row) => row.status === 'completed')).toBe(
    true,
  );
  expect(queryDemoOrders(rows, { keyword: rows[0].orderNo })).toHaveLength(1);
  expect(queryDemoOrders(rows, { from: '2027-01-01' })).toHaveLength(0);
});
