import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AuthDemos from './AuthDemos';
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
afterEach(() => {
  cleanup();
  if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
  else Reflect.deleteProperty(navigator, 'clipboard');
});
it('shows copied feedback only after clipboard success and keeps denied copying distinct', async () => {
  const writeText = vi
    .fn()
    .mockRejectedValueOnce(new Error('Clipboard denied'))
    .mockResolvedValueOnce(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  render(<AuthDemos index={3} />);
  fireEvent.click(screen.getByRole('button', { name: 'Copy example' }));
  expect(await screen.findByText('Copy failed')).toBeInTheDocument();
  expect(screen.queryByText('Copied')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Copy example' }));
  expect(await screen.findByText('Copied')).toBeInTheDocument();
  expect(writeText).toHaveBeenCalledWith('Preview · Prototypes and business requirements');
});
