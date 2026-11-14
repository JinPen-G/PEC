/** Owns the brand's single timeline and temporary fullscreen placement; no page or account state. */
export type BrandCardState = [number, number, number, number];
export const brandCards = [
  { x: 72, y: 112, width: 154, height: 228, rx: 34, angle: -7, cx: 149, cy: 226 },
  { x: 205, y: 61, width: 146, height: 244, rx: 30, angle: 1.5, cx: 278, cy: 183 },
  { x: 330, y: 143, width: 108, height: 216, rx: 26, angle: 4, cx: 384, cy: 251 },
  { x: 124, y: 153, width: 222, height: 246, rx: 38, angle: -3, cx: 235, cy: 276 },
] as const;
const rest = brandCards.map((card): BrandCardState => [card.cx, card.cy, card.angle, 1]);
const deck: BrandCardState[] = [
  [248, 245, -7, 0.82],
  [258, 243, 3, 0.82],
  [264, 258, 7, 0.82],
  [252, 267, -3, 0.82],
];
const reveal = rest.map((state): BrandCardState => [...state]);
reveal[3] = [235, 268, -4, 1.015];
const shuffle: [number, BrandCardState[]][] = [
  [0, rest],
  [4, rest],
  [12, deck],
  [
    20,
    [
      [314, 219, -4, 0.82],
      [323, 223, 2, 0.82],
      [326, 239, 6, 0.82],
      [125, 283, -12, 0.82],
    ],
  ],
  [
    22,
    [
      [314, 219, -4, 0.82],
      [323, 223, 2, 0.82],
      [326, 239, 6, 0.82],
      [125, 283, -12, 0.82],
    ],
  ],
  [30, deck],
  [
    36,
    [
      [216, 241, -5, 0.82],
      [225, 236, 3, 0.82],
      [405, 218, 12, 0.82],
      [215, 256, -5, 0.82],
    ],
  ],
  [
    37,
    [
      [216, 241, -5, 0.82],
      [225, 236, 3, 0.82],
      [405, 218, 12, 0.82],
      [215, 256, -5, 0.82],
    ],
  ],
  [45, deck],
  [
    51,
    [
      [224, 365, -6, 0.82],
      [350, 125, 10, 0.82],
      [240, 365, 7, 0.82],
      [224, 367, -3, 0.82],
    ],
  ],
  [
    52,
    [
      [224, 365, -6, 0.82],
      [350, 125, 10, 0.82],
      [240, 365, 7, 0.82],
      [224, 367, -3, 0.82],
    ],
  ],
  [60, deck],
  [
    66,
    [
      [115, 231, -13, 0.82],
      [326, 224, 4, 0.82],
      [343, 242, 8, 0.82],
      [320, 260, -3, 0.82],
    ],
  ],
  [
    67,
    [
      [115, 231, -13, 0.82],
      [326, 224, 4, 0.82],
      [343, 242, 8, 0.82],
      [320, 260, -3, 0.82],
    ],
  ],
  [78, reveal],
  [84, rest],
  [100, rest],
];
export const brandOpeningDuration = 4400;
const timing = {
  entrance: 520,
  entranceStagger: 45,
  fade: 300,
  detailStart: 320,
  detailDuration: 230,
  shuffleStart: 50,
  shuffleDuration: 2800,
  flightStart: 2870,
  flightDuration: 710,
  stagger: 95,
  breatheStart: 3870,
  breatheDuration: 530,
  revealStart: 3600,
  revealDuration: 590,
  letterStart: 180,
  letterDuration: 300,
  letterStagger: 65,
};
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, p: number) => from + (to - from) * p;
const round = (value: number) => Math.round(value * 100000) / 100000;
function cubic(x1: number, y1: number, x2: number, y2: number) {
  const curve = (t: number, a: number, b: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  return (value: number) => {
    if (value <= 0 || value >= 1) return clamp(value);
    let low = 0,
      high = 1;
    for (let i = 0; i < 15; i++) {
      const mid = (low + high) / 2;
      if (curve(mid, x1, x2) < value) low = mid;
      else high = mid;
    }
    return curve((low + high) / 2, y1, y2);
  };
}
const shuffleEase = cubic(0.42, 0, 0.24, 1);
const flightEase = cubic(0.62, 0, 0.22, 1);
const softEase = cubic(0.215, 0.61, 0.355, 1);
const outEase = cubic(0.22, 0.75, 0.25, 1);
const settleEase = cubic(0.25, 0.1, 0.25, 1);
const breatheEase = cubic(0.42, 0, 0.2, 1);
const letterEase = cubic(0.23, 1, 0.32, 1);
const entranceSpring = (seconds: number) =>
  1 - Math.exp(-10 * seconds) * (Math.cos(10 * seconds) + Math.sin(10 * seconds));
const entranceEnd = entranceSpring(timing.entrance / 1000);
const breathing = [
  { start: 4, open: 18, hold: 23, land: 38, end: 45, x: -28, y: -9, turn: -5 },
  { start: 6, open: 20, hold: 26, land: 41, end: 48, x: 3, y: -31, turn: -2.5 },
  { start: 8, open: 22, hold: 29, land: 44, end: 51, x: 27, y: -2, turn: 5 },
  { start: 10, open: 24, hold: 31, land: 47, end: 54, x: -2, y: 18, turn: 2.5 },
];
function breathingFactor(motion: (typeof breathing)[number], percent: number) {
  if (percent > motion.start && percent < motion.open)
    return breatheEase((percent - motion.start) / (motion.open - motion.start));
  if (percent >= motion.open && percent < motion.hold) return 1;
  if (percent >= motion.hold && percent < motion.land)
    return mix(1, -0.025, outEase((percent - motion.hold) / (motion.land - motion.hold)));
  if (percent >= motion.land && percent < motion.end)
    return mix(-0.025, 0, settleEase((percent - motion.land) / (motion.end - motion.land)));
  return 0;
}
function shuffleState(percent: number): BrandCardState[] {
  for (let i = 1; i < shuffle.length; i++) {
    if (percent > shuffle[i][0]) continue;
    const [fromPercent, from] = shuffle[i - 1],
      [toPercent, to] = shuffle[i];
    const p = shuffleEase(clamp((percent - fromPercent) / (toPercent - fromPercent)));
    return from.map(
      (state, index) =>
        state.map((value, attribute) => mix(value, to[index][attribute], p)) as BrandCardState,
    );
  }
  return rest;
}
/** The homepage deck uses the same approved card trajectory without the startup flight. */
export function getBrandShuffleState(percent: number) {
  return shuffleState(percent);
}
function curvedPoint(from: number[], to: number[], p: number, offset = 0): [number, number] {
  const inv = 1 - p,
    dx = from[0] - to[0],
    dy = from[1] - to[1];
  const one = [from[0] - dx * 0.12 + offset, from[1] - dy * 0.5 - 20];
  const two = [to[0] + dx * 0.18, to[1] + dy * 0.12];
  return [0, 1].map(
    (axis) =>
      inv ** 3 * from[axis] + 3 * inv ** 2 * p * one[axis] + 3 * inv * p ** 2 * two[axis] + p ** 3 * to[axis],
  ) as [number, number];
}
export interface BrandOpeningHost {
  surface: HTMLElement;
  iconSlot: HTMLElement;
  wordSlot: HTMLElement;
  reserve: HTMLElement;
  skipLabel?: string;
  onStart(): void;
  onReveal(): void;
  onComplete(): void;
}
interface BrandOpeningElements extends BrandOpeningHost {
  iconMount: HTMLElement;
  wordMount: HTMLElement;
  layerMount: HTMLElement;
  logo: SVGSVGElement;
  word: HTMLElement;
  layer: HTMLElement;
  veil: HTMLElement;
  skip: HTMLButtonElement;
  play: boolean;
  waitingForHost?: boolean;
}
export interface BrandOpeningController {
  finish(): void;
  attach(host: BrandOpeningHost): void;
  suspend(): void;
  dispose(): void;
}
export function startBrandOpening(elements: BrandOpeningElements): BrandOpeningController {
  let { surface, iconSlot, wordSlot, reserve } = elements;
  let host: BrandOpeningHost = elements;
  let waitingForHost = Boolean(elements.waitingForHost);
  const { iconMount, wordMount, layerMount, logo, word, layer, veil, skip } = elements;
  const pieces = brandCards.map((_, index) => logo.querySelector<SVGGElement>(`[data-card="${index}"]`)!);
  const wrappers = brandCards.map((_, index) =>
    logo.querySelector<SVGGElement>(`[data-card-wrapper="${index}"]`)!,
  );
  const occluders = brandCards.map((_, index) =>
    logo.querySelector<SVGGElement>(`[data-occluder="${index}"]`)!,
  );
  const masks = brandCards.map((_, index) => logo.querySelector<SVGMaskElement>(`[data-mask="${index}"]`)!);
  const drawing = logo.querySelector<SVGGElement>('[data-drawing]')!;
  const details = logo.querySelector<SVGGElement>('[data-details]')!;
  const detailPieces = [...logo.querySelectorAll<SVGGElement>('[data-detail]')];
  const letters = [...word.querySelectorAll<HTMLElement>('[data-letter]')];
  const readContent = () =>
    [...surface.children].filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child !== iconMount && child !== wordMount && child !== layerMount,
    );
  let content = readContent(),
    inert = content.map((child) => Boolean(child.inert));
  const root = document.documentElement;
  let overflow = root.style.getPropertyValue('overflow'),
    priority = root.style.getPropertyPriority('overflow');
  let locked = false,
    suspended = false;
  let time = 0,
    previous: number | null = null,
    frame = 0,
    done = false,
    finishRequested = false,
    disposed = false,
    revealed = false;
  let order = '0,1,2,3',
    stage = '';
  let viewport = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    size: 0,
    target: { x: 0, y: 0, width: 0, height: 0 },
    wordFrom: [0, 0],
    wordTo: [0, 0],
    wordScale: 1,
    wordWidth: 0,
    origins: [] as { x: number; width: number }[],
  };
  function measure() {
    const target = iconSlot.getBoundingClientRect(),
      wordTarget = wordSlot.getBoundingClientRect();
    const width = window.innerWidth,
      height = window.innerHeight;
    const brandWidth = wordTarget.right - target.left;
    const scale = Math.min(width * 0.78, 640, height * 1.7) / Math.max(1, brandWidth);
    const start = (width - brandWidth * scale) / 2,
      iconSize = target.width * scale;
    const range = document.createRange(),
      text = reserve.firstChild;
    const reserveRect = reserve.getBoundingClientRect();
    const origins = letters.map((_, index) => {
      if (!text) return { x: 0, width: 0 };
      range.setStart(text, index);
      range.setEnd(text, index + 1);
      const bounds = range.getBoundingClientRect();
      return { x: bounds.x - reserveRect.x, width: bounds.width };
    });
    viewport = {
      width,
      height,
      x: start - (48 * iconSize) / 416,
      y: (height - iconSize) / 2 - (40 * iconSize) / 416,
      size: (iconSize * 512) / 416,
      target: { x: target.x, y: target.y, width: target.width, height: target.height },
      wordFrom: [start + (wordTarget.left - target.left) * scale, (height - wordTarget.height * scale) / 2],
      wordTo: [wordTarget.left, wordTarget.top],
      wordScale: scale,
      wordWidth: wordTarget.width,
      origins,
    };
    if (!done) {
      logo.setAttribute('viewBox', `0 0 ${width} ${height}`);
      masks.forEach((mask) => {
        mask.setAttribute('width', String(width));
        mask.setAttribute('height', String(height));
        const background = mask.querySelector('[data-mask-background]')!;
        background.setAttribute('width', String(width));
        background.setAttribute('height', String(height));
      });
      word.style.width = `${wordTarget.width}px`;
      word.style.height = `${wordTarget.height}px`;
    }
  }
  function setOrder(next: number[]) {
    const signature = next.join(',');
    if (order === signature) return;
    next.forEach((index) => drawing.append(wrappers[index]));
    next.forEach((index, position) => {
      masks[index].querySelector('[data-mask-uses]')!.replaceChildren(
        ...next.slice(position + 1).map((above) => {
          const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
          use.setAttribute('href', `#${occluders[above].id}`);
          return use;
        }),
      );
    });
    order = signature;
  }
  function matrix(index: number, state: BrandCardState) {
    const [x, y, angle, scale] = state,
      card = brandCards[index];
    const radians = ((angle - card.angle) * Math.PI) / 180;
    const a = scale * Math.cos(radians),
      b = scale * Math.sin(radians),
      c = -b,
      d = a;
    const transform = `matrix(${[a, b, c, d, x - a * card.cx - c * card.cy, y - b * card.cx - d * card.cy].map(round).join(' ')})`;
    pieces[index].setAttribute('transform', transform);
    occluders[index].setAttribute('transform', transform);
  }
  const screen = (state: BrandCardState): BrandCardState => [
    viewport.x + (state[0] * viewport.size) / 512,
    viewport.y + (state[1] * viewport.size) / 512,
    state[2],
    (state[3] * viewport.size) / 512,
  ];
  const header = (state: BrandCardState): BrandCardState => [
    viewport.target.x + ((state[0] - 48) * viewport.target.width) / 416,
    viewport.target.y + ((state[1] - 40) * viewport.target.height) / 416,
    state[2],
    (state[3] * viewport.target.width) / 416,
  ];
  function entrance(state: BrandCardState, index: number): BrandCardState {
    const elapsed = time - index * timing.entranceStagger;
    const fade = softEase(clamp(elapsed / timing.fade));
    const response =
      elapsed >= timing.entrance ? 1 : entranceSpring(Math.max(0, elapsed) / 1000) / entranceEnd;
    const card = brandCards[index];
    const from = [
      235 + (card.cx - 235) * 0.22,
      265 + (card.cy - 265) * 0.22 + 56,
      card.angle + [10, -8, -12, 6][index],
      0.72,
    ];
    pieces[index].style.opacity = String(fade);
    occluders[index].style.opacity = String(fade);
    pieces[index].style.filter = fade >= 1 ? 'none' : `blur(${round(2 * (1 - fade))}px)`;
    return from.map((value, attribute) => mix(value, state[attribute], response)) as BrandCardState;
  }
  function detailsAt(percent: number) {
    const stops = [
      [
        [0, 1, 1],
        [28, 1, 1],
        [35, 0.48, 0.9],
        [43, 0.48, 0.9],
        [52, 1, 1.06],
        [65, 1, 1],
        [100, 1, 1],
      ],
      [
        [0, 1, 1],
        [30, 1, 1],
        [37, 0.48, 0.9],
        [46, 0.48, 0.9],
        [55, 1, 1.06],
        [67, 1, 1],
        [100, 1, 1],
      ],
      [
        [0, 1, 1],
        [29, 1, 1],
        [37, 0.42, 0.88],
        [47, 0.42, 0.88],
        [58, 1, 1],
        [67, 1, 1],
        [100, 1, 1],
      ],
      [
        [0, 1, 1],
        [32, 1, 1],
        [40, 0.42, 0.88],
        [50, 0.42, 0.88],
        [61, 1, 1],
        [69, 1, 1],
        [100, 1, 1],
      ],
    ];
    detailPieces.forEach((piece, index) => {
      const points = stops[index];
      let opacity = 1,
        scale = 1;
      for (let i = 1; i < points.length; i++) {
        if (percent > points[i][0]) continue;
        const from = points[i - 1],
          to = points[i],
          p = shuffleEase(clamp((percent - from[0]) / (to[0] - from[0])));
        opacity = mix(from[1], to[1], p);
        scale = mix(from[2], to[2], p);
        break;
      }
      const center = [
        [177, 219],
        [222, 210],
        [236, 284],
        [237, 329],
      ][index];
      piece.setAttribute('opacity', String(round(opacity)));
      piece.setAttribute(
        'transform',
        `translate(${center.join(' ')}) scale(${round(scale)} ${round(index < 2 ? scale : 1)}) translate(${center.map((value) => -value).join(' ')})`,
      );
    });
  }
  function paintWord(atRest = false) {
    const p = flightEase(clamp((time - timing.flightStart - 3 * timing.stagger) / timing.flightDuration));
    if (!atRest) {
      const [x, y] = curvedPoint(viewport.wordFrom, viewport.wordTo, p);
      word.style.transform = `translate(${round(x)}px,${round(y)}px) scale(${round(mix(viewport.wordScale, 1, p))})`;
    }
    const percent = clamp((time - timing.breatheStart) / timing.breatheDuration) * 69;
    const spread = atRest ? 0 : breathingFactor(breathing[3], percent);
    const shufflePercent = clamp((time - timing.shuffleStart) / timing.shuffleDuration) * 84;
    const center = (letters.length - 1) / 2;
    letters.forEach((letter, index) => {
      const enter = atRest
        ? 1
        : letterEase(
            clamp((time - timing.letterStart - index * timing.letterStagger) / timing.letterDuration),
          );
      const glyph = viewport.origins[index];
      const gather = (viewport.wordWidth / 2 - glyph.x - glyph.width / 2) * 0.32 * (1 - enter);
      let shuffleSpread = 0,
        lift = 0,
        turn = 0;
      if (!atRest)
        [2, 5, 8, 11].forEach((beat, group) => {
          const delayed = shufflePercent - (index % 2) * 0.8;
          const start = shuffle[beat][0],
            open = shuffle[beat + 1][0],
            hold = shuffle[beat + 2][0],
            end = shuffle[beat + 3][0];
          if (delayed <= start || delayed >= end) return;
          const pull =
            delayed < open
              ? shuffleEase((delayed - start) / (open - start))
              : delayed <= hold
                ? 1
                : 1 - shuffleEase((delayed - hold) / (end - hold));
          const weight = Math.exp(
            -0.5 * ((index - (((group + 0.5) * letters.length) / 4 - 0.5)) / 1.15) ** 2,
          );
          shuffleSpread += pull * 0.4;
          lift += pull * weight * 6;
          turn += pull * weight * [-1, 1, 1, -1][group] * 1.4;
        });
      const x = glyph.x + gather + (index - center) * (1.1 * spread + shuffleSpread * enter);
      const y =
        12 * (1 - enter) - Math.sin((index / (letters.length - 1)) * Math.PI) * 1.2 * spread - lift * enter;
      const rotation = (index - center) * 0.3 * (spread - (1 - enter)) + turn * enter;
      letter.style.transform = `translate(${round(x)}px,${round(y)}px) rotate(${round(rotation)}deg)`;
      letter.style.opacity = String(
        enter * (index === letters.length - 1 ? 1 - 0.18 * Math.max(0, spread) : 1),
      );
      letter.style.filter = enter >= 1 ? 'none' : `blur(${round(2 * (1 - enter))}px)`;
    });
  }
  function restoreSurface() {
    content.forEach((child, index) => {
      child.inert = inert[index];
    });
    if (locked && root.style.getPropertyValue('overflow') === 'hidden') {
      if (overflow) root.style.setProperty('overflow', overflow, priority);
      else root.style.removeProperty('overflow');
    }
    surface.removeAttribute('data-brand-opening');
    surface.removeAttribute('data-brand-phase');
    surface.style.removeProperty('--brand-content-reveal');
    locked = false;
  }
  function dock() {
    setOrder([0, 1, 2, 3]);
    rest.forEach((state, index) => matrix(index, state));
    pieces.forEach((piece) => {
      piece.style.opacity = '1';
      piece.style.filter = 'none';
    });
    occluders.forEach((occluder) => {
      occluder.style.opacity = '1';
    });
    details.style.opacity = '1';
    detailsAt(100);
    logo.setAttribute('viewBox', '48 40 416 416');
    logo.removeAttribute('data-floating');
    masks.forEach((mask) => {
      mask.setAttribute('width', '512');
      mask.setAttribute('height', '512');
      const background = mask.querySelector('[data-mask-background]')!;
      background.setAttribute('width', '512');
      background.setAttribute('height', '512');
    });
    word.removeAttribute('data-floating');
    word.style.transform = '';
    word.style.width = '';
    word.style.height = '';
    paintWord(true);
    iconSlot.append(iconMount);
    wordSlot.append(wordMount);
    layer.hidden = true;
    logo.style.opacity = '1';
    restoreSurface();
  }
  function finish() {
    if (done || disposed) return;
    cancelAnimationFrame(frame);
    frame = 0;
    previous = null;
    if (waitingForHost && time < brandOpeningDuration) {
      finishRequested = true;
      time = timing.flightStart - 20;
      paint();
      // Keep a complete static brand until its real destination exists.
      layer.hidden = true;
      return;
    }
    done = true;
    time = brandOpeningDuration;
    dock();
    host.onReveal();
    host.onComplete();
  }
  function paint() {
    const nextStage =
      time < 655
        ? 'enter'
        : time < timing.flightStart
          ? 'shuffle'
          : time < timing.breatheStart
            ? 'flight'
            : 'breathe';
    if (stage !== nextStage) {
      stage = nextStage;
      surface.dataset.brandPhase = stage;
    }
    let states: BrandCardState[];
    if (time < timing.flightStart) {
      const percent = clamp((time - timing.shuffleStart) / timing.shuffleDuration) * 84;
      states = shuffleState(percent).map(entrance).map(screen);
      setOrder(
        percent < 22 || percent >= 67
          ? [0, 1, 2, 3]
          : percent < 37
            ? [3, 0, 1, 2]
            : percent < 52
              ? [2, 3, 0, 1]
              : [1, 2, 3, 0],
      );
      details.style.opacity = String(
        letterEase(clamp((time - timing.detailStart) / timing.detailDuration)) *
          (percent > 62 && percent < 79
            ? percent < 67
              ? mix(1, 0.5, shuffleEase((percent - 62) / 5))
              : mix(0.5, 1, shuffleEase((percent - 67) / 12))
            : 1),
      );
      detailsAt(100);
    } else {
      setOrder([0, 1, 2, 3]);
      pieces.forEach((piece) => {
        piece.style.opacity = '1';
        piece.style.filter = 'none';
      });
      occluders.forEach((occluder) => {
        occluder.style.opacity = '1';
      });
      details.style.opacity = '1';
      if (time < timing.breatheStart) {
        states = rest.map((state, index) => {
          const from = screen(state),
            to = header(state),
            p = flightEase(
              clamp((time - timing.flightStart - index * timing.stagger) / timing.flightDuration),
            );
          const point = curvedPoint(from, to, p, (index - 1.5) * 10);
          return [
            point[0],
            point[1],
            state[2] + [-6, -3, 7, -4][index] * Math.sin(Math.PI * p),
            mix(from[3], to[3], p),
          ];
        });
        detailsAt(100);
      } else {
        const percent = clamp((time - timing.breatheStart) / timing.breatheDuration) * 69;
        states = rest.map((state, index) => {
          const motion = breathing[index],
            factor = breathingFactor(motion, percent);
          return header([
            state[0] + motion.x * factor,
            state[1] + motion.y * factor,
            state[2] + motion.turn * factor,
            1,
          ]);
        });
        detailsAt(percent);
      }
    }
    states.forEach((state, index) => matrix(index, state));
    paintWord();
    const reveal = softEase(clamp((time - timing.revealStart) / timing.revealDuration));
    veil.style.opacity = String(1 - reveal);
    surface.style.setProperty('--brand-content-reveal', String(reveal));
    if (!revealed && time >= timing.revealStart) {
      revealed = true;
      host.onReveal();
    }
    if (time >= timing.revealStart + timing.revealDuration)
      content.forEach((child, index) => {
        child.inert = inert[index];
      });
  }
  function tick(timestamp: number) {
    frame = 0;
    if (done || finishRequested || disposed || suspended || document.hidden) {
      previous = null;
      return;
    }
    if (previous !== null) time = Math.min(brandOpeningDuration, time + timestamp - previous);
    previous = timestamp;
    if (time >= brandOpeningDuration) {
      finish();
      return;
    }
    paint();
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!done && !finishRequested && !disposed && !suspended && !document.hidden)
      frame = requestAnimationFrame(tick);
  }
  function visibility() {
    previous = null;
    schedule();
  }
  function resize() {
    if (!disposed) {
      measure();
      if (!done) paint();
      else paintWord(true);
    }
  }
  function escape(event: KeyboardEvent) {
    if (event.key === 'Escape' && !done) {
      finish();
      iconSlot.closest<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
    }
  }
  function skipOpening(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    finish();
    if (!waitingForHost) iconSlot.closest<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
  }
  skip.textContent = host.skipLabel ?? '跳过开场';
  skip.addEventListener('click', skipOpening);
  const observer = new ResizeObserver(resize);
  observer.observe(iconSlot);
  observer.observe(wordSlot);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', visibility);
  document.addEventListener('keydown', escape);
  iconSlot.append(iconMount);
  wordSlot.append(wordMount);
  surface.append(layerMount);
  measure();
  if (!elements.play && !waitingForHost) finish();
  else {
    if (elements.play) window.scrollTo({ top: 0, behavior: 'instant' });
    surface.append(iconMount, wordMount);
    logo.dataset.floating = 'true';
    word.dataset.floating = 'true';
    layer.hidden = false;
    surface.dataset.brandOpening = 'true';
    root.style.setProperty('overflow', 'hidden');
    locked = true;
    content.forEach((child) => {
      child.inert = true;
    });
    measure();
    if (elements.play) paint();
    else finish();
    logo.style.opacity = '1';
    if (elements.play) host.onStart();
    schedule();
  }
  void document.fonts?.ready.then(() => {
    if (!disposed) resize();
  });
  return {
    finish,
    attach(next) {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = 0;
      restoreSurface();
      observer.unobserve(iconSlot);
      observer.unobserve(wordSlot);
      surface = next.surface;
      iconSlot = next.iconSlot;
      wordSlot = next.wordSlot;
      reserve = next.reserve;
      host = next;
      stage = '';
      waitingForHost = false;
      suspended = false;
      content = readContent();
      inert = content.map((child) => Boolean(child.inert));
      overflow = root.style.getPropertyValue('overflow');
      priority = root.style.getPropertyPriority('overflow');
      surface.append(layerMount);
      skip.textContent = host.skipLabel ?? '跳过开场';
      observer.observe(iconSlot);
      observer.observe(wordSlot);
      if (done || finishRequested) {
        done = true;
        time = brandOpeningDuration;
        measure();
        dock();
        host.onReveal();
        host.onComplete();
      } else {
        surface.append(iconMount, wordMount);
        surface.dataset.brandOpening = 'true';
        root.style.setProperty('overflow', 'hidden');
        locked = true;
        content.forEach((child) => {
          child.inert = true;
        });
        measure();
        paint();
        host.onStart();
        if (revealed) host.onReveal();
        schedule();
      }
    },
    suspend() {
      suspended = true;
      cancelAnimationFrame(frame);
      frame = 0;
      restoreSurface();
    },
    dispose() {
      if (disposed) return;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('keydown', escape);
      skip.removeEventListener('click', skipOpening);
      done = true;
      dock();
      disposed = true;
      iconMount.remove();
      wordMount.remove();
      layerMount.remove();
    },
  };
}
