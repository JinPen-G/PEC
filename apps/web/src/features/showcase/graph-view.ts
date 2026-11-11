import type { MutableRefObject } from 'react';
import type {
  GraphNode,
  GraphEdge,
  GraphNodeType,
  GraphRelation,
} from '../../../../../packages/platform-contracts/src/requirement-graph';

export interface GraphViewMemory {
  topology?: string;
  positions?: Map<string, { x: number; y: number }>;
  center?: [number, number];
  zoom?: number;
  camera?: { x: number; y: number; z: number };
  target?: { x: number; y: number; z: number };
}

export interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  expanded: boolean;
  onExpand: () => void;
  focus: string[] | null;
  hiddenTypes: GraphNodeType[];
  hiddenRelations: GraphRelation[];
  memory: MutableRefObject<GraphViewMemory>;
}

export function graphTopology(nodes: GraphNode[], edges: GraphEdge[]) {
  return JSON.stringify([
    nodes.map((node) => node.id).sort(),
    edges
      .map((edge) => [edge.id, edge.source, edge.target])
      .sort(([first], [second]) => first.localeCompare(second)),
  ]);
}
