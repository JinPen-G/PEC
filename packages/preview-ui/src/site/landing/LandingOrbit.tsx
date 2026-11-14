/** Animate UI's fixed orbit-to-grid composition, adapted to Preview's deck logo.
 * The logo and card positions share scroll progress; only the vignette controls autoplay. */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from 'react';
import { useShouldReduceMotion } from '@animate-ui/react/utils/motion';
import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { AutoplayScope } from './landing-playback';
import { VIGNETTES } from './LandingVignettes';
import { ShuffleLogo } from './ShuffleLogo';
import './landing.css';

const STAGE = { width: 1200, height: 780 };
const CARD = { width: 300, height: 188 };
const GAP = 16;
const RADIUS = { x: 400, y: 240 };
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = (t: number) => Math.min(1, Math.max(0, t));
const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits;
const subscribeWide = (notify: () => void) => {
  const query = window.matchMedia('(min-width: 768px)');
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
function useWide() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia('(min-width: 768px)').matches,
    () => true,
  );
}
function useStageScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () =>
      setScale(Math.min(1, window.innerWidth / STAGE.width, (window.innerHeight - 112) / STAGE.height));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return scale;
}
function Card({ title, Vignette, onScreen }: { title: string; Vignette: ComponentType; onScreen: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div
      ref={ref}
      data-slot="orbit-card"
      className="home-orbit-card"
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch' && window.matchMedia('(hover: hover) and (pointer: fine)').matches)
          setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="home-orbit-card-inner">
        <span className="home-orbit-card-title">{title}</span>
        <div className="home-orbit-card-demo">
          <AutoplayScope paused={hovered || focused || !onScreen || !visible}>
            <Vignette />
          </AutoplayScope>
        </div>
      </div>
    </div>
  );
}
type Placement = {
  x: number;
  y: number;
  scale: number;
  blur: number;
  opacity: number;
  rotateY: number;
  z: number;
};
function OrbitCard({
  index,
  enter,
  settle,
  turn,
  onScreen,
}: {
  index: number;
  enter: MotionValue<number>;
  settle: MotionValue<number>;
  turn: MotionValue<number>;
  onScreen: boolean;
}) {
  const { title, Vignette } = VIGNETTES[index];
  const slot = {
    x: ((index % 3) - 1) * (CARD.width + GAP),
    y: (Math.floor(index / 3) - 1) * (CARD.height + GAP) + 40,
  };
  const place = useTransform([enter, settle, turn] as MotionValue<number>[], ([e, s, t]: number[]) => {
    const angle = (index / VIGNETTES.length) * Math.PI * 2 + t;
    const depth = (Math.sin(angle) + 1) / 2;
    const reach = 0.3 + 0.7 * e;
    const orbit = {
      x: Math.cos(angle) * RADIUS.x * reach,
      y: Math.sin(angle) * RADIUS.y * reach + 30,
      scale: 0.7 + 0.3 * depth,
      blur: (1 - depth) * 1.6 + (1 - e) * 8,
      opacity: (0.55 + 0.45 * depth) * e,
      rotateY: -Math.cos(angle) * 24,
    };
    const k = smooth(s);
    return {
      x: orbit.x + (slot.x - orbit.x) * k,
      y: orbit.y + (slot.y - orbit.y) * k,
      scale: orbit.scale + (1 - orbit.scale) * k,
      blur: orbit.blur * (1 - k),
      opacity: orbit.opacity + (1 - orbit.opacity) * k,
      rotateY: orbit.rotateY * (1 - k),
      z: k > 0.5 ? 30 : depth > 0.5 ? 20 : 5,
    };
  });
  const ref = useRef<HTMLDivElement>(null);
  const apply = useCallback((p: Placement) => {
    if (!ref.current) return;
    ref.current.style.transform = `perspective(900px) translate(${round(p.x, 1)}px, ${round(p.y, 1)}px) scale(${round(p.scale, 3)}) rotateY(${round(p.rotateY, 2)}deg)`;
    ref.current.style.opacity = String(round(p.opacity, 3));
    ref.current.style.filter = p.blur > 0.05 ? `blur(${round(p.blur, 1)}px)` : 'none';
    ref.current.style.zIndex = String(p.z);
    ref.current.inert = p.opacity < 0.05;
  }, []);
  useMotionValueEvent(place, 'change', apply);
  useLayoutEffect(() => apply(place.get()), [apply, place]);
  return (
    <div ref={ref} className="home-orbit-position" style={{ width: CARD.width, height: CARD.height }}>
      <Card title={title} Vignette={Vignette} onScreen={onScreen} />
    </div>
  );
}
function Headline({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  children: string;
}) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [24, 0, 0, -24]);
  const filter = useTransform(progress, range, ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(8px)']);
  return (
    <motion.h2 className="home-orbit-heading" style={{ opacity, y, filter }}>
      {children}
    </motion.h2>
  );
}
function OrbitStage({ text }: { text: (value: string) => string }) {
  const ref = useRef<HTMLElement>(null);
  const onScreen = useInView(ref);
  const scale = useStageScale();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 32, mass: 0.4 });
  const [keyboardGrid, setKeyboardGrid] = useState(false);
  const gridTarget = useMotionValue(0);
  const enter = useTransform(progress, (p) => smooth(clamp((p - 0.12) / 0.25)));
  const [entered, setEntered] = useState(false);
  useMotionValueEvent(enter, 'change', (value) => setEntered(value > 0.001));
  const scrollSettle = useTransform(progress, (p) => clamp((p - 0.86) / 0.12));
  const settle = useTransform([scrollSettle, gridTarget], ([scroll, keyboard]: number[]) =>
    Math.max(scroll, keyboard),
  );
  useEffect(() => {
    gridTarget.set(keyboardGrid ? 1 : 0);
  }, [keyboardGrid, gridTarget]);
  const turn = useTransform(progress, (p) => clamp(p / 0.86) * Math.PI * 1.1);
  // Upstream turns its mark from -60° to 240° over 0–0.95 of this 300vh region.
  // That same scroll span now scrubs one complete, reversible four-card deck cycle.
  const shuffleProgress = useTransform(progress, [0, 0.95], [0, 100]);
  const logoScale = useTransform(progress, [0, 0.3, 0.86, 0.95], [0.8, 1, 1, 0.3]);
  const scrollLogoOpacity = useTransform(progress, [0, 0.86, 0.94], [1, 1, 0]);
  const logoOpacity = useTransform(
    [scrollLogoOpacity, gridTarget],
    ([opacity, keyboard]: number[]) => opacity * (1 - keyboard),
  );
  const glow = useTransform(progress, [0, 0.3, 0.86, 0.95], [0.5, 1, 1, 0]);
  return (
    <section
      ref={ref}
      data-slot="home-orbit"
      className="home-orbit"
      aria-label={text('组件交互演示')}
      onFocusCapture={() => setKeyboardGrid(true)}
    >
      <div className="home-orbit-sticky">
        <div
          className="home-orbit-stage"
          style={{ width: STAGE.width, height: STAGE.height, transform: `scale(${scale})` }}
        >
          <Headline progress={progress} range={[-0.01, 0, 0.78, 0.87]}>
            {text('每个界面，都可以动手体验。')}
          </Headline>
          <Headline progress={progress} range={[0.9, 0.97, 1, 1.01]}>
            {text('试一试，交互就在这里。')}
          </Headline>
          <motion.div aria-hidden="true" className="home-orbit-glow" style={{ opacity: glow }} />
          <motion.div className="home-orbit-logo" style={{ scale: logoScale, opacity: logoOpacity }}>
            <ShuffleLogo progress={shuffleProgress} />
          </motion.div>
          {VIGNETTES.map(({ title }, index) => (
            <OrbitCard
              key={title}
              index={index}
              enter={enter}
              settle={settle}
              turn={turn}
              onScreen={onScreen && entered}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
function StaticGrid({ text }: { text: (value: string) => string }) {
  const ref = useRef<HTMLElement>(null);
  const onScreen = useInView(ref);
  return (
    <section ref={ref} data-slot="home-orbit" className="home-demo-static" aria-label={text('组件交互演示')}>
      <h2>{text('试一试，交互就在这里。')}</h2>
      <div className="home-demo-static-grid">
        {VIGNETTES.map(({ title, Vignette }) => (
          <div key={title}>
            <Card title={title} Vignette={Vignette} onScreen={onScreen} />
          </div>
        ))}
      </div>
    </section>
  );
}
export function LandingOrbit({ text = (value) => value }: { text?: (value: string) => string }) {
  const wide = useWide();
  const reduce = useShouldReduceMotion();
  return wide && !reduce ? <OrbitStage text={text} /> : <StaticGrid text={text} />;
}
