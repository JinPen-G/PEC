/** Scrubs the approved deck at the orbit's scroll position; no autoplay clock. */
import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { useShouldReduceMotion } from '@animate-ui/react/utils/motion';
import { useMotionValueEvent, type MotionValue } from 'motion/react';
import { createBrandArtwork } from '../../brand-artwork';
import { brandCards, getBrandShuffleState } from '../../brand-opening';

export function ShuffleLogo({ progress }: { progress: MotionValue<number> }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const mount = useRef<HTMLSpanElement>(null);
  const paint = useRef<((percent: number) => void) | null>(null);
  const reduce = useShouldReduceMotion();
  useMotionValueEvent(progress, 'change', (percent) => paint.current?.(reduce ? 0 : percent));
  useLayoutEffect(() => {
    if (!mount.current) return;
    const { iconMount, logo } = createBrandArtwork(`landing-${id}`);
    iconMount.className = 'home-shuffle-artwork';
    logo.setAttribute('class', 'home-shuffle-symbol');
    logo.setAttribute('viewBox', '0 0 512 512');
    const pieces = brandCards.map((_, index) => logo.querySelector<SVGGElement>(`[data-card="${index}"]`)!);
    const wrappers = brandCards.map((_, index) =>
      logo.querySelector<SVGGElement>(`[data-card-wrapper="${index}"]`)!,
    );
    const occluders = brandCards.map((_, index) =>
      logo.querySelector<SVGGElement>(`[data-occluder="${index}"]`)!,
    );
    const masks = brandCards.map((_, index) => logo.querySelector<SVGMaskElement>(`[data-mask="${index}"]`)!);
    const drawing = logo.querySelector<SVGGElement>('[data-drawing]')!;
    let order = '';
    paint.current = (percent) => {
      if (mount.current) mount.current.dataset.shuffleProgress = String(Math.round(percent * 1000) / 1000);
      const next =
        percent < 22 || percent >= 67
          ? [0, 1, 2, 3]
          : percent < 37
            ? [3, 0, 1, 2]
            : percent < 52
              ? [2, 3, 0, 1]
              : [1, 2, 3, 0];
      if (order !== next.join(',')) {
        next.forEach((index) => drawing.append(wrappers[index]));
        next.forEach((index, position) =>
          masks[index].querySelector('[data-mask-uses]')!.replaceChildren(
            ...next.slice(position + 1).map((above) => {
              const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
              use.setAttribute('href', `#${occluders[above].id}`);
              return use;
            }),
          ),
        );
        order = next.join(',');
      }
      getBrandShuffleState(percent).forEach(([x, y, angle, scale], index) => {
        const card = brandCards[index];
        const radians = ((angle - card.angle) * Math.PI) / 180;
        const a = scale * Math.cos(radians),
          b = scale * Math.sin(radians),
          c = -b;
        const transform = `matrix(${[a, b, c, a, x - a * card.cx - c * card.cy, y - b * card.cx - a * card.cy].map((value) => Math.round(value * 100000) / 100000).join(' ')})`;
        pieces[index].setAttribute('transform', transform);
        occluders[index].setAttribute('transform', transform);
      });
    };
    paint.current(0);
    mount.current.append(iconMount);
    return () => {
      paint.current = null;
      iconMount.remove();
    };
  }, [id]);
  useEffect(() => {
    paint.current?.(reduce ? 0 : progress.get());
  }, [progress, reduce]);
  return <span ref={mount} className="home-shuffle-logo" data-trigger="scroll" aria-hidden="true" />;
}
