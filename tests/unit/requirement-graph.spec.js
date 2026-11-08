// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { NATIVE_MODULES } from '../../packages/platform-contracts/src/platform.js';
import { createNativeServer } from '../../packages/platform-server/src/server.js';
import {
  loadContentPackage,
  validateContentManifest,
} from '../../packages/project-core/src/platform/project-content.js';
import {
  graphHash,
  requirementBindingRevision,
  requirementGraphView,
  queryRequirementGraph,
  reviewedGraphRevision,
  validateRequirementGraph,
} from '../../packages/project-core/src/platform/requirement-graph.js';
const fixtures = [];
const publicDoc = '# 公开规则\n字段变化影响功能。',
  privateDoc = '# 私有规则\n内部车辆限制。',
  orphanDoc = '# 未做原型\n独立业务流程。';
const project = {
  id: 'graph-project',
  name: 'Graph fixture',
  moduleKey: 'rimo-native',
  contentKey: 'graph-fixture',
  sourceId: 'published',
  links: [],
  clients: [
    {
      id: 'operation',
      name: 'Operation',
      icon: 'vehicle',
      layout: 'desktop',
      enabled: true,
      position: 0,
      defaultPage: 'vehicle-groups',
      pages: [
        {
          key: 'vehicle-groups',
          label: 'Public',
          group: 'Vehicles',
          visible: true,
          position: 0,
          access: 'public',
        },
        {
          key: 'vehicle-transfer',
          label: 'Private',
          group: 'Vehicles',
          visible: true,
          position: 1,
          access: 'restricted',
        },
      ],
    },
  ],
};
async function fixture() {
  const root = await fs.mkdtemp(path.join(tmpdir(), 'preview-graph-smoke-'));
  const contentRoot = path.join(root, 'content'),
    pkg = path.join(contentRoot, 'graph-fixture');
  await fs.mkdir(path.join(pkg, 'requirements'), { recursive: true });
  const manifest = validateContentManifest(
    {
      schemaVersion: 1,
      contentKey: 'graph-fixture',
      moduleKey: 'rimo-native',
      title: 'Business fixture',
      overview: 'overview.md',
      graph: 'graph.json',
      assets: [],
      requirements: [
        {
          id: 'public',
          title: 'Public rule',
          category: 'Business',
          status: 'confirmed',
          path: 'requirements/public.md',
          pages: [{ clientId: 'operation', pageKey: 'vehicle-groups' }],
        },
        {
          id: 'private',
          title: 'Private rule',
          category: 'Business',
          status: 'confirmed',
          path: 'requirements/private.md',
          pages: [{ clientId: 'operation', pageKey: 'vehicle-transfer' }],
        },
        {
          id: 'orphan',
          title: 'No prototype',
          category: 'Business',
          status: 'confirmed',
          access: 'public',
          path: 'requirements/orphan.md',
          pages: [],
        },
      ],
    },
    NATIVE_MODULES,
  );
  const bytes = { public: publicDoc, private: privateDoc, orphan: orphanDoc };
  const proof = (requirementId, anchor, quote) => ({
    requirementId,
    anchor,
    quote,
    revision: graphHash(bytes[requirementId]),
  });
  const p = proof('public', '公开规则', '字段变化影响功能。'),
    s = proof('private', '私有规则', '内部车辆限制。'),
    o = proof('orphan', '未做原型', '独立业务流程。');
  const make = (id, label, sources, type = 'feature') => ({
    id,
    label,
    type,
    summary: label,
    aliases: [],
    topics: ['vehicles', 'shared'],
    primaryTopic: 'vehicles',
    status: 'active',
    requirements: [...new Set(sources.map((item) => item.requirementId))],
    evidence: sources,
    coverage: 'none',
    prototypes: [],
  });
  const graph = {
    schemaVersion: 1,
    topics: [
      { id: 'vehicles', label: 'Vehicles', description: 'Main topic' },
      { id: 'shared', label: 'Shared', description: 'Cross topic' },
    ],
    nodes: [
      make('field', 'Public field', [p], 'field'),
      make('page', 'Public feature', [p]),
      make('secret', 'Private node', [s]),
      make('orphan', 'Independent requirement', [o]),
    ],
    edges: [
      {
        id: 'dependency',
        source: 'page',
        target: 'field',
        relation: 'depends_on',
        label: '依赖',
        reason: '公开功能依赖字段',
        basis: 'explicit',
        status: 'active',
        evidence: [p],
      },
      {
        id: 'private-link',
        source: 'secret',
        target: 'page',
        relation: 'depends_on',
        label: '依赖',
        reason: '私有功能依赖公开功能',
        basis: 'explicit',
        status: 'active',
        evidence: [p, s],
      },
    ],
    review: {
      reviewedAt: '2026-11-08T00:00:00.000Z',
      requirements: Object.fromEntries(
        manifest.requirements.map((doc) => [doc.id, graphHash(bytes[doc.id])]),
      ),
      bindings: Object.fromEntries(
        manifest.requirements.map((doc) => [doc.id, requirementBindingRevision(doc)]),
      ),
      prototypes: {},
      note: 'Synthetic smoke fixture',
    },
  };
  graph.review.graphRevision = reviewedGraphRevision(validateRequirementGraph(graph));
  await fs.writeFile(path.join(pkg, 'manifest.json'), JSON.stringify(manifest));
  await fs.writeFile(path.join(pkg, 'overview.md'), '# Business\nSynthetic fixture');
  for (const doc of manifest.requirements) await fs.writeFile(path.join(pkg, doc.path), bytes[doc.id]);
  await fs.writeFile(path.join(pkg, 'graph.json'), JSON.stringify(graph));
  const item = { root, contentRoot, pkg, graph };
  fixtures.push(item);
  item.snapshot = await loadContentPackage(contentRoot, 'graph-fixture', NATIVE_MODULES);
  item.snapshot.prototypeRevisions = {};
  return item;
}
afterEach(async () => {
  for (const item of fixtures.splice(0)) {
    await item.client?.close();
    if (item.runtime) {
      item.runtime.server.closeAllConnections();
      await new Promise((resolve) => item.runtime.server.close(resolve));
      item.runtime.store.close();
    }
    await fs.rm(item.root, { recursive: true, force: true });
  }
});
test('impact follows relation policy and evidence; shared topics never imply dependencies', async () => {
  const item = await fixture(),
    view = requirementGraphView(item.snapshot, project);
  expect(view.freshness).toBe('current');
  const result = queryRequirementGraph(view, 'analyze_requirement_impact', { id: 'field', maxDepth: 4 });
  expect(result.items.map((item) => [item.node.id, item.certainty])).toEqual([
    ['page', 'confirmed'],
    ['secret', 'confirmed'],
  ]);
  expect(result.items.some((item) => item.node.id === 'orphan')).toBe(false);
  expect(queryRequirementGraph(view, 'find_graph_path', { id: 'field', targetId: 'page' }).found).toBe(false);
  expect(queryRequirementGraph(view, 'find_graph_path', { id: 'page', targetId: 'field' }).found).toBe(true);
  expect(queryRequirementGraph(view, 'search_graph_nodes', { topic: 'shared' }).total).toBe(4);
  for (const basis of ['inferred', 'pending']) {
    const invalid = structuredClone(item.graph);
    invalid.edges[0].basis = basis;
    expect(() => validateRequirementGraph(invalid)).toThrow();
  }
  const tiny = queryRequirementGraph(view, 'get_requirement_graph', { offset: 1, limit: 1 });
  expect(tiny.edges.map((edge) => edge.id)).toContain('dependency');
  expect(() => queryRequirementGraph(view, 'get_graph_node', { id: 'field', graphRevision: 'old' })).toThrow(
    '版本已更新',
  );
  const history = structuredClone(item.graph);
  history.nodes.find((node) => node.id === 'secret').status = 'deprecated';
  history.edges.find((edge) => edge.id === 'private-link').status = 'deprecated';
  history.review.graphRevision = reviewedGraphRevision(validateRequirementGraph(history));
  item.snapshot.files.set('graph.json', Buffer.from(JSON.stringify(history)));
  const historicalView = requirementGraphView(item.snapshot, project);
  expect(queryRequirementGraph(historicalView, 'get_requirement_graph').nodes).toHaveLength(3);
  expect(
    queryRequirementGraph(historicalView, 'get_requirement_graph', { history: true }).nodes,
  ).toHaveLength(4);
  history.nodes[0].summary = 'D:\\private\\notes';
  expect(() => validateRequirementGraph(history)).toThrow();
});
test('stale evidence and invalid graph remain visible without rejecting the business package', async () => {
  const item = await fixture();
  item.snapshot.files.set('requirements/public.md', Buffer.from('# 公开规则\n改写规则。'));
  const stale = requirementGraphView(item.snapshot, project);
  expect(stale.freshness).toBe('stale');
  expect(queryRequirementGraph(stale, 'analyze_requirement_impact', { id: 'field' }).items[0].certainty).toBe(
    'potential',
  );
  item.snapshot.files.set('graph.json', Buffer.from('{'));
  expect(requirementGraphView(item.snapshot, project).availability).toBe('invalid');
  await fs.writeFile(path.join(item.pkg, 'graph.json'), '{');
  const published = await loadContentPackage(item.contentRoot, 'graph-fixture', NATIVE_MODULES);
  expect(published.files.has('requirements/public.md')).toBe(true);
  expect(requirementGraphView(published, project).complete).toBe(false);
});
test('web filters nodes, edges and no-prototype PRDs; authorized MCP reads business graph and rejects revoked tokens', async () => {
  const item = await fixture();
  item.runtime = createNativeServer({
    dataDirectory: path.join(item.root, 'data'),
    contentRoot: item.contentRoot,
    sources: {},
    publicOrigin: 'http://127.0.0.1:5191',
  });
  await new Promise((resolve) => item.runtime.server.listen(0, '127.0.0.1', resolve));
  const store = item.runtime.store,
    admin = store.bootstrap({
      username: 'graph-admin',
      displayName: 'Graph admin',
      password: 'fixture-password',
    });
  store.createProject(admin, project);
  const base = `http://127.0.0.1:${item.runtime.server.address().port}`;
  const response = await fetch(`${base}/api/native/showcase/graph-project/graph?limit=500`);
  expect(response.status).toBe(200);
  const web = await response.json();
  expect(web.nodes.map((node) => node.id)).toEqual(['field', 'page', 'orphan']);
  expect(web.edges.map((edge) => edge.id)).toEqual(['dependency']);
  expect(JSON.stringify(web)).not.toContain('Private node');
  expect(
    (await fetch(`${base}/api/native/showcase/graph-project/graph-query?operation=get_graph_node&id=secret`))
      .status,
  ).toBe(404);
  expect((await fetch(`${base}/api/native/showcase/graph-project/graph-document?id=private`)).status).toBe(
    404,
  );
  expect((await fetch(`${base}/api/native/showcase/graph-project/graph-document?id=orphan`)).status).toBe(
    200,
  );
  const issued = store.issueContextToken(admin, project.id, { label: 'Graph smoke' });
  item.client = new Client({ name: 'graph-smoke', version: '1.0.0' });
  await item.client.connect(
    new StreamableHTTPClientTransport(new URL(`${base}/api/project-context/mcp`), {
      requestInit: { headers: { Authorization: `Bearer ${issued.secret}` } },
    }),
  );
  const tool = await item.client.callTool({ name: 'get_requirement_graph', arguments: { limit: 500 } });
  const full = JSON.parse(tool.content[0].text);
  expect(full.nodes.map((node) => node.id)).toContain('secret');
  expect(full.accessScope).toBe('project-business');
  const impact = await item.client.callTool({
    name: 'analyze_requirement_impact',
    arguments: { id: 'field' },
  });
  expect(JSON.parse(impact.content[0].text).items).toHaveLength(2);
  store.revokeContextToken(admin, issued.id);
  await expect(
    item.client.callTool({ name: 'get_graph_node', arguments: { id: 'secret' } }),
  ).rejects.toThrow();
});
