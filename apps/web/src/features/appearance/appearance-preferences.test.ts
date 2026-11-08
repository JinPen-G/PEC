import { expect, test } from 'vitest';
import { parseAppearance, resolveRadii } from './appearance-preferences';

test('invalid stored settings preserve native defaults; only buttons allow the pill radius', () => {
  expect(resolveRadii(parseAppearance('invalid'))).toEqual({ container: 26, button: 18, input: 18 });
  expect(
    parseAppearance(
      JSON.stringify({
        version: 1,
        themeColor: 'url(https://invalid)',
        container: 999,
        button: 999,
        input: -1,
      }),
    ),
  ).toMatchObject({ themeColor: '', container: 40, button: 999, input: 8 });
});
