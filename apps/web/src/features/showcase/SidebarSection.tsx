import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { siteMotionTokens } from '@preview/ui';
import './sidebar-catalog.css';

/** Original section/group geometry and motion; only catalog content is supplied here. */
export function SidebarSection({
  title,
  count,
  icon,
  children,
  group = false,
  activeKey = '',
  defaultOpen = true,
  forceOpen = false,
}: {
  title: string;
  count?: number;
  icon?: ReactNode;
  children: ReactNode;
  group?: boolean;
  activeKey?: string;
  defaultOpen?: boolean;
  forceOpen?: boolean;
}) {
  const id = useId();
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(defaultOpen || Boolean(activeKey));
  const [previousActive, setPreviousActive] = useState(activeKey);
  if (activeKey !== previousActive) {
    setPreviousActive(activeKey);
    if (activeKey) setExpanded(true);
  }
  const open = forceOpen || expanded;
  const chevron = (
    <motion.span
      className={group ? 'library-sidebar_groupChevron__p0Pka' : 'library-sidebar_chevron__Fc20n'}
      animate={{ rotate: open ? 0 : -90 }}
      transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
      aria-hidden="true"
    >
      <ChevronDown size={group ? 12 : 14} />
    </motion.span>
  );
  return (
    <section className={group ? 'library-sidebar_group__SVodZ' : 'library-sidebar_section__oQ3xJ'}>
      <button
        type="button"
        className={group ? 'library-sidebar_groupHead__o7GWW' : 'library-sidebar_sectionHead___A06N'}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setExpanded(!open)}
      >
        {group ? chevron : <span className="library-sidebar_sectionIcon__ii8U0">{icon}</span>}
        <span className={group ? 'library-sidebar_groupLabel__NvtyJ' : 'library-sidebar_sectionLabel__pIIq3'}>
          {title}
        </span>
        {count !== undefined && (
          <span
            className={group ? 'library-sidebar_groupCount__5aF43' : 'library-sidebar_sectionCount__lRg1z'}
          >
            {count}
          </span>
        )}
        {!group && chevron}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={reduced ? false : { height: 0, opacity: 0, overflow: 'clip' }}
            animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
            exit={{ height: 0, opacity: 0, overflow: 'clip' }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    height: siteMotionTokens.spring.smooth,
                    opacity: { duration: 0.18, ease: [...siteMotionTokens.ease.standard] },
                  }
            }
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
