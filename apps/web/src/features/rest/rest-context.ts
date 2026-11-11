import { createContext, useContext, useSyncExternalStore, type RefObject } from 'react';
import type { RestPlayer } from './rest-player';

export const RestContext = createContext<{
  player: RestPlayer;
  entry: RefObject<HTMLButtonElement | null>;
} | null>(null);

export function useRest() {
  const context = useContext(RestContext);
  if (!context) throw new Error('RestProvider is required');
  const snapshot = useSyncExternalStore(context.player.subscribe, context.player.snapshot);
  return { ...context, snapshot };
}
