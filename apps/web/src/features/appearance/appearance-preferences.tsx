/** Preview-local appearance. Saving never calls Rental OS or implies account sync. */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export const APPEARANCE_KEY = 'preview:appearance';
export const RADIUS_MIN = 8;
export const RADIUS_MAX = 40;
export const RADIUS_DEFAULT = 12;
export const RADIUS_FULL = 999;
export interface AppearancePreferences {
  version: 1;
  themeColor: string;
  container: number | null;
  button: number | null;
  input: number | null;
}
const defaults: AppearancePreferences = {
  version: 1,
  themeColor: '',
  container: null,
  button: null,
  input: null,
};
export function parseAppearance(raw: string | null): AppearancePreferences {
  try {
    const value = JSON.parse(raw ?? 'null');
    if (!value || value.version !== 1) return { ...defaults };
    const radius = (name: 'container' | 'button' | 'input') => {
      const n = value[name];
      if (!Number.isInteger(n)) return null;
      if (name === 'button' && n === RADIUS_FULL) return n;
      return Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, n));
    };
    return {
      version: 1,
      themeColor: /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value.themeColor) ? value.themeColor : '',
      container: radius('container'),
      button: radius('button'),
      input: radius('input'),
    };
  } catch {
    return { ...defaults };
  }
}
function read() {
  try {
    return parseAppearance(localStorage.getItem(APPEARANCE_KEY));
  } catch {
    return { ...defaults };
  }
}
const Appearance = createContext<{
  preferences: AppearancePreferences;
  save: (patch: Partial<AppearancePreferences>) => void;
} | null>(null);
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(read);
  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.key === APPEARANCE_KEY || event.key === null) setPreferences(read());
    };
    window.addEventListener('storage', receive);
    return () => window.removeEventListener('storage', receive);
  }, []);
  const value = useMemo(
    () => ({
      preferences,
      save(patch: Partial<AppearancePreferences>) {
        const next = parseAppearance(JSON.stringify({ ...read(), ...patch, version: 1 }));
        // Persist before publishing: storage failure must not produce a saved-success message.
        localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next));
        setPreferences(next);
      },
    }),
    [preferences],
  );
  return <Appearance.Provider value={value}>{children}</Appearance.Provider>;
}
export function useAppearancePreferences() {
  const value = useContext(Appearance);
  if (!value) throw new Error('AppearanceProvider is required');
  return value;
}
export function resolveRadii(preferences: Pick<AppearancePreferences, 'container' | 'button' | 'input'>) {
  return {
    container: preferences.container ?? 26,
    button: preferences.button ?? 18,
    input: preferences.input ?? 18,
  };
}
