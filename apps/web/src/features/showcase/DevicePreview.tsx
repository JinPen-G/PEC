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
  const fluidScreen = screen && expanded && !mobile;
  useLayoutEffect(() => {
    const element = host.current;
    if (!element || fluidScreen) return;
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
    const canvas = element.closest('.showcase-preview');
    const fullscreen = element.closest('.showcase-fullscreen-native');
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element && entry.contentRect.width > 0) setAvailable(entry.contentRect.width);
        if (entry.target === fullscreen && entry.contentRect.height > 0)
          setFitHeight(entry.contentRect.height);
        if (!fullscreen && !mobile && !screen && entry.target === canvas && entry.contentRect.height > 0) {
          setFitHeight(entry.contentRect.height);
        }
      }
    });
    observer.observe(element);
    if (canvas) observer.observe(canvas);
    if (fullscreen) observer.observe(fullscreen);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [mobile, screen, expanded, fluidScreen]);
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
  const Surface = screen ? 'div' : motion.div;
  const Scaler = screen ? 'div' : motion.div;
  const scalerBounds = {
    width: screen ? bounds.width : mobile ? 390 : available,
    height: screen ? bounds.height : mobile ? 844 : fitHeight,
  };
  const shellBounds = {
    width: fluidScreen ? '100%' : screen ? bounds.frameWidth : mobile ? phoneWidth : available,
    height: fluidScreen ? '100%' : screen ? bounds.frameHeight : mobile ? 844 * scale + 20 : fitHeight,
    borderRadius: mobile ? (screen ? 30 : 46) : 0,
  };
  const screenBounds = { inset: mobile && !screen ? 10 : 0, borderRadius: mobile ? (screen ? 30 : 36) : 0 };
  const nativePadding = {
    paddingTop: screen ? 0 : 24,
    paddingBottom: screen ? 0 : 24,
    paddingLeft: screen ? 0 : mobile ? 18 : 24,
    paddingRight: screen ? 0 : mobile ? 18 : 24,
  };
  return (
    <div
      ref={host}
      className={`showcase-device-host${mobile ? ' phone' : ''}`}
      data-screen={screen || undefined}
      data-fluid={fluidScreen || undefined}
    >
      <Surface
        className="preview-shell_shell__OFjTY showcase-device-shell"
        data-mode={mobile ? 'mobile' : 'fit'}
        {...(screen ? { style: shellBounds } : { initial: false as const, animate: shellBounds, transition })}
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
        <Surface
          className="showcase-device-screen"
          {...(screen
            ? { style: screenBounds }
            : { initial: false as const, animate: screenBounds, transition })}
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
                ...(screen && {
                  ...(fluidScreen ? { width: '100%', height: '100%' } : scalerBounds),
                  transform: `scale(${fluidScreen ? 1 : bounds.scale})`,
                }),
                '--preview-screen-height': fluidScreen
                  ? '100cqh'
                  : `${screen ? bounds.height : mobile ? 844 : fitHeight}px`,
              } as CSSProperties & { '--preview-screen-height': string }
            }
          >
            <Surface
              className="showcase-device-native"
              {...(screen
                ? { style: nativePadding }
                : { initial: false as const, animate: nativePadding, transition })}
            >
              <div className="showcase-device-page">{children}</div>
            </Surface>
          </Scaler>
        </Surface>
      </Surface>
    </div>
  );
}
