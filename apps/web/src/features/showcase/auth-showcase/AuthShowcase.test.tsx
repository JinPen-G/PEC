import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
vi.mock('./AuthDemos', () => ({ default: ({ index }: { index: number }) => <div>Demo {index}</div> }));
vi.mock('../showcase-locale', () => ({ useShowcaseText: () => (value: string) => value }));
import { AuthShowcase } from './AuthShowcase';
afterEach(cleanup);
it('pauses on pointer or focus and allows manual switching without restarting playback', async () => {
  const view = render(<AuthShowcase />);
  await screen.findByText('Demo 0');
  const progress = () => view.container.querySelector<HTMLElement>('.auth-showcase_progress__G8Plf')!;
  const root = view.container.firstElementChild!;
  fireEvent.pointerEnter(root);
  expect(progress().style.animationPlayState).toBe('paused');
  fireEvent.pointerLeave(root);
  fireEvent.click(screen.getByRole('button', { name: '暂停展示' }));
  expect(progress().style.animationPlayState).toBe('paused');
  fireEvent.click(screen.getByRole('button', { name: '下一项展示' }));
  expect(await screen.findByText('Demo 1')).toBeInTheDocument();
  expect(progress().style.animationPlayState).toBe('paused');
  fireEvent.click(screen.getByRole('button', { name: '播放展示' }));
  // jsdom exposes WebKit's prefixed animation event to React's event detector.
  fireEvent(progress(), new Event('webkitAnimationEnd', { bubbles: true }));
  expect(await screen.findByText('Demo 2')).toBeInTheDocument();
});
