import { AdminFeedbackProvider, Empty, Table } from '@preview/ui/admin';
import { LoadingStage } from '@preview/ui/loading';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { usePrefersReducedMotion } from '@/features/motion/use-motion-preference';
import { BookOpen, Boxes, FileText, Layers3, LayoutGrid, ShieldCheck, UsersRound } from 'lucide-react';
import { DocumentDock, FrameworkShell, UiEnvironmentProvider, type ShellSection } from '@preview/ui';
import { usePlatformTheme, type PlatformThemeMode } from '@/features/theme/platform-theme';
import { usePlatformLocale, type PlatformLocale } from '@/features/locale/platform-locale';
import { clearDemoSession, readDemoSession, type DemoSession } from './demo-session';
import { DemoLogin } from './DemoLogin';
import { useShellLabels } from './shell-labels';
import { AppearancePage } from '@/features/appearance/AppearancePage';
import { InteractionSounds } from '@/features/sound/InteractionSounds';

const MarkdownReader = lazy(() =>
  import('@/features/docs/MarkdownReader').then((module) => ({ default: module.MarkdownReader })),
);

function NativeWorkspace({ session, onLogout }: { session: DemoSession; onLogout: () => void }) {
  const labels = useShellLabels();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { mode, setMode } = usePlatformTheme();
  const { locale, setLocale } = usePlatformLocale();
  const [documentOpen, setDocumentOpen] = useState(false);
  const [workspaceKey, setWorkspaceKey] = useState('sample-project-a');
  const workspaces = [
    {
      key: 'sample-project-a',
      label: locale === 'en' ? 'Demo project A' : locale === 'zh-Hant' ? '示範專案 A' : '示例项目 A',
      icon: <Boxes size={20} />,
    },
    {
      key: 'sample-project-b',
      label: locale === 'en' ? 'Demo project B' : locale === 'zh-Hant' ? '示範專案 B' : '示例项目 B',
      icon: <Layers3 size={20} />,
    },
  ];
  const navigationMode = pathname === '/center' ? 'components' : 'admin';
  const centerKind = new URLSearchParams(search).get('kind') === 'components' ? 'components' : 'requirements';
  const category = locale === 'en' ? 'Orders' : locale === 'zh-Hant' ? '訂單管理' : '订单管理';
  const lastAdminPath = useRef('/manage/projects');
  useEffect(() => {
    if (navigationMode === 'admin') lastAdminPath.current = pathname;
  }, [navigationMode, pathname]);
  const closeDocument = useCallback(() => setDocumentOpen(false), []);
  const allSections: ShellSection[] = [
    {
      key: 'platform',
      label: labels.platform,
      icon: <LayoutGrid />,
      routes: [
        { key: '/manage/projects', label: labels.projects, icon: <Boxes /> },
        { key: '/manage/accounts', label: labels.users, icon: <UsersRound /> },
        { key: '/manage/access', label: labels.grants, icon: <ShieldCheck /> },
      ],
    },
    {
      key: 'workspace',
      label: labels.workspace,
      icon: <Layers3 />,
      routes: [{ key: '/workspace/orders', label: labels.order, icon: <FileText /> }],
    },
  ];
  const sections: ShellSection[] =
    navigationMode === 'admin'
      ? allSections
      : (['requirements', 'components'] as const).map((kind) => ({
          key: kind,
          label: labels[kind],
          icon: kind === 'requirements' ? <BookOpen /> : <Boxes />,
          routes: [{ key: `/center?kind=${kind}`, label: category, icon: <Layers3 /> }],
        }));
  const validRoutes = [
    ...allSections.flatMap((section) => section.routes.map((route) => route.key)),
    '/center',
    '/manage/appearance',
  ];
  const guide = `# ${labels.guide}\n\n${labels.loginHint}\n\n## ${labels.platform}\n\n${labels.later}\n\n## ${labels.docs}\n\n${labels.documentHint}\n\n## ${labels.workspace}\n\n${labels.workspaceHint}`;
  const reader = (
    <Suspense fallback={<LoadingStage />}>
      <MarkdownReader source={guide} loading={false} />
    </Suspense>
  );
  if (!validRoutes.includes(pathname)) return <Navigate to="/manage/projects" replace />;
  return (
    <FrameworkShell
      title="Preview"
      subtitle={workspaces.find((workspace) => workspace.key === workspaceKey)!.label}
      workspaces={workspaces}
      workspaceKey={workspaceKey}
      onWorkspaceChange={(key) => {
        setWorkspaceKey(key);
        setDocumentOpen(false);
        navigate('/workspace/orders', { replace: true });
      }}
      navigationMode={navigationMode}
      onNavigationModeChange={(next) =>
        navigate(next === 'components' ? '/center?kind=requirements' : lastAdminPath.current)
      }
      brand={<Layers3 size={20} strokeWidth={1.7} />}
      account={session.account}
      accountDescription={labels.demo}
      sections={sections}
      selectedKey={navigationMode === 'components' ? `/center?kind=${centerKind}` : pathname}
      onNavigate={navigate}
      preference={mode}
      onThemeChange={(value) => setMode(value as PlatformThemeMode)}
      locale={locale}
      onLocaleChange={(value) => setLocale(value as PlatformLocale)}
      onLogout={onLogout}
      documentAvailable
      documentOpen={documentOpen}
      onDocumentToggle={() => setDocumentOpen((open) => !open)}
      labels={labels}
    >
      <InteractionSounds account={session.account} workspace={workspaceKey} />
      <DocumentDock
        open={documentOpen}
        onClose={closeDocument}
        title={labels.pageDocument}
        closeLabel={labels.close}
        document={reader}
      >
        <main
          data-admin-content
          data-prototype-canvas
          className="preview-native-content"
          aria-label={
            sections.flatMap((section) => section.routes).find((route) => route.key === pathname)?.label ??
            labels.appearance
          }
        >
          {pathname === '/center' && (
            <div className="preview-documents">
              <header>
                <h1>{category}</h1>
              </header>
              <Table
                caption={labels[centerKind]}
                rowKey="key"
                dataSource={centerKind === 'requirements' ? [{ key: 'orders', name: labels.order }] : []}
                columns={[{ title: labels[centerKind], dataIndex: 'name' }]}
                locale={{ emptyText: <Empty description={labels.empty} /> }}
              />
            </div>
          )}
          {pathname === '/manage/appearance' && <AppearancePage />}
        </main>
      </DocumentDock>
    </FrameworkShell>
  );
}

/** Explicitly isolated UI-demo mode. No platform client/auth or project files are read. */
function PreviewWorkspace() {
  const { resolvedMode } = usePlatformTheme();
  const reducedMotion = usePrefersReducedMotion();
  const [session, setSession] = useState(readDemoSession);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = 'Preview';
  }, []);
  const logout = () => {
    clearDemoSession();
    setSession(null);
    navigate('/login', { replace: true });
  };
  return (
    <UiEnvironmentProvider dark={resolvedMode === 'dark'} reducedMotion={reducedMotion}>
      {session ? (
        <NativeWorkspace session={session} onLogout={logout} />
      ) : pathname !== '/login' ? (
        <Navigate to="/login" replace />
      ) : (
        <DemoLogin
          onLogin={(next) => {
            setSession(next);
            navigate('/manage/projects', { replace: true });
          }}
        />
      )}
    </UiEnvironmentProvider>
  );
}

export function PreviewApp() {
  return (
    <AdminFeedbackProvider>
      <PreviewWorkspace />
    </AdminFeedbackProvider>
  );
}
