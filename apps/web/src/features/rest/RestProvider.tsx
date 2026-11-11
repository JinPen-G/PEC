import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LoadingStage } from '@preview/ui/loading';
import { RestContext, useRest } from './rest-context';
import { createRestPlayer, type RestPlayer } from './rest-player';
import { REST_TRACK } from './rest-track';

const Experience = lazy(() => import('./RestExperience'));

function RestLayer() {
  const { snapshot } = useRest();
  const [loaded, setLoaded] = useState(false);
  if (!loaded && snapshot.phase !== 'idle') setLoaded(true);
  if (!loaded && snapshot.phase === 'idle') return null;
  return (
    <Suspense fallback={<LoadingStage scope="screen" />}>
      <Experience />
    </Suspense>
  );
}

export function RestProvider({ children, controller }: { children: ReactNode; controller?: RestPlayer }) {
  const [player] = useState(() => controller ?? createRestPlayer({ track: REST_TRACK }));
  const entry = useRef<HTMLButtonElement>(null);
  const value = useMemo(() => ({ player, entry }), [player]);
  useEffect(() => {
    const check = () => {
      player.checkDeadline();
    };
    const pagehide = () => {
      player.pause();
    };
    window.addEventListener('pageshow', check);
    window.addEventListener('pagehide', pagehide);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.removeEventListener('pageshow', check);
      window.removeEventListener('pagehide', pagehide);
      document.removeEventListener('visibilitychange', check);
      player.dispose();
    };
  }, [player]);
  return (
    <RestContext.Provider value={value}>
      {children}
      <RestLayer />
    </RestContext.Provider>
  );
}
