import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { HtmlPrototypePage, PrdBinding } from '../../../../packages/platform-contracts/src/index.js';
import { platformApi } from '@/data/platform-api';
import {
  useHtmlPageCatalog,
  usePagePrdLinks,
  usePlatformSettings,
  usePrdBindings,
  useProjectManifest,
} from '@/data/use-platform-data';
import { PrdReviewPanel, type PrdPanelMode } from '@/features/docs/PrdReviewPanel';
import { PrototypeFrame } from '@/features/prototypes/PrototypeFrame';
import { appHomeUrl } from '@/features/routes/app-url';
import {
  findClient,
  findProject,
  getClientPages,
  getClientRuntimeStatus,
  getClientSections,
  getDefaultPage,
  getPagePrdPath,
  groupClientPages,
} from '@/features/projects/project-model';
import { DEFAULT_PROJECT_THEME } from '@/features/projects/project-config-model';
import {
  Avatar,
  Alert,
  Button,
  ConfigProvider,
  Dropdown,
  Empty,
  Layout,
  Menu,
  Select,
  Spin,
  Tooltip,
  type MenuProps,
} from '@/ui/ant';
import {
  AppstoreOutlined,
  BookOutlined,
  DatabaseOutlined,
  DownOutlined,
  DownloadOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@/ui/ant/icons';
import { AppSidebar } from '@/ui/platform/AppSidebar';
import { AnimatedPillNav } from '@/ui/platform/AnimatedPillNav';
import { ProjectIcon } from '@/ui/platform/ProjectIcon';
import { PlatformBrand } from '@/ui/platform/PlatformBrand';
import { ThemeControl } from '@/ui/platform/ThemeControl';
import { LanguageControl } from '@/ui/platform/LanguageControl';

const { Header, Content } = Layout;
const TOPNAV_CONTENT_OFFSET = 72;

function routeForPage(projectId: string, clientId: string, page: HtmlPrototypePage) {
  return `/p/${projectId}/${clientId}/${page.path}`;
}

function usePageBindings<T extends { pagePath: string }>(
  bindings: T[] | undefined,
  activePagePath: string,
  resolvedRoutePath: string,
) {
  return useMemo(() => {
    if (!activePagePath) return [] as T[];
    const pagePaths = new Set([activePagePath, resolvedRoutePath]);
    return (bindings ?? []).filter((binding) => pagePaths.has(binding.pagePath));
  }, [activePagePath, bindings, resolvedRoutePath]);
}

export function ClientWorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { projectId = '', clientId = '', pagePath = '' } = useParams();
  const projectQuery = useProjectManifest();
  const catalogQuery = useHtmlPageCatalog();
  const project = useMemo(
    () => findProject(projectQuery.data?.projects ?? [], projectId),
    [projectId, projectQuery.data],
  );
  const client = findClient(project, clientId);
  const pages = getClientPages(catalogQuery.data, projectId, clientId);
  const sections = getClientSections(catalogQuery.data, projectId, clientId);
  const selectedPage = pages.find((page) => page.path === pagePath) ?? null;
  const defaultPage = client ? getDefaultPage(client, pages) : null;
  const prdLinksQuery = usePagePrdLinks(projectId, Boolean(project && selectedPage));
  const prdBindingsQuery = usePrdBindings(projectId, Boolean(project && selectedPage));
  const settingsQuery = usePlatformSettings();
  const saveDeveloperMode = useMutation({
    mutationFn: (enabled: boolean) =>
      platformApi.savePlatformSettings({
        developerMode: enabled,
        remoteManagement: settingsQuery.data?.remoteManagement ?? false,
      }),
    onSuccess: (settings) => queryClient.setQueryData(['platform', 'settings'], settings),
  });
  const [prdOpen, setPrdOpen] = useState(false);
  const [prdTarget, setPrdTarget] = useState<{ documentPath: string; anchor?: string }>({
    documentPath: '',
  });
  const [prdMode, setPrdMode] = useState<PrdPanelMode>(() =>
    localStorage.getItem('product-experience-center:prd-panel-mode') === 'overlay' ? 'overlay' : 'split',
  );
  const developerModeOverride = ['1', 'true'].includes(
    new URLSearchParams(location.search).get('__dev')?.toLowerCase() || '',
  );
  const sharedDeveloperMode = settingsQuery.data?.developerMode ?? false;
  const developerMode = sharedDeveloperMode || developerModeOverride;

  useEffect(() => {
    const handleDeveloperShortcut = (event: KeyboardEvent) => {
      if (!event.ctrlKey || !event.shiftKey || event.key.toLowerCase() !== 'm') return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      if (saveDeveloperMode.isPending) return;
      // 静态部署下保存会退化为浏览器本地持久化，因此快捷键不再限制为本机。
      saveDeveloperMode.mutate(!sharedDeveloperMode);
    };
    window.addEventListener('keydown', handleDeveloperShortcut);
    return () => window.removeEventListener('keydown', handleDeveloperShortcut);
  }, [saveDeveloperMode, sharedDeveloperMode]);

  useEffect(() => {
    document.title = selectedPage
      ? `${selectedPage.title} - ${project?.name || t('workspace.fallbackProjectName')}`
      : project?.name || t('workspace.defaultDocumentTitle');
  }, [project?.name, selectedPage, t]);

  // 這些派生值和回調必須在加載態/空頁面態之前創建，避免條件 Hook，
  // 同時保證公共殼狀態變化時不會給 iframe 生成新的回調引用。
  const activePage = selectedPage ?? defaultPage;
  const resolvedPrdPath = activePage ? getPagePrdPath(prdLinksQuery.data, clientId, activePage) || '' : '';
  const resolvedRoutePath = activePage ? `/p/${projectId}/${clientId}/${activePage.path}` : '';
  const pageBindings = usePageBindings(
    prdBindingsQuery.data?.bindings,
    activePage?.path ?? '',
    resolvedRoutePath,
  );
  const prdDocuments = useMemo(
    () =>
      [
        ...(resolvedPrdPath ? [{ path: resolvedPrdPath }] : []),
        ...pageBindings.map((binding) => ({ path: binding.prd.document, title: binding.prd.label })),
      ].filter(
        (item, index, items) =>
          item.path && items.findIndex((candidate) => candidate.path === item.path) === index,
      ),
    [pageBindings, resolvedPrdPath],
  );
  const projectAccent = project?.theme?.primary || DEFAULT_PROJECT_THEME.primary;
  const changePrdMode = useCallback(
    (nextMode: PrdPanelMode) => {
      setPrdMode(nextMode);
      localStorage.setItem('product-experience-center:prd-panel-mode', nextMode);
    },
    [setPrdMode],
  );
  const handleClosePrd = useCallback(() => setPrdOpen(false), [setPrdOpen]);
  const prdPathRef = useRef(resolvedPrdPath);
  useEffect(() => {
    prdPathRef.current = resolvedPrdPath;
  }, [resolvedPrdPath]);
  const handleOpenPrd = useCallback(
    (target?: { documentPath: string; anchor?: string }) => {
      const documentPath =
        typeof target?.documentPath === 'string' && target.documentPath.trim()
          ? target.documentPath
          : prdPathRef.current;
      setPrdTarget({
        documentPath,
        ...(typeof target?.anchor === 'string' && target.anchor ? { anchor: target.anchor } : {}),
      });
      setPrdOpen(true);
    },
    [prdPathRef, setPrdOpen, setPrdTarget],
  );
  const clientTheme = useMemo(
    () => ({
      primary: project?.theme?.primary || DEFAULT_PROJECT_THEME.primary,
      primaryHover: project?.theme?.primaryHover,
      primaryActive: project?.theme?.primaryActive,
      pageBackground: project?.theme?.pageBackground,
    }),
    [
      project?.theme?.pageBackground,
      project?.theme?.primary,
      project?.theme?.primaryActive,
      project?.theme?.primaryHover,
    ],
  );
  const clientConfigTheme = useMemo(
    () => ({
      token: {
        colorPrimary: projectAccent,
        colorInfo: projectAccent,
      },
      components: {
        Menu: {
          itemSelectedBg: projectAccent,
          itemSelectedColor: 'var(--ant-color-text-light-solid)',
        },
      },
    }),
    [projectAccent],
  );

  if (projectQuery.isPending || catalogQuery.isPending) {
    return (
      <div className="home-loading">
        <Spin size="large" />
      </div>
    );
  }
  if (!project || project.homepage?.visible === false || !client) {
    return <Navigate to={`/unavailable/${projectId}`} replace />;
  }
  const runtimeStatus = getClientRuntimeStatus(project, clientId, pages);
  if (!pagePath && defaultPage) {
    return <Navigate to={routeForPage(projectId, clientId, defaultPage)} replace />;
  }
  if (!selectedPage) {
    const runtimeNotice =
      runtimeStatus.state === 'index-missing'
        ? {
            type: 'error' as const,
            message: t('workspace.runtimeIndexMissing'),
            description: t('workspace.runtimeIndexMissingDescription', {
              count: runtimeStatus.managedHtmlPageCount,
            }),
          }
        : null;
    return (
      <main className="client-empty">
        {runtimeNotice ? (
          <Alert
            showIcon
            type={runtimeNotice.type}
            title={runtimeNotice.message}
            description={runtimeNotice.description}
          />
        ) : (
          <Empty
            description={
              pages.length ? t('workspace.pageMissing') : t('workspace.clientNoPages')
            }
          />
        )}
        <Button type="primary" onClick={() => navigate('/')}>
          {t('workspace.backHome')}
        </Button>
      </main>
    );
  }

  const prdPath = resolvedPrdPath;
  const sourceDownloadUrl = developerMode
    ? platformApi.getHtmlPrototypeSourceDownloadUrl(projectId, selectedPage.sourceRoot, selectedPage.source)
    : '';

  return (
    <ConfigProvider theme={clientConfigTheme}>
      <ClientWorkspace
        projectId={projectId}
        clientId={clientId}
        project={project}
        client={client}
        pages={pages}
        sections={sections}
        selectedPage={selectedPage}
        theme={clientTheme}
        locationSearch={location.search}
        locationHash={location.hash}
        prdPath={prdPath}
        prdBindings={pageBindings}
        prdOpen={prdOpen}
        prdTarget={prdTarget}
        prdDocuments={prdDocuments}
        prdMode={prdMode}
        developerMode={developerMode}
        sourceDownloadUrl={sourceDownloadUrl}
        onPrdModeChange={changePrdMode}
        onClosePrd={handleClosePrd}
        onOpenPrd={handleOpenPrd}
        onNavigate={navigate}
      />
    </ConfigProvider>
  );
}

function ClientWorkspace({
  projectId,
  clientId,
  project,
  client,
  pages,
  sections,
  selectedPage,
  theme,
  locationSearch,
  locationHash,
  prdPath,
  prdBindings,
  prdOpen,
  prdTarget,
  prdDocuments,
  prdMode,
  developerMode,
  sourceDownloadUrl,
  onPrdModeChange,
  onClosePrd,
  onOpenPrd,
  onNavigate,
}: {
  projectId: string;
  clientId: string;
  project: NonNullable<ReturnType<typeof findProject>>;
  client: NonNullable<ReturnType<typeof findClient>>;
  pages: HtmlPrototypePage[];
  sections: Array<{ id: string; title: string }>;
  selectedPage: HtmlPrototypePage;
  theme: {
    primary: string;
    primaryHover?: string;
    primaryActive?: string;
    pageBackground?: string;
  };
  locationSearch: string;
  locationHash: string;
  prdPath: string;
  prdBindings: PrdBinding[];
  prdOpen: boolean;
  prdTarget: { documentPath: string; anchor?: string };
  prdDocuments: Array<{ path: string; title?: string }>;
  prdMode: PrdPanelMode;
  developerMode: boolean;
  sourceDownloadUrl: string;
  onPrdModeChange: (mode: PrdPanelMode) => void;
  onClosePrd: () => void;
  onOpenPrd: (target?: { documentPath: string; anchor?: string }) => void;
  onNavigate: ReturnType<typeof useNavigate>;
}) {
  const { t } = useTranslation();
  const collapsedKey = `product-experience-center:client-nav:${projectId}:${clientId}`;
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(collapsedKey) === 'collapsed');
  const syncRouteRef = useRef('');
  const desiredFrameUrl = `${platformApi.getHtmlPrototypeUrl(
    projectId,
    selectedPage.sourceRoot,
    selectedPage.source,
  )}${locationSearch}${locationHash}`;
  const [frameUrl, setFrameUrl] = useState(desiredFrameUrl);
  const groups = useMemo(() => groupClientPages(pages, sections), [pages, sections]);
  const layoutType = client.layout?.type || 'sidebar';
  const activeMenuSectionKey = useMemo(() => {
    const activeGroup = groups.find((group) => group.pages.some((page) => page.path === selectedPage.path));
    return activeGroup ? `section:${activeGroup.id}` : '';
  }, [groups, selectedPage.path]);
  const [menuDisclosure, setMenuDisclosure] = useState(() => ({
    pagePath: selectedPage.path,
    openKeys: activeMenuSectionKey ? [activeMenuSectionKey] : [],
  }));
  const openMenuKeys =
    menuDisclosure.pagePath === selectedPage.path
      ? menuDisclosure.openKeys
      : activeMenuSectionKey
        ? [activeMenuSectionKey]
        : [];

  useEffect(() => {
    if (syncRouteRef.current === desiredFrameUrl) {
      syncRouteRef.current = '';
      return;
    }
    setFrameUrl(desiredFrameUrl);
  }, [desiredFrameUrl]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(collapsedKey, next ? 'collapsed' : 'expanded');
      return next;
    });
  }

  const navigatePage = useCallback(
    (page: HtmlPrototypePage) => {
      const section = groups.find((group) => group.pages.some((candidate) => candidate.path === page.path));
      setMenuDisclosure({
        pagePath: page.path,
        openKeys: section ? [`section:${section.id}`] : [],
      });
      onNavigate(routeForPage(projectId, clientId, page));
    },
    [clientId, groups, onNavigate, projectId],
  );

  const syncIframeRoute = useCallback(
    (frame: HTMLIFrameElement) => {
      try {
        const current = frame.contentWindow?.location;
        if (!current) return;
        const matchingPage = pages.find((page) => {
          const candidate = platformApi.getHtmlPrototypeUrl(projectId, page.sourceRoot, page.source);
          return new URL(candidate, window.location.origin).pathname === current.pathname;
        });
        if (!matchingPage) return;
        if (
          matchingPage.path === selectedPage.path &&
          current.search === locationSearch &&
          current.hash === locationHash
        ) {
          return;
        }
        const matchingGroup = groups.find((group) =>
          group.pages.some((page) => page.path === matchingPage.path),
        );
        setMenuDisclosure({
          pagePath: matchingPage.path,
          openKeys: matchingGroup ? [`section:${matchingGroup.id}`] : [],
        });
        const nextOuterUrl = `${routeForPage(projectId, clientId, matchingPage)}${current.search}${current.hash}`;
        syncRouteRef.current = `${current.pathname}${current.search}${current.hash}`;
        onNavigate(nextOuterUrl, { replace: true });
      } catch {
        // 外部 HTML 目前由同源服務承載；若未來改爲跨域，僅停止路由同步，不影響頁面顯示。
      }
    },
    [clientId, groups, locationHash, locationSearch, onNavigate, pages, projectId, selectedPage.path],
  );

  const menuItems = useMemo(
    () =>
      createMenuItems(
        groups.map((group) => (group.id === 'other' ? { ...group, title: t('workspace.group.other') } : group)),
        layoutType,
        navigatePage,
        collapsed,
      ),
    [collapsed, groups, layoutType, navigatePage, t],
  );
  const accountItems = useMemo<MenuProps['items']>(
    () => [
      { key: 'home', icon: <HomeOutlined />, label: t('workspace.menu.backHome'), onClick: () => onNavigate('/') },
      ...(developerMode
        ? [
            {
              key: 'ai-context',
              icon: <DatabaseOutlined />,
              label: t('workspace.menu.currentPageContext'),
              onClick: () =>
                onNavigate(
                  `/tools/ai-context?project=${encodeURIComponent(projectId)}&client=${encodeURIComponent(clientId)}&page=${encodeURIComponent(selectedPage.path)}`,
                ),
            },
          ]
        : []),
      { key: 'exit', icon: <LogoutOutlined />, label: t('workspace.menu.exitClient'), onClick: () => onNavigate('/') },
    ],
    [clientId, developerMode, onNavigate, projectId, selectedPage.path, t],
  );
  const clientOptions = useMemo(
    () => project.clients.map((item) => ({ label: item.name, value: item.id })),
    [project.clients],
  );
  const bare = layoutType === 'none' || layoutType === 'bare';
  const projectAccent = project.theme?.primary || DEFAULT_PROJECT_THEME.primary;
  const workspaceStyle = useMemo(
    () =>
      ({
        '--project-accent': projectAccent,
        '--project-page-bg': 'var(--ant-color-bg-layout)',
      }) as CSSProperties,
    [projectAccent],
  );
  const pageWorkspace = (
    <div className={`client-page-workspace ${prdOpen ? `has-prd prd-${prdMode}` : ''}`}>
      <Content className="client-content">
        <PrototypeFrame
          page={selectedPage}
          source={frameUrl}
          theme={theme}
          prdBindings={prdBindings}
          contentTopOffset={layoutType === 'topnav' ? TOPNAV_CONTENT_OFFSET : 0}
          onOpenPrd={onOpenPrd}
          onLoad={syncIframeRoute}
        />
      </Content>
      <PrdReviewPanel
        key={`${prdTarget.documentPath}:${prdTarget.anchor || ''}`}
        open={prdOpen}
        projectId={projectId}
        pageTitle={selectedPage.title}
        documentPath={prdTarget.documentPath}
        documentAnchor={prdTarget.anchor}
        documents={prdDocuments}
        mode={prdMode}
        onModeChange={onPrdModeChange}
        onClose={onClosePrd}
      />
    </div>
  );

  if (bare) {
    return (
      <main className="client-bare" style={workspaceStyle}>
        {prdPath || sourceDownloadUrl ? (
          <div className="client-bare-tools" aria-label={t('workspace.tools.ariaLabel')}>
            {sourceDownloadUrl ? (
              <Button href={sourceDownloadUrl} icon={<DownloadOutlined />}>
                {t('workspace.tools.downloadSource')}
              </Button>
            ) : null}
            {prdPath ? (
              <Button type="primary" icon={<BookOutlined />} onClick={() => onOpenPrd()}>
                {t('workspace.tools.viewPrd')}
              </Button>
            ) : null}
          </div>
        ) : null}
        {pageWorkspace}
      </main>
    );
  }

  if (layoutType === 'topnav') {
    return (
      <Layout className="client-shell client-shell--topnav" style={workspaceStyle}>
        <Header className="client-topbar client-topbar--topnav">
          <div className="topnav-block topnav-block--main">
            <ClientBrand projectName={project.name} />
            <ClientTopNavigation groups={groups} selectedPage={selectedPage} onNavigatePage={navigatePage} />
            <span className="client-topnav__divider" aria-hidden="true" />
            <ClientActions
              clientId={clientId}
              clientName={client.name}
              clientOptions={clientOptions}
              prdPath={prdPath}
              sourceDownloadUrl={sourceDownloadUrl}
              accountItems={accountItems}
              onClientChange={(value) => onNavigate(`/p/${projectId}/${value}`)}
              onOpenPrd={onOpenPrd}
            />
          </div>
        </Header>
        {pageWorkspace}
      </Layout>
    );
  }

  return (
    <Layout className="client-shell client-shell--sidebar" style={workspaceStyle}>
      <div className="app-shell-body client-shell__body">
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          brandMark={<PlatformBrand variant="mark" alt="" />}
          brandTitle={project.name}
          onBrandClick={() => onNavigate('/')}
          routeKey={`${clientId}:${selectedPage.path}`}
          selector={
            <Select
              aria-label={t('workspace.selectClient')}
              value={clientId}
              options={clientOptions}
              onChange={(value) => onNavigate(`/p/${projectId}/${value}`)}
            />
          }
          nav={(isCollapsed) => (
            <Menu
              aria-label={t('workspace.clientNav')}
              mode="inline"
              selectedKeys={[selectedPage.path]}
              openKeys={isCollapsed ? undefined : openMenuKeys}
              items={menuItems}
              onOpenChange={(keys) => {
                const latest = keys.find((key) => !openMenuKeys.includes(String(key)));
                setMenuDisclosure({
                  pagePath: selectedPage.path,
                  openKeys: latest ? [String(latest)] : [],
                });
              }}
            />
          )}
          tools={(isCollapsed) => (
            <>
              {sourceDownloadUrl ? (
                <Button type="text" href={sourceDownloadUrl} icon={<DownloadOutlined />}>
                  {isCollapsed ? null : t('workspace.tools.downloadSource')}
                </Button>
              ) : null}
              <Button type="text" disabled={!prdPath} icon={<BookOutlined />} onClick={() => onOpenPrd()}>
                {isCollapsed ? null : t('workspace.tools.viewPrd')}
              </Button>
              <ThemeControl showLabel={!isCollapsed} />
              <LanguageControl showLabel={!isCollapsed} />
            </>
          )}
          account={(isCollapsed) => (
            <Dropdown menu={{ items: accountItems }} trigger={['click']} placement="topLeft">
              <button className="app-account-card" type="button">
                <Avatar size={32} className="app-account-card__avatar">
                  A
                </Avatar>
                {isCollapsed ? null : (
                  <>
                    <span className="app-account-card__copy">
                      <b>Admin</b>
                      <small>{client.name}</small>
                    </span>
                    <DownOutlined className="app-account-card__more" />
                  </>
                )}
              </button>
            </Dropdown>
          )}
        />
        <div className="app-workspace-panel">{pageWorkspace}</div>
      </div>
    </Layout>
  );
}

/**
 * 側欄展開態的一級是**不可點的分組標題**，二級頁面始終鋪開；
 * 收起態換成只有圖標的父項，二級收進懸浮浮層；頂部導航沿用可點父項 + 下拉二級。
 */
function createMenuItems(
  groups: ReturnType<typeof groupClientPages>,
  layoutType: string,
  navigatePage: (page: HtmlPrototypePage) => void,
  collapsed: boolean,
): MenuProps['items'] {
  const isSidebar = layoutType === 'sidebar';
  return groups.map((group) => {
    const children = group.pages.map((page) => ({
      key: page.path,
      icon: <ProjectIcon name={page.icon} />,
      label: page.title,
      onClick: () => navigatePage(page),
    }));
    if (isSidebar && !collapsed) {
      return { type: 'group' as const, key: `section:${group.id}`, label: group.title, children };
    }
    return {
      key: `section:${group.id}`,
      icon: isSidebar && group.pages[0]?.icon ? <ProjectIcon name={group.pages[0].icon} /> : undefined,
      label: group.title,
      children,
    };
  });
}

function ClientBrand({ projectName }: { projectName: string }) {
  return (
    <a className="client-brand" href={appHomeUrl()}>
      <span className="client-brand__mark" aria-hidden="true">
        <PlatformBrand variant="mark" alt="" />
      </span>
      <span className="client-brand__copy">
        <strong>{projectName}</strong>
      </span>
    </a>
  );
}

/**
 * 頂部導航：一級菜單直接排在主膠囊裏，選中一級高亮。
 * 多頁面分組使用 Ant Design Menu 原生子菜單，箭頭與交互由 Menu 統一渲染。
 */
function ClientTopNavigation({
  groups,
  selectedPage,
  onNavigatePage,
}: {
  groups: ReturnType<typeof groupClientPages>;
  selectedPage: HtmlPrototypePage;
  onNavigatePage: (page: HtmlPrototypePage) => void;
}) {
  const { t } = useTranslation();
  const navigationRef = useRef<HTMLDivElement>(null);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const items: MenuProps['items'] = groups.map((group) => {
    const children = group.pages.map((page) => ({
      key: page.path,
      icon: <ProjectIcon name={page.icon} />,
      label: page.title,
    }));

    if (children.length === 1) {
      return {
        key: group.pages[0].path,
        label: <span data-animated-pill-item={group.pages[0].path}>{group.title}</span>,
      };
    }

    return {
      key: `section:${group.id}`,
      label: <span data-animated-pill-item={`section:${group.id}`}>{group.title}</span>,
      children,
    };
  });
  const activeGroup = groups.find((group) => group.pages.some((page) => page.path === selectedPage.path));
  const activeKey = activeGroup
    ? activeGroup.pages.length === 1
      ? activeGroup.pages[0].path
      : `section:${activeGroup.id}`
    : undefined;

  useEffect(() => {
    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (navigationRef.current?.contains(target)) return;
      // Ant Menu 的子菜單默認掛到 body，點擊浮層選項時不能提前把它卸載。
      if (target.closest('.ant-menu-submenu-popup')) return;
      setOpenKeys([]);
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, []);

  return (
    <div ref={navigationRef} className="client-topnav">
      <AnimatedPillNav
        className="client-topnav__track"
        activeKey={activeKey}
        layoutKey={groups.map((group) => `${group.id}:${group.pages.length}`).join('|')}
        ariaLabel={t('workspace.mainNav')}
      >
        <Menu
          className="client-topnav--native"
          mode="horizontal"
          triggerSubMenuAction="click"
          selectable
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          selectedKeys={[selectedPage.path]}
          items={items}
          onClick={({ key }) => {
            const page = groups.flatMap((group) => group.pages).find((item) => item.path === key);
            if (page) {
              setOpenKeys([]);
              onNavigatePage(page);
            }
          }}
        />
      </AnimatedPillNav>
    </div>
  );
}

function ClientActions({
  clientId,
  clientName,
  clientOptions,
  prdPath,
  sourceDownloadUrl,
  accountItems,
  onClientChange,
  onOpenPrd,
}: {
  clientId: string;
  clientName: string;
  clientOptions: Array<{ label: string; value: string }>;
  prdPath: string;
  sourceDownloadUrl: string;
  accountItems: MenuProps['items'];
  onClientChange: (value: string) => void;
  onOpenPrd: () => void;
}) {
  const { t } = useTranslation();
  /** 右側四個功能保留圖標表達，文字通過懸浮提示和 aria-label 提供。 */
  const entries: ReactNode[] = [
    <Dropdown
      key="client"
      trigger={['click']}
      placement="bottomRight"
      classNames={{ root: 'app-pill-menu' }}
      menu={{
        items: [
          {
            type: 'group',
            label: t('workspace.actions.switchClientGroup'),
            children: clientOptions.map((option) => ({ key: option.value, label: option.label })),
          },
        ],
        selectable: true,
        selectedKeys: [clientId],
        onClick: ({ key }) => onClientChange(key),
      }}
    >
      <Tooltip title={t('workspace.actions.switchClientTooltip', { name: clientName })}>
        <button type="button" className="topnav-icon-button" aria-label={t('workspace.actions.switchClientAria', { name: clientName })}>
          <AppstoreOutlined />
        </button>
      </Tooltip>
    </Dropdown>,

    sourceDownloadUrl ? (
      <Tooltip key="download" title={t('workspace.tools.downloadSource')}>
        <a className="topnav-icon-button" href={sourceDownloadUrl} aria-label={t('workspace.tools.downloadSource')}>
          <DownloadOutlined />
        </a>
      </Tooltip>
    ) : null,

    <Tooltip key="prd" title={prdPath ? t('workspace.tools.viewPrd') : t('workspace.actions.noPrd')}>
      <button
        type="button"
        className="topnav-icon-button"
        aria-label={t('workspace.tools.viewPrd')}
        disabled={!prdPath}
        onClick={() => onOpenPrd()}
      >
        <BookOutlined />
      </button>
    </Tooltip>,

    <ThemeControl key="theme" iconOnly />,
    <LanguageControl key="language" iconOnly />,

    <Dropdown
      key="account"
      menu={{ items: accountItems }}
      trigger={['click']}
      placement="bottomRight"
      classNames={{ root: 'app-pill-menu' }}
    >
      <Tooltip title={t('workspace.actions.account')}>
        <button type="button" className="topnav-icon-button" aria-label={t('workspace.actions.account')}>
          <UserOutlined />
        </button>
      </Tooltip>
    </Dropdown>,
  ].filter(Boolean);

  return (
    <div className="client-actions">
      {entries.map((entry, index) => (
        <Fragment key={index}>{entry}</Fragment>
      ))}
    </div>
  );
}
