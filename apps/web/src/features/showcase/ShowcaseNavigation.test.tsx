import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PlatformLocaleProvider } from '@/features/locale/platform-locale';

const graphCatalog = vi.hoisted(() => vi.fn());
vi.mock('./graph-catalog', () => ({ loadGraphCatalog: graphCatalog }));
vi.mock('@/features/platform/platform-api', () => ({
  NativeAuthProvider: ({ children }: { children: ReactNode }) => children,
  useNativeAuth: () => ({ session: null, loading: false, client: { request: vi.fn() } }),
}));
vi.mock('@/features/platform/PlatformApp', () => ({ NativeAdministration: () => null }));
vi.mock('@/features/theme/platform-theme', () => ({
  usePlatformTheme: () => ({ resolvedMode: 'light', setMode: vi.fn() }),
}));
vi.mock('@/features/appearance/appearance-preferences', () => ({
  useAppearancePreferences: () => ({ preferences: { themeColor: '' }, save: vi.fn() }),
}));
vi.mock('./showcase-locale', () => ({
  LocalizedView: ({ children }: { children: ReactNode }) => children,
  useShowcaseText: () => (text: string) => text,
}));
vi.mock('./toc-navigation', () => ({ prepareShowcaseRoute: vi.fn(), useTocNavigation: () => ({ active: 'graph-preview', scrollTo: vi.fn() }) }));
vi.mock('./SiteLanguageMenu', () => ({ SiteLanguageMenu: () => null }));
vi.mock('./SiteCollaboration', () => ({
  SiteCollaboration: ({ children }: { children: ReactNode }) => children,
  SiteCollaborationControls: () => null,
}));
vi.mock('./SiteDocumentation', () => ({
  SiteDocumentation: () => <h1>文档介绍</h1>,
}));
vi.mock('./SiteLanding', () => ({ SiteLanding: () => <h1>网站首页</h1> }));
vi.mock('./showcase-catalog', async (importOriginal) => {
  const entries = [
    { projectId: 'rental', projectName: '租赁项目', clientId: 'operation', clientName: '营运端', pageKey: 'vehicles', title: '车辆管理', category: '车辆', access: 'public', allowed: true, kind: 'page' },
    { projectId: 'components', projectName: '组件中心', clientId: 'web', clientName: 'Web', pageKey: 'button', title: '按钮', category: '操作', access: 'public', allowed: true, kind: 'component' },
    { projectId: 'components', projectName: '组件中心', clientId: 'web', clientName: 'Web', pageKey: 'sign-in', title: '登录表单', category: '身份', access: 'public', allowed: true, kind: 'block' },
  ];
  return {
    ...await importOriginal<typeof import('./showcase-catalog')>(),
    useShowcaseProjects: () => ({ data: { projects: [{ id: 'rental', name: '租赁项目' }, { id: 'components', name: '组件中心' }] } }),
    useShowcasePages: (projectId: string) => ({ data: { pages: entries.filter(entry => entry.projectId === projectId) } }),
    useShowcaseCatalog: () => [{ data: { pages: entries } }],
  };
});

import { ShowcaseApp } from './ShowcaseApp';

const clients: QueryClient[] = [];
function mount(route: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <PlatformLocaleProvider><ShowcaseApp /></PlatformLocaleProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  graphCatalog.mockReset().mockResolvedValue({
    availability: 'ready',
    nodes: [],
    edges: [],
    topics: [],
    diagnostics: [],
    complete: true,
  });
});
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
});

describe('showcase catalog navigation', () => {
  it('groups authorized entries by type, category and item without a project selector', async () => {
    mount('/docs');
    const sidebar = screen.getByRole('complementary', { name: '项目页面导航' });
    expect(within(sidebar).queryByRole('button', { name: '切换项目' })).not.toBeInTheDocument();
    const pages = within(sidebar).getByRole('navigation', { name: 'Screens' });
    expect(within(pages).getByRole('button', { name: /车辆/ })).toBeInTheDocument();
    expect(within(pages).getByRole('link', { name: '车辆管理' })).toHaveAttribute('href', '/pages/rental/operation/vehicles');
    fireEvent.click(within(sidebar).getByRole('button', { name: /^组件1$/ }));
    const components = await within(sidebar).findByRole('navigation', { name: '组件' });
    expect(within(components).getByRole('link', { name: '按钮' })).toHaveAttribute('href', '/pages/components/web/button');
    fireEvent.click(within(sidebar).getByRole('button', { name: /^区块1$/ }));
    expect(await within(sidebar).findByRole('link', { name: '登录表单' })).toHaveAttribute('href', '/pages/components/web/sign-in');
    expect(within(sidebar).getByRole('link', { name: '介绍' })).toHaveAttribute('href', '/docs?project=rental');
    expect(within(sidebar).getByRole('link', { name: '需求关系图谱' })).toHaveAttribute('href', '/docs/graph?project=rental');
  });
  it('offers matching top-level sections and sidebar jumps without leaving the current document', async () => {
    const scrollTo = vi.fn();
    const view = mount('/docs');
    const navigation = screen.getByRole('navigation', { name: '主导航' });
    expect(within(navigation).getByRole('link', { name: 'Screens' })).toHaveAttribute('href', '/screens');
    expect(within(navigation).getByRole('link', { name: '组件' })).toHaveAttribute('href', '/components');
    expect(within(navigation).getByRole('link', { name: '区块' })).toHaveAttribute('href', '/blocks');
    const scroller = view.container.querySelector('.library-sidebar_scroll__Tdgfx') as HTMLElement;
    scroller.scrollTo = scrollTo;
    const jump = screen.getByRole('group', { name: '跳转到内容分类' });
    fireEvent.click(within(jump).getByRole('button', { name: '组件 · 1' }));
    expect(await screen.findByRole('navigation', { name: '组件' })).toBeInTheDocument();
    expect(within(jump).getByRole('button', { name: '组件 · 1' })).toHaveAttribute('aria-pressed', 'true');
    expect(scrollTo).toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: '文档介绍' })).toBeInTheDocument();
  });
  it('preserves old project graph links when returning to project Docs', async () => {
    mount('/docs/graph?project=rental');
    await screen.findByRole('textbox', { name: '搜索需求点' });
    expect(graphCatalog).toHaveBeenLastCalledWith(expect.any(Function), 'rental', expect.any(AbortSignal));
    const sidebar = screen.getByRole('complementary', { name: '项目页面导航' });
    fireEvent.click(within(sidebar).getByRole('link', { name: '介绍' }));
    expect(await screen.findByRole('heading', { name: '文档介绍' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: '项目页面导航' })).toBe(sidebar);
  });
  it('keeps navigation available when graph data fails', async () => {
    graphCatalog.mockRejectedValue(new Error('读取失败'));
    mount('/docs/graph?project=rental');
    expect(await screen.findByRole('alert')).toHaveTextContent('图谱读取失败');
    expect(screen.getByRole('complementary', { name: '项目页面导航' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '切换项目' })).not.toBeInTheDocument();
  });
  it('opens the live graph from a bare graph URL and the Docs menu', async () => {
    mount('/docs/graph');
    expect(await screen.findByRole('textbox', { name: '搜索需求点' })).toBeInTheDocument();
    expect(graphCatalog).toHaveBeenLastCalledWith(expect.any(Function), 'rental', expect.any(AbortSignal));
    const sidebar = screen.getByRole('complementary', { name: '项目页面导航' });
    fireEvent.click(within(sidebar).getByRole('link', { name: '介绍' }));
    expect(await screen.findByRole('heading', { name: '文档介绍' })).toBeInTheDocument();
    fireEvent.click(within(sidebar).getByRole('link', { name: '需求关系图谱' }));
    expect(await screen.findByRole('textbox', { name: '搜索需求点' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: '项目页面导航' })).toBe(sidebar);
  });
  it('leaves the landing page without a persistent site sidebar', () => {
    mount('/');
    expect(screen.getByRole('heading', { name: '网站首页' })).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: '项目页面导航' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '选择休息时长' })).toBeInTheDocument();
  });

  it('offers the same break durations from public Docs without signing in', async () => {
    mount('/docs?project=rental');
    fireEvent.click(screen.getByRole('button', { name: '选择休息时长' }));
    expect(await screen.findByRole('button', { name: '休息 10 分钟' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '休息 30 分钟' })).toBeInTheDocument();
  });

  it('opens the current project demo directly from the site navigation', () => {
    mount('/docs?project=rental');
    for (const link of screen.getAllByRole('link', { name: 'Try the demo' }))
      expect(link).toHaveAttribute('href', '/demo?project=rental');
  });

  it('keeps the front-end project after returning home instead of selecting the first catalog item', async () => {
    mount('/docs?project=rental');
    fireEvent.click(screen.getByRole('link', { name: 'Preview' }));
    expect(await screen.findByRole('heading', { name: '网站首页' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Try the demo' })).toHaveAttribute('href', '/demo?project=rental');
    expect(screen.getByRole('link', { name: '文档' })).toHaveAttribute('href', '/docs?project=rental');
  });
});
