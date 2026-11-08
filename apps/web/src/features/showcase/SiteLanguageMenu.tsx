/** Shared language control for the public shell and login. Radix owns keyboard,
 * focus and dismissal; the nonmodal popup never locks the page scrollbar. */
import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { siteMotionTokens } from '@preview/ui';
import { usePlatformLocale, type PlatformLocale } from '@/features/locale/platform-locale';
import { useShowcaseText } from './showcase-locale';
import './site-language-menu.css';

const languages: { value: PlatformLocale; label: string }[] = [
  { value: 'zh-Hans', label: '简体中文' },
  { value: 'zh-Hant', label: '繁體中文' },
  { value: 'en', label: 'English' },
];
export function SiteLanguageMenu() {
  const { locale, setLocale } = usePlatformLocale();
  const text = useShowcaseText(),
    reduced = useReducedMotion();
  const [open, setOpen] = useState(false),
    [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div className="showcase-language" data-preserve-language>
      <div ref={setContainer} className="showcase-menu-portal" />
      <Dropdown.Root open={open} onOpenChange={setOpen} modal={false}>
        <Dropdown.Trigger className="showcase-language-trigger" aria-label={text('界面语言')}>
          <Languages size={15} strokeWidth={1.75} />
          <span>{languages.find((language) => language.value === locale)?.label}</span>
          <motion.span
            className="showcase-language-chevron"
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
          >
            <ChevronDown size={12} />
          </motion.span>
        </Dropdown.Trigger>
        <AnimatePresence>
          {open && (
            <Dropdown.Portal forceMount container={container}>
              <Dropdown.Content asChild forceMount align="end" sideOffset={8} collisionPadding={12}>
                <motion.div
                  className="showcase-language-menu"
                  initial={reduced ? false : { opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: reduced ? 1 : 0.97, y: reduced ? 0 : -2 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          ...siteMotionTokens.spring.snappy,
                          opacity: { duration: siteMotionTokens.duration.fast },
                        }
                  }
                >
                  <Dropdown.RadioGroup
                    value={locale}
                    onValueChange={(value) => setLocale(value as PlatformLocale)}
                  >
                    {languages.map((language) => (
                      <Dropdown.RadioItem
                        key={language.value}
                        value={language.value}
                        className="showcase-language-item"
                      >
                        <span>{language.label}</span>
                        <Dropdown.ItemIndicator>
                          <Check size={14} strokeWidth={1.8} />
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
