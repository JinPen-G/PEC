import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { ComponentRegistryReference } from '../../../../../packages/platform-contracts/src/component-registry';
import { registryInstallCommand } from './registry-command';
import { useShowcaseText } from './showcase-locale';

function InstallCommand({ command, kind }: { command: string; kind: ComponentRegistryReference['kind'] }) {
  const text = useShowcaseText();
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attempt = useRef(0);
  useEffect(
    () => () => {
      attempt.current++;
      if (reset.current) clearTimeout(reset.current);
    },
    [],
  );
  const copy = async () => {
    const current = ++attempt.current;
    if (reset.current) clearTimeout(reset.current);
    setStatus('idle');
    try {
      await navigator.clipboard.writeText(command);
      if (attempt.current !== current) return;
      setStatus('copied');
      reset.current = setTimeout(() => setStatus('idle'), 1900);
    } catch {
      if (attempt.current === current) setStatus('error');
    }
  };
  const label = text(kind === 'component' ? '复制组件安装命令' : '复制区块安装命令');
  return (
    <div className="docs_headerRow__PPJjT">
      <div
        className="docs_quickInstall__r3nha"
        role="group"
        aria-label={text(kind === 'component' ? '安装组件' : '安装区块')}
      >
        <span className="docs_prompt__CWFJA" aria-hidden="true">
          ›
        </span>
        <code title={command} data-preserve-language>
          {command}
        </code>
        <button
          type="button"
          className="docs_copy__At0Np docs_copyIconOnly__X5yic"
          aria-label={label}
          title={status === 'copied' ? text('已复制') : label}
          onClick={() => void copy()}
        >
          {status === 'copied' ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <span role="status" className={status === 'error' ? 'showcase-error' : 'docs_srOnly__ZPUaK'}>
        {status === 'error' ? text('复制失败，请检查剪贴板权限') : status === 'copied' ? text('已复制') : ''}
      </span>
    </div>
  );
}

export function QuickInstall({
  registry,
  publicPage,
}: {
  registry?: ComponentRegistryReference | null;
  publicPage: boolean;
}) {
  if (!registry || !publicPage) return null;
  const command = registryInstallCommand(registry.url);
  return <InstallCommand key={command} command={command} kind={registry.kind} />;
}
