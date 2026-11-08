import { LoadingStage } from '@preview/ui/loading';
/** Loads only the authorized entry returned by the page service. The server
 * checks both the entry and every protected runtime asset. */
import type { ComponentType } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useShowcaseText } from './showcase-locale';

export function RuntimePage({ entry, styles = [] }: { entry: string; styles?: string[] }) {
  const text = useShowcaseText();
  const query = useQuery<{ default: ComponentType }>({
    queryKey: ['page-runtime', entry],
    queryFn: () => import(/* @vite-ignore */ entry),
    retry: false,
  });
  if (query.error)
    return (
      <p className="showcase-error">
        {text('页面加载失败，请刷新重试：')}
        {query.error.message}
      </p>
    );
  if (!query.data) return <LoadingStage label={text('加载原型…')} />;
  const Page = query.data.default;
  return (
    <div className="showcase-runtime-ready">
      {styles.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <Page />
    </div>
  );
}
