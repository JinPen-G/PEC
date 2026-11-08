/** Category lists consume registered project menus. PRD remains read-only and
 * all document requests retain the same server-side page permission checks. */
import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, SearchField, Empty, Tag, Button } from '@preview/ui/admin';
import { LoadingStage } from '@preview/ui/loading';
import type { NativeProject } from './platform-api';
import { useNativeQuery } from './platform-api';
import { PageHeading, QueryFailure } from './PageLayout';
import { componentCenterItems, type CenterItem, type CenterKind } from './component-center';
import { usePlatformLocale } from '@/features/locale/platform-locale';
import { useShellLabels } from '@/features/shell/shell-labels';
const Reader = lazy(() =>
  import('./ProjectDocuments').then((module) => ({ default: module.ProjectDocumentReader })),
);

function PageRequirements({ projectId, item }: { projectId: string; item: CenterItem }) {
  const { locale } = usePlatformLocale();
  const query = useNativeQuery<{ links: { documentPath: string; title?: string; anchor: string }[] }>(
    `/projects/${projectId}/page-context?clientId=${encodeURIComponent(item.clientId)}&pageKey=${encodeURIComponent(item.pageKey)}`,
  );
  const [chosen, setChosen] = useState({ path: '', anchor: '' });
  if (query.error) return <QueryFailure message={query.error.message} retry={() => void query.refetch()} />;
  if (!query.data) return <LoadingStage />;
  if (!query.data.links.length)
    return (
      <Empty
        description={
          locale === 'en'
            ? 'No requirements linked to this page'
            : locale === 'zh-Hant'
              ? '此頁面尚未關聯需求說明'
              : '此页面尚未关联需求说明'
        }
      />
    );
  const document = query.data.links.find((link) => link.documentPath === chosen.path) ?? query.data.links[0];
  return (
    <div>
      {query.data.links.length > 1 && (
        <div className="native-actions">
          {query.data.links.map((link) => (
            <Button
              key={link.documentPath}
              onClick={() => setChosen({ path: link.documentPath, anchor: link.anchor })}
            >
              {link.title ?? link.documentPath}
            </Button>
          ))}
        </div>
      )}
      <Suspense fallback={<LoadingStage />}>
        <Reader
          projectId={projectId}
          path={chosen.path || document.documentPath}
          anchor={chosen.path ? chosen.anchor : document.anchor}
          onNavigate={(path, anchor = '') => setChosen({ path, anchor })}
        />
      </Suspense>
    </div>
  );
}

export function ComponentCenterPage({
  project,
  kind,
  category,
  onRefresh,
}: {
  project: NativeProject;
  kind: CenterKind;
  category: string;
  onRefresh?: () => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const { locale } = usePlatformLocale();
  const labels = useShellLabels();
  const text = (simplified: string, traditional: string, english: string) =>
    locale === 'en' ? english : locale === 'zh-Hant' ? traditional : simplified;
  const items = componentCenterItems(project).filter(
    (item) => item.kind === kind && item.category === category,
  );
  const noun =
    kind === 'requirements' ? text('功能页面', '功能頁面', 'page') : text('组件', '組件', 'component');
  return (
    <section className="native-page" data-component-center={project.id}>
      <PageHeading title={category || labels[kind]} />
      <Table<CenterItem>
        caption={category || noun}
        rowKey="id"
        onRefresh={onRefresh}
        dataSource={items.filter((item) =>
          item.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
        )}
        toolbar={
          <SearchField
            label={text(`搜索${noun}`, `搜尋${noun}`, `Search ${noun}s`)}
            placeholder={text(`搜索${noun}名称`, `搜尋${noun}名稱`, `Search ${noun} names`)}
            value={search}
            onValueChange={setSearch}
          />
        }
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
        locale={{
          emptyText: (
            <Empty
              description={
                search
                  ? text(`没有匹配的${noun}`, `沒有符合的${noun}`, `No matching ${noun}s`)
                  : text(`当前分类暂无${noun}`, `目前分類暫無${noun}`, `No ${noun}s in this category`)
              }
            />
          ),
        }}
        columns={[
          {
            title: text(
              `${noun}名称`,
              `${noun}名稱`,
              `${kind === 'requirements' ? 'Page' : 'Component'} name`,
            ),
            dataIndex: 'title',
            render: (title: string) => <strong>{title}</strong>,
          },
          {
            title: text('状态', '狀態', 'Status'),
            render: (_, item) => (
              <Tag>
                {item.visible
                  ? text('已上架', '已上架', 'Published')
                  : text('已下架', '已下架', 'Unpublished')}
              </Tag>
            ),
          },
          {
            title: text('访问范围', '存取範圍', 'Access'),
            render: (_, item) => (
              <Tag>
                {item.access === 'public'
                  ? text('公开', '公開', 'Public')
                  : text('需授权', '需授權', 'Restricted')}
              </Tag>
            ),
          },
          {
            title: text('操作', '操作', 'Actions'),
            key: 'actions',
            render: (_, item) => (
              <div className="native-actions">
                {item.visible && (
                  <Link className="native-route-link" to={item.href}>
                    {text(`查看${noun}`, `查看${noun}`, `View ${noun}`)}
                  </Link>
                )}
                {project.memberRole !== 'viewer' && (
                  <Link className="native-route-link" to={`/projects/${project.id}/settings?tab=menus`}>
                    {text('配置菜单', '設定選單', 'Configure menu')}
                  </Link>
                )}
              </div>
            ),
          },
        ]}
        expandable={
          kind === 'requirements'
            ? {
                rowExpandable: (item) => item.visible,
                expandedRowRender: (item) => <PageRequirements projectId={project.id} item={item} />,
              }
            : undefined
        }
      />
    </section>
  );
}
