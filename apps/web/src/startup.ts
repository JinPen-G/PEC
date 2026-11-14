/** Starts the lightweight homepage brand before loading React and the application. */
import { createBrandArtwork } from '../../../packages/preview-ui/src/brand-artwork';
import {
  discardBrandBoot,
  isHomepageEntry,
  registerBrandBoot,
} from '../../../packages/preview-ui/src/brand-boot';
import { startBrandOpening } from '../../../packages/preview-ui/src/brand-opening';
import '../../../packages/preview-ui/src/brand-opening.css';
import './startup.css';

const boot = document.querySelector<HTMLElement>('#preview-home-boot');
const home =
  import.meta.env.MODE !== 'core' &&
  import.meta.env.MODE !== 'ui' &&
  isHomepageEntry(window.location, import.meta.env.BASE_URL);
if (home && boot) {
  let dark = false,
    reduced = false;
  try {
    const theme = localStorage.getItem('product-experience-center:theme-mode');
    dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    const motion = localStorage.getItem('preview:motion');
    reduced =
      motion === 'reduced' || (motion !== 'full' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch {
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  boot.dataset.theme = dark ? 'dark' : 'light';
  boot.hidden = false;
  const controller = startBrandOpening({
    ...createBrandArtwork('preview-boot'),
    surface: boot,
    iconSlot: boot.querySelector<HTMLElement>('.brand-opening-icon-slot')!,
    wordSlot: boot.querySelector<HTMLElement>('.brand-opening-word-slot')!,
    reserve: boot.querySelector<HTMLElement>('.brand-opening-reserve')!,
    play: !reduced,
    waitingForHost: true,
    onStart() {},
    onReveal() {},
    onComplete() {},
  });
  registerBrandBoot({ controller, release: () => boot.remove() });
} else boot?.remove();

// The same nodes and elapsed clock are claimed by the real header when its bundle is ready.
if (home) {
  // Overlap the route's module requests with React startup; the router presents any load failure.
  void import('./features/showcase/ShowcaseApp').catch(() => {});
}
void import('./main').catch((error: unknown) => {
  discardBrandBoot();
  console.error('Preview startup failed', error);
  void import('./app/startup-error')
    .then(({ renderStartupFailure }) => renderStartupFailure())
    .catch((recoveryError: unknown) => {
      console.error('Preview recovery UI failed to load', recoveryError);
      // Keep a usable retry even when React or the independent recovery bundle cannot load.
      const failure = document.createElement('main');
      failure.className = 'preview-startup-error';
      const title = document.createElement('h1');
      title.textContent = '页面暂时无法打开';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = '重新加载';
      retry.onclick = () => window.location.reload();
      failure.append(title, retry);
      document.querySelector('#root')?.replaceChildren(failure);
    });
});
