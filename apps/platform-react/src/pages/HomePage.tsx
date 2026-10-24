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
import { useTranslation } from 'react-i18next';

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
import { LanguageControl } from '@/ui/platform/LanguageControl';
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
  const { t } = useTranslation();
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
    document.title = selectedProject
      ? t('home.docTitle.project', { project: selectedProject.name })
      : t('home.docTitle.default');
  }, [selectedProject, t]);

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
        <Text type="secondary">{t('home.loading')}</Text>
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
            ariaLabel={t('home.nav.ariaLabel')}
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
              <span className="home-project-nav__empty">{t('home.nav.empty')}</span>
            )}
          </AnimatedPillNav>

          <span className="home-topbar__divider" aria-hidden="true" />

          <Flex className="home-topbar__actions" gap={4} align="center">
            <ThemeControl />
            <LanguageControl/>
            {showTools ? (
              <>
                <Button
                  type="text"
                  icon={<AppstoreOutlined />}
                  aria-label={t('home.tools.components')}
                  title={t('home.tools.components')}
                  onClick={() => navigate('/components')}
                />
                <Button
                  type="text"
                  icon={<FolderOpenOutlined />}
                  aria-label={t('home.tools.projects')}
                  title={t('home.tools.projects')}
                  onClick={() => navigate('/tools/projects')}
                />
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  aria-label={t('home.tools.console')}
                  title={t('home.tools.console')}
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
            title={t('home.error.title')}
            description={t('home.error.description')}
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
              description={
                projects.length ? t('home.empty.selectHint') : t('home.empty.none')
              }
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
  const { t } = useTranslation();
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
              <Text type="secondary">{project.description || t('home.entry.fallbackDescription')}</Text>
            </div>
          </div>
          <div className="home-project-heading__meta">
            <Tag color="success">{t('home.status.accessible')}</Tag>
            <Text type="secondary">
              {t('home.meta.entryCounts', { product: productEntries.length, docs: documentEntries.length })}
            </Text>
          </div>
        </header>

        <Divider />

        <div className={`home-workspace__body ${documentEntries.length ? 'has-documents' : ''}`}>
          <EntrySection
            title={t('home.section.products')}
            description={t('home.section.productsDescription')}
            entries={productEntries}
            project={project}
            catalog={catalog}
            onOpen={onOpen}
          />
          {documentEntries.length ? (
            <EntrySection
              compact
              title={t('home.section.documents')}
              description={t('home.section.documentsDescription')}
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
  const { t } = useTranslation();
  return (
    <section className={`home-entry-section ${compact ? 'is-compact' : ''}`}>
      <header>
        <div>
          <Title level={3}>{title}</Title>
          <Text type="secondary">{description}</Text>
        </div>
        <Text type="secondary">{t('home.section.count', { count: entries.length })}</Text>
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
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('home.section.empty')} />
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
  const { t } = useTranslation();
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
  const status = getEntryStatus(runtimeStatus, t);

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
        <Text type="secondary">{status.description || entry.description || t('home.entry.viewHint')}</Text>
      </div>
      <ArrowRightOutlined className="home-entry-card__arrow" />
    </Card>
  );
}

function getEntryStatus(
  runtimeStatus: ReturnType<typeof getClientRuntimeStatus> | null,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (!runtimeStatus) return { tag: '', color: undefined, description: '' };
  if (runtimeStatus.state === 'ready') {
    return {
      tag: t('home.entry.pagesTag', { count: runtimeStatus.runnablePageCount }),
      color: 'processing' as const,
      description: '',
    };
  }
  if (runtimeStatus.state === 'index-missing') {
    return {
      tag: t('home.entry.indexErrorTag'),
      color: 'error' as const,
      description: t('home.entry.indexErrorDescription'),
    };
  }
  return {
    tag: t('home.entry.noPagesTag'),
    color: undefined,
    description: t('home.entry.noPagesDescription'),
  };
}
