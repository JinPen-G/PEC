import { createContext, useContext, useState, type ReactNode } from 'react';

const ScreenPortal = createContext<HTMLElement | null>(null);
export const useScreenPortal = () => useContext(ScreenPortal);

/** Native screen dialogs share their logical viewport, including when its DOM
 * moves into fullscreen. The business tree and its state stay mounted once. */
export function ScreenPortalProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  return <ScreenPortal.Provider value={host}>
    {children}
    <div ref={setHost} className="showcase-screen-portals" />
  </ScreenPortal.Provider>;
}
