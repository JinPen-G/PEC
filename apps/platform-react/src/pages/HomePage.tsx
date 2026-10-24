import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type {
  HtmlPageCatalog,
  ProjectEntry,
  ProjectManifest,
} from '../../../../packages/platform-contracts/src/index.js';
import { platformApi } from '@/data/platform-api';
import { useHtmlPageCatalog, useProjectManifest } from '@/data/use-platform-data';
import {
  getClientEntryPath,
  getClientPages,
  getClientRuntimeStatus,
  visibleProjects,
} from '@/features/projects/project-model';
import { DEFAULT_PROJECT_THEME } from '@/features/projects/project-config-model';
import {
  Alert,
  Avatar,
  Button,
  Card,
  ConfigProvider,
  Divider,
  Empty,
  Flex,
  Spin,
  Tag,
  Typography,
} from '@/ui/ant';
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  BookOutlined,
  CarOutlined,
  FolderOpenOutlined,
  MobileOutlined,
  SettingOutlined,
} from '@/ui/ant/icons';
import { ThemeControl } from '@/ui/platform/ThemeControl';
import { AnimatedPillNav } from '@/ui/platform/AnimatedPillNav';
import { PlatformBrand } from '@/ui/platform/PlatformBrand';

const { Text, Title } = Typography;
const TOOLS_VISIBILITY_KEY = 'project-platform:home-engineering-tools';

function readToolsVisibility() {
  try {
    return sessionStorage.getItem(TOOLS_VISIBILITY_KEY) === 'true';
  } catch {
    return false;
  }
}

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const homePageRef = useRef<HTMLElement>(null);
  const topbarCapsuleRef = useRef<HTMLDivElement>(null);
  const projectQuery = useProjectManifest();
  const catalogQuery = useHtmlPageCatalog();
  const projects = useMemo(() => visibleProjects(projectQuery.data?.projects ?? []), [projectQuery.data]);
  const [showTools, setShowTools] = useState(readToolsVisibility);
  const requestedProjectId = new URLSearchParams(location.search).get('project') || '';
  const selectedId = projects.some((project) => project.id === requestedProjectId) ? requestedProjectId : '';
  const selectedProject = projects.find((project) => project.id === selectedId) ?? null;

  useEffect(() => {
    document.title = selectedProject ? `${selectedProject.name} - 產品功能體驗中心` : '產品功能體驗中心';
  }, [selectedProject]);

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if (!event.ctrlKey || !event.shiftKey || event.key.toLowerCase() !== 'm') return;
      event.preventDefault();
      setShowTools((current) => {
        const next = !current;
        try {
          sessionStorage.setItem(TOOLS_VISIBILITY_KEY, String(next));
        } catch {
          // Session storage is optional; the current page state still works.
        }
        return next;
      });
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useLayoutEffect(() => {
    const homePage = homePageRef.current;
    const capsule = topbarCapsuleRef.current;
    if (!homePage || !capsule) return;

    let frameId: number | null = null;
    let disposed = false;

    const syncShellWidth = () => {
      frameId = null;
      if (disposed) return;

      const width = capsule.getBoundingClientRect().width;
      if (width > 0) homePage.style.setProperty('--home-shell-width', `${width}px`);
    };

    const scheduleShellWidthSync = () => {
      if (disposed) return;
      if (frameId !== null) cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        frameId = requestAnimationFrame(syncShellWidth);
      });
    };

    scheduleShellWidthSync();
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleShellWidthSync);
    resizeObserver?.observe(capsule);
    window.addEventListener('resize', scheduleShellWidthSync);
    document.fonts?.ready.then(scheduleShellWidthSync).catch(() => undefined);

    return () => {
      disposed = true;
      if (frameId !== null) cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleShellWidthSync);
    };
  }, [catalogQuery.isPending, projectQuery.isPending, projects.length, showTools]);

  function selectProject(projectId: string) {
    navigate(projectId ? `/?project=${encodeURIComponent(projectId)}` : '/', { replace: true });
  }

  if (projectQuery.isPending || catalogQuery.isPending) {
    return (
      <div className="home-loading home-loading--ant">
        <Spin size="large" />
        <Text type="secondary">正在讀取項目資料</Text>
      </div>
    );
  }

  return (
    <main ref={homePageRef} className="home-page home-page--ant">
      <header className="home-topbar home-topbar--ant">
        <div ref={topbarCapsuleRef} className="home-topbar__capsule">
          <Button className="home-brand home-brand--ant" type="text" onClick={() => selectProject('')}>
            <PlatformBrand variant="full" />
          </Button>

          <AnimatedPillNav
            as="nav"
            className="home-project-nav"
            activeKey={selectedId}
            layoutKey={projects.map((project) => project.id).join('|')}
            ariaLabel="項目列表"
          >
            {projects.length ? (
              projects.map((project) => (
                <Button
                  key={project.id}
                  type="text"
                  data-animated-pill-item={project.id}
                  className={`home-project-nav__item ${selectedProject?.id === project.id ? 'is-selected' : ''}`}
                  aria-current={selectedProject?.id === project.id ? 'page' : undefined}
                  onClick={() => selectProject(project.id)}
                >
                  {project.name}
                </Button>
              ))
            ) : (
              <span className="home-project-nav__empty">暫無開放項目</span>
            )}
          </AnimatedPillNav>

          <span className="home-topbar__divider" aria-hidden="true" />

          <Flex className="home-topbar__actions" gap={4} align="center">
            <ThemeControl />
            {showTools ? (
              <>
                <Button
                  type="text"
                  icon={<AppstoreOutlined />}
                  aria-label="組件規範"
                  title="組件規範"
                  onClick={() => navigate('/components')}
                />
                <Button
                  type="text"
                  icon={<FolderOpenOutlined />}
                  aria-label="項目管理"
                  title="項目管理"
                  onClick={() => navigate('/tools/projects')}
                />
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  aria-label="控制台"
                  title="控制台"
                  onClick={() => navigate('/tools/console')}
                />
              </>
            ) : null}
          </Flex>
        </div>
      </header>

      <div className="home-main">
        {projectQuery.isError || catalogQuery.isError ? (
          <Alert
            type="error"
            showIcon
            title="項目資料讀取失敗"
            description="請確認 React 開發服務和項目掃描接口可用。"
          />
        ) : selectedProject ? (
          <ProjectWorkspace
            key={selectedProject.id}
            project={selectedProject}
            onOpen={navigate}
            catalog={catalogQuery.data}
          />
        ) : (
          <section className="home-empty home-empty--ant">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={projects.length ? '選擇項目後顯示項目內容入口' : '當前沒有開放的項目'}
            />
          </section>
        )}
      </div>
    </main>
  );
}

function ProjectWorkspace({
  project,
  catalog,
  onOpen,
}: {
  project: ProjectManifest;
  catalog: HtmlPageCatalog | undefined;
  onOpen: (path: string) => void;
}) {
  const entries = [...(project.entries ?? [])].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  const productEntries = entries.filter((entry) => entry.kind !== 'docs');
  const documentEntries = entries.filter((entry) => entry.kind === 'docs');
  const accent = project.theme?.primary || DEFAULT_PROJECT_THEME.primary;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: accent, colorInfo: accent } }}>
      <Card
        className="home-workspace home-workspace--ant"
        style={{ '--project-accent': accent } as CSSProperties}
      >
        <header className="home-project-heading home-project-heading--ant">
          <div className="home-project-heading__identity">
            {project.branding?.logo ? (
              <img
                className="home-project-logo"
                src={platformApi.getProjectAssetUrl(project.id, project.branding.logo)}
                alt=""
              />
            ) : (
              <Avatar shape="square" size={48} icon={<FolderOpenOutlined />} />
            )}
            <div>
              <Flex gap={8} align="center" wrap>
                <Title level={2}>{project.name}</Title>
                <Tag>v{project.version || '0.0.0'}</Tag>
              </Flex>
              <Text type="secondary">{project.description || '項目原型與資料入口'}</Text>
            </div>
          </div>
          <div className="home-project-heading__meta">
            <Tag color="success">可訪問</Tag>
            <Text type="secondary">
              {productEntries.length} 個產品入口 · {documentEntries.length} 個文檔入口
            </Text>
          </div>
        </header>

        <Divider />

        <div className={`home-workspace__body ${documentEntries.length ? 'has-documents' : ''}`}>
          <EntrySection
            title="產品入口"
            description="進入客戶端或移動端原型"
            entries={productEntries}
            project={project}
            catalog={catalog}
            onOpen={onOpen}
          />
          {documentEntries.length ? (
            <EntrySection
              compact
              title="產品文檔"
              description="查看項目 PRD 與相關資料"
              entries={documentEntries}
              project={project}
              catalog={catalog}
              onOpen={onOpen}
            />
          ) : null}
        </div>
      </Card>
    </ConfigProvider>
  );
}

function EntrySection({
  title,
  description,
  entries,
  project,
  catalog,
  compact = false,
  onOpen,
}: {
  title: string;
  description: string;
  entries: ProjectEntry[];
  project: ProjectManifest;
  catalog: HtmlPageCatalog | undefined;
  compact?: boolean;
  onOpen: (path: string) => void;
}) {
  return (
    <section className={`home-entry-section ${compact ? 'is-compact' : ''}`}>
      <header>
        <div>
          <Title level={3}>{title}</Title>
          <Text type="secondary">{description}</Text>
        </div>
        <Text type="secondary">{entries.length} 項</Text>
      </header>
      {entries.length ? (
        <div className="home-entry-grid">
          {entries.map((entry) => (
            <ProjectEntryButton
              key={entry.id}
              entry={entry}
              project={project}
              catalog={catalog}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暫無入口" />
      )}
    </section>
  );
}

function ProjectEntryButton({
  entry,
  project,
  catalog,
  onOpen,
}: {
  entry: ProjectEntry;
  project: ProjectManifest;
  catalog: HtmlPageCatalog | undefined;
  onOpen: (path: string) => void;
}) {
  const client = entry.kind === 'client' ? project.clients.find((item) => item.id === entry.clientId) : null;
  const pages = client ? getClientPages(catalog, project.id, client.id) : [];
  const runtimeStatus = client ? getClientRuntimeStatus(project, client.id, pages) : null;
  const path = client
    ? getClientEntryPath(project, client, pages)
    : entry.kind === 'docs'
      ? `/p/${project.id}/docs`
      : `/p/${project.id}/mobile`;
  const icon =
    entry.kind === 'docs' ? <BookOutlined /> : entry.kind === 'mobile' ? <MobileOutlined /> : <CarOutlined />;
  const status = getEntryStatus(runtimeStatus);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onOpen(path);
  }

  return (
    <Card
      className="home-entry-card home-entry-card--ant"
      hoverable
      role="button"
      tabIndex={0}
      onClick={() => onOpen(path)}
      onKeyDown={handleKeyDown}
    >
      <div className="home-entry-card__icon">{icon}</div>
      <div className="home-entry-card__copy">
        <Flex gap={7} align="center" wrap>
          <Title level={4}>{entry.name}</Title>
          {status.tag ? <Tag color={status.color}>{status.tag}</Tag> : null}
        </Flex>
        <Text type="secondary">{status.description || entry.description || '進入查看項目內容'}</Text>
      </div>
      <ArrowRightOutlined className="home-entry-card__arrow" />
    </Card>
  );
}

function getEntryStatus(runtimeStatus: ReturnType<typeof getClientRuntimeStatus> | null) {
  if (!runtimeStatus) return { tag: '', color: undefined, description: '' };
  if (runtimeStatus.state === 'ready') {
    return {
      tag: `${runtimeStatus.runnablePageCount} 頁`,
      color: 'processing' as const,
      description: '',
    };
  }
  if (runtimeStatus.state === 'index-missing') {
    return { tag: '索引異常', color: 'error' as const, description: '頁面運行索引尚未生成' };
  }
  return { tag: '暫無頁面', color: undefined, description: '該客戶端尚未啓用可運行頁面' };
}
