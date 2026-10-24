// 菜单显隐（pageMenu 覆盖）与远程管理授权的单元测试。
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  createProjectPackage,
  loadProjectMounts,
  removePathReliably,
  scanHtmlPrototypePages,
  updateProjectPageMenu,
  updateProjectRouteOrder,
} from '../../packages/project-core/src/index.js';

const temporaryRoots = [];

async function makeTempRoot(label) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), `menu-${label}-`));
  temporaryRoots.push(root);
  return path.join(root, 'workspace');
}

afterAll(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => removePathReliably(root).catch(() => {})),
  );
});

let workspaceRoot;
let projectsRoot;

beforeAll(async () => {
  workspaceRoot = await makeTempRoot('ws');
  projectsRoot = path.join(workspaceRoot, 'projects');
  // createProjectPackage 从 <projectsRoot>/../templates/project-package 取模板
  await fs.cp(
    path.resolve(process.cwd(), 'templates', 'project-package'),
    path.join(workspaceRoot, 'templates', 'project-package'),
    { recursive: true },
  );
  await createProjectPackage(projectsRoot, {
    id: 'menu-demo',
    name: '菜單示例',
    primary: '#2563eb',
    shortName: '菜單',
    description: '菜单显隐测试项目。',
    version: '0.1.0',
    clients: [
      { id: 'admin', name: '管理端', entry: { mode: 'direct' }, layout: { type: 'sidebar' } },
    ],
    entries: [{ id: 'admin', kind: 'client', clientId: 'admin', name: '管理端', order: 10 }],
    docs: { enabled: false },
    prototype: {
      enabled: true,
      root: 'prototype',
      clients: { admin: { root: 'prototype/admin' } },
    },
  });
  // 两个模板契约页：默认都在菜单中显示
  const pageHtml = (pageKey) => `<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8"><title>${pageKey}</title>
<script id="prototype-page-manifest" type="application/json">${JSON.stringify({
    templateVersion: 1,
    scriptMode: 'composition-api',
    pageKey,
    pageTitle: pageKey,
    client: 'admin',
    routePath: `/admin/${pageKey}`,
    rootClass: `page-${pageKey}`,
    menuSection: 'workspace',
    menuTitle: pageKey,
  })}</script></head>
<body><div class="prototype-app"><section class="page-${pageKey}" data-page-content><div data-business-content><p>{{ 1 }}</p></div></section></div></body></html>`;
  const adminDir = path.join(projectsRoot, 'menu-demo', 'prototype', 'admin');
  await fs.mkdir(adminDir, { recursive: true });
  await fs.writeFile(path.join(adminDir, 'dashboard.html'), pageHtml('dashboard'), 'utf8');
  await fs.writeFile(path.join(adminDir, 'reports.html'), pageHtml('reports'), 'utf8');
});

describe('菜单显隐（pageMenu 覆盖）', () => {
  it('默认两个页面都在菜单中显示', async () => {
    const catalog = await scanHtmlPrototypePages(projectsRoot, { mounts: { schemaVersion: 1, projects: {} } });
    const pages = catalog.projects['menu-demo'].admin;
    expect(pages.find((page) => page.path === 'dashboard')).toBeTruthy();
    expect(pages.find((page) => page.path === 'reports')).toBeTruthy();
    expect(pages.every((page) => page.menu !== false)).toBe(true);
  });

  it('updateProjectPageMenu 隐藏页面后扫描结果 menu=false，恢复后回显', async () => {
    const catalog1 = await scanHtmlPrototypePages(projectsRoot, { mounts: { schemaVersion: 1, projects: {} } });
    const dashboard = catalog1.projects['menu-demo'].admin.find((page) => page.path === 'dashboard');
    expect(dashboard).toBeTruthy();

    await updateProjectPageMenu({
      projectRoot: workspaceRoot,
      target: { projectId: 'menu-demo', client: 'admin', page: dashboard.name, menu: false },
      mounts: { schemaVersion: 1, projects: {} },
    });

    const catalog2 = await scanHtmlPrototypePages(projectsRoot, { mounts: { schemaVersion: 1, projects: {} } });
    const hidden = catalog2.projects['menu-demo'].admin.find((page) => page.path === 'dashboard');
    const visible = catalog2.projects['menu-demo'].admin.find((page) => page.path === 'reports');
    expect(hidden.menu).toBe(false);
    expect(visible.menu).not.toBe(false);

    await updateProjectPageMenu({
      projectRoot: workspaceRoot,
      target: { projectId: 'menu-demo', client: 'admin', page: dashboard.name, menu: true },
      mounts: { schemaVersion: 1, projects: {} },
    });
    const catalog3 = await scanHtmlPrototypePages(projectsRoot, { mounts: { schemaVersion: 1, projects: {} } });
    expect(catalog3.projects['menu-demo'].admin.find((page) => page.path === 'dashboard').menu).toBe(true);
  });

  it('排序保存不会丢失已有的 pageMenu 覆盖', async () => {
    const catalog = await scanHtmlPrototypePages(projectsRoot, { mounts: { schemaVersion: 1, projects: {} } });
    const pages = catalog.projects['menu-demo'].admin;
    const reports = pages.find((page) => page.path === 'reports');
    await updateProjectPageMenu({
      projectRoot: workspaceRoot,
      target: { projectId: 'menu-demo', client: 'admin', page: reports.name, menu: false },
      mounts: { schemaVersion: 1, projects: {} },
    });
    await updateProjectRouteOrder({
      projectRoot: workspaceRoot,
      target: {
        projectId: 'menu-demo',
        client: 'admin',
        sectionOrder: ['workspace'],
        pageOrder: { workspace: pages.map((page) => page.name) },
      },
      mounts: { schemaVersion: 1, projects: {} },
    });
    const config = JSON.parse(
      await fs.readFile(path.join(projectsRoot, 'menu-demo', '.platform', 'route-order.json'), 'utf8'),
    );
    expect(config.clients.admin.pageMenu[reports.name]).toBe(false);
  });

  it('不存在页面/客户端时抛错', async () => {
    await expect(
      updateProjectPageMenu({
        projectRoot: workspaceRoot,
        target: { projectId: 'menu-demo', client: 'admin', page: 'no-such-page', menu: false },
        mounts: { schemaVersion: 1, projects: {} },
      }),
    ).rejects.toThrow(/不存在页面/);
    await expect(
      updateProjectPageMenu({
        projectRoot: workspaceRoot,
        target: { projectId: 'menu-demo', client: 'ghost', page: 'dashboard', menu: false },
        mounts: { schemaVersion: 1, projects: {} },
      }),
    ).rejects.toThrow(/不存在客户端/);
  });
});

describe('远程管理授权', () => {
  it('platform-settings normalize 支持 remoteManagement 且默认关闭', async () => {
    const { normalizePlatformSettings } = await import('../../packages/platform-contracts/src/index.js');
    expect(normalizePlatformSettings({})).toEqual({ developerMode: false, remoteManagement: false });
    expect(normalizePlatformSettings({ developerMode: true, remoteManagement: true })).toEqual({
      developerMode: true,
      remoteManagement: true,
    });
  });
});

void loadProjectMounts;
