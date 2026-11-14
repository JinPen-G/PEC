import { act, cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { NativeAuthProvider, useNativeAuth } from './platform-api';

const requests = vi.hoisted(() => ({ session: vi.fn(), logout: vi.fn() }));
vi.mock('../../../../../packages/platform-client/src/client', () => ({ createNativeClient: () => requests }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

it('revalidates identity without rerendering unchanged pages and still clears data on revocation', async () => {
  vi.useFakeTimers();
  let value = {
    initialized: true,
    user: { id: 'reader', revision: 1, role: 'member', displayName: 'Reader' },
    csrf: 'session-one',
  };
  requests.session.mockImplementation(async () => structuredClone(value));
  const rendered = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Page() {
    const { session, loading } = useNativeAuth();
    rendered();
    return <span>{loading ? 'Loading' : (session?.user?.displayName ?? 'Anonymous')}</span>;
  }
  render(
    <QueryClientProvider client={queryClient}>
      <NativeAuthProvider>
        <Page />
      </NativeAuthProvider>
    </QueryClientProvider>,
  );
  await act(async () => {});
  expect(screen.getByText('Reader')).toBeInTheDocument();
  const initialRenders = rendered.mock.calls.length;
  queryClient.setQueryData(['private'], 'allowed');
  await act(async () => {
    await vi.advanceTimersByTimeAsync(15000);
  });
  expect(requests.session).toHaveBeenCalledTimes(4);
  expect(rendered).toHaveBeenCalledTimes(initialRenders);
  expect(queryClient.getQueryData(['private'])).toBe('allowed');
  value = { ...value, user: { ...value.user, displayName: 'Renamed', revision: 2 } };
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5000);
  });
  expect(screen.getByText('Renamed')).toBeInTheDocument();
  expect(queryClient.getQueryData(['private'])).toBeUndefined();
  queryClient.setQueryData(['private'], 'allowed');
  requests.session.mockResolvedValue({ initialized: true, user: null, csrf: null });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(5000);
  });
  expect(screen.getByText('Anonymous')).toBeInTheDocument();
  expect(queryClient.getQueryData(['private'])).toBeUndefined();
  queryClient.clear();
});
