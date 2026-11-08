/** The reference fullscreen surface grows from the preview's actual bounds.
 * The native mount moves into this surface and returns after exit, preserving
 * drafts and local state instead of creating a second prototype instance. */
import { useLayoutEffect, useState, type RefObject } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { siteMotionTokens } from '@preview/ui';
import { useShowcaseText } from './showcase-locale';
export interface PreviewBounds {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: number;
}

function FullscreenSurface({
  title,
  nativeRef,
  mobile,
  initialBounds,
}: {
  title: string;
  nativeRef: RefObject<HTMLDivElement | null>;
  mobile: boolean;
  initialBounds?: PreviewBounds | null;
}) {
  const text = useShowcaseText(),
    reduced = useReducedMotion();
  const [origin] = useState(initialBounds);
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  useLayoutEffect(() => {
    const nativeElement = nativeRef.current;
    if (!host || !nativeElement) return;
    const parent = nativeElement.parentNode,
      next = nativeElement.nextSibling;
    host.appendChild(nativeElement);
    return () => {
      if (parent) parent.insertBefore(nativeElement, next?.parentNode === parent ? next : null);
    };
  }, [host, nativeRef]);
  const full = { top: 0, left: 0, width: viewport.width, height: viewport.height, borderRadius: 0 };
  return (
    <>
      <Dialog.Overlay asChild forceMount>
        <motion.div
          className="preview-shell_backdrop__NLgKf"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reduced ? 0 : siteMotionTokens.duration.standard,
            ease: [...siteMotionTokens.ease.standard],
          }}
        />
      </Dialog.Overlay>
      <Dialog.Content
        asChild
        forceMount
        aria-describedby={undefined}
        onInteractOutside={(event) => {
          // The retained React tree has its original ancestors. Radix's React
          // capture flag can therefore call an inside native click "outside";
          // physical containment is authoritative for this transferred mount.
          const target = event.detail.originalEvent.target;
          if (target instanceof Node && nativeRef.current?.contains(target)) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (nativeRef.current?.querySelector('[role="dialog"]')) event.preventDefault();
        }}
      >
        <motion.div
          className="preview-shell_panel__Pc6kR showcase-fullscreen-panel"
          style={{ right: 'auto', bottom: 'auto' }}
          initial={origin && !reduced ? { ...origin } : { ...full, opacity: 0 }}
          animate={{ ...full, opacity: 1 }}
          exit={
            origin && !reduced
              ? {
                  ...origin,
                  opacity: 0,
                  transition: {
                    ...siteMotionTokens.spring.smooth,
                    opacity: {
                      duration: siteMotionTokens.duration.standard,
                      delay: 0.12,
                      ease: [...siteMotionTokens.ease.standard],
                    },
                  },
                }
              : { opacity: 0 }
          }
          transition={reduced ? { duration: 0 } : siteMotionTokens.spring.smooth}
        >
          <div className="preview-shell_panelHead__Ir8ix">
            <Dialog.Title className="preview-shell_panelTitle__Sombi">{title}</Dialog.Title>
            <Dialog.Close className="preview-shell_close__sM5M3" aria-label={text('关闭放大预览')}>
              <X size={16} />
            </Dialog.Close>
          </div>
          <div className="preview-shell_panelBody__FXaKS" data-mode={mobile ? 'mobile' : 'fit'}>
            <div ref={setHost} className="showcase-fullscreen-native" />
          </div>
        </motion.div>
      </Dialog.Content>
    </>
  );
}
export function FullscreenPreview({
  open,
  onOpenChange,
  title,
  mobile,
  nativeRef,
  initialBounds,
  onExitComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  mobile: boolean;
  nativeRef: RefObject<HTMLDivElement | null>;
  initialBounds?: PreviewBounds | null;
  onExitComplete?: () => void;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <div ref={setContainer} className="showcase-layer-portal" />
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <AnimatePresence onExitComplete={onExitComplete}>
          {open && (
            <Dialog.Portal forceMount container={container}>
              <FullscreenSurface
                title={title}
                mobile={mobile}
                nativeRef={nativeRef}
                initialBounds={initialBounds}
              />
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}
