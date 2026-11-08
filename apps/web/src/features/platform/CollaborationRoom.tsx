/** Project-local SSE snapshots. Remote state never replays clicks or mutations. */
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Select } from '@preview/ui/admin';
import { Button } from '@preview/ui/admin';
import { useNativeAuth, type NativeProject } from './platform-api';
import type {
  Participant,
  PresentationState,
} from '../../../../../packages/platform-contracts/src/collaboration';

type Client = ReturnType<typeof useNativeAuth>['client'];
function createRoom(client: Client, project: NativeProject) {
  let snapshot: { id: string; participants: Participant[]; status: string; error: string } = {
    id: '',
    participants: [],
    status: '连接中',
    error: '',
  };
  const listeners = new Set<() => void>();
  let source: EventSource | null = null,
    heartbeat: ReturnType<typeof setInterval> | null = null,
    reconnect: ReturnType<typeof setTimeout> | null = null;
  let stopped = false,
    sequence = 0,
    revision = 0,
    epoch = 0;
  let queue = Promise.resolve(),
    lastState: Omit<PresentationState, 'sequence'> | null = null;
  const update = (patch: Partial<typeof snapshot>) => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener());
  };
  async function command(input: object) {
    if (snapshot.id) await client.request(`/collaboration/${snapshot.id}`, { method: 'POST', body: input });
  }
  function publish(state: Omit<PresentationState, 'sequence'>) {
    lastState = state;
    const id = snapshot.id;
    if (!id || snapshot.participants.find((person) => person.id === id)?.following) return;
    const seq = ++sequence;
    queue = queue
      .catch(() => {})
      .then(async () => {
        if (stopped || snapshot.id !== id) return;
        try {
          await command({ type: 'state', state: { ...state, sequence: seq } });
        } catch (error) {
          update({ error: error instanceof Error ? error.message : '演示同步失败' });
        }
      });
  }
  async function connect() {
    const attempt = ++epoch;
    try {
      const joined = await client.request<{ id: string }>('/collaboration', {
        method: 'POST',
        body: { projectId: project.id },
      });
      if (stopped || attempt !== epoch) {
        await client.request(`/collaboration/${joined.id}`, { method: 'POST', body: { type: 'leave' } });
        return;
      }
      sequence = 0;
      revision = 0;
      update({ id: joined.id, participants: [], error: '', status: '在线' });
      source = new EventSource(`/api/native/collaboration/${joined.id}/stream`);
      source.onmessage = (event) => {
        if (stopped || attempt !== epoch) return;
        try {
          const value = JSON.parse(event.data);
          if (value.protocol !== 1) {
            source?.close();
            if (heartbeat) clearInterval(heartbeat);
            update({
              id: '',
              participants: [],
              status: '需要刷新版本',
              error: '协作协议不兼容，请退出跟随并刷新',
            });
            return;
          }
          if (!Number.isSafeInteger(value.revision) || value.revision <= revision) return;
          revision = value.revision;
          const previous = snapshot.participants.find((person) => person.id === snapshot.id)?.following;
          const current = value.participants.find(
            (person: Participant) => person.id === snapshot.id,
          )?.following;
          update({ participants: value.participants, status: previous && !current ? '跟随已结束' : '在线' });
        } catch {
          update({ error: '协作协议不兼容' });
        }
      };
      source.onerror = () => {
        if (stopped || attempt !== epoch) return;
        source?.close();
        if (heartbeat) clearInterval(heartbeat);
        const lost = snapshot.id;
        update({ id: '', participants: [], status: '连接中断，正在重连' });
        void client
          .request(`/collaboration/${lost}`, { method: 'POST', body: { type: 'leave' } })
          .catch(() => {});
        if (!stopped)
          reconnect = setTimeout(() => {
            void connect();
          }, 2000);
      };
      heartbeat = setInterval(() => {
        void command({ type: 'heartbeat' }).catch(() => {
          source?.close();
          update({ error: '协作权限或连接已失效', participants: [], id: '' });
        });
      }, 4000);
      if (lastState) publish(lastState);
    } catch (error) {
      update({ status: '协作不可用', error: error instanceof Error ? error.message : '无法连接协作' });
    }
  }
  return {
    snapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start() {
      stopped = false;
      void connect();
      return () => {
        stopped = true;
        epoch++;
        source?.close();
        if (heartbeat) clearInterval(heartbeat);
        if (reconnect) clearTimeout(reconnect);
        if (snapshot.id) void command({ type: 'leave' }).catch(() => {});
      };
    },
    publish,
    pointer(pointer: object | null) {
      void command({ type: 'pointer', pointer }).catch(() => {});
    },
    async follow(target: string | null) {
      try {
        await command({ type: 'follow', target });
        update({ error: '' });
      } catch (error) {
        update({ error: error instanceof Error ? error.message : '跟随失败' });
      }
    },
  };
}
interface PresentationContext {
  dialog: string | null;
  setDialog: (id: string | null) => void;
  following: boolean;
  exitFollow: () => void;
}
const Presentation = createContext<PresentationContext | null>(null);
const RoomContext = createContext<{
  room: ReturnType<typeof createRoom>;
  state: ReturnType<ReturnType<typeof createRoom>['snapshot']>;
} | null>(null);
export const usePresentation = () => useContext(Presentation);
export function CollaborationRoom({
  project,
  enabled,
  children,
}: {
  project?: NativeProject;
  enabled: boolean;
  children: ReactNode;
}) {
  if (!project || !enabled) return <>{children}</>;
  return (
    <ActiveRoom key={project.id} project={project}>
      {children}
    </ActiveRoom>
  );
}
function ActiveRoom({ project, children }: { project: NativeProject; children: ReactNode }) {
  const { client } = useNativeAuth(),
    location = useLocation(),
    navigate = useNavigate();
  const [room] = useState(() => createRoom(client, project));
  const state = useSyncExternalStore(room.subscribe, room.snapshot);
  const [dialog, setDialog] = useState<string | null>(null);
  const parts = location.pathname.split('/'),
    clientId = parts[3] ?? '',
    pageKey = parts[4] ?? '';
  const me = state.participants.find((person) => person.id === state.id),
    target = state.participants.find((person) => person.id === me?.following);
  useEffect(() => room.start(), [room]);
  useEffect(() => {
    if (target?.state) {
      const path = `/p/${project.id}/${target.state.clientId}${target.state.pageKey ? `/${target.state.pageKey}` : ''}`;
      if (location.pathname !== path) navigate(path, { replace: true });
    }
  }, [target?.state, project.id, navigate, location.pathname]);
  useEffect(() => {
    if (!me?.following && clientId)
      room.publish({
        protocol: 1,
        clientId,
        pageKey: pageKey ?? '',
        dialog: dialog ? { key: 'order-detail', orderId: dialog } : null,
      });
  }, [clientId, pageKey, dialog, me?.following, room]);
  const effectiveDialog = target?.state ? (target.state.dialog?.orderId ?? null) : dialog;
  useEffect(() => {
    let last = 0;
    const move = (event: PointerEvent) => {
      if (performance.now() - last < 80) return;
      last = performance.now();
      const surface =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-prototype-canvas], [data-demo-dialog="order-detail"]')
          : null;
      const content = surface?.dataset.demoDialog
        ? surface.querySelector<HTMLElement>('[role="dialog"]')
        : surface;
      if (
        !content ||
        !content.contains(event.target as Node) ||
        (surface?.dataset.demoDialog && !effectiveDialog)
      ) {
        room.pointer(null);
        return;
      }
      const rect = content.getBoundingClientRect();
      if (rect.width && rect.height)
        room.pointer({
          x: (event.clientX - rect.left) / rect.width,
          y: (event.clientY - rect.top) / rect.height,
          surface: surface?.dataset.demoDialog ? `dialog:${effectiveDialog}` : `${clientId}/${pageKey}`,
        });
    };
    const leave = () => room.pointer(null);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', leave);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, [clientId, pageKey, effectiveDialog, room]);
  return (
    <RoomContext.Provider value={{ room, state }}>
      <Presentation.Provider
        value={{
          dialog: effectiveDialog,
          setDialog,
          following: Boolean(me?.following),
          exitFollow: () => {
            setDialog(effectiveDialog);
            void room.follow(null);
          },
        }}
      >
        {children}
        <PointerLayer
          participants={state.participants.filter((person) => person.id !== state.id)}
          surface={`${clientId}/${pageKey}`}
          dialog={effectiveDialog}
        />
      </Presentation.Provider>
    </RoomContext.Provider>
  );
}
export function CollaborationControls() {
  const context = useContext(RoomContext);
  if (!context) return null;
  const { room, state } = context,
    me = state.participants.find((person) => person.id === state.id);
  return (
    <div className="native-collaboration-controls">
      <span className="text-meta">
        {state.status} · {state.participants.length} 人
      </span>
      <Select
        aria-label="主动跟随"
        placeholder="选择跟随对象"
        value={me?.following ?? undefined}
        allowClear
        disabled={!state.id}
        onChange={(value) => {
          void room.follow(value ?? null);
        }}
        style={{ width: 144 }}
        options={state.participants
          .filter((person) => person.id !== state.id && !person.following && person.state)
          .map((person) => ({ value: person.id, label: person.name }))}
      />
      {me?.following && (
        <Button
          size="small"
          onClick={() => {
            void room.follow(null);
          }}
        >
          退出跟随
        </Button>
      )}
      {state.error && <Alert type="warning" title={state.error} />}
    </div>
  );
}
function PointerLayer({
  participants,
  surface,
  dialog,
}: {
  participants: Participant[];
  surface: string;
  dialog: string | null;
}) {
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  useEffect(() => {
    const measure = () => {
      const element = document.querySelector<HTMLElement>(
        dialog ? '[data-demo-dialog="order-detail"]' : '[data-prototype-canvas]',
      );
      const box = (
        dialog ? element?.querySelector<HTMLElement>('[role="dialog"]') : element
      )?.getBoundingClientRect();
      setRect(box ? { left: box.left, top: box.top, width: box.width, height: box.height } : null);
    };
    const timer = setInterval(measure, 100);
    return () => clearInterval(timer);
  }, [surface, dialog]);
  if (!rect) return null;
  return (
    <div className="native-pointer-layer" aria-hidden>
      {participants
        .filter((person) => person.pointer?.surface === (dialog ? `dialog:${dialog}` : surface))
        .map((person) => (
          <div
            className="native-person-pointer"
            key={person.id}
            style={{
              left: rect.left + person.pointer!.x * rect.width,
              top: rect.top + person.pointer!.y * rect.height,
            }}
          >
            <svg width="14" height="18" viewBox="0 0 14 18">
              <path d="M1 1v13l4-3 3 6 3-2-3-6h5Z" fill="currentColor" stroke="white" />
            </svg>
            <span>{person.name}</span>
          </div>
        ))}
    </div>
  );
}
