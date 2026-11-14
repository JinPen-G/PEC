// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  validateProjectRegistration,
  checkProjectRegistration,
  saveProjectRegistration,
  validateProjectRegistrations,
} from '../../packages/project-core/src/platform/project-registration.js';
import { createNativeServer } from '../../packages/platform-server/src/server.js';
import { createNativeStore } from '../../packages/project-core/src/platform/store.js';
import { createProjectContent } from '../../packages/project-core/src/platform/project-content.js';
import { createAgentContext } from '../../packages/project-core/src/platform/agent-context.js';
import { migrateNativeDatabase } from '../../packages/project-core/src/platform/schema.js';
import { TEST_PROJECT, TEST_MODULES } from '../fixtures/project-catalog.js';
const registeredProjects = [TEST_PROJECT];

const fixtures = [];
test('screen display entries retain the same installable block contract', () => {
  const definition = structuredClone(TEST_PROJECT);
  expect(definition.module.pages.every((page) => page.kind === 'page')).toBe(true);
  expect(definition.registry.every((item) => item.kind === 'block')).toBe(true);
  expect(() => validateProjectRegistration(definition)).not.toThrow();
  definition.registry[0].kind = 'component';
  expect(() => validateProjectRegistration(definition)).toThrow('互相绑定');
});
test('homepage highlights are optional and limited to six unique editorial positions', () => {
  const definition = {
    schemaVersion: 1,
    module: {
      key: 'test-library',
      projectId: 'test-library',
      clientId: 'web',
      label: 'Library',
      surface: 'showcase',
      pages: [
        { key: 'first-page', label: 'First', source: 'FirstPage.tsx', featuredOrder: 1 },
        { key: 'second-page', label: 'Second', source: 'SecondPage.tsx', featuredOrder: 6 },
      ],
    },
    registry: [],
  };
  expect(() => validateProjectRegistration(definition)).not.toThrow();
  for (const featuredOrder of [0, 7, 1.5, '2', null, 1]) {
    const invalid = structuredClone(definition);
    invalid.module.pages[1].featuredOrder = featuredOrder;
    expect(() => validateProjectRegistration(invalid)).toThrow('精选序号');
  }
  delete definition.module.pages[1].featuredOrder;
  expect(() => validateProjectRegistration(definition)).not.toThrow();
});
test('a synthetic project uses the replaceable definition while keeping stable page identities', () => {
  const definition = TEST_PROJECT;
  expect(definition.module.key).toBe('fixture-module');
  expect(definition.module.pages.map((page) => [page.key, page.kind, page.registryItem])).toEqual(
    expect.arrayContaining([
      ['item-groups', 'page', 'fixture-groups'],
      ['item-transfer', 'page', 'fixture-transfer'],
    ]),
  );
  expect(definition.module.pages).toHaveLength(2);
  expect(definition.module.initialClients.map((client) => [client.id, client.pages.length])).toEqual([
    ['operation', 2],
  ]);
  expect(definition.registry).toHaveLength(2);
  expect(TEST_MODULES.filter((module) => module.key === 'fixture-module')).toHaveLength(1);
  const groups = TEST_MODULES.find((module) => module.key === 'fixture-module').pages.find(
    (page) => page.key === 'item-groups',
  );
  expect(groups.sourceFiles).toContain(
    'packages/component-library/src/fixture/blocks/groups/GroupsBlock.tsx',
  );
  expect(groups.sourceFiles).toContain('packages/component-library/src/fixture/lib/format.ts');
  expect(() => validateProjectRegistrations([...registeredProjects, structuredClone(definition)])).toThrow(
    '已登记',
  );
  expect(() => validateProjectRegistration({ ...definition, internalNotes: 'private' })).toThrow('未知字段');
});
afterEach(async () => {
  for (const item of fixtures.splice(0)) {
    if (item.client) await item.client.close();
    if (item.runtime) await item.runtime.close();
    if (path.dirname(item.root) !== tmpdir() || !path.basename(item.root).startsWith('preview-onboarding-'))
      throw new Error('Temporary root escaped');
    await fs.rm(item.root, { recursive: true, force: true });
  }
});
async function fixture({ withContent = true } = {}) {
  const root = await fs.mkdtemp(path.join(tmpdir(), 'preview-onboarding-'));
  const item = { root };
  fixtures.push(item);
  const definition = {
    schemaVersion: 1,
    module: {
      key: 'service-hub',
      projectId: 'service-hub',
      clientId: 'web',
      label: 'Service Hub',
      surface: 'showcase',
      ...(withContent ? { contentKey: 'service-hub' } : {}),
      pages: [
        {
          key: 'requests',
          label: 'Requests',
          source: 'RequestsPage.tsx',
          kind: 'block',
          registryItem: 'service-requests',
        },
      ],
      initialClients: [
        {
          id: 'web',
          name: 'Web',
          layout: 'desktop',
          enabled: true,
          position: 0,
          defaultPage: 'requests',
          pages: [
            {
              key: 'requests',
              label: 'Requests',
              group: 'Service',
              visible: true,
              access: 'restricted',
              position: 0,
            },
          ],
        },
      ],
    },
    registry: [
      {
        name: 'service-requests',
        title: 'Requests',
        description: 'Synthetic service requests',
        kind: 'block',
        moduleKey: 'service-hub',
        pageKey: 'requests',
        dependencies: [],
        registryDependencies: [],
        files: [
          {
            path: 'packages/component-library/src/service-hub/blocks/requests/RequestsBlock.tsx',
            target: '@components/preview/service-hub/blocks/requests/RequestsBlock.tsx',
          },
        ],
      },
    ],
  };
  const files = {
    'packages/platform-contracts/src/registered-projects.json': '[]',
    'apps/web/src/project-modules/service-hub/requests/RequestsPage.tsx':
      'export { default } from "@preview/library/service-hub/blocks/requests/RequestsBlock";',
    'packages/component-library/src/service-hub/blocks/requests/RequestsBlock.tsx':
      'export default function RequestsBlock() { return <section>Service request demo</section>; }',
    ...(withContent
      ? {
          'project-content/service-hub/manifest.json': JSON.stringify({
            schemaVersion: 1,
            contentKey: 'service-hub',
            moduleKey: 'service-hub',
            title: 'Service Hub',
            overview: 'overview.md',
            requirements: [
              {
                id: 'request-rule',
                title: 'Request rule',
                category: 'Service',
                status: 'confirmed',
                path: 'requirements/requests.md',
                pages: [{ clientId: 'web', pageKey: 'requests' }],
              },
            ],
            governance: [{ id: 'delivery', title: 'Delivery rules', path: 'governance/delivery.md' }],
            guides: [
              {
                id: 'changelog',
                title: 'Published changes',
                description: 'Project updates',
                path: 'guides/changelog.md',
                access: 'public',
              },
            ],
            assets: [],
            graph: 'graph.json',
          }),
          'project-content/service-hub/overview.md': '# Service Hub\nSynthetic onboarding fixture.',
          'project-content/service-hub/requirements/requests.md': '# Requests\nEach request needs an owner.',
          'project-content/service-hub/governance/delivery.md':
            '# Delivery\nRead requirements before editing. Test before delivery.',
          'project-content/service-hub/guides/changelog.md':
            '# Published changes\nRequest ownership now follows the published requirement.',
          'project-content/service-hub/graph.json': JSON.stringify({
            schemaVersion: 1,
            topics: [],
            nodes: [],
            edges: [],
          }),
        }
      : {}),
  };
  for (const [relative, source] of Object.entries(files)) {
    const file = path.join(root, relative);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, source);
  }
  item.definition = validateProjectRegistration(definition);
  item.modules = [
    {
      ...definition.module,
      pages: definition.module.pages.map((page) => ({
        ...page,
        sourceFiles: definition.registry[0].files.map((file) => file.path),
      })),
    },
  ];
  item.runtime = createNativeServer({
    dataDirectory: path.join(root, 'data'),
    contentRoot: path.join(root, 'project-content'),
    pageSourceRoot: root,
    moduleCatalog: item.modules,
    componentRegistry: definition.registry,
    publicOrigin: 'http://127.0.0.1:5191',
  });
  await new Promise((resolve) => item.runtime.server.listen(0, '127.0.0.1', resolve));
  item.base = `http://127.0.0.1:${item.runtime.server.address().port}`;
  item.store = item.runtime.store;
  item.admin = item.store.bootstrap({
    username: 'fixture-admin',
    displayName: 'Fixture administrator',
    password: 'fixture-password',
  });
  item.project = item.store.createProject(item.admin, { id: 'service-hub', name: 'Service Hub' });
  return item;
}
async function connect(item, scopes) {
  const issued = item.store.issueContextToken(item.admin, item.project.id, { label: 'integration', scopes });
  item.client = new Client({ name: 'onboarding-test', version: '1.0.0' });
  await item.client.connect(
    new StreamableHTTPClientTransport(new URL(`${item.base}/api/project-context/mcp`), {
      requestInit: { headers: { authorization: `Bearer ${issued.secret}` } },
    }),
  );
  return issued;
}
test('one project manifest validates new React source, content, initial menus and component bindings without editing framework code', async () => {
  const item = await fixture();
  const report = await checkProjectRegistration(
    item.root,
    item.definition,
    item.modules,
    item.definition.registry,
  );
  expect(report).toMatchObject({ projectId: 'service-hub', pages: 1, components: 1 });
  expect(item.project.clients[0].pages[0]).toMatchObject({ visible: true, access: 'restricted' });
  expect(item.project.contentKey).toBe('service-hub');
  const session = item.store.login('fixture-admin', 'fixture-password');
  const headers = { cookie: `preview_session=${session.token}` };
  const detail = await fetch(`${item.base}/api/native/showcase/service-hub/web/requests`, { headers });
  expect(detail.status).toBe(200);
  expect((await detail.json()).markdown).toContain('needs an owner');
  const readiness = await fetch(`${item.base}/api/native/projects/service-hub/readiness`, { headers });
  expect(readiness.status).toBe(200);
  expect(await readiness.json()).toMatchObject({ registeredPages: 1, visiblePages: 1, issues: [] });
  await saveProjectRegistration(item.root, item.definition, []);
  await expect(saveProjectRegistration(item.root, item.definition, [])).rejects.toThrow('已变更');
  const registered = JSON.parse(
    await fs.readFile(
      path.join(item.root, 'packages/platform-contracts/src/registered-projects.local.json'),
      'utf8',
    ),
  );
  expect(registered).toEqual([item.definition]);
  const updated = { ...item.definition, module: { ...item.definition.module, label: 'Updated project' } };
  await saveProjectRegistration(item.root, updated, registered, { replace: true });
  expect(
    JSON.parse(
      await fs.readFile(
        path.join(item.root, 'packages/platform-contracts/src/registered-projects.local.json'),
        'utf8',
      ),
    )[0].module.label,
  ).toBe('Updated project');
  expect(
    JSON.parse(
      await fs.readFile(
        path.join(item.root, 'packages/platform-contracts/src/registered-projects.json'),
        'utf8',
      ),
    ),
  ).toEqual([]);
  expect(() => validateProjectRegistration(item.definition, item.modules)).toThrow('已登记');
});
test('onboarding rejects missing entrypoints, missing PRD and ambiguous publication permissions', async () => {
  const item = await fixture();
  const bad = structuredClone(item.definition);
  delete bad.module.initialClients[0].pages[0].access;
  expect(() => validateProjectRegistration(bad)).toThrow('访问范围');
  await fs.unlink(path.join(item.root, 'apps/web/src/project-modules/service-hub/requests/RequestsPage.tsx'));
  await expect(
    checkProjectRegistration(item.root, item.definition, item.modules, item.definition.registry),
  ).rejects.toThrow('缺少页面');
});
test('a standard MCP client reads imported PRD, governance, component metadata and all source pages', async () => {
  const item = await fixture();
  const issued = await connect(item, ['business:read', 'governance:read', 'components:read']);
  const tools = await item.client.listTools();
  expect(tools.tools).toHaveLength(19);
  const call = async (name, args = {}) => {
    const result = await item.client.callTool({ name, arguments: args });
    expect(result.isError).not.toBe(true);
    return result.structuredContent;
  };
  const instructions = item.client.getInstructions();
  expect(instructions).toContain('是否在你的工程中采用这套治理规范？');
  expect(instructions).toContain('不得把连接MCP、读取规则或用户沉默当成同意');
  expect(instructions).toContain('不因重新连接重复询问');
  const context = await call('get_project_context');
  expect(context).toMatchObject({
    requirements: { count: 1 },
    requirementsAuthority: {
      source: 'target-project-confirmed-requirements',
      localRequirementDocument: 'optional',
    },
    updates: {
      availability: 'ready',
      readTool: 'read_project_updates',
      contentRevision: context.contentRevision,
    },
    governance: {
      count: 2,
      adoption: {
        mode: 'explain-and-ask',
        decisionOwner: 'current-user',
        decisionStorage: 'client',
        question: '是否在你的工程中采用这套治理规范？',
        contentRevision: context.contentRevision,
      },
    },
    components: { count: 1 },
  });
  expect(context.governance.adoption).not.toHaveProperty('adopted');
  expect(context.governance.adoption.selfCheck.statuses).toContain('无法核实');
  expect(context.governance.adoption.ifDeclined).toContain('不把采用治理作为读取条件');
  const update = await call('read_project_updates', { limit: 12, contentRevision: context.contentRevision });
  const updateTail = await call('read_project_updates', {
    offset: update.nextOffset,
    contentRevision: update.contentRevision,
  });
  const updateSource = await fs.readFile(
    path.join(item.root, 'project-content/service-hub/guides/changelog.md'),
    'utf8',
  );
  expect(update.markdown + updateTail.markdown).toBe(updateSource);
  expect(update.revision).toBe(createHash('sha256').update(updateSource).digest('hex'));
  expect(updateTail.nextOffset).toBeNull();
  expect((await call('read_requirement', { id: 'request-rule' })).markdown).toContain('needs an owner');
  const rules = await call('list_governance_rules');
  expect(rules.items.map((item) => item.id)).toEqual(['engineering-governance', 'delivery']);
  const rule = await call('read_governance_rule', { id: 'delivery', limit: 10 });
  expect(context.governance.adoption.rules).toContainEqual({
    id: 'delivery',
    source: 'project',
    revision: rule.revision,
  });
  expect(rule.nextOffset).toBe(10);
  const tail = await call('read_governance_rule', {
    id: 'delivery',
    offset: 10,
    contentRevision: rule.contentRevision,
  });
  expect(rule.markdown + tail.markdown).toContain('Test before delivery');
  expect((await call('list_components')).items[0].name).toBe('service-requests');
  const component = await call('get_component', { name: 'service-requests' });
  const source = await call('read_component_file', {
    name: 'service-requests',
    file: component.files[0].target,
    registryRevision: component.registryRevision,
  });
  expect(source.source).toContain('RequestsBlock');
  const stale = await item.client.callTool({
    name: 'read_component_file',
    arguments: { name: 'service-requests', file: component.files[0].target, registryRevision: 'old' },
  });
  expect(stale.isError).toBe(true);
  const headers = { authorization: `Bearer ${issued.secret}` };
  const updatesHttp = await fetch(`${item.base}/api/project-context/service-hub/updates`, { headers });
  expect(updatesHttp.status).toBe(200);
  expect((await updatesHttp.json()).markdown).toBe(updateSource);
  expect((await fetch(`${item.base}/r/service-hub/service-requests.json`, { headers })).status).toBe(200);
  expect((await fetch(`${item.base}/r/other-project/service-requests.json`, { headers })).status).toBe(404);
  expect((await fetch(`${item.base}/r/service-hub/service-requests.json`)).status).toBe(403);
  item.store.revokeContextToken(item.admin, issued.id);
  expect((await fetch(`${item.base}/r/service-hub/service-requests.json`, { headers })).status).toBe(401);
  await expect(item.client.callTool({ name: 'get_project_context', arguments: {} })).rejects.toThrow();
});
test('legacy business credentials do not gain component or governance access', async () => {
  const item = await fixture();
  const issued = await connect(item, undefined);
  expect((await item.client.listTools()).tools).toHaveLength(14);
  const context = (await item.client.callTool({ name: 'get_project_context', arguments: {} }))
    .structuredContent;
  expect(context.governance).toBeNull();
  expect(JSON.stringify(context)).not.toContain('delivery');
  expect(JSON.stringify(context)).not.toContain('explain-and-ask');
  for (const name of ['list_components', 'list_governance_rules']) {
    expect((await item.client.callTool({ name, arguments: {} })).isError).toBe(true);
  }
  expect(
    (
      await fetch(`${item.base}/r/service-hub/service-requests.json`, {
        headers: { authorization: `Bearer ${issued.secret}` },
      })
    ).status,
  ).toBe(403);
  expect(() =>
    item.store.issueContextToken(item.admin, item.project.id, { label: 'bad', scopes: ['admin'] }),
  ).toThrow('范围');
});
test('component-only projects work without a PRD and lose source access when unpublished', async () => {
  const item = await fixture({ withContent: false });
  const issued = await connect(item, ['components:read']);
  expect((await item.client.listTools()).tools).toHaveLength(5);
  expect(
    (await item.client.callTool({ name: 'get_project_context', arguments: {} })).structuredContent,
  ).toMatchObject({ contentRevision: null, requirements: null, governance: null, components: { count: 1 } });
  const missingUpdates = await item.client.callTool({ name: 'read_project_updates', arguments: {} });
  expect(missingUpdates.isError).toBe(true);
  expect(JSON.stringify(missingUpdates)).toContain('CONTENT_NOT_FOUND');
  const login = item.store.login('fixture-admin', 'fixture-password');
  const issuedViaHttp = await fetch(`${item.base}/api/native/context-tokens`, {
    method: 'POST',
    headers: {
      cookie: `preview_session=${login.token}`,
      origin: 'http://127.0.0.1:5191',
      'x-preview-csrf': login.csrf,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ projectId: 'service-hub', label: 'library-only', scopes: ['components:read'] }),
  });
  expect(issuedViaHttp.status).toBe(201);
  let project = item.store.getProject(item.admin, item.project.id);
  project.clients[0].pages[0].visible = false;
  project.clients[0].defaultPage = '';
  item.store.updateProject(item.admin, project.id, project);
  expect(
    (await item.client.callTool({ name: 'list_components', arguments: {} })).structuredContent.items,
  ).toEqual([]);
  expect(
    (
      await fetch(`${item.base}/r/service-hub/service-requests.json`, {
        headers: { authorization: `Bearer ${issued.secret}` },
      })
    ).status,
  ).toBe(403);
});
test('governance invitations version platform rules and explicitly published supplemental rules', async () => {
  const item = await fixture();
  await connect(item, ['governance:read']);
  const context = async () =>
    (await item.client.callTool({ name: 'get_project_context', arguments: {} })).structuredContent;
  const first = await context();
  expect(first.governance.adoption.rules).toHaveLength(2);
  const rulePath = path.join(item.root, 'project-content/service-hub/governance/delivery.md');
  const revisedRule = '# Delivery\nFirst explain the method, then ask the current user whether to adopt it.';
  await fs.writeFile(rulePath, revisedRule);
  const changed = await context();
  expect(changed.contentRevision).not.toBe(first.contentRevision);
  expect(changed.governance.adoption.rules[1].revision).toBe(
    createHash('sha256').update(revisedRule).digest('hex'),
  );
  expect(
    (
      await item.client.callTool({
        name: 'read_governance_rule',
        arguments: { id: 'delivery', contentRevision: first.contentRevision },
      })
    ).isError,
  ).toBe(true);
  expect(
    (
      await item.client.callTool({
        name: 'get_project_context',
        arguments: { projectId: 'other-project' },
      })
    ).isError,
  ).toBe(true);

  await fs.unlink(rulePath);
  const broken = await item.client.callTool({ name: 'get_project_context', arguments: {} });
  expect(broken.isError).toBe(true);
  const manifestPath = path.join(item.root, 'project-content/service-hub/manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  manifest.governance = [];
  await fs.writeFile(manifestPath, JSON.stringify(manifest));
  expect((await context()).governance).toMatchObject({ configured: true, count: 1 });
  expect(
    (
      await item.client.callTool({ name: 'list_governance_rules', arguments: {} })
    ).structuredContent.items.map((rule) => rule.id),
  ).toEqual(['engineering-governance']);
});
test('governance and platform updates work without a PRD, component or content package', async () => {
  const item = await fixture({ withContent: false });
  await connect(item, ['governance:read']);
  const context = (await item.client.callTool({ name: 'get_project_context', arguments: {} }))
    .structuredContent;
  expect(context).toMatchObject({
    governance: { configured: true, count: 1, adoption: { mode: 'explain-and-ask' } },
    requirements: null,
    components: null,
  });
  const rules = (await item.client.callTool({ name: 'list_governance_rules', arguments: {} }))
    .structuredContent;
  const first = (
    await item.client.callTool({
      name: 'read_governance_rule',
      arguments: { id: 'engineering-governance', limit: 50, governanceRevision: rules.governanceRevision },
    })
  ).structuredContent;
  const rest = (
    await item.client.callTool({
      name: 'read_governance_rule',
      arguments: {
        id: 'engineering-governance',
        offset: first.nextOffset,
        governanceRevision: rules.governanceRevision,
      },
    })
  ).structuredContent;
  const { PLATFORM_ENGINEERING_GOVERNANCE } =
    await import('../../packages/project-shared/src/platform-governance.js');
  expect(first.markdown + rest.markdown).toBe(PLATFORM_ENGINEERING_GOVERNANCE);
  expect(first.source).toBe('platform');
  expect(
    (
      await item.client.callTool({
        name: 'read_governance_rule',
        arguments: { id: 'engineering-governance', governanceRevision: 'old' },
      })
    ).isError,
  ).toBe(true);
  const updates = (
    await item.client.callTool({ name: 'read_project_updates', arguments: { source: 'platform' } })
  ).structuredContent;
  const { PLATFORM_GUIDES } = await import('../../packages/project-shared/src/platform-docs.js');
  expect(updates.markdown).toBe(PLATFORM_GUIDES.find((guide) => guide.id === 'changelog').markdown);
  expect(updates.websiteUrl).toMatch(/#\/docs\/changelog$/);
  expect(
    (
      await item.client.callTool({
        name: 'read_project_updates',
        arguments: { source: 'platform', contentRevision: 'old' },
      })
    ).isError,
  ).toBe(true);
});
test('public platform AI documentation contains the same complete MCP rules below connection instructions', async () => {
  const { PLATFORM_ENGINEERING_GOVERNANCE } =
    await import('../../packages/project-shared/src/platform-governance.js');
  const { PLATFORM_GUIDES } = await import('../../packages/project-shared/src/platform-docs.js');
  const guide = PLATFORM_GUIDES.find((item) => item.id === 'ai').markdown;
  const displayed =
    /<!-- engineering-governance:start -->\s*([\s\S]*?)\s*<!-- engineering-governance:end -->/.exec(guide);
  expect(displayed?.[1]).toBe(PLATFORM_ENGINEERING_GOVERNANCE.trim());
  expect(guide.indexOf('## 连接 MCP 服务')).toBeLessThan(guide.indexOf('## 工程治理'));
  expect(guide).toMatch(/<details>\s*<summary>查看完整工程治理规范<\/summary>/);
  expect(PLATFORM_ENGINEERING_GOVERNANCE).toContain('订单管理-开发任务.md');
  expect(PLATFORM_ENGINEERING_GOVERNANCE).toContain('EXP-01');
  expect(PLATFORM_ENGINEERING_GOVERNANCE).toContain('是否在你的工程中采用这套治理规范？');
});

test('published updates enforce project scope, publication access, complete reads and snapshot versions', async () => {
  const item = await fixture();
  const issued = await connect(item, ['components:read', 'governance:read']);
  const call = (name, args = {}) => item.client.callTool({ name, arguments: args });
  const first = (await call('get_project_context')).structuredContent;
  expect((await call('read_project_updates', { contentRevision: first.contentRevision })).isError).not.toBe(
    true,
  );
  expect((await call('read_project_updates', { projectId: 'other-project' })).isError).toBe(true);
  const manifestPath = path.join(item.root, 'project-content/service-hub/manifest.json');
  const updatesPath = path.join(item.root, 'project-content/service-hub/guides/changelog.md');
  await fs.writeFile(updatesPath, '# New updates\nUpdated source of truth.');
  const stale = await call('read_project_updates', { contentRevision: first.contentRevision, offset: 12 });
  expect(stale.isError).toBe(true);
  expect(JSON.stringify(stale)).toContain('CONTENT_REVISION_CHANGED');
  const changed = (await call('get_project_context')).structuredContent;
  expect(changed.updates.revision).not.toBe(first.updates.revision);

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  manifest.guides[0].access = 'project';
  manifest.guides[0].title = 'Private update title';
  await fs.writeFile(manifestPath, JSON.stringify(manifest));
  const restricted = (await call('get_project_context')).structuredContent;
  expect(restricted.updates).toEqual({
    availability: 'restricted',
    readTool: 'read_project_updates',
    requiredScope: 'business:read',
  });
  expect(JSON.stringify(restricted)).not.toContain('Private update title');
  const denied = await call('read_project_updates');
  expect(denied.isError).toBe(true);
  expect(JSON.stringify(denied)).toContain('SCOPE_REQUIRED');
  const headers = { authorization: `Bearer ${issued.secret}` };
  expect((await fetch(`${item.base}/api/project-context/service-hub/updates`, { headers })).status).toBe(403);

  await item.client.close();
  const businessToken = await connect(item, ['business:read']);
  expect((await call('read_project_updates')).structuredContent.markdown).toContain(
    'Updated source of truth.',
  );
  manifest.guides = [];
  await fs.unlink(updatesPath);
  await fs.writeFile(manifestPath, JSON.stringify(manifest));
  expect((await call('get_project_context')).structuredContent.updates.availability).toBe('unconfigured');
  expect(JSON.stringify(await call('read_project_updates'))).toContain('CONTENT_NOT_FOUND');
  manifest.guides = [
    {
      id: 'changelog',
      title: 'Updates',
      description: 'Changes',
      path: 'guides/changelog.md',
      access: 'public',
    },
  ];
  await fs.writeFile(manifestPath, JSON.stringify(manifest));
  expect((await call('get_project_context')).isError).toBe(true);
  expect((await call('read_project_updates')).isError).toBe(true);
  item.store.revokeContextToken(item.admin, businessToken.id);
  await expect(call('read_project_updates')).rejects.toThrow();
});
test('governance paths cannot publish internal files and never enter ordinary PRD tools', async () => {
  const item = await fixture();
  const content = createProjectContent({
    contentRoot: path.join(item.root, 'project-content'),
    moduleCatalog: item.modules,
    pageSourceRoot: item.root,
  });
  const agent = createAgentContext({
    content,
    registry: item.definition.registry,
    pageSourceRoot: item.root,
    publicOrigin: item.base,
  });
  const identity = { project: item.project, scopes: ['governance:read'] };
  await expect(agent.query(identity, 'read_governance_rule', { id: '../../AGENTS.md' })).rejects.toThrow(
    '未发布',
  );
  const manifestFile = path.join(item.root, 'project-content/service-hub/manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestFile));
  manifest.governance[0].path = 'governance/AGENTS.md';
  await fs.writeFile(manifestFile, JSON.stringify(manifest));
  await expect(content.snapshot(item.project)).rejects.toThrow('不允许');
});
test('schema migration retains old tokens and defaults their scope to business only', async () => {
  const item = await fixture();
  const issued = item.store.issueContextToken(item.admin, item.project.id, { label: 'old' });
  const database = new DatabaseSync(path.join(item.root, 'data/platform.sqlite'));
  database.prepare('DELETE FROM context_token_scopes WHERE token_id=?').run(issued.id);
  database.exec('PRAGMA user_version=3');
  expect(migrateNativeDatabase(database)).toEqual({ from: 3, to: 4 });
  database.close();
  expect(item.store.authenticateContextToken(issued.secret).scopes).toEqual(['business:read']);
  const fresh = createNativeStore({
    dataDirectory: path.join(item.root, 'data'),
    moduleCatalog: item.modules,
    documentSources: ['none', 'published'],
  });
  expect(fresh.authenticateContextToken(issued.secret).scopes).toEqual(['business:read']);
  fresh.close();
});
