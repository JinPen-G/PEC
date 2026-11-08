import { Suspense, useState, type ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { AdminFeedbackProvider } from '@preview/ui/admin';
const project = vi.hoisted(() => ({
  id: 'test-project',
  name: '测试项目',
  revision: 1,
  memberRole: 'admin',
  moduleKey: 'empty',
  archived: false,
  clients: [
    {
      id: 'operation',
      name: '营运端',
      position: 0,
      enabled: true,
      pages: [
        {
          key: 'canvas',
          label: '车型组管理',
          group: '车辆管理',
          visible: true,
          position: 0,
          access: 'public',
        },
        {
          key: 'orders',
          label: '订单列表',
          group: '订单管理',
          visible: true,
          position: 1,
          access: 'restricted',
        },
      ],
    },
  ],
  links: [],
}));
vi.mock('./platform-api', () => ({
  useNativeAuth: () => ({
    session: { user: { id: 'test-user', role: 'admin', revision: 1, displayName: '管理员' } },
    loading: false,
  }),
  useNativeQuery: (route: string) => ({
    data: route === '/projects' ? [project] : route === '/settings' ? { brandName: 'Preview' } : project,
    isPending: false,
  }),
}));
vi.mock('./ProjectSettingsPage', () => ({
  ProjectSettingsPage: function Settings() {
    const [value, setValue] = useState('原说明');
    return (
      <input aria-label="项目说明草稿" value={value} onChange={(event) => setValue(event.target.value)} />
    );
  },
}));
vi.mock('./ProjectMenuPage', () => ({ ProjectMenuPage: () => <p>菜单配置内容</p> }));
vi.mock('./ProjectAccessPage', () => ({ ProjectAccessPage: () => <p>用户授权内容</p> }));
vi.mock('./CollaborationRoom', () => ({
  CollaborationRoom: ({ children }: { children: ReactNode }) => children,
  CollaborationControls: () => null,
}));
vi.mock('./VersionNotice', () => ({ VersionNotice: () => null }));
vi.mock('@/features/sound/InteractionSounds', () => ({ InteractionSounds: () => null }));
vi.mock('@/features/shell/shell-labels', () => ({
  useShellLabels: () => ({
    platform: '平台管理',
    users: '账号管理',
    center: '组件中心',
    requirements: '需求管理',
    components: '组件管理',
  }),
}));
vi.mock('@/features/theme/platform-theme', () => ({ usePlatformTheme: () => ({ mode: 'light' }) }));
vi.mock('@/features/locale/platform-locale', () => ({ usePlatformLocale: () => ({ locale: 'zh-Hans' }) }));
vi.mock('@preview/ui', async (original) => ({
  ...(await original<object>()),
  FrameworkShell: ({
    children,
    sections,
    selectedKey,
    subtitle,
    workspaceKey,
    navigationMode,
    onNavigate,
    onNavigationModeChange,
  }: {
    children: ReactNode;
    sections: { key: string; label: string; routes: { key: string; label: string }[] }[];
    selectedKey: string;
    subtitle: string;
    workspaceKey: string;
    navigationMode: string;
    onNavigate: (path: string) => void;
    onNavigationModeChange: (mode: string) => void;
  }) => (
    <div data-testid="shell" data-workspace={workspaceKey} data-subtitle={subtitle}>
      <button onClick={() => onNavigationModeChange(navigationMode === 'admin' ? 'components' : 'admin')}>
        切换工作模式
      </button>
      <nav aria-label="管理导航">
        {sections.map((section) => (
          <div key={section.key} role="group" aria-label={section.label}>
            {section.routes.map((route) => (
              <a
                key={route.key}
                href={`#${route.key}`}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(route.key);
                }}
                aria-current={route.key === selectedKey ? 'page' : undefined}
              >
                {route.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      {children}
    </div>
  ),
  DocumentDock: ({ children }: { children: ReactNode }) => children,
}));
import { ProjectDetailsPage } from './ProjectDetailsPage';
import { NativeIdentityGate } from './PlatformApp';
function CurrentPath() {
  const location = useLocation();
  return (
    <output aria-label="当前路径">
      {location.pathname}
      {location.search}
    </output>
  );
}
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('detail tabs retain draft and stay on the same project management page', async () => {
  render(
    <MemoryRouter initialEntries={['/projects/test-project/settings']}>
      <ProjectDetailsPage projectId="test-project" />
      <CurrentPath />
    </MemoryRouter>,
  );
  const draft = await screen.findByLabelText('项目说明草稿');
  fireEvent.change(draft, { target: { value: '还没保存的说明' } });
  fireEvent.keyDown(screen.getByRole('tab', { name: '菜单管理' }), { key: 'Enter' });
  expect(await screen.findByText('菜单配置内容')).toBeVisible();
  expect(draft).toBeInTheDocument();
  expect(draft).not.toBeVisible();
  fireEvent.keyDown(screen.getByRole('tab', { name: '用户授权' }), { key: 'Enter' });
  expect(await screen.findByText('用户授权内容')).toBeVisible();
  fireEvent.keyDown(screen.getByRole('tab', { name: '基础信息' }), { key: 'Enter' });
  expect(draft).toBeVisible();
  expect(draft).toHaveValue('还没保存的说明');
  expect(screen.getByLabelText('当前路径')).toHaveTextContent('/projects/test-project/settings');
});

test('project details never create a workspace group or change the selected sidebar menu', async () => {
  render(
    <MemoryRouter initialEntries={['/projects/test-project/settings']}>
      <Suspense>
        <NativeIdentityGate />
      </Suspense>
      <CurrentPath />
    </MemoryRouter>,
  );
  await screen.findByLabelText('项目说明草稿');
  const assertManagement = () => {
    expect(
      within(screen.getByRole('navigation', { name: '管理导航' })).getByRole('link', { name: '项目管理' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('shell')).toHaveAttribute('data-workspace', '');
    expect(screen.getByTestId('shell')).toHaveAttribute('data-subtitle', '平台管理');
    expect(screen.getByRole('navigation', { name: '管理导航' })).not.toHaveTextContent('基础信息');
    expect(screen.getByRole('navigation', { name: '管理导航' })).not.toHaveTextContent('菜单管理');
    expect(screen.getByRole('navigation', { name: '管理导航' })).not.toHaveTextContent('用户授权');
  };
  assertManagement();
  fireEvent.keyDown(screen.getByRole('tab', { name: '菜单管理' }), { key: 'Enter' });
  await screen.findByText('菜单配置内容');
  assertManagement();
  fireEvent.keyDown(screen.getByRole('tab', { name: '用户授权' }), { key: 'Enter' });
  await screen.findByText('用户授权内容');
  assertManagement();
});

test('direct detail tab links and legacy menu links open the same management detail page', async () => {
  render(
    <MemoryRouter initialEntries={['/projects/test-project/menus']}>
      <Suspense>
        <NativeIdentityGate />
      </Suspense>
      <CurrentPath />
    </MemoryRouter>,
  );
  expect(await screen.findByText('菜单配置内容')).toBeVisible();
  expect(screen.getByLabelText('当前路径')).toHaveTextContent('/projects/test-project/settings?tab=menus');
  fireEvent.mouseDown(screen.getByRole('tab', { name: '基础信息' }), { button: 0, ctrlKey: false });
  expect(await screen.findByLabelText('项目说明草稿')).toBeVisible();
});

test('center categories drive lists independently and management mode returns to the last detail tab', async () => {
  render(
    <MemoryRouter initialEntries={['/projects/test-project/settings?tab=menus']}>
      <AdminFeedbackProvider>
        <Suspense>
          <NativeIdentityGate />
        </Suspense>
        <CurrentPath />
      </AdminFeedbackProvider>
    </MemoryRouter>,
  );
  await screen.findByText('菜单配置内容');
  fireEvent.click(screen.getByRole('button', { name: '切换工作模式' }));
  expect(await screen.findByRole('columnheader', { name: '功能页面名称' })).toBeVisible();
  expect(screen.getByText('车型组管理')).toBeVisible();
  expect(screen.queryByText('订单列表')).not.toBeInTheDocument();
  const requirements = screen.getByRole('group', { name: '需求管理' });
  const components = screen.getByRole('group', { name: '组件管理' });
  fireEvent.click(within(requirements).getByRole('link', { name: '订单管理' }));
  expect(await screen.findByText('订单列表')).toBeVisible();
  expect(screen.queryByText('车型组管理')).not.toBeInTheDocument();
  expect(within(requirements).getByRole('link', { name: '订单管理' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  fireEvent.click(within(components).getByRole('link', { name: '车辆管理' }));
  expect(await screen.findByText('当前分类暂无组件')).toBeVisible();
  expect(screen.queryByText('车型组管理')).not.toBeInTheDocument();
  expect(screen.getByLabelText('当前路径')).toHaveTextContent('kind=components');
  fireEvent.click(screen.getByRole('button', { name: '切换工作模式' }));
  expect(await screen.findByText('菜单配置内容')).toBeVisible();
  expect(screen.getByLabelText('当前路径')).toHaveTextContent('/projects/test-project/settings?tab=menus');
});
