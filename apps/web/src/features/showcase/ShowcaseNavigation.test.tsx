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
    { projectId: 'rental', projectName: 'RIMO Rental', clientId: 'operation', clientName: '营运端', pageKey: 'vehicles', title: '车辆管理', category: '车辆', access: 'public', allowed: true, kind: 'page' },
    { projectId: 'rental', projectName: 'RIMO Rental', clientId: 'operation', clientName: '营运端', pageKey: 'departments', title: '营运端 · 部门管理', category: '营运端 · 组织', access: 'public', allowed: true, kind: 'page' },
    { projectId: 'rental', projectName: 'RIMO Rental', clientId: 'enterprise', clientName: '企业端', pageKey: 'departments', title: '企业端 · 部门管理', category: '企业端 · 组织', access: 'public', allowed: true, kind: 'page' },
    { projectId: 'store', projectName: '门市项目', clientId: 'web', clientName: 'Web', pageKey: 'orders', title: '订单管理', category: '门市业务', access: 'public', allowed: true, kind: 'page' },
    { projectId: 'components', projectName: '组件中心', clientId: 'web', clientName: 'Web', pageKey: 'button', title: '按钮', category: '操作', access: 'public', allowed: true, kind: 'component' },
    { projectId: 'components', projectName: '组件中心', clientId: 'web', clientName: 'Web', pageKey: 'sign-in', title: '登录表单', category: '身份', access: 'public', allowed: true, kind: 'block' },
  ];
  return {
    ...await importOriginal<typeof import('./showcase-catalog')>(),
    useShowcaseProjects: () => ({ data: { projects: [{ id: 'rental', name: 'RIMO Rental' }, { id: 'components', name: '组件中心' }, { id: 'store', name: '门市项目' }] } }),
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
  it('groups Screens by project with a graph first, plain page titles and page-only counts', async () => {
    mount('/docs');
    const sidebar = screen.getByRole('complementary', { name: '项目页面导航' });
    expect(within(sidebar).queryByRole('button', { name: '切换项目' })).not.toBeInTheDocument();
    const pages = within(sidebar).getByRole('navigation', { name: 'Screens' });
    expect(within(pages).getByRole('button', { name: 'RIMO Rental3' })).toHaveAttribute('aria-expanded', 'true');
    expect(within(pages).getByRole('button', { name: '门市项目1' })).toHaveAttribute('aria-expanded', 'false');
    expect(within(pages).queryByRole('button', { name: /组织|车辆/ })).not.toBeInTheDocument();
    expect(within(pages).getByRole('link', { name: '车辆管理' })).toHaveAttribute('href', '/pages/rental/operation/vehicles');
    fireEvent.click(within(sidebar).getByRole('button', { name: /^组件1$/ }));
    const components = await within(sidebar).findByRole('navigation', { name: '组件' });
    expect(within(components).getByRole('link', { name: '按钮' })).toHaveAttribute('href', '/pages/components/web/button');
    fireEvent.click(within(sidebar).getByRole('button', { name: /^区块1$/ }));
    expect(await within(sidebar).findByRole('link', { name: '登录表单' })).toHaveAttribute('href', '/pages/components/web/sign-in');
    expect(within(sidebar).getByRole('link', { name: '介绍' })).toHaveAttribute('href', '/docs?project=rental');
    const rental = pages.querySelector('[data-screen-project="rental"]') as HTMLElement;
    const graphLink = within(rental).getByRole('link', { name: '关系图谱' });
    expect(graphLink).toHaveAttribute('href', '/docs/graph?project=rental');
    expect(rental.querySelector('a')).toBe(graphLink);
    expect(within(rental).getByRole('link', { name: '部门管理 营运' })).toHaveAttribute('href', '/pages/rental/operation/departments');
    expect(within(rental).getByRole('link', { name: '部门管理 企业' })).toHaveAttribute('href', '/pages/rental/enterprise/departments');
    expect(within(rental).queryByText('营运端 · 部门管理')).not.toBeInTheDocument();
    fireEvent.click(within(pages).getByRole('button', { name: '门市项目1' }));
    const store = pages.querySelector('[data-screen-project="store"]') as HTMLElement;
    expect(within(store).getByRole('link', { name: '关系图谱' })).toHaveAttribute('href', '/docs/graph?project=store');
    expect(store.querySelector('a')).toHaveTextContent('关系图谱');
    expect(within(store).getByRole('link', { name: '订单管理' })).toHaveAttribute('href', '/pages/store/web/orders');
    expect(within(sidebar).queryByRole('link', { name: '需求关系图谱' })).not.toBeInTheDocument();
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
    fireEvent.click(within(sidebar).getByRole('link', { name: '关系图谱' }));
    expect(await screen.findByRole('textbox', { name: '搜索需求点' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: '项目页面导航' })).toBe(sidebar);
  });
  it('opens the selected project graph, highlights its own row and remembers it for Demo', async () => {
    mount('/docs/projects/store/graph');
    expect(await screen.findByRole('textbox', { name: '搜索需求点' })).toBeInTheDocument();
    expect(graphCatalog).toHaveBeenLastCalledWith(expect.any(Function), 'store', expect.any(AbortSignal));
    const sidebar = screen.getByRole('complementary', { name: '项目页面导航' });
    const store = sidebar.querySelector('[data-screen-project="store"]') as HTMLElement;
    expect(within(store).getByRole('link', { name: '关系图谱' })).toHaveAttribute('aria-current', 'page');
    expect(within(sidebar).getByRole('button', { name: 'RIMO Rental3' })).toHaveAttribute('aria-expanded', 'false');
    const breadcrumb = within(screen.getByRole('main')).getByRole('navigation', { name: 'Screens' });
    expect(breadcrumb).toHaveTextContent('Screens门市项目关系图谱');
    expect(breadcrumb.querySelectorAll('svg')).toHaveLength(2);
    expect(sessionStorage.getItem('preview:showcase-project:anonymous')).toBe('store');
    for (const link of screen.getAllByRole('link', { name: 'Try the demo' }))
      expect(link).toHaveAttribute('href', '/demo?project=store');
  });
  it('searches across project pages and exposes the matching project without category layers', async () => {
    mount('/docs');
    const sidebar = screen.getByRole('complementary', { name: '项目页面导航' });
    fireEvent.change(within(sidebar).getByRole('textbox'), { target: { value: '订单管理' } });
    expect(await within(sidebar).findByRole('link', { name: '订单管理' })).toHaveAttribute('href', '/pages/store/web/orders');
    expect(sidebar.querySelector('[data-screen-project="rental"]')).toBeNull();
    expect(sidebar.querySelector('[data-screen-project="store"]')).not.toBeNull();
    expect(within(sidebar).queryByRole('link', { name: '关系图谱' })).not.toBeInTheDocument();
  });
  it('keeps navigation available when graph data fails', async () => {
    graphCatalog.mockRejectedValue(new Error('读取失败'));
    mount('/docs/graph?project=rental');
    expect(await screen.findByRole('alert')).toHaveTextContent('图谱读取失败');
    expect(screen.getByRole('complementary', { name: '项目页面导航' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '切换项目' })).not.toBeInTheDocument();
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
