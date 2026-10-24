import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import i18n from '@/i18n';
import { App as AntApp, ConfigProvider, enUS, zhTW } from '@/ui/ant';
import { createAntThemeConfig } from '@/features/theme/ant-theme-config';
import { PlatformThemeProvider, usePlatformTheme } from '@/features/theme/platform-theme';
import {
  PlatformLocaleProvider,
  usePlatformLocale,
} from '@/features/locale/platform-locale';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 20_000,
      retry: 1,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformLocaleProvider>
        <PlatformThemeProvider>
          <AntDesignProvider>{children}</AntDesignProvider>
        </PlatformThemeProvider>
      </PlatformLocaleProvider>
    </QueryClientProvider>
  );
}

function AntDesignProvider({ children }: { children: ReactNode }) {
  const { resolvedMode } = usePlatformTheme();
  const { locale } = usePlatformLocale();

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <ConfigProvider locale={locale === 'en' ? enUS : zhTW} theme={createAntThemeConfig(resolvedMode)}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
