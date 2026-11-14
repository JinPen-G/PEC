import { LoadingStage } from '@preview/ui/loading';
/** Loads only the authorized entry returned by the page service. The server
 * checks both the entry and every protected runtime asset. */
import { memo, type ComponentType } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useShowcaseText } from './showcase-locale';

export const RuntimePage = memo(function RuntimePage({
  entry,
  styles = [],
}: {
  entry: string;
  styles?: string[];
}) {
  const text = useShowcaseText();
  const query = useQuery<{ default: ComponentType }>({
    queryKey: ['page-runtime', entry],
    queryFn: () => import(/* @vite-ignore */ entry),
    retry: false,
    staleTime: Infinity,
  });
  if (query.error)
    return (
      <p className="showcase-error">
        {text('页面加载失败，请刷新重试：')}
        {query.error.message}
      </p>
    );
  const Page = query.data?.default;
  return (
    <>
      {styles.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {Page ? (
        <div className="showcase-runtime-ready">
          <Page />
        </div>
      ) : (
        <LoadingStage label={text('加载原型…')} />
      )}
    </>
  );
});
