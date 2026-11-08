import { act, renderHook } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { setMotionPreference } from './motion-preferences';
import { usePrefersReducedMotion } from './use-motion-preference';

test('full motion overrides the OS and reduced motion updates mounted controls', () => {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  } as unknown as MediaQueryList);
  setMotionPreference('system');
  const hook = renderHook(usePrefersReducedMotion);
  expect(hook.result.current).toBe(true);
  act(() => setMotionPreference('full'));
  expect(hook.result.current).toBe(false);
  act(() => setMotionPreference('reduced'));
  expect(hook.result.current).toBe(true);
  hook.unmount();
  setMotionPreference('system');
  localStorage.removeItem('preview:motion');
});
