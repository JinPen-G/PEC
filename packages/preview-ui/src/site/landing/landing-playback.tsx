/** Shared visibility and interaction gates for the homepage's illustrative loops. */
import { createContext, use, useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { useShouldReduceMotion } from '@animate-ui/react/utils/motion';

const PausedContext = createContext(false);
const subscribeVisibility = (notify: () => void) => {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
};
export function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => !document.hidden,
    () => true,
  );
}
export function AutoplayScope({ paused, children }: { paused: boolean; children: ReactNode }) {
  return <PausedContext value={paused}>{children}</PausedContext>;
}
export function usePlaybackPaused() {
  const paused = use(PausedContext);
  const reduce = useShouldReduceMotion();
  const visible = usePageVisible();
  return paused || reduce || !visible;
}
export function useAutoplay(step: () => void, every: number, offset = 0) {
  const paused = usePlaybackPaused();
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });
  useEffect(() => {
    if (paused) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      stepRef.current();
      interval = setInterval(() => stepRef.current(), every);
    }, offset);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [paused, every, offset]);
}
