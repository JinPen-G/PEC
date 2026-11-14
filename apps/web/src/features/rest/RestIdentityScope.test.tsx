import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Link, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { RestIdentityScope } from './RestIdentityScope';
import { useRest } from './rest-context';
import type { RestPlayer } from './rest-player';
import { useEffect } from 'react';

const auth = vi.hoisted(() => ({
  session: { user: null as null | { id: string; role: string; revision: number } },
}));
vi.mock('@/features/platform/platform-api', () => ({ useNativeAuth: () => auth }));
vi.mock('./rest-track', () => ({ REST_TRACK: { title: 'Test track', artist: '', artwork: '/cover.png' } }));
vi.mock('./RestExperience', () => ({ default: () => null }));
let controller: RestPlayer;

function Surface({ name }: { name: string }) {
  const { player, snapshot } = useRest();
  useEffect(() => {
    controller = player;
  }, [player]);
  return (
    <>
      <h1>{name}</h1>
      <output aria-label="Rest state">
        {snapshot.phase}:{snapshot.remaining}:{String(snapshot.expanded)}
      </output>
    </>
  );
}
function App() {
  return (
    <RestIdentityScope>
      <Link to="/">Home</Link>
      <Link to="/docs">Docs</Link>
      <Link to="/demo">Demo</Link>
      <Link to="/manage">Admin</Link>
      <Routes>
        <Route path="/" element={<Surface name="Home page" />} />
        <Route path="/docs" element={<Surface name="Project docs" />} />
        <Route path="/demo" element={<Surface name="Demo page" />} />
        <Route path="/manage" element={<Surface name="Management page" />} />
      </Routes>
    </RestIdentityScope>
  );
}
afterEach(() => {
  cleanup();
  auth.session.user = null;
});

it('shares one controller across public pages, project docs, demo and administration', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  const original = controller;
  act(() => {
    controller.start(30);
    controller.minimize();
  });
  for (const name of ['Docs', 'Demo', 'Admin', 'Home']) {
    fireEvent.click(screen.getByRole('link', { name }));
    expect(controller).toBe(original);
    expect(screen.getByLabelText('Rest state')).toHaveTextContent('preparing:1800:false');
  }
});

it('disposes the old break after login, logout or account revision changes', () => {
  const view = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  for (const user of [
    { id: 'reader', role: 'member', revision: 1 },
    { id: 'reader', role: 'member', revision: 2 },
    null,
  ]) {
    const previous = controller;
    const dispose = vi.spyOn(previous, 'dispose');
    act(() => previous.start(10));
    auth.session.user = user;
    view.rerender(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(controller).not.toBe(previous);
    expect(screen.getByLabelText('Rest state')).toHaveTextContent('idle:600:true');
  }
});
