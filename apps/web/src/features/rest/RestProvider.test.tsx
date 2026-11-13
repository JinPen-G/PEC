import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RestProvider } from './RestProvider';
import { RestEntry } from './RestEntry';
import { useRest } from './rest-context';
import { createRestPlayer, type RestPlayer } from './rest-player';
import { PlatformLocaleProvider } from '@/features/locale/platform-locale';

vi.mock('./RestExperience', () => ({
  default: function RestExperience() {
    const { snapshot } = useRest();
    return snapshot.phase === 'idle' ? null : <div data-testid="rest-layer" />;
  },
}));

let player: RestPlayer | undefined;
afterEach(() => {
  cleanup();
  player?.dispose();
  player = undefined;
  localStorage.clear();
});

function Status() {
  const { snapshot } = useRest();
  return (
    <output aria-label="Rest state">
      {snapshot.phase}:{snapshot.remaining}:{String(snapshot.expanded)}
    </output>
  );
}

function createPlayer() {
  player = createRestPlayer({ track: { title: 'Local music', artist: '', artwork: '/cover.png' } });
  return player;
}

describe('break host lifetime', () => {
  it('keeps subscriptions alive through StrictMode setup and cleanup', async () => {
    const controller = createPlayer();
    render(
      <StrictMode>
        <RestProvider controller={controller}>
          <Status />
        </RestProvider>
      </StrictMode>,
    );
    act(() => controller.start(10));
    expect(screen.getByLabelText('Rest state')).toHaveTextContent('preparing:600:true');
    await screen.findByTestId('rest-layer');
    act(() => controller.minimize());
    expect(screen.getByLabelText('Rest state')).toHaveTextContent('preparing:600:false');
    act(() => controller.expand());
    expect(screen.getByLabelText('Rest state')).toHaveTextContent('preparing:600:true');
  });

  it('does not reset workspace inputs on expand, minimize or close', async () => {
    const controller = createPlayer();
    render(
      <RestProvider controller={controller}>
        <input aria-label="Unsaved project name" defaultValue="Draft" />
        <Status />
      </RestProvider>,
    );
    const draft = screen.getByLabelText('Unsaved project name');
    fireEvent.change(draft, { target: { value: 'My unsaved name' } });
    act(() => controller.start(30));
    await screen.findByTestId('rest-layer');
    act(() => controller.minimize());
    act(() => controller.expand());
    act(() => controller.close());
    expect(screen.getByLabelText('Unsaved project name')).toBe(draft);
    expect(draft).toHaveValue('My unsaved name');
    expect(screen.queryByTestId('rest-layer')).not.toBeInTheDocument();
  });

  it('offers both durations and reopens the active session from its toolbar entry', async () => {
    const controller = createPlayer();
    render(
      <PlatformLocaleProvider>
        <RestProvider controller={controller}>
          <RestEntry />
          <Status />
        </RestProvider>
      </PlatformLocaleProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: '选择休息时长' }));
    expect(await screen.findByRole('button', { name: '休息 10 分钟' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '休息 30 分钟' }));
    await waitFor(() => expect(controller.snapshot()).toMatchObject({ phase: 'preparing', minutes: 30 }));
    expect(screen.getByRole('button', { name: '展开休息播放器' })).toHaveTextContent('30:00');
    act(() => controller.minimize());
    fireEvent.click(screen.getByRole('button', { name: '展开休息播放器' }));
    expect(controller.snapshot().expanded).toBe(true);
  });

  it('shows only the public break icon while keeping durations and player reopening available', async () => {
    const controller = createPlayer();
    render(
      <PlatformLocaleProvider>
        <RestProvider controller={controller}>
          <RestEntry surface="site" />
        </RestProvider>
      </PlatformLocaleProvider>,
    );
    const trigger = screen.getByRole('button', { name: '选择休息时长' });
    expect(trigger.textContent).toBe('');
    expect(trigger.querySelectorAll('svg')).toHaveLength(1);
    expect(trigger).toHaveAttribute('title', '选择休息时长');
    fireEvent.click(trigger);
    expect(await screen.findByRole('button', { name: '休息 30 分钟' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '休息 10 分钟' }));
    await waitFor(() => expect(controller.snapshot()).toMatchObject({ phase: 'preparing', minutes: 10 }));
    const activeTrigger = screen.getByRole('button', { name: '展开休息播放器' });
    expect(activeTrigger.textContent).toBe('');
    expect(activeTrigger).toHaveAttribute('title', '展开休息播放器 · 10:00');
    act(() => controller.minimize());
    fireEvent.click(activeTrigger);
    expect(controller.snapshot().expanded).toBe(true);
  });

  it('checks elapsed wall time on tab visibility and page restoration, pauses on pagehide and disposes on host exit', () => {
    const controller = createPlayer();
    const check = vi.spyOn(controller, 'checkDeadline');
    const pause = vi.spyOn(controller, 'pause');
    const dispose = vi.spyOn(controller, 'dispose');
    const mounted = render(
      <RestProvider controller={controller}>
        <Status />
      </RestProvider>,
    );
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('pageshow'));
      window.dispatchEvent(new Event('pagehide'));
    });
    expect(check).toHaveBeenCalledTimes(2);
    expect(pause).toHaveBeenCalledTimes(1);
    mounted.unmount();
    expect(dispose).toHaveBeenCalledTimes(1);
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('pageshow'));
    expect(check).toHaveBeenCalledTimes(2);
  });
});
