import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test } from 'vitest';
import { PlatformLocaleProvider, usePlatformLocale } from '@/features/locale/platform-locale';
import { LocalizedView } from './showcase-locale';
beforeEach(() => localStorage.clear());
function Fixture() {
  const { setLocale } = usePlatformLocale();
  return (
    <>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('zh-Hant')}>繁體</button>
      <LocalizedView>
        <button aria-label="新增車型組">新增車型組</button>
        <input aria-label="搜索品牌或型號" />
        <pre>
          <code>const title = '車型組管理';</code>
        </pre>
      </LocalizedView>
    </>
  );
}
test('default simplified UI, English controls and traditional restoration preserve source text', () => {
  const view = render(
    <PlatformLocaleProvider>
      <Fixture />
    </PlatformLocaleProvider>,
  );
  expect(screen.getByRole('button', { name: '新增车型组' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'English' }));
  expect(screen.getByRole('button', { name: 'Add vehicle group' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Search brand or model' })).toBeInTheDocument();
  expect(screen.getByText("const title = '車型組管理';")).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '繁體' }));
  expect(screen.getByRole('button', { name: '新增車型組' })).toBeInTheDocument();
  act(() => view.unmount());
  render(
    <PlatformLocaleProvider>
      <Fixture />
    </PlatformLocaleProvider>,
  );
  expect(document.documentElement.lang).toBe('zh-Hant');
});
