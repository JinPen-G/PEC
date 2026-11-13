/** One native tree and one positioned screen animate together. Keeping numeric
 * bounds avoids the transient zero-height frame of an auto/absolute swap. */
import { useLayoutEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { siteMotionTokens } from '@preview/ui';
import { screenPreviewBounds } from './screen-preview';
import './screen-preview.css';
export function DevicePreview({
  mobile,
  children,
  maxWidth = 332,
  screen = false,
  expanded = false,
}: {
  mobile: boolean;
  children: ReactNode;
  maxWidth?: number;
  screen?: boolean;
  expanded?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(332);
  const [fitHeight, setFitHeight] = useState(520);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const element = host.current;
    if (!element) return;
    // Hidden preview tabs retain their last valid bounds rather than collapsing.
    const measure = () => {
      if (element.clientWidth > 0) setAvailable(element.clientWidth);
      const fullscreen = element.closest<HTMLElement>('.showcase-fullscreen-native');
      if (fullscreen) {
        const style = getComputedStyle(fullscreen);
        const height =
          fullscreen.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
        if (height > 0) setFitHeight(height);
      } else if (!mobile && !screen) {
        const canvas = element.closest<HTMLElement>('.showcase-preview');
        setFitHeight(canvas?.clientHeight || 520);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const canvas = element.closest('.showcase-preview');
    if (canvas) observer.observe(canvas);
    const fullscreen = element.closest('.showcase-fullscreen-native');
    if (fullscreen) observer.observe(fullscreen);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [mobile, screen, expanded]);
  const phoneWidth = Math.max(180, Math.min(maxWidth, available));
  const scale = (phoneWidth - 20) / 390;
  const bounds = screenPreviewBounds({
    available,
    fitHeight,
    mobile,
    expanded,
    maxWidth: expanded ? maxWidth : 280,
  });
  const transition = reduced || screen ? { duration: 0 } : siteMotionTokens.spring.smooth;
  const Scaler = screen ? 'div' : motion.div;
  const scalerBounds = {
    width: screen ? bounds.width : mobile ? 390 : available,
    height: screen ? bounds.height : mobile ? 844 : fitHeight,
  };
  return (
    <div
      ref={host}
      className={`showcase-device-host${mobile ? ' phone' : ''}`}
      data-screen={screen || undefined}
    >
      <motion.div
        className="preview-shell_shell__OFjTY showcase-device-shell"
        data-mode={mobile ? 'mobile' : 'fit'}
        initial={false}
        animate={{
          width: screen ? bounds.frameWidth : mobile ? phoneWidth : available,
          height: screen ? bounds.frameHeight : mobile ? 844 * scale + 20 : fitHeight,
          borderRadius: mobile ? (screen ? 30 : 46) : 0,
        }}
        transition={transition}
      >
        {!screen && (
          <motion.div
            className="preview-shell_bezel__I2eh4"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: mobile ? 1 : 0 }}
            transition={transition}
          />
        )}
        <motion.div
          className="showcase-device-screen"
          initial={false}
          animate={{ inset: mobile && !screen ? 10 : 0, borderRadius: mobile ? (screen ? 30 : 36) : 0 }}
          transition={transition}
        >
          <Scaler
            className="showcase-device-scaler"
            {...(!screen && {
              initial: false as const,
              animate: { ...scalerBounds, scale: mobile ? scale : 1 },
              transition,
            })}
            style={
              {
                ...(screen && { ...scalerBounds, transform: `scale(${bounds.scale})` }),
                '--preview-screen-height': `${screen ? bounds.height : mobile ? 844 : fitHeight}px`,
              } as CSSProperties
            }
          >
            <motion.div
              className="showcase-device-native"
              initial={false}
              animate={{
                paddingTop: screen ? 0 : 24,
                paddingBottom: screen ? 0 : 24,
                paddingLeft: screen ? 0 : mobile ? 18 : 24,
                paddingRight: screen ? 0 : mobile ? 18 : 24,
              }}
              transition={transition}
            >
              <div className="showcase-device-page">{children}</div>
            </motion.div>
          </Scaler>
        </motion.div>
      </motion.div>
    </div>
  );
}
