import { useQuery } from '@tanstack/react-query';
import { LoadingStage } from '@preview/ui/loading';
import { createNativeClient } from '../../../../../packages/platform-client/src/client';
import type { ComponentRegistryItem } from '../../../../../packages/platform-contracts/src/component-registry';
import { useNativeAuth } from '@/features/platform/platform-api';
import { SourcePanel } from './SourcePanel';
import { useShowcaseText } from './showcase-locale';
import { registryInstallCommand } from './registry-command';
import './registry-panel.css';

const client = createNativeClient({ baseUrl: '' });
export function RegistryPanel({
  url,
  restricted,
  kind,
}: {
  url: string;
  restricted: boolean;
  kind: 'component' | 'block';
}) {
  const text = useShowcaseText();
  const { session } = useNativeAuth();
  const query = useQuery<ComponentRegistryItem>({
    queryKey: ['component-registry', url, session?.user?.id, session?.user?.revision],
    queryFn: ({ signal }) => client.request(url, { signal }),
    retry: false,
    refetchInterval: 5000,
  });
  if (query.error)
    return (
      <p className="showcase-error" role="alert">
        {query.error.message}
      </p>
    );
  if (!query.data)
    return <LoadingStage label={text(kind === 'component' ? '读取组件源码…' : '读取区块源码…')} />;
  const command = registryInstallCommand(url);
  return (
    <section className="showcase-registry" aria-label={text('安装与源码')}>
      <h2>{text('安装')}</h2>
      <p>{text('适用于已初始化 shadcn 的 React 19 与 TypeScript 项目。')}</p>
      {restricted ? (
        <p>{text('受限内容可在当前授权会话中查看源码，不支持匿名 CLI 安装。')}</p>
      ) : (
        <SourcePanel fileName={text('终端')} source={command} plain />
      )}
      <p>{text(query.data.description)}</p>
      <h2>{text(kind === 'component' ? '组件源码' : '区块源码')}</h2>
      {query.data.files.map((file) => (
        <SourcePanel
          key={file.target}
          fileName={file.target.replace('@components/', '')}
          source={file.content}
        />
      ))}
    </section>
  );
}
