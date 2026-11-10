/** Project-local SSE snapshots. Remote state never replays clicks or mutations. */
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Select } from '@preview/ui/admin';
import { Button } from '@preview/ui/admin';
import { useNativeAuth, type NativeProject } from './platform-api';
import { usePlatformLocale } from '@/features/locale/platform-locale';
import type {
  Participant,
  PresentationState,
} from '../../../../../packages/platform-contracts/src/collaboration';

type Client = ReturnType<typeof useNativeAuth>['client'];
type RoomProject = Pick<NativeProject, 'id'>;
function createRoom(client: Client, project: RoomProject) {
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
          update({
            participants: value.participants,
            status: current ? '在线' : previous ? '跟随已结束' : snapshot.status,
          });
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
export const useCollaboration = () => useContext(RoomContext);
export function CollaborationRoom({
  project,
  enabled,
  routePrefix = '/p',
  children,
}: {
  project?: RoomProject;
  enabled: boolean;
  routePrefix?: '/p' | '/demo' | '/pages';
  children: ReactNode;
}) {
  if (!project || !enabled) return <>{children}</>;
  return (
    <ActiveRoom key={project.id} project={project} routePrefix={routePrefix}>
      {children}
    </ActiveRoom>
  );
}
function ActiveRoom({
  project,
  routePrefix,
  children,
}: {
  project: RoomProject;
  routePrefix: '/p' | '/demo' | '/pages';
  children: ReactNode;
}) {
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
      const path = `${routePrefix}/${project.id}/${target.state.clientId}${target.state.pageKey ? `/${target.state.pageKey}` : ''}`;
      if (location.pathname !== path) navigate(path, { replace: true });
    }
  }, [target?.state, project.id, routePrefix, navigate, location.pathname]);
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
    let pointing = false;
    const leave = () => {
      if (pointing) room.pointer(null);
      pointing = false;
    };
    const move = (event: PointerEvent) => {
      const surface =
        event.target instanceof Element
          ? (event.target.closest<HTMLElement>('[data-demo-dialog="order-detail"]') ??
            document.querySelector<HTMLElement>('[data-prototype-canvas]'))
          : null;
      const content = surface?.dataset.demoDialog
        ? surface.querySelector<HTMLElement>('[role="dialog"]')
        : surface;
      if (
        !content ||
        !content.contains(event.target as Node) ||
        (surface?.dataset.demoDialog && !effectiveDialog)
      ) {
        leave();
        return;
      }
      if (performance.now() - last < 80) return;
      last = performance.now();
      const rect = content.getBoundingClientRect();
      if (rect.width && rect.height) {
        pointing = true;
        room.pointer({
          x: (event.clientX - rect.left) / rect.width,
          y: (event.clientY - rect.top) / rect.height,
          surface: surface?.dataset.demoDialog ? `dialog:${effectiveDialog}` : `${clientId}/${pageKey}`,
        });
      }
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    return () => {
      leave();
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
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
  const { locale } = usePlatformLocale();
  const text = (hans: string, hant: string, en: string) =>
    locale === 'en' ? en : locale === 'zh-Hant' ? hant : hans;
  if (!context) return null;
  const { room, state } = context,
    me = state.participants.find((person) => person.id === state.id);
  const statuses: Record<string, string> = {
    在线: text('在线', '在線', 'Online'),
    连接中: text('连接中', '連線中', 'Connecting'),
    跟随已结束: text('跟随已结束', '跟隨已結束', 'Following ended'),
    需要刷新版本: text('需要刷新版本', '需要重新整理版本', 'Refresh required'),
    协作不可用: text('协作不可用', '協作無法使用', 'Collaboration unavailable'),
    '连接中断，正在重连': text('连接中断，正在重连', '連線中斷，正在重連', 'Reconnecting'),
  };
  return (
    <div className="native-collaboration-controls">
      <span className="text-meta">
        {statuses[state.status] ?? state.status} · {state.participants.length}{' '}
        {text('人', '人', state.participants.length === 1 ? 'person' : 'people')}
      </span>
      <Select
        aria-label={text('主动跟随', '主動跟隨', 'Follow participant')}
        placeholder={text('选择跟随对象', '選擇跟隨對象', 'Choose a participant')}
        value={me?.following ?? undefined}
        allowClear
        disabled={!state.id}
        onChange={(value) => {
          void room.follow(value ?? null);
        }}
        style={{ width: locale === 'en' ? 176 : 144, maxWidth: '100%' }}
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
          {text('退出跟随', '退出跟隨', 'Stop following')}
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
  const [rect, setRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    clipPath: string;
  } | null>(null);
  useEffect(() => {
    const measure = () => {
      const element = document.querySelector<HTMLElement>(
        dialog ? '[data-demo-dialog="order-detail"]' : '[data-prototype-canvas]',
      );
      const content = dialog ? element?.querySelector<HTMLElement>('[role="dialog"]') : element;
      const box = content?.getBoundingClientRect();
      if (!content || !box?.width || !box.height) {
        setRect(null);
        return;
      }
      let top = Math.max(0, box.top),
        left = Math.max(0, box.left),
        right = Math.min(window.innerWidth, box.right),
        bottom = Math.min(window.innerHeight, box.bottom);
      for (let parent = content.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        const bounds = parent.getBoundingClientRect();
        if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) {
          left = Math.max(left, bounds.left);
          right = Math.min(right, bounds.right);
        }
        if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
          top = Math.max(top, bounds.top);
          bottom = Math.min(bottom, bounds.bottom);
        }
      }
      setRect(
        right > left && bottom > top
          ? {
              left: box.left,
              top: box.top,
              width: box.width,
              height: box.height,
              clipPath: `inset(${top}px ${window.innerWidth - right}px ${window.innerHeight - bottom}px ${left}px)`,
            }
          : null,
      );
    };
    measure();
    const timer = setInterval(measure, 100);
    return () => clearInterval(timer);
  }, [surface, dialog]);
  if (!rect) return null;
  return (
    <div className="native-pointer-layer" style={{ clipPath: rect.clipPath }} aria-hidden>
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
