import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PlatformLocaleProvider } from '@/features/locale/platform-locale';
import { PageActions } from './PageActions';

afterEach(cleanup);
function open(publicPage: boolean) {
  render(
    <PlatformLocaleProvider>
      <PageActions
        markdown="# Example"
        markdownUrl="/example/markdown"
        pageUrl="https://example.com/page"
        projectId="sample"
        publicPage={publicPage}
      />
    </PlatformLocaleProvider>,
  );
  fireEvent.keyDown(screen.getByRole('button', { name: '更多页面操作' }), { key: 'ArrowDown' });
}
it('opens without locking the page scrollbar and retains official assistant destinations', async () => {
  open(true);
  expect(await screen.findByRole('menuitem', { name: 'Open in DeepSeek' })).toHaveAttribute(
    'href',
    'https://chat.deepseek.com/',
  );
  expect(screen.getByRole('menuitem', { name: 'Open in WorkBuddy' })).toHaveAttribute(
    'href',
    'https://www.workbuddy.cn/',
  );
  expect(document.body).not.toHaveAttribute('data-scroll-locked');
  expect(document.body.style.overflow).not.toBe('hidden');
});
it('does not expose external assistant actions for restricted pages', async () => {
  open(false);
  await screen.findByRole('menu');
  expect(screen.queryByRole('menuitem', { name: /Open in/ })).not.toBeInTheDocument();
});
