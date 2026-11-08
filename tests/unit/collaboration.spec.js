// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { EventEmitter } from 'node:events';
import { createCollaborationHub } from '../../packages/platform-server/src/collaboration-hub.js';
import { validatePresentation } from '../../packages/platform-contracts/src/collaboration.js';

const rooms = [];
afterEach(() => rooms.splice(0).forEach((room) => room.close()));
const project = {
  id: 'project-a',
  moduleKey: 'rental-orders',
  archived: false,
  clients: [{ id: 'admin', enabled: true, pages: [{ key: 'orders', visible: true }] }],
};
const state = (sequence) => ({ protocol: 1, sequence, clientId: 'admin', pageKey: 'orders', dialog: null });
class Stream extends EventEmitter {
  chunks = [];
  writableEnded = false;
  writeHead() {}
  write(value) {
    this.chunks.push(value);
  }
  end() {
    this.writableEnded = true;
  }
  latest() {
    return JSON.parse(
      this.chunks
        .filter((value) => value.startsWith('data: '))
        .at(-1)
        .slice(6),
    );
  }
}
function setup() {
  const denied = new Set();
  const store = {
    authenticate: (token) => (denied.has(token) ? null : { user: { id: token, displayName: token } }),
    getProject: (user, id) => {
      if (denied.has(user.id) || id !== 'project-a') throw new Error('Denied');
      return project;
    },
    projectAccess: (user, id) => {
      if (denied.has(user.id) || id !== 'project-a') throw new Error('Denied');
    },
  };
  const room = createCollaborationHub(store);
  rooms.push(room);
  const a = room.join('A', 'project-a').id,
    b = room.join('B', 'project-a').id,
    c = room.join('C', 'project-a').id;
  const first = new Stream(),
    second = new Stream(),
    third = new Stream();
  room.stream(a, 'A', first);
  room.stream(b, 'B', second);
  room.stream(c, 'C', third);
  return { room, denied, a, b, c, first, second, third };
}
test('late join receives latest snapshot; only active followers identify a target', () => {
  const { room, a, b, c, second, third } = setup();
  room.command(a, 'A', {
    type: 'state',
    state: { ...state(1), dialog: { key: 'order-detail', orderId: 'demo-order-001' } },
  });
  room.command(b, 'B', { type: 'follow', target: a });
  expect(second.latest().participants.find((person) => person.id === b).following).toBe(a);
  expect(third.latest().participants.find((person) => person.id === c).following).toBeNull();
  const d = room.join('D', 'project-a').id,
    fourth = new Stream();
  room.stream(d, 'D', fourth);
  expect(fourth.latest().participants.find((person) => person.id === a).state.dialog.orderId).toBe(
    'demo-order-001',
  );
  room.command(b, 'B', { type: 'follow', target: null });
  expect(second.latest().participants.find((person) => person.id === b).following).toBeNull();
});
test('self-follow, loops, chains and stale state cannot cross the room protocol', () => {
  const { room, a, b, c } = setup();
  room.command(a, 'A', { type: 'state', state: state(1) });
  expect(() => room.join('A', 'project-b')).toThrow('Denied');
  expect(() =>
    room.command(a, 'A', { type: 'pointer', pointer: { x: 0.5, y: 0.5, surface: 'mobile/orders' } }),
  ).toThrow('表面');
  room.command(c, 'C', { type: 'state', state: state(1) });
  expect(() => room.command(a, 'A', { type: 'follow', target: a })).toThrow('自己');
  room.command(b, 'B', { type: 'follow', target: a });
  expect(() => room.command(c, 'C', { type: 'follow', target: b })).toThrow('跟随链');
  expect(() => room.command(a, 'A', { type: 'state', state: state(1) })).toThrow('过期');
  expect(() => room.command(b, 'B', { type: 'state', state: state(2) })).toThrow('跟随期间');
  expect(() => room.command(a, 'B', { type: 'heartbeat' })).toThrow('失效');
});
test('revoked recipients stop receiving immediately and leaders leaving ends follow', () => {
  const { room, denied, a, b, first, second } = setup();
  room.command(a, 'A', { type: 'state', state: state(1) });
  room.command(b, 'B', { type: 'follow', target: a });
  denied.add('A');
  room.command(b, 'B', { type: 'pointer', pointer: null });
  expect(first.writableEnded).toBe(true);
  expect(second.latest().participants.some((person) => person.id === a)).toBe(false);
  expect(second.latest().participants.find((person) => person.id === b).following).toBeNull();
});
test('presentation schema strips unknown data and rejects real commands/password fields', () => {
  expect(validatePresentation({ ...state(1), password: 'never-shared', account: 'admin' }, project)).toEqual(
    state(1),
  );
  expect(validatePresentation({ ...state(1), pageKey: 'accounts' }, project)).toBeNull();
  expect(
    validatePresentation({ ...state(1), dialog: { key: 'payment', orderId: 'demo-order-001' } }, project),
  ).toBeNull();
  expect(
    validatePresentation(
      { ...state(1), clientId: 'empty', pageKey: '' },
      { ...project, clients: [{ id: 'empty', enabled: true, pages: [] }] },
    ),
  ).toMatchObject({ clientId: 'empty', pageKey: '', dialog: null });
  expect(
    validatePresentation(
      { ...state(1), dialog: { key: 'order-detail', orderId: 'real-order-secret' } },
      project,
    ),
  ).toBeNull();
});

test('slow SSE recipients drop intermediate snapshots and receive the latest state after draining', () => {
  const { room, a, b, second } = setup();
  room.command(a, 'A', { type: 'state', state: state(1) });
  const count = second.chunks.length;
  second.writableNeedDrain = true;
  room.command(a, 'A', { type: 'state', state: state(2) });
  room.command(a, 'A', { type: 'state', state: state(3) });
  expect(second.chunks.length).toBe(count);
  expect(second.listenerCount('drain')).toBe(1);
  second.writableNeedDrain = false;
  second.emit('drain');
  expect(second.latest().participants.find((person) => person.id === a).state.sequence).toBe(3);
  expect(second.latest().participants.find((person) => person.id === b)).toBeDefined();
});
