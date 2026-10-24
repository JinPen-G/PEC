import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import {
  PlatformLocaleProvider,
  usePlatformLocale,
  LOCALE_STORAGE_KEY,
} from './platform-locale';

function wrapper({ children }: { children: ReactNode }) {
  return <PlatformLocaleProvider>{children}</PlatformLocaleProvider>;
}

describe('PlatformLocaleProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('默认繁体中文', () => {
    const { result } = renderHook(() => usePlatformLocale(), { wrapper });
    expect(result.current.locale).toBe('zh-Hant');
  });

  it('切换语言并持久化到 localStorage', () => {
    const { result } = renderHook(() => usePlatformLocale(), { wrapper });
    act(() => result.current.setLocale('en'));
    expect(result.current.locale).toBe('en');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
  });

  it('从 localStorage 恢复已保存的语言', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    const { result } = renderHook(() => usePlatformLocale(), { wrapper });
    expect(result.current.locale).toBe('en');
  });

  it('同步 document.documentElement.lang', () => {
    const { result } = renderHook(() => usePlatformLocale(), { wrapper });
    act(() => result.current.setLocale('en'));
    expect(document.documentElement.lang).toBe('en');
    act(() => result.current.setLocale('zh-Hant'));
    expect(document.documentElement.lang).toBe('zh-Hant');
  });

  it('Provider 外使用 hook 抛错', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      expect(() => renderHook(() => usePlatformLocale())).toThrow(/PlatformLocaleProvider/);
    } finally {
      spy.mockRestore();
    }
  });
});
