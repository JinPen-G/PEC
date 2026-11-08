import { afterEach, beforeEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PlatformLocaleProvider } from '@/features/locale/platform-locale';
import { SiteLanguageMenu } from './SiteLanguageMenu';
beforeEach(() => localStorage.clear());
afterEach(cleanup);
it('uses a keyboard-accessible component menu and persists English without a native select', async () => {
  const view = render(
    <PlatformLocaleProvider>
      <SiteLanguageMenu />
    </PlatformLocaleProvider>,
  );
  expect(view.container.querySelector('select')).toBeNull();
  fireEvent.keyDown(screen.getByRole('button', { name: '界面语言' }), { key: 'ArrowDown' });
  expect(await screen.findByRole('menuitemradio', { name: '简体中文' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'English' }));
  await waitFor(() => expect(document.documentElement.lang).toBe('en'));
  expect(screen.getByRole('button', { name: 'Language' })).toHaveTextContent('English');
  expect(document.body).not.toHaveAttribute('data-scroll-locked');
});
