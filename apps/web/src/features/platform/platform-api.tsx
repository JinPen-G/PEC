/** Native identity lifecycle and scoped query keys. A changed identity clears
 * in-flight queries before another account's workspace can render. */
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useQueryClient, useQuery, type QueryClient } from '@tanstack/react-query';
import { createNativeClient } from '../../../../../packages/platform-client/src/client';
import type { NativeSession } from '../../../../../packages/platform-contracts/src/platform';

type Client = ReturnType<typeof createNativeClient>;
interface AuthValue {
  session: NativeSession | null;
  loading: boolean;
  error: string;
  client: Client;
  refresh: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
const Auth = createContext<AuthValue | null>(null);
/** External store keeps overlapping identity requests ordered independently of React renders. */
function createIdentityStore(queries: QueryClient) {
  let snapshot: { session: NativeSession | null; loading: boolean; error: string } = {
    session: null,
    loading: true,
    error: '',
  };
  let identity = '',
    generation = 0,
    refreshing = false;
  const listeners = new Set<() => void>();
  const update = (next: typeof snapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };
  const publish = (next: NativeSession) => {
    const key = next.user ? `${next.user.id}/${next.user.revision}/${next.user.role}` : '';
    if (identity !== key) {
      queries.clear();
      identity = key;
    }
    if (!snapshot.loading && !snapshot.error && JSON.stringify(snapshot.session) === JSON.stringify(next))
      return;
    update({ session: next, loading: false, error: '' });
  };
  const client = createNativeClient({
    onUnauthorized: () => {
      generation++;
      publish({ initialized: true, user: null, csrf: null });
    },
  });
  async function refresh() {
    if (refreshing) return;
    refreshing = true;
    const epoch = generation;
    try {
      const next = await client.session();
      if (epoch === generation) publish(next);
    } catch (err) {
      if (epoch === generation) {
        queries.clear();
        update({ session: null, loading: false, error: err instanceof Error ? err.message : '平台连接失败' });
      }
    } finally {
      refreshing = false;
    }
  }
  return {
    client,
    refresh,
    async login(username: string, password: string) {
      const epoch = ++generation;
      const next = await client.login(username, password);
      if (epoch === generation) publish(next);
    },
    async logout() {
      await client.logout();
      generation++;
      publish({ initialized: true, user: null, csrf: null });
    },
    snapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
export function NativeAuthProvider({ children }: { children: ReactNode }) {
  const queries = useQueryClient();
  const [store] = useState(() => createIdentityStore(queries));
  const snapshot = useSyncExternalStore(store.subscribe, store.snapshot);
  useEffect(() => {
    void store.refresh();
    const timer = window.setInterval(() => {
      void store.refresh();
    }, 5000);
    return () => clearInterval(timer);
  }, [store]);
  return (
    <Auth.Provider
      value={{
        ...snapshot,
        client: store.client,
        refresh: store.refresh,
        login: store.login,
        logout: store.logout,
      }}
    >
      {children}
    </Auth.Provider>
  );
}
export function useNativeAuth() {
  const value = useContext(Auth);
  if (!value) throw new Error('NativeAuthProvider required');
  return value;
}
export function useNativeQuery<T>(route: string, enabled = true, text = false) {
  const { client, session } = useNativeAuth();
  return useQuery({
    queryKey: ['native', session?.user?.id, session?.user?.revision, route],
    queryFn: ({ signal }) => client.request<T>(route, { signal, text }),
    enabled: enabled && Boolean(session?.user),
    retry: false,
    refetchInterval: 5000,
  });
}
export type {
  NativeAccount,
  NativeProject,
  NativeClient,
  DocumentEntry,
  PageDocumentLink,
} from '../../../../../packages/platform-contracts/src/platform';
