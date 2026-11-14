// @vitest-environment node
import { afterEach, expect, test, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createNativeStore } from '../../packages/project-core/src/platform/store.js';
import { createNativeServer } from '../../packages/platform-server/src/server.js';
import {
  loadContentPackage,
  validateContentManifest,
  queryBusinessContext,
} from '../../packages/project-core/src/platform/project-content.js';
import { TEST_MODULES as NATIVE_MODULES } from '../fixtures/project-catalog.js';
import { packageRelease, verifyRelease, activateRelease } from '../../scripts/release.mjs';

const fixtures = [];
vi.mock('../../packages/platform-contracts/src/platform.js', async (original) => ({
  ...(await original()),
  NATIVE_MODULES: (await import('../fixtures/project-catalog.js')).TEST_MODULES,
}));
test('project guides publish only their declared scope without opening requirement files', async () => {
  const item = await fixture({ server: true });
  const manifest = baseManifest();
  manifest.guides = [
    {
      id: 'introduction',
      title: 'Fixture product',
      description: 'Public product introduction',
      path: 'guides/introduction.md',
      access: 'public',
    },
    {
      id: 'usage',
      title: 'Project workflow',
      description: 'Authorized guide',
      path: 'guides/usage.md',
      access: 'project',
    },
  ];
  await fs.mkdir(path.join(item.packageRoot, 'guides'));
  await fs.writeFile(
    path.join(item.packageRoot, 'guides/introduction.md'),
    '## Product\nPUBLIC-GUIDE-CANARY',
  );
  await fs.writeFile(path.join(item.packageRoot, 'guides/usage.md'), '## Workflow\nPROJECT-GUIDE-CANARY');
  await fs.writeFile(path.join(item.packageRoot, 'manifest.json'), JSON.stringify(manifest));
  const endpoint = `${item.base}/api/native/showcase/${item.project.id}/guides`;
  const anonymous = await fetch(endpoint);
  expect(anonymous.status).toBe(200);
  const publicResult = await anonymous.json();
  expect(publicResult.projectId).toBe(item.project.id);
  expect(publicResult.guides.map((guide) => guide.id)).toEqual(['introduction']);
  expect(publicResult.restrictedGuideIds).toEqual(['usage']);
  expect(JSON.stringify(publicResult)).toContain('PUBLIC-GUIDE-CANARY');
  expect(JSON.stringify(publicResult)).not.toContain('PROJECT-GUIDE-CANARY');
  expect(JSON.stringify(publicResult)).not.toContain('重要机密字段');
  const admin = item.store.login(item.admin.username, 'fixture-password');
  const authorized = await fetch(endpoint, { headers: { cookie: `preview_session=${admin.token}` } });
  expect((await authorized.json()).guides).toHaveLength(2);
  expect((await fetch(`${item.base}/api/native/showcase/nonexistent/guides`)).ok).toBe(false);
  expect(
    (await fetch(`${item.base}/api/native/showcase/${item.project.id}/graph-document?id=usage`)).status,
  ).toBe(404);
  for (const override of [
    { id: 'private-notes' },
    { path: '../private.md' },
    { path: 'guides/开发记录.md' },
    { access: undefined },
  ]) {
    expect(() =>
      validateContentManifest(
        { ...manifest, guides: [{ ...manifest.guides[0], ...override }] },
        NATIVE_MODULES,
      ),
    ).toThrow();
  }
  expect(() =>
    validateContentManifest(
      { ...manifest, guides: [manifest.guides[0], manifest.guides[0]] },
      NATIVE_MODULES,
    ),
  ).toThrow('重复');
});
test('project menu grants are atomic, discoverable, isolated and removed from every page reader', async () => {
  const item = await fixture({ server: true });
  const store = item.store;
  const user = store.createAccount(item.admin, {
    username: 'menu-reader',
    displayName: 'Menu reader',
    password: 'fixture-password',
    role: 'member',
  });
  store.changePassword(user, { currentPassword: 'fixture-password', password: 'changed-password' });
  const session = store.login(user.username, 'changed-password');
  const headers = { cookie: `preview_session=${session.token}` };
  const admin = store.login(item.admin.username, 'fixture-password');
  const writeHeaders = {
    cookie: `preview_session=${admin.token}`,
    origin: 'http://127.0.0.1:5191',
    'x-preview-csrf': admin.csrf,
    'content-type': 'application/json',
  };
  const url = item.base + `/api/native/projects/${item.project.id}/page-grants/${user.id}`;
  const restricted = { clientId: 'operation', pageKey: 'item-transfer' };
  expect(store.listProjects(session.user)).toEqual([]);
  expect(store.pageCatalog(session.user).map((page) => page.pageKey)).toEqual(['item-groups']);
  const granted = await fetch(url, {
    method: 'PUT',
    headers: writeHeaders,
    body: JSON.stringify({ revision: item.project.revision, pages: [restricted] }),
  });
  expect(granted.status).toBe(200);
  const revision = (await granted.json()).revision;
  expect(store.listProjects(session.user).map((project) => project.id)).toEqual(['project-one']);
  expect(store.getProject(session.user, item.project.id).clients[0].pages).toHaveLength(2);
  const other = store.createProject(item.admin, projectInput('project-two'));
  expect(() => store.pageAccess(session.user, other.id, 'operation', 'item-transfer')).toThrow('尚未获得');
  expect(
    (
      await fetch(url, {
        method: 'PUT',
        headers: writeHeaders,
        body: JSON.stringify({ revision: item.project.revision, pages: [] }),
      })
    ).status,
  ).toBe(409);
  expect(store.listPageGrants(item.admin, item.project.id)).toHaveLength(1);
  expect(
    (
      await fetch(url, {
        method: 'PUT',
        headers: writeHeaders,
        body: JSON.stringify({
          revision,
          pages: [restricted, { clientId: 'operation', pageKey: 'missing' }],
        }),
      })
    ).status,
  ).toBe(400);
  expect(store.listPageGrants(item.admin, item.project.id)).toHaveLength(1);
  expect(
    (
      await fetch(url, {
        method: 'PUT',
        headers: {
          ...headers,
          origin: 'http://127.0.0.1:5191',
          'x-preview-csrf': session.csrf,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ revision, pages: [] }),
      })
    ).status,
  ).toBe(403);
  expect(
    (
      await fetch(url, {
        method: 'PUT',
        headers: writeHeaders,
        body: JSON.stringify({ revision, pages: [] }),
      })
    ).status,
  ).toBe(200);
  expect(store.getProject(session.user, item.project.id).clients[0].pages.map((page) => page.key)).toEqual([
    'item-groups',
  ]);
  for (const suffix of ['', '/source', '/markdown'])
    expect(
      (
        await fetch(item.base + '/api/native/showcase/project-one/operation/item-transfer' + suffix, {
          headers,
        })
      ).status,
    ).toBe(403);
  expect(
    (
      await fetch(item.base + '/api/native/projects/project-one/document?path=requirements%2Ftransfer.md', {
        headers,
      })
    ).status,
  ).toBe(403);
  const catalog = await (
    await fetch(item.base + '/api/native/showcase?projectId=project-one', { headers })
  ).json();
  expect(catalog.pages.map((page) => page.pageKey)).toEqual(['item-groups']);
});
afterEach(async () => {
  for (const fixture of fixtures.splice(0)) {
    await fixture.client?.close();
    if (fixture.runtime) await fixture.runtime.close();
    else fixture.store?.close();
    if (
      path.dirname(fixture.root) !== tmpdir() ||
      !path.basename(fixture.root).startsWith('preview-context-test-')
    )
      throw new Error('Unsafe fixture path');
    await fs.rm(fixture.root, { recursive: true, force: true });
  }
});
const baseManifest = () => ({
  schemaVersion: 1,
  contentKey: 'test-content',
  moduleKey: 'fixture-module',
  title: '业务概况',
  overview: 'overview.md',
  requirements: [
    {
      id: 'group-rule',
      title: '车组功能',
      category: '车辆管理',
      status: 'confirmed',
      path: 'requirements/group.md',
      pages: [{ clientId: 'operation', pageKey: 'item-groups' }],
    },
    {
      id: 'transfer-rule',
      title: '重要调拨规则',
      category: '车辆管理',
      status: 'draft',
      path: 'requirements/transfer.md',
      pages: [{ clientId: 'operation', pageKey: 'item-transfer' }],
    },
  ],
  assets: [],
});
const projectInput = (id = 'project-one') => ({
  id,
  name: id,
  moduleKey: 'fixture-module',
  sourceId: 'published',
  contentKey: 'test-content',
  links: [],
  clients: [
    {
      id: 'operation',
      name: '营运端',
      icon: 'vehicle',
      layout: 'desktop',
      enabled: true,
      position: 0,
      defaultPage: 'item-groups',
      pages: [
        {
          key: 'item-groups',
          label: '车组管理',
          group: '车辆管理',
          visible: true,
          position: 0,
          access: 'public',
        },
        {
          key: 'item-transfer',
          label: '调拨管理',
          group: '车辆管理',
          visible: true,
          position: 1,
          access: 'restricted',
        },
      ],
    },
  ],
});
async function fixture({ server = false, now } = {}) {
  const root = await fs.mkdtemp(path.join(tmpdir(), 'preview-context-test-'));
  const contentRoot = path.join(root, 'project-content'),
    packageRoot = path.join(contentRoot, 'test-content');
  await fs.mkdir(path.join(packageRoot, 'requirements'), { recursive: true });
  await fs.writeFile(path.join(packageRoot, 'manifest.json'), JSON.stringify(baseManifest()));
  await fs.writeFile(path.join(packageRoot, 'overview.md'), '# 业务概况\n本项目仅演示业务功能。');
  await fs.writeFile(path.join(packageRoot, 'requirements/group.md'), '# 车组功能\n品牌和型号必填。');
  await fs.writeFile(
    path.join(packageRoot, 'requirements/transfer.md'),
    '# 重要调拨规则\n重要机密字段用于授权测试。',
  );
  const sourceRoot = path.join(root, 'source');
  const sourceDirectory = path.join(sourceRoot, 'apps/web/src/project-modules/fixture/item-groups');
  await fs.mkdir(sourceDirectory, { recursive: true });
  await fs.writeFile(
    path.join(sourceDirectory, 'GroupsPage.tsx'),
    'export default function Page(){return "registered-source"}',
  );
  const options = {
    dataDirectory: path.join(root, 'data'),
    moduleCatalog: NATIVE_MODULES,
    documentSources: ['published'],
    ...(now ? { now } : {}),
  };
  const item = { root, contentRoot, packageRoot, sourceRoot };
  fixtures.push(item);
  if (server) {
    item.runtime = createNativeServer({
      dataDirectory: options.dataDirectory,
      sources: {},
      contentRoot,
      pageSourceRoot: sourceRoot,
      moduleCatalog: NATIVE_MODULES,
      publicOrigin: 'http://127.0.0.1:5191',
      storeOptions: now ? { now } : {},
    });
    await new Promise((resolve) => item.runtime.server.listen(0, '127.0.0.1', resolve));
    item.store = item.runtime.store;
    item.base = `http://127.0.0.1:${item.runtime.server.address().port}`;
  } else item.store = createNativeStore(options);
  item.admin = item.store.bootstrap({
    username: 'fixture-admin',
    displayName: '管理员',
    password: 'fixture-password',
  });
  item.project = item.store.createProject(item.admin, projectInput());
  return item;
}
test('business packages reject undeclared/internal files, manifest extras and escaping links', async () => {
  const item = await fixture();
  const valid = await loadContentPackage(item.contentRoot, 'test-content', NATIVE_MODULES);
  expect(
    queryBusinessContext(valid, item.project, 'search_requirements', { query: '品牌' }).items[0].documentId,
  ).toBe('group-rule');
  expect(() =>
    validateContentManifest({ ...baseManifest(), developmentNotes: 'private' }, NATIVE_MODULES),
  ).toThrow('未声明字段');
  const duplicate = baseManifest();
  duplicate.requirements.push({ ...duplicate.requirements[0] });
  expect(() => validateContentManifest(duplicate, NATIVE_MODULES)).toThrow('重复');
  await fs.writeFile(path.join(item.packageRoot, '开发记录.md'), 'INTERNAL-CANARY');
  await expect(loadContentPackage(item.contentRoot, 'test-content', NATIVE_MODULES)).rejects.toThrow(
    '内部文件',
  );
  await fs.unlink(path.join(item.packageRoot, '开发记录.md'));
  await fs.writeFile(
    path.join(item.packageRoot, 'requirements/group.md'),
    '[内部资料](../../docs/secret.md)',
  );
  await expect(loadContentPackage(item.contentRoot, 'test-content', NATIVE_MODULES)).rejects.toThrow(
    '未发布',
  );
});
test('authored page summaries and full requirements share their document access boundary', async () => {
  const item = await fixture({ server: true });
  const manifest = baseManifest();
  manifest.requirements[0].summary = 'requirements/group-summary.md';
  manifest.requirements[1].summary = 'requirements/transfer-summary.md';
  await fs.writeFile(path.join(item.packageRoot, 'manifest.json'), JSON.stringify(manifest));
  await fs.writeFile(
    path.join(item.packageRoot, 'requirements/group-summary.md'),
    '品牌与型号必填；切换载具清除无效品牌。',
  );
  await fs.writeFile(path.join(item.packageRoot, 'requirements/transfer-summary.md'), '仅空闲车辆可以调拨。');
  const route = '/api/native/showcase/project-one/operation/item-groups';
  const detail = await (await fetch(item.base + route)).json();
  expect(detail.summaryMarkdown).toContain('清除无效品牌');
  expect(detail.markdown).toBe('# 车组功能\n品牌和型号必填。');
  expect(detail.summaryPath).toBe('requirements/group-summary.md');
  const publicDocument = await fetch(item.base + route + '/document?path=requirements/group.md');
  expect(publicDocument.status).toBe(200);
  expect((await publicDocument.json()).markdown).toBe(detail.markdown);
  expect((await fetch(item.base + route + '/document?path=requirements/transfer.md')).status).toBe(403);
  expect((await fetch(item.base + '/api/native/showcase/project-one/operation/item-transfer')).status).toBe(
    401,
  );
  const snapshot = await loadContentPackage(item.contentRoot, 'test-content', NATIVE_MODULES);
  const context = queryBusinessContext(snapshot, item.project, 'get_page_context', {
    clientId: 'operation',
    pageKey: 'item-groups',
  });
  expect(context.summaries).toEqual([{ documentId: 'group-rule', markdown: detail.summaryMarkdown }]);
  const invalid = structuredClone(manifest);
  invalid.requirements[0].summary = 'requirements/../AGENTS.md';
  expect(() => validateContentManifest(invalid, NATIVE_MODULES)).toThrow();
  invalid.requirements[0].summary = invalid.requirements[1].path;
  expect(() => validateContentManifest(invalid, NATIVE_MODULES)).toThrow('重复');
});
test('public preview is anonymous; restricted preview/source/PRD need an explicit account grant', async () => {
  const item = await fixture({ server: true });
  const publicRoute = '/api/native/showcase/project-one/operation/item-groups';
  const privateRoute = '/api/native/showcase/project-one/operation/item-transfer';
  const preview = await fetch(item.base + publicRoute);
  expect(preview.status).toBe(200);
  expect((await preview.json()).entry).toBe('/src/project-modules/fixture/item-groups/GroupsPage.tsx');
  expect((await fetch(item.base + publicRoute + '/source')).status).toBe(200);
  for (const suffix of ['', '/source', '/markdown'])
    expect((await fetch(item.base + privateRoute + suffix)).status).toBe(401);
  const user = item.store.createAccount(item.admin, {
    username: 'fixture-member',
    displayName: '成员',
    password: 'fixture-password',
    role: 'member',
  });
  item.store.changePassword(user, { currentPassword: 'fixture-password', password: 'changed-password' });
  const login = item.store.login(user.username, 'changed-password');
  const headers = { cookie: `preview_session=${login.token}` };
  expect((await fetch(item.base + privateRoute, { headers })).status).toBe(403);
  item.store.setPageGrant(item.admin, item.project.id, 'operation', 'item-transfer', user.id, true);
  expect((await fetch(item.base + privateRoute + '/markdown', { headers })).status).toBe(200);
  item.store.setPageGrant(item.admin, item.project.id, 'operation', 'item-transfer', user.id, false);
  expect((await fetch(item.base + privateRoute + '/markdown', { headers })).status).toBe(403);
  expect((await fetch(item.base + '/page-source/fixture-module/item-transfer.tsx')).status).toBe(404);
  expect(JSON.stringify(await (await fetch(item.base + '/api/native/showcase')).json())).not.toContain(
    '重要机密',
  );
});
test('the front-end catalog used by the demo excludes hidden, disabled and archived pages', async () => {
  const item = await fixture({ server: true });
  const session = item.store.login(item.admin.username, 'fixture-password');
  const headers = { cookie: `preview_session=${session.token}` };
  const route = item.base + '/api/native/showcase?projectId=project-one';
  const read = async () => (await (await fetch(route, { headers })).json()).pages.map((page) => page.pageKey);
  expect(await read()).toEqual(['item-groups', 'item-transfer']);
  let project = item.store.getProject(item.admin, item.project.id);
  project.clients[0].pages[1].visible = false;
  project = item.store.updateProject(item.admin, project.id, project);
  expect(await read()).toEqual(['item-groups']);
  expect(
    (await fetch(item.base + '/api/native/showcase/project-one/operation/item-transfer', { headers })).status,
  ).toBe(404);
  project.clients[0].enabled = false;
  project = item.store.updateProject(item.admin, project.id, project);
  expect(await read()).toEqual([]);
  project.clients[0].enabled = true;
  project.clients[0].pages[1].visible = true;
  project = item.store.updateProject(item.admin, project.id, project);
  expect(await read()).toEqual(['item-groups', 'item-transfer']);
  item.store.updateProject(item.admin, project.id, { ...project, archived: true });
  expect(await read()).toEqual([]);
});
test('project credentials are durable, scoped, revocable and invalidated by issuer changes', async () => {
  let at = 10000;
  const item = await fixture({ now: () => at });
  const issued = item.store.issueContextToken(item.admin, item.project.id, {
    label: 'fixture-token',
    days: 1,
  });
  expect(item.store.authenticateContextToken(issued.secret).project.id).toBe(item.project.id);
  expect(JSON.stringify(item.store.listContextTokens(item.admin, item.project.id))).not.toContain(
    issued.secret,
  );
  const snapshot = await loadContentPackage(item.contentRoot, 'test-content', NATIVE_MODULES);
  expect(() =>
    queryBusinessContext(snapshot, item.project, 'get_project_overview', { projectId: 'other-project' }),
  ).toThrow('无权访问');
  expect(() =>
    queryBusinessContext(snapshot, item.project, 'read_requirement', { id: '../../docs/private' }),
  ).toThrow('未发布');
  expect(() =>
    queryBusinessContext(snapshot, item.project, 'get_project_overview', { contentRevision: 'stale' }),
  ).toThrow('版本已更新');
  at += 86400001;
  expect(() => item.store.authenticateContextToken(issued.secret)).toThrow('失效');
  const next = item.store.issueContextToken(item.admin, item.project.id, { label: 'next-token' });
  item.store.revokeContextToken(item.admin, next.id);
  expect(() => item.store.authenticateContextToken(next.secret)).toThrow('失效');
  const last = item.store.issueContextToken(item.admin, item.project.id, { label: 'last-token' });
  item.store.updateAccount(item.admin, item.admin.id, {
    revision: item.admin.revision,
    displayName: '修改名称',
  });
  expect(() => item.store.authenticateContextToken(last.secret)).toThrow('失效');
});
test('standard Streamable HTTP MCP client reads the same business snapshot and loses access on revoke', async () => {
  const item = await fixture({ server: true });
  const issued = item.store.issueContextToken(item.admin, item.project.id, { label: 'mcp-fixture' });
  expect((await fetch(item.base + '/api/project-context/project-one/overview')).status).toBe(401);
  const headers = { Authorization: `Bearer ${issued.secret}` };
  expect((await fetch(item.base + '/api/project-context/other-project/overview', { headers })).status).toBe(
    404,
  );
  const http = await (
    await fetch(item.base + '/api/project-context/project-one/overview', { headers })
  ).json();
  item.client = new Client({ name: 'preview-test', version: '1.0.0' });
  await item.client.connect(
    new StreamableHTTPClientTransport(new URL(item.base + '/api/project-context/mcp'), {
      requestInit: { headers },
    }),
  );
  const list = await item.client.listTools();
  expect(list.tools).toHaveLength(14);
  const read = await item.client.callTool({ name: 'get_project_overview', arguments: {} });
  expect(JSON.parse(read.content[0].text).contentRevision).toBe(http.contentRevision);
  const doc = await item.client.callTool({ name: 'read_requirement', arguments: { id: 'group-rule' } });
  expect(JSON.parse(doc.content[0].text).markdown).toContain('品牌和型号必填');
  const invalid = await item.client.callTool({
    name: 'get_project_overview',
    arguments: { projectId: 'other-project' },
  });
  expect(invalid.isError).toBe(true);
  item.store.revokeContextToken(item.admin, issued.id);
  await expect(item.client.callTool({ name: 'list_requirements', arguments: {} })).rejects.toThrow();
});
test('page and business-document release versions switch atomically and reject corrupted documents', async () => {
  const item = await fixture();
  const buildRoot = path.join(item.root, 'build'),
    destination = path.join(item.root, 'releases');
  await fs.mkdir(path.join(buildRoot, 'assets'), { recursive: true });
  await fs.mkdir(destination);
  await fs.writeFile(path.join(buildRoot, 'index.html'), 'version-one');
  await fs.writeFile(path.join(buildRoot, 'assets/app.js'), 'export const version=1;');
  const options = {
    buildRoot,
    destination,
    contentRoot: item.contentRoot,
    commit: 'a'.repeat(40),
    uiCommit: 'b'.repeat(40),
  };
  const first = await packageRelease(options);
  await activateRelease({ releaseRoot: destination, candidate: first.release, sequence: 1 });
  await fs.writeFile(path.join(item.packageRoot, 'requirements/group.md'), '# 车组功能\n新业务资料版本');
  const second = await packageRelease(options);
  expect(second.manifest.releaseId).not.toBe(first.manifest.releaseId);
  await activateRelease({ releaseRoot: destination, candidate: second.release, sequence: 2 });
  expect(JSON.parse(await fs.readFile(path.join(destination, 'current.json'), 'utf8')).releaseId).toBe(
    second.manifest.releaseId,
  );
  await activateRelease({ releaseRoot: destination, candidate: first.release, sequence: 3, rollback: true });
  expect(item.store.listProjects(item.admin)).toHaveLength(1);
  await fs.writeFile(
    path.join(second.release, 'project-content/test-content/requirements/group.md'),
    'corrupted',
  );
  await expect(verifyRelease(second.release)).rejects.toThrow('散列不一致');
  await expect(
    activateRelease({ releaseRoot: destination, candidate: first.release, sequence: 1 }),
  ).rejects.toThrow('旧发布');
});

test('page-management closes editor rebinding and sorting regressions', async () => {
  const item = await fixture();
  const user = item.store.createAccount(item.admin, {
    username: 'route-editor',
    displayName: 'Editor',
    password: 'fixture-password',
    role: 'member',
  });
  item.store.changePassword(user, { currentPassword: 'fixture-password', password: 'changed-password' });
  const editor = item.store.login(user.username, 'changed-password').user;
  let project = item.store.setMember(item.admin, item.project.id, user.id, {
    role: 'editor',
    revision: item.project.revision,
  });
  const swapped = structuredClone(project.clients);
  swapped[0].pages[0].key = 'item-transfer';
  swapped[0].pages[1].key = 'item-groups';
  expect(() =>
    item.store.updateProject(editor, project.id, { revision: project.revision, clients: swapped }),
  ).toThrow('公开范围');
  const ordered = structuredClone(project.clients);
  ordered[0].pages[0].position = 20;
  ordered[0].pages[1].position = 1;
  project = item.store.updateProject(editor, project.id, { revision: project.revision, clients: ordered });
  expect(item.store.pageCatalog(item.admin).map((p) => p.pageKey)).toEqual(['item-transfer', 'item-groups']);
  const single = structuredClone(project.clients);
  single[0].pages = single[0].pages.filter((p) => p.key === 'item-groups');
  project = item.store.updateProject(item.admin, project.id, { revision: project.revision, clients: single });
  expect(() =>
    item.store.updateProject(editor, project.id, { revision: project.revision, clients: ordered }),
  ).not.toThrow();
});

test('project documents cannot bypass a restricted page and revocation applies to both readers', async () => {
  const item = await fixture({ server: true });
  const user = item.store.createAccount(item.admin, {
    username: 'doc-viewer',
    displayName: 'Viewer',
    password: 'fixture-password',
    role: 'member',
  });
  item.store.changePassword(user, { currentPassword: 'fixture-password', password: 'changed-password' });
  const login = item.store.login(user.username, 'changed-password');
  item.store.setMember(item.admin, item.project.id, user.id, {
    role: 'viewer',
    revision: item.project.revision,
  });
  const headers = { cookie: `preview_session=${login.token}` };
  const route = '/api/native/projects/project-one/document?path=requirements%2Ftransfer.md';
  expect((await fetch(item.base + route, { headers })).status).toBe(403);
  const listing = await (
    await fetch(item.base + '/api/native/projects/project-one/documents', { headers })
  ).json();
  expect(listing.some((d) => d.path === 'requirements/transfer.md')).toBe(false);
  item.store.setPageGrant(item.admin, item.project.id, 'operation', 'item-transfer', user.id, true);
  expect((await fetch(item.base + route, { headers })).status).toBe(200);
  item.store.setPageGrant(item.admin, item.project.id, 'operation', 'item-transfer', user.id, false);
  expect((await fetch(item.base + route, { headers })).status).toBe(403);
});

test('explicit PRD overrides and clearing are shared by web and AI without declassifying the source', async () => {
  const item = await fixture({ server: true });
  const login = item.store.login(item.admin.username, 'fixture-password');
  const headers = { cookie: `preview_session=${login.token}` };
  let project = item.store.updateProject(item.admin, item.project.id, {
    revision: item.project.revision,
    links: [
      { clientId: 'operation', pageKey: 'item-groups', documentPath: 'requirements/group.md', anchor: '' },
      {
        clientId: 'operation',
        pageKey: 'item-groups',
        documentPath: 'requirements/transfer.md',
        anchor: '',
      },
    ],
  });
  const url = item.base + '/api/native/showcase/project-one/operation/item-groups';
  const detail = await (await fetch(url, { headers })).json();
  expect(detail.documents).toHaveLength(2);
  expect((await fetch(url)).status).toBe(403);
  const snapshot = await loadContentPackage(item.contentRoot, 'test-content', NATIVE_MODULES);
  expect(
    queryBusinessContext(snapshot, project, 'get_page_context', {
      clientId: 'operation',
      pageKey: 'item-groups',
    }).requirements,
  ).toHaveLength(2);
  project = item.store.updateProject(item.admin, project.id, {
    revision: project.revision,
    links: [{ clientId: 'operation', pageKey: 'item-groups', documentPath: '', anchor: '' }],
  });
  expect((await (await fetch(url, { headers })).json()).documents).toHaveLength(0);
  expect(
    queryBusinessContext(snapshot, project, 'get_page_context', {
      clientId: 'operation',
      pageKey: 'item-groups',
    }).requirements,
  ).toHaveLength(0);
  expect((await (await fetch(item.base + '/api/native/showcase')).json()).pages).toEqual([]);
});

test('page management lifecycle uses persistent identities, drops removed grants, and rejects stale saves', async () => {
  const item = await fixture({ server: true });
  const login = item.store.login(item.admin.username, 'fixture-password');
  const headers = { cookie: `preview_session=${login.token}` };
  const path = '/api/native/projects/project-one/page-management';
  const management = await (await fetch(item.base + path, { headers })).json();
  expect(management.pages.find((p) => p.pageKey === 'item-groups').documents[0].path).toBe(
    'requirements/group.md',
  );
  const context = await (
    await fetch(
      item.base + '/api/native/projects/project-one/page-context?clientId=operation&pageKey=item-groups',
      { headers },
    )
  ).json();
  expect(context.links[0].documentPath).toBe('requirements/group.md');
  const user = item.store.createAccount(item.admin, {
    username: 'lifecycle-viewer',
    displayName: 'Viewer',
    password: 'fixture-password',
    role: 'member',
  });
  item.store.changePassword(user, { currentPassword: 'fixture-password', password: 'changed-password' });
  item.store.setPageGrant(item.admin, item.project.id, 'operation', 'item-transfer', user.id, true);
  let project = item.store.getProject(item.admin, item.project.id);
  const clients = structuredClone(project.clients);
  clients[0].pages = clients[0].pages.filter((p) => p.key !== 'item-transfer');
  const saved = item.store.updateProject(item.admin, project.id, { revision: project.revision, clients });
  expect(item.store.listPageGrants(item.admin, project.id)).toHaveLength(0);
  expect(() =>
    item.store.updateProject(item.admin, project.id, {
      revision: project.revision,
      clients: project.clients,
    }),
  ).toThrow('重新读取');
  item.store.updateProject(item.admin, project.id, { revision: saved.revision, clients: project.clients });
  const viewer = item.store.login(user.username, 'changed-password').user;
  expect(() => item.store.pageAccess(viewer, project.id, 'operation', 'item-transfer')).toThrow('授权');
});
