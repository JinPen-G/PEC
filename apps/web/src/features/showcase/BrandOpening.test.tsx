import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BrandOpening } from '../../../../../packages/preview-ui/src/BrandOpening';
import { createBrandArtwork } from '../../../../../packages/preview-ui/src/brand-artwork';
import { discardBrandBoot, registerBrandBoot } from '../../../../../packages/preview-ui/src/brand-boot';
import { startBrandOpening } from '../../../../../packages/preview-ui/src/brand-opening';

let callbacks: Map<number, (timestamp: number) => void>;
let frameId: number;
const reveal = vi.fn(),
  complete = vi.fn(),
  start = vi.fn();
function advance(timestamp: number) {
  act(() => {
    const pending = [...callbacks.values()];
    callbacks.clear();
    pending.forEach((callback) => callback(timestamp));
  });
}
function Homepage({ reduced = false, play = true }: { reduced?: boolean; play?: boolean }) {
  return (
    <div className="preview-showcase">
      <header>
        <a href="/" aria-label="Preview">
          <BrandOpening
            playIntro={play}
            reducedMotion={reduced}
            onStart={start}
            onReveal={reveal}
            onComplete={complete}
          />
        </a>
      </header>
      <main>
        <button type="button">Explore</button>
      </main>
    </div>
  );
}
function earlyHomepage(play = true) {
  const surface = document.createElement('div');
  surface.className = 'preview-showcase preview-home-boot';
  const iconSlot = document.createElement('span');
  iconSlot.className = 'brand-opening-icon-slot';
  const wordSlot = document.createElement('span');
  wordSlot.className = 'brand-opening-word-slot';
  const reserve = document.createElement('span');
  reserve.className = 'brand-opening-reserve';
  reserve.textContent = 'Preview.';
  wordSlot.append(reserve);
  surface.append(iconSlot, wordSlot);
  document.body.append(surface);
  const artwork = createBrandArtwork('test-boot');
  const controller = startBrandOpening({
    ...artwork,
    surface,
    iconSlot,
    wordSlot,
    reserve,
    play,
    waitingForHost: true,
    onStart() {},
    onReveal() {},
    onComplete() {},
  });
  const release = vi.fn(() => surface.remove());
  registerBrandBoot({ controller, release });
  return { surface, controller, release, ...artwork };
}
beforeEach(() => {
  callbacks = new Map();
  frameId = 0;
  reveal.mockReset();
  complete.mockReset();
  start.mockReset();
  vi.stubGlobal('requestAnimationFrame', (callback: (timestamp: number) => void) => {
    callbacks.set(++frameId, callback);
    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => callbacks.delete(id));
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('brand-opening-icon-slot')
      ? new DOMRect(24, 52, 32, 32)
      : new DOMRect(64, 55, 90, 26);
  });
  Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: function (this: Range) {
      return new DOMRect(64 + this.startOffset * 11, 55, 11, 26);
    },
  });
  document.documentElement.style.removeProperty('overflow');
});
afterEach(async () => {
  cleanup();
  discardBrandBoot();
  await act(async () => {});
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(Range.prototype, 'getBoundingClientRect');
  document.documentElement.style.removeProperty('overflow');
});

it('keeps a single brand while opening and releases the page after the complete timeline', () => {
  const view = render(
    <StrictMode>
      <Homepage />
    </StrictMode>,
  );
  const surface = view.container.querySelector('.preview-showcase') as HTMLElement;
  const header = view.container.querySelector('header')!;
  const symbol = surface.querySelector('.brand-opening-symbol')!;
  expect(surface.dataset.brandOpening).toBe('true');
  expect(header.inert).toBe(true);
  expect(document.documentElement.style.overflow).toBe('hidden');
  expect(surface.querySelectorAll('.brand-opening-symbol')).toHaveLength(1);
  expect(surface.querySelectorAll('.brand-opening-word')).toHaveLength(1);
  advance(0);
  advance(300);
  const cards = [...symbol.querySelectorAll<SVGGElement>('[data-card]')];
  expect(cards.every((card) => Number(card.style.opacity) > 0)).toBe(true);
  expect(new Set(cards.map((card) => card.style.opacity)).size).toBeGreaterThan(1);
  advance(4400);
  expect(surface.dataset.brandOpening).toBeUndefined();
  expect(header.inert).toBe(false);
  expect(document.documentElement.style.overflow).toBe('');
  expect(symbol).not.toHaveAttribute('data-floating');
  expect(surface.querySelector('.brand-opening-icon-slot')?.contains(symbol)).toBe(true);
  expect(
    surface.querySelector('.brand-opening-word-slot')?.contains(surface.querySelector('.brand-opening-word')),
  ).toBe(true);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(start).toHaveBeenCalledTimes(1);
  expect(callbacks.size).toBe(0);
  view.rerender(
    <StrictMode>
      <Homepage play={false} />
    </StrictMode>,
  );
  expect(callbacks.size).toBe(0);
  expect(complete).toHaveBeenCalledTimes(1);
});

it('skips from the keyboard and puts focus on the restored brand link', () => {
  render(<Homepage />);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('link', { name: 'Preview' })).toHaveFocus();
  expect(screen.queryByRole('button', { name: '跳过开场' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Explore' }).closest('main')?.inert).toBe(false);
  expect(callbacks.size).toBe(0);
});

it('restores existing scroll and inert state when a route unmounts during opening', () => {
  document.documentElement.style.setProperty('overflow', 'scroll', 'important');
  const view = render(<Homepage />);
  advance(0);
  advance(180);
  view.unmount();
  expect(document.documentElement.style.overflow).toBe('scroll');
  expect(document.documentElement.style.getPropertyPriority('overflow')).toBe('important');
  expect(callbacks.size).toBe(0);
  expect(document.querySelector('.brand-opening-layer')).not.toBeInTheDocument();
});

it('finishes immediately when reduced motion is selected during an opening', () => {
  const view = render(<Homepage />);
  advance(0);
  advance(250);
  view.rerender(<Homepage reduced />);
  expect(callbacks.size).toBe(0);
  expect(view.container.querySelector('[data-brand-opening]')).not.toBeInTheDocument();
  expect(view.container.querySelectorAll('[data-floating]')).toHaveLength(0);
  expect(screen.getByRole('button', { name: 'Explore' }).closest('main')?.inert).toBe(false);
  expect(complete).toHaveBeenCalledTimes(1);
});

it('shows a usable homepage without scheduling animation on a reduced-motion visit', () => {
  const view = render(
    <StrictMode>
      <Homepage reduced />
    </StrictMode>,
  );
  expect(callbacks.size).toBe(0);
  expect(screen.queryByRole('button', { name: '跳过开场' })).not.toBeInTheDocument();
  expect(view.container.querySelectorAll('[data-floating]')).toHaveLength(0);
  expect(
    [...view.container.querySelectorAll<HTMLElement>('[data-letter]')].every(
      (letter) => letter.style.opacity === '1',
    ),
  ).toBe(true);
  expect(screen.getByRole('button', { name: 'Explore' }).closest('main')?.inert).toBe(false);
  expect(reveal).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(start).not.toHaveBeenCalled();
});

it('keeps the early brand and elapsed clock when the real header takes over', () => {
  const boot = earlyHomepage();
  advance(0);
  advance(300);
  const entrance = boot.logo.querySelector('[data-card="3"]')!.getAttribute('transform');
  const view = render(
    <StrictMode>
      <Homepage />
    </StrictMode>,
  );
  expect(boot.release).toHaveBeenCalledTimes(1);
  expect(boot.surface).not.toBeInTheDocument();
  expect(view.container.querySelector('.brand-opening-symbol')).toBe(boot.logo);
  expect(view.container.querySelector('.brand-opening-word')).toBe(boot.word);
  expect(document.querySelectorAll('.brand-opening-symbol')).toHaveLength(1);
  expect(boot.logo.querySelector('[data-card="3"]')).toHaveAttribute('transform', entrance);
  advance(500);
  expect(view.container.querySelector('.preview-showcase')).toHaveAttribute('data-brand-phase', 'enter');
  fireEvent(window, new Event('resize'));
  advance(4400);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(start).toHaveBeenCalledTimes(1);
  expect(callbacks.size).toBe(0);
  expect(view.container.querySelector('.brand-opening-icon-slot')?.contains(boot.logo)).toBe(true);
});

it('flies to the header on schedule while the app loads and hands over without replaying', () => {
  const boot = earlyHomepage();
  advance(0);
  advance(2850);
  const central = boot.logo.querySelector('[data-card="0"]')!.getAttribute('transform');
  advance(3300);
  expect(boot.surface.dataset.brandPhase).toBe('flight');
  expect(callbacks.size).toBe(1);
  expect(boot.logo).toHaveAttribute('data-floating', 'true');
  expect(
    [...boot.word.querySelectorAll<HTMLElement>('[data-letter]')].every(
      (letter) => letter.style.opacity === '1',
    ),
  ).toBe(true);
  expect(boot.logo.querySelector('[data-card="0"]')!.getAttribute('transform')).not.toBe(central);
  const view = render(<Homepage />);
  advance(4400);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(document.documentElement.style.overflow).toBe('');
  expect(view.container.querySelector('header')?.inert).toBe(false);
});

it('finishes the early opening at the header even when the application arrives after its timeline', () => {
  const boot = earlyHomepage();
  advance(0);
  advance(4400);
  expect(boot.logo).not.toHaveAttribute('data-floating');
  expect(boot.surface.dataset.brandOpening).toBeUndefined();
  expect(callbacks.size).toBe(0);
  const view = render(<Homepage />);
  expect(view.container.querySelector('.brand-opening-symbol')).toBe(boot.logo);
  expect(boot.release).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(start).not.toHaveBeenCalled();
  expect(callbacks.size).toBe(0);
});

it('shows a complete static early brand for reduced motion and docks it without replaying', () => {
  const boot = earlyHomepage(false);
  expect(callbacks.size).toBe(0);
  expect(boot.logo.style.opacity).toBe('1');
  expect(
    [...boot.logo.querySelectorAll<SVGGElement>('[data-card]')].every((card) => card.style.opacity === '1'),
  ).toBe(true);
  expect(boot.layer.hidden).toBe(true);
  const view = render(
    <StrictMode>
      <Homepage reduced />
    </StrictMode>,
  );
  expect(view.container.querySelector('.brand-opening-symbol')).toBe(boot.logo);
  expect(boot.logo).not.toHaveAttribute('data-floating');
  expect(callbacks.size).toBe(0);
  expect(reveal).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(start).not.toHaveBeenCalled();
  expect(document.documentElement.style.overflow).toBe('');
});

it('honors skip before the app is ready without restarting the opening on handoff', () => {
  earlyHomepage();
  fireEvent.click(screen.getByRole('button', { name: '跳过开场' }));
  expect(callbacks.size).toBe(0);
  const view = render(<Homepage />);
  expect(view.container.querySelectorAll('[data-floating]')).toHaveLength(0);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button', { name: '跳过开场' })).not.toBeInTheDocument();
  expect(document.documentElement.style.overflow).toBe('');
});
