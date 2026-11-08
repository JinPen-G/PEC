/** Reference page-level wipe, isolated from the existing administrator theme.
 * A newer switch supersedes the old one; unsupported/reduced motion updates directly. */
export type ThemeWipe = 'rise' | 'split';
export interface SiteViewTransition {
  finished: Promise<void>;
  skipTransition(): void;
}
export interface ThemeTransitionDocument {
  documentElement: { dataset: DOMStringMap; style: Pick<CSSStyleDeclaration, 'setProperty'> };
  startViewTransition?: (update: () => void) => SiteViewTransition;
}
export interface ThemeTransitionState {
  generation: number;
  active: SiteViewTransition | null;
}
export function changeSiteTheme({
  document,
  state,
  update,
  reduced,
  wipe,
  origin,
}: {
  document: ThemeTransitionDocument;
  state: ThemeTransitionState;
  update: () => void;
  reduced: boolean;
  wipe: ThemeWipe;
  origin?: { x: number; y: number };
}) {
  const generation = ++state.generation;
  state.active?.skipTransition();
  state.active = null;
  const element = document.documentElement;
  delete element.dataset.previewThemeMotion;
  if (origin) {
    element.style.setProperty('--theme-origin-x', `${origin.x}px`);
    element.style.setProperty('--theme-origin-y', `${origin.y}px`);
  }
  if (reduced || !document.startViewTransition) {
    update();
    return;
  }
  element.dataset.previewThemeMotion = wipe;
  try {
    const transition = document.startViewTransition(() => {
      if (generation === state.generation) update();
    });
    state.active = transition;
    const complete = () => {
      if (generation === state.generation) {
        state.active = null;
        delete element.dataset.previewThemeMotion;
      }
    };
    void transition.finished.then(complete, complete);
  } catch {
    if (generation === state.generation) {
      delete element.dataset.previewThemeMotion;
      update();
    }
  }
}
