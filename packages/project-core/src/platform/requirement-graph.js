/** Validates business evidence, filters before analysis, and applies impact semantics.
 * Rendering geometry and general shortest-path search belong to their open-source engines. */
import { createHash } from 'node:crypto';
import { MultiDirectedGraph } from 'graphology';
import { bidirectional } from 'graphology-shortest-path/unweighted.js';
import {
  GRAPH_NODE_TYPES,
  GRAPH_RELATIONS,
  graphHeadingId,
} from '../../../project-shared/src/requirement-graph.js';
import { fail } from './store.js';

export const graphHash = (value) => createHash('sha256').update(value).digest('hex');
const idPattern = /^[a-z0-9][a-z0-9-]{1,95}$/;
const digest = /^[a-f0-9]{64}$/;
const validId = (value) => typeof value === 'string' && idPattern.test(value);
function requireGraph(condition, message = '业务图谱格式无效') {
  if (!condition) throw new Error(message);
}
function record(value, keys) {
  requireGraph(value && typeof value === 'object' && !Array.isArray(value));
  requireGraph(Object.keys(value).every((key) => keys.includes(key)));
}
function string(value, max = 1000, empty = false) {
  requireGraph(typeof value === 'string' && value.length <= max && (empty || value.trim()));
  // Strings are plain data; host paths must not become published business metadata.
  requireGraph(!/[a-z]:\\|file:\/\//i.test(value));
  return value;
}
function array(value, max) {
  requireGraph(Array.isArray(value) && value.length <= max);
  return value;
}
function evidence(input) {
  return array(input, 40).map((item) => {
    record(item, ['requirementId', 'anchor', 'quote', 'revision']);
    requireGraph(validId(item.requirementId) && digest.test(item.revision));
    return { ...item, anchor: string(item.anchor, 160), quote: string(item.quote, 1600) };
  });
}
export function validateRequirementGraph(input) {
  record(input, ['schemaVersion', 'topics', 'nodes', 'edges', 'review']);
  requireGraph(input.schemaVersion === 1);
  const topicIds = new Set(),
    nodeIds = new Set(),
    edgeIds = new Set();
  const topics = array(input.topics, 100).map((item) => {
    record(item, ['id', 'label', 'description']);
    requireGraph(validId(item.id) && !topicIds.has(item.id));
    topicIds.add(item.id);
    return {
      id: item.id,
      label: string(item.label, 100),
      description: string(item.description ?? '', 500, true),
    };
  });
  const nodes = array(input.nodes, 10000).map((item) => {
    record(item, [
      'id',
      'label',
      'aliases',
      'type',
      'summary',
      'topics',
      'primaryTopic',
      'status',
      'requirements',
      'evidence',
      'coverage',
      'prototypes',
    ]);
    requireGraph(validId(item.id) && !nodeIds.has(item.id));
    nodeIds.add(item.id);
    requireGraph(GRAPH_NODE_TYPES.includes(item.type) && ['active', 'deprecated'].includes(item.status));
    const memberships = array(item.topics, 15);
    requireGraph(
      memberships.length &&
        new Set(memberships).size === memberships.length &&
        memberships.every((id) => topicIds.has(id)) &&
        memberships.includes(item.primaryTopic),
    );
    const requirements = array(item.requirements, 40);
    requireGraph(
      requirements.length &&
        requirements.every(validId) &&
        new Set(requirements).size === requirements.length,
    );
    const sources = evidence(item.evidence);
    requireGraph(sources.every((source) => requirements.includes(source.requirementId)));
    requireGraph(['none', 'partial', 'presented'].includes(item.coverage));
    const prototypes = array(item.prototypes, 40).map((page) => {
      record(page, ['clientId', 'pageKey', 'anchor', 'target', 'revision']);
      requireGraph(validId(page.clientId) && validId(page.pageKey) && digest.test(page.revision));
      return { ...page, anchor: string(page.anchor ?? '', 160, true), target: string(page.target, 300) };
    });
    requireGraph(item.coverage === 'none' ? !prototypes.length : prototypes.length > 0);
    return {
      ...item,
      label: string(item.label, 160),
      summary: string(item.summary, 2000),
      aliases: array(item.aliases ?? [], 20).map((alias) => string(alias, 160)),
      evidence: sources,
      prototypes,
    };
  });
  const edges = array(input.edges, 30000).map((item) => {
    record(item, ['id', 'source', 'target', 'relation', 'label', 'reason', 'basis', 'status', 'evidence']);
    requireGraph(
      validId(item.id) && !edgeIds.has(item.id) && nodeIds.has(item.source) && nodeIds.has(item.target),
    );
    edgeIds.add(item.id);
    requireGraph(
      Object.hasOwn(GRAPH_RELATIONS, item.relation) &&
        item.basis === 'explicit' &&
        ['active', 'deprecated'].includes(item.status),
    );
    const sources = evidence(item.evidence);
    requireGraph(sources.length, '正式关系必须有明确PRD出处');
    return { ...item, label: string(item.label, 160), reason: string(item.reason, 2000), evidence: sources };
  });
  record(input.review, ['reviewedAt', 'graphRevision', 'requirements', 'bindings', 'prototypes', 'note']);
  requireGraph(input.review.graphRevision === undefined || digest.test(input.review.graphRevision));
  requireGraph(
    typeof input.review.reviewedAt === 'string' && Number.isFinite(Date.parse(input.review.reviewedAt)),
  );
  for (const key of ['requirements', 'bindings', 'prototypes']) {
    const values = input.review[key];
    requireGraph(
      values && typeof values === 'object' && !Array.isArray(values) && Object.keys(values).length <= 10000,
    );
    requireGraph(Object.values(values).every((value) => digest.test(value)));
  }
  return {
    schemaVersion: 1,
    topics,
    nodes,
    edges,
    review: { ...input.review, note: string(input.review.note ?? '', 1000, true) },
  };
}
export function requirementBindingRevision(document) {
  return graphHash(
    JSON.stringify({ status: document.status, pages: document.pages, access: document.access ?? 'project' }),
  );
}
export function reviewedGraphRevision(graph) {
  return graphHash(JSON.stringify({ topics: graph.topics, nodes: graph.nodes, edges: graph.edges }));
}
function sectionText(markdown, anchor) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    return heading && graphHeadingId(heading[2]) === anchor;
  });
  if (start < 0) return null;
  const depth = /^#+/.exec(lines[start])[0].length;
  const end = lines.findIndex(
    (line, index) => index > start && /^#{1,6}\s/.test(line) && /^#+/.exec(line)[0].length <= depth,
  );
  return lines.slice(start, end < 0 ? undefined : end).join('\n');
}
/** No exception for malformed/missing graph may invalidate an otherwise safe business release. */
export function requirementGraphView(
  snapshot,
  project,
  { documents, allowedPage, scope = 'project-business' } = {},
) {
  const allDocuments = snapshot.manifest.requirements.map((item) => ({
    ...item,
    revision: graphHash(snapshot.files.get(item.path)),
  }));
  const readable = documents
    ? allDocuments.filter((item) => documents.some((doc) => doc.id === item.id))
    : allDocuments;
  const visibleIds = new Set(readable.map((item) => item.id));
  const envelope = {
    schemaVersion: 1,
    projectId: project.id,
    releaseId: snapshot.releaseId ?? 'development',
    contentRevision: snapshot.revision,
    graphRevision: '',
    reviewedAt: null,
    accessScope: scope,
    vocabulary: {
      nodeTypes: GRAPH_NODE_TYPES,
      relations: GRAPH_RELATIONS,
      coverage: ['none', 'partial', 'presented'],
      evidence: ['explicit'],
    },
    topics: [],
    nodes: [],
    edges: [],
    documents: readable.map(({ id, title, status, revision }) => ({ id, title, status, revision })),
    diagnostics: [],
    nodeTotal: 0,
    edgeTotal: 0,
    nextOffset: null,
  };
  const bytes = snapshot.files.get(snapshot.manifest.graph ?? '');
  if (!bytes)
    return {
      ...envelope,
      availability: 'missing',
      freshness: 'unknown',
      complete: false,
      diagnostics: readable.map(({ id }) => ({ code: 'UNMAPPED_REQUIREMENT', requirementId: id })),
    };
  let graph;
  try {
    graph = validateRequirementGraph(JSON.parse(bytes.toString('utf8')));
  } catch {
    return { ...envelope, availability: 'invalid', freshness: 'unknown', complete: false };
  }
  const diagnostics = [];
  if (graph.review.graphRevision !== reviewedGraphRevision(graph))
    diagnostics.push({ code: 'UNREVIEWED_GRAPH' });
  const sourceCheck = (source) => {
    const doc = allDocuments.find((item) => item.id === source.requirementId);
    if (!doc) return { ...source, stale: true };
    const markdown = snapshot.files.get(doc.path).toString('utf8');
    const section = sectionText(markdown, source.anchor);
    return {
      ...source,
      stale: source.revision !== doc.revision || !section || !section.includes(source.quote),
    };
  };
  const fullyAuthorized = (requirements) =>
    requirements.length &&
    requirements.every(
      (id) =>
        visibleIds.has(id) || (scope === 'project-business' && !allDocuments.some((doc) => doc.id === id)),
    );
  const nodes = graph.nodes
    .filter(
      (item) =>
        fullyAuthorized(item.requirements) &&
        item.evidence.every((source) => fullyAuthorized([source.requirementId])) &&
        (!allowedPage || item.prototypes.every(allowedPage)),
    )
    .map((item) => {
      const sources = item.evidence.map(sourceCheck);
      const prototypes = item.prototypes.map((page) => ({
        ...page,
        stale:
          !snapshot.prototypeRevisions?.[`${page.clientId}/${page.pageKey}`] ||
          snapshot.prototypeRevisions[`${page.clientId}/${page.pageKey}`] !== page.revision,
      }));
      const stale =
        !sources.length ||
        sources.some((source) => source.stale) ||
        prototypes.some((page) => page.stale) ||
        item.requirements.some((id) => !allDocuments.some((doc) => doc.id === id));
      if (stale && item.status === 'active') diagnostics.push({ code: 'STALE_NODE', nodeId: item.id });
      return {
        ...item,
        evidence: sources,
        prototypes,
        stale,
        requirementStatus: item.requirements.every(
          (id) => allDocuments.find((doc) => doc.id === id)?.status === 'confirmed',
        )
          ? 'confirmed'
          : 'draft',
      };
    });
  const nodeIds = new Set(nodes.map((item) => item.id));
  const edges = graph.edges
    .filter(
      (item) =>
        nodeIds.has(item.source) &&
        nodeIds.has(item.target) &&
        item.evidence.every((source) => fullyAuthorized([source.requirementId])),
    )
    .map((item) => {
      const sources = item.evidence.map(sourceCheck);
      const stale = sources.some((source) => source.stale);
      const current =
        item.status === 'active' &&
        [item.source, item.target].every((id) =>
          nodes.some((node) => node.id === id && node.status === 'active'),
        );
      if (stale && current) diagnostics.push({ code: 'STALE_EDGE', edgeId: item.id });
      return { ...item, evidence: sources, stale };
    });
  for (const doc of readable) {
    if (!nodes.some((node) => node.requirements.includes(doc.id)))
      diagnostics.push({ code: 'UNMAPPED_REQUIREMENT', requirementId: doc.id });
    if (
      graph.review.requirements[doc.id] !== doc.revision ||
      graph.review.bindings[doc.id] !== requirementBindingRevision(doc)
    )
      diagnostics.push({ code: 'UNREVIEWED_REQUIREMENT', requirementId: doc.id });
  }
  for (const node of nodes.filter((node) => node.status === 'active'))
    for (const page of node.prototypes) {
      const key = `${page.clientId}/${page.pageKey}`;
      if (
        !snapshot.prototypeRevisions?.[key] ||
        graph.review.prototypes[key] !== snapshot.prototypeRevisions[key]
      )
        diagnostics.push({ code: 'UNREVIEWED_PROTOTYPE', nodeId: node.id, prototypeKey: key });
    }
  for (const [key, revision] of Object.entries(snapshot.prototypeRevisions ?? {})) {
    const [clientId, pageKey] = key.split('/');
    if (allowedPage && !allowedPage({ clientId, pageKey })) continue;
    if (!nodes.some((node) => node.prototypes.some((page) => `${page.clientId}/${page.pageKey}` === key)))
      diagnostics.push({ code: 'UNMAPPED_PROTOTYPE', prototypeKey: key });
    else if (graph.review.prototypes[key] !== revision)
      diagnostics.push({ code: 'UNREVIEWED_PROTOTYPE', prototypeKey: key });
  }
  const unique = [...new Map(diagnostics.map((item) => [JSON.stringify(item), item])).values()];
  const freshness = unique.length ? 'stale' : 'current';
  return {
    ...envelope,
    availability: 'ready',
    freshness,
    reviewedAt: graph.review.reviewedAt,
    // Filtered identities must not correlate privileged graph edits across web users.
    graphRevision: graphHash(
      JSON.stringify({
        topics: graph.topics.filter((topic) => nodes.some((node) => node.topics.includes(topic.id))),
        nodes,
        edges,
        unique,
      }),
    ),
    topics: graph.topics.filter((topic) => nodes.some((node) => node.topics.includes(topic.id))),
    nodes,
    edges,
    diagnostics: unique,
    nodeTotal: nodes.length,
    edgeTotal: edges.length,
    complete: freshness === 'current' && !unique.length,
  };
}
function activeNodes(view, history) {
  return view.nodes.filter((node) => history || node.status === 'active');
}
function page(items, offset, limit) {
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    offset,
    nextOffset: offset + limit < items.length ? offset + limit : null,
  };
}
function findNode(view, id, history) {
  const node = activeNodes(view, history).find((item) => item.id === id);
  if (!node) fail(404, '图谱节点不存在或无权访问', 'GRAPH_NODE_NOT_FOUND');
  return node;
}
export function queryRequirementGraph(view, operation, args = {}) {
  const accepted = [
    'projectId',
    'contentRevision',
    'graphRevision',
    'id',
    'targetId',
    'query',
    'topic',
    'type',
    'history',
    'offset',
    'limit',
    'maxDepth',
    'change',
    'edgeOffset',
    'edgeLimit',
  ];
  if (Object.keys(args).some((key) => !accepted.includes(key)))
    fail(400, '图谱查询包含未知参数', 'BAD_REQUEST');
  if (args.projectId && args.projectId !== view.projectId) fail(404, '项目不存在或无权访问', 'NOT_FOUND');
  if (
    (args.contentRevision && args.contentRevision !== view.contentRevision) ||
    (args.graphRevision && args.graphRevision !== view.graphRevision)
  )
    fail(409, '图谱或资料版本已更新，请重新读取', 'CONTENT_REVISION_CHANGED');
  const offset = args.offset === undefined ? 0 : Number(args.offset);
  const limit = args.limit === undefined ? 100 : Number(args.limit);
  const maxDepth = args.maxDepth === undefined ? 4 : Number(args.maxDepth);
  const edgeOffset = args.edgeOffset === undefined ? 0 : Number(args.edgeOffset);
  const edgeLimit = args.edgeLimit === undefined ? 1000 : Number(args.edgeLimit);
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 500 ||
    !Number.isSafeInteger(maxDepth) ||
    maxDepth < 1 ||
    maxDepth > 8 ||
    !Number.isSafeInteger(edgeOffset) ||
    edgeOffset < 0 ||
    !Number.isSafeInteger(edgeLimit) ||
    edgeLimit < 1 ||
    edgeLimit > 2000
  )
    fail(400, '图谱查询范围无效', 'BAD_REQUEST');
  if (args.history !== undefined && ![true, false, 'true', 'false'].includes(args.history))
    fail(400, '历史查询参数无效', 'BAD_REQUEST');
  for (const key of ['query', 'change'])
    if (
      args[key] !== undefined &&
      (typeof args[key] !== 'string' || args[key].length > (key === 'change' ? 2000 : 160))
    )
      fail(400, '图谱查询文字无效', 'BAD_REQUEST');
  const history = args.history === true || args.history === 'true';
  const available = activeNodes(view, history);
  const nodesById = new Map(available.map((node) => [node.id, node]));
  const ids = new Set(available.map((node) => node.id));
  const edges = view.edges.filter(
    (edge) => ids.has(edge.source) && ids.has(edge.target) && (history || edge.status === 'active'),
  );
  const envelope = {
    schemaVersion: view.schemaVersion,
    projectId: view.projectId,
    releaseId: view.releaseId,
    contentRevision: view.contentRevision,
    graphRevision: view.graphRevision,
    availability: view.availability,
    freshness: view.freshness,
    diagnostics: view.diagnostics,
    complete: view.complete,
    accessScope: view.accessScope,
    reviewedAt: view.reviewedAt,
    vocabulary: view.vocabulary,
  };
  if (operation === 'get_requirement_graph') {
    const visible = available.filter((node) => !args.topic || node.topics.includes(args.topic));
    const slice = page(visible, offset, limit),
      sliceIds = new Set(slice.items.map((node) => node.id));
    // Edges belong to their source-node page. Cross-page targets must not disappear.
    const visibleEdges = edges.filter((edge) => sliceIds.has(edge.source));
    const edgeSlice = page(visibleEdges, edgeOffset, edgeLimit);
    return {
      ...view,
      ...slice,
      nodes: slice.items,
      edges: edgeSlice.items,
      items: undefined,
      nodeTotal: visible.length,
      edgeTotal: visibleEdges.length,
      edgesTruncated: edgeSlice.nextOffset !== null,
      edgeNextOffset: edgeSlice.nextOffset,
      globalEdgeTotal: edges.length,
      complete: view.complete && slice.nextOffset === null && edgeSlice.nextOffset === null,
    };
  }
  if (operation === 'list_graph_topics') return { ...envelope, ...page(view.topics, offset, limit) };
  if (view.availability !== 'ready')
    return { ...envelope, items: [], complete: false, total: 0, nextOffset: null };
  if (operation === 'search_graph_nodes') {
    const query = (args.query ?? '').trim().toLocaleLowerCase();
    const matches = available.filter(
      (node) =>
        (!args.topic || node.topics.includes(args.topic)) &&
        (!args.type || node.type === args.type) &&
        [node.label, node.summary, ...node.aliases].some((text) => text.toLocaleLowerCase().includes(query)),
    );
    const result = page(matches, offset, limit);
    return { ...envelope, ...result, complete: view.complete && result.nextOffset === null };
  }
  const node = findNode(view, args.id, history);
  if (operation === 'get_graph_node') {
    const result = page(
      edges.filter((edge) => edge.source === node.id || edge.target === node.id),
      offset,
      limit,
    );
    return {
      ...envelope,
      node,
      edges: result.items,
      edgeTotal: result.total,
      nextOffset: result.nextOffset,
      complete: view.complete && result.nextOffset === null,
    };
  }
  if (operation === 'get_graph_neighbors') {
    const links = edges.filter((edge) => edge.source === node.id || edge.target === node.id);
    const neighbors = new Set(links.flatMap((edge) => [edge.source, edge.target]));
    const result = page(
      available.filter((item) => item.id !== node.id && neighbors.has(item.id)),
      offset,
      limit,
    );
    const shown = new Set(result.items.map((item) => item.id));
    const edgePage = page(
      links.filter((edge) => shown.has(edge.source) || shown.has(edge.target)),
      edgeOffset,
      edgeLimit,
    );
    return {
      ...envelope,
      node,
      ...result,
      edges: edgePage.items,
      edgeNextOffset: edgePage.nextOffset,
      edgeTotal: edgePage.total,
      complete: view.complete && result.nextOffset === null && edgePage.nextOffset === null,
    };
  }
  if (operation === 'find_graph_path') {
    const target = findNode(view, args.targetId, history);
    const graph = new MultiDirectedGraph();
    for (const item of available) graph.addNode(item.id);
    for (const edge of edges) {
      graph.addDirectedEdgeWithKey(edge.id, edge.source, edge.target);
      if (GRAPH_RELATIONS[edge.relation].propagation === 'both' && edge.source !== edge.target)
        graph.addDirectedEdgeWithKey(`${edge.id}:reverse`, edge.target, edge.source);
    }
    const route = bidirectional(graph, node.id, target.id);
    const exceeded = route && route.length - 1 > maxDepth;
    return {
      ...envelope,
      direction: 'declared',
      found: !!route && !exceeded,
      path: route && !exceeded ? route.map((id) => nodesById.get(id)) : [],
      edges:
        route && !exceeded
          ? route
              .slice(1)
              .map((id, index) =>
                edges.filter(
                  (edge) =>
                    (edge.source === route[index] && edge.target === id) ||
                    (GRAPH_RELATIONS[edge.relation].propagation === 'both' &&
                      edge.target === route[index] &&
                      edge.source === id),
                ),
              )
          : [],
      truncated: !!exceeded,
      complete: view.complete && !exceeded,
    };
  }
  if (operation !== 'analyze_requirement_impact') fail(404, '图谱工具不存在', 'NOT_FOUND');
  // This traversal is domain policy: direction and evidence change impact classification.
  const influence = new Map();
  for (const edge of edges) {
    const propagation = GRAPH_RELATIONS[edge.relation].propagation;
    const append = (from, to) => {
      if (!influence.has(from)) influence.set(from, []);
      influence.get(from).push({ from, to, edge });
    };
    if (propagation === 'forward' || propagation === 'both') append(edge.source, edge.target);
    if (propagation === 'reverse' || propagation === 'both') append(edge.target, edge.source);
  }
  const results = new Map(),
    seen = new Set([`${node.id}:confirmed`]),
    queue = [{ id: node.id, path: [], certainty: 'confirmed' }];
  let depthTruncated = false,
    work = 0;
  const rank = { confirmed: 0, potential: 1 };
  while (queue.length && work++ < 10000) {
    const current = queue.shift();
    const outbound = influence.get(current.id) ?? [];
    if (current.path.length >= maxDepth) {
      if (outbound.some((link) => link.to !== node.id && !results.has(link.to))) depthTruncated = true;
      continue;
    }
    for (const link of outbound) {
      const affected = nodesById.get(link.to);
      const own =
        link.edge.stale ||
        affected.stale ||
        affected.requirementStatus !== 'confirmed' ||
        node.stale ||
        node.requirementStatus !== 'confirmed'
          ? 'potential'
          : 'confirmed';
      const certainty = rank[own] > rank[current.certainty] ? own : current.certainty;
      const route = [...current.path, link];
      const previous = results.get(link.to);
      if (
        link.to !== node.id &&
        (!previous ||
          rank[certainty] < rank[previous.certainty] ||
          (certainty === previous.certainty && route.length < previous.depth))
      )
        results.set(link.to, { node: affected, depth: route.length, certainty, path: route });
      const key = `${link.to}:${certainty}`;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push({ id: link.to, path: route, certainty });
      }
    }
  }
  const result = page(
    [...results.values()].sort((a, b) => a.depth - b.depth || a.node.id.localeCompare(b.node.id)),
    offset,
    limit,
  );
  const caveats = ['影响结果基于已记录业务关系，仍需核对本次具体修改场景。'];
  if (view.accessScope !== 'project-business') caveats.push('仅分析当前账号可读范围。');
  if (view.freshness !== 'current')
    caveats.push('图谱存在过期依据或尚未覆盖的需求，不能据空结果认定无影响。');
  if (depthTruncated || queue.length || result.nextOffset !== null)
    caveats.push('结果达到查询范围限制，请扩大深度或继续分页。');
  if (history) caveats.push('本次包含废弃历史关系，不应直接作为当前功能修改依据。');
  return {
    ...envelope,
    origin: node,
    change: args.change ?? '',
    maxDepth,
    ...result,
    caveats,
    truncated: depthTruncated || queue.length > 0 || result.nextOffset !== null,
    complete: view.complete && !depthTruncated && !queue.length && result.nextOffset === null,
  };
}
