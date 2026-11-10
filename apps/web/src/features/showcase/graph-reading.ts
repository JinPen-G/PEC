import type { GraphEdge, GraphNode } from '../../../../../packages/platform-contracts/src/requirement-graph';
import { GRAPH_RELATIONS } from '../../../../../packages/platform-contracts/src/requirement-graph.js';

export function graphReadingRelations(selected: string, edges: GraphEdge[], nodes: GraphNode[] = []) {
  const causes: GraphEdge[] = [];
  const effects: GraphEdge[] = [];
  const related: GraphEdge[] = [];
  const management: GraphEdge[] = [];
  const features = new Set(nodes.filter((node) => node.type === 'feature').map((node) => node.id));
  for (const edge of edges) {
    if (edge.status !== 'active' || (edge.source !== selected && edge.target !== selected)) continue;
    const direction = GRAPH_RELATIONS[edge.relation].propagation;
    const other = edge.source === selected ? edge.target : edge.source;
    if (features.has(other)) management.push(edge);
    else if (direction === 'none' || direction === 'both') related.push(edge);
    else if (
      (direction === 'forward' && edge.target === selected) ||
      (direction === 'reverse' && edge.source === selected)
    )
      causes.push(edge);
    else effects.push(edge);
  }
  return { causes, effects, related, management };
}

export function graphSourceAnchor(markdown: string, quote: string) {
  const position = markdown.indexOf(quote);
  if (position < 0 || !quote) return '';
  const counts = new Map<string, number>();
  let anchor = '';
  let fenced = false;
  for (const line of markdown.slice(0, position).split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const heading = /^#{1,6}\s+(.+)$/.exec(line);
    if (!heading) continue;
    const base =
      heading[1]
        .replace(/[`*_~]/g, '')
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '') || 'section';
    const count = (counts.get(base) ?? 0) + 1;
    counts.set(base, count);
    anchor = count === 1 ? base : `${base}-${count}`;
  }
  return anchor;
}

export function graphReadingScope(
  nodes: GraphNode[],
  edges: GraphEdge[],
  selected: string | null,
  topic: string | null,
) {
  const active = edges.filter((edge) => edge.status === 'active');
  const identifiers = selected
    ? new Set([
        selected,
        ...active
          .filter((edge) => edge.source === selected || edge.target === selected)
          .flatMap((edge) => [edge.source, edge.target]),
      ])
    : new Set(nodes.filter((node) => !topic || node.topics.includes(topic)).map((node) => node.id));
  const visible = nodes.filter((node) => identifiers.has(node.id));
  const visibleIds = new Set(visible.map((node) => node.id));
  return {
    nodes: visible,
    edges: active.filter(
      (edge) =>
        visibleIds.has(edge.source) &&
        visibleIds.has(edge.target) &&
        (!selected || edge.source === selected || edge.target === selected),
    ),
  };
}

export function graphReadingGroups(nodes: GraphNode[]) {
  return [
    { label: '业务流程与状态', types: ['process', 'state'] },
    { label: '管理功能', types: ['feature'] },
    { label: '关键规则', types: ['rule'] },
    { label: '业务对象与接口', types: ['object', 'field', 'interface', 'platform'] },
  ]
    .map((group) => ({ label: group.label, nodes: nodes.filter((node) => group.types.includes(node.type)) }))
    .filter((group) => group.nodes.length);
}
