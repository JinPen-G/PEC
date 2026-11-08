/** Reference search/filter structure, bound only to the current page catalog. */
import type { RefObject } from 'react';
import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { siteMotionTokens } from '@preview/ui';
import { useShowcaseText } from './showcase-locale';

export function CatalogFilters({
  inputRef,
  search,
  onSearch,
  tier,
  onTier,
  accessible,
  onAccessible,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  search: string;
  onSearch: (search: string) => void;
  tier: string;
  onTier: (tier: string) => void;
  accessible: boolean;
  onAccessible: (accessible: boolean) => void;
}) {
  const text = useShowcaseText();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  return (
    <div className="library-sidebar_top__4Gi88">
      <div className="library-sidebar_searchRow__4wIAj">
        <div className="library-sidebar_searchWrap__I7YU7">
          <label className="library-sidebar_search__Bt_vl">
            <Search size={14} />
            <input
              ref={inputRef}
              type="text"
              aria-label={text('搜索原型页面')}
              placeholder={text('搜索')}
              value={search}
              onChange={(event) => onSearch(event.target.value)}
            />
            {search ? (
              <button
                type="button"
                className="library-sidebar_clear__YYdK1"
                aria-label={text('清除搜索')}
                onClick={() => onSearch('')}
              >
                <X size={12} />
              </button>
            ) : (
              <kbd className="library-sidebar_kbd__vDHKK">Ctrl K</kbd>
            )}
          </label>
        </div>
      </div>
      <div className="library-sidebar_tiers__FQ9gm">
        <div className="library-sidebar_tierMain__lKrtQ" role="radiogroup" aria-label={text('页面访问范围')}>
          {[
            ['all', '全部'],
            ['public', '公开'],
            ['restricted', '需授权'],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              role="radio"
              aria-checked={tier === value}
              onClick={() => onTier(value)}
            >
              {tier === value && (
                <motion.span
                  className="library-sidebar_tierIndicator__FI_I8"
                  layoutId="catalog-tier"
                  transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
                />
              )}
              <span>{text(label)}</span>
            </button>
          ))}
        </div>
        <Dropdown.Root open={open} onOpenChange={setOpen} modal={false}>
          <Dropdown.Trigger className="library-sidebar_tierMore__dj_Qz">
            <span>
              {text('更多')}
              <motion.span
                className="library-sidebar_tierChevron__LAaEC"
                animate={{ rotate: open ? 180 : 0 }}
                transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
              >
                <ChevronDown size={12} />
              </motion.span>
            </span>
          </Dropdown.Trigger>
          <AnimatePresence>
            {open && (
              <Dropdown.Content asChild forceMount align="end" sideOffset={6}>
                <motion.div
                  className="library-sidebar_tierMenu__xxyjj"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    scale: reduced ? 1 : 0.97,
                    y: reduced ? 0 : -4,
                    transition: { duration: reduced ? 0 : 0.12, ease: [...siteMotionTokens.ease.standard] },
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          ...siteMotionTokens.spring.snappy,
                          opacity: { duration: siteMotionTokens.duration.fast },
                        }
                  }
                >
                  <Dropdown.CheckboxItem checked={accessible} onCheckedChange={onAccessible} asChild>
                    <button type="button">
                      <span className="library-sidebar_menuCheck__3itct">
                        {accessible && <Check size={13} />}
                      </span>
                      <span className="library-sidebar_menuText__C4Xv_">
                        <span>{text('仅显示可查看页面')}</span>
                        <small>{text('公开或已获得授权')}</small>
                      </span>
                    </button>
                  </Dropdown.CheckboxItem>
                </motion.div>
              </Dropdown.Content>
            )}
          </AnimatePresence>
        </Dropdown.Root>
      </div>
    </div>
  );
}
