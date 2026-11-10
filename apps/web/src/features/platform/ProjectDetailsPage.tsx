/** Project management owns one detail page. Tabs retain drafts and never change
 * the shell's workspace, sidebar sections or selected management menu. */
import { lazy, Suspense, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@preview/ui/admin';
import { LoadingStage } from '@preview/ui/loading';
import { ArrowLeft } from 'lucide-react';
import { useNativeQuery, type NativeProject } from './platform-api';
import { PageHeading, QueryFailure } from './PageLayout';
import { usePlatformLocale } from '@/features/locale/platform-locale';

const Settings = lazy(() =>
  import('./ProjectSettingsPage').then((module) => ({ default: module.ProjectSettingsPage })),
);
const Menus = lazy(() => import('./ProjectMenuPage').then((module) => ({ default: module.ProjectMenuPage })));
const Access = lazy(() =>
  import('./ProjectAccessPage').then((module) => ({ default: module.ProjectAccessPage })),
);
const Integration = lazy(() =>
  import('./ProjectIntegrationPage').then((module) => ({ default: module.ProjectIntegrationPage })),
);

export function ProjectDetailsPage({ projectId }: { projectId: string }) {
  const { locale } = usePlatformLocale();
  const text = (simplified: string, traditional: string, english: string) =>
    locale === 'en' ? english : locale === 'zh-Hant' ? traditional : simplified;
  const query = useNativeQuery<NativeProject>(`/projects/${projectId}`);
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const active =
    requested === 'menus' || requested === 'access' || requested === 'integration' ? requested : 'settings';
  const [visited, setVisited] = useState(() => new Set([active]));
  if (query.error) return <QueryFailure message={query.error.message} retry={() => void query.refetch()} />;
  if (!query.data) return <LoadingStage label="读取项目信息…" />;
  const project = query.data;
  if (project.memberRole === 'viewer') return <QueryFailure message="需要项目管理权限" />;
  if ((active === 'access' || active === 'integration') && project.memberRole !== 'admin')
    return <QueryFailure message="仅管理员可以授权用户" />;
  const panels = [
    { key: 'settings', label: text('基础信息', '基本資訊', 'Basic information'), content: Settings },
    { key: 'menus', label: text('菜单管理', '選單管理', 'Menus'), content: Menus },
    ...(project.memberRole === 'admin'
      ? [
          { key: 'access', label: text('用户授权', '使用者授權', 'User access'), content: Access },
          { key: 'integration', label: text('AI 接入', 'AI 接入', 'AI integration'), content: Integration },
        ]
      : []),
  ];
  return (
    <section className="native-page" data-project-details={projectId}>
      <Link
        className="native-project-back"
        to={project.memberRole === 'admin' ? '/manage/projects' : '/projects'}
      >
        <ArrowLeft size={14} /> {text('项目管理', '專案管理', 'Projects')}
      </Link>
      <PageHeading title={project.name} />
      <TabsRoot
        className="rental-tabs"
        value={active}
        onValueChange={(key) => {
          setVisited((previous) => new Set([...previous, key]));
          const next = new URLSearchParams(params);
          if (key === 'settings') next.delete('tab');
          else next.set('tab', key);
          setParams(next);
        }}
      >
        <TabsList aria-label={text('项目信息', '專案資訊', 'Project information')}>
          {panels.map(({ key, label }) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {panels.map(
          ({ key, content: Panel }) =>
            (visited.has(key) || active === key) && (
              <TabsContent key={key} value={key} forceMount hidden={active !== key}>
                <Suspense fallback={<LoadingStage />}>
                  <Panel projectId={projectId} />
                </Suspense>
              </TabsContent>
            ),
        )}
      </TabsRoot>
    </section>
  );
}
