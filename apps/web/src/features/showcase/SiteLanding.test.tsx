import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { SiteLanding } from './SiteLanding';
import type { LandingPage } from './landing-pages';

const request = vi.hoisted(() => vi.fn());
vi.mock('../../../../../packages/platform-client/src/client', () => ({
  createNativeClient: () => ({ request }),
}));
vi.mock('./showcase-locale', () => ({ useShowcaseText: () => (text: string) => text }));
vi.mock('@preview/ui', () => ({
  siteMotionTokens: { ease: { enter: [0.2, 0, 0, 1] }, spring: { snappy: { duration: 0 } } },
}));
vi.mock('./RuntimePage', () => ({
  RuntimePage: ({ entry }: { entry: string }) => <span data-testid="live-preview">{entry}</span>,
}));

const observers: VisibilityObserver[] = [];
class VisibilityObserver {
  targets = new Set<Element>();
  constructor(public callback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void) {
    observers.push(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
  }
}
function visibility(visible: boolean) {
  act(() => {
    for (const observer of observers) {
      observer.callback(
        [...observer.targets].map((target) => ({
          target,
          isIntersecting: visible,
        })) as IntersectionObserverEntry[],
        observer as unknown as IntersectionObserver,
      );
    }
  });
}
const page = (pageKey: string, featuredOrder?: number): LandingPage => ({
  projectId: 'sample',
  clientId: 'web',
  pageKey,
  title: pageKey,
  category: 'Product',
  access: 'public',
  featuredOrder,
});
let query: QueryClient;
beforeEach(() => {
  request.mockReset().mockImplementation((route: string) => Promise.resolve({ entry: route, styles: [] }));
  observers.length = 0;
  vi.stubGlobal('IntersectionObserver', VisibilityObserver);
  query = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
});
afterEach(() => {
  cleanup();
  query.clear();
  vi.unstubAllGlobals();
});
function mount(pages: LandingPage[], projectId = 'sample') {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={query}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return render(<SiteLanding pages={pages} projectId={projectId} />, { wrapper: Wrapper });
}

it('keeps the gallery at six tiles and loads previews only while near the viewport', async () => {
  const pages = Array.from({ length: 71 }, (_, index) =>
    page(`page-${index}`, index < 6 ? index + 1 : undefined),
  );
  const view = mount(pages);
  const gallery = screen.getByRole('region', { name: '产品与业务逻辑' });
  expect(within(gallery).getAllByRole('link')).toHaveLength(7);
  expect(within(gallery).getByRole('link', { name: '查看全部产品' })).toHaveAttribute(
    'href',
    '/pages?project=sample',
  );
  expect(view.container.querySelectorAll('.showcase-landing-preview')).toHaveLength(6);
  expect(view.container.querySelector('a .showcase-landing-preview')).toBeNull();
  expect(request).not.toHaveBeenCalled();
  visibility(true);
  await waitFor(() => expect(screen.getAllByTestId('live-preview')).toHaveLength(6));
  expect(request).toHaveBeenCalledTimes(6);
  expect(request.mock.calls.every(([route]) => /page-[0-5]$/.test(route))).toBe(true);
  visibility(false);
  expect(screen.queryAllByTestId('live-preview')).toHaveLength(0);
  visibility(true);
  await waitFor(() => expect(screen.getAllByTestId('live-preview')).toHaveLength(6));
  expect(request).toHaveBeenCalledTimes(6);
});

it('drops old project previews and keeps the all-products destination in the selected project', async () => {
  const view = mount([page('first', 1)]);
  visibility(true);
  await screen.findByTestId('live-preview');
  view.rerender(<SiteLanding pages={[{ ...page('second', 1), projectId: 'other' }]} projectId="other" />);
  expect(screen.queryByText('first')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: '查看全部产品' })).toHaveAttribute('href', '/pages?project=other');
  visibility(true);
  await waitFor(() =>
    expect(screen.getByTestId('live-preview')).toHaveTextContent('/showcase/other/web/second'),
  );
});

it('does not render or fetch a restricted selection and handles a missing curation without listing every page', () => {
  mount([{ ...page('private', 1), access: 'restricted' }, page('unselected')]);
  visibility(true);
  expect(screen.getByText('暂无公开精选，请前往产品目录查看。')).toBeInTheDocument();
  expect(screen.queryAllByTestId('live-preview')).toHaveLength(0);
  expect(request).not.toHaveBeenCalled();
});

it('keeps a failed preview distinct from loading and retains the page link', async () => {
  request.mockRejectedValue(new Error('Unavailable'));
  mount([page('selected', 1)]);
  visibility(true);
  await screen.findByText('预览暂不可用');
  expect(screen.queryAllByTestId('live-preview')).toHaveLength(0);
  expect(screen.getByRole('link', { name: /selected/ })).toHaveAttribute(
    'href',
    '/pages/sample/web/selected',
  );
});
