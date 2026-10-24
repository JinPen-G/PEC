import { createPlatformClient } from '../../../../packages/platform-client/src/index.js';

const localRuntime =
  typeof window !== 'undefined' && window.__PLATFORM_RUNTIME__?.mode === 'local' ? 'local' : undefined;

export const platformApi = createPlatformClient({
  baseUrl: import.meta.env.BASE_URL,
  development: import.meta.env.DEV || localRuntime === 'local',
  apiMode: localRuntime,
  staticAssetVersion: import.meta.env.VITE_PLATFORM_BUILD_ID || '',
});
