import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { AppProviders } from '@/app/AppProviders';
import { PreviewApp } from './PreviewApp';
import { DEMO_SESSION_KEY } from './demo-session';

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: () => [] });
  Object.defineProperty(Element.prototype, 'animate', {
    configurable: true,
    value: () => ({ finished: Promise.resolve(), cancel() {}, finish() {}, addEventListener() {} }),
  });
});
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
  vi.unstubAllGlobals();
  delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
  delete (Element.prototype as { animate?: unknown }).animate;
});
function start() {
  localStorage.setItem('product-experience-center:locale', 'zh-Hans');
  return render(
    <AppProviders native>
      <MemoryRouter initialEntries={['/login']}>
        <PreviewApp />
      </MemoryRouter>
    </AppProviders>,
  );
}
test('arbitrary credentials enter the native frame; password is not stored or submitted', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  start();
  fireEvent.change(screen.getByLabelText('账号'), { target: { value: '界面审阅人' } });
  fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'never-persist-me' } });
  fireEvent.click(screen.getByRole('button', { name: '进入平台' }));
  expect(await screen.findByRole('link', { name: '项目管理' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '项目管理' }).closest('.ant-app')).toBeNull();
  expect(JSON.parse(sessionStorage.getItem(DEMO_SESSION_KEY)!)).toEqual({
    mode: 'ui-demo',
    account: '界面审阅人',
  });
  expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain('never-persist-me');
  expect(fetch).not.toHaveBeenCalled();
  expect(document.querySelector('iframe')).toBeNull();
  expect(screen.queryByText('控制台')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '个人中心' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: '退出登录' }));
  expect(await screen.findByRole('button', { name: '进入平台' })).toBeInTheDocument();
  expect(sessionStorage.getItem(DEMO_SESSION_KEY)).toBeNull();
});

test('document dock opens and closes without navigating the native workspace', async () => {
  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ mode: 'ui-demo', account: 'demo' }));
  start();
  const trigger = await screen.findByRole('button', { name: '本页文档' });
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(await screen.findByRole('button', { name: '关闭文档' })).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  expect(screen.getByRole('link', { name: '项目管理' })).toHaveAttribute('aria-current', 'page');
});

test('mode tabs switch menus and restore the last admin route; brand popup switches the demo project', async () => {
  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ mode: 'ui-demo', account: 'demo' }));
  start();
  await screen.findByRole('link', { name: '项目管理' });
  fireEvent.click(screen.getByRole('button', { name: '组件中心' }));
  expect(await screen.findByRole('link', { name: '订单管理' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('button', { name: '需求管理' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '组件管理' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: '项目管理' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '管理控制台' }));
  expect(await screen.findByRole('link', { name: '项目管理' })).toHaveAttribute('aria-current', 'page');
  fireEvent.click(screen.getByRole('button', { name: 'Preview · 示例项目 A' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: '示例项目 B' }));
  expect(await screen.findByRole('button', { name: 'Preview · 示例项目 B' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '订单示例' })).toHaveAttribute('aria-current', 'page');
});

test('appearance controls save corners locally and preserve the separately saved color', async () => {
  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ mode: 'ui-demo', account: 'demo' }));
  localStorage.setItem(
    'preview:appearance',
    JSON.stringify({ version: 1, themeColor: '#996633', container: 16, button: 12, input: 10 }),
  );
  start();
  fireEvent.click(await screen.findByRole('button', { name: '个人中心' }));
  fireEvent.click(await screen.findByRole('menuitem', { name: '外观与音效' }));
  const slider = await screen.findByRole('slider', { name: '按钮圆角' });
  fireEvent.keyDown(slider, { key: 'ArrowRight' });
  fireEvent.click(screen.getByRole('button', { name: '保存圆角设置' }));
  expect(JSON.parse(localStorage.getItem('preview:appearance')!)).toMatchObject({
    themeColor: '#996633',
    button: 13,
    container: 16,
    input: 10,
  });
  expect(document.documentElement.style.getPropertyValue('--rental-ui-radius-button')).toBe('13px');
  expect(screen.getAllByRole('switch')).toHaveLength(2);
  expect(document.querySelectorAll('[data-sound-preview]')).toHaveLength(9);
  fireEvent.click(screen.getByRole('button', { name: '减少动效' }));
  expect(document.documentElement.dataset.reducedMotion).toBe('true');
});
