import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { PlatformLocaleProvider, LOCALE_STORAGE_KEY } from '@/features/locale/platform-locale';

const identity = vi.hoisted(() => ({
  session: { user: { id: 'sample', username: 'sample-user', displayName: '演示用户', role: 'member' } },
  logout: vi.fn(),
}));
vi.mock('@/features/platform/platform-api', () => ({ useNativeAuth: () => identity }));
vi.mock('@/features/platform/PasswordForm', () => ({
  PasswordForm: ({ onClose }: { onClose: () => void }) => (
    <section role="dialog" aria-label="Password form">
      <button onClick={onClose}>Close form</button>
    </section>
  ),
}));
import { SiteAccountMenu } from './SiteAccountMenu';

function Location() {
  const location = useLocation();
  return <output aria-label="Current route">{location.pathname}</output>;
}
function mount() {
  return render(
    <PlatformLocaleProvider>
      <MemoryRouter initialEntries={['/pages/sample/admin/example']}>
        <SiteAccountMenu />
        <Location />
      </MemoryRouter>
    </PlatformLocaleProvider>,
  );
}
beforeEach(() => {
  localStorage.clear();
  identity.session.user.role = 'member';
  identity.logout.mockReset();
});
afterEach(cleanup);

it('offers the member destination, English actions and a compact unnamed trigger', async () => {
  localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
  mount();
  const trigger = screen.getByRole('button', { name: 'Account menu · 演示用户' });
  expect(trigger).not.toHaveTextContent('演示用户');
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  expect(await screen.findByRole('menuitem', { name: 'My projects' })).toHaveAttribute('href', '/projects');
  expect(screen.getByRole('menuitem', { name: 'Sign out' })).toBeInTheDocument();
  expect(screen.queryByRole('menuitem', { name: 'Administration' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('menuitem', { name: 'Change password' }));
  expect(await screen.findByRole('dialog', { name: 'Password form' })).toBeInTheDocument();
  expect(identity.logout).not.toHaveBeenCalled();
});

it('keeps the session on logout failure and goes to the unified login only after a successful retry', async () => {
  mount();
  identity.logout.mockRejectedValueOnce(new Error('暂时无法退出'));
  fireEvent.keyDown(screen.getByRole('button', { name: '用户菜单 · 演示用户' }), { key: 'ArrowDown' });
  fireEvent.click(await screen.findByRole('menuitem', { name: '退出登录' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('暂时无法退出');
  expect(screen.getByRole('status', { name: 'Current route' })).toHaveTextContent(
    '/pages/sample/admin/example',
  );
  let resolve!: () => void;
  identity.logout.mockImplementationOnce(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  fireEvent.click(screen.getByRole('menuitem', { name: '退出登录' }));
  expect(screen.getByRole('menuitem', { name: '正在退出…' })).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(screen.getByRole('menuitem', { name: '正在退出…' }));
  expect(identity.logout).toHaveBeenCalledTimes(2);
  await act(async () => resolve());
  await waitFor(() =>
    expect(screen.getByRole('status', { name: 'Current route' })).toHaveTextContent('/login'),
  );
});

it('offers the existing administration route for administrators', async () => {
  identity.session.user.role = 'admin';
  mount();
  fireEvent.keyDown(screen.getByRole('button', { name: '用户菜单 · 演示用户' }), { key: 'ArrowDown' });
  expect(await screen.findByRole('menuitem', { name: '管理后台' })).toHaveAttribute(
    'href',
    '/manage/projects',
  );
  expect(document.body).not.toHaveAttribute('data-scroll-locked');
});
