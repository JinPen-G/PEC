import { LoadingStage } from '@preview/ui/loading';
import { SearchField } from '@preview/ui/admin';
/** Authorized project document navigation; no public text fallback or HTML scan. */
import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { Empty, Select } from '@preview/ui/admin';
import { Button } from '@preview/ui/admin';
import type { MarkdownHeading } from '@/features/docs/markdown';
import { useNativeAuth, useNativeQuery, type DocumentEntry } from './platform-api';
import { PageHeading, QueryFailure } from './PageLayout';
const Reader = lazy(() =>
  import('@/features/docs/MarkdownReader').then((module) => ({ default: module.MarkdownReader })),
);

export function ProjectDocumentReader({
  projectId,
  path,
  anchor = '',
  onNavigate,
}: {
  projectId: string;
  path: string;
  anchor?: string;
  onNavigate: (path: string, anchor?: string) => void;
}) {
  const { client } = useNativeAuth();
  const query = useNativeQuery<string>(
    `/projects/${projectId}/document?path=${encodeURIComponent(path)}`,
    Boolean(path),
    true,
  );
  const [headings, setHeadings] = useState<MarkdownHeading[]>([]),
    [search, setSearch] = useState('');
  const container = useRef<HTMLDivElement>(null);
  const resolveAsset = useCallback((file: string) => client.assetUrl(projectId, file), [client, projectId]);
  const resolveDocument = useCallback(
    (file: string, targetAnchor?: string) =>
      `#/p/${projectId}/documents?doc=${encodeURIComponent(file)}${targetAnchor ? `&anchor=${encodeURIComponent(targetAnchor)}` : ''}`,
    [projectId],
  );
  if (!path) return <Empty description="本页尚未关联文档" />;
  if (query.error) return <QueryFailure message={query.error.message} retry={() => void query.refetch()} />;
  const find = () => {
    if (!search.trim()) return;
    const target = Array.from(
      container.current?.querySelectorAll<HTMLElement>(
        'article p,article li,article h1,article h2,article h3,article td',
      ) ?? [],
    ).find((element) => element.textContent?.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
  return (
    <div ref={container} className="native-document-reader">
      <div className="native-document-controls">
        <SearchField
          label="搜索正文"
          placeholder="搜索当前文档正文"
          value={search}
          onValueChange={(event) => setSearch(event)}
          onSearch={find}
        />
        <Select
          aria-label="文档标题目录"
          placeholder="跳转标题"
          value={undefined}
          options={headings.map((heading) => ({
            value: heading.id,
            label: `${'　'.repeat(heading.level - 1)}${heading.text}`,
          }))}
          onChange={(value) => onNavigate(path, value)}
        />
      </div>
      {search && (
        <p className="text-meta">
          {query.data?.toLocaleLowerCase().includes(search.toLocaleLowerCase())
            ? '已找到匹配内容，按回车定位'
            : '当前文档没有匹配内容'}
        </p>
      )}
      <Suspense fallback={<LoadingStage label="加载阅读器…" />}>
        <Reader
          source={query.data ?? ''}
          loading={query.isPending}
          documentPath={path}
          resolveAssetUrl={resolveAsset}
          resolveDocumentUrl={resolveDocument}
          onDocumentNavigate={onNavigate}
          onHeadings={setHeadings}
          activeAnchor={anchor}
          privateAssets
        />
      </Suspense>
    </div>
  );
}

export function ProjectDocuments({
  projectId,
  path,
  anchor,
  onNavigate,
  onBack,
}: {
  projectId: string;
  path: string;
  anchor: string;
  onNavigate: (path: string, anchor?: string) => void;
  onBack: () => void;
}) {
  const list = useNativeQuery<DocumentEntry[]>(`/projects/${projectId}/documents`);
  const [search, setSearch] = useState('');
  if (list.error) return <QueryFailure message={list.error.message} retry={() => void list.refetch()} />;
  const selected = path || list.data?.[0]?.path || '';
  return (
    <section className="native-page">
      <PageHeading title="文档中心" actions={<Button onClick={onBack}>返回工作台</Button>} />
      <div className="native-documents-layout">
        <nav aria-label="文档目录">
          <SearchField
            label="搜索文档目录"
            placeholder="搜索名称或目录"
            value={search}
            onValueChange={(event) => setSearch(event)}
          />
          {list.isPending && <LoadingStage label="读取目录…" />}
          {!list.isPending && !list.data?.length && <Empty description="当前文档源没有 Markdown 文档" />}
          {(list.data ?? [])
            .filter((document) => `${document.title} ${document.path}`.includes(search))
            .map((document) => (
              <button
                type="button"
                key={document.path}
                className="native-document-entry"
                aria-current={selected === document.path ? 'page' : undefined}
                onClick={() => onNavigate(document.path)}
              >
                <strong>{document.title}</strong>
                <span>{document.path}</span>
              </button>
            ))}
        </nav>
        <ProjectDocumentReader
          key={`${projectId}/${selected}`}
          projectId={projectId}
          path={selected}
          anchor={anchor}
          onNavigate={onNavigate}
        />
      </div>
    </section>
  );
}
