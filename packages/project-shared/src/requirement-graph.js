/** Engine-neutral business graph vocabulary; circle membership is never an impact edge. */
export const REQUIREMENT_GRAPH_VERSION = 1;
export const GRAPH_NODE_TYPES = Object.freeze([
  'feature',
  'object',
  'field',
  'state',
  'rule',
  'process',
  'interface',
  'platform',
]);
export const GRAPH_RELATIONS = Object.freeze({
  depends_on: { label: '依赖', propagation: 'reverse' },
  provides_data: { label: '提供数据', propagation: 'forward' },
  constrains: { label: '约束', propagation: 'forward' },
  triggers: { label: '触发', propagation: 'forward' },
  precedes: { label: '前置于', propagation: 'forward' },
  integrates_with: { label: '对接', propagation: 'both' },
  references: { label: '引用', propagation: 'none' },
  similar_to: { label: '语义相似', propagation: 'none' },
});
export const GRAPH_TOOL_NAMES = Object.freeze([
  'get_requirement_graph',
  'list_graph_topics',
  'search_graph_nodes',
  'get_graph_node',
  'get_graph_neighbors',
  'find_graph_path',
  'analyze_requirement_impact',
]);
export function graphHeadingId(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}
