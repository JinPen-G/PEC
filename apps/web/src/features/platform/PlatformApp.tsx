import { LoadingStage } from '@preview/ui/loading';
/** One authenticated application: role menus, project/client routing and private
 * document slots. UI-demo mode is a separately selected build, never auth fallback. */
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Empty, Select } from '@preview/ui/admin';
import {
  BookOpen,
  Boxes,
  FileText,
  Layers3,
  LayoutGrid,
  Settings,
  UsersRound,
  Camera,
  Car,
} from 'lucide-react';
import { DocumentDock, FrameworkShell, UiEnvironmentProvider, type ShellSection } from '@preview/ui';
import { usePlatformTheme, type PlatformThemeMode } from '@/features/theme/platform-theme';
import { usePlatformLocale, type PlatformLocale } from '@/features/locale/platform-locale';
import { usePrefersReducedMotion } from '@/features/motion/use-motion-preference';
import { InteractionSounds } from '@/features/sound/InteractionSounds';
import { useShellLabels } from '@/features/shell/shell-labels';
import { registeredPage } from '@/features/pages/page-registry';
import { NATIVE_MODULES, nativePageUrl } from '../../../../../packages/platform-contracts/src/platform';
import { loginRoute } from './login-route';
import {
  NativeAuthProvider,
  useNativeAuth,
  useNativeQuery,
  type NativeClient,
  type NativeProject,
} from './platform-api';
import { QueryFailure } from './PageLayout';
import { AdminFeedbackProvider } from '@preview/ui/admin';
import { ControlIdentityScope } from '@preview/ui';
import { centerCategories, centerUrl, componentCenterItems, type CenterKind } from './component-center';
const ComponentCenterPage = lazy(() =>
  import('./ComponentCenterPage').then((module) => ({ default: module.ComponentCenterPage })),
);
const PasswordForm = lazy(() =>
  import('./PasswordForm').then((module) => ({ default: module.PasswordForm })),
);
const AccountsPage = lazy(() =>
  import('./ManagementPages').then((module) => ({ default: module.AccountsPage })),
);
const ProjectDetailsPage = lazy(() =>
  import('./ProjectDetailsPage').then((module) => ({ default: module.ProjectDetailsPage })),
);
const ProjectsPage = lazy(() =>
  import('./ProjectsPage').then((module) => ({ default: module.ProjectsPage })),
);
const SettingsPage = lazy(() =>
  import('./ManagementPages').then((module) => ({ default: module.SettingsPage })),
);
const AppearancePage = lazy(() =>
  import('@/features/appearance/AppearancePage').then((module) => ({ default: module.AppearancePage })),
);
import { ProjectDocumentReader, ProjectDocuments } from './ProjectDocuments';
import { CollaborationRoom, CollaborationControls } from './CollaborationRoom';
import { VersionNotice } from './VersionNotice';

function entry(project: NativeProject, chosen?: string) {
  const clients = project.clients.filter((client) => client.enabled).sort((a, b) => a.position - b.position);
  const client = clients.find((item) => item.id === chosen) ?? clients[0];
  if (!client) return `/p/${project.id}`;
  const page =
    client.pages.find((item) => item.key === client.defaultPage && item.visible) ??
    client.pages.filter((item) => item.visible).sort((a, b) => a.position - b.position)[0];
  return page ? nativePageUrl(project, client.id, page.key) : `/p/${project.id}/${client.id}`;
}
function ScopeContent({
  project,
  client,
  pageKey,
  documentMode,
  doc,
  anchor,
  onDocumentNavigate,
  onBack,
}: {
  project: NativeProject;
  client?: NativeClient;
  pageKey: string;
  documentMode: boolean;
  doc: string;
  anchor: string;
  onDocumentNavigate: (path: string, anchor?: string) => void;
  onBack: () => void;
}) {
  if (documentMode)
    return (
      <ProjectDocuments
        projectId={project.id}
        path={doc}
        anchor={anchor}
        onNavigate={onDocumentNavigate}
        onBack={onBack}
      />
    );
  if (!client || !pageKey)
    return (
      <div className="native-page" role="status">
        当前项目暂无可访问页面。
      </div>
    );
  if (!client.enabled || !client.pages.some((page) => page.key === pageKey && page.visible))
    return <QueryFailure message="当前客户端或页面已停用" />;
  if (NATIVE_MODULES.find((module) => module.key === project.moduleKey)?.surface === 'showcase')
    return <Navigate to={nativePageUrl(project, client.id, pageKey)} replace />;
  return (
    <Suspense fallback={<LoadingStage label="加载原生页面…" />}>
      {registeredPage(project.moduleKey, pageKey)}
    </Suspense>
  );
}
function Workspace() {
  const { session, logout } = useNativeAuth(),
    navigate = useNavigate(),
    location = useLocation();
  const user = session!.user!,
    admin = user.role === 'admin';
  const projects = useNativeQuery<NativeProject[]>('/projects');
  const settings = useNativeQuery<{ brandName: string; brandIcon: string }>('/settings');
  useEffect(() => {
    document.title = settings.data?.brandName ?? 'Preview';
  }, [settings.data?.brandName]);
  const route = /^\/(?:p|projects)\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/.exec(location.pathname);
  const centerRoute = /^\/center(?:\/([^/]+))?$/.exec(location.pathname);
  const projectId = centerRoute?.[1] ?? route?.[1] ?? '',
    clientId = route?.[2] ?? '',
    pageKey = route?.[3] ?? '';
  const projectQuery = useNativeQuery<NativeProject>(`/projects/${projectId}`, Boolean(projectId));
  const project = projectQuery.data;
  const documentMode = clientId === 'documents' || location.pathname === '/documents';
  const centerMode = Boolean(centerRoute) || documentMode;
  const configuring =
    location.pathname.startsWith('/projects/') &&
    ['config', 'settings', 'menus', 'access'].includes(clientId);
  const currentClient = project?.clients.find((client) => client.id === clientId);
  const { mode, setMode } = usePlatformTheme(),
    { locale, setLocale } = usePlatformLocale();
  const text = (simplified: string, traditional: string, english: string) =>
    locale === 'en' ? english : locale === 'zh-Hant' ? traditional : simplified;
  const labels = {
    ...useShellLabels(),
    admin: admin ? text('管理控制台', '管理控制台', 'Admin') : text('项目工作台', '專案工作台', 'Workspace'),
    passwordChange: text('修改密码', '修改密碼', 'Change password'),
    projects: admin ? text('项目管理', '專案管理', 'Projects') : text('我的项目', '我的專案', 'My projects'),
  };
  const [documentScope, setDocumentScope] = useState(''),
    [sidePath, setSidePath] = useState(''),
    [sideAnchor, setSideAnchor] = useState('');
  const [passwordOpen, setPasswordOpen] = useState(false),
    [logoutError, setLogoutError] = useState('');
  const pageContext = useNativeQuery<{
    links: { clientId: string; pageKey: string; documentPath: string; title?: string; anchor: string }[];
  }>(
    `/projects/${projectId}/page-context?clientId=${encodeURIComponent(clientId)}&pageKey=${encodeURIComponent(pageKey)}`,
    Boolean(projectId && currentClient && pageKey && !configuring && !documentMode),
  );
  const link = pageContext.data?.links[0];
  const scope = JSON.stringify([projectId, clientId, pageKey, link?.documentPath ?? '', link?.anchor ?? '']);
  const documentOpen = documentScope === scope;
  const closeDocument = useCallback(() => setDocumentScope(''), [setDocumentScope]);
  const params = new URLSearchParams(location.search),
    doc = params.get('doc') || '',
    anchor = params.get('anchor') || '';
  const centerKind: CenterKind = params.get('kind') === 'components' ? 'components' : 'requirements';
  const categories = project ? centerCategories(componentCenterItems(project)) : [];
  const category = categories.includes(params.get('category') ?? '')
    ? params.get('category')!
    : (categories[0] ?? '');
  const lastPage = useRef('');
  useEffect(() => {
    if (!centerMode) lastPage.current = location.pathname + location.search;
  }, [centerMode, location.pathname, location.search]);
  const onDocumentNavigate = (path: string, target = '') =>
    navigate(
      `/p/${projectId}/documents?doc=${encodeURIComponent(path)}${target ? `&anchor=${encodeURIComponent(target)}` : ''}`,
    );
  const openProject = (value: NativeProject) => {
    let chosen = '';
    try {
      chosen = sessionStorage.getItem(`preview:client:${user.id}:${value.id}`) || '';
    } catch {
      /* Selection persistence is optional. */
    }
    navigate(entry(value, chosen));
  };
  const sections: ShellSection[] = centerMode
    ? (['requirements', 'components'] as const).map((kind) => ({
        key: kind,
        label: labels[kind],
        icon: kind === 'requirements' ? <BookOpen /> : <Boxes />,
        routes: categories.map((name) => ({
          key: centerUrl(projectId, kind, name),
          label: name,
          icon: <Layers3 />,
        })),
      }))
    : [
        {
          key: 'platform',
          label: admin ? labels.platform : text('项目', '專案', 'Projects'),
          icon: <LayoutGrid />,
          routes: [
            {
              key: admin ? '/manage/projects' : '/projects',
              label: labels.projects,
              icon: <Boxes />,
            },
            ...(admin
              ? [
                  { key: '/manage/accounts', label: labels.users, icon: <UsersRound /> },
                  {
                    key: '/manage/settings',
                    label: text('平台设置', '平台設定', 'Settings'),
                    icon: <Settings />,
                  },
                ]
              : []),
          ],
        },
        ...(project && !configuring && !project.archived
          ? [
              {
                key: 'workspace',
                label: project.name,
                icon: <Layers3 />,
                routes: [
                  ...(currentClient?.pages
                    .filter((page) => page.visible)
                    .sort((a, b) => a.position - b.position)
                    .map((page) => ({
                      key: `/p/${project.id}/${currentClient.id}/${page.key}`,
                      label: page.label,
                      icon: <FileText />,
                    })) ?? []),
                  ...(project.memberRole !== 'viewer'
                    ? [{ key: `/projects/${project.id}/settings`, label: '项目信息', icon: <Settings /> }]
                    : []),
                ],
              },
            ]
          : []),
      ];
  const documentAvailable = Boolean(
    link?.documentPath && !configuring && !documentMode && project && !project.archived,
  );
  const sideDocument = project && (
    <>
      {(pageContext.data?.links.length ?? 0) > 1 && (
        <Select
          aria-label="本页关联文档"
          value={sidePath}
          style={{ width: '100%' }}
          options={pageContext.data?.links.map((link) => ({
            value: link.documentPath,
            label: link.title ?? link.documentPath,
          }))}
          onChange={(path) => {
            setSidePath(path);
            setSideAnchor(pageContext.data?.links.find((link) => link.documentPath === path)?.anchor ?? '');
          }}
        />
      )}
      <ProjectDocumentReader
        key={`${project.id}/${sidePath}`}
        projectId={project.id}
        path={sidePath}
        anchor={sideAnchor}
        onNavigate={(path, target) => {
          setSidePath(path);
          setSideAnchor(target ?? '');
        }}
      />
    </>
  );
  if (projects.error)
    return <QueryFailure message={projects.error.message} retry={() => void projects.refetch()} />;
  if (projectId && projectQuery.error)
    return <QueryFailure message={projectQuery.error.message} retry={() => void projectQuery.refetch()} />;
  if (projects.isPending || (projectId && projectQuery.isPending))
    return <LoadingStage label="读取工作空间…" />;
  const home = admin ? '/manage/projects' : '/projects';
  if (location.pathname === '/documents') return <Navigate to="/center" replace />;
  if (centerRoute && !projectId) {
    const selected = projects.data?.find((item) => !item.archived);
    if (selected) return <Navigate to={centerUrl(selected.id, centerKind)} replace />;
  }
  if (centerRoute && project) {
    const canonical = centerUrl(projectId, centerKind, category);
    if (location.pathname + location.search !== canonical) return <Navigate to={canonical} replace />;
  }
  if (configuring && ['menus', 'access'].includes(clientId))
    return <Navigate to={`/projects/${projectId}/settings?tab=${clientId}`} replace />;
  if (clientId === 'config') return <Navigate to={`/projects/${projectId}/settings`} replace />;
  if (['/manage/pages', '/manage/access'].includes(location.pathname)) {
    const selected = params.get('project') ?? projects.data?.find((item) => !item.archived)?.id;
    return (
      <Navigate
        to={
          selected
            ? `/projects/${selected}/settings?tab=${location.pathname.endsWith('access') ? 'access' : 'menus'}`
            : home
        }
        replace
      />
    );
  }
  if (location.pathname === '/' || location.pathname === '/login') return <Navigate to={home} replace />;
  if (
    !admin &&
    ['/manage/projects', '/manage/accounts', '/manage/access', '/manage/settings'].includes(location.pathname)
  )
    return <Navigate to={home} replace />;
  if (project?.archived && !configuring) return <QueryFailure message="项目已归档" />;
  if (
    project &&
    !configuring &&
    !centerMode &&
    project.clients.some((client) => client.enabled) &&
    (!clientId || !currentClient?.enabled)
  )
    return <Navigate to={entry(project)} replace />;
  const known =
    [
      home,
      '/documents',
      '/manage/accounts',
      '/manage/pages',
      '/manage/access',
      '/manage/settings',
      '/manage/appearance',
    ].includes(location.pathname) ||
    Boolean(route) ||
    Boolean(centerRoute);
  if (!known) return <Navigate to={home} replace />;
  return (
    <CollaborationRoom
      project={project}
      enabled={Boolean(project && !configuring && !centerMode && !project.archived)}
    >
      <FrameworkShell
        title={settings.data?.brandName ?? 'Preview'}
        subtitle={(!configuring && project?.name) || (admin ? labels.platform : labels.projects)}
        brand={
          settings.data?.brandIcon === 'camera' ? (
            <Camera size={20} />
          ) : settings.data?.brandIcon === 'vehicle' ? (
            <Car size={20} />
          ) : settings.data?.brandIcon === 'boxes' ? (
            <Boxes size={20} />
          ) : (
            <Layers3 size={20} />
          )
        }
        account={user.displayName}
        accountDescription={
          admin
            ? text('平台管理员', '平台管理員', 'Administrator')
            : text('项目成员', '專案成員', 'Project member')
        }
        workspaces={(projects.data ?? [])
          .filter((value) => !value.archived)
          .map((value) => ({ key: value.id, label: value.name, icon: <Boxes size={20} /> }))}
        workspaceKey={configuring ? '' : projectId}
        onWorkspaceChange={(key) => {
          const chosen = projects.data?.find((value) => value.id === key);
          if (chosen) {
            if (centerMode) navigate(centerUrl(chosen.id, centerKind));
            else openProject(chosen);
          }
        }}
        navigationMode={centerMode ? 'components' : 'admin'}
        onNavigationModeChange={(next) => {
          if (next === 'components') navigate(project ? centerUrl(project.id) : '/center');
          else navigate(lastPage.current || home);
        }}
        selectedKey={
          configuring
            ? home
            : centerMode && project
              ? centerUrl(projectId, centerKind, category)
              : location.pathname
        }
        sections={sections}
        onNavigate={navigate}
        preference={mode}
        onThemeChange={(value) => setMode(value as PlatformThemeMode)}
        locale={locale}
        onLocaleChange={(value) => setLocale(value as PlatformLocale)}
        onLogout={() => {
          void logout().catch((error) => setLogoutError(error.message));
        }}
        onPasswordChange={() => setPasswordOpen(true)}
        contextControls={
          <>
            <CollaborationControls />
            {project && !configuring && !centerMode && (
              <Select
                aria-label="项目客户端"
                value={currentClient?.id}
                placeholder="选择客户端"
                options={project.clients
                  .filter((client) => client.enabled)
                  .map((client) => ({ value: client.id, label: client.name }))}
                onChange={(value) => {
                  try {
                    sessionStorage.setItem(`preview:client:${user.id}:${project.id}`, value);
                  } catch {
                    /* Optional preference. */
                  }
                  navigate(entry(project, value));
                }}
                style={{ width: 128 }}
              />
            )}
          </>
        }
        documentAvailable={documentAvailable}
        documentUnavailableReason={
          pageContext.error?.message ??
          (project ? '当前页面尚未关联文档，可在组件中心查看需求说明' : '请先选择项目，再查看页面关联文档')
        }
        documentOpen={documentOpen}
        onDocumentToggle={() => {
          if (documentOpen) closeDocument();
          else if (link?.documentPath) {
            setSidePath(link.documentPath);
            setSideAnchor(link.anchor);
            setDocumentScope(scope);
          }
        }}
        labels={labels}
      >
        <InteractionSounds account={user.id} workspace={projectId || 'platform'} />
        <VersionNotice />
        {logoutError && <Alert type="error" title={logoutError} />}
        <DocumentDock
          open={documentOpen}
          onClose={closeDocument}
          title="本页文档"
          closeLabel="关闭文档"
          document={sideDocument}
        >
          <main data-admin-content className="preview-native-content">
            {location.pathname === home && (
              <ProjectsPage
                member={!admin}
                onOpen={openProject}
                onConfigure={(value) => navigate(`/projects/${value.id}/settings`)}
              />
            )}
            {centerRoute && !project && (
              <Empty description={text('暂无可访问项目', '暫無可存取專案', 'No accessible projects')} />
            )}
            {centerRoute && project && (
              <ComponentCenterPage
                key={`${projectId}/${centerKind}/${category}`}
                project={project}
                kind={centerKind}
                category={category}
                onRefresh={async () => {
                  await projectQuery.refetch();
                }}
              />
            )}
            {admin && location.pathname === '/manage/accounts' && <AccountsPage />}
            {admin && location.pathname === '/manage/settings' && <SettingsPage />}
            {location.pathname === '/manage/appearance' && <AppearancePage />}
            {configuring && <ProjectDetailsPage key={projectId} projectId={projectId} />}
            {project && !configuring && !centerRoute && (
              <ScopeContent
                key={`${user.id}/${projectId}/${clientId}`}
                project={project}
                client={currentClient}
                pageKey={pageKey}
                documentMode={documentMode}
                doc={doc}
                anchor={anchor}
                onDocumentNavigate={onDocumentNavigate}
                onBack={() => navigate(entry(project))}
              />
            )}
          </main>
        </DocumentDock>
        {passwordOpen && <PasswordForm onClose={() => setPasswordOpen(false)} />}
      </FrameworkShell>
    </CollaborationRoom>
  );
}
export function NativeIdentityGate() {
  const location = useLocation();
  const { session, loading, error, refresh } = useNativeAuth();
  if (loading) return <LoadingStage scope="screen" />;
  if (error) return <QueryFailure message={error} retry={() => void refresh()} />;
  if (!session?.user) return <Navigate to={loginRoute(location.pathname + location.search)} replace />;
  if (session.user.mustChangePassword) return <PasswordForm required />;
  return <Workspace key={`${session.user.id}/${session.user.role}/${session.user.revision}`} />;
}
export function NativeAdministration() {
  const { session } = useNativeAuth();
  const location = useLocation();
  const { resolvedMode } = usePlatformTheme();
  const reducedMotion = usePrefersReducedMotion();
  return (
    <UiEnvironmentProvider dark={resolvedMode === 'dark'} reducedMotion={reducedMotion}>
      <ControlIdentityScope identity={JSON.stringify([session?.user?.id ?? '', location.pathname])}>
        <AdminFeedbackProvider>
          <Suspense fallback={<LoadingStage label="加载页面…" />}>
            <NativeIdentityGate />
          </Suspense>
        </AdminFeedbackProvider>
      </ControlIdentityScope>
    </UiEnvironmentProvider>
  );
}
export function PlatformApp() {
  return (
    <NativeAuthProvider>
      <NativeAdministration />
    </NativeAuthProvider>
  );
}
