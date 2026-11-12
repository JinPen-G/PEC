// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { focusRimoGraph, rimoGraphFocus } from '../../scripts/rimo-graph-focus.mjs';
import { sharingFlowEdges } from '../../scripts/rimo-graph-sharing.mjs';
import { rentalFlowEdges } from '../../scripts/rimo-graph-rental.mjs';
import { voucherFlowEdges } from '../../scripts/rimo-graph-vouchers.mjs';
import { lifecycleFlowEdges } from '../../scripts/rimo-graph-lifecycle.mjs';
import { rimoFlowEdges } from '../../scripts/rimo-graph-flows.mjs';
import { MultiDirectedGraph } from 'graphology';
import { bidirectional } from 'graphology-shortest-path/unweighted.js';

const proof = (quote) => ({ requirementId: 'reservation', anchor: 'rules', quote, revision: 'a'.repeat(64) });
const node = (id, quote) => ({
  id,
  label: id,
  summary: quote,
  type: 'rule',
  aliases: [],
  topics: ['rental'],
  primaryTopic: 'rental',
  status: 'active',
  requirements: ['reservation'],
  evidence: [proof(quote)],
  coverage: 'none',
  prototypes: [],
  keyPoints: [{ kind: 'rule', text: quote, evidence: [0] }],
});
const edge = (id, source, target, relation, quote) => ({
  id,
  source,
  target,
  relation,
  label: quote,
  reason: quote,
  basis: 'explicit',
  status: 'active',
  evidence: [proof(quote)],
});
const group = {
  id: 'reservation',
  label: '预约确认',
  type: 'process',
  summary: '确认预约并保留生效条件。',
  members: ['reservation', 'authorized'],
  points: ['authorized'],
};
const fixture = () => ({
  nodes: [
    node('reservation', '建立预约'),
    node('authorized', '预授权成功'),
    node('pickup', '确认取车'),
    node('planning', '规划说明'),
  ],
  edges: [
    edge('internal', 'reservation', 'authorized', 'triggers', '预约后发起预授权'),
    edge('outside', 'authorized', 'pickup', 'precedes', '预授权成功才能取车'),
    edge('duplicate', 'reservation', 'pickup', 'precedes', '确认预约后取车'),
    edge('reference', 'planning', 'reservation', 'references', '规划引用预约流程'),
  ],
  review: { graphRevision: 'old-review', note: '保留未核对范围' },
});

describe('business graph focus', () => {
  it('keeps permission revocation and released occupancy from creating a new fulfillment route', () => {
    const authored = [...sharingFlowEdges, ...rentalFlowEdges, ...voucherFlowEdges, ...lifecycleFlowEdges, ...rimoFlowEdges];
    const identifiers = new Set([
      ...rimoGraphFocus.flatMap((definition) => definition.members),
      ...authored.flatMap(([source, target]) => [source, target]),
    ]);
    const focused = focusRimoGraph({
      nodes: [...identifiers].map((id) => node(id, '业务依据')),
      edges: authored.map(([source, target, relation, label], index) => edge(`edge-${index}`, source, target, relation, label)),
      review: {},
    });
    const routes = new MultiDirectedGraph();
    for (const item of focused.graph.nodes) routes.addNode(item.id);
    for (const link of focused.graph.edges)
      if (['triggers', 'precedes'].includes(link.relation)) routes.addDirectedEdge(link.source, link.target);
    for (const [source, target] of [
      ['store-completed', 'store-renting'],
      ['store-terminal-release', 'store-inspecting'],
      ['official-order-completed', 'official-pickup'],
      ['official-order-cancelled', 'official-pickup'],
      ['sharing-completed', 'sharing-pickup'],
      ['sharing-cancelled', 'sharing-pickup'],
    ]) expect(bidirectional(routes, focused.mapping[source], focused.mapping[target]), `${source} → ${target}`).toBeNull();
    expect(focused.mapping['store-app-control']).not.toBe(focused.mapping['store-self-unlock']);
    expect(focused.mapping['official-order-reserved']).not.toBe(focused.mapping['official-schedule-active']);
    expect(focused.mapping['store-inventory-window']).not.toBe(focused.mapping['feature-new-order']);
    expect(routes.hasDirectedEdge('store-terminal-release', 'store-post-charge')).toBe(true);
  });

  it('keeps voucher and monthly billing routes separate from customer preauthorization after grouping', () => {
    const authored = [...sharingFlowEdges, ...rentalFlowEdges, ...voucherFlowEdges, ...lifecycleFlowEdges];
    const identifiers = new Set([
      ...rimoGraphFocus.flatMap((group) => group.members),
      ...authored.flatMap(([source, target]) => [source, target]),
    ]);
    const input = {
      nodes: [...identifiers].map((id) => node(id, '业务依据')),
      edges: authored.map(([source, target, relation, label], index) =>
        edge(`edge-${index}`, source, target, relation, label),
      ),
      review: {},
    };
    const focused = focusRimoGraph(input);
    const routes = new MultiDirectedGraph();
    for (const item of focused.graph.nodes) routes.addNode(item.id);
    for (const link of focused.graph.edges)
      if (['triggers', 'precedes', 'provides_data'].includes(link.relation))
        routes.addDirectedEdge(link.source, link.target);
    const fulfillment = ['sharing-pickup', 'sharing-return', 'sharing-final-cost'];
    const voucher = ['voucher-create-order', ...fulfillment, 'voucher-enterprise-settlement', 'sharing-completed'];
    const monthly = [
      'sharing-monthly-qualification',
      'sharing-reserved',
      ...fulfillment,
      'sharing-monthly-posting',
      'sharing-completed',
    ];
    for (const path of [voucher, monthly]) {
      for (let index = 1; index < path.length; index++)
        expect(routes.hasDirectedEdge(path[index - 1], path[index]), path.join(' → ')).toBe(true);
      expect(path).not.toContain('sharing-preauthorization');
      expect(path).not.toContain('sharing-preauthorization-charge');
    }
    expect(focused.mapping['voucher-user-zero-payment']).not.toBe(
      focused.mapping['sharing-preauthorization-charge'],
    );
    expect(focused.mapping['sharing-monthly-posting']).not.toBe(
      focused.mapping['sharing-preauthorization-charge'],
    );
    expect(focused.mapping['store-reserved']).not.toBe(focused.mapping['store-preauthorization']);
    expect(focused.mapping['sharing-monthly-posting']).not.toBe(
      focused.mapping['sharing-monthly-qualification'],
    );
    expect(focused.mapping['store-pickup-overdue']).not.toBe(focused.mapping['store-terminal-release']);
    expect(focused.mapping['sharing-renewing']).not.toBe(focused.mapping['sharing-post-charge']);
    expect(focused.mapping['official-order-cancelled']).not.toBe(focused.mapping['official-schedule-active']);
  });

  it('keeps internal rule evidence and rebases point references without mutating the input', () => {
    const source = fixture();
    const previous = structuredClone(source);
    const result = focusRimoGraph(source, [group]);
    expect(result.graph.nodes).toHaveLength(3);
    const merged = result.graph.nodes.find((node) => node.id === 'reservation');
    expect(merged.keyPoints[0].evidence.map((index) => merged.evidence[index].quote)).toEqual(['预授权成功']);
    expect(merged.evidence.map((item) => item.quote)).toContain('预约后发起预授权');
    expect(result.mapping.authorized).toBe('reservation');
    expect(result.internalEdges).toEqual(['internal']);
    expect(result.graph.review).toEqual(previous.review);
    expect(source).toEqual(previous);
  });

  it('deduplicates only matching directed relation types and retains every original proof', () => {
    const source = fixture();
    source.edges.push(edge('opposite', 'pickup', 'authorized', 'depends_on', '取车依赖有效预授权'));
    const { graph } = focusRimoGraph(source, [group]);
    const forward = graph.edges.find((edge) => edge.source === 'reservation' && edge.target === 'pickup');
    expect(forward.relation).toBe('precedes');
    expect(forward.evidence.map((item) => item.quote)).toEqual(['预授权成功才能取车', '确认预约后取车']);
    expect(
      graph.edges.some(
        (edge) => edge.source === 'pickup' && edge.target === 'reservation' && edge.relation === 'depends_on',
      ),
    ).toBe(true);
    expect(graph.edges.find((edge) => edge.source === 'planning').relation).toBe('references');
    expect(graph.edges.every((edge) => edge.source !== edge.target && edge.basis === 'explicit')).toBe(true);
  });

  it('preserves prototype identities, draft sources and standalone nodes', () => {
    const source = fixture();
    source.nodes[1].requirements.push('draft-rules');
    source.nodes[1].prototypes.push({
      clientId: 'operation',
      pageKey: 'orders',
      anchor: 'confirm',
      target: '确认订单',
      revision: 'b'.repeat(64),
    });
    const { graph } = focusRimoGraph(source, [group]);
    expect(graph.nodes[0]).toMatchObject({
      coverage: 'partial',
      requirements: ['reservation', 'draft-rules'],
      prototypes: source.nodes[1].prototypes,
    });
    expect(graph.nodes.find((node) => node.id === 'planning')).toEqual(source.nodes[3]);
  });

  it('rejects unknown or overlapping groups instead of silently dropping a business rule', () => {
    expect(() => focusRimoGraph(fixture(), [{ ...group, members: ['missing'] }])).toThrow(
      'Invalid focus membership',
    );
    expect(() => focusRimoGraph(fixture(), [group, group])).toThrow('Invalid focus membership');
    expect(() => focusRimoGraph(fixture(), [{ ...group, points: ['pickup'] }])).toThrow(
      'Point outside focus group',
    );
  });
});
