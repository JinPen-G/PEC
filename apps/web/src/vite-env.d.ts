/// <reference types="vite/client" />

interface Window {
  __PLATFORM_RUNTIME__?: {
    mode?: 'local';
  };
  PrototypeI18n?: {
    setLocale: (locale: string | null) => void;
    refresh: () => void;
    readonly locale: string | null;
    readonly supportedLocales: string[];
  };
}
