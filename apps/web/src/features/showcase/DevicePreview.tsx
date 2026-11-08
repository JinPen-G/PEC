/** One native tree and one positioned screen animate together. Keeping numeric
 * bounds avoids the transient zero-height frame of an auto/absolute swap. */
import { useLayoutEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { siteMotionTokens } from '@preview/ui';
export function DevicePreview({
  mobile,
  children,
  maxWidth = 332,
}: {
  mobile: boolean;
  children: ReactNode;
  maxWidth?: number;
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
      } else if (!mobile) {
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
    return () => observer.disconnect();
  }, [mobile]);
  const phoneWidth = Math.max(180, Math.min(maxWidth, available));
  const scale = (phoneWidth - 20) / 390;
  const transition = reduced ? { duration: 0 } : siteMotionTokens.spring.smooth;
  return (
    <div ref={host} className={`showcase-device-host${mobile ? ' phone' : ''}`}>
      <motion.div
        className="preview-shell_shell__OFjTY showcase-device-shell"
        data-mode={mobile ? 'mobile' : 'fit'}
        initial={false}
        animate={{
          width: mobile ? phoneWidth : available,
          height: mobile ? 844 * scale + 20 : fitHeight,
          borderRadius: mobile ? 46 : 0,
        }}
        transition={transition}
      >
        <motion.div
          className="preview-shell_bezel__I2eh4"
          aria-hidden="true"
          initial={false}
          animate={{ opacity: mobile ? 1 : 0 }}
          transition={transition}
        />
        <motion.div
          className="showcase-device-screen"
          initial={false}
          animate={{ inset: mobile ? 10 : 0, borderRadius: mobile ? 36 : 0 }}
          transition={transition}
        >
          <motion.div
            className="showcase-device-scaler"
            initial={false}
            animate={{
              width: mobile ? 390 : available,
              height: mobile ? 844 : fitHeight,
              scale: mobile ? scale : 1,
            }}
            transition={transition}
            style={{ '--preview-screen-height': mobile ? '844px' : `${fitHeight}px` } as CSSProperties}
          >
            <motion.div
              className="showcase-device-native"
              initial={false}
              animate={{
                paddingTop: 24,
                paddingBottom: 24,
                paddingLeft: mobile ? 18 : 24,
                paddingRight: mobile ? 18 : 24,
              }}
              transition={transition}
            >
              <div className="showcase-device-page">{children}</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
