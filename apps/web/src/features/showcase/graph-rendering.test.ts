import { expect, it } from 'vitest';
import type { GraphNode, GraphEdge } from '../../../../../packages/platform-contracts/src/requirement-graph';
import { graphRenderData } from './graph-rendering';

const nodes = [
  { id: 'before', label: '前置规则', summary: '<b>纯文本</b>' },
  { id: 'selected', label: '当前需求', summary: '当前的业务需求' },
  { id: 'after', label: '后续流程', summary: '流程说明' },
] as GraphNode[];
const edges = [
  {
    id: 'cause',
    source: 'before',
    target: 'selected',
    label: '通过校验',
    reason: '明确原文',
    relation: 'constrains',
  },
  {
    id: 'effect',
    source: 'selected',
    target: 'after',
    label: '触发流程',
    reason: '明确原文',
    relation: 'triggers',
  },
  {
    id: 'reference',
    source: 'before',
    target: 'after',
    label: '参考说明',
    reason: '仅引用',
    relation: 'references',
  },
  { id: 'missing', source: 'selected', target: 'unavailable', relation: 'triggers' },
] as GraphEdge[];

it('keeps colored graph identities independent of the viewport without decorative combos', () => {
  const drawing = graphRenderData(nodes, edges, (value) => value);
  expect(drawing.combos).toBeUndefined();
  expect(drawing.nodes).toHaveLength(3);
  expect(drawing.edges).toHaveLength(3);
  expect(drawing.nodes?.[0]).toMatchObject({
    id: 'node:before',
    style: { labelText: '前置规则' },
    data: { description: '<b>纯文本</b>' },
  });
});

it('preserves semantic direction and captions between colored nodes', () => {
  const drawing = graphRenderData(nodes, edges, (value) => `translated ${value}`);
  expect(drawing.edges?.[0]).toMatchObject({
    source: 'node:before',
    target: 'node:selected',
    style: { labelPlacement: 'center', labelText: 'translated 通过校验', endArrow: true },
  });
  expect(drawing.edges?.[1]).toMatchObject({
    style: { labelPlacement: 'center', labelText: 'translated 触发流程' },
  });
  expect(drawing.edges?.[2]).toMatchObject({ style: { lineDash: [5, 4] } });
  expect(edges[0].source).toBe('before');
});
