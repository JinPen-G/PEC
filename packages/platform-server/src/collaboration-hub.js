/** Authenticated HTTP intent + SSE snapshots. Every send rechecks durable scope. */
import { randomUUID } from 'node:crypto';
import { setInterval, clearInterval } from 'node:timers';
import { fail } from '../../project-core/src/platform/store.js';
import { validatePointer, validatePresentation } from '../../platform-contracts/src/collaboration.js';

export function createCollaborationHub(store, { now = Date.now, timeout = 15_000 } = {}) {
  const connections = new Map();
  let revision = 0;
  function permitted(connection) {
    const session = store.authenticate(connection.token);
    if (!session || session.user.mustChangePassword) return false;
    try {
      const project = store.getCollaborationProject(session.user, connection.projectId);
      return (
        !project.archived && (!connection.state || Boolean(validatePresentation(connection.state, project)))
      );
    } catch {
      return false;
    }
  }
  const presentation = (connection) => connections.get(connection.following)?.state ?? connection.state;
  const participant = (connection) => ({
    id: connection.id,
    name: connection.name,
    following: connection.following,
    state: presentation(connection),
    pointer: connection.pointer,
  });
  function canRead(connection, state) {
    const session = store.authenticate(connection.token);
    if (!session) return false;
    try {
      return Boolean(
        validatePresentation(state, store.getCollaborationProject(session.user, connection.projectId)),
      );
    } catch {
      return false;
    }
  }
  function snapshot(recipient) {
    return {
      protocol: 1,
      revision: ++revision,
      participants: [...connections.values()]
        .filter(
          (connection) =>
            connection.projectId === recipient.projectId &&
            connection.response &&
            permitted(connection) &&
            (!presentation(connection) || canRead(recipient, presentation(connection))),
        )
        .map(participant),
    };
  }
  function send(connection) {
    const response = connection.response;
    if (!response || response.writableEnded || response.destroyed || !permitted(connection)) return;
    if (response.writableNeedDrain) {
      if (!connection.waitingDrain) {
        connection.waitingDrain = true;
        response.once('drain', () => {
          connection.waitingDrain = false;
          if (permitted(connection)) send(connection);
          else remove(connection.id);
        });
      }
      return;
    }
    response.write(`data: ${JSON.stringify(snapshot(connection))}\n\n`);
  }
  function remove(id, notify = true) {
    const connection = connections.get(id);
    if (!connection) return;
    connections.delete(id);
    connection.response?.end();
    for (const other of connections.values())
      if (other.following === id) {
        other.following = null;
        other.pointer = null;
      }
    if (notify) broadcast(connection.projectId);
  }
  function broadcast(projectId) {
    [...connections.values()]
      .filter((connection) => connection.projectId === projectId && !permitted(connection))
      .forEach((connection) => remove(connection.id, false));
    for (const connection of connections.values()) {
      if (connection.projectId !== projectId || !connection.following) continue;
      const target = connections.get(connection.following);
      if (!target?.response || !target.state || !canRead(connection, target.state)) {
        connection.following = null;
        connection.pointer = null;
      }
    }
    for (const connection of connections.values()) if (connection.projectId === projectId) send(connection);
  }
  function own(id, token) {
    const connection = connections.get(id);
    if (!connection || connection.token !== token || !permitted(connection))
      fail(404, '协作连接已失效', 'COLLABORATION_LOST');
    return connection;
  }
  const timer = setInterval(() => {
    const projects = new Set();
    for (const connection of connections.values())
      if (
        !permitted(connection) ||
        now() - connection.touched > timeout ||
        (!connection.response && now() - connection.created > 10_000)
      ) {
        projects.add(connection.projectId);
        remove(connection.id, false);
      }
    projects.forEach(broadcast);
  }, 2000);
  timer.unref();
  return {
    join(token, projectId) {
      const session = store.authenticate(token);
      if (!session) fail(401, '登录已失效', 'UNAUTHORIZED');
      store.getCollaborationProject(session.user, projectId);
      if (connections.size >= 200) fail(503, '协作连接已达容量上限', 'COLLABORATION_CAPACITY');
      const id = randomUUID();
      connections.set(id, {
        id,
        token,
        projectId,
        name: session.user.displayName,
        state: null,
        pointer: null,
        following: null,
        touched: now(),
        created: now(),
        pointerAt: 0,
        response: null,
      });
      return { id, protocol: 1 };
    },
    stream(id, token, response) {
      const connection = own(id, token);
      if (connection.response) fail(409, '协作连接已经订阅', 'CONFLICT');
      connection.response = response;
      connection.touched = now();
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      response.write(': connected\n\n');
      response.on('close', () => remove(id));
      response.on('error', () => remove(id));
      broadcast(connection.projectId);
    },
    command(id, token, input) {
      const connection = own(id, token);
      connection.touched = now();
      const session = store.authenticate(token),
        project = store.getCollaborationProject(session.user, connection.projectId);
      switch (input.type) {
        case 'heartbeat':
          break;
        case 'state': {
          const state = validatePresentation(input.state, project);
          if (!state) fail(400, '演示状态不在允许的协议范围内');
          if (connection.following) fail(409, '跟随期间不能发布独立演示状态', 'FOLLOWING');
          if (connection.state && state.sequence <= connection.state.sequence)
            fail(409, '演示序号已过期', 'STALE_SEQUENCE');
          connection.state = state;
          connection.pointer = null;
          broadcast(connection.projectId);
          break;
        }
        case 'pointer': {
          const pointer = validatePointer(input.pointer);
          if (pointer === undefined) fail(400, '指针位置无效');
          const state = presentation(connection);
          if (
            pointer &&
            (!state ||
              ![
                `${state.clientId}/${state.pageKey}`,
                ...(state.dialog ? [`dialog:${state.dialog.orderId}`] : []),
              ].includes(pointer.surface))
          )
            fail(400, '指针不属于当前演示表面');
          if (now() - connection.pointerAt < 60 && pointer) break;
          connection.pointerAt = now();
          connection.pointer = pointer;
          broadcast(connection.projectId);
          break;
        }
        case 'follow': {
          if (input.target === null) {
            connection.following = null;
            connection.pointer = null;
            broadcast(connection.projectId);
            break;
          }
          const target = connections.get(input.target);
          if (
            !target ||
            target.id === id ||
            target.projectId !== connection.projectId ||
            target.following ||
            !target.state ||
            !permitted(target) ||
            !validatePresentation(target.state, project)
          )
            fail(409, '跟随对象不可用，不能跟随自己或形成跟随链', 'FOLLOW_REJECTED');
          for (const other of connections.values()) if (other.following === id) other.following = null;
          connection.following = target.id;
          connection.pointer = null;
          broadcast(connection.projectId);
          break;
        }
        case 'leave':
          remove(id);
          break;
        default:
          fail(400, '协作命令无效');
      }
      return { accepted: true };
    },
    close() {
      clearInterval(timer);
      for (const id of [...connections.keys()]) remove(id, false);
    },
  };
}
