/** Mobile navigation uses the same captured drawer primitive as appearance. */
import { useState, type ReactNode } from 'react';
import { Drawer, DrawerContent } from './auth-registry/components/drawer/drawer';

export function NavigationDrawer({
  open,
  onOpenChange,
  title,
  closeLabel,
  restoreFocus,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  closeLabel: string;
  restoreFocus: () => void;
  children: ReactNode;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <div ref={setContainer} className="showcase-layer-portal" />
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          container={container}
          side="left"
          title={title}
          closeLabel={closeLabel}
          className="showcase-navigation-drawer library-sidebar_mobile__gq_YO"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            restoreFocus();
          }}
        >
          {children}
        </DrawerContent>
      </Drawer>
    </>
  );
}
