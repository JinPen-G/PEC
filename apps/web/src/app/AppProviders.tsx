import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { ControlEnvironmentProvider } from '@preview/ui';
import { usePrefersReducedMotion } from '@/features/motion/use-motion-preference';
import { useShowcaseText } from '@/features/showcase/showcase-locale';

import i18n from '@/i18n';
import { App as AntApp, ConfigProvider, enUS, zhCN, zhTW } from '@/ui/ant';
import { createAntThemeConfig } from '@/features/theme/ant-theme-config';
import { applyNativeAntColors, createNativeAntTheme } from '@/features/theme/admin-theme';
import { PlatformThemeProvider, usePlatformTheme } from '@/features/theme/platform-theme';
import { PlatformLocaleProvider, usePlatformLocale } from '@/features/locale/platform-locale';
import {
  AppearanceProvider,
  resolveRadii,
  useAppearancePreferences,
} from '@/features/appearance/appearance-preferences';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 20_000,
      retry: 1,
    },
  },
});

export function AppProviders({ children, native = false }: { children: ReactNode; native?: boolean }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformLocaleProvider>
        <PlatformThemeProvider>
          <AppearanceProvider>
            <AntDesignProvider native={native}>{children}</AntDesignProvider>
          </AppearanceProvider>
        </PlatformThemeProvider>
      </PlatformLocaleProvider>
    </QueryClientProvider>
  );
}

function AntDesignProvider({ children, native }: { children: ReactNode; native: boolean }) {
  const { resolvedMode } = usePlatformTheme();
  const { locale } = usePlatformLocale();
  const { preferences } = useAppearancePreferences();
  const reducedMotion = usePrefersReducedMotion();
  const translate = useShowcaseText();
  useLayoutEffect(() => {
    if (native) return applyNativeAntColors(document.documentElement, resolvedMode === 'dark', preferences);
  }, [native, resolvedMode, preferences]);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <ConfigProvider
      locale={locale === 'en' ? enUS : locale === 'zh-Hans' ? zhCN : zhTW}
      theme={
        native
          ? createNativeAntTheme(resolvedMode === 'dark', preferences)
          : createAntThemeConfig(resolvedMode)
      }
    >
      <ControlEnvironmentProvider
        locale={locale}
        reducedMotion={reducedMotion}
        translate={translate}
        radii={resolveRadii(preferences)}
      >
        {native ? children : <AntApp>{children}</AntApp>}
      </ControlEnvironmentProvider>
    </ConfigProvider>
  );
}
