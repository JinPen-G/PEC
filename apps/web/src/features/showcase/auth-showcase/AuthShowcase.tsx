/** Observed seven-second component carousel. Pointer, focus, hidden tabs and
 * reduced motion pause advancement; every demo is local and has no business writes. */
import { lazy, Suspense, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useShowcaseText } from '../showcase-locale';
import { siteMotionTokens } from '@preview/ui';
import './auth-demos.css';
const Demos = lazy(() => import('./AuthDemos'));
export const AUTH_DEMOS = [
  'Morph select',
  'Confirm morph',
  'Line chart',
  'Icon morph',
  'Countdown',
  'Color picker',
  'Text scramble',
  'Stopwatch',
];
const subscribeVisibility = (notify: () => void) => {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
};
export function AuthShowcase() {
  const text = useShowcaseText();
  const reduced = useReducedMotion();
  const visible = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === 'visible',
    () => true,
  );
  const [index, setIndex] = useState(0),
    [direction, setDirection] = useState(1),
    [paused, setPaused] = useState(false),
    [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false);
  const advance = (step: number) => {
    setDirection(step);
    setIndex((previous) => (previous + step + AUTH_DEMOS.length) % AUTH_DEMOS.length);
  };
  return (
    <div
      className="auth-showcase_showcase__HdNQr"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="auth-showcase_stage__Asr1v">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={index}
            className="auth-showcase_demo__xqpfm"
            data-demo={AUTH_DEMOS[index]}
            initial={
              reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, filter: 'blur(6px)', x: 16 * direction }
            }
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', x: 0 }}
            exit={
              reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: 'blur(6px)', x: -16 * direction }
            }
            transition={{ duration: reduced ? 0.15 : 0.48, ease: [...siteMotionTokens.ease.standard] }}
          >
            <Suspense
              fallback={
                <span className="auth-flow_hint__DGjig" role="status">
                  {text('加载展示…')}
                </span>
              }
            >
              <Demos index={index} />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="auth-showcase_bar__XvgSP">
        <p className="auth-showcase_caption__4aNb1">
          <span className="auth-showcase_name__yvhgO">{AUTH_DEMOS[index]}</span>
          <a
            className="auth-showcase_view__vmIXv"
            href="#auth-demo"
            onClick={(event) => {
              event.preventDefault();
              setPaused(true);
              event.currentTarget
                .closest('.auth-showcase_showcase__HdNQr')
                ?.querySelector<HTMLElement>('.auth-showcase_demo__xqpfm button')
                ?.focus();
            }}
          >
            {text('查看')}
            <ArrowUpRight size={14} />
          </a>
        </p>
        <div className="auth-showcase_controls__U6hZ6" role="group" aria-label={text('展示控制')}>
          <button type="button" aria-label={text('上一项展示')} onClick={() => advance(-1)}>
            <ChevronLeft size={16} />
          </button>
          {!reduced && (
            <button
              type="button"
              aria-label={text(paused ? '播放展示' : '暂停展示')}
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={paused ? 'play' : 'pause'}
                  className="auth-showcase_toggleIcon__akEif"
                  initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 45 }}
                  transition={siteMotionTokens.spring.snappy}
                >
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                </motion.span>
              </AnimatePresence>
            </button>
          )}
          <button type="button" aria-label={text('下一项展示')} onClick={() => advance(1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="auth-showcase_track__aPaEx" aria-hidden="true">
        {!reduced && (
          <span
            key={index}
            className="auth-showcase_progress__G8Plf"
            style={{
              animationDuration: '7000ms',
              animationPlayState: !paused && !hovered && !focused && visible ? 'running' : 'paused',
            }}
            onAnimationEnd={() => advance(1)}
          />
        )}
      </div>
    </div>
  );
}
