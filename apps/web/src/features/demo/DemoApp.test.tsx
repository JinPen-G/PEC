import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { PlatformLocaleProvider } from '@/features/locale/platform-locale';
import { PlatformThemeProvider } from '@/features/theme/platform-theme';
import { UiEnvironmentProvider } from '@preview/ui';
import type { CatalogPage } from '@/features/showcase/showcase-catalog';

const auth = vi.hoisted(() => ({
  session: {
    user: { id: 'reader', revision: 1, displayName: 'Reader', username: 'reader', mustChangePassword: false },
  } as {
    user: null | {
      id: string;
      revision: number;
      displayName: string;
      username: string;
      mustChangePassword: boolean;
    };
  },
  loading: false,
  error: '',
  refresh: vi.fn(),
  logout: vi.fn(),
  client: { request: vi.fn() },
}));
vi.mock('@/features/platform/platform-api', () => ({ useNativeAuth: () => auth }));
vi.mock('@/features/platform/PasswordForm', () => ({
  PasswordForm: () => <div>Required password change</div>,
}));
vi.mock('@/features/platform/VersionNotice', () => ({ VersionNotice: () => null }));
vi.mock('@/features/showcase/RuntimePage', () => ({
  RuntimePage: ({ entry }: { entry: string }) => <div data-testid="runtime">{entry}</div>,
}));
import DemoApp, { DemoWorkspace } from './DemoApp';

const page = (pageKey: string): CatalogPage => ({
  projectId: 'sample',
  projectName: 'Sample',
  clientId: 'operation',
  clientName: '营运端',
  pageKey,
  title: pageKey,
  category: '车辆管理',
  access: 'public',
  allowed: true,
});
let pages: CatalogPage[];
let projects: { id: string; name: string }[];
const roomStreams: RoomStream[] = [];
class RoomStream {
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;
  revision = 0;
  constructor() {
    roomStreams.push(this);
  }
  close() {
    this.closed = true;
  }
  emit(participants: unknown[]) {
    this.onmessage?.({ data: JSON.stringify({ protocol: 1, revision: ++this.revision, participants }) });
  }
}
function Location() {
  return <output data-testid="route">{useLocation().pathname + useLocation().search}</output>;
}
function mount(path: string, gate = false) {
  const queries = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={queries}>
      <PlatformLocaleProvider>
        <PlatformThemeProvider>
          <UiEnvironmentProvider dark={false} reducedMotion>
            <MemoryRouter initialEntries={[path]}>
              <Routes>
                <Route path="/demo/*" element={gate ? <DemoApp /> : <DemoWorkspace />} />
                <Route path="/login" element={<div>Login</div>} />
              </Routes>
              <Location />
            </MemoryRouter>
          </UiEnvironmentProvider>
        </PlatformThemeProvider>
      </PlatformLocaleProvider>
    </QueryClientProvider>,
  );
  return queries;
}
beforeEach(() => {
  Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: () => [] });
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    value: () => ({ finished: Promise.resolve(), cancel() {}, finish() {}, addEventListener() {} }),
  });
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  localStorage.clear();
  sessionStorage.clear();
  roomStreams.length = 0;
  vi.stubGlobal('EventSource', RoomStream);
  auth.session.user = {
    id: 'reader',
    revision: 1,
    displayName: 'Reader',
    username: 'reader',
    mustChangePassword: false,
  };
  pages = [page('vehicle-groups'), page('vehicle-transfer')];
  projects = [{ id: 'sample', name: 'Sample' }];
  auth.client.request.mockImplementation((route: string) => {
    if (route === '/collaboration') return Promise.resolve({ id: 'connection-reader' });
    if (route === '/collaboration/connection-reader') return Promise.resolve({ accepted: true });
    if (route === '/showcase/projects') return Promise.resolve({ projects: [...projects] });
    if (route === '/showcase?projectId=sample') return Promise.resolve({ pages: [...pages] });
    if (route.startsWith('/showcase/sample/operation/'))
      return Promise.resolve({ entry: route.split('/').at(-1), styles: [] });
    throw new Error(`Unexpected request: ${route}`);
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
  delete (Element.prototype as { animate?: unknown }).animate;
});
it('combines the visible front-end pages in the existing shell without management controls', async () => {
  mount('/demo?project=sample');
  expect(await screen.findByTestId('runtime')).toHaveTextContent('vehicle-groups');
  expect(screen.getByTestId('route')).toHaveTextContent('/demo/sample/operation/vehicle-groups');
  expect(screen.getByRole('link', { name: 'vehicle-groups' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'vehicle-transfer' })).toBeInTheDocument();
  expect(screen.queryByText('管理控制台')).not.toBeInTheDocument();
  expect(screen.queryByText('账号管理')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '本页文档' })).not.toBeInTheDocument();
  expect(document.querySelector('a[href^="#/manage"]')).toBeNull();
});
it('removes a hidden or revoked selected page on catalog refresh and stops displaying it', async () => {
  const queries = mount('/demo/sample/operation/vehicle-transfer');
  expect(await screen.findByTestId('runtime')).toHaveTextContent('vehicle-transfer');
  pages = [page('vehicle-groups')];
  await act(async () => {
    await queries.invalidateQueries({ queryKey: ['showcase-catalog', 'reader', 1, 'sample'] });
  });
  await waitFor(() => expect(screen.getByTestId('runtime')).toHaveTextContent('vehicle-groups'));
  expect(screen.queryByRole('link', { name: 'vehicle-transfer' })).not.toBeInTheDocument();
  pages = [];
  await act(async () => {
    await queries.invalidateQueries({ queryKey: ['showcase-catalog', 'reader', 1, 'sample'] });
  });
  expect(await screen.findByText('暂无可体验的页面')).toBeInTheDocument();
  expect(screen.queryByTestId('runtime')).not.toBeInTheDocument();
  projects = [];
  await act(async () => {
    await queries.invalidateQueries({ queryKey: ['showcase-catalog', 'reader', 1, 'projects'] });
  });
  expect(screen.getByText('暂无可体验的页面')).toBeInTheDocument();
});
it('lets visitors open public demo pages without signing in or joining collaboration', async () => {
  auth.session.user = null;
  auth.client.request.mockClear();
  mount('/demo?project=sample', true);
  expect(await screen.findByTestId('runtime')).toHaveTextContent('vehicle-groups');
  expect(screen.getByTestId('route')).toHaveTextContent('/demo/sample/operation/vehicle-groups');
  expect(screen.getByText('访客')).toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: '主动跟随' })).not.toBeInTheDocument();
  expect(roomStreams).toHaveLength(0);
  expect(auth.client.request.mock.calls.some(([route]) => route.startsWith('/collaboration'))).toBe(false);
});
it('prefers the current front-end project over the first available project', async () => {
  auth.session.user = null;
  projects.unshift({ id: 'components', name: '组件中心' });
  sessionStorage.setItem('preview:showcase-project:anonymous', 'sample');
  auth.client.request.mockClear();
  mount('/demo', true);
  expect(await screen.findByTestId('runtime')).toHaveTextContent('vehicle-groups');
  expect(screen.getByTestId('route')).toHaveTextContent('/demo/sample/operation/vehicle-groups');
  expect(auth.client.request.mock.calls.some(([route]) => route === '/showcase?projectId=components')).toBe(false);
});
it('honors the explicit project even when another project was remembered', async () => {
  auth.session.user = null;
  projects.unshift({ id: 'components', name: '组件中心' });
  sessionStorage.setItem('preview:showcase-project:anonymous', 'components');
  mount('/demo?project=sample', true);
  expect(await screen.findByTestId('runtime')).toHaveTextContent('vehicle-groups');
  expect(screen.getByTestId('route')).toHaveTextContent('/demo/sample/operation/vehicle-groups');
});
it('keeps required password changes ahead of the demo', async () => {
  auth.session.user!.mustChangePassword = true;
  mount('/demo/sample/operation/vehicle-transfer', true);
  expect(await screen.findByText('Required password change')).toBeInTheDocument();
  expect(screen.queryByTestId('runtime')).not.toBeInTheDocument();
});

it('shows collaboration and follows an authorized participant within demo routes', async () => {
  mount('/demo/sample/operation/vehicle-groups');
  expect(await screen.findByTestId('runtime')).toHaveTextContent('vehicle-groups');
  expect(screen.getByRole('combobox', { name: '主动跟随' })).toBeInTheDocument();
  await waitFor(() => expect(roomStreams).toHaveLength(1));
  await act(async () => {
    roomStreams[0].emit([
      { id: 'connection-reader', name: 'Reader', following: 'presenter', state: null, pointer: null },
      {
        id: 'presenter',
        name: 'Presenter',
        following: null,
        pointer: null,
        state: { protocol: 1, sequence: 1, clientId: 'operation', pageKey: 'vehicle-transfer', dialog: null },
      },
    ]);
  });
  await waitFor(() =>
    expect(screen.getByTestId('route')).toHaveTextContent('/demo/sample/operation/vehicle-transfer'),
  );
  expect(screen.getByRole('button', { name: '退出跟随' })).toBeInTheDocument();
  await act(async () => {
    const participants = [
      { id: 'connection-reader', name: 'Reader', following: null, state: null, pointer: null },
    ];
    roomStreams[0].emit(participants);
    roomStreams[0].emit(participants);
  });
  expect(screen.getByText(/跟随已结束/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '退出跟随' })).not.toBeInTheDocument();
  cleanup();
  expect(roomStreams[0].closed).toBe(true);
});
