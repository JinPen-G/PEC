/** Copilot dock geometry with a reading slot, without chat/provider/tool state. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { PanelRightClose } from 'lucide-react';
import { Button } from '../upstream/rental-admin/packages/ui-arc/vendor/registry/components/button/button';

export function DocumentDock({
  open,
  onClose,
  title,
  children,
  document,
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  document: ReactNode;
  closeLabel: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const focusBeforeOpen = useRef<HTMLElement | null>(null);
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const measure = () => setNarrow(node.clientWidth < 640);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!open) return;
    focusBeforeOpen.current = documentActiveElement();
    panel.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !window.document.querySelector('[role="menu"]')) {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Tab' && narrow && panel.current) {
        const nodes = Array.from(
          panel.current.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,[tabindex="0"]'),
        );
        const first = nodes[0],
          last = nodes.at(-1);
        if (
          event.shiftKey &&
          (window.document.activeElement === first || window.document.activeElement === panel.current)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && window.document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.document.addEventListener('keydown', onKeyDown);
    return () => {
      window.document.removeEventListener('keydown', onKeyDown);
      focusBeforeOpen.current?.isConnected && focusBeforeOpen.current.focus({ preventScroll: true });
    };
  }, [open, narrow, onClose]);
  return (
    <div
      ref={root}
      className={`ai-side-panel copilot-host preview-document-host${open ? ' is-open' : ''}${narrow ? ' is-sheet' : ''}`}
    >
      <div className="asp-page-column" inert={(open && narrow) || undefined}>
        {children}
      </div>
      {open && narrow && <div className="asp-scrim" aria-hidden="true" onClick={onClose} />}
      <div className="asp-dock" inert={!open || undefined} aria-hidden={!open || undefined}>
        <div className="asp-dock-inner">
          <aside
            id="preview-page-document"
            ref={panel}
            className="asp-panel preview-document-panel"
            tabIndex={-1}
            aria-label={title}
            role={narrow ? 'dialog' : 'complementary'}
            aria-modal={(narrow && open) || undefined}
          >
            <header className="preview-document-heading">
              <strong>{title}</strong>
              <Button type="button" variant="ghost" aria-label={closeLabel} onClick={onClose}>
                <PanelRightClose size={18} />
              </Button>
            </header>
            <div className="preview-document-body">{open && document}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function documentActiveElement() {
  return window.document.activeElement instanceof HTMLElement ? window.document.activeElement : null;
}
