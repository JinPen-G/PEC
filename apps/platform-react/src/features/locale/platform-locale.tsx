import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type PlatformLocale = 'zh-Hant' | 'zh-Hans' | 'en';

interface PlatformLocaleContextValue {
  locale: PlatformLocale;
  setLocale: (locale: PlatformLocale) => void;
}

export const LOCALE_STORAGE_KEY = 'product-experience-center:locale';
const PlatformLocaleContext = createContext<PlatformLocaleContextValue | null>(null);

export function readStoredLocale(): PlatformLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'en' || stored === 'zh-Hant' || stored === 'zh-Hans') return stored;
    return 'zh-Hant';
  } catch {
    return 'zh-Hant';
  }
}

export function PlatformLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<PlatformLocale>(readStoredLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<PlatformLocaleContextValue>(
    () => ({
      locale,
      setLocale(nextLocale) {
        setLocaleState(nextLocale);
        try {
          localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
        } catch {
          // Storage is optional; the active session still updates.
        }
      },
    }),
    [locale],
  );

  return <PlatformLocaleContext.Provider value={value}>{children}</PlatformLocaleContext.Provider>;
}

export function usePlatformLocale() {
  const context = useContext(PlatformLocaleContext);
  if (!context) throw new Error('usePlatformLocale must be used inside PlatformLocaleProvider.');
  return context;
}
