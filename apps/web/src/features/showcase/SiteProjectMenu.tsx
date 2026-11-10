/** Switch the current project while keeping its direct functional menu groups. */
import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown, Layers3 } from 'lucide-react';
import { siteMotionTokens } from '@preview/ui';
import { useShowcaseText } from './showcase-locale';
import './site-project-menu.css';

export function SiteProjectMenu({
  projects,
  value,
  onChange,
  placement = 'sidebar',
}: {
  projects: { id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
  placement?: 'sidebar' | 'inline';
}) {
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const text = useShowcaseText();
  if (projects.length < 2) return null;
  return (
    <div className={`showcase-project-menu showcase-project-menu-${placement}`} data-preserve-language>
      <div ref={setContainer} className="showcase-menu-portal" />
      <Dropdown.Root open={open} onOpenChange={setOpen} modal={false}>
        <Dropdown.Trigger className="showcase-project-trigger" aria-label={text('切换项目')}>
          <Layers3 size={15} />
          <span className="showcase-project-name">
            {projects.find((project) => project.id === value)?.name ?? text('切换项目')}
          </span>
          <ChevronDown size={14} />
        </Dropdown.Trigger>
        <AnimatePresence>
          {open && (
            <Dropdown.Portal forceMount container={container}>
              <Dropdown.Content asChild forceMount align="start" sideOffset={8} collisionPadding={12}>
                <motion.div
                  className="showcase-language-menu showcase-project-options"
                  initial={reduced ? false : { opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduced ? 0 : -2 }}
                  transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
                >
                  <Dropdown.RadioGroup value={value} onValueChange={onChange}>
                    {projects.map((project) => (
                      <Dropdown.RadioItem
                        key={project.id}
                        value={project.id}
                        className="showcase-language-item"
                      >
                        <span>{project.name}</span>
                        <Dropdown.ItemIndicator>
                          <Check size={14} />
                        </Dropdown.ItemIndicator>
                      </Dropdown.RadioItem>
                    ))}
                  </Dropdown.RadioGroup>
                </motion.div>
              </Dropdown.Content>
            </Dropdown.Portal>
          )}
        </AnimatePresence>
      </Dropdown.Root>
    </div>
  );
}
