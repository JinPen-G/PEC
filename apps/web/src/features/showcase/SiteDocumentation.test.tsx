import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { SiteDocumentation } from './SiteDocumentation';
import { siteGuides } from './site-guides';
import '@/features/docs/MarkdownReader';

const request = vi.hoisted(() => vi.fn());
vi.mock('@/features/platform/platform-api', () => ({
  useNativeAuth: () => ({ session: null, client: { request } }),
}));
vi.mock('./showcase-locale', () => ({ useShowcaseText: () => (value: string) => value }));
const clients: QueryClient[] = [];
beforeEach(() => {
  request.mockReset();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  vi.unstubAllGlobals();
});
function mount(projectId: string, path = '/docs') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.push(client);
  const view = (project: string) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`${path}?project=${project}`]}>
        <SiteDocumentation projectId={project} path={path} pages={[]} />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { ...render(view(projectId)), view };
}
const guide = (title: string, id = 'introduction') => ({
  id,
  title,
  description: `${title}说明`,
  path: `guides/${id}.md`,
  markdown: `## 项目范围\n\n${title}正文。`,
});
it('renders the current project in the original article and outline layout, and replaces it on project switch', async () => {
  request.mockImplementation((route: string) =>
    Promise.resolve({
      projectId: route.includes('rental') ? 'rental' : 'components',
      availability: 'ready',
      guides: [guide(route.includes('rental') ? '租赁项目' : '组件中心')],
    }),
  );
  const instance = mount('rental');
  expect(await screen.findByRole('heading', { name: '介绍', level: 1 })).toBeInTheDocument();
  expect(await screen.findByText('租赁项目正文。')).toBeInTheDocument();
  expect(document.querySelector('.docs_docMain__jK5Ve .library-docs_section__WJnkm')).not.toBeNull();
  expect(document.querySelector('.showcase-document-body')).toBeNull();
  expect(screen.getByRole('link', { name: /下一篇\s*使用指南/ })).toHaveAttribute(
    'href',
    '/docs/installation?project=rental',
  );
  instance.rerender(instance.view('components'));
  expect(screen.getByRole('heading', { name: '介绍', level: 1 })).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText('租赁项目正文。')).not.toBeInTheDocument());
  expect(await screen.findByText('组件中心正文。')).toBeInTheDocument();
});
it('does not substitute platform or another project content when a guide is missing or denied', async () => {
  request.mockResolvedValue({ availability: 'unconfigured', guides: [] });
  const instance = mount('empty');
  expect(await screen.findByText('此项目尚未发布这篇指南。')).toBeInTheDocument();
  request.mockRejectedValue(new Error('没有访问权限'));
  instance.rerender(instance.view('denied'));
  expect(await screen.findByRole('alert')).toHaveTextContent('项目指南读取失败');
  expect(screen.queryByText('什么是 Preview')).not.toBeInTheDocument();
});
it('uses the same scoped document renderer for the project changelog', async () => {
  request.mockResolvedValue({ availability: 'ready', guides: [guide('组件中心更新', 'changelog')] });
  mount('components', '/docs/changelog');
  expect(await screen.findByRole('heading', { name: '更新日志', level: 1 })).toBeInTheDocument();
  expect(await screen.findByText('组件中心更新正文。')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /上一篇\s*AI 和 MCP/ })).toHaveAttribute(
    'href',
    '/docs/ai?project=components',
  );
});

it('distinguishes a restricted guide from an unpublished guide without displaying its text', async () => {
  request.mockResolvedValue({ availability: 'ready', guides: [], restrictedGuideIds: ['usage'] });
  mount('restricted', '/docs/installation');
  expect(await screen.findByRole('alert')).toHaveTextContent('此指南需要项目授权。');
  expect(screen.queryByText('此项目尚未发布这篇指南。')).not.toBeInTheDocument();
});

it.each(siteGuides.filter((item) => item.id !== 'graph'))('keeps $title as the page heading instead of replacing it with the project name', async (navigation) => {
  request.mockResolvedValue({ availability: 'ready', guides: [guide('项目自己的内容', navigation.id)] });
  mount('rental', navigation.path);
  expect(screen.getByRole('heading', { level: 1, name: navigation.title })).toBeInTheDocument();
  expect(await screen.findByText('项目自己的内容正文。')).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
});
