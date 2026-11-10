// @vitest-environment node
import { expect, test } from 'vitest';
import { applyRimoGraphCategories, rimoGraphTopics } from '../../scripts/rimo-graph-categories.mjs';

const node = (id, topic, requirementId) => ({
  id,
  primaryTopic: topic,
  topics: [topic],
  evidence: requirementId ? [{ requirementId }] : [],
});

test('keeps same-station and one-way entries separate while sharing the order catalog identity', () => {
  const nodes = [
    node('feature-new-order-one-way', 'time-share'),
    node('feature-new-order-same-station', 'time-share'),
    node('feature-time-share-orders', 'time-share'),
  ];
  applyRimoGraphCategories(nodes, []);
  expect(nodes[0].topics).toEqual(['one-way']);
  expect(nodes[1].topics).toEqual(['same-station']);
  expect(nodes[2].topics).toEqual(['same-station', 'one-way']);
  expect(nodes).toHaveLength(3);
});

test('groups voucher details in the specialty and exposes only shared order flows to same-station', () => {
  const nodes = [
    node('voucher-list-import', 'vouchers', 'source'),
    node('voucher-create-order', 'vouchers', 'source'),
  ];
  applyRimoGraphCategories(nodes, [
    { id: 'source', path: 'requirements/channel-tickets/合作渠道租车券（同站租还）.md' },
  ]);
  expect(nodes[0].topics).toEqual(['vouchers']);
  expect(nodes[1].topics).toEqual(['vouchers', 'same-station']);
});

test('retains shared management ownership and membership without multiplying nodes or inventing edges', () => {
  const nodes = [
    node('contract-vehicle-binding', 'contracts', 'source'),
    node('telemetry-upload', 'telematics'),
  ];
  applyRimoGraphCategories(nodes, [{ id: 'source', path: 'requirements/official-vehicles/example.md' }]);
  expect(nodes[0]).toMatchObject({ primaryTopic: 'contracts', topics: ['contracts', 'official'] });
  expect(nodes[1]).toMatchObject({ primaryTopic: 'fleet', topics: ['fleet'] });
  expect(rimoGraphTopics.filter((topic) => topic.category === 'business').map((topic) => topic.id)).toEqual([
    'same-station',
    'one-way',
    'store-rental',
    'official',
    'vouchers',
  ]);
  expect(nodes.every((item) => item.topics.includes(item.primaryTopic))).toBe(true);
});
