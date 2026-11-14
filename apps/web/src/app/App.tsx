import { LoadingStage } from '@preview/ui/loading';
import { HashRouter, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { discardBrandBoot, isHomepageEntry } from '../../../../packages/preview-ui/src/brand-boot';
import { ErrorBoundary } from './ErrorBoundary';
import { AppProviders } from './AppProviders';
const Application =
  import.meta.env.MODE === 'ui' || import.meta.env.MODE === 'core'
    ? lazy(() => import('@/features/shell/PreviewApp').then((module) => ({ default: module.PreviewApp })))
    : lazy(() =>
        import('@/features/showcase/ShowcaseApp').then((module) => ({
          default: module.ShowcaseApp,
        })),
      );
const homepageBoot =
  import.meta.env.MODE !== 'ui' &&
  import.meta.env.MODE !== 'core' &&
  isHomepageEntry(window.location, import.meta.env.BASE_URL);
function ApplicationRoute() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== '/') discardBrandBoot();
  }, [location.pathname]);
  return (
    <Suspense fallback={homepageBoot && location.pathname === '/' ? null : <LoadingStage scope="screen" />}>
      <Application />
    </Suspense>
  );
}

/** Native entry; framework-only review is an explicit build mode. */
export function App() {
  return (
    <ErrorBoundary>
      <AppProviders native>
        <HashRouter>
          <ApplicationRoute />
        </HashRouter>
      </AppProviders>
    </ErrorBoundary>
  );
}
