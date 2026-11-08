/** Gesture sound feedback scoped to the Preview demo session, never a rental session. */
import { useEffect } from 'react';
import { setMasterGain } from './sound-engine';
import { soundPreferences } from './sound-preferences';
import {
  INTERACTIVE_SELECTOR,
  pickInteractionSound,
  playInteractionSound,
  setSoundScope,
  unlockSoundFromGesture,
} from './sound-service';

export function InteractionSounds({ account, workspace }: { account: string; workspace: string }) {
  useEffect(() => {
    setSoundScope({ key: JSON.stringify(['preview-demo', account, workspace]), epoch: Date.now() });
    return () => setSoundScope(null);
  }, [account, workspace]);
  useEffect(() => {
    const syncVolume = () => setMasterGain(soundPreferences.getSnapshot().volume);
    const unsubscribe = soundPreferences.subscribe(syncVolume);
    syncVolume();
    const onGesture = (event: Event) => {
      if (event.isTrusted) unlockSoundFromGesture();
    };
    const onClick = (event: MouseEvent) => {
      if (!event.isTrusted || !(event.target instanceof Element)) return;
      const element = event.target.closest(INTERACTIVE_SELECTOR);
      if (
        !element ||
        element.closest('[data-sound-silent], [inert], [aria-disabled="true"], .ant-btn-loading') ||
        element.matches(':disabled')
      )
        return;
      void playInteractionSound(pickInteractionSound(element));
    };
    document.addEventListener('pointerdown', onGesture, true);
    document.addEventListener('keydown', onGesture, true);
    document.addEventListener('click', onClick, true);
    return () => {
      unsubscribe();
      document.removeEventListener('pointerdown', onGesture, true);
      document.removeEventListener('keydown', onGesture, true);
      document.removeEventListener('click', onClick, true);
    };
  }, []);
  return null;
}
export async function playSaveResult(success: boolean) {
  const scope = (await import('./sound-service')).captureSoundScope();
  if (scope)
    await (
      await import('./sound-service')
    ).emitSoundEvent({ ...scope, id: crypto.randomUUID(), type: success ? 'success' : 'error' });
}
