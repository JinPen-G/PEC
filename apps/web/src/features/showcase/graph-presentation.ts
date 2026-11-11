/** Presentation only: topic membership and evidence semantics live in the domain. */
const scopeColors = ['#6366f1', '#0d9488', '#f59e0b', '#a855f7', '#ec4899', '#3b82f6'];
export function scopeColor(index: number) {
  return scopeColors[Math.max(0, index) % scopeColors.length];
}

import type {
  GraphEdge,
  GraphNode,
  GraphNodeType,
  GraphRelation,
} from '../../../../../packages/platform-contracts/src/requirement-graph';

export const graphNodeLegend: { type: GraphNodeType; label: string; color: string }[] = [
  { type: 'feature', label: '功能', color: '#6366f1' },
  { type: 'process', label: '流程步骤', color: '#0d9488' },
  { type: 'state', label: '状态', color: '#0284c7' },
  { type: 'rule', label: '规则', color: '#d97706' },
  { type: 'object', label: '业务对象', color: '#a855f7' },
  { type: 'field', label: '关键字段', color: '#ec4899' },
  { type: 'interface', label: '接口契约', color: '#ea580c' },
  { type: 'platform', label: '外部平台', color: '#64748b' },
];

export const graphRelationLegend: { relation: GraphRelation; label: string; color: string }[] = [
  { relation: 'depends_on', label: '依赖', color: '#6366f1' },
  { relation: 'constrains', label: '约束', color: '#d97706' },
  { relation: 'triggers', label: '触发', color: '#0d9488' },
  { relation: 'precedes', label: '先后顺序', color: '#0284c7' },
  { relation: 'provides_data', label: '数据流转', color: '#a855f7' },
  { relation: 'integrates_with', label: '平台对接', color: '#ea580c' },
  { relation: 'references', label: '引用', color: '#64748b' },
  { relation: 'similar_to', label: '相似关联', color: '#ec4899' },
];

export const graphNodeColor = (type: GraphNodeType) =>
  graphNodeLegend.find((item) => item.type === type)?.color ?? '#64748b';
export const graphRelationColor = (relation: GraphRelation) =>
  graphRelationLegend.find((item) => item.relation === relation)?.color ?? '#64748b';

export function graphVisibility(
  nodes: GraphNode[],
  edges: GraphEdge[],
  hiddenTypes: readonly GraphNodeType[],
  hiddenRelations: readonly GraphRelation[],
) {
  const nodeIds = new Set(nodes.filter((node) => !hiddenTypes.includes(node.type)).map((node) => node.id));
  const edgeIds = new Set(
    edges
      .filter(
        (edge) =>
          edge.status === 'active' &&
          !hiddenRelations.includes(edge.relation) &&
          nodeIds.has(edge.source) &&
          nodeIds.has(edge.target),
      )
      .map((edge) => edge.id),
  );
  return { nodeIds, edgeIds };
}

export function graphEmphasis(
  nodes: GraphNode[],
  edges: GraphEdge[],
  selected: string | null,
  focus: string[] | null,
  visible: ReturnType<typeof graphVisibility>,
) {
  const edgeIds = new Set(
    edges
      .filter(
        (edge) =>
          visible.edgeIds.has(edge.id) &&
          (selected
            ? edge.source === selected || edge.target === selected
            : focus
              ? focus.includes(edge.source) && focus.includes(edge.target)
              : true),
      )
      .map((edge) => edge.id),
  );
  const nodeIds = selected
    ? new Set([
        selected,
        ...edges.filter((edge) => edgeIds.has(edge.id)).flatMap((edge) => [edge.source, edge.target]),
      ])
    : new Set(focus ?? nodes.map((node) => node.id));
  return { nodeIds, edgeIds, active: selected !== null || focus !== null };
}
