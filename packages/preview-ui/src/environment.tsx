/** Host-owned appearance; imported UI never reads Rental OS or application auth. */
import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react';
import { AnimateUIProvider } from '@animate-ui/react/provider';
import { MotionConfig, MotionGlobalConfig } from 'motion/react';

const Environment = createContext({ dark: false, reducedMotion: false });
export const useUiEnvironment = () => useContext(Environment);

export function UiEnvironmentProvider({
  dark,
  reducedMotion,
  children,
}: {
  dark: boolean;
  reducedMotion: boolean;
  children: ReactNode;
}) {
  useLayoutEffect(() => {
    const previousSkip = MotionGlobalConfig.skipAnimations;
    const previousPreference = document.documentElement.dataset.reducedMotion;
    MotionGlobalConfig.skipAnimations = reducedMotion;
    if (reducedMotion)
      (
        document as Document & { activeViewTransition?: { skipTransition(): void } }
      ).activeViewTransition?.skipTransition();
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
    return () => {
      MotionGlobalConfig.skipAnimations = previousSkip;
      if (previousPreference === undefined) delete document.documentElement.dataset.reducedMotion;
      else document.documentElement.dataset.reducedMotion = previousPreference;
    };
  }, [reducedMotion]);
  return (
    <Environment.Provider value={{ dark, reducedMotion }}>
      <MotionConfig reducedMotion="never">
        <AnimateUIProvider reducedMotion={reducedMotion ? 'always' : 'never'}>{children}</AnimateUIProvider>
      </MotionConfig>
    </Environment.Provider>
  );
}
