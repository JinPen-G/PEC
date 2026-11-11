/** Durable identity/project rules. SQLite transactions own revisions, last-admin
 * protection and audit records; no HTTP, browser or rental runtime is consulted. */
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { mkdirSync, lstatSync } from 'node:fs';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import { migrateNativeDatabase, DATABASE_SCHEMA } from './schema.js';

const ID = /^[a-z0-9][a-z0-9-]{1,63}$/;
export class NativeError extends Error {
  constructor(status, message, code = 'BAD_REQUEST') {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export function fail(status, message, code) {
  throw new NativeError(status, message, code);
}
const digest = (value) => createHash('sha256').update(value).digest('hex');
const text = (value, label, max = 160, optional = false) => {
  if (typeof value !== 'string' || value.length > max || (!optional && !value.trim()))
    fail(400, `${label}无效`);
  return value.trim();
};
const identifier = (value) => {
  if (typeof value !== 'string' || !ID.test(value)) fail(400, '编码需为2–64位小写字母、数字或连字符');
  return value;
};
const boolean = (value) => {
  if (typeof value !== 'boolean') fail(400, '开关值无效');
  return value;
};
const position = (value) => {
  if (!Number.isSafeInteger(value) || value < 0 || value > 100000) fail(400, '排序值无效');
  return value;
};
function passwordHash(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128)
    fail(400, '密码需为8–128个字符');
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex')}`;
}
function verifyPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 128) return false;
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}
const safeAccount = (row) => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
  role: row.role,
  disabled: Boolean(row.disabled),
  mustChangePassword: Boolean(row.must_change),
  revision: row.revision,
});

export function createNativeStore({
  dataDirectory,
  documentSources = ['none', 'sample', 'local'],
  moduleCatalog = [
    { key: 'empty', pages: [{ key: 'canvas' }] },
    { key: 'rental-orders', pages: [{ key: 'orders' }] },
  ],
  now = Date.now,
  sessionLifetime = 8 * 60 * 60 * 1000,
  idleLifetime = 30 * 60 * 1000,
}) {
  const modules = Object.fromEntries(
    moduleCatalog.map((module) => [module.key, module.pages.map((page) => page.key)]),
  );
  const featuredPages = new Map(
    moduleCatalog.flatMap((module) =>
      module.pages
        .filter((page) => page.featuredOrder !== undefined)
        .map((page) => [`${module.key}/${page.key}`, page.featuredOrder]),
    ),
  );
  if (Object.keys(modules).length !== moduleCatalog.length) fail(500, '原生模块重复注册', 'REGISTRY_INVALID');
  const directory = path.resolve(dataDirectory);
  mkdirSync(directory, { recursive: true });
  if (lstatSync(directory).isSymbolicLink()) fail(400, '平台数据目录不能为符号链接');
  const file = path.join(directory, 'platform.sqlite');
  try {
    if (lstatSync(file).isSymbolicLink()) fail(400, '数据库文件不能为符号链接');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  try {
    migrateNativeDatabase(db);
  } catch (error) {
    db.close();
    throw error;
  }
  const dummyHash = passwordHash(randomBytes(24).toString('hex'));
  const getAccount = (id) => db.prepare('SELECT * FROM accounts WHERE id=?').get(id);
  function actor(user, admin = false, allowPasswordChange = false) {
    const row = user && getAccount(user.id);
    if (!row || row.disabled) fail(401, '登录已失效', 'UNAUTHORIZED');
    if (row.must_change && !allowPasswordChange) fail(403, '请先修改初始密码', 'PASSWORD_CHANGE_REQUIRED');
    if (admin && row.role !== 'admin') fail(403, '需要平台管理员权限', 'FORBIDDEN');
    return row;
  }
  function audit(user, action, target, result = 'success') {
    db.prepare('INSERT INTO audit(actor,action,target,at,result) VALUES(?,?,?,?,?)').run(
      user?.id ?? 'bootstrap',
      action,
      target,
      now(),
      result,
    );
  }
  function transaction(fn) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const value = fn();
      db.exec('COMMIT');
      return value;
    } catch (error) {
      db.exec('ROLLBACK');
      if (String(error.message).includes('UNIQUE constraint')) fail(409, '编码或账号已存在', 'CONFLICT');
      throw error;
    }
  }
  const initialized = () => Boolean(db.prepare('SELECT 1 FROM accounts LIMIT 1').get());
  function createAccount(user, input, bootstrap = false) {
    const username = identifier(input.username);
    const displayName = text(input.displayName, '显示名称');
    const hash = passwordHash(input.password);
    const role = bootstrap ? 'admin' : input.role;
    if (!['admin', 'member'].includes(role)) fail(400, '平台角色无效');
    return transaction(() => {
      if (bootstrap) {
        if (initialized()) fail(409, '管理员已经初始化', 'CONFLICT');
      } else actor(user, true);
      const id = randomUUID();
      db.prepare(
        'INSERT INTO accounts(id,username,display_name,password_hash,role,must_change) VALUES(?,?,?,?,?,?)',
      ).run(id, username, displayName, hash, role, bootstrap ? 0 : 1);
      audit(user, bootstrap ? 'initialize-admin' : 'create-account', id);
      return safeAccount(getAccount(id));
    });
  }
  function login(username, password) {
    const row =
      typeof username === 'string' && username.length <= 64
        ? db.prepare('SELECT * FROM accounts WHERE username=? COLLATE NOCASE').get(username.trim())
        : null;
    const valid = verifyPassword(password, row?.password_hash ?? dummyHash);
    if (!valid || !row || row.disabled) {
      audit(null, 'login', 'credentials', 'denied');
      fail(401, '账号或密码错误，或账号已停用', 'UNAUTHORIZED');
    }
    const token = randomBytes(32).toString('base64url'),
      csrf = randomBytes(32).toString('base64url');
    db.prepare('DELETE FROM sessions WHERE expires_at<=? OR touched_at<=?').run(now(), now() - idleLifetime);
    db.prepare('INSERT INTO sessions VALUES(?,?,?,?,?)').run(
      digest(token),
      row.id,
      csrf,
      now() + sessionLifetime,
      now(),
    );
    audit(row, 'login', row.id);
    return { token, csrf, user: safeAccount(row) };
  }
  function authenticate(token) {
    if (typeof token !== 'string' || token.length > 128) return null;
    const session = db.prepare('SELECT * FROM sessions WHERE token_hash=?').get(digest(token));
    if (!session) return null;
    const row = getAccount(session.user_id);
    if (!row || row.disabled || session.expires_at <= now() || session.touched_at <= now() - idleLifetime) {
      db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(token));
      return null;
    }
    db.prepare('UPDATE sessions SET touched_at=? WHERE token_hash=?').run(now(), digest(token));
    return { user: safeAccount(row), csrf: session.csrf };
  }
  function updateAccount(user, id, input) {
    const hash = input.password !== undefined ? passwordHash(input.password) : null;
    return transaction(() => {
      actor(user, true);
      const row = getAccount(id);
      if (!row) fail(404, '账号不存在', 'NOT_FOUND');
      if (input.revision !== row.revision) fail(409, '账号已变更，请重新读取后保存', 'CONFLICT');
      const role = input.role ?? row.role,
        disabled = input.disabled === undefined ? row.disabled : Number(boolean(input.disabled));
      if (!['admin', 'member'].includes(role)) fail(400, '角色无效');
      if (
        row.role === 'admin' &&
        !row.disabled &&
        (role !== 'admin' || disabled) &&
        db.prepare("SELECT count(*) AS n FROM accounts WHERE role='admin' AND disabled=0").get().n <= 1
      )
        fail(409, '不能停用或降级最后一个管理员', 'LAST_ADMIN');
      const name = input.displayName === undefined ? row.display_name : text(input.displayName, '显示名称');
      db.prepare(
        'UPDATE accounts SET display_name=?,role=?,disabled=?,password_hash=?,must_change=?,revision=revision+1 WHERE id=?',
      ).run(name, role, disabled, hash ?? row.password_hash, hash ? 1 : row.must_change, id);
      if (hash || disabled || role !== row.role) db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);
      audit(user, hash ? 'reset-password' : 'update-account', id);
      return safeAccount(getAccount(id));
    });
  }
  function changePassword(user, input) {
    const hash = passwordHash(input.password);
    return transaction(() => {
      const row = actor(user, false, true);
      if (!verifyPassword(input.currentPassword, row.password_hash)) fail(400, '当前密码错误');
      db.prepare('UPDATE accounts SET password_hash=?,must_change=0,revision=revision+1 WHERE id=?').run(
        hash,
        row.id,
      );
      db.prepare('DELETE FROM sessions WHERE user_id=?').run(row.id);
      audit(user, 'change-password', row.id);
      return { changed: true };
    });
  }
  function projectAccess(user, id, editing = false, includeArchived = false) {
    const account = actor(user);
    const row = db.prepare('SELECT * FROM projects WHERE id=?').get(id);
    const member =
      account.role === 'admin'
        ? 'admin'
        : db.prepare('SELECT role FROM members WHERE project_id=? AND user_id=?').get(id, account.id)?.role;
    if (!row || !member || (row.archived && !(includeArchived && account.role === 'admin')))
      fail(404, '项目不存在或无权访问', 'NOT_FOUND');
    if (editing && member === 'viewer') fail(403, '需要项目编辑权限', 'FORBIDDEN');
    return { row, memberRole: member };
  }
  const publicProject = ({ row, memberRole }) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    position: row.position,
    archived: Boolean(row.archived),
    moduleKey: row.module_key,
    sourceId: row.source_id,
    contentKey: row.content_key,
    revision: row.revision,
    memberRole,
    ...JSON.parse(row.configuration),
  });
  function normalizeConfiguration(input, moduleKey) {
    if (
      !Array.isArray(input.clients) ||
      input.clients.length > 16 ||
      !Array.isArray(input.links) ||
      input.links.length > 200
    )
      fail(400, '客户端或文档关联配置无效');
    const ids = new Set();
    const clients = input.clients.map((client) => {
      const id = identifier(client.id);
      if (['documents', 'config'].includes(id)) fail(400, '客户端编码与平台保留入口冲突');
      if (ids.has(id)) fail(400, '客户端编码重复');
      ids.add(id);
      if (!Array.isArray(client.pages) || client.pages.length > 40) fail(400, '菜单配置无效');
      const pageIds = new Set();
      const pages = client.pages.map((page) => {
        if (!modules[moduleKey].includes(page.key) || pageIds.has(page.key))
          fail(400, '只能绑定已注册且不重复的页面');
        pageIds.add(page.key);
        return {
          key: page.key,
          label: text(page.label, '菜单名称'),
          group: text(page.group ?? '', '分组', 80, true),
          visible: boolean(page.visible),
          position: position(page.position),
          access: page.access === 'public' ? 'public' : 'restricted',
        };
      });
      const enabled = boolean(client.enabled),
        defaultPage = text(client.defaultPage ?? '', '默认页面', 64, true);
      if (defaultPage && !pages.some((page) => page.key === defaultPage && page.visible))
        fail(400, '默认入口必须为有效可见页面');
      if (!['desktop', 'mobile'].includes(client.layout)) fail(400, '布局无效');
      return {
        id,
        name: text(client.name, '客户端名称'),
        icon: text(client.icon || 'layout', '图标', 40),
        enabled,
        layout: client.layout,
        position: position(client.position),
        defaultPage,
        pages,
      };
    });
    const linkIds = new Set();
    const links = input.links.map((link) => {
      const key = `${link.clientId}/${link.pageKey}/${link.documentPath ?? ''}`;
      if (
        linkIds.has(key) ||
        !clients.some(
          (client) => client.id === link.clientId && client.pages.some((page) => page.key === link.pageKey),
        )
      )
        fail(400, '文档关联页面无效或重复');
      linkIds.add(key);
      const documentPath = text(link.documentPath, '文档路径', 512, true);
      if (
        documentPath &&
        (!/\.md$/i.test(documentPath) ||
          documentPath.includes('\\') ||
          documentPath.startsWith('/') ||
          documentPath.split('/').some((part) => part === '..' || part === '.' || !part) ||
          documentPath.includes(':') ||
          [...documentPath].some((char) => char.charCodeAt(0) < 32))
      )
        fail(400, '文档路径必须为源目录内相对 Markdown 路径');
      return {
        clientId: link.clientId,
        pageKey: link.pageKey,
        documentPath,
        anchor: text(link.anchor || '', '文档锚点', 160, true),
      };
    });
    for (const link of links)
      if (
        !link.documentPath &&
        links.some(
          (other) => other !== link && other.clientId === link.clientId && other.pageKey === link.pageKey,
        )
      )
        fail(400, '清空关联不能同时选择文档');
    return { clients, links };
  }
  function createProject(user, input) {
    // Source registration is a developer concern, derived from the project code.
    // A new empty project requires no filesystem source and exposes no example page.
    const registration = moduleCatalog.find((entry) => (entry.projectId ?? entry.key) === input.id);
    const id = identifier(input.id),
      moduleKey = input.moduleKey ?? registration?.key ?? 'empty';
    if (!Object.hasOwn(modules, moduleKey)) fail(400, '原型模块未注册');
    const configuration = normalizeConfiguration(
      {
        clients: input.clients ??
          registration?.initialClients ?? [
            {
              id: registration?.clientId ?? 'main',
              name: '功能页面',
              icon: 'layout',
              layout: 'desktop',
              enabled: true,
              position: 0,
              defaultPage: '',
              pages: [],
            },
          ],
        links: input.links ?? [],
      },
      moduleKey,
    );
    const sourceId =
      input.sourceId ??
      (registration?.contentKey ? 'published' : documentSources.includes('none') ? 'none' : 'local');
    if (!documentSources.includes(sourceId)) fail(400, '文档源未配置');
    const contentKey =
      input.contentKey || registration?.contentKey
        ? identifier(input.contentKey || registration.contentKey)
        : '';
    if (sourceId === 'published' && !contentKey) fail(400, '请选择项目业务资料包');
    return transaction(() => {
      actor(user, true);
      db.prepare(
        'INSERT INTO projects(id,name,description,icon,position,module_key,source_id,configuration,content_key) VALUES(?,?,?,?,?,?,?,?,?)',
      ).run(
        id,
        text(input.name, '项目名称'),
        text(input.description ?? '', '说明', 2000, true),
        text(input.icon || 'boxes', '图标', 40),
        position(input.position ?? 0),
        moduleKey,
        sourceId,
        JSON.stringify(configuration),
        contentKey,
      );
      audit(user, 'create-project', id);
      return publicProject(projectAccess(user, id));
    });
  }
  function updateProject(user, id, input) {
    return transaction(() => {
      const { row, memberRole } = projectAccess(user, id, true, true);
      if (input.revision !== row.revision) fail(409, '项目已变更，请重新读取后保存', 'CONFLICT');
      const privileged = ['archived', 'moduleKey', 'sourceId', 'contentKey'];
      if (
        memberRole !== 'admin' &&
        privileged.some(
          (key) =>
            Object.hasOwn(input, key) &&
            input[key] !==
              {
                archived: Boolean(row.archived),
                moduleKey: row.module_key,
                sourceId: row.source_id,
                contentKey: row.content_key,
              }[key],
        )
      )
        fail(403, '该配置仅平台管理员可修改', 'FORBIDDEN');
      const moduleKey = input.moduleKey ?? row.module_key,
        sourceId = input.sourceId ?? row.source_id;
      if (!Object.hasOwn(modules, moduleKey) || !documentSources.includes(sourceId))
        fail(400, '模块或文档源无效');
      const old = JSON.parse(row.configuration);
      const contentKey =
        input.contentKey === undefined
          ? row.content_key
          : input.contentKey
            ? identifier(input.contentKey)
            : '';
      if (sourceId === 'published' && !contentKey) fail(400, '请选择项目业务资料包');
      const configuration = normalizeConfiguration(
        { clients: input.clients ?? old.clients, links: input.links ?? old.links },
        moduleKey,
      );
      if (memberRole !== 'admin') {
        // Access belongs to a stable client/page identity, never an array slot.
        const previous = new Map(
          old.clients.flatMap((client) =>
            client.pages.map((page) => [`${client.id}/${page.key}`, page.access ?? 'restricted']),
          ),
        );
        for (const client of configuration.clients)
          for (const page of client.pages) {
            if (page.access !== (previous.get(`${client.id}/${page.key}`) ?? 'restricted'))
              fail(403, '页面公开范围仅管理员可修改', 'FORBIDDEN');
          }
      }
      db.prepare(
        'UPDATE projects SET name=?,description=?,icon=?,position=?,archived=?,module_key=?,source_id=?,configuration=?,content_key=?,revision=revision+1 WHERE id=?',
      ).run(
        input.name === undefined ? row.name : text(input.name, '项目名称'),
        input.description === undefined ? row.description : text(input.description, '说明', 2000, true),
        input.icon === undefined ? row.icon : text(input.icon, '图标', 40),
        input.position === undefined ? row.position : position(input.position),
        input.archived === undefined ? row.archived : Number(boolean(input.archived)),
        moduleKey,
        sourceId,
        JSON.stringify(configuration),
        contentKey,
        id,
      );
      for (const client of old.clients)
        for (const page of client.pages) {
          if (
            moduleKey !== row.module_key ||
            !configuration.clients.some(
              (next) => next.id === client.id && next.pages.some((item) => item.key === page.key),
            )
          )
            db.prepare('DELETE FROM page_grants WHERE project_id=? AND client_id=? AND page_key=?').run(
              id,
              client.id,
              page.key,
            );
        }
      audit(user, 'update-project', id);
      return publicProject(projectAccess(user, id, false, true));
    });
  }
  function setMember(user, projectId, userId, input) {
    return transaction(() => {
      actor(user, true);
      const { row } = projectAccess(user, projectId, false, true);
      if (input.revision !== row.revision) fail(409, '项目授权已变更，请重新读取', 'CONFLICT');
      if (!getAccount(userId)) fail(404, '账号不存在', 'NOT_FOUND');
      if (input.role === null) {
        db.prepare('DELETE FROM members WHERE project_id=? AND user_id=?').run(projectId, userId);
        db.prepare('DELETE FROM page_grants WHERE project_id=? AND user_id=?').run(projectId, userId);
      } else {
        if (!['editor', 'viewer'].includes(input.role)) fail(400, '成员角色无效');
        db.prepare(
          'INSERT INTO members VALUES(?,?,?) ON CONFLICT(project_id,user_id) DO UPDATE SET role=excluded.role',
        ).run(projectId, userId, input.role);
      }
      db.prepare('UPDATE projects SET revision=revision+1 WHERE id=?').run(projectId);
      audit(user, input.role === null ? 'revoke-member' : 'grant-member', `${projectId}/${userId}`);
      return publicProject(projectAccess(user, projectId, false, true));
    });
  }
  const tokenMetadata = (row) => {
    const scopes = JSON.parse(
      db.prepare('SELECT scopes FROM context_token_scopes WHERE token_id=?').get(row.id)?.scopes ??
        '["business:read"]',
    );
    return {
      id: row.id,
      projectId: row.project_id,
      label: row.label,
      scope: scopes.join(' '),
      scopes,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
    };
  };
  function pageAccess(user, projectId, clientId, pageKey) {
    const row = db.prepare('SELECT * FROM projects WHERE id=? AND archived=0').get(projectId);
    if (!row) fail(404, '页面不存在', 'NOT_FOUND');
    const configuration = JSON.parse(row.configuration);
    const client = configuration.clients.find((item) => item.id === clientId && item.enabled);
    const page = client?.pages.find((item) => item.key === pageKey && item.visible);
    if (!page) fail(404, '页面不存在', 'NOT_FOUND');
    if (page.access !== 'public') {
      if (!user) fail(401, '此页面需要登录并由管理员授权', 'UNAUTHORIZED');
      const account = actor(user);
      if (
        account.role !== 'admin' &&
        !db
          .prepare(
            'SELECT 1 FROM page_grants WHERE project_id=? AND client_id=? AND page_key=? AND user_id=?',
          )
          .get(projectId, clientId, pageKey, account.id)
      )
        fail(403, '尚未获得此页面授权，请联系管理员', 'FORBIDDEN');
    }
    return { project: publicProject({ row, memberRole: 'viewer' }), client, page };
  }
  function visibleProject(user, access) {
    const project = publicProject(access);
    if (access.memberRole !== 'viewer') return project;
    project.clients = project.clients
      .filter((client) => client.enabled)
      .map((client) => {
        const pages = client.pages.filter((page) => {
          try {
            pageAccess(user, project.id, client.id, page.key);
            return true;
          } catch (error) {
            if ([401, 403, 404].includes(error.status)) return false;
            throw error;
          }
        });
        return {
          ...client,
          pages,
          defaultPage: pages.some((page) => page.key === client.defaultPage)
            ? client.defaultPage
            : (pages.sort((a, b) => a.position - b.position)[0]?.key ?? ''),
        };
      })
      .filter((client) => client.pages.length);
    project.links = project.links.filter((link) =>
      project.clients.some(
        (client) => client.id === link.clientId && client.pages.some((page) => page.key === link.pageKey),
      ),
    );
    return project;
  }
  return {
    synchronizeProjectSources() {
      // New source declarations may arrive after a project was created. Attach
      // only empty projects; never replace an existing project's registered code.
      return transaction(() => {
        let changed = 0;
        for (const row of db.prepare('SELECT * FROM projects').all()) {
          const registration = moduleCatalog.find((entry) => (entry.projectId ?? entry.key) === row.id);
          const configuration = JSON.parse(row.configuration);
          const empty =
            row.module_key === 'empty' && !configuration.clients.some((client) => client.pages.length);
          const moduleKey = empty && registration ? registration.key : row.module_key;
          const retiredSource =
            ['local', 'sample'].includes(row.source_id) && !documentSources.includes(row.source_id);
          const contentKey =
            row.content_key || (registration?.key === moduleKey ? (registration.contentKey ?? '') : '');
          const sourceId = contentKey ? 'published' : retiredSource ? 'none' : row.source_id;
          if (!configuration.clients.length)
            configuration.clients.push({
              id: registration?.clientId ?? 'main',
              name: '功能页面',
              icon: 'layout',
              layout: 'desktop',
              enabled: true,
              position: 0,
              defaultPage: '',
              pages: [],
            });
          if (
            moduleKey !== row.module_key ||
            sourceId !== row.source_id ||
            contentKey !== row.content_key ||
            JSON.stringify(configuration) !== row.configuration
          ) {
            db.prepare(
              'UPDATE projects SET module_key=?,source_id=?,content_key=?,configuration=?,revision=revision+1 WHERE id=?',
            ).run(moduleKey, sourceId, contentKey, JSON.stringify(configuration), row.id);
            audit(null, 'synchronize-project-source', row.id);
            changed++;
          }
        }
        return { changed };
      });
    },
    replacePageGrants(user, projectId, userId, input) {
      return transaction(() => {
        actor(user, true);
        const { row } = projectAccess(user, projectId, true, true);
        if (input.revision !== row.revision) fail(409, '授权配置已变更，请重新读取后保存', 'CONFLICT');
        const account = getAccount(userId);
        if (!account) fail(404, '账号不存在', 'NOT_FOUND');
        if (account.role === 'admin' || (account.disabled && input.pages?.length))
          fail(400, '该账号不能接受页面授权');
        if (!Array.isArray(input.pages) || input.pages.length > 640) fail(400, '授权菜单无效');
        const configuration = JSON.parse(row.configuration);
        const keys = new Set();
        for (const page of input.pages) {
          const identity = `${page.clientId}/${page.pageKey}`;
          if (
            keys.has(identity) ||
            !configuration.clients.some(
              (client) =>
                client.id === page.clientId && client.pages.some((item) => item.key === page.pageKey),
            )
          )
            fail(400, '授权菜单不存在或重复');
          keys.add(identity);
        }
        db.prepare('DELETE FROM page_grants WHERE project_id=? AND user_id=?').run(projectId, userId);
        for (const page of input.pages)
          db.prepare('INSERT INTO page_grants VALUES(?,?,?,?)').run(
            projectId,
            page.clientId,
            page.pageKey,
            userId,
          );
        if (input.pages.length)
          db.prepare("INSERT OR IGNORE INTO members VALUES(?,?,'viewer')").run(projectId, userId);
        db.prepare('UPDATE projects SET revision=revision+1 WHERE id=?').run(projectId);
        audit(user, 'replace-page-grants', `${projectId}/${userId}`);
        return { revision: row.revision + 1 };
      });
    },
    installShowcaseProject(input) {
      const id = identifier(input.id);
      const moduleKey = input.moduleKey;
      if (!Object.hasOwn(modules, moduleKey)) fail(400, '原型模块未注册');
      const configuration = normalizeConfiguration(input, moduleKey);
      const contentKey = identifier(input.contentKey);
      return transaction(() => {
        if (db.prepare('SELECT 1 FROM projects WHERE id=?').get(id))
          return { installed: false, reason: 'existing-project' };
        db.prepare(
          'INSERT INTO projects(id,name,description,icon,position,module_key,source_id,configuration,content_key) VALUES(?,?,?,?,?,?,?,?,?)',
        ).run(
          id,
          text(input.name, '项目名称'),
          text(input.description ?? '', '说明', 2000, true),
          'vehicle',
          0,
          moduleKey,
          'published',
          JSON.stringify(configuration),
          contentKey,
        );
        return { installed: true, id };
      });
    },
    pageAccess,
    pageCatalog(user = null) {
      const result = [];
      for (const row of db.prepare('SELECT * FROM projects WHERE archived=0 ORDER BY position,name').all()) {
        const configuration = JSON.parse(row.configuration);
        for (const client of configuration.clients
          .filter((item) => item.enabled)
          .sort((a, b) => a.position - b.position))
          for (const page of client.pages
            .filter((item) => item.visible)
            .sort((a, b) => a.position - b.position)) {
            let allowed = false;
            try {
              pageAccess(user, row.id, client.id, page.key);
              allowed = true;
            } catch (error) {
              if (![401, 403, 404].includes(error.status)) throw error;
            }
            // Restricted menu metadata is private until a user has page access.
            if (!allowed) continue;
            const featuredOrder = featuredPages.get(`${row.module_key}/${page.key}`);
            result.push({
              projectId: row.id,
              projectName: row.name,
              clientId: client.id,
              clientName: client.name,
              pageKey: page.key,
              title: page.label,
              category: page.group,
              access: page.access ?? 'restricted',
              allowed,
              ...(featuredOrder === undefined ? {} : { featuredOrder }),
            });
          }
      }
      return result;
    },
    setPageGrant(user, projectId, clientId, pageKey, userId, allowed) {
      return transaction(() => {
        actor(user, true);
        if (typeof allowed !== 'boolean') fail(400, '授权值无效');
        if (allowed) pageAccess(user, projectId, clientId, pageKey);
        else projectAccess(user, projectId, true, true);
        if (!getAccount(userId)) fail(404, '账号不存在', 'NOT_FOUND');
        if (allowed) {
          db.prepare('INSERT OR IGNORE INTO page_grants VALUES(?,?,?,?)').run(
            projectId,
            clientId,
            pageKey,
            userId,
          );
          db.prepare("INSERT OR IGNORE INTO members VALUES(?,?,'viewer')").run(projectId, userId);
        } else
          db.prepare(
            'DELETE FROM page_grants WHERE project_id=? AND client_id=? AND page_key=? AND user_id=?',
          ).run(projectId, clientId, pageKey, userId);
        db.prepare('UPDATE projects SET revision=revision+1 WHERE id=?').run(projectId);
        audit(user, allowed ? 'grant-page' : 'revoke-page', `${projectId}/${clientId}/${pageKey}/${userId}`);
        return { allowed };
      });
    },
    listPageGrants(user, projectId) {
      actor(user, true);
      projectAccess(user, projectId, false, true);
      return db
        .prepare(
          'SELECT client_id AS clientId,page_key AS pageKey,user_id AS userId FROM page_grants WHERE project_id=?',
        )
        .all(projectId);
    },
    issueContextToken(user, projectId, { label, days = 30, scopes = ['business:read'] }) {
      return transaction(() => {
        const issuer = actor(user, true);
        projectAccess(user, projectId);
        if (!Number.isInteger(days) || days < 1 || days > 90) fail(400, '凭证有效期需为1–90天');
        if (
          !Array.isArray(scopes) ||
          !scopes.length ||
          scopes.length > 3 ||
          scopes.some((scope) => !['business:read', 'governance:read', 'components:read'].includes(scope))
        )
          fail(400, '凭证读取范围无效');
        const secret = `preview_ctx_${randomBytes(32).toString('base64url')}`;
        const id = randomUUID(),
          at = now();
        db.prepare('INSERT INTO context_tokens VALUES(?,?,?,?,?,?,?,?,NULL)').run(
          id,
          digest(secret),
          projectId,
          issuer.id,
          issuer.revision,
          text(label, '凭证名称', 80),
          at,
          at + days * 86400000,
        );
        audit(user, 'issue-context-token', id);
        db.prepare('INSERT INTO context_token_scopes VALUES(?,?)').run(
          id,
          JSON.stringify([...new Set(scopes)]),
        );
        return { ...tokenMetadata(db.prepare('SELECT * FROM context_tokens WHERE id=?').get(id)), secret };
      });
    },
    listContextTokens(user, projectId) {
      actor(user, true);
      projectAccess(user, projectId, false, true);
      return db
        .prepare('SELECT * FROM context_tokens WHERE project_id=? ORDER BY created_at DESC')
        .all(projectId)
        .map(tokenMetadata);
    },
    revokeContextToken(user, id) {
      return transaction(() => {
        actor(user, true);
        const row = db.prepare('SELECT * FROM context_tokens WHERE id=?').get(id);
        if (!row) fail(404, '凭证不存在', 'NOT_FOUND');
        db.prepare('UPDATE context_tokens SET revoked_at=COALESCE(revoked_at,?) WHERE id=?').run(now(), id);
        audit(user, 'revoke-context-token', id);
        return { revoked: true };
      });
    },
    authenticateContextToken(secret) {
      if (typeof secret !== 'string' || !/^preview_ctx_[A-Za-z0-9_-]{43}$/.test(secret))
        fail(401, '业务读取凭证无效', 'UNAUTHORIZED');
      const row = db.prepare('SELECT * FROM context_tokens WHERE token_hash=?').get(digest(secret));
      const issuer = row && getAccount(row.issuer_id);
      if (
        !row ||
        row.revoked_at !== null ||
        row.expires_at <= now() ||
        !issuer ||
        issuer.disabled ||
        issuer.must_change ||
        issuer.role !== 'admin' ||
        issuer.revision !== row.issuer_revision
      )
        fail(401, '业务读取凭证已失效', 'UNAUTHORIZED');
      const project = publicProject(projectAccess(safeAccount(issuer), row.project_id));
      return { tokenId: row.id, project, scopes: tokenMetadata(row).scopes };
    },
    getSettings(user) {
      actor(user);
      const row = db.prepare('SELECT * FROM settings WHERE id=1').get();
      return { brandName: row.brand_name, brandIcon: row.brand_icon, revision: row.revision };
    },
    saveSettings(user, input) {
      return transaction(() => {
        actor(user, true);
        const row = db.prepare('SELECT * FROM settings WHERE id=1').get();
        if (row.revision !== input.revision) fail(409, '平台设置已变更，请重新读取', 'CONFLICT');
        if (!['layers', 'boxes', 'camera', 'vehicle'].includes(input.brandIcon)) fail(400, '品牌图标未注册');
        db.prepare('UPDATE settings SET brand_name=?,brand_icon=?,revision=revision+1 WHERE id=1').run(
          text(input.brandName, '品牌名称', 80),
          input.brandIcon,
        );
        audit(user, 'platform-settings', 'platform');
        return { brandName: input.brandName.trim(), brandIcon: input.brandIcon, revision: row.revision + 1 };
      });
    },
    initialized,
    bootstrap: (input) => createAccount(null, input, true),
    createAccount,
    updateAccount,
    changePassword,
    login,
    authenticate,
    logout(token) {
      db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(token || ''));
    },
    listAccounts(user) {
      actor(user, true);
      return db.prepare('SELECT * FROM accounts ORDER BY username').all().map(safeAccount);
    },
    listAudit(user) {
      actor(user, true);
      return db.prepare('SELECT actor,action,target,at,result FROM audit ORDER BY id DESC LIMIT 100').all();
    },
    createProject,
    updateProject,
    setMember,
    projectAccess,
    getProject(user, id) {
      return visibleProject(user, projectAccess(user, id, false, true));
    },
    getCollaborationProject(user, id) {
      actor(user);
      const row = db.prepare('SELECT * FROM projects WHERE id=? AND archived=0').get(id);
      if (!row) fail(404, '项目不存在或无权访问', 'NOT_FOUND');
      const project = visibleProject(user, { row, memberRole: 'viewer' });
      if (project.clients.length) return project;
      const owned = publicProject(projectAccess(user, id));
      if (owned.clients.some((client) => client.pages.length))
        fail(403, '当前没有可协作的页面', 'FORBIDDEN');
      return owned;
    },
    listProjects(user) {
      const account = actor(user);
      const rows =
        account.role === 'admin'
          ? db.prepare('SELECT * FROM projects ORDER BY position,name').all()
          : db
              .prepare(
                'SELECT p.* FROM projects p JOIN members m ON m.project_id=p.id WHERE m.user_id=? AND p.archived=0 ORDER BY p.position,p.name',
              )
              .all(account.id);
      return rows.map((row) => visibleProject(user, projectAccess(user, row.id, false, true)));
    },
    listMembers(user, id) {
      actor(user, true);
      projectAccess(user, id, false, true);
      return db
        .prepare(
          'SELECT a.*,m.role AS member_role FROM members m JOIN accounts a ON a.id=m.user_id WHERE m.project_id=? ORDER BY a.username',
        )
        .all(id)
        .map((row) => ({ ...safeAccount(row), memberRole: row.member_role }));
    },
    close() {
      db.close();
    },
    databaseFile: file,
    databaseSchema: DATABASE_SCHEMA,
  };
}
