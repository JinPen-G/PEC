import { createElement, useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { fileURLToPath, URL as NodeURL } from 'node:url';
import { layoutMeasurementAdapter } from '../../plugins/layout-measurement-plugin.js';
import {
  ListFilterBar,
  ListFilterItem,
} from '../../packages/preview-ui/src/admin-controls/runtime/apps/admin/src/components/ui/ListFilterBar';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('plans filters using the Screen width and retains selected values when the logical viewport narrows', () => {
  let logicalWidth = 1100;
  const observers = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback) {
        this.callback = callback;
      }
      observe(target) {
        observers.push(() => this.callback([{ target, contentRect: { width: logicalWidth } }]));
      }
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function () {
    return this.hasAttribute('data-list-filter-bar') ? logicalWidth : 160;
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function () {
    if (this.hasAttribute('data-list-filter-bar')) return logicalWidth;
    return this.dataset.filterKind === 'search' ? 280 : 144;
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    const width = this.offsetWidth / 3;
    return { x: 0, y: 0, width, height: 12, top: 0, left: 0, right: width, bottom: 12, toJSON() {} };
  });
  function Filters() {
    const [value, setValue] = useState('');
    return createElement(
      ListFilterBar,
      {},
      createElement(ListFilterItem, { kind: 'search' }, createElement('input', { 'aria-label': 'Search' })),
      ...['Company', 'Status', 'Method'].map((label) =>
        createElement(
          ListFilterItem,
          { key: label, label },
          createElement('input', {
            'aria-label': label,
            value,
            onChange: (event) => setValue(event.target.value),
          }),
        ),
      ),
    );
  }
  const view = render(createElement(Filters));
  expect(view.container.querySelectorAll('[data-filter-kind="filter"]')).toHaveLength(3);
  expect(screen.queryByRole('button', { name: '更多搜索' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Company' }), {
    target: { value: 'Selected company' },
  });
  act(() => {
    logicalWidth = 330;
    observers.forEach((notify) => notify());
  });
  expect(view.container.querySelectorAll('[data-filter-kind="filter"]')).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: '更多搜索' }));
  expect(screen.getByRole('textbox', { name: 'Company' })).toHaveValue('Selected company');
  act(() => {
    logicalWidth = 1100;
    observers.forEach((notify) => notify());
  });
  expect(view.container.querySelectorAll('[data-filter-kind="filter"]')).toHaveLength(3);
  expect(screen.getByRole('textbox', { name: 'Company' })).toHaveValue('Selected company');
});

it('adapts only declared layout measurements and refuses an unrecognized upstream revision', () => {
  const adapter = layoutMeasurementAdapter();
  const source = 'const position = target.getBoundingClientRect().width;';
  expect(adapter.transform(source, '/project/Popup.tsx')).toBeUndefined();
  const target = fileURLToPath(
    new NodeURL(
      '../../packages/preview-ui/src/admin-controls/runtime/apps/admin/src/components/ui/ListFilterBar.tsx',
      import.meta.url,
    ),
  );
  expect(() => adapter.transform(source, target)).toThrow('Layout measurement source changed');
});
