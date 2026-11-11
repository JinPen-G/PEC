/** Viewing shell for the current readable catalog; every page
 * still loads through the existing authorized preview and runtime services. */
import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText, Layers3 } from 'lucide-react';
import { ControlIdentityScope, FrameworkShell, UiEnvironmentProvider, type ShellSection } from '@preview/ui';
import { AdminFeedbackProvider, Alert, Button, Empty } from '@preview/ui/admin';
import { LoadingStage } from '@preview/ui/loading';
import { useNativeAuth } from '@/features/platform/platform-api';
import { QueryFailure } from '@/features/platform/PageLayout';
import { CollaborationRoom, CollaborationControls } from '@/features/platform/CollaborationRoom';
import { VersionNotice } from '@/features/platform/VersionNotice';
import { usePlatformLocale, type PlatformLocale } from '@/features/locale/platform-locale';
import { usePlatformTheme, type PlatformThemeMode } from '@/features/theme/platform-theme';
import { usePrefersReducedMotion } from '@/features/motion/use-motion-preference';
import { useShellLabels } from '@/features/shell/shell-labels';
import {
  useShowcasePages,
  useShowcaseProject,
  useShowcaseProjects,
  type CatalogPage,
} from '@/features/showcase/showcase-catalog';
import { useShowcaseText } from '@/features/showcase/showcase-locale';
import { RuntimePage } from '@/features/showcase/RuntimePage';
import { demoPageRoute, demoPageUrl } from './demo-routes';
import './demo.css';

const PasswordForm = lazy(() =>
  import('@/features/platform/PasswordForm').then((module) => ({ default: module.PasswordForm })),
);
function DemoPage({ page }: { page: CatalogPage }) {
  const { client, session } = useNativeAuth();
  const text = useShowcaseText();
  const query = useQuery<{ entry: string; styles: string[] }>({
    queryKey: ['demo-page', session?.user?.id, session?.user?.revision, demoPageUrl(page)],
    queryFn: ({ signal }) =>
      client.request(`/showcase/${page.projectId}/${page.clientId}/${page.pageKey}`, { signal }),
    retry: false,
    refetchInterval: 5000,
  });
  if (query.error) return <QueryFailure message={query.error.message} retry={() => void query.refetch()} />;
  if (!query.data) return <LoadingStage label={text('读取页面…')} />;
  return <RuntimePage entry={query.data.entry} styles={query.data.styles} />;
}
export function DemoWorkspace() {
  const { session, logout } = useNativeAuth();
  const user = session?.user;
  const location = useLocation();
  const navigate = useNavigate();
  const text = useShowcaseText();
  const { mode, setMode } = usePlatformTheme();
  const { locale, setLocale } = usePlatformLocale();
  const projectsQuery = useShowcaseProjects();
  const projects = projectsQuery.error ? [] : (projectsQuery.data?.projects ?? []);
  const route = demoPageRoute(location.pathname);
  const requestedProject = route?.projectId ?? new URLSearchParams(location.search).get('project');
  const projectId = useShowcaseProject(requestedProject, projectsQuery.error ? undefined : projectsQuery.data?.projects);
  const project = projects.find((item) => item.id === projectId);
  const pagesQuery = useShowcasePages(projectId, Boolean(project));
  const pages = project && !pagesQuery.error ? (pagesQuery.data?.pages ?? []) : [];
  const selected = route && pages.find((page) => demoPageUrl(page) === location.pathname);
  const groups = [...new Set(pages.map((page) => page.category || page.clientName))];
  const sections: ShellSection[] = groups.map((category) => ({
    key: category,
    label: text(category),
    icon: <Layers3 />,
    routes: pages
      .filter((page) => (page.category || page.clientName) === category)
      .map((page) => ({ key: demoPageUrl(page), label: text(page.title), icon: <FileText /> })),
  }));
  const labels = {
    ...useShellLabels(),
    center: text('产品'),
    projects: text('产品'),
    passwordChange: text('修改密码'),
  };
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  useEffect(() => {
    document.title = `${selected ? text(selected.title) : 'Demo'} · Preview`;
  }, [selected, text]);
  let content;
  if (projectsQuery.error) {
    content = (
      <QueryFailure message={projectsQuery.error.message} retry={() => void projectsQuery.refetch()} />
    );
  } else if (projectsQuery.isPending || (project && pagesQuery.isPending)) {
    content = <LoadingStage label={text('读取页面目录…')} />;
  } else if (pagesQuery.error && project) {
    content = <QueryFailure message={pagesQuery.error.message} retry={() => void pagesQuery.refetch()} />;
  } else if (requestedProject && !project && projects.length) {
    content = <QueryFailure message={text('此产品不存在或无权访问。')} />;
  } else if (!pages.length) {
    content = <Empty description={text('暂无可体验的页面')} />;
  } else if (!selected) {
    content = <Navigate to={demoPageUrl(pages[0])} replace />;
  } else {
    content = <DemoPage key={demoPageUrl(selected)} page={selected} />;
  }
  return (
    <CollaborationRoom project={project} enabled={Boolean(user && selected)} routePrefix="/demo">
      <FrameworkShell
        title="Preview"
        subtitle={project?.name ?? 'Demo'}
        brand={<Layers3 size={20} />}
        workspaces={projects.map((item) => ({ key: item.id, label: item.name, icon: <Layers3 /> }))}
        workspaceKey={projectId}
        onWorkspaceChange={(value) => navigate(`/demo?project=${encodeURIComponent(value)}`)}
        navigationMode="components"
        onNavigationModeChange={() => {}}
        showNavigationModeSwitch={false}
        showAppearanceLink={false}
        showDocumentControl={false}
        account={user?.displayName ?? text('访客')}
        accountDescription={user?.username ?? text('公开浏览')}
        sections={sections}
        selectedKey={selected ? demoPageUrl(selected) : ''}
        onNavigate={navigate}
        preference={mode}
        onThemeChange={(value) => setMode(value as PlatformThemeMode)}
        locale={locale}
        onLocaleChange={(value) => setLocale(value as PlatformLocale)}
        onLogout={user ? () => void logout().catch((error: Error) => setLogoutError(error.message)) : undefined}
        onPasswordChange={user ? () => setPasswordOpen(true) : undefined}
        contextControls={
          <>
            <CollaborationControls />
            <Button
              icon={<ArrowLeft size={15} />}
              onClick={() => navigate(project ? `/pages?project=${encodeURIComponent(project.id)}` : '/')}
            >
              {text('返回产品中心')}
            </Button>
          </>
        }
        documentAvailable={false}
        documentOpen={false}
        onDocumentToggle={() => {}}
        labels={labels}
      >
        <VersionNotice />
        <main className="preview-native-content demo-content" data-admin-content data-prototype-canvas>
          {logoutError && <Alert type="error" title={logoutError} />}
          <ControlIdentityScope identity={JSON.stringify([user?.id ?? 'anonymous', location.pathname])}>
            {content}
          </ControlIdentityScope>
        </main>
        {passwordOpen && <PasswordForm onClose={() => setPasswordOpen(false)} />}
      </FrameworkShell>
    </CollaborationRoom>
  );
}
function DemoIdentityGate() {
  const { session, loading, error, refresh } = useNativeAuth();
  if (loading) return <LoadingStage scope="screen" />;
  if (error) return <QueryFailure message={error} retry={() => void refresh()} />;
  if (session?.user?.mustChangePassword) return <PasswordForm required />;
  return <DemoWorkspace key={`${session?.user?.id ?? 'anonymous'}/${session?.user?.revision ?? 0}`} />;
}
export default function DemoApp() {
  const { resolvedMode } = usePlatformTheme();
  const reducedMotion = usePrefersReducedMotion();
  return (
    <UiEnvironmentProvider dark={resolvedMode === 'dark'} reducedMotion={reducedMotion}>
      <AdminFeedbackProvider>
        <Suspense fallback={<LoadingStage scope="screen" />}>
          <DemoIdentityGate />
        </Suspense>
      </AdminFeedbackProvider>
    </UiEnvironmentProvider>
  );
}
