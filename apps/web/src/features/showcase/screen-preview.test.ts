import { expect, it } from 'vitest';
import { screenPreviewBounds } from './screen-preview';

it('fits the complete desktop viewport without reflowing the screen into the document column', () => {
  const bounds = screenPreviewBounds({
    available: 720,
    fitHeight: 520,
    mobile: false,
    expanded: false,
    maxWidth: 280,
  });
  expect(bounds).toEqual({ width: 1440, height: 900, frameWidth: 720, frameHeight: 450, scale: 0.5 });
  expect(
    screenPreviewBounds({ available: 360, fitHeight: 480, mobile: false, expanded: false, maxWidth: 280 }),
  ).toMatchObject({ width: 1440, height: 900, frameWidth: 360, frameHeight: 225, scale: 0.25 });
});

it('uses the actual available space fullscreen and a real mobile layout in phone mode', () => {
  expect(
    screenPreviewBounds({ available: 1800, fitHeight: 960, mobile: false, expanded: true, maxWidth: 410 }),
  ).toEqual({ width: 1800, height: 960, frameWidth: 1800, frameHeight: 960, scale: 1 });
  const phone = screenPreviewBounds({
    available: 900,
    fitHeight: 520,
    mobile: true,
    expanded: false,
    maxWidth: 280,
  });
  expect(phone).toMatchObject({ width: 390, height: 844, frameWidth: 280 });
  expect(phone.frameHeight / phone.frameWidth).toBeCloseTo(844 / 390);
});

it('does not upscale a desktop thumbnail or produce invalid bounds before measurement', () => {
  expect(
    screenPreviewBounds({ available: 2000, fitHeight: 900, mobile: false, expanded: false, maxWidth: 280 })
      .scale,
  ).toBe(1);
  expect(
    screenPreviewBounds({ available: 0, fitHeight: 0, mobile: false, expanded: true, maxWidth: 280 }),
  ).toEqual({ width: 1, height: 1, frameWidth: 1, frameHeight: 1, scale: 1 });
});
