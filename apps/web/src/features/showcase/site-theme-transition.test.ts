import { describe, expect, test, vi } from 'vitest';
import {
  changeSiteTheme,
  type ThemeTransitionDocument,
  type ThemeTransitionState,
} from './site-theme-transition';
function fixture() {
  const state: ThemeTransitionState = { generation: 0, active: null };
  const document: ThemeTransitionDocument = {
    documentElement: { dataset: {}, style: { setProperty: vi.fn() } },
  };
  return { state, document };
}
describe('site theme transition', () => {
  test('unsupported and reduced motion switch directly without stale motion flags', () => {
    const { state, document } = fixture();
    const update = vi.fn();
    changeSiteTheme({ state, document, update, reduced: false, wipe: 'rise' });
    expect(update).toHaveBeenCalledOnce();
    expect(document.documentElement.dataset.previewThemeMotion).toBeUndefined();
    document.startViewTransition = vi.fn();
    changeSiteTheme({ state, document, update, reduced: true, wipe: 'rise' });
    expect(document.startViewTransition).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(2);
  });
  test('new switches cancel previous wipes and earlier cleanup cannot erase the latest transition', async () => {
    const { state, document } = fixture();
    const callbacks: (() => void)[] = [];
    const finish: (() => void)[] = [];
    const skipped = vi.fn();
    document.startViewTransition = vi.fn((update) => {
      callbacks.push(update);
      return { skipTransition: skipped, finished: new Promise<void>((resolve) => finish.push(resolve)) };
    });
    const first = vi.fn(),
      second = vi.fn();
    changeSiteTheme({
      state,
      document,
      update: first,
      reduced: false,
      wipe: 'rise',
      origin: { x: 10, y: 20 },
    });
    changeSiteTheme({ state, document, update: second, reduced: false, wipe: 'split' });
    expect(skipped).toHaveBeenCalledOnce();
    callbacks[0]();
    callbacks[1]();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    finish[0]();
    await Promise.resolve();
    expect(document.documentElement.dataset.previewThemeMotion).toBe('split');
    finish[1]();
    await Promise.resolve();
    expect(document.documentElement.dataset.previewThemeMotion).toBeUndefined();
    expect(state.active).toBeNull();
  });
  test('a failed browser transition still updates the theme', () => {
    const { state, document } = fixture();
    const update = vi.fn();
    document.startViewTransition = () => {
      throw new Error('unsupported state');
    };
    changeSiteTheme({ state, document, update, reduced: false, wipe: 'rise' });
    expect(update).toHaveBeenCalledOnce();
    expect(document.documentElement.dataset.previewThemeMotion).toBeUndefined();
  });
});
