import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
const identity = vi.hoisted(() => ({
  session: { initialized: true },
  login: vi.fn(),
  refresh: vi.fn(),
  client: { bootstrap: vi.fn() },
}));
vi.mock('@/features/platform/platform-api', () => ({ useNativeAuth: () => identity }));
vi.mock('@/features/theme/platform-theme', () => ({
  usePlatformTheme: () => ({ resolvedMode: 'glass', setMode: vi.fn() }),
}));
vi.mock('@/features/locale/platform-locale', () => ({
  usePlatformLocale: () => ({ locale: 'zh-Hans', setLocale: vi.fn() }),
}));
vi.mock('./showcase-locale', () => ({ useShowcaseText: () => (value: string) => value }));
vi.mock('./auth-showcase/AuthShowcase', () => ({ AuthShowcase: () => <div>Interactive showcase</div> }));
vi.mock('./SiteLanguageMenu', () => ({ SiteLanguageMenu: () => <button>界面语言</button> }));
vi.mock('@preview/ui', () => ({
  SiteThemeSwitch: ({ label }: { label: string }) => <button>{label}</button>,
}));
import { SiteLogin } from './SiteLogin';
const mount = () =>
  render(
    <MemoryRouter>
      <SiteLogin />
    </MemoryRouter>,
  );
describe('mirrored site login identity boundary', () => {
  beforeEach(() => {
    identity.session.initialized = true;
    identity.login.mockReset();
    identity.refresh.mockReset();
    identity.client.bootstrap.mockReset();
  });
  afterEach(cleanup);
  it('prevents duplicate submissions, reports the real login failure and clears the password', async () => {
    let reject!: (error: Error) => void;
    identity.login.mockImplementation(
      () =>
        new Promise((_resolve, rejectPromise) => {
          reject = rejectPromise;
        }),
    );
    mount();
    fireEvent.change(screen.getByLabelText('账号'), { target: { value: 'reviewer' } });
    fireEvent.change(screen.getByLabelText('密码', { exact: true }), {
      target: { value: 'sample-password' },
    });
    const form = screen.getByRole('button', { name: '登录' }).closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(identity.login).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '登录' })).toHaveAttribute('aria-busy', 'true');
    reject(new Error('账号无效'));
    expect(await screen.findByRole('alert')).toHaveTextContent('账号无效');
    expect(screen.getByLabelText('密码', { exact: true })).toHaveValue('');
    expect(screen.getByLabelText('账号')).toHaveValue('reviewer');
    expect(identity.client.bootstrap).not.toHaveBeenCalled();
  });
  it('does not invent provider login, registration or password reset side effects', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Google' }));
    expect(screen.getByRole('status')).toHaveTextContent('尚未配置第三方登录');
    fireEvent.click(screen.getByRole('button', { name: '忘记密码？' }));
    expect(screen.getByRole('status')).toHaveTextContent('请联系管理员重置密码');
    fireEvent.click(screen.getByRole('button', { name: '联系管理员' }));
    expect(screen.getByRole('status')).toHaveTextContent('账号由管理员创建并授权');
    expect(identity.login).not.toHaveBeenCalled();
    expect(identity.client.bootstrap).not.toHaveBeenCalled();
  });
  it('preserves explicit first administrator setup and the eight-character minimum', async () => {
    identity.session.initialized = false;
    identity.client.bootstrap.mockResolvedValue({});
    identity.login.mockResolvedValue({});
    mount();
    expect(screen.getByLabelText('密码', { exact: true })).toHaveAttribute('minlength', '8');
    fireEvent.change(screen.getByLabelText('显示名称'), { target: { value: 'Administrator' } });
    fireEvent.change(screen.getByLabelText('账号'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('密码', { exact: true }), { target: { value: '12345678' } });
    fireEvent.submit(screen.getByRole('button', { name: '创建管理员并进入' }).closest('form')!);
    await waitFor(() => expect(identity.login).toHaveBeenCalledWith('admin', '12345678'));
    expect(identity.client.bootstrap).toHaveBeenCalledWith({
      username: 'admin',
      password: '12345678',
      displayName: 'Administrator',
    });
  });
});
