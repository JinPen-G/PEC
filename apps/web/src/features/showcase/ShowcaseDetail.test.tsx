import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PlatformLocaleProvider } from '@/features/locale/platform-locale';
import type { ComponentRegistryReference } from '../../../../../packages/platform-contracts/src/component-registry';
import '@/features/docs/MarkdownReader';

const request = vi.hoisted(() => vi.fn());
vi.mock('../../../../../packages/platform-client/src/client', () => ({
  createNativeClient: () => ({ request }),
}));
vi.mock('@/features/platform/platform-api', () => ({
  NativeAuthProvider: ({ children }: { children: ReactNode }) => children,
  useNativeAuth: () => ({ session: null }),
}));
vi.mock('@/features/platform/PlatformApp', () => ({ NativeAdministration: () => null }));
vi.mock('./showcase-locale', () => ({
  LocalizedView: ({ children }: { children: ReactNode }) => children,
  useShowcaseText: () => (text: string) => text,
}));
vi.mock('./RuntimePage', () => ({ RuntimePage: () => <input aria-label="原型筛选" defaultValue="" /> }));
vi.mock('./ScreenWorkspace', () => ({ ScreenWorkspace: ({ children }: { children: ReactNode }) => <section aria-label="完整页面">{children}</section> }));
vi.mock('./PageActions', () => ({ PageActions: () => null }));
vi.mock('./FullscreenPreview', () => ({ FullscreenPreview: () => null }));
vi.mock('./AnimatedPanel', () => ({
  AnimatedPanel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

import { Detail } from './ShowcaseApp';
const page = {
  projectId: 'sample',
  projectName: 'Sample',
  clientId: 'operation',
  clientName: '营运端',
  pageKey: 'vehicle-groups',
  title: '车辆',
  category: '车辆管理',
  access: 'public' as const,
  allowed: true,
};
function mount(markdown: string, allowed = true, summaryMarkdown?: string, registry?: ComponentRegistryReference, documentPath?: string, category = page.category) {
  request.mockImplementation((url: string) =>
    Promise.resolve(
      url.endsWith('/source')
        ? { source: 'export const page = true;', fileName: 'Page.tsx' }
        : {
            ...page,
            description: '维护车辆的品牌、车型及规格，供车辆档案选择。',
            category,
            entry: 'sample',
            styles: [],
            markdown,
            summaryMarkdown,
            summaryPath: summaryMarkdown ? 'requirements/page-summary.md' : null,
            documents: documentPath ? [{ path: documentPath, title: '当前页面说明' }] : [],
            contentRevision: 'sample-revision',
            registry,
          },
    ),
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <PlatformLocaleProvider><Detail page={{ ...page, category, allowed }} /></PlatformLocaleProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
describe('page PRD tabs and authorization', () => {
  it('shows the published description and places the project in the Screens breadcrumb', async () => {
    mount('页面说明。', true, undefined, undefined, undefined, '营运端 · 车辆管理');
    expect(await screen.findByText('页面说明。')).toBeInTheDocument();
    expect(screen.getByText('维护车辆的品牌、车型及规格，供车辆档案选择。', { selector: 'header p' })).toBeInTheDocument();
    expect(screen.queryByText('营运端 · 车辆管理', { selector: 'header p' })).not.toBeInTheDocument();
    expect(screen.queryByText('营运端 · 营运端 · 车辆管理')).not.toBeInTheDocument();
    const breadcrumb = screen.getByRole('navigation', { name: '当前位置' });
    expect(breadcrumb).toHaveTextContent('ScreensSample车辆');
    expect(breadcrumb.querySelectorAll('svg')).toHaveLength(2);
    expect(breadcrumb.querySelector('a[href="/screens?project=sample"]')).not.toBeNull();
  });
  it('uses the page registry in the header and omits a fabricated install command when access is denied', async () => {
    const registry: ComponentRegistryReference = { name: 'vehicle-groups', kind: 'block', url: '/r/sample/vehicle-groups.json' };
    const view = mount('页面说明。', true, undefined, registry);
    expect(await screen.findByRole('group', { name: '安装区块' })).toHaveTextContent(`npx shadcn@latest add ${window.location.origin}${registry.url}`);
    expect(screen.queryByRole('button', { name: '复制页面链接' })).toBeNull();
    view.unmount();
    mount('页面说明。', false, undefined, registry);
    expect(screen.queryByRole('group', { name: '安装区块' })).toBeNull();
  });
  it('renders a short page document with headings below the preview instead of replacing it with bullets', async () => {
    mount('# 调拨完整说明\n\n## 库存计算\n完整的库存计算规则。', true, '仅空闲车辆可调拨。');
    expect(await screen.findByText('完整的库存计算规则。')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name:'库存计算'})).toBeInTheDocument();
    expect(screen.queryByRole('tab', {name:'文档'})).not.toBeInTheDocument();
    expect(screen.queryByText('仅空闲车辆可调拨。')).not.toBeInTheDocument();
  });
  it('opens a linked full PRD from a short page document and preserves the preview state', async () => {
    mount('# 车辆\n\n## 使用规则\n[查看专项规则](../rules.md)', true, '简单摘要。', undefined, 'requirements/pages/vehicles.md');
    const input = await screen.findByRole('textbox', { name: '原型筛选' });
    fireEvent.change(input, { target: { value: 'RIMO-001' } });
    const original = request.getMockImplementation()!;
    request.mockImplementation((url: string) => url.includes('/document?')
      ? Promise.resolve({ path: 'requirements/rules.md', title: '专项规则', markdown: '# 专项规则\n\n## 车辆可用性\n启用和营运状态分别校验。' })
      : original(url));
    fireEvent.click(await screen.findByRole('link', { name: '查看专项规则' }));
    expect(await screen.findByText('启用和营运状态分别校验。')).toBeInTheDocument();
    expect(request).toHaveBeenCalledWith(expect.stringContaining('/document?path=requirements%2Frules.md'));
    expect(screen.getByRole('tab', { name: '文档' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: '预览' }));
    expect(screen.getByRole('textbox', { name: '原型筛选' })).toHaveValue('RIMO-001');
    expect(await screen.findByRole('heading', { name: '使用规则' })).toBeInTheDocument();
  });
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
    vi.unstubAllGlobals();
  });
  it('offers a full document only for a long PRD, keeps the preview state, and restores a summary', async () => {
    mount(
      '# 车辆\n\n## 范围\n仅模拟车辆。\n\n' +
        Array.from({ length: 12 }, (_, i) => `## 字段${i}\n字段明细${i}。`).join('\n\n'),
    );
    const documentTab = await screen.findByRole('tab', { name: '文档' });
    expect(await screen.findByRole('link', { name: '范围' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['预览', '文档', '页面源码']);
    const input = screen.getByRole('textbox', { name: '原型筛选' });
    expect(input.closest('[data-prototype-canvas]')).not.toBeNull();
    fireEvent.change(input, { target: { value: 'Tesla' } });
    fireEvent.click(documentTab);
    expect(document.querySelector('[data-prototype-canvas]')).toBeNull();
    expect(await screen.findByRole('link', { name: '字段11' })).toBeInTheDocument();
    fireEvent.keyDown(documentTab, { key: 'ArrowLeft' });
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: '预览' })).toHaveAttribute('aria-selected', 'true'),
    );
    expect(screen.getByRole('textbox', { name: '原型筛选' })).toHaveValue('Tesla');
    expect(input.closest('[data-prototype-canvas]')).not.toBeNull();
    expect(screen.queryByRole('link', { name: '字段11' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: '页面源码' }));
    expect(document.querySelector('[data-prototype-canvas]')).toBeNull();
    expect(await screen.findByText('Page.tsx')).toBeInTheDocument();
  });
  it('keeps short documents beneath the preview and does not fetch restricted PRD content', async () => {
    const view = mount('# 车辆\n\n## 范围\n公开示例。');
    expect(await screen.findByRole('link', { name: '范围' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: '文档' })).not.toBeInTheDocument();
    view.unmount();
    request.mockClear();
    mount('# 私有', false);
    expect(screen.getByRole('heading', { name: '需要页面授权' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: '文档' })).not.toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });
});
