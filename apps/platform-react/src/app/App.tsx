import { HashRouter } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './AppRoutes';
import { startDeploymentVersionCheck } from './deployment-updates';
import { warmPrototypeVendorCache } from '@/ui/platform/warmPrototypeVendorCache';

// 首次啓動引導只在空工作區時出現，且本身要等 bootstrap 接口返回後才會展示，
// 延遲加載可把 Form/Input 等僅在彈窗內使用的依賴移出首屏 chunk，不影響可見行爲。
const WorkspaceOnboarding = lazy(() =>
  import('@/features/projects/WorkspaceOnboarding').then((module) => ({
    default: module.WorkspaceOnboarding,
  })),
);

export function App() {
  useEffect(() => {
    if (!import.meta.env.PROD || window.__PLATFORM_RUNTIME__?.mode === 'local') return;
    return startDeploymentVersionCheck({
      buildId: import.meta.env.VITE_PLATFORM_BUILD_ID || '',
      baseUrl: import.meta.env.BASE_URL,
    });
  }, []);

  useEffect(() => {
    warmPrototypeVendorCache();
  }, []);

  return (
    <AppProviders>
      <div className="app-frame-stage">
        <div className="app-frame">
          <ErrorBoundary>
            <HashRouter>
              <AppRoutes />
              <Suspense fallback={null}>
                <WorkspaceOnboarding />
              </Suspense>
            </HashRouter>
          </ErrorBoundary>
        </div>
      </div>
    </AppProviders>
  );
}
