/** Animate UI's command tabs and copy feedback; commands are supplied by the host. */
import { useEffect, useRef, useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@animate-ui/react/primitives/tabs';
import { CopyButton, CopyButtonIcon } from '@animate-ui/react/primitives/buttons/copy';
import { Check, Copy } from 'lucide-react';

export type LandingCommandOption = { id: string; label: string; command: string };
export function LandingCommand({
  options,
  text = (value) => value,
}: {
  options: LandingCommandOption[];
  text?: (value: string) => string;
}) {
  const [active, setActive] = useState(options[0].id);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  const generation = useRef(0);
  const command = (options.find((item) => item.id === active) ?? options[0]).command;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  const copy = async () => {
    const current = ++generation.current;
    setError(false);
    try {
      await navigator.clipboard.writeText(command);
      if (!mounted.current || current !== generation.current) return;
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 3000);
    } catch {
      if (mounted.current && current === generation.current) setError(true);
    }
  };
  return (
    <Tabs
      value={active}
      onValueChange={(value) => {
        generation.current++;
        clearTimeout(timer.current);
        setActive(value);
        setCopied(false);
        setError(false);
      }}
      className="home-command"
    >
      <TabsHighlight className="home-command-tab-highlight">
        <TabsList aria-label={text('接入方式')} className="home-command-tab-list">
          {options.map((option) => (
            <TabsHighlightItem key={option.id} value={option.id}>
              <TabsTrigger className="home-command-tab" value={option.id}>
                {option.label}
              </TabsTrigger>
            </TabsHighlightItem>
          ))}
        </TabsList>
      </TabsHighlight>
      <div className="home-command-shell">
        <TabsContents className="home-command-panels">
          {options.map((option) => (
            <TabsContent className="home-command-panel" key={option.id} value={option.id}>
              <span aria-hidden="true" className="home-command-prefix">
                {option.id === 'cursor' ? '{' : '$'}
              </span>
              <code title={option.command}>{option.command}</code>
            </TabsContent>
          ))}
        </TabsContents>
        <CopyButton
          className="home-command-copy"
          content={command}
          copied={copied}
          aria-label={text(copied ? '已复制接入命令' : '复制接入命令')}
          onClick={(event) => {
            event.preventDefault();
            void copy();
          }}
        >
          <CopyButtonIcon icon={<Copy size={16} />} copiedIcon={<Check size={16} />} />
        </CopyButton>
      </div>
      <span className="home-command-status" role="status">
        {error ? text('复制失败，请手动复制命令。') : copied ? text('接入命令已复制。') : ''}
      </span>
    </Tabs>
  );
}
