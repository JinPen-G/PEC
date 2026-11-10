import { describe, expect, it } from 'vitest';
import type {
  GraphEdge,
  GraphNode,
  GraphRelation,
} from '../../../../../packages/platform-contracts/src/requirement-graph';
import { graphReadingRelations, graphReadingScope, graphSourceAnchor } from './graph-reading';

const node = (id: string, topics = ['fleet']) => ({ id, topics }) as GraphNode;
const edge = (id: string, source: string, target: string, relation: GraphRelation = 'constrains') =>
  ({ id, source, target, relation, status: 'active' }) as GraphEdge;

describe('business graph reading scope', () => {
  it('shows all direct cross-topic neighbors, not every connected node or unrelated edge', () => {
    const nodes = [
      node('vehicle'),
      node('qualification', ['members']),
      node('order', ['rental']),
      node('refund', ['finance']),
    ];
    const edges = [
      edge('allow', 'qualification', 'vehicle'),
      edge('data', 'vehicle', 'order'),
      edge('settlement', 'order', 'refund'),
      edge('extra', 'qualification', 'order'),
    ];
    const visible = graphReadingScope(nodes, edges, 'vehicle', 'fleet');
    expect(visible.nodes.map((item) => item.id)).toEqual(['vehicle', 'qualification', 'order']);
    expect(visible.edges.map((item) => item.id)).toEqual(['allow', 'data']);
  });

  it('keeps multi-topic membership and isolated requirements without inventing edges', () => {
    const nodes = [node('shared', ['fleet', 'rental']), node('isolated', ['rental']), node('other')];
    const visible = graphReadingScope(nodes, [], null, 'rental');
    expect(visible.nodes.map((item) => item.id)).toEqual(['shared', 'isolated']);
    expect(visible.edges).toEqual([]);
  });

  it('does not call dependencies consequences or treat references as causal links', () => {
    const dependency = edge('dependency', 'order', 'quota', 'depends_on');
    const result = graphReadingRelations('order', [
      dependency,
      edge('result', 'order', 'snapshot', 'provides_data'),
      edge('reference', 'order', 'guide', 'references'),
      edge('integration', 'order', 'external', 'integrates_with'),
    ]);
    expect(result.causes.map((item) => item.id)).toEqual(['dependency']);
    expect(result.effects.map((item) => item.id)).toEqual(['result']);
    expect(result.related.map((item) => item.id)).toEqual(['reference', 'integration']);
    expect(graphReadingRelations('quota', [dependency]).effects).toEqual([dependency]);
  });

  it('excludes deprecated relationships from current reading', () => {
    const old = { ...edge('old', 'order', 'payment'), status: 'deprecated' as const };
    expect(graphReadingRelations('order', [old])).toEqual({
      causes: [],
      effects: [],
      related: [],
      management: [],
    });
    expect(
      graphReadingScope([node('order'), node('payment')], [old], 'order', null).nodes.map((item) => item.id),
    ).toEqual(['order']);
  });
  it('separates management feature links from the business causes and effects', () => {
    const management = { ...node('page'), type: 'feature' as const };
    const relation = edge('ui', 'rule', 'page');
    const result = graphReadingRelations('rule', [relation, edge('business', 'rule', 'order')], [management]);
    expect(result.management).toEqual([relation]);
    expect(result.effects.map((item) => item.id)).toEqual(['business']);
  });
  it('opens the source section using rendered heading IDs, including repeated headings', () => {
    const markdown = '# PRD\n## 3.4 状态规则\n首次取车。\n## 3.4 状态规则\n再次取车。';
    expect(graphSourceAnchor(markdown, '再次取车。')).toBe('3-4-状态规则-2');
    expect(graphSourceAnchor(markdown.replaceAll('\n', '\r\n'), '再次取车。')).toBe('3-4-状态规则-2');
    expect(graphSourceAnchor(markdown, '不存在')).toBe('');
  });
});
