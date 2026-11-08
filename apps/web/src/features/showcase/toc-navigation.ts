/** Own one short page scroll, so a new chapter, manual input or route change
 * can stop it. Native scrollIntoView also scrolls ancestors and has a slow start. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { animate } from 'motion';
import { siteMotionTokens } from '@preview/ui';
import { activeTocSection } from './toc-position';

let ongoing: { stop: () => void } | null = null;
export function cancelShowcaseScroll() {
  ongoing?.stop();
  ongoing = null;
}
export function prepareShowcaseRoute() {
  cancelShowcaseScroll();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
export function chapterScrollTop(top: number, scrollTop: number, margin: number, max: number) {
  return Math.min(Math.max(0, max), Math.max(0, scrollTop + top - margin));
}

export function useTocNavigation(ids: string[], threshold = 120) {
  const key = ids.join(',');
  const [active, setActive] = useState(ids[0] ?? '');
  const requested = useRef<string | null>(null);
  const ownScroll = useRef<{ stop: () => void } | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (requested.current) return;
      const sections = key.split(',').flatMap((id) => {
        const element = document.getElementById(id);
        return element ? [{ id, top: element.getBoundingClientRect().top }] : [];
      });
      const next = activeTocSection(
        sections,
        {
          scrollTop: window.scrollY,
          height: window.innerHeight,
          scrollHeight: document.documentElement.scrollHeight,
        },
        threshold,
      );
      if (next) setActive(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const interrupt = () => {
      ownScroll.current?.stop();
      requested.current = null;
      schedule();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) interrupt();
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('wheel', interrupt, { passive: true });
    window.addEventListener('touchstart', interrupt, { passive: true });
    window.addEventListener('keydown', keyboard);
    return () => {
      cancelAnimationFrame(frame);
      ownScroll.current?.stop();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('wheel', interrupt);
      window.removeEventListener('touchstart', interrupt);
      window.removeEventListener('keydown', keyboard);
    };
  }, [key, threshold]);

  const scrollTo = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    cancelShowcaseScroll();
    const from = window.scrollY;
    const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 88;
    const top = chapterScrollTop(
      element.getBoundingClientRect().top,
      from,
      margin,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    requested.current = id;
    setActive(id);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || Math.abs(top - from) < 1) {
      window.scrollTo({ top, behavior: 'instant' });
      requested.current = null;
      return;
    }
    const controls = animate(from, top, {
      duration: 0.28,
      ease: [...siteMotionTokens.ease.enter],
      onUpdate: (value) => window.scrollTo({ top: value, behavior: 'instant' }),
      onComplete: () => {
        if (ongoing !== run) return;
        requested.current = null;
        ongoing = null;
        ownScroll.current = null;
      },
    });
    const run = {
      stop: () => {
        controls.stop();
        requested.current = null;
        if (ongoing === run) ongoing = null;
        ownScroll.current = null;
      },
    };
    ownScroll.current = run;
    ongoing = run;
  }, []);
  return { active, scrollTo };
}
