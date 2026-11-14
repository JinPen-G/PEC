import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DevicePreview } from './DevicePreview';
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('fits a fullscreen Screen without per-frame React measurements or changing its native tree', () => {
  const observe = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = observe;
      disconnect() {}
    },
  );
  const child = <input aria-label="Fullscreen draft" defaultValue="Keep me" />;
  const view = render(
    <DevicePreview mobile={false} screen expanded>
      {child}
    </DevicePreview>,
  );
  const input = screen.getByLabelText('Fullscreen draft');
  expect(observe).not.toHaveBeenCalled();
  const scaler = view.container.querySelector('.showcase-device-scaler');
  expect(scaler).toHaveStyle({ width: '100%', height: '100%', transform: 'scale(1)' });
  expect(view.container.querySelector('.showcase-device-shell')).toHaveStyle({
    width: '100%',
    height: '100%',
  });
  view.rerender(
    <DevicePreview mobile={false} screen>
      {child}
    </DevicePreview>,
  );
  expect(screen.getByLabelText('Fullscreen draft')).toBe(input);
  expect(scaler).toHaveStyle({ width: '1440px', height: '900px' });
});
it('uses observer geometry without forcing another layout or collapsing hidden previews', () => {
  let notify: ResizeObserverCallback = () => {};
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        notify = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  const view = render(
    <DevicePreview mobile={false} screen>
      <input aria-label="Preview draft" />
    </DevicePreview>,
  );
  const host = view.container.querySelector('.showcase-device-host')!;
  const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get');
  act(() =>
    notify(
      [{ target: host, contentRect: { width: 720, height: 450 } } as ResizeObserverEntry],
      {} as ResizeObserver,
    ),
  );
  expect(width).not.toHaveBeenCalled();
  expect(view.container.querySelector('.showcase-device-scaler')).toHaveStyle({ transform: 'scale(0.5)' });
  act(() =>
    notify(
      [{ target: host, contentRect: { width: 0, height: 0 } } as ResizeObserverEntry],
      {} as ResizeObserver,
    ),
  );
  expect(view.container.querySelector('.showcase-device-scaler')).toHaveStyle({ transform: 'scale(0.5)' });
});
it('retains the same screen and draft when switching between scaled, phone and fullscreen layouts', async () => {
  const child = <input aria-label="Screen draft" defaultValue="" />;
  const view = render(
    <DevicePreview mobile={false} screen>
      {child}
    </DevicePreview>,
  );
  const input = screen.getByLabelText('Screen draft');
  fireEvent.change(input, { target: { value: 'Keep this draft' } });
  const scaler = view.container.querySelector('.showcase-device-scaler');
  expect(scaler).toHaveStyle({ width: '1440px', height: '900px' });
  view.rerender(
    <DevicePreview mobile screen>
      {child}
    </DevicePreview>,
  );
  await waitFor(() => expect(scaler).toHaveStyle({ width: '390px', height: '844px' }));
  view.rerender(
    <DevicePreview mobile={false} screen expanded>
      {child}
    </DevicePreview>,
  );
  expect(screen.getByLabelText('Screen draft')).toBe(input);
  expect(input).toHaveValue('Keep this draft');
  expect(view.container.querySelector('.showcase-device-scaler')).toBe(scaler);
});
it('keeps native form state and DOM identity across phone and full-size previews', () => {
  const child = <input aria-label="Draft" defaultValue="" />;
  const view = render(<DevicePreview mobile={false}>{child}</DevicePreview>);
  const input = screen.getByLabelText('Draft');
  const positionedScreen = view.container.querySelector('.showcase-device-screen');
  const scaler = view.container.querySelector('.showcase-device-scaler');
  fireEvent.change(input, { target: { value: 'Unsubmitted draft' } });
  view.rerender(<DevicePreview mobile>{child}</DevicePreview>);
  expect(screen.getByLabelText('Draft')).toBe(input);
  expect(input).toHaveValue('Unsubmitted draft');
  expect(view.container.querySelector('.preview-shell_bezel__I2eh4')).toBeInTheDocument();
  expect(view.container.querySelector('.showcase-device-screen')).toBe(positionedScreen);
  expect(view.container.querySelector('.showcase-device-scaler')).toBe(scaler);
  expect(view.container.querySelector('.showcase-device-shell')).toHaveAttribute('data-mode', 'mobile');
  view.rerender(<DevicePreview mobile={false}>{child}</DevicePreview>);
  expect(screen.getByLabelText('Draft')).toBe(input);
  expect(input).toHaveValue('Unsubmitted draft');
  expect(view.container.querySelector('.showcase-device-screen')).toBe(positionedScreen);
  expect(view.container.querySelector('.showcase-device-scaler')).toBe(scaler);
});
