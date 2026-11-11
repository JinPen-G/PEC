import type { GraphData } from '@antv/g6';
import type { GraphNode, GraphEdge } from '../../../../../packages/platform-contracts/src/requirement-graph';
import { graphNodeColor } from './graph-presentation';

export const graphNodeId = (id: string) => `node:${id}`;
export const graphEdgeId = (id: string) => `edge:${id}`;

export function graphRenderData(
  nodes: GraphNode[],
  edges: GraphEdge[],
  text: (value: string) => string,
): GraphData {
  const ids = new Set(nodes.map((node) => node.id));
  return {
    nodes: nodes.map((node) => ({
      id: graphNodeId(node.id),
      data: { title: text(node.label), description: text(node.summary) },
      style: { labelText: text(node.label), fill: graphNodeColor(node.type) },
    })),
    edges: edges
      .filter((edge) => ids.has(edge.source) && ids.has(edge.target))
      .map((edge) => ({
        id: graphEdgeId(edge.id),
        source: graphNodeId(edge.source),
        target: graphNodeId(edge.target),
        data: { title: text(edge.label), description: text(edge.reason) },
        style: {
          labelText: text(edge.label),
          labelPlacement: 'center',
          lineDash: ['references', 'similar_to'].includes(edge.relation) ? [5, 4] : [],
          startArrow: edge.relation === 'integrates_with',
          endArrow: edge.relation !== 'similar_to',
        },
      })),
  };
}
