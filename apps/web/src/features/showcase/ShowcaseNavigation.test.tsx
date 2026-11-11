import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

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
vi.mock('./toc-navigation', () => ({ prepareShowcaseRoute: vi.fn() }));
vi.mock('./SiteLanguageMenu', () => ({ SiteLanguageMenu: () => null }));
vi.mock('./SiteCollaboration', () => ({
  SiteCollaboration: ({ children }: { children: ReactNode }) => children,
  SiteCollaborationControls: () => null,
}));
vi.mock('./SiteDocumentation', () => ({
  SiteDocumentation: () => <h1>文档介绍</h1>,
}));
vi.mock('./SiteLanding', () => ({ SiteLanding: () => <h1>网站首页</h1> }));
vi.mock('./showcase-catalog', async (importOriginal) => ({
  ...await importOriginal<typeof import('./showcase-catalog')>(),
  useShowcaseProjects: () => ({
    data: {
      projects: [
        { id: 'components', name: '组件中心' },
        { id: 'rental', name: '租赁项目' },
      ],
    },
  }),
  useShowcasePages: (projectId: string) => ({
    data: {
      pages: [
        {
          projectId,
          projectName: projectId,
          clientId: 'operation',
          clientName: '营运端',
          pageKey: 'vehicles',
          title: '车辆管理',
          category: '车辆',
          access: 'public',
          allowed: true,
        },
      ],
    },
  }),
}));

import { ShowcaseApp } from './ShowcaseApp';

const clients: QueryClient[] = [];
function mount(route: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <ShowcaseApp />
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

describe('showcase graph navigation', () => {
  it('keeps the site menu mounted and selected when entering and leaving the graph', async () => {
    mount('/docs?project=rental');
    const sidebar = screen.getByRole('complementary', { name: '项目页面导航' });
    fireEvent.click(within(sidebar).getByRole('link', { name: '需求关系图谱' }));
    expect(await screen.findByRole('textbox', { name: '搜索需求点' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: '项目页面导航' })).toBe(sidebar);
    expect(within(sidebar).getByRole('link', { name: '需求关系图谱' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(sidebar).getByRole('link', { name: '车辆管理' })).toHaveAttribute(
      'href',
      '/pages/rental/operation/vehicles',
    );
    expect(screen.getAllByRole('button', { name: '切换项目' })).toHaveLength(1);
    expect(
      within(screen.getByRole('complementary', { name: '查找需求点' })).queryByRole('button', {
        name: '切换项目',
      }),
    ).not.toBeInTheDocument();
    fireEvent.click(within(sidebar).getByRole('link', { name: '介绍' }));
    expect(await screen.findByRole('heading', { name: '文档介绍' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: '项目页面导航' })).toBe(sidebar);
  });

  it('switches projects from the common menu without leaving the graph', async () => {
    mount('/docs/graph?project=rental');
    await screen.findByRole('textbox', { name: '搜索需求点' });
    fireEvent.keyDown(screen.getByRole('button', { name: '切换项目' }), { key: 'ArrowDown' });
    fireEvent.click(await screen.findByRole('menuitemradio', { name: '组件中心' }));
    await waitFor(() =>
      expect(graphCatalog).toHaveBeenLastCalledWith(
        expect.any(Function),
        'components',
        expect.any(AbortSignal),
      ),
    );
    const sidebar = screen.getByRole('complementary', { name: '项目页面导航' });
    expect(within(sidebar).getByRole('link', { name: '需求关系图谱' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(sidebar).getByRole('link', { name: '介绍' })).toHaveAttribute(
      'href',
      '/docs?project=components',
    );
    expect(screen.getByRole('button', { name: '切换项目' })).toHaveTextContent('组件中心');
  });

  it('keeps navigation available when graph data fails', async () => {
    graphCatalog.mockRejectedValue(new Error('读取失败'));
    mount('/docs/graph?project=rental');
    expect(await screen.findByRole('alert')).toHaveTextContent('图谱读取失败');
    expect(screen.getByRole('complementary', { name: '项目页面导航' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '切换项目' })).toBeInTheDocument();
  });

  it('leaves the landing page without a persistent site sidebar', () => {
    mount('/');
    expect(screen.getByRole('heading', { name: '网站首页' })).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: '项目页面导航' })).not.toBeInTheDocument();
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
