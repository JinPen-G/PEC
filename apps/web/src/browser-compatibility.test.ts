import { afterEach, expect, test, vi } from 'vitest';
import { installBrowserCompatibility } from './browser-compatibility';

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const commandDescriptor = Object.getOwnPropertyDescriptor(document, 'execCommand');
afterEach(() => {
  vi.unstubAllGlobals();
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  else Reflect.deleteProperty(navigator, 'clipboard');
  if (commandDescriptor) Object.defineProperty(document, 'execCommand', commandDescriptor);
  else Reflect.deleteProperty(document, 'execCommand');
  document.body.replaceChildren();
});

test('HTTP UI identifiers use browser randomness and remain valid distinct UUIDs', () => {
  const getRandomValues = crypto.getRandomValues.bind(crypto);
  vi.stubGlobal('crypto', { getRandomValues });
  installBrowserCompatibility();
  const ids = Array.from({ length: 100 }, () => crypto.randomUUID());
  expect(new Set(ids).size).toBe(100);
  expect(ids.every((id) => /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/.test(id))).toBe(
    true,
  );
});

test.each([true, false])(
  'HTTP copy preserves focus and reports the actual browser result (%s)',
  async (allowed) => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    const button = document.createElement('button');
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.append(button);
    document.body.append(dialog);
    button.focus();
    const copy = vi.fn(() => {
      expect(document.querySelector('textarea')?.value).toBe('fixture text');
      expect(dialog.querySelector('textarea')).not.toBeNull();
      return allowed;
    });
    Object.defineProperty(document, 'execCommand', { configurable: true, value: copy });
    installBrowserCompatibility();
    const result = navigator.clipboard.writeText('fixture text');
    if (allowed) await expect(result).resolves.toBeUndefined();
    else await expect(result).rejects.toMatchObject({ name: 'NotAllowedError' });
    expect(copy).toHaveBeenCalledWith('copy');
    expect(document.activeElement).toBe(button);
    expect(document.querySelector('textarea')).toBeNull();
  },
);

test('native browser capabilities retain their original implementations', () => {
  const randomUUID = crypto.randomUUID;
  const clipboard = { writeText: vi.fn() };
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
  installBrowserCompatibility();
  expect(crypto.randomUUID).toBe(randomUUID);
  expect(navigator.clipboard).toBe(clipboard);
});
