/** UIARC's split-menu structure, with Preview's authorized Markdown/source
 * actions. External assistant links never include a token or private content. */
import { useEffect, useRef, useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Check, ChevronDown, Copy, FileText, Link2, SquareTerminal } from 'lucide-react';
import { siteMotionTokens, AssistantIcon, type AssistantIconName } from '@preview/ui';
import { useShowcaseText } from './showcase-locale';

export function PageActions({
  markdown,
  markdownUrl,
  pageUrl,
  projectId,
  publicPage,
}: {
  markdown: string;
  markdownUrl: string;
  pageUrl: string;
  projectId: string;
  publicPage: boolean;
}) {
  const text = useShowcaseText();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false),
    [copied, setCopied] = useState(false),
    [error, setError] = useState('');
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (reset.current) clearTimeout(reset.current);
    },
    [],
  );
  const copy = async (value: string, primary = false) => {
    try {
      await navigator.clipboard.writeText(value);
      if (primary) {
        if (reset.current) clearTimeout(reset.current);
        setCopied(true);
        reset.current = setTimeout(() => setCopied(false), 1900);
      }
      setError('');
    } catch {
      setError(text('复制失败，请检查剪贴板权限'));
    }
  };
  const prompt = `Read ${location.origin}${markdownUrl} and explain the business requirements and behavior of this prototype page.`;
  const assistants = [
    {
      label: 'Open in ChatGPT',
      icon: 'chatgpt' as AssistantIconName,
      url: `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`,
    },
    {
      label: 'Open in Claude',
      icon: 'claude' as AssistantIconName,
      url: `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
    },
    {
      label: 'Open in DeepSeek',
      icon: 'deepseek' as AssistantIconName,
      url: 'https://chat.deepseek.com/',
    },
    {
      label: 'Open in WorkBuddy',
      icon: 'workbuddy' as AssistantIconName,
      url: 'https://www.workbuddy.cn/',
    },
  ];
  return (
    <div className="docs_pageActions__FvgfG">
      <div ref={setContainer} className="showcase-menu-portal" />
      {/* The reference uses a nonmodal menu, avoiding page scrollbar compensation. */}
      <Dropdown.Root open={open} onOpenChange={setOpen} modal={false}>
        <div className="docs_split__qokB7">
          <button className="docs_splitMain__52aTO" onClick={() => void copy(markdown, true)}>
            <span className="docs_copyIcon__YceqM" aria-hidden="true">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={copied ? 'copied' : 'idle'}
                  initial={reduced ? false : { opacity: 0, scale: 0.6, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{
                    opacity: 0,
                    scale: reduced ? 1 : 0.6,
                    transition: { duration: reduced ? 0 : siteMotionTokens.duration.fast },
                  }}
                  transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="docs_copyLabels__4vHTm">
              <span data-visible={!copied} aria-hidden={copied}>
                {text('复制页面')}
              </span>
              <span data-visible={copied} aria-hidden={!copied}>
                {text('已复制')}
              </span>
            </span>
          </button>
          <Dropdown.Trigger className="docs_splitTrigger__KvSZI" aria-label={text('更多页面操作')}>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={reduced ? { duration: 0 } : siteMotionTokens.spring.snappy}
            >
              <ChevronDown size={14} />
            </motion.span>
          </Dropdown.Trigger>
        </div>
        <span role="status" className="docs_srOnly__ZPUaK">
          {error || (copied ? text('已复制') : '')}
        </span>
        <AnimatePresence>
          {open && (
            <Dropdown.Portal container={container} forceMount>
              <Dropdown.Content asChild forceMount align="end" sideOffset={8} collisionPadding={12}>
                <motion.div
                  className="docs_menu__h8A_a"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    reduced
                      ? { opacity: 0, transition: { duration: 0 } }
                      : {
                          opacity: 0,
                          y: -2,
                          scale: 0.97,
                          transition: {
                            duration: siteMotionTokens.duration.fast,
                            ease: [...siteMotionTokens.ease.standard],
                          },
                        }
                  }
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          ...siteMotionTokens.spring.snappy,
                          opacity: { duration: siteMotionTokens.duration.fast },
                        }
                  }
                >
                  <Dropdown.Group>
                    <Dropdown.Item
                      className="docs_menuItem__vDe5y"
                      onSelect={() => void copy(markdown, true)}
                    >
                      <span className="docs_menuIcon__C7FV5">
                        <Copy size={15} />
                      </span>
                      <span className="docs_menuLabel___2blT">
                        {text('复制 Markdown')}
                        <small>{text('业务 PRD 与页面说明')}</small>
                      </span>
                    </Dropdown.Item>
                    <Dropdown.Item asChild>
                      <a href={markdownUrl} target="_blank" rel="noreferrer" className="docs_menuItem__vDe5y">
                        <span className="docs_menuIcon__C7FV5">
                          <FileText size={15} />
                        </span>
                        <span className="docs_menuLabel___2blT">
                          {text('查看 Markdown')}
                          <small>{text('查看已授权原文')}</small>
                        </span>
                        <ArrowUpRight size={14} className="docs_menuTrail__9OUhN" />
                      </a>
                    </Dropdown.Item>
                    <Dropdown.Item className="docs_menuItem__vDe5y" onSelect={() => void copy(pageUrl)}>
                      <span className="docs_menuIcon__C7FV5">
                        <Link2 size={15} />
                      </span>
                      <span className="docs_menuLabel___2blT">{text('复制页面链接')}</span>
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="docs_menuItem__vDe5y"
                      onSelect={() =>
                        void copy(
                          `Project business context: ${location.origin}/api/project-context/${projectId}/overview\nMCP: ${location.origin}/api/project-context/mcp\nConfigure Authorization: Bearer <project-read-only-token> privately. Never put the token in a URL.`,
                        )
                      }
                    >
                      <span className="docs_menuIcon__C7FV5">
                        <SquareTerminal size={15} />
                      </span>
                      <span className="docs_menuLabel___2blT">
                        {text('复制 AI 接入说明')}
                        <small>HTTP / MCP</small>
                      </span>
                    </Dropdown.Item>
                  </Dropdown.Group>
                  {publicPage && (
                    <>
                      <Dropdown.Separator className="docs_menuSeparator__LNenr" />
                      <div className="docs_menuGroupLabel__GkP9D">{text('向 AI 询问本页面')}</div>
                      <Dropdown.Group>
                        {assistants.map((assistant) => (
                          <Dropdown.Item asChild key={assistant.label}>
                            <a
                              className="docs_menuItem__vDe5y"
                              href={assistant.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="docs_menuIcon__C7FV5" aria-hidden="true">
                                <AssistantIcon name={assistant.icon} />
                              </span>
                              <span className="docs_menuLabel___2blT">{assistant.label}</span>
                              <ArrowUpRight size={14} className="docs_menuTrail__9OUhN" />
                            </a>
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Group>
                    </>
                  )}
                </motion.div>
              </Dropdown.Content>
            </Dropdown.Portal>
          )}
        </AnimatePresence>
      </Dropdown.Root>
    </div>
  );
}
