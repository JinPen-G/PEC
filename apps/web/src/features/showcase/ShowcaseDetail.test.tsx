import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
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
function mount(markdown: string, allowed = true, summaryMarkdown?: string, registry?: ComponentRegistryReference) {
  request.mockImplementation((url: string) =>
    Promise.resolve(
      url.endsWith('/source')
        ? { source: 'export const page = true;', fileName: 'Page.tsx' }
        : {
            ...page,
            entry: 'sample',
            styles: [],
            markdown,
            summaryMarkdown,
            summaryPath: summaryMarkdown ? 'requirements/page-summary.md' : null,
            documents: [],
            contentRevision: 'sample-revision',
            registry,
          },
    ),
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Detail page={{ ...page, allowed }} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
describe('page PRD tabs and authorization', () => {
  it('uses the page registry in the header and omits a fabricated install command when access is denied', async () => {
    const registry: ComponentRegistryReference = { name: 'vehicle-groups', kind: 'block', url: '/r/sample/vehicle-groups.json' };
    const view = mount('页面说明。', true, undefined, registry);
    expect(await screen.findByRole('group', { name: '安装区块' })).toHaveTextContent(`npx shadcn@latest add ${window.location.origin}${registry.url}`);
    expect(screen.queryByRole('button', { name: '复制页面链接' })).toBeNull();
    view.unmount();
    mount('页面说明。', false, undefined, registry);
    expect(screen.queryByRole('group', { name: '安装区块' })).toBeNull();
  });
  it('puts page-specific key rules below the preview and reserves the full specification for the document tab', async () => {
    mount('# 调拨完整说明\n\n## 库存计算\n完整的库存计算规则。', true, '仅空闲车辆可调拨。');
    const documentTab = await screen.findByRole('tab', { name: '文档' });
    expect(await screen.findByText('仅空闲车辆可调拨。')).toBeInTheDocument();
    expect(screen.queryByText('完整的库存计算规则。')).not.toBeInTheDocument();
    fireEvent.click(documentTab);
    expect(await screen.findByText('完整的库存计算规则。')).toBeInTheDocument();
    expect(screen.queryByText('仅空闲车辆可调拨。')).not.toBeInTheDocument();
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
