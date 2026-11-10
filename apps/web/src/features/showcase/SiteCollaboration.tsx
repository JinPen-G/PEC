/** Public previews share authenticated rooms while keeping their own routes and toolbar. */
import { useState, type ReactNode } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown, Users } from 'lucide-react';
import { siteMotionTokens } from '@preview/ui';
import { CollaborationRoom, useCollaboration } from '@/features/platform/CollaborationRoom';
import { useNativeAuth } from '@/features/platform/platform-api';
import { useShowcaseText } from './showcase-locale';
import type { CatalogPage } from './showcase-catalog';
import './site-collaboration.css';

export function SiteCollaboration({ page, children }: { page?: CatalogPage; children: ReactNode }) {
  const { session } = useNativeAuth();
  const user = session?.user;
  return (
    <CollaborationRoom
      key={`${user?.id}/${user?.revision}/${page?.projectId}`}
      project={page ? { id: page.projectId } : undefined}
      enabled={Boolean(user && !user.mustChangePassword && page?.allowed)}
      routePrefix="/pages"
    >
      {children}
    </CollaborationRoom>
  );
}

export function SiteCollaborationControls() {
  const collaboration = useCollaboration();
  const text = useShowcaseText();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  if (!collaboration) return null;
  const { room, state } = collaboration;
  const own = state.participants.find((person) => person.id === state.id);
  const target = state.participants.find((person) => person.id === own?.following);
  const available = state.participants.filter(
    (person) => person.id !== state.id && !person.following && person.state,
  );
  return (
    <div className="showcase-collaboration" data-preserve-language>
      <div ref={setContainer} className="showcase-menu-portal" />
      <Dropdown.Root open={open} onOpenChange={setOpen} modal={false}>
        <Dropdown.Trigger className="showcase-collaboration-trigger" aria-label={text('在线协作')}>
          <Users size={15} aria-hidden="true" />
          <span className="showcase-collaboration-label">
            {target
              ? target.name
              : state.id
                ? `${state.participants.length} ${text('人在线')}`
                : text(state.status)}
          </span>
          <ChevronDown size={13} aria-hidden="true" />
        </Dropdown.Trigger>
        <AnimatePresence>
          {open && (
            <Dropdown.Portal forceMount container={container}>
              <Dropdown.Content asChild forceMount align="end" sideOffset={8} collisionPadding={12}>
                <motion.div
                  className="showcase-language-menu showcase-collaboration-menu"
                  initial={reduced ? false : { opacity: 0, scale: 0.97, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduced ? 0 : -2 }}
                  transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
                >
                  <Dropdown.Label className="showcase-collaboration-caption">
                    {text('选择用户跟随页面')}
                  </Dropdown.Label>
                  {available.length ? (
                    <Dropdown.RadioGroup
                      value={own?.following ?? ''}
                      onValueChange={(value) => void room.follow(value)}
                    >
                      {available.map((person) => (
                        <Dropdown.RadioItem
                          key={person.id}
                          value={person.id}
                          className="showcase-language-item"
                        >
                          <span>{person.name}</span>
                          <Dropdown.ItemIndicator>
                            <Check size={14} />
                          </Dropdown.ItemIndicator>
                        </Dropdown.RadioItem>
                      ))}
                    </Dropdown.RadioGroup>
                  ) : (
                    <p className="showcase-collaboration-caption">{text('暂无可跟随的用户')}</p>
                  )}
                  {state.error && (
                    <p className="showcase-collaboration-caption" role="alert">
                      {text(state.error)}
                    </p>
                  )}
                </motion.div>
              </Dropdown.Content>
            </Dropdown.Portal>
          )}
        </AnimatePresence>
      </Dropdown.Root>
      {own?.following ? (
        <button type="button" className="showcase-collaboration-exit" onClick={() => void room.follow(null)}>
          {text('退出跟随')}
        </button>
      ) : state.status === '跟随已结束' ? (
        <span className="showcase-collaboration-ended" role="status">
          {text('跟随已结束')}
        </span>
      ) : null}
    </div>
  );
}
