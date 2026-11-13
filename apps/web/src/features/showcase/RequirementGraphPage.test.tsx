import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { GraphViewProps } from './graph-view';

const state = vi.hoisted(() => ({ views: [] as GraphViewProps[], translated: false }));
vi.mock('./RequirementGraphCanvas', () => ({
  default: (props: GraphViewProps) => {
    state.views.push(props);
    return <div>彩色点 2D</div>;
  },
}));
vi.mock('./RequirementGraphSphere', () => ({
  default: (props: GraphViewProps) => {
    state.views.push(props);
    return <div>固定球形 3D</div>;
  },
}));
vi.mock('./showcase-locale', () => ({
  useShowcaseText: () => (value: string) =>
    state.translated && value === '车辆预约' ? 'Vehicle booking' : value,
}));
vi.mock('@/features/platform/platform-api', () => ({
  useNativeAuth: () => ({ session: null, client: { request: vi.fn() } }),
}));
vi.mock('./graph-catalog', () => ({
  loadGraphCatalog: async () => ({
    availability: 'ready',
    graphRevision: 'same-revision',
    nodes: [
      {
        id: 'feature',
        label: '车辆预约',
        type: 'feature',
        summary: '预约功能',
        aliases: [],
        keyPoints: [],
        evidence: [],
        requirements: [],
        prototypes: [],
        primaryTopic: 'rental',
        topics: ['rental'],
        status: 'active',
        coverage: 'none',
      },
      {
        id: 'rule',
        label: '可租规则',
        type: 'rule',
        summary: '车辆可用',
        aliases: [],
        keyPoints: [],
        evidence: [],
        requirements: [],
        prototypes: [],
        primaryTopic: 'rental',
        topics: ['rental'],
        status: 'active',
        coverage: 'none',
      },
    ],
    edges: [
      {
        id: 'allows',
        source: 'rule',
        target: 'feature',
        label: '允许预约',
        reason: '明确依据',
        relation: 'constrains',
        status: 'active',
        evidence: [],
      },
    ],
    topics: [{ id: 'rental', label: '租赁', category: 'business' }],
    complete: true,
    diagnostics: [],
  }),
}));
import RequirementGraphPage from './RequirementGraphPage';
const clients: QueryClient[] = [];
const originalScrollTo = HTMLElement.prototype.scrollTo;
beforeEach(() => {
  state.views.length = 0;
  state.translated = false;
  HTMLElement.prototype.scrollTo = vi.fn();
});

it('finds original requirement names even when interface labels use another language', async () => {
  state.translated = true;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <RequirementGraphPage projectId="rental" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  await screen.findByText('彩色点 2D');
  fireEvent.change(screen.getByRole('textbox', { name: '搜索需求点' }), { target: { value: '车辆预约' } });
  expect(
    within(screen.getByRole('complementary', { name: '查找需求点' })).getByRole('button', {
      name: /Vehicle booking\s*功能/,
    }),
  ).toBeInTheDocument();
  expect(state.views.at(-1)!.focus).toEqual(['feature']);
});
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  vi.restoreAllMocks();
  HTMLElement.prototype.scrollTo = originalScrollTo;
});
it('starts with the full colored 2D graph and uses legends rather than category gates', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <RequirementGraphPage projectId="rental" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  expect(await screen.findByText('彩色点 2D')).toBeInTheDocument();
  expect(screen.queryByText('按业务查找需求')).not.toBeInTheDocument();
  const initialNodes = state.views.at(-1)!.nodes;
  fireEvent.click(
    within(screen.getByRole('complementary', { name: '查找需求点' })).getByRole('button', {
      name: /车辆预约\s*功能/,
    }),
  );
  expect(await screen.findByRole('complementary', { name: '节点详情' })).toHaveTextContent('车辆预约');
  fireEvent.click(screen.getByRole('tab', { name: '3D' }));
  expect(await screen.findByText('固定球形 3D')).toBeInTheDocument();
  expect(state.views.at(-1)!.selected).toBe('feature');
  expect(state.views.at(-1)!.nodes).toBe(initialNodes);
  fireEvent.click(
    within(screen.getByRole('group', { name: '节点图例' })).getByRole('button', {
      name: '规则',
    }),
  );
  expect(state.views.at(-1)!.hiddenTypes).toEqual(['rule']);
  expect(state.views.at(-1)!.nodes).toBe(initialNodes);
  fireEvent.click(
    within(screen.getByRole('group', { name: '关系图例' })).getByRole('button', {
      name: '约束',
    }),
  );
  expect(state.views.at(-1)!.hiddenRelations).toEqual(['constrains']);
  fireEvent.click(screen.getByRole('tab', { name: '2D' }));
  expect(await screen.findByText('彩色点 2D')).toBeInTheDocument();
  expect(state.views.at(-1)!.nodes).toBe(initialNodes);
  expect(state.views.at(-1)!.hiddenTypes).toEqual(['rule']);
});

it('places the guide below the graph and keeps the finder, selection and view when leaving fullscreen', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.push(client);
  const rendered = render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <RequirementGraphPage projectId="rental" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  await screen.findByText('彩色点 2D');
  const preview = screen.getByRole('region', { name: '图谱预览' });
  const guide = screen.getByRole('heading', { name: '从原文理解关系' });
  expect(preview.compareDocumentPosition(guide) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(
    within(preview).getByRole('tablist', { name: '图谱视图' }).closest('.docs_viewTools___VpV2'),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'AI 和 MCP' })).toHaveAttribute('href', '#/docs/ai?project=rental');
  const finder = screen.getByRole('textbox', { name: '搜索需求点' });
  fireEvent.change(finder, { target: { value: '车辆预约' } });
  fireEvent.click(
    within(screen.getByRole('complementary', { name: '查找需求点' })).getByRole('button', {
      name: /车辆预约\s*功能/,
    }),
  );
  const frame = rendered.container.querySelector('.requirement-graph-frame');
  fireEvent.click(within(preview).getByRole('button', { name: '放大预览' }));
  const dialog = await screen.findByRole('dialog', { name: '需求关系图谱' });
  expect(within(dialog).getByRole('textbox', { name: '搜索需求点' })).toBe(finder);
  expect(dialog).toContainElement(frame as HTMLElement);
  expect(within(dialog).getByRole('complementary', { name: '节点详情' })).toHaveTextContent('车辆预约');
  fireEvent.click(within(dialog).getByRole('tab', { name: '3D' }));
  await within(dialog).findByText('固定球形 3D');
  expect(state.views.at(-1)?.selected).toBe('feature');
  fireEvent.click(within(dialog).getByRole('button', { name: '关闭放大预览' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(within(preview).getByRole('textbox', { name: '搜索需求点' })).toBe(finder);
  expect(finder).toHaveValue('车辆预约');
  expect(within(preview).getByRole('tab', { name: '3D' })).toHaveAttribute('aria-selected', 'true');
  expect(rendered.container.querySelector('.requirement-graph-frame')).toBe(frame);
});

it('provides an empty detail panel in fullscreen before a node is selected', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <RequirementGraphPage projectId="rental" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  await screen.findByText('彩色点 2D');
  fireEvent.click(screen.getByRole('button', { name: '放大预览' }));
  const dialog = await screen.findByRole('dialog', { name: '需求关系图谱' });
  expect(within(dialog).getByRole('complementary', { name: '查找需求点' })).toBeInTheDocument();
  expect(within(dialog).getByRole('complementary', { name: '节点详情' })).toHaveTextContent(
    '选择左侧需求或图中节点',
  );
});
