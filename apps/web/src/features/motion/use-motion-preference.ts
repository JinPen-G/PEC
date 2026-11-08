/** Effective browser preference shared by the original Motion components. */
import { useSyncExternalStore } from 'react';
import { isMotionReduced, subscribeMotionPreference } from './motion-preferences';
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeMotionPreference, isMotionReduced, () => false);
}
