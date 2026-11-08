/** Keep one marker in list coordinates. Its spring is independent of page
 * scrolling, which otherwise cancels shared-layout movement between headings. */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { siteMotionTokens } from '@preview/ui';

export function TocSelection({ activeKey, children }: { activeKey: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ y: number; height: number } | null>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => {
      const selected = element.querySelector<HTMLElement>('button[aria-current="location"]');
      if (!selected || !selected.getClientRects().length) {
        setPosition(null);
        return;
      }
      const rect = selected.getBoundingClientRect();
      const next = {
        y: Math.round((rect.top - element.getBoundingClientRect().top + 4) * 10) / 10,
        height: Math.max(1, rect.height - 8),
      };
      setPosition((old) => (old?.y === next.y && old.height === next.height ? old : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [activeKey]);
  return (
    <div ref={root} className="showcase-toc-selection">
      <ul>{children}</ul>
      {position && (
        <motion.span
          aria-hidden="true"
          className="showcase-toc-marker"
          initial={false}
          animate={{ y: position.y, height: position.height }}
          transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
        />
      )}
    </div>
  );
}
