/** One persistent highlight moves between rows. Selection survives route
 * changes and resize; initial measurement and reduced motion settle directly. */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { siteMotionTokens } from '@preview/ui';
export function SidebarSelection({ activeKey, children }: { activeKey: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const [position, setPosition] = useState<{
    y: number;
    x: number;
    width: number;
    height: number;
    glide: boolean;
  } | null>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      const selected = [...element.querySelectorAll<HTMLElement>('[data-sidebar-key]')].find(
        (row) => row.dataset.sidebarKey === activeKey,
      );
      if (!selected || !selected.getClientRects().length) {
        setPosition(null);
        return;
      }
      const row = selected.getBoundingClientRect(),
        container = element.getBoundingClientRect();
      const stable = (value: number) => Math.round(value * 10) / 10;
      const next = {
        y: stable(row.top - container.top + element.scrollTop),
        x: stable(row.left - container.left + element.scrollLeft),
        width: stable(row.width),
        height: stable(row.height),
        glide: mounted.current,
      };
      mounted.current = true;
      setPosition((old) =>
        old && old.y === next.y && old.x === next.x && old.width === next.width && old.height === next.height
          ? old
          : next,
      );
    };
    const schedule = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
    };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    const observed = new Set<Element>();
    const rowsChanged = () => {
      for (const row of element.querySelectorAll<HTMLElement>('[data-sidebar-key]')) {
        if (!observed.has(row)) {
          observed.add(row);
          observer.observe(row);
        }
      }
      for (const row of observed)
        if (!element.contains(row)) {
          observer.unobserve(row);
          observed.delete(row);
        }
      schedule();
    };
    rowsChanged();
    const mutations = new MutationObserver(rowsChanged);
    mutations.observe(element, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [activeKey]);
  return (
    <div
      className="library-sidebar_scroll__Tdgfx showcase-sidebar-selection"
      ref={root}
      data-active-key={activeKey}
    >
      {position && (
        <>
          <motion.span
            aria-hidden="true"
            className="library-sidebar_pill__3Ni4t showcase-sidebar-pill"
            initial={false}
            animate={{ x: position.x, y: position.y, width: position.width, height: position.height }}
            transition={reduced || !position.glide ? { duration: 0 } : siteMotionTokens.spring.morph}
          />
        </>
      )}
      {children}
    </div>
  );
}
