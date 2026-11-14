// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createNativeStore } from '../../packages/project-core/src/platform/store.js';
import { createNativeServer } from '../../packages/platform-server/src/server.js';
import { createNativeClient } from '../../packages/platform-client/src/client.js';
import { createNativeDocuments } from '../../packages/project-core/src/platform/documents.js';

const fixtures = [];
const fixtureModules = [
  { key: 'empty', pages: [{ key: 'canvas' }] },
  { key: 'rental-orders', pages: [{ key: 'orders' }] },
];
afterEach(async () => {
  for (const fixture of fixtures.splice(0)) {
    if (fixture.runtime) await fixture.runtime.close();
    else fixture.store?.close();
    if (
      path.dirname(fixture.directory) !== tmpdir() ||
      !path.basename(fixture.directory).startsWith('preview-native-test-')
    )
      throw new Error('Unsafe fixture path');
    await fs.rm(fixture.directory, { recursive: true, force: true });
  }
});
const password = 'fixture-password-12345';
const configuration = {
  clients: [
    {
      id: 'admin',
      name: '管理端',
      icon: 'layout',
      enabled: true,
      layout: 'desktop',
      position: 0,
      defaultPage: 'orders',
      pages: [{ key: 'orders', label: '订单', group: '业务', visible: true, position: 0 }],
    },
  ],
  links: [],
};
async function fixture(options = {}) {
  const directory = await fs.mkdtemp(path.join(tmpdir(), 'preview-native-test-'));
  const item = {
    directory,
    store: createNativeStore({ dataDirectory: directory, moduleCatalog: fixtureModules, ...options }),
  };
  fixtures.push(item);
  const admin = item.store.bootstrap({ username: 'admin-user', displayName: '管理员', password });
  return { ...item, admin, owner: item };
}
function member(store, admin, username) {
  const user = store.createAccount(admin, { username, displayName: username, password, role: 'member' });
  store.changePassword(user, { currentPassword: password, password: `${password}-changed` });
  return store.login(username, `${password}-changed`).user;
}
test('homepage selection metadata preserves menu permissions and does not rewrite projects', async () => {
  const { store, admin } = await fixture({
    moduleCatalog: [
      {
        key: 'demo-module',
        pages: [
          { key: 'public-page', featuredOrder: 2, kind: 'page' },
          { key: 'private-page', featuredOrder: 1, kind: 'component' },
          { key: 'hidden-page', featuredOrder: 3, kind: 'block' },
        ],
      },
    ],
  });
  const project = store.createProject(admin, {
    id: 'curated-project',
    name: 'Curated',
    moduleKey: 'demo-module',
    clients: [
      {
        ...configuration.clients[0],
        defaultPage: 'public-page',
        pages: [
          { key: 'public-page', label: 'Public', visible: true, position: 0, access: 'public' },
          { key: 'private-page', label: 'Private', visible: true, position: 1, access: 'restricted' },
          { key: 'hidden-page', label: 'Hidden', visible: false, position: 2, access: 'public' },
        ],
      },
    ],
  });
  expect(store.pageCatalog()).toMatchObject([{ pageKey: 'public-page', featuredOrder: 2, kind: 'page' }]);
  expect(store.pageCatalog()).toHaveLength(1);
  expect(store.pageCatalog(admin).map((page) => [page.pageKey, page.featuredOrder])).toEqual([
    ['public-page', 2],
    ['private-page', 1],
  ]);
  expect(store.pageCatalog(admin).map((page) => page.kind)).toEqual(['page', 'component']);
  expect(store.getProject(admin, project.id).revision).toBe(project.revision);
});
test('collaboration uses visible page grants and admits logged-in public viewers without backend membership', async () => {
  const { store, admin } = await fixture({
    moduleCatalog: [{ key: 'demo-module', pages: [{ key: 'public-page' }, { key: 'private-page' }] }],
  });
  const viewer = member(store, admin, 'public-viewer');
  const project = store.createProject(admin, {
    id: 'demo-project',
    name: 'Demo',
    moduleKey: 'demo-module',
    clients: [
      {
        ...configuration.clients[0],
        defaultPage: 'public-page',
        pages: [
          { key: 'public-page', label: 'Public', visible: true, position: 0, access: 'public' },
          { key: 'private-page', label: 'Private', visible: true, position: 1, access: 'restricted' },
        ],
      },
    ],
  });
  expect(() => store.getProject(viewer, project.id)).toThrow('无权访问');
  expect(store.getCollaborationProject(viewer, project.id).clients[0].pages.map((page) => page.key)).toEqual([
    'public-page',
  ]);
  expect(() => store.getCollaborationProject(null, project.id)).toThrow();
  store.setPageGrant(admin, project.id, 'admin', 'private-page', viewer.id, true);
  expect(store.getCollaborationProject(viewer, project.id).clients[0].pages).toHaveLength(2);
  store.setPageGrant(admin, project.id, 'admin', 'private-page', viewer.id, false);
  expect(store.getCollaborationProject(viewer, project.id).clients[0].pages.map((page) => page.key)).toEqual([
    'public-page',
  ]);
  store.updateProject(admin, project.id, {
    revision: store.getProject(admin, project.id).revision,
    archived: true,
  });
  expect(() => store.getCollaborationProject(viewer, project.id)).toThrow('无权访问');
});
test('basic projects need no source directory and attach only matching source declarations after restart', async () => {
  const { store, admin, owner, directory } = await fixture();
  const project = store.createProject(admin, { id: 'new-project', name: '新项目' });
  expect(project.sourceId).toBe('none');
  expect(project.clients[0].pages).toEqual([]);
  expect(project.moduleKey).toBe('empty');
  const other = store.createProject(admin, { id: 'other-project', name: '其他项目' });
  store.close();
  owner.store = createNativeStore({
    dataDirectory: directory,
    moduleCatalog: [
      { key: 'empty', pages: [{ key: 'canvas' }] },
      { key: 'new-project', pages: [{ key: 'home-page' }] },
    ],
  });
  expect(owner.store.synchronizeProjectSources().changed).toBe(1);
  expect(owner.store.getProject(admin, project.id).moduleKey).toBe('new-project');
  expect(owner.store.getProject(admin, project.id).clients[0].pages).toEqual([]);
  expect(owner.store.getProject(admin, other.id).moduleKey).toBe('empty');
  expect(owner.store.synchronizeProjectSources().changed).toBe(0);
});
test.each([
  [7, false],
  [8, true],
  [128, true],
  [129, false],
])('administrator initialization enforces the %i-character password boundary', async (length, allowed) => {
  const directory = await fs.mkdtemp(path.join(tmpdir(), 'preview-native-test-'));
  const store = createNativeStore({ dataDirectory: directory });
  fixtures.push({ directory, store });
  const input = { username: 'admin-user', displayName: '管理员', password: 'a'.repeat(length) };
  if (!allowed) {
    expect(() => store.bootstrap(input)).toThrow('密码需为8–128个字符');
    expect(store.initialized()).toBe(false);
    expect(() => store.login(input.username, input.password)).toThrow('账号或密码错误');
    return;
  }
  const admin = store.bootstrap(input);
  const session = store.login(input.username, input.password);
  expect(session.user.id).toBe(admin.id);
  expect(store.authenticate(session.token).user.role).toBe('admin');
});
test('creation, password change and administrator reset accept eight characters and reject seven', async () => {
  const { store, admin } = await fixture();
  const input = { username: 'short-password-user', displayName: '成员', role: 'member' };
  expect(() => store.createAccount(admin, { ...input, password: '1234567' })).toThrow('密码需为8–128个字符');
  const user = store.createAccount(admin, { ...input, password: '12345678' });
  const initial = store.login(user.username, '12345678');
  expect(() =>
    store.changePassword(initial.user, { currentPassword: '12345678', password: '7654321' }),
  ).toThrow('密码需为8–128个字符');
  expect(store.authenticate(initial.token).user.id).toBe(user.id);
  store.changePassword(initial.user, { currentPassword: '12345678', password: '87654321' });
  expect(store.authenticate(initial.token)).toBeNull();
  const changed = store.login(user.username, '87654321');
  expect(changed.user.mustChangePassword).toBe(false);
  expect(() =>
    store.updateAccount(admin, user.id, { revision: changed.user.revision, password: 'abcdefg' }),
  ).toThrow('密码需为8–128个字符');
  expect(store.authenticate(changed.token).user.id).toBe(user.id);
  store.updateAccount(admin, user.id, { revision: changed.user.revision, password: 'abcdefgh' });
  expect(store.authenticate(changed.token)).toBeNull();
  expect(store.login(user.username, 'abcdefgh').user.mustChangePassword).toBe(true);
});
test('credentials, session expiry, logout and durable restart do not accept browser-supplied roles', async () => {
  let at = 10000;
  const { store, admin, owner, directory } = await fixture({
    now: () => at,
    sessionLifetime: 5000,
    idleLifetime: 2000,
  });
  expect(() => store.login('admin-user', 'wrong')).toThrow('账号或密码错误');
  const session = store.login('admin-user', password);
  expect(store.authenticate(session.token).user.role).toBe('admin');
  expect(store.authenticate('invented')).toBeNull();
  store.close();
  owner.store = createNativeStore({
    dataDirectory: directory,
    now: () => at,
    sessionLifetime: 5000,
    idleLifetime: 2000,
  });
  expect(owner.store.authenticate(session.token).user.id).toBe(admin.id);
  at += 2001;
  expect(owner.store.authenticate(session.token)).toBeNull();
  const next = owner.store.login('admin-user', password);
  owner.store.logout(next.token);
  expect(owner.store.authenticate(next.token)).toBeNull();
});
test('unique accounts, password reset, disable and last-admin protection are durable constraints', async () => {
  const { store, admin } = await fixture();
  expect(() => store.bootstrap({ username: 'other-admin', displayName: 'A', password })).toThrow(
    '已经初始化',
  );
  expect(() =>
    store.createAccount(admin, { username: 'admin-user', displayName: 'A', password, role: 'member' }),
  ).toThrow('已存在');
  expect(() => store.updateAccount(admin, admin.id, { revision: 1, disabled: true })).toThrow(
    '最后一个管理员',
  );
  const user = member(store, admin, 'member-user');
  const session = store.login(user.username, `${password}-changed`);
  expect(() =>
    store.createAccount(
      { ...user, role: 'admin' },
      { username: 'forged-user', displayName: 'A', password, role: 'admin' },
    ),
  ).toThrow('管理员权限');
  store.updateAccount(admin, user.id, { revision: user.revision, password: `${password}-reset` });
  expect(store.authenticate(session.token)).toBeNull();
  const reset = store.login(user.username, `${password}-reset`);
  expect(reset.user.mustChangePassword).toBe(true);
  expect(() => store.listProjects(reset.user)).toThrow('修改初始密码');
  expect(JSON.stringify(store.listAccounts(admin))).not.toContain('password');
  expect(JSON.stringify(store.listAudit(admin))).not.toContain(password);
});

test('platform branding is revisioned and only administrators can change it', async () => {
  const { store, admin } = await fixture();
  const user = member(store, admin, 'branding-viewer');
  const first = store.getSettings(admin);
  const next = store.saveSettings(admin, { ...first, brandName: 'Preview Test', brandIcon: 'boxes' });
  expect(store.getSettings(user).brandName).toBe('Preview Test');
  expect(() => store.saveSettings(user, { ...next, brandName: 'forged' })).toThrow('管理员');
  expect(() => store.saveSettings(admin, { ...first, brandName: 'stale' })).toThrow('已变更');
});
test('project read/edit access, revoked membership and optimistic revisions are enforced by the store', async () => {
  const { store, admin } = await fixture();
  const viewer = member(store, admin, 'viewer-user'),
    editor = member(store, admin, 'editor-user');
  let first = store.createProject(admin, {
    id: 'project-a',
    name: 'A',
    moduleKey: 'rental-orders',
    ...configuration,
  });
  store.createProject(admin, { id: 'project-b', name: 'B' });
  first = store.setMember(admin, first.id, viewer.id, { role: 'viewer', revision: first.revision });
  first = store.setMember(admin, first.id, editor.id, { role: 'editor', revision: first.revision });
  expect(store.listProjects(viewer).map((project) => project.id)).toEqual(['project-a']);
  expect(() => store.getProject(viewer, 'project-b')).toThrow('无权访问');
  expect(() =>
    store.updateProject(viewer, first.id, { revision: first.revision, name: 'unauthorized' }),
  ).toThrow('编辑权限');
  const changed = store.updateProject(editor, first.id, { revision: first.revision, name: 'Edited' });
  expect(() => store.updateProject(admin, first.id, { revision: first.revision, name: 'Lost' })).toThrow(
    '已变更',
  );
  expect(() =>
    store.updateProject(editor, first.id, { revision: changed.revision, sourceId: 'sample' }),
  ).toThrow('管理员');
  store.setMember(admin, first.id, viewer.id, { role: null, revision: changed.revision });
  expect(() => store.getProject(viewer, first.id)).toThrow('无权访问');
});
test('concurrent last-admin writes and stale configuration cannot silently overwrite', async () => {
  const { store, admin, directory } = await fixture();
  const second = store.createAccount(admin, {
    username: 'second-admin',
    displayName: 'Second',
    role: 'admin',
    password,
  });
  store.changePassword(second, { currentPassword: password, password: `${password}-new` });
  const other = createNativeStore({ dataDirectory: directory, moduleCatalog: fixtureModules });
  try {
    store.updateAccount(admin, admin.id, { revision: admin.revision, role: 'member' });
    const currentSecond = other.login('second-admin', `${password}-new`).user;
    expect(() =>
      other.updateAccount(currentSecond, second.id, { revision: currentSecond.revision, disabled: true }),
    ).toThrow('最后一个管理员');
  } finally {
    other.close();
  }
});
test('registered page contracts reject arbitrary modules, duplicate clients and invalid defaults', async () => {
  const { store, admin } = await fixture();
  expect(() =>
    store.createProject(admin, { id: 'unsafe-project', name: 'X', moduleKey: 'https://invalid/code.js' }),
  ).toThrow('未注册');
  const project = store.createProject(admin, {
    id: 'valid-project',
    name: 'A',
    moduleKey: 'rental-orders',
    ...configuration,
  });
  expect(() =>
    store.updateProject(admin, project.id, {
      revision: project.revision,
      clients: [...project.clients, ...project.clients],
    }),
  ).toThrow('重复');
  expect(() =>
    store.updateProject(admin, project.id, {
      revision: project.revision,
      clients: [{ ...project.clients[0], defaultPage: 'payment' }],
    }),
  ).toThrow('默认入口');
  expect(() =>
    store.updateProject(admin, project.id, {
      revision: project.revision,
      links: [{ clientId: 'admin', pageKey: 'orders', documentPath: '../private.md' }],
    }),
  ).toThrow('相对');
});
async function httpFixture() {
  const directory = await fs.mkdtemp(path.join(tmpdir(), 'preview-native-test-'));
  const docs = path.join(directory, 'docs'),
    statics = path.join(directory, 'web');
  await fs.mkdir(docs);
  await fs.mkdir(statics);
  await fs.writeFile(path.join(docs, 'guide.md'), '# Private document\n\nFixture only');
  await fs.writeFile(path.join(docs, 'image.png'), Buffer.from([137, 80, 78, 71]));
  await fs.writeFile(path.join(statics, 'index.html'), '<!doctype html><title>Preview</title>');
  const runtime = createNativeServer({
    dataDirectory: path.join(directory, 'db'),
    moduleCatalog: fixtureModules,
    sources: { sample: { root: docs, perProject: false, label: 'Fixture' } },
    staticRoot: statics,
    publicOrigin: 'http://127.0.0.1:5191',
    allowBootstrap: true,
  });
  const item = { directory, runtime };
  fixtures.push(item);
  await new Promise((resolve) => runtime.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${runtime.server.address().port}`,
    origin = 'http://127.0.0.1:5191';
  async function call(route, { method = 'GET', body, cookie, csrf, requestOrigin = origin } = {}) {
    return fetch(`${base}${route}`, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(method === 'GET'
          ? {}
          : {
              Origin: requestOrigin,
              'Content-Type': 'application/json',
              ...(csrf ? { 'X-Preview-CSRF': csrf } : {}),
            }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }
  const bootstrap = await call('/api/native/bootstrap', {
    method: 'POST',
    body: { username: 'admin-user', displayName: 'Admin', password },
  });
  expect(bootstrap.status).toBe(201);
  const login = await call('/api/native/login', {
    method: 'POST',
    body: { username: 'admin-user', password },
  });
  const cookie = login.headers.get('set-cookie').split(';')[0],
    session = await login.json();
  return { directory, docs, runtime, call, cookie, csrf: session.csrf, admin: session.user };
}
test('component center refresh serves only the application shell and retains protected API access', async () => {
  const { call } = await httpFixture();
  for (const route of ['/center', '/center/sample-project?kind=components&category=vehicles']) {
    const response = await call(route);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('<title>Preview</title>');
  }
  expect((await call('/api/native/projects/sample-project')).status).toBe(401);
  expect((await call('/center/sample-project/private.md')).status).toBe(404);
});
test('HTTP credentials/cookies/CSRF reject forged origin, secrets in JSON and legacy API routes', async () => {
  const { call, cookie, csrf } = await httpFixture();
  expect((await call('/api/native/accounts')).status).toBe(401);
  expect(
    (await call('/api/native/projects', { method: 'POST', cookie, body: { id: 'project-a', name: 'A' } }))
      .status,
  ).toBe(403);
  expect(
    (
      await call('/api/native/projects', {
        method: 'POST',
        cookie,
        csrf,
        requestOrigin: 'https://evil.invalid',
        body: {},
      })
    ).status,
  ).toBe(403);
  const response = await call('/api/native/accounts', { cookie });
  expect(response.status).toBe(200);
  expect(await response.text()).not.toContain('password_hash');
  expect((await call('/__projects')).status).toBe(404);
  expect((await call('/api/projects')).status).toBe(404);
  expect((await call('/projects/guide.md')).status).toBe(404);
  expect((await call('/manage/projects')).status).toBe(200);
  expect((await call('/p/project-a/admin/orders')).status).toBe(200);
  const login = await call('/api/native/login', {
    method: 'POST',
    body: { username: 'admin-user', password },
  });
  expect(login.headers.get('set-cookie')).toContain('HttpOnly');
  expect(login.headers.get('set-cookie')).toContain('SameSite=Strict');
});
test('document catalog/text/images are private, revoked access is immediate and traversal/symlink escapes fail', async () => {
  const { call, cookie, csrf, runtime, docs, directory, admin } = await httpFixture();
  const user = member(runtime.store, admin, 'viewer-user');
  let project = runtime.store.createProject(admin, {
    id: 'project-a',
    name: 'A',
    sourceId: 'sample',
    moduleKey: 'rental-orders',
    ...configuration,
  });
  project = runtime.store.setMember(admin, project.id, user.id, {
    role: 'viewer',
    revision: project.revision,
  });
  const login = await call('/api/native/login', {
    method: 'POST',
    body: { username: user.username, password: `${password}-changed` },
  });
  const viewerCookie = login.headers.get('set-cookie').split(';')[0];
  expect((await call('/api/native/projects/project-a/documents')).status).toBe(401);
  expect(
    (await call('/api/native/projects/project-a/document?path=image.png', { cookie: viewerCookie })).status,
  ).toBe(200);
  expect(
    (await call('/api/native/projects/project-b/document?path=guide.md', { cookie: viewerCookie })).status,
  ).toBe(404);
  expect(
    (await call('/api/native/projects/project-a/document?path=..%2Fprivate.md', { cookie })).status,
  ).toBe(400);
  await fs.mkdir(path.join(directory, 'outside'));
  await fs.writeFile(path.join(directory, 'outside/secret.md'), '# Secret');
  await fs.symlink(
    path.join(directory, 'outside'),
    path.join(docs, 'escape'),
    process.platform === 'win32' ? 'junction' : 'dir',
  );
  expect(
    (await call('/api/native/projects/project-a/document?path=escape%2Fsecret.md', { cookie })).status,
  ).toBe(404);
  const saved = await call('/api/native/projects/project-a', {
    method: 'PATCH',
    cookie,
    csrf,
    body: {
      revision: project.revision,
      links: [{ clientId: 'admin', pageKey: 'orders', documentPath: 'guide.md', anchor: '' }],
    },
  });
  expect(saved.status).toBe(200);
  const missing = await call('/api/native/projects/project-a', {
    method: 'PATCH',
    cookie,
    csrf,
    body: {
      revision: (await saved.json()).revision,
      links: [{ clientId: 'admin', pageKey: 'orders', documentPath: 'missing.md', anchor: '' }],
    },
  });
  expect(missing.status).toBe(404);
  const current = runtime.store.getProject(admin, project.id);
  runtime.store.setMember(admin, project.id, user.id, { role: null, revision: current.revision });
  expect(
    (await call('/api/native/projects/project-a/document?path=guide.md', { cookie: viewerCookie })).status,
  ).toBe(404);
});
test('account disable invalidates an already issued HTTP cookie', async () => {
  const { call, runtime, admin } = await httpFixture();
  const user = member(runtime.store, admin, 'disabled-user');
  const login = await call('/api/native/login', {
    method: 'POST',
    body: { username: user.username, password: `${password}-changed` },
  });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  runtime.store.updateAccount(admin, user.id, { revision: user.revision, disabled: true });
  expect((await call('/api/native/projects', { cookie })).status).toBe(401);
});

test('a per-project document root cannot alias another project directory inside the same source', async () => {
  const { directory } = await fixture();
  const root = path.join(directory, 'project-documents');
  await fs.mkdir(root);
  await fs.mkdir(path.join(root, 'project-b'));
  await fs.writeFile(path.join(root, 'project-b/secret.md'), '# Private B');
  await fs.symlink(
    path.join(root, 'project-b'),
    path.join(root, 'project-a'),
    process.platform === 'win32' ? 'junction' : 'dir',
  );
  const documents = createNativeDocuments({
    sources: { local: { root, perProject: true, label: 'Fixture' } },
  });
  await expect(documents.read({ id: 'project-a', sourceId: 'local' }, 'secret.md')).rejects.toThrow(
    '不能指向其他目录',
  );
});
test('client does not fall back to static content and stale session responses cannot replace new CSRF', async () => {
  const calls = [];
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const client = createNativeClient({
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      if (url.endsWith('/session')) return pending;
      if (url.endsWith('/login'))
        return new Response(JSON.stringify({ csrf: 'new-csrf', user: { id: 'new-user' } }));
      return new Response('{}');
    },
  });
  const session = client.session();
  await client.login('new-user', password);
  release(new Response(JSON.stringify({ csrf: 'old-csrf', user: { id: 'old-user' } })));
  await session;
  await client.request('/projects', { method: 'POST', body: {} });
  expect(calls.at(-1).options.headers['X-Preview-CSRF']).toBe('new-csrf');
  const denied = createNativeClient({
    fetchImpl: async () => new Response(JSON.stringify({ message: 'Denied' }), { status: 403 }),
  });
  await expect(denied.request('/projects')).rejects.toThrow('Denied');
});

test('successful password changes invalidate pending identity reads before the next poll', async () => {
  let release;
  let invalidated = 0;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const calls = [];
  const client = createNativeClient({
    onUnauthorized: () => {
      invalidated++;
    },
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      if (url.endsWith('/session')) return pending;
      return new Response(JSON.stringify({ changed: true }));
    },
  });
  const old = client.session();
  await client.changePassword({ currentPassword: 'old-fixture-password', password: 'new-fixture-password' });
  release(new Response(JSON.stringify({ csrf: 'stale-csrf', user: { id: 'old' } })));
  await old;
  await client.request('/projects', { method: 'POST', body: {} });
  expect(invalidated).toBe(1);
  expect(calls.at(-1).options.headers['X-Preview-CSRF']).toBe('');
});
