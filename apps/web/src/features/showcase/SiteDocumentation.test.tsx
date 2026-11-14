import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { SiteDocumentation } from './SiteDocumentation';
import { siteGuides } from './site-guides';
import { PLATFORM_GUIDES } from '../../../../../packages/project-shared/src/platform-docs';

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
function mount(projectId: string, path = '/docs', projectGuide?: 'introduction' | 'changelog') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  clients.push(client);
  const view = (project: string) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <SiteDocumentation projectId={project} path={path} pages={[]} projectGuide={projectGuide} />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { ...render(view(projectId)), view };
}
it('keeps platform documentation available without projects and unchanged by project context', () => {
  const instance = mount('');
  expect(screen.getByRole('heading', { name: '什么是 Preview' })).toBeInTheDocument();
  expect(document.querySelector('.docs_docMain__jK5Ve .library-docs_section__WJnkm')).not.toBeNull();
  expect(screen.getByRole('link', { name: /下一篇\s*使用指南/ })).toHaveAttribute(
    'href',
    '/docs/installation',
  );
  instance.rerender(instance.view('another-project'));
  expect(screen.getByRole('heading', { name: '什么是 Preview' })).toBeInTheDocument();
  expect(document.title).toBe('介绍 · Preview');
  expect(request).not.toHaveBeenCalled();
});
it('shows the complete platform governance in a closed disclosure after MCP connection', () => {
  mount('', '/docs/ai');
  const headings = [...document.querySelectorAll('h2')].map((node) => node.textContent);
  expect(headings.indexOf('连接 MCP 服务')).toBeLessThan(headings.indexOf('工程治理'));
  expect(screen.getByText(/不仅能获取组件、区块和页面源码/)).toBeVisible();
  expect(screen.getByText('1. 确认需求依据并检查更新')).not.toBeVisible();
  fireEvent.click(screen.getByText('查看完整工程治理规范'));
  expect(screen.getByText('1. 确认需求依据并检查更新')).toBeVisible();
  expect(screen.getByText(/采用它不要求使用特定平台的需求/)).toBeVisible();
});
it('shows platform release notes while keeping project updates on their explicit route', async () => {
  const instance = mount('', '/docs/changelog');
  expect(screen.getByText(/Docs统一介绍Preview平台/)).toBeInTheDocument();
  expect(request).not.toHaveBeenCalled();
  instance.unmount();
  request.mockResolvedValue({
    guides: [
      {
        id: 'changelog',
        title: 'Updates',
        path: 'guides/changelog.md',
        markdown: '## 业务更新\n\n订单字段变化。',
      },
    ],
    restrictedGuideIds: [],
  });
  mount('rental', '/docs/projects/rental/changelog', 'changelog');
  expect(await screen.findByText('订单字段变化。')).toBeInTheDocument();
  expect(request).toHaveBeenCalledWith('/showcase/rental/guides', expect.anything());
});
it('does not substitute platform content for restricted or missing project updates', async () => {
  request.mockResolvedValue({ guides: [], restrictedGuideIds: ['changelog'] });
  mount('restricted', '/docs/projects/restricted/changelog', 'changelog');
  expect(await screen.findByRole('alert')).toHaveTextContent('此指南需要项目授权');
  expect(screen.queryByText(/Docs统一介绍Preview平台/)).not.toBeInTheDocument();
});
it.each(siteGuides)('keeps $title as a single platform page heading', (navigation) => {
  mount('', navigation.path);
  expect(screen.getByRole('heading', { level: 1, name: navigation.title })).toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(PLATFORM_GUIDES.some((guide) => guide.id === navigation.id)).toBe(true);
});
