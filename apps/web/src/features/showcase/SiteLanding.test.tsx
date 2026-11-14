import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AnimateUIProvider } from '@animate-ui/react/provider';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SiteLanding } from './SiteLanding';
import { createLandingCommands } from './landing-copy';
import { motionValue } from 'motion/react';
import { ShuffleLogo } from '../../../../../packages/preview-ui/src/site/landing/ShuffleLogo';

vi.mock('./showcase-locale', () => ({ useShowcaseText: () => (text: string) => text }));
vi.mock('@preview/ui/landing', async () => {
  const [hero, orbit, agent, command] = await Promise.all([
    import('../../../../../packages/preview-ui/src/site/landing/LandingHeroTitle'),
    import('../../../../../packages/preview-ui/src/site/landing/LandingOrbit'),
    import('../../../../../packages/preview-ui/src/site/landing/LandingAgentDemo'),
    import('../../../../../packages/preview-ui/src/site/landing/LandingCommand'),
  ]);
  return { ...hero, ...orbit, ...agent, ...command };
});

const observers: VisibilityObserver[] = [];
class VisibilityObserver {
  targets = new Set<Element>();
  constructor(
    public callback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void,
  ) {
    observers.push(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
  }
}
function visibility(visible: boolean) {
  act(() => {
    for (const observer of observers)
      observer.callback(
        [...observer.targets].map((target) => ({
          target,
          isIntersecting: visible,
          intersectionRatio: visible ? 1 : 0,
        })) as IntersectionObserverEntry[],
        observer as unknown as IntersectionObserver,
      );
  });
}
const clipboard = vi.fn();
beforeEach(() => {
  observers.length = 0;
  clipboard.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: clipboard } });
  vi.stubGlobal('IntersectionObserver', VisibilityObserver);
  // jsdom has no SVG path measurement or Web Animations; browser checks cover the real motion.
  vi.stubGlobal('SVGGeometryElement', class extends SVGElement {});
  vi.stubGlobal('Animation', class {});
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    value: vi.fn(
      () =>
        ({
          cancel: () => {},
          finish: () => {},
          pause: () => {},
          play: () => {},
          finished: Promise.resolve(),
          onfinish: null,
        }) as unknown as Animation,
    ),
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
function mount(reduced = true) {
  return render(
    <MemoryRouter>
      <AnimateUIProvider reducedMotion={reduced ? 'always' : 'never'}>
        <SiteLanding />
      </AnimateUIProvider>
    </MemoryRouter>,
  );
}

it('provides a platform homepage and nine working examples without a business package', () => {
  const view = mount();
  const gallery = screen.getByRole('region', { name: '组件交互演示' });
  expect(view.container.querySelectorAll('[data-slot="orbit-card"]')).toHaveLength(9);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('从预览，走向实现。');
  expect(screen.getByRole('link', { name: '浏览页面' })).toHaveAttribute('href', '/pages');
  expect(screen.getByRole('link', { name: '接入 MCP' })).toHaveAttribute('href', '/docs/ai');
  fireEvent.click(within(gallery).getByRole('switch', { name: 'Airplane Mode' }));
  expect(within(gallery).getByRole('switch', { name: 'Airplane Mode' })).toHaveAttribute(
    'aria-checked',
    'false',
  );
  fireEvent.click(within(gallery).getByRole('checkbox', { name: 'Book the studio' }));
  expect(within(gallery).getByRole('checkbox', { name: 'Book the studio' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  fireEvent.click(within(gallery).getByRole('radio', { name: 'Compact' }));
  expect(within(gallery).getByRole('radio', { name: 'Compact' })).toHaveAttribute('aria-checked', 'true');
  fireEvent.click(within(gallery).getByRole('tab', { name: 'Analytics' }));
  expect(within(gallery).getByRole('tabpanel', { name: 'Analytics' })).toHaveTextContent(
    'Page views up 25% this week.',
  );
});

it('copies complete current-origin commands and keeps tokens as placeholders', async () => {
  mount();
  const hero = document.querySelector('.home-hero') as HTMLElement;
  const expected = createLandingCommands(window.location.origin);
  fireEvent.click(within(hero).getByRole('button', { name: '复制接入命令' }));
  await waitFor(() => expect(clipboard).toHaveBeenCalledWith(expected[0].command));
  expect(within(hero).getByRole('status')).toHaveTextContent('接入命令已复制。');
  fireEvent.click(within(hero).getByRole('tab', { name: 'Cursor' }));
  fireEvent.click(within(hero).getByRole('button', { name: '复制接入命令' }));
  await waitFor(() => expect(clipboard).toHaveBeenCalledWith(expected[1].command));
  const configuration = JSON.parse(expected[1].command);
  expect(configuration.mcpServers.preview.url).toBe(`${window.location.origin}/api/project-context/mcp`);
  expect(configuration.mcpServers.preview.headers.Authorization).toBe('Bearer <project-read-only-token>');
});

it('reports clipboard failure and allows a successful retry', async () => {
  clipboard.mockRejectedValueOnce(new Error('Clipboard blocked'));
  mount();
  const hero = document.querySelector('.home-hero') as HTMLElement;
  fireEvent.click(within(hero).getByRole('button', { name: '复制接入命令' }));
  await waitFor(() => expect(within(hero).getByRole('status')).toHaveTextContent('复制失败'));
  expect(within(hero).queryByRole('button', { name: '已复制接入命令' })).toBeNull();
  fireEvent.click(within(hero).getByRole('button', { name: '复制接入命令' }));
  await waitFor(() => expect(within(hero).getByRole('status')).toHaveTextContent('接入命令已复制。'));
});

it('shows actual MCP reading steps and asks about adopting governance independently', () => {
  mount();
  const scenarios = screen.getByRole('tablist', { name: 'MCP 开发场景' });
  fireEvent.click(within(scenarios).getByRole('tab', { name: '读取源码' }));
  expect(screen.getByText('get_component', { selector: 'code' })).toBeInTheDocument();
  expect(screen.getByText('read_component_file', { selector: 'code' })).toBeInTheDocument();
  fireEvent.click(within(scenarios).getByRole('tab', { name: '工程治理' }));
  expect(screen.getByText('是否在你的工程中采用这套治理规范？')).toBeInTheDocument();
  expect(screen.getByText('示例：规则可独立用于任何工程，采用方式由你决定')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '查看工程治理' })).toHaveAttribute(
    'href',
    '/docs/ai?anchor=%E5%B7%A5%E7%A8%8B%E6%B2%BB%E7%90%86',
  );
  fireEvent.click(within(scenarios).getByRole('tab', { name: '查看更新' }));
  expect(screen.getByText('read_project_updates', { selector: 'code' })).toBeInTheDocument();
  expect(screen.getByText('source: platform', { selector: 'code' })).toBeInTheDocument();
  expect(screen.getByText('source: project', { selector: 'code' })).toBeInTheDocument();
  const footer = screen.getByRole('contentinfo');
  expect(within(footer).getByRole('link', { name: 'JinPen-G' })).toHaveAttribute(
    'href',
    'https://github.com/JinPen-G',
  );
  expect(
    within(footer)
      .getAllByRole('link', { name: 'GitHub' })
      .every((link) => link.getAttribute('href') === 'https://github.com/JinPen-G/Preview'),
  ).toBe(true);
});

it('pauses decorative examples off screen and after focus, then releases timers on unmount', () => {
  vi.useFakeTimers();
  const view = mount(false);
  const gallery = screen.getByRole('region', { name: '组件交互演示' });
  const switchControl = within(gallery).getByRole('switch', { name: 'Airplane Mode' });
  const initial = switchControl.getAttribute('aria-checked');
  act(() => vi.advanceTimersByTime(1800));
  expect(switchControl.getAttribute('aria-checked')).toBe(initial);
  visibility(true);
  act(() => vi.advanceTimersByTime(0));
  const playing = switchControl.getAttribute('aria-checked');
  expect(playing).not.toBe(initial);
  fireEvent.focus(switchControl);
  act(() => vi.advanceTimersByTime(3500));
  expect(switchControl.getAttribute('aria-checked')).toBe(playing);
  visibility(false);
  view.unmount();
  const calls = clipboard.mock.calls.length;
  act(() => vi.runOnlyPendingTimers());
  expect(clipboard).toHaveBeenCalledTimes(calls);
});

it('scrubs card extraction from scroll progress, holds at rest and reverses to the same stack', () => {
  vi.useFakeTimers();
  const progress = motionValue(20);
  const view = render(
    <AnimateUIProvider reducedMotion="never">
      <ShuffleLogo progress={progress} />
    </AnimateUIProvider>,
  );
  const cards = () =>
    [...view.container.querySelectorAll('[data-card]')].map((card) => card.getAttribute('transform'));
  const order = () =>
    [...view.container.querySelector('[data-drawing]')!.children].map((card) =>
      card.getAttribute('data-card-wrapper'),
    );
  const initial = cards();
  expect(order()).toEqual(['0', '1', '2', '3']);
  act(() => vi.advanceTimersByTime(6400));
  expect(cards()).toEqual(initial);
  act(() => progress.set(36));
  expect(cards()).not.toEqual(initial);
  expect(order()).toEqual(['3', '0', '1', '2']);
  act(() => progress.set(20));
  expect(cards()).toEqual(initial);
  expect(order()).toEqual(['0', '1', '2', '3']);
  act(() => progress.set(100));
  expect(order()).toEqual(['0', '1', '2', '3']);
  view.unmount();
  act(() => progress.set(50));
  progress.destroy();
});
