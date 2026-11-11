// @vitest-environment node
import { expect, test } from 'vitest';
import { MultiDirectedGraph } from 'graphology';
import { bidirectional } from 'graphology-shortest-path/unweighted.js';
import { sharingFlowNodes, sharingFlowEdges } from '../../scripts/rimo-graph-sharing.mjs';
import { lifecycleFlowNodes, lifecycleFlowEdges } from '../../scripts/rimo-graph-lifecycle.mjs';
import { rimoFlowEdges } from '../../scripts/rimo-graph-flows.mjs';
import { rentalFlowEdges } from '../../scripts/rimo-graph-rental.mjs';
import { voucherFlowEdges } from '../../scripts/rimo-graph-vouchers.mjs';
import { rimoGraphQuote } from '../../scripts/rimo-graph-evidence.mjs';

const relations = [
  ...sharingFlowEdges,
  ...lifecycleFlowEdges,
  ...rimoFlowEdges,
  ...rentalFlowEdges,
  ...voucherFlowEdges,
];
function businessRoute(origin, target, relationTypes = ['precedes', 'triggers']) {
  const graph = new MultiDirectedGraph();
  for (const [source, destination, relation] of relations) {
    if (
      !relationTypes.includes(relation) ||
      source.startsWith('feature-') ||
      destination.startsWith('feature-')
    )
      continue;
    graph.mergeNode(source);
    graph.mergeNode(destination);
    graph.addDirectedEdge(source, destination);
  }
  return bidirectional(graph, origin, target);
}

test('both time-share lines reach completed fulfillment through business nodes, not pages', () => {
  for (const origin of ['sharing-same-station', 'sharing-one-way']) {
    const route = businessRoute(origin, 'sharing-completed');
    expect(route).toContain('sharing-reserved');
    expect(route).toContain('sharing-pickup');
    expect(route).toContain('sharing-return');
    expect(route).toContain('sharing-final-cost');
    expect(route.every((identifier) => !identifier.startsWith('feature-'))).toBe(true);
  }
  expect(businessRoute('sharing-monthly-qualification', 'sharing-monthly-posting')).toContain(
    'sharing-final-cost',
  );
  expect(businessRoute('sharing-preauthorization', 'sharing-preauthorization-charge')).toContain(
    'sharing-return',
  );
});

test('voucher fulfillment joins time-share use without a direct personal-payment requirement', () => {
  expect(businessRoute('voucher-create-order', 'sharing-completed')).not.toContain(
    'sharing-preauthorization',
  );
  expect(
    businessRoute('sharing-return', 'voucher-enterprise-settlement', [
      'precedes',
      'triggers',
      'provides_data',
    ]),
  ).toContain('sharing-final-cost');
  expect(
    relations.filter(
      ([source, target]) => source === 'voucher-create-order' && target === 'sharing-preauthorization',
    ),
  ).toEqual([]);
});

test('official approval, use, return and conditional timeout form distinct routes', () => {
  expect(businessRoute('official-order-pending', 'official-order-completed')).toEqual([
    'official-order-pending',
    'official-review-approved',
    'official-order-reserved',
    'official-pickup',
    'official-order-in-use',
    'official-return',
    'official-order-completed',
  ]);
  expect(businessRoute('official-approval-timeout', 'official-order-cancelled')).toEqual([
    'official-approval-timeout',
    'official-order-cancelled',
  ]);
  const pendingEdges = relations.filter(
    ([source, target]) => source === 'official-order-pending' && target === 'official-schedule-active',
  );
  expect(pendingEdges).toEqual([]);
  expect(lifecycleFlowNodes.find((node) => node.id === 'official-approval-timeout').summary).toContain(
    '仅启用限时审批',
  );
});

test('return-location changes and extensions resolve later reservations before confirmation', () => {
  expect(businessRoute('store-return-transfer', 'store-return-transfer-applied')).toContain(
    'store-followup-reassignment',
  );
  expect(businessRoute('extension-conflict', 'store-extension-confirm')).toContain(
    'store-followup-reassignment',
  );
  expect(
    businessRoute('store-return-transfer-applied', 'store-return-snapshot', [
      'precedes',
      'triggers',
      'provides_data',
    ]),
  ).toContain('store-return-transfer-fee');
});

test('shared steps retain unique identities and early-return and planning boundaries stay narrow', () => {
  expect(new Set(sharingFlowNodes.map((node) => node.id)).size).toBe(sharingFlowNodes.length);
  expect(sharingFlowNodes.find((node) => node.id === 'sharing-final-cost').topics).toEqual([
    'same-station',
    'one-way',
  ]);
  expect(sharingFlowNodes.find((node) => node.id === 'sharing-early-return-points').topics).toEqual([
    'same-station',
  ]);
  expect(
    relations
      .filter(([source]) => source === 'store-design-outline')
      .every((relation) => relation[2] === 'references'),
  ).toBe(true);
});

test('multiline evidence preserves source newlines without accepting paraphrases or spacing changes', () => {
  expect(rimoGraphQuote('# Flow\r\n1. Confirm\r\n2. Reserve\r\n', '1. Confirm\n2. Reserve')).toEqual({
    position: 8,
    quote: '1. Confirm\r\n2. Reserve',
  });
  expect(rimoGraphQuote('# Flow\n1. Confirm\n2. Reserve\n', '1. Confirm\r\n2. Reserve').quote).toBe(
    '1. Confirm\n2. Reserve',
  );
  expect(() => rimoGraphQuote('Confirmed reservation', 'Confirm reservation')).toThrow();
  expect(() => rimoGraphQuote('1.  Confirm', '1. Confirm')).toThrow();
  expect(() => rimoGraphQuote('anything', '')).toThrow();
});
