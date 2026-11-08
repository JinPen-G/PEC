/** Measures actual panel content so preview/code changes glide in height
 * without scaling the code or resetting the native prototype state. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { siteMotionTokens } from '@preview/ui';
export function AnimatedPanel({ children }: { children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setHeight(entry.borderBoxSize?.[0]?.blockSize ?? element.getBoundingClientRect().height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <motion.div
      className="showcase-animated-panel"
      initial={false}
      animate={{ height: height ?? 'auto' }}
      transition={reduced ? { duration: 0 } : siteMotionTokens.spring.smooth}
    >
      <div ref={content}>{children}</div>
    </motion.div>
  );
}
