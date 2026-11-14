/** Hosts the same brand nodes and clock that start before the application bundle. */
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createBrandArtwork } from './brand-artwork';
import { claimBrandBoot } from './brand-boot';
import { startBrandOpening, type BrandOpeningController } from './brand-opening';
import './brand-opening.css';

export function BrandOpening({
  playIntro = false,
  reducedMotion = false,
  skipLabel = '跳过开场',
  onStart,
  onReveal,
  onComplete,
}: {
  playIntro?: boolean;
  reducedMotion?: boolean;
  skipLabel?: string;
  onStart?(): void;
  onReveal?(): void;
  onComplete?(): void;
}) {
  const id = useId().replaceAll(':', '');
  const iconSlot = useRef<HTMLSpanElement>(null),
    wordSlot = useRef<HTMLSpanElement>(null),
    reserve = useRef<HTMLSpanElement>(null);
  const [initialPlay] = useState(playIntro && !reducedMotion);
  const callbacks = useRef({ onStart, onReveal, onComplete });
  const notified = useRef({ start: false, reveal: false, complete: false });
  const owner = useRef<{ controller: BrandOpeningController; generation: number } | null>(null);
  useLayoutEffect(() => {
    callbacks.current = { onStart, onReveal, onComplete };
  }, [onStart, onReveal, onComplete]);
  useLayoutEffect(() => {
    if (!iconSlot.current || !wordSlot.current || !reserve.current) return;
    const surface = iconSlot.current.closest<HTMLElement>('.preview-showcase');
    if (!surface) return;
    const host = {
      surface,
      iconSlot: iconSlot.current,
      wordSlot: wordSlot.current,
      reserve: reserve.current,
      skipLabel,
      onStart: () => {
        if (notified.current.start) return;
        notified.current.start = true;
        callbacks.current.onStart?.();
      },
      onReveal: () => {
        if (notified.current.reveal) return;
        notified.current.reveal = true;
        callbacks.current.onReveal?.();
      },
      onComplete: () => {
        if (notified.current.complete) return;
        notified.current.complete = true;
        callbacks.current.onComplete?.();
      },
    };
    let instance = owner.current;
    if (!instance) {
      const boot = claimBrandBoot();
      const controller =
        boot?.controller ?? startBrandOpening({ ...host, ...createBrandArtwork(id), play: initialPlay });
      instance = { controller, generation: 0 };
      owner.current = instance;
      if (boot) {
        controller.attach(host);
        boot.release();
      }
    } else instance.controller.attach(host);
    instance.generation++;
    return () => {
      instance.controller.suspend();
      const generation = ++instance.generation;
      // StrictMode remounts in the same turn; keep its native SVG and elapsed animation clock.
      queueMicrotask(() => {
        if (instance.generation === generation) {
          instance.controller.dispose();
          owner.current = null;
        }
      });
    };
  }, [id, initialPlay, skipLabel]);
  useLayoutEffect(() => {
    if (reducedMotion) owner.current?.controller.finish();
  }, [reducedMotion]);
  return (
    <span className="brand-opening" aria-hidden="true">
      <span ref={iconSlot} className="brand-opening-icon-slot" />
      <span ref={wordSlot} className="brand-opening-word-slot">
        <span ref={reserve} className="brand-opening-reserve">
          Preview.
        </span>
      </span>
    </span>
  );
}
