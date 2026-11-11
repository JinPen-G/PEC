import { expect, it, vi } from 'vitest';
import type {
  GraphEdge,
  GraphNode,
  RequirementGraph,
} from '../../../../../packages/platform-contracts/src/requirement-graph';
import { loadGraphCatalog } from './graph-catalog';

const response = (input: Partial<RequirementGraph> = {}) =>
  ({
    projectId: 'project',
    graphRevision: 'graph-revision',
    contentRevision: 'content-revision',
    accessScope: 'authorized-web',
    availability: 'ready',
    freshness: 'stale',
    complete: false,
    nodes: [{ id: 'first' }],
    edges: [],
    topics: [],
    documents: [],
    diagnostics: [],
    nodeTotal: 1,
    edgeTotal: 0,
    globalEdgeTotal: 0,
    nextOffset: null,
    edgeNextOffset: null,
    ...input,
  }) as RequirementGraph;

it('loads source-owned edge pages and cross-page endpoints using one pinned revision', async () => {
  const firstNodes = Array.from({ length: 500 }, (_, index) => ({ id: `node-${index}` }) as GraphNode);
  const firstEdges = Array.from(
    { length: 1000 },
    (_, index) => ({ id: `edge-${index}`, source: 'node-0', target: 'node-500' }) as GraphEdge,
  );
  const request = vi
    .fn()
    .mockResolvedValueOnce(
      response({
        nodes: firstNodes,
        edges: firstEdges,
        nodeTotal: 501,
        edgeTotal: 1001,
        globalEdgeTotal: 1002,
        nextOffset: 500,
        edgeNextOffset: 1000,
        edgesTruncated: true,
      }),
    )
    .mockResolvedValueOnce(
      response({
        nodes: firstNodes,
        edges: [{ id: 'edge-1000', source: 'node-1', target: 'node-500' } as GraphEdge],
        nodeTotal: 501,
        edgeTotal: 1001,
        globalEdgeTotal: 1002,
        nextOffset: 500,
      }),
    )
    .mockResolvedValueOnce(
      response({
        nodes: [{ id: 'node-500' } as GraphNode],
        edges: [{ id: 'edge-1001', source: 'node-500', target: 'node-0' } as GraphEdge],
        nodeTotal: 501,
        edgeTotal: 1,
        globalEdgeTotal: 1002,
      }),
    );
  const controller = new AbortController();
  const graph = await loadGraphCatalog(request, 'project', controller.signal);
  expect(graph.nodes).toHaveLength(501);
  expect(graph.edges).toHaveLength(1002);
  expect(graph.edges.at(-1)?.target).toBe('node-0');
  expect(graph.complete).toBe(false);
  expect(graph.nextOffset).toBeNull();
  expect(graph.edgesTruncated).toBe(false);
  const calls = request.mock.calls.map(([route]) => new URL(route, 'https://preview.test').searchParams);
  expect(calls.map((parameters) => [parameters.get('offset'), parameters.get('edgeOffset')])).toEqual([
    ['0', '0'],
    ['0', '1000'],
    ['500', '0'],
  ]);
  expect(calls[1].get('graphRevision')).toBe('graph-revision');
  expect(calls[2].get('contentRevision')).toBe('content-revision');
  expect(request.mock.calls.every(([, options]) => options.signal === controller.signal)).toBe(true);
});

it('keeps reviewed complete data complete after paging but never clears maintenance gaps', async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(response({ nodeTotal: 2, nextOffset: 1, freshness: 'current' }))
    .mockResolvedValueOnce(
      response({
        nodes: [{ id: 'second' } as GraphNode],
        nodeTotal: 2,
        freshness: 'current',
        complete: true,
      }),
    );
  expect((await loadGraphCatalog(request, 'project')).complete).toBe(true);
});

it('rejects changed versions and permissions instead of merging a partial graph', async () => {
  for (const change of [
    { graphRevision: 'changed' },
    { contentRevision: 'changed' },
    { nodeTotal: 1 },
    { accessScope: 'project-business' },
  ]) {
    const request = vi
      .fn()
      .mockResolvedValueOnce(response({ nodeTotal: 2, nextOffset: 1 }))
      .mockResolvedValueOnce(
        response({
          nodes: [{ id: 'second' } as GraphNode],
          nodeTotal: 2,
          ...change,
        } as Partial<RequirementGraph>),
      );
    await expect(loadGraphCatalog(request, 'project')).rejects.toThrow('发生变化');
  }
});

it('does not hide missing endpoints, repeated cursors or truncated edges', async () => {
  for (const page of [
    response({ nextOffset: 0 }),
    response({ edgesTruncated: true }),
    response({ edgeTotal: 1, globalEdgeTotal: 1 }),
    response({ nodeTotal: 2 }),
    response({
      edges: [{ id: 'broken', source: 'first', target: 'missing' } as GraphEdge],
      edgeTotal: 1,
      globalEdgeTotal: 1,
    }),
  ])
    await expect(loadGraphCatalog(vi.fn().mockResolvedValue(page), 'project')).rejects.toThrow('不完整');
});

it('preserves unavailable states and aborts or network errors without returning stale partial data', async () => {
  const missing = response({ availability: 'unconfigured', nodes: [] });
  expect(await loadGraphCatalog(vi.fn().mockResolvedValue(missing), 'project')).toBe(missing);
  const controller = new AbortController();
  controller.abort();
  const request = vi.fn();
  await expect(loadGraphCatalog(request, 'project', controller.signal)).rejects.toThrow();
  expect(request).not.toHaveBeenCalled();
  const offline = vi
    .fn()
    .mockResolvedValueOnce(response({ nodeTotal: 2, nextOffset: 1 }))
    .mockRejectedValueOnce(new Error('Access denied'));
  await expect(loadGraphCatalog(offline, 'project')).rejects.toThrow('Access denied');
});
