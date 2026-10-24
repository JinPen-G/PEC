import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import '@/i18n';
import { PlatformLocaleProvider } from '@/features/locale/platform-locale';
import { PlatformThemeProvider } from '@/features/theme/platform-theme';

import { PlatformShell } from './PlatformShell';

beforeEach(() => {
  // jsdom 默認不實現 matchMedia；這裏固定成桌面態，纔會渲染常駐側欄而不是抽屜。
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('min-width'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('PlatformShell', () => {
  it('uses one sidebar frame with grouped navigation and a separate content panel', () => {
    render(
      <PlatformLocaleProvider>
        <PlatformThemeProvider>
          <MemoryRouter initialEntries={['/tools/console']}>
            <Routes>
              <Route element={<PlatformShell />}>
                <Route path="tools/console" element={<div>控制台內容</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </PlatformThemeProvider>
      </PlatformLocaleProvider>,
    );

    expect(document.querySelector('.app-sider')).not.toBeNull();
    expect(document.querySelector('.app-workspace-panel')).not.toBeNull();
    expect(screen.getByRole('img', { name: '產品功能體驗中心' })).toBeInTheDocument();
    // 一級是分組標題，控制台掛在「概覽」分組下。
    expect(screen.getByText('概覽')).toBeInTheDocument();
    expect(screen.getAllByText('控制台').length).toBeGreaterThan(0);
    expect(screen.getByText('控制台內容')).toBeInTheDocument();
  });
});
