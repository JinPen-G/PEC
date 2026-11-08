import { LoadingStage } from '@preview/ui/loading';
import { HashRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { AppProviders } from './AppProviders';
const Application = ['ui', 'core'].includes(import.meta.env.MODE)
  ? lazy(() => import('@/features/shell/PreviewApp').then((module) => ({ default: module.PreviewApp })))
  : lazy(() =>
      import('@/features/showcase/ShowcaseApp').then((module) => ({
        default: module.ShowcaseApp,
      })),
    );

/** Native entry; framework-only review is an explicit build mode. */
export function App() {
  return (
    <AppProviders native>
      <ErrorBoundary>
        <HashRouter>
          <Suspense fallback={<LoadingStage scope="screen" />}>
            <Application />
          </Suspense>
        </HashRouter>
      </ErrorBoundary>
    </AppProviders>
  );
}
