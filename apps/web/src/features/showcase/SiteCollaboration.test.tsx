import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Link, MemoryRouter, useLocation } from 'react-router-dom';
import { PlatformLocaleProvider } from '@/features/locale/platform-locale';
import type { Participant } from '../../../../../packages/platform-contracts/src/collaboration';

const auth = vi.hoisted(() => ({
  session: {
    user: { id: 'reader', revision: 1, mustChangePassword: false },
  } as { user: { id: string; revision: number; mustChangePassword: boolean } } | null,
  client: { request: vi.fn() },
}));
vi.mock('@/features/platform/platform-api', () => ({ useNativeAuth: () => auth }));
import { SiteCollaboration, SiteCollaborationControls } from './SiteCollaboration';

const streams: TestStream[] = [];
class TestStream {
  onmessage: ((event: { data: string }) => void) | null = null;
  closed = false;
  revision = 0;
  constructor() {
    streams.push(this);
  }
  close() {
    this.closed = true;
  }
  emit(participants: Participant[]) {
    this.onmessage?.({ data: JSON.stringify({ protocol: 1, revision: ++this.revision, participants }) });
  }
}
const participant = (id: string, pageKey = 'groups', following: string | null = null): Participant => ({
  id,
  name: id === 'viewer' ? '查看者' : '演示者',
  following,
  pointer: null,
  state: { protocol: 1, sequence: 1, clientId: 'operation', pageKey, dialog: null },
});
function Page() {
  const location = useLocation();
  const parts = location.pathname.split('/');
  const page =
    parts[1] === 'pages'
      ? {
          projectId: parts[2],
          projectName: 'Sample',
          clientId: 'operation',
          clientName: 'Operation',
          pageKey: parts[4],
          title: parts[4],
          category: 'Sample',
          access: 'public' as const,
          allowed: true,
        }
      : undefined;
  return (
    <SiteCollaboration page={page}>
      <SiteCollaborationControls />
      <div data-prototype-canvas data-testid="canvas">
        <section data-prototype-canvas data-testid="nested-canvas">
          <input aria-label="Prototype search" />
        </section>
      </div>
      <output data-testid="route">{location.pathname}</output>
      <Link to="/pages/other/operation/groups">Switch project</Link>
      <Link to="/docs">Read docs</Link>
    </SiteCollaboration>
  );
}
function Fixture() {
  return (
    <PlatformLocaleProvider>
      <MemoryRouter initialEntries={['/pages/sample/operation/groups']}>
        <Page />
      </MemoryRouter>
    </PlatformLocaleProvider>
  );
}
beforeEach(() => {
  localStorage.clear();
  streams.length = 0;
  auth.session = { user: { id: 'reader', revision: 1, mustChangePassword: false } };
  vi.stubGlobal('EventSource', TestStream);
  auth.client.request.mockReset();
  auth.client.request.mockImplementation((route: string) =>
    Promise.resolve(route === '/collaboration' ? { id: 'viewer' } : { accepted: true }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('keeps anonymous and required-password viewers out of live rooms', () => {
  auth.session = null;
  const view = render(<Fixture />);
  expect(screen.queryByRole('button', { name: '在线协作' })).not.toBeInTheDocument();
  expect(auth.client.request).not.toHaveBeenCalled();
  auth.session = { user: { id: 'reader', revision: 1, mustChangePassword: true } };
  view.rerender(<Fixture />);
  expect(screen.queryByRole('button', { name: '在线协作' })).not.toBeInTheDocument();
  expect(auth.client.request).not.toHaveBeenCalled();
});

it('follows within front-end routes without recreating the room and supports stopping', async () => {
  render(<Fixture />);
  await waitFor(() => expect(streams).toHaveLength(1));
  act(() => streams[0].emit([participant('viewer'), participant('leader')]));
  fireEvent.keyDown(screen.getByRole('button', { name: '在线协作' }), { key: 'Enter' });
  fireEvent.click(await screen.findByRole('menuitemradio', { name: '演示者' }));
  await waitFor(() =>
    expect(auth.client.request).toHaveBeenCalledWith('/collaboration/viewer', {
      method: 'POST',
      body: { type: 'follow', target: 'leader' },
    }),
  );
  act(() => streams[0].emit([participant('viewer', 'groups', 'leader'), participant('leader', 'transfer')]));
  await waitFor(() =>
    expect(screen.getByTestId('route')).toHaveTextContent('/pages/sample/operation/transfer'),
  );
  expect(streams).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: '退出跟随' }));
  expect(auth.client.request).toHaveBeenCalledWith('/collaboration/viewer', {
    method: 'POST',
    body: { type: 'follow', target: null },
  });
  act(() => streams[0].emit([participant('viewer', 'transfer'), participant('leader', 'groups')]));
  expect(screen.getByTestId('route')).toHaveTextContent('/pages/sample/operation/transfer');
});

it('leaves the room on project change, leaving the preview and logout', async () => {
  const view = render(<Fixture />);
  await waitFor(() => expect(streams).toHaveLength(1));
  fireEvent.click(screen.getByRole('link', { name: 'Switch project' }));
  await waitFor(() => expect(streams).toHaveLength(2));
  expect(streams[0].closed).toBe(true);
  expect(auth.client.request).toHaveBeenCalledWith('/collaboration', {
    method: 'POST',
    body: { projectId: 'other' },
  });
  fireEvent.click(screen.getByRole('link', { name: 'Read docs' }));
  expect(streams[1].closed).toBe(true);
  expect(screen.queryByRole('button', { name: '在线协作' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Switch project' }));
  await waitFor(() => expect(streams).toHaveLength(3));
  auth.session = null;
  view.rerender(<Fixture />);
  expect(streams[2].closed).toBe(true);
  expect(screen.queryByRole('button', { name: '在线协作' })).not.toBeInTheDocument();
});

it('uses the displayed outer canvas for pointer coordinates and clears on window blur', async () => {
  render(<Fixture />);
  await waitFor(() => expect(streams).toHaveLength(1));
  const outer = screen.getByTestId('canvas');
  const inner = screen.getByTestId('nested-canvas');
  vi.spyOn(outer, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 100, 400, 400));
  vi.spyOn(inner, 'getBoundingClientRect').mockReturnValue(new DOMRect(150, 150, 100, 100));
  vi.spyOn(performance, 'now').mockReturnValue(1000);
  fireEvent(
    screen.getByLabelText('Prototype search'),
    new MouseEvent('pointermove', {
      bubbles: true,
      clientX: 200,
      clientY: 200,
    }),
  );
  expect(auth.client.request).toHaveBeenCalledWith('/collaboration/viewer', {
    method: 'POST',
    body: { type: 'pointer', pointer: { x: 0.25, y: 0.25, surface: 'operation/groups' } },
  });
  fireEvent.blur(window);
  expect(auth.client.request).toHaveBeenLastCalledWith('/collaboration/viewer', {
    method: 'POST',
    body: { type: 'pointer', pointer: null },
  });
});
