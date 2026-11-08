export const REQUIREMENT_GRAPH_VERSION: number;
export const GRAPH_NODE_TYPES: readonly GraphNodeType[];
export const GRAPH_RELATIONS: Readonly<Record<GraphRelation, { label: string; propagation: string }>>;
export const GRAPH_TOOL_NAMES: readonly string[];
export type GraphNodeType =
  'feature' | 'object' | 'field' | 'state' | 'rule' | 'process' | 'interface' | 'platform';
export type GraphRelation =
  | 'depends_on'
  | 'provides_data'
  | 'constrains'
  | 'triggers'
  | 'precedes'
  | 'integrates_with'
  | 'references'
  | 'similar_to';
export type EvidenceBasis = 'explicit';
export interface GraphEvidence {
  requirementId: string;
  anchor: string;
  quote: string;
  revision: string;
  stale?: boolean;
}
export interface GraphPrototype {
  clientId: string;
  pageKey: string;
  anchor: string;
  target: string;
  revision: string;
  stale?: boolean;
}
export interface GraphNode {
  id: string;
  label: string;
  aliases: string[];
  type: GraphNodeType;
  summary: string;
  topics: string[];
  primaryTopic: string;
  status: 'active' | 'deprecated';
  requirements: string[];
  evidence: GraphEvidence[];
  coverage: 'none' | 'partial' | 'presented';
  prototypes: GraphPrototype[];
  stale: boolean;
  requirementStatus: 'confirmed' | 'draft';
}
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: GraphRelation;
  label: string;
  reason: string;
  basis: EvidenceBasis;
  status: 'active' | 'deprecated';
  evidence: GraphEvidence[];
  stale: boolean;
}
export interface GraphTopic {
  id: string;
  label: string;
  description: string;
}
/** Git authoring format excludes derived API fields such as stale/requirementStatus. */
export type GraphNodeDefinition = Omit<
  GraphNode,
  'stale' | 'requirementStatus' | 'evidence' | 'prototypes'
> & {
  evidence: Omit<GraphEvidence, 'stale'>[];
  prototypes: Omit<GraphPrototype, 'stale'>[];
};
export type GraphEdgeDefinition = Omit<GraphEdge, 'stale' | 'evidence'> & {
  evidence: Omit<GraphEvidence, 'stale'>[];
};
export interface RequirementGraphDefinition {
  schemaVersion: 1;
  topics: GraphTopic[];
  nodes: GraphNodeDefinition[];
  edges: GraphEdgeDefinition[];
  review: {
    reviewedAt: string;
    graphRevision?: string;
    requirements: Record<string, string>;
    bindings: Record<string, string>;
    prototypes: Record<string, string>;
    note: string;
  };
}
export interface GraphDiagnostic {
  code: string;
  requirementId?: string;
  nodeId?: string;
  edgeId?: string;
  prototypeKey?: string;
}
export interface RequirementGraph {
  vocabulary: {
    nodeTypes: GraphNodeType[];
    relations: Record<string, { label: string; propagation: string }>;
    coverage: string[];
    evidence: string[];
  };
  schemaVersion: number;
  projectId: string;
  contentRevision: string;
  graphRevision: string;
  releaseId: string;
  availability: 'ready' | 'missing' | 'invalid';
  freshness: 'current' | 'stale' | 'unknown';
  reviewedAt: string | null;
  accessScope: 'project-business' | 'authorized-web';
  complete: boolean;
  topics: GraphTopic[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  documents: { id: string; title: string; status: string; revision: string }[];
  diagnostics: GraphDiagnostic[];
  nodeTotal: number;
  edgeTotal: number;
  nextOffset: number | null;
  edgeNextOffset?: number | null;
  edgesTruncated?: boolean;
  globalEdgeTotal?: number;
}
export interface GraphImpactItem {
  node: GraphNode;
  depth: number;
  certainty: 'confirmed' | 'potential';
  path: { from: string; to: string; edge: GraphEdge }[];
}
export interface GraphImpact {
  origin: GraphNode;
  change: string;
  items: GraphImpactItem[];
  caveats: string[];
  complete: boolean;
  maxDepth: number;
  freshness: string;
  graphRevision: string;
}
