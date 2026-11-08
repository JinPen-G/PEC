import { useUiEnvironment } from '../environment';

/** Preview host adapter for the original sidebar's portal palette and utilities. */
export function useNativeSidebarScope(classes = '') {
  const { dark } = useUiEnvironment();
  return `rental-animate-scope rental-sidebar-colors${dark ? ' dark' : ''} ${classes}`;
}
