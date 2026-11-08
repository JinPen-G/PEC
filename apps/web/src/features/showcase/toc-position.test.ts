import { expect, it } from 'vitest';
import { activeTocSection } from './toc-position';
it('selects the final heading at the bottom even when it cannot reach the top threshold', () => {
  expect(
    activeTocSection(
      [
        { id: 'editing', top: -140 },
        { id: 'validation', top: 170 },
        { id: 'scope', top: 370 },
      ],
      { scrollTop: 1300, height: 800, scrollHeight: 2100 },
    ),
  ).toBe('scope');
});
it('uses the passed heading normally and does not select the tail of an unscrollable document', () => {
  const sections = [
    { id: 'preview', top: -200 },
    { id: 'details', top: 110 },
    { id: 'scope', top: 460 },
  ];
  expect(activeTocSection(sections, { scrollTop: 500, height: 800, scrollHeight: 2100 })).toBe('details');
  expect(
    activeTocSection(
      [
        { id: 'intro', top: 100 },
        { id: 'scope', top: 420 },
      ],
      { scrollTop: 0, height: 800, scrollHeight: 800 },
    ),
  ).toBe('intro');
});
