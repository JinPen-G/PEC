import type {
  GraphEdge,
  GraphNode,
  RequirementGraph,
} from '../../../../../packages/platform-contracts/src/requirement-graph';

type GraphRequest = (route: string, options: { signal?: AbortSignal }) => Promise<unknown>;
const changed = '图谱资料发生变化，请重新读取。';
const incomplete = '图谱分页数据不完整，请重试。';

export async function loadGraphCatalog(request: GraphRequest, projectId: string, signal?: AbortSignal) {
  let reference: RequirementGraph | undefined;
  let latest: RequirementGraph | undefined;
  let requests = 0;
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  const read = async (offset: number, edgeOffset: number) => {
    signal?.throwIfAborted();
    if (++requests > 80) throw new Error(incomplete);
    const parameters = new URLSearchParams({
      offset: String(offset),
      edgeOffset: String(edgeOffset),
      limit: '500',
      edgeLimit: '1000',
      ...(reference
        ? { graphRevision: reference.graphRevision, contentRevision: reference.contentRevision }
        : {}),
    });
    const result = (await request(`/showcase/${encodeURIComponent(projectId)}/graph?${parameters}`, {
      signal,
    })) as RequirementGraph;
    if (
      reference &&
      (result.graphRevision !== reference.graphRevision ||
        result.contentRevision !== reference.contentRevision ||
        result.projectId !== reference.projectId ||
        result.accessScope !== reference.accessScope ||
        result.availability !== reference.availability ||
        result.nodeTotal !== reference.nodeTotal ||
        result.globalEdgeTotal !== reference.globalEdgeTotal)
    )
      throw new Error(changed);
    reference ??= result;
    latest = result;
    return result;
  };
  const cursor = (value: number | null | undefined, previous: number, total: number) => {
    if (value == null) return null;
    if (!Number.isSafeInteger(value) || value <= previous || value >= total) throw new Error(incomplete);
    return value;
  };
  let offset = 0;
  let page = await read(offset, 0);
  if (page.availability !== 'ready') return page;
  if (
    !Number.isSafeInteger(page.nodeTotal) ||
    page.nodeTotal < 0 ||
    page.nodeTotal > 10000 ||
    (page.globalEdgeTotal !== undefined &&
      (!Number.isSafeInteger(page.globalEdgeTotal) ||
        page.globalEdgeTotal < 0 ||
        page.globalEdgeTotal > 30000))
  )
    throw new Error(incomplete);
  while (true) {
    for (const node of page.nodes) {
      if (nodes.has(node.id)) throw new Error(incomplete);
      nodes.set(node.id, node);
    }
    const pageNodeIds = new Set(page.nodes.map((node) => node.id));
    const nodeNext = cursor(page.nextOffset, offset, page.nodeTotal);
    const edgeTotal = page.edgeTotal;
    let edgeOffset = 0;
    let pageEdgeCount = 0;
    while (true) {
      if (
        page.edgeTotal !== edgeTotal ||
        page.nextOffset !== nodeNext ||
        page.nodes.length !== pageNodeIds.size ||
        page.nodes.some((node) => !pageNodeIds.has(node.id))
      )
        throw new Error(changed);
      for (const edge of page.edges) {
        if (!pageNodeIds.has(edge.source) || edges.has(edge.id)) throw new Error(incomplete);
        edges.set(edge.id, edge);
        pageEdgeCount++;
      }
      const edgeNext = cursor(page.edgeNextOffset, edgeOffset, edgeTotal);
      if (edgeNext === null) {
        if (page.edgesTruncated || pageEdgeCount !== edgeTotal) throw new Error(incomplete);
        break;
      }
      edgeOffset = edgeNext;
      page = await read(offset, edgeOffset);
    }
    if (nodeNext === null) break;
    offset = nodeNext;
    page = await read(offset, 0);
  }
  if (
    nodes.size !== reference!.nodeTotal ||
    (reference!.globalEdgeTotal !== undefined && edges.size !== reference!.globalEdgeTotal) ||
    [...edges.values()].some((edge) => !nodes.has(edge.source) || !nodes.has(edge.target))
  )
    throw new Error(incomplete);
  return {
    ...reference!,
    nodes: [...nodes.values()],
    edges: [...edges.values()],
    edgeTotal: edges.size,
    nextOffset: null,
    edgeNextOffset: null,
    edgesTruncated: false,
    complete: latest!.complete,
  };
}
