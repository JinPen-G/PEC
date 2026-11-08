import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { chapterScrollTop, prepareShowcaseRoute, useTocNavigation } from './toc-navigation';

const motion = vi.hoisted(() => ({ animate: vi.fn() }));
vi.mock('motion', async (original) => ({ ...(await original<object>()), animate: motion.animate }));
let y = 0;
const runs: { stop: ReturnType<typeof vi.fn>; update: (top: number) => void; complete: () => void }[] = [];
function Fixture() {
  const { active, scrollTo } = useTocNavigation(['start', 'middle', 'last']);
  return (
    <>
      <output>{active}</output>
      <button onClick={() => scrollTo('last')}>Last</button>
      <button onClick={() => scrollTo('middle')}>Middle</button>
      <section id="start" />
      <section id="middle" />
      <section id="last" />
    </>
  );
}
beforeEach(() => {
  y = 0;
  runs.length = 0;
  vi.stubGlobal('scrollY', 0);
  vi.stubGlobal('innerHeight', 800);
  vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(2400);
  vi.spyOn(window, 'scrollTo').mockImplementation((options: unknown) => {
    if (typeof options === 'object') {
      y = (options as { top?: number }).top ?? y;
      vi.stubGlobal('scrollY', y);
    }
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const heights: Record<string, number> = { start: 100, middle: 800, last: 2100 };
    const top = (heights[this.id] ?? 0) - y;
    return {
      top,
      bottom: top + 20,
      x: 0,
      y: top,
      left: 0,
      right: 100,
      width: 100,
      height: 20,
      toJSON: () => ({}),
    };
  });
  motion.animate.mockImplementation((_from, _to, options) => {
    const run = { stop: vi.fn(), update: options.onUpdate, complete: options.onComplete };
    runs.push(run);
    return run;
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('selects the requested chapter immediately without flashing intermediate headings', () => {
  render(<Fixture />);
  fireEvent.click(screen.getByText('Last'));
  expect(screen.getByRole('status')).toHaveTextContent('last');
  expect(motion.animate).toHaveBeenLastCalledWith(0, 1600, expect.objectContaining({ duration: 0.28 }));
  act(() => {
    runs[0].update(900);
    fireEvent.scroll(window);
  });
  expect(screen.getByRole('status')).toHaveTextContent('last');
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 900, behavior: 'instant' });
});
it('cancels a previous chapter scroll before navigation and ignores its stale completion', () => {
  render(<Fixture />);
  fireEvent.click(screen.getByText('Last'));
  fireEvent.click(screen.getByText('Middle'));
  expect(runs[0].stop).toHaveBeenCalledOnce();
  act(() => runs[0].complete());
  expect(screen.getByRole('status')).toHaveTextContent('middle');
  act(() => prepareShowcaseRoute());
  expect(runs[1].stop).toHaveBeenCalledOnce();
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' });
});
it('clamps a short final section to the actual scroll limit', () => {
  expect(chapterScrollTop(700, 1200, 88, 1600)).toBe(1600);
  expect(chapterScrollTop(-100, 0, 88, 1600)).toBe(0);
});
it('lets manual wheel input interrupt the chapter transition', () => {
  render(<Fixture />);
  fireEvent.click(screen.getByText('Last'));
  fireEvent.wheel(window);
  expect(runs[0].stop).toHaveBeenCalledOnce();
});
it('moves directly under reduced motion without starting an animation', () => {
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
  motion.animate.mockClear();
  render(<Fixture />);
  fireEvent.click(screen.getByText('Last'));
  expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 1600, behavior: 'instant' });
  expect(motion.animate).not.toHaveBeenCalled();
});
