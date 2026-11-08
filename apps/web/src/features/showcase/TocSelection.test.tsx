import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { TocSelection } from './TocSelection';
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it('retargets the same marker in list coordinates while the document moves', () => {
  let documentOffset = 0;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const top = documentOffset + (this.textContent === 'Last' ? 90 : 0);
    return {
      top,
      bottom: top + 30,
      height: 30,
      width: 100,
      left: 0,
      right: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    };
  });
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(function (this: HTMLElement) {
    return [this.getBoundingClientRect()] as unknown as DOMRectList;
  });
  const list = (last: boolean) => (
    <TocSelection activeKey={last ? 'last' : 'first'}>
      <li>
        <button aria-current={!last ? 'location' : undefined}>First</button>
      </li>
      <li>
        <button aria-current={last ? 'location' : undefined}>Last</button>
      </li>
    </TocSelection>
  );
  const view = render(list(false));
  const marker = view.container.querySelector('.showcase-toc-marker');
  expect(marker).toBeInTheDocument();
  documentOffset = -500;
  view.rerender(list(true));
  expect(view.container.querySelector('.showcase-toc-marker')).toBe(marker);
  expect(view.container.querySelectorAll('.showcase-toc-marker')).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Last' })).toHaveAttribute('aria-current', 'location');
});
