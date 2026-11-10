import { LoadingStage } from '@preview/ui/loading';
/** UIARC layout adapter: anonymous discovery and authorized preview/source/PRD.
 * Administrator routes keep the existing Rental OS frame and identity service. */
import {
  lazy,
  Suspense,
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  type ReactNode,
} from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Eye,
  FileText,
  Layers3,
  LockKeyhole,
  Maximize2,
  Menu,
  Search,
  SlidersHorizontal,
  Smartphone,
  X,
  Scan,
  Check,
  ArrowUp,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  SiteFrame,
  ThemeDrawer,
  SITE_ACCENTS,
  SiteThemeSwitch,
  siteMotionTokens,
  NavigationDrawer,
} from '@preview/ui';
import { useAppearancePreferences } from '@/features/appearance/appearance-preferences';
import { usePlatformTheme } from '@/features/theme/platform-theme';
import { NativeAuthProvider, useNativeAuth } from '@/features/platform/platform-api';
import { useCollaboration, usePresentation } from '@/features/platform/CollaborationRoom';
import { safeReturnTo, loginRoute } from '@/features/platform/login-route';
import { createNativeClient } from '../../../../../packages/platform-client/src/client';
import type { ComponentRegistryReference } from '../../../../../packages/platform-contracts/src/component-registry';
import type { MarkdownHeading } from '@/features/docs/markdown';
import { prepareShowcaseRoute, useTocNavigation } from './toc-navigation';
import { siteGuides } from './site-guides';
import { LocalizedView, useShowcaseText } from './showcase-locale';
import { PageActions } from './PageActions';
import { SourcePanel } from './SourcePanel';
import { RegistryPanel } from './RegistryPanel';
import { FullscreenPreview } from './FullscreenPreview';
import { SiteLanding } from './SiteLanding';
import { CatalogFilters } from './CatalogFilters';
import { SiteDocumentation } from './SiteDocumentation';
import { RuntimePage } from './RuntimePage';
import { SidebarSelection } from './SidebarSelection';
import { TocSelection } from './TocSelection';
import { SiteChangelog } from './SiteChangelog';
import { SiteAccountMenu } from './SiteAccountMenu';
import { SiteLanguageMenu } from './SiteLanguageMenu';
import { SITE_CHANGELOG } from './site-changelog';
import { SiteProjectMenu } from './SiteProjectMenu';
import { SiteCollaboration, SiteCollaborationControls } from './SiteCollaboration';
import { changeSiteTheme, type ThemeTransitionState } from './site-theme-transition';
import { flushSync } from 'react-dom';
import { AnimatedPanel } from './AnimatedPanel';
import { documentDisplay } from './document-display';
import { DevicePreview } from './DevicePreview';
import { useShowcaseProjects, useShowcasePages, type CatalogPage } from './showcase-catalog';
import { isDemoRoute } from '@/features/demo/demo-routes';

const Reader = lazy(() =>
  import('@/features/docs/MarkdownReader').then((module) => ({ default: module.MarkdownReader })),
);
const Login = lazy(() => import('./SiteLogin').then((module) => ({ default: module.SiteLogin })));
const DemoApp = lazy(() => import('@/features/demo/DemoApp'));
const NativeAdministration = lazy(() =>
  import('@/features/platform/PlatformApp').then((module) => ({
    default: module.NativeAdministration,
  })),
);
const Password = lazy(() =>
  import('@/features/platform/PasswordForm').then((module) => ({ default: module.PasswordForm })),
);
const publicClient = createNativeClient();
const RequirementGraphPage = lazy(() => import('./RequirementGraphPage'));
interface PageDetail extends CatalogPage {
  registry?: ComponentRegistryReference | null;
  entry: string;
  styles: string[];
  markdown: string;
  summaryMarkdown?: string;
  summaryPath?: string | null;
  contentRevision: string;
  documents: { id: string; title: string; path: string }[];
}
const pageLink = (page: CatalogPage) => `/pages/${page.projectId}/${page.clientId}/${page.pageKey}`;
const pageApi = (page: CatalogPage) => `/showcase/${page.projectId}/${page.clientId}/${page.pageKey}`;
const spring = siteMotionTokens.spring.snappy;
function SidebarSection({
  title,
  count,
  icon,
  children,
}: {
  title: string;
  count?: number;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const reduced = useReducedMotion();
  return (
    <section className="library-sidebar_section__oQ3xJ">
      <button
        className="library-sidebar_sectionHead___A06N"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="library-sidebar_sectionIcon__ii8U0">{icon}</span>
        <span className="library-sidebar_sectionLabel__pIIq3">{title}</span>
        {count !== undefined && (
          <span className="library-sidebar_sectionCount__lRg1z">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={count}
                initial={reduced ? false : { y: 7, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: reduced ? 0 : -7, opacity: 0 }}
                transition={reduced ? { duration: 0 } : spring}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </span>
        )}
        <motion.span
          className="library-sidebar_chevron__Fc20n"
          animate={{ rotate: open ? 0 : -90 }}
          transition={reduced ? { duration: 0 } : spring}
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: 'clip' }}
            animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
            exit={{ height: 0, opacity: 0, overflow: 'clip' }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    height: siteMotionTokens.spring.smooth,
                    opacity: { duration: 0.18, ease: [...siteMotionTokens.ease.standard] },
                  }
            }
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function CopyActions({ detail }: { detail: PageDetail }) {
  const markdownUrl = `/api/native${pageApi(detail)}/markdown`;
  return (
    <PageActions
      markdown={detail.markdown}
      markdownUrl={markdownUrl}
      projectId={detail.projectId}
      pageUrl={`${location.origin}/#${pageLink(detail)}`}
      publicPage={detail.access === 'public'}
    />
  );
}
export function Detail({ page }: { page: CatalogPage }) {
  const text = useShowcaseText();
  const route = useLocation();
  const routeKey = route.key;
  const parameters = new URLSearchParams(route.search);
  const [documentSelection, setDocumentSelection] = useState<{ route: string; path: string | null; anchor?: string } | null>(null);
  const requestedDocument = documentSelection?.route === route.key ? documentSelection.path : parameters.get('document');
  const documentAnchor = documentSelection?.route === route.key ? documentSelection.anchor : parameters.get('anchor') ?? undefined;
  const clearDocument = () => setDocumentSelection({ route: route.key, path: null });
  const [linkCopied, setLinkCopied] = useState(false);
  const reduced = useReducedMotion();
  const enterPart = (delay: number) => ({
    initial: reduced ? (false as const) : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: reduced
      ? { duration: 0 }
      : {
          opacity: {
            duration: 0.34,
            delay,
            ease: [...siteMotionTokens.ease.enter] as [number, number, number, number],
          },
          y: { ...siteMotionTokens.spring.smooth, delay },
        },
  });
  const { session } = useNativeAuth();
  const query = useQuery<PageDetail>({
    queryKey: ['showcase-detail', session?.user?.id, session?.user?.revision, pageLink(page)],
    queryFn: () => publicClient.request(pageApi(page)),
    enabled: page.allowed,
    retry: false,
    refetchInterval: 5000,
  });
  const [tabSelection, setTabSelection] = useState<{ route: string; tab: 'preview' | 'document' | 'source' } | null>(null);
  const requestedTab = tabSelection?.route === route.key ? tabSelection.tab : parameters.has('document') ? 'document' : 'preview';
  const setTab = (tab: 'preview' | 'document' | 'source') => setTabSelection({ route: route.key, tab });
  const [mobile, setMobile] = useState(false),
    [expanded, setExpanded] = useState(false);
  const nativePreview = useRef<HTMLDivElement | null>(null);
  const [fullscreenBounds, setFullscreenBounds] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    borderRadius: number;
  } | null>(null);
  const [reservedHeight, setReservedHeight] = useState<number>();
  const [headings, setHeadings] = useState<MarkdownHeading[]>([]);
  const { active: activeHeading, scrollTo } = useTocNavigation([
    'preview',
    ...headings.map((heading) => heading.id),
  ]);
  const updateHeadings = useCallback(
    (next: MarkdownHeading[]) =>
      setHeadings((previous) =>
        previous.length === next.length &&
        previous.every(
          (heading, index) =>
            heading.id === next[index].id &&
            heading.text === next[index].text &&
            heading.level === next[index].level,
        )
          ? previous
          : next,
      ),
    [],
  );
  const resolveAsset = useCallback(
    (file: string) =>
      `/api/native/showcase/${page.projectId}/${page.clientId}/${page.pageKey}/asset?path=${encodeURIComponent(file)}`,
    [page.projectId, page.clientId, page.pageKey],
  );
  const source = useQuery<{ fileName: string; source: string }>({
    queryKey: ['showcase-source', session?.user?.id, pageLink(page)],
    queryFn: () => publicClient.request(`${pageApi(page)}/source`),
    enabled: requestedTab === 'source' && page.allowed && Boolean(query.data),
    retry: false,
  });
  const detail = query.data;
  const permitted = page.allowed && !query.error;
  const display = useMemo(
    () => documentDisplay(detail?.markdown ?? '', detail?.summaryMarkdown),
    [detail?.markdown, detail?.summaryMarkdown],
  );
  const documentTab = display.long && permitted;
  const collaboration = useCollaboration();
  const following = usePresentation()?.following;
  const tab =
    !permitted || following || (requestedTab === 'document' && !documentTab) ? 'preview' : requestedTab;
  const readingFullDocument = documentTab && tab === 'document';
  const linkedDocument = useQuery<{ path: string; title: string; markdown: string }>({
    queryKey: ['showcase-linked-document', session?.user?.id, session?.user?.revision, pageLink(page), requestedDocument, detail?.contentRevision],
    queryFn: () => publicClient.request(`${pageApi(page)}/document?path=${encodeURIComponent(requestedDocument!)}`),
    enabled: permitted && readingFullDocument && Boolean(requestedDocument),
    retry: false,
  });
  const readDocument = useCallback((path: string, anchor?: string) => {
    setDocumentSelection({ route: routeKey, path, anchor });
    setTabSelection({ route: routeKey, tab: 'document' });
  }, [routeKey, setDocumentSelection, setTabSelection]);
  const detailPath = pageLink(page);
  const documentUrl = useCallback((path: string, anchor?: string) =>
    `#${detailPath}?document=${encodeURIComponent(path)}${anchor ? `&anchor=${encodeURIComponent(anchor)}` : ''}`,
  [detailPath]);
  useEffect(() => {
    if (tab !== 'preview' || !permitted) collaboration?.room.pointer(null);
  }, [tab, permitted, collaboration?.room]);
  const authError = page.allowed
    ? query.error?.message
    : session?.user
      ? '尚未获得此页面授权，请联系管理员。'
      : '此页面需要登录，并由管理员授权后查看。';
  return (
    <LocalizedView>
      <main className="page_content__xGn__">
        <div className="docs_docLayout__YK0uB">
          <article className="docs_docMain__jK5Ve">
            <motion.nav className="docs_breadcrumb__JFHCC" aria-label="当前位置" {...enterPart(0.02)}>
              <Link to="/pages">{page.category || page.clientName}</Link>
              <ChevronRight size={13} />
              <span>{page.title}</span>
            </motion.nav>
            <motion.header className="docs_header__0YD_z" {...enterPart(0.07)}>
              <div className="docs_headerCopy__ZDQWU">
                <div className="docs_titleRow__nNp4A">
                  <h1>{page.title}</h1>
                  {page.access === 'restricted' && (
                    <span className="docs_headerBadge__QRHNu">
                      <LockKeyhole size={12} />
                      需授权
                    </span>
                  )}
                </div>
                <p>
                  {page.clientName} · {page.category || '功能页面'}
                </p>
                <div className="docs_headerRow__PPJjT">
                  <div className="docs_quickInstall__r3nha">
                    <span className="docs_prompt__CWFJA" aria-hidden="true">
                      ›
                    </span>
                    <code>
                      {page.clientId}/{page.pageKey}
                    </code>
                    <button
                      type="button"
                      className="docs_copy__At0Np docs_copyIconOnly__X5yic"
                      aria-label={text('复制页面链接')}
                      onClick={() =>
                        void navigator.clipboard.writeText(`${location.origin}/#${pageLink(page)}`).then(
                          () => setLinkCopied(true),
                          () => setLinkCopied(false),
                        )
                      }
                    >
                      {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
              {detail && permitted && <CopyActions detail={detail} />}
            </motion.header>
            <motion.section id="preview" className="docs_previewSection__Zbh1s" {...enterPart(0.12)}>
              <div className="docs_viewBar__TMird">
                <div
                  className="docs_viewTabs__swfjS"
                  role="tablist"
                  aria-label="页面展示方式"
                  onKeyDown={(event) => {
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                    const buttons = [
                      ...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
                    ];
                    const index = buttons.indexOf(event.target as HTMLButtonElement);
                    if (index < 0) return;
                    event.preventDefault();
                    const next =
                      event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? buttons.length - 1
                          : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
                    buttons[next].click();
                    buttons[next].focus();
                  }}
                >
                  <button
                    role="tab"
                    aria-selected={tab === 'preview'}
                    tabIndex={tab === 'preview' ? 0 : -1}
                    onClick={() => setTab('preview')}
                  >
                    <span>
                      <Eye size={14} />
                      预览
                    </span>
                    {tab === 'preview' && (
                      <motion.i
                        layoutId="showcase-preview-tab"
                        transition={reduced ? { duration: 0 } : spring}
                        className="docs_viewIndicator__NIPRK"
                      />
                    )}
                  </button>
                  {documentTab && (
                    <button
                      role="tab"
                      aria-selected={tab === 'document'}
                      disabled={following}
                      tabIndex={tab === 'document' ? 0 : -1}
                      onClick={() => setTab('document')}
                    >
                      <span>
                        <FileText size={14} />
                        文档
                      </span>
                      {tab === 'document' && (
                        <motion.i
                          layoutId="showcase-preview-tab"
                          transition={reduced ? { duration: 0 } : spring}
                          className="docs_viewIndicator__NIPRK"
                        />
                      )}
                    </button>
                  )}
                  <button
                    role="tab"
                    aria-selected={tab === 'source'}
                    tabIndex={tab === 'source' ? 0 : -1}
                    disabled={!permitted || following}
                    onClick={() => setTab('source')}
                  >
                    <span>
                      <Code2 size={14} />
                      页面源码
                    </span>
                    {tab === 'source' && (
                      <motion.i
                        layoutId="showcase-preview-tab"
                        transition={reduced ? { duration: 0 } : spring}
                        className="docs_viewIndicator__NIPRK"
                      />
                    )}
                  </button>
                </div>
                <div className="docs_viewTools___VpV2">
                  {permitted && <SiteCollaborationControls />}
                  {tab === 'preview' && (
                    <div className="preview-shell_tools___wPkm">
                      <div className="preview-shell_switch__v2Veh" role="radiogroup" aria-label="预览尺寸">
                        {[
                          { label: '自适应预览', value: false, icon: <Scan size={14} /> },
                          { label: '窄屏预览', value: true, icon: <Smartphone size={14} /> },
                        ].map((item) => (
                          <button
                            key={item.label}
                            className="preview-shell_option__gxVA2"
                            role="radio"
                            aria-label={item.label}
                            aria-checked={mobile === item.value}
                            onClick={() => setMobile(item.value)}
                          >
                            {mobile === item.value && (
                              <motion.span
                                className="preview-shell_highlight__cOThZ"
                                layoutId="preview-size"
                                transition={reduced ? { duration: 0 } : spring}
                              />
                            )}
                            {item.icon}
                          </button>
                        ))}
                      </div>
                      <button
                        className="preview-shell_expand__fXEJp"
                        aria-label="放大预览"
                        disabled={!permitted}
                        onClick={() => {
                          const rect = nativePreview.current?.parentElement?.getBoundingClientRect();
                          if (rect) {
                            setFullscreenBounds({
                              top: rect.top,
                              left: rect.left,
                              width: rect.width,
                              height: rect.height,
                              borderRadius: 26,
                            });
                            setReservedHeight(rect.height);
                          }
                          setExpanded(true);
                        }}
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <AnimatedPanel>
                <div
                  hidden={tab !== 'preview'}
                  className={`docs_canvas__hFCST showcase-preview${mobile ? ' mobile' : ''}`}
                  style={{ minHeight: reservedHeight }}
                >
                  <div ref={nativePreview} className="showcase-native-mount">
                    <DevicePreview mobile={mobile} maxWidth={expanded ? 410 : 332}>
                      {!permitted ? (
                        <div className="showcase-lock">
                          <LockKeyhole size={30} />
                          <h2>需要页面授权</h2>
                          <p>{authError}</p>
                          {!session?.user && (
                            <Link
                              className="showcase-button primary"
                              to={`/login?returnTo=${encodeURIComponent(pageLink(page))}`}
                            >
                              登录查看
                            </Link>
                          )}
                        </div>
                      ) : query.isPending ? (
                        <LoadingStage label="读取页面…" />
                      ) : detail ? (
                        <div data-prototype-canvas={tab === 'preview' || undefined}>
                          <RuntimePage
                            key={detail.contentRevision}
                            entry={detail.entry}
                            styles={detail.styles}
                          />
                        </div>
                      ) : null}
                    </DevicePreview>
                  </div>
                </div>
                {tab === 'source' &&
                  (source.error ? (
                    <p className="showcase-error">{source.error.message}</p>
                  ) : source.data ? (
                    <>
                      {detail?.registry && (
                        <RegistryPanel
                          key={detail.registry.url}
                          url={detail.registry.url}
                          kind={detail.registry.kind}
                          restricted={page.access === 'restricted'}
                        />
                      )}
                      <SourcePanel source={source.data.source} fileName={source.data.fileName} />
                    </>
                  ) : (
                    <LoadingStage label="读取页面源码…" />
                  ))}
              </AnimatedPanel>
              {readingFullDocument && detail && (
                <div
                  id="prd"
                  className="showcase-document showcase-document-tab"
                  role="tabpanel"
                  aria-label={text('文档')}
                >
                  {requestedDocument && <div className="showcase-document-summary-head">
                    <button onClick={clearDocument}>
                      <ArrowUp size={14} />{text('返回本页需求')}
                    </button>
                    <span>{linkedDocument.data?.title}</span>
                  </div>}
                  <Suspense fallback={<LoadingStage label="加载业务需求…" />}>
                    <Reader
                      source={requestedDocument ? linkedDocument.data?.markdown ?? '' : detail.markdown}
                      loading={Boolean(requestedDocument) && linkedDocument.isPending}
                      error={requestedDocument ? linkedDocument.error?.message : undefined}
                      layout="site"
                      documentPath={requestedDocument ?? detail.documents[0]?.path ?? 'overview.md'}
                      resolveDocumentUrl={documentUrl}
                      onDocumentNavigate={readDocument}
                      activeAnchor={documentAnchor}
                      onHeadings={updateHeadings}
                      privateAssets
                      resolveAssetUrl={resolveAsset}
                    />
                  </Suspense>
                </div>
              )}
              {detail && permitted && (
                <FullscreenPreview
                  open={expanded}
                  onOpenChange={setExpanded}
                  title={text(page.title)}
                  mobile={mobile}
                  nativeRef={nativePreview}
                  toolbar={<SiteCollaborationControls />}
                  initialBounds={fullscreenBounds}
                  onExitComplete={() => setReservedHeight(undefined)}
                />
              )}
            </motion.section>
            {detail && permitted && !readingFullDocument && (
              <motion.section id="prd" className={`showcase-document${detail.summaryMarkdown ? ' showcase-page-brief' : ''}`} {...enterPart(0.17)}>
                {documentTab && (
                  <div className="showcase-document-summary-head">
                    <span>关键需求</span>
                    <button
                      onClick={() => {
                        clearDocument();
                        setTab('document');
                        scrollTo('preview');
                      }}
                    >
                      查看完整文档 <ChevronRight size={14} />
                    </button>
                  </div>
                )}
                {detail.markdown ? (
                  <Suspense fallback={<LoadingStage label="加载业务需求…" />}>
                    <Reader
                      source={display.summary}
                      loading={false}
                      layout="site"
                      documentPath={detail.summaryPath ?? detail.documents[0]?.path ?? 'overview.md'}
                      resolveDocumentUrl={documentUrl}
                      onDocumentNavigate={readDocument}
                      onHeadings={updateHeadings}
                      privateAssets
                      resolveAssetUrl={resolveAsset}
                    />
                  </Suspense>
                ) : (
                  <p className="showcase-muted">此页面尚未关联已发布业务需求。</p>
                )}
              </motion.section>
            )}
            <footer className="showcase-foot">
              <span>Preview · 原型与业务需求</span>
              <span>{detail?.contentRevision.slice(0, 12)}</span>
            </footer>
          </article>
          <aside className="docs_tocRail__mVzSm">
            <nav className="docs_toc__4bz2v" aria-label="本页目录">
              <p className="docs_tocTitle__v_VlL">本页目录</p>
              <TocSelection activeKey={activeHeading}>
                <li>
                  <button
                    aria-current={activeHeading === 'preview' ? 'location' : undefined}
                    onClick={() => scrollTo('preview')}
                  >
                    预览
                  </button>
                </li>
                {permitted &&
                  headings.map((heading) => (
                    <li key={heading.id} data-preserve-language>
                      <button
                        aria-current={activeHeading === heading.id ? 'location' : undefined}
                        onClick={() => scrollTo(heading.id)}
                      >
                        {heading.text}
                      </button>
                    </li>
                  ))}
              </TocSelection>
              <div className="docs_tocFooter__8MA86">
                {detail && permitted && (
                  <a
                    className="docs_tocLink__b4QXL"
                    href={`/api/native${pageApi(page)}/markdown`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileText size={13} />
                    查看 Markdown
                  </a>
                )}
                <button onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' })}>
                  返回顶部 <ArrowUp size={13} />
                </button>
              </div>
            </nav>
          </aside>
        </div>
      </main>
    </LocalizedView>
  );
}
function DirectPage({ path }: { path: string }) {
  const { session } = useNativeAuth();
  const query = useQuery<PageDetail>({
    queryKey: ['showcase-detail', session?.user?.id, session?.user?.revision, path],
    queryFn: () => publicClient.request(`/showcase/${path.slice('/pages/'.length)}`),
    retry: false,
    refetchInterval: 5000,
  });
  if (query.data && !query.error) return <Detail page={{ ...query.data, allowed: true }} />;
  if (query.isPending) return <LoadingStage label="读取页面…" />;
  return (
    <main className="showcase-docs-intro">
      <h1>{query.error?.message ?? '页面不可用'}</h1>
      {!session?.user && (query.error as { status?: number })?.status === 401 && (
        <Link className="showcase-button" to={loginRoute(path)}>
          登录
        </Link>
      )}
    </main>
  );
}
function Site() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false),
    [searchTerm, setSearchTerm] = useState('');
  const [searchContainer, setSearchContainer] = useState<HTMLDivElement | null>(null);
  const text = useShowcaseText();
  const { session, loading } = useNativeAuth();
  const { resolvedMode, setMode } = usePlatformTheme();
  const themeTransition = useRef<ThemeTransitionState>({ generation: 0, active: null });
  const changeTheme = useCallback(
    (dark: boolean, trigger?: HTMLElement) => {
      if (dark === (resolvedMode === 'dark')) return;
      const rectangle = trigger?.getBoundingClientRect();
      changeSiteTheme({
        document,
        state: themeTransition.current,
        update: () => flushSync(() => setMode(dark ? 'dark' : 'glass')),
        reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        wipe: window.location.hash === '#/' ? 'split' : 'rise',
        origin: rectangle
          ? { x: rectangle.left + rectangle.width / 2, y: rectangle.top + rectangle.height / 2 }
          : undefined,
      });
    },
    [resolvedMode, setMode],
  );
  useEffect(
    () => () => {
      themeTransition.current.generation++;
      themeTransition.current.active?.skipTransition();
      themeTransition.current.active = null;
      delete document.documentElement.dataset.previewThemeMotion;
    },
    [],
  );
  const { preferences, save } = useAppearancePreferences();
  const accent =
    SITE_ACCENTS.find((item) => item.color.toLowerCase() === preferences.themeColor.toLowerCase())?.key ??
    'neutral';
  const location = useLocation();
  const administration =
    location.pathname.startsWith('/manage') ||
    location.pathname.startsWith('/projects') ||
    location.pathname === '/documents' ||
    /^\/center(?:\/|$)/.test(location.pathname) ||
    location.pathname.startsWith('/p/') ||
    location.pathname === '/login' ||
    isDemoRoute(location.pathname);
  useLayoutEffect(() => {
    if (!administration) prepareShowcaseRoute();
  }, [location.pathname, administration]);
  useLayoutEffect(() => {
    if (administration) return;
    const previous = document.body.dataset.previewView;
    document.body.dataset.previewView = 'showcase';
    return () => {
      if (previous === undefined) delete document.body.dataset.previewView;
      else document.body.dataset.previewView = previous;
    };
  }, [administration]);
  const [filter, setFilter] = useState(''),
    [tier, setTier] = useState('all'),
    [mobileOpen, setMobileOpen] = useState(false),
    [appearance, setAppearance] = useState(false),
    [accessibleOnly, setAccessibleOnly] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width:761px)');
    const closeWhenDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener('change', closeWhenDesktop);
    return () => desktop.removeEventListener('change', closeWhenDesktop);
  }, []);
  const navigationTrigger = useRef<HTMLButtonElement>(null),
    appearanceTrigger = useRef<HTMLButtonElement>(null);
  const projectCatalog = useShowcaseProjects(!administration);
  const displayedProject =
    /^\/pages\/([a-z0-9-]+)\//.exec(location.pathname)?.[1] ??
    new URLSearchParams(location.search).get('project') ??
    projectCatalog.data?.projects[0]?.id ??
    '';
  const catalog = useShowcasePages(displayedProject, !administration);
  useEffect(() => {
    if (administration) return;
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, [administration]);
  const pages = catalog.data?.pages ?? [];
  const selected = pages.find((page) => pageLink(page) === location.pathname);
  const visible = pages.filter(
    (page) =>
      `${page.title} ${page.projectName} ${page.category}`.toLowerCase().includes(filter.toLowerCase()) &&
      (tier === 'all' || page.access === tier) &&
      (!accessibleOnly || page.allowed),
  );
  const groups = [...new Set(visible.map((page) => page.category || page.clientName))];
  const first = visible[0] ?? pages[0];
  const isDocs = location.pathname.startsWith('/docs');
  const home = location.pathname === '/';
  const changeProject = (value: string) => {
    setFilter('');
    setMobileOpen(false);
    const params = new URLSearchParams(location.search);
    params.set('project', value);
    navigate(`${home || isDocs ? location.pathname : '/pages'}?${params}`);
  };
  const demoLogin = loginRoute(
    `/demo${displayedProject ? `?project=${encodeURIComponent(displayedProject)}` : ''}`,
  );
  const header = (
    <>
      <button
        ref={navigationTrigger}
        className="showcase-icon-button showcase-mobile-nav"
        aria-label="打开页面导航"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu size={18} />
      </button>
      <Link className={home ? 'site-nav_brand__GnbJw' : 'page_brand__CmA8v'} to="/">
        <Layers3 size={26} />
        <span>Preview</span>
      </Link>
      <nav className={home ? 'site-nav_desktopNav__a6XFI' : 'page_topNav__z05cm'} aria-label="主导航">
        <Link to={first ? pageLink(first) : '/pages'} aria-current={!home && !isDocs ? 'page' : undefined}>
          产品
        </Link>
        <Link
          to={`/docs${displayedProject ? `?project=${encodeURIComponent(displayedProject)}` : ''}`}
          aria-current={isDocs ? 'page' : undefined}
        >
          文档
        </Link>
        <Link to={`/docs/ai${displayedProject ? `?project=${encodeURIComponent(displayedProject)}` : ''}`}>
          AI 接入
        </Link>
        <Link to={demoLogin}>Try the demo</Link>
        {session?.user?.role === 'admin' && <Link to="/manage/projects">管理后台</Link>}
      </nav>
      <div className={home ? 'site-nav_headerActions__pddgO' : 'page_topActions__2fJLa'}>
        <SiteLanguageMenu />
        <button
          className="global-command-menu_launcher__grAw_ showcase-search-launch"
          onClick={() => setSearchOpen(true)}
        >
          <Search size={15} />
          搜索<kbd>⌘ K</kbd>
        </button>
        <div className="page_appearanceGroup__cgwCx">
          <button
            className="page_customizeButton__RKmW3"
            ref={appearanceTrigger}
            aria-label="外观设置"
            onClick={() => setAppearance(!appearance)}
          >
            <SlidersHorizontal size={15} />
            <span className="showcase-appearance-label">外观</span>
          </button>
          <SiteThemeSwitch
            theme={resolvedMode === 'dark' ? 'dark' : 'light'}
            variant="rise"
            iconOnly
            label={text('切换深浅色')}
            onThemeChange={(next, _variant, trigger) => changeTheme(next === 'dark', trigger)}
          />
        </div>
        {session?.user ? (
          <SiteAccountMenu />
        ) : (
          <Link className={home ? 'site-nav_accountLink__AXwZH' : 'get-pro-link_link__xOfqc'} to="/login">
            登录
          </Link>
        )}
      </div>
    </>
  );
  const sidebar = (
    <div className="library-sidebar_panel__R3xBf">
      <SiteProjectMenu
        projects={projectCatalog.data?.projects ?? []}
        value={displayedProject}
        onChange={changeProject}
      />
      <Link className="showcase-demo-navigation" to={demoLogin}>
        Try the demo
      </Link>
      <CatalogFilters
        inputRef={searchInput}
        search={filter}
        onSearch={setFilter}
        tier={tier}
        onTier={setTier}
        accessible={accessibleOnly}
        onAccessible={setAccessibleOnly}
      />
      <SidebarSelection activeKey={location.pathname}>
        <SidebarSection title="文档" icon={<BookOpen size={15} strokeWidth={1.75} />}>
          <nav className="library-sidebar_sectionBody__qECt_">
            <div className="library-sidebar_rows__muylU">
              {siteGuides.map((guide) => (
                <Link
                  key={guide.path}
                  className="library-sidebar_row__aE5SY"
                  to={`${guide.path}${displayedProject ? `?project=${encodeURIComponent(displayedProject)}` : ''}`}
                  data-sidebar-key={guide.path}
                  onClick={() => setMobileOpen(false)}
                  aria-current={location.pathname === guide.path ? 'page' : undefined}
                >
                  <span className="library-sidebar_label__EP9jR">{guide.title}</span>
                </Link>
              ))}
            </div>
          </nav>
        </SidebarSection>
        {groups.map((group) => (
          <SidebarSection
            key={group}
            title={group}
            count={pages.filter((page) => (page.category || page.clientName) === group).length}
            icon={<Layers3 size={15} strokeWidth={1.75} />}
          >
            <nav className="library-sidebar_sectionBody__qECt_" aria-label={group}>
              <div className="library-sidebar_rows__muylU">
                {visible
                  .filter((page) => (page.category || page.clientName) === group)
                  .map((page) => (
                    <Link
                      key={pageLink(page)}
                      to={pageLink(page)}
                      onClick={() => setMobileOpen(false)}
                      aria-current={selected && pageLink(page) === pageLink(selected) ? 'page' : undefined}
                      className="library-sidebar_row__aE5SY"
                      data-sidebar-key={pageLink(page)}
                    >
                      <span className="library-sidebar_label__EP9jR">{page.title}</span>
                      {page.access === 'restricted' && (
                        <span className="library-sidebar_pro__c08K_">授权</span>
                      )}
                    </Link>
                  ))}
              </div>
            </nav>
          </SidebarSection>
        ))}
        {catalog.error && <p className="showcase-error">{catalog.error.message}</p>}
        {!catalog.isPending && !visible.length && <p className="showcase-muted">没有匹配页面</p>}
      </SidebarSelection>
      <div className="library-sidebar_footer__92pu1">
        <Link className="library-sidebar_whatsNew__j_D2O" to="/docs/changelog">
          <span className="library-sidebar_whatsNewDot__vCkUh" />
          <span className="library-sidebar_whatsNewLabel__dPHge">更新日志</span>
          <span className="library-sidebar_whatsNewCount__RXAuH">
            {SITE_CHANGELOG[0].changes.length} {text('项更新')}
          </span>
          <ChevronRight size={14} className="library-sidebar_whatsNewArrow__yV6fC" />
        </Link>
      </div>
    </div>
  );
  if (isDemoRoute(location.pathname))
    return (
      <Suspense fallback={<LoadingStage scope="screen" />}>
        <DemoApp />
      </Suspense>
    );
  if (
    location.pathname.startsWith('/manage') ||
    location.pathname.startsWith('/projects') ||
    location.pathname === '/documents' ||
    /^\/center(?:\/|$)/.test(location.pathname) ||
    location.pathname.startsWith('/p/')
  )
    return (
      <Suspense fallback={<LoadingStage scope="screen" />}>
        <NativeAdministration />
      </Suspense>
    );
  if (location.pathname === '/login') {
    const returnTo = new URLSearchParams(location.search).get('returnTo');
    if (session?.user?.mustChangePassword) return <Password required />;
    if (session?.user)
      return (
        <Navigate
          to={
            safeReturnTo(returnTo)
              ? safeReturnTo(returnTo)!
              : session.user.role === 'admin'
                ? '/manage/projects'
                : '/pages'
          }
          replace
        />
      );
    return (
      <Suspense fallback={<LoadingStage scope="screen" />}>
        <Login />
      </Suspense>
    );
  }
  return (
    <LocalizedView>
      <div
        onClickCapture={(event) => {
          if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.defaultPrevented
          )
            return;
          const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#/"]');
          if (link && link.getAttribute('href')?.split('?')[0] !== `#${location.pathname}`)
            prepareShowcaseRoute();
        }}
      >
        <SiteFrame
          header={header}
          sidebar={home || location.pathname === '/docs/graph' ? undefined : sidebar}
          dark={resolvedMode === 'dark'}
          accent={accent}
          themeColor={preferences.themeColor}
          landing={home}
          announcement={
            <Link to="/docs/ai" className="site-nav_announcementLink__Uxe3e">
              <span>{text('全新 AI 工程治理：Agent 接入即遵循规范。')}</span>
              <span className="site-nav_announcementExplore___RJ2f">
                {text('了解更多')}
                <ChevronRight size={14} />
              </span>
            </Link>
          }
        >
          <NavigationDrawer
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            title={text('页面导航')}
            closeLabel={text('关闭页面导航')}
            restoreFocus={() => navigationTrigger.current?.focus()}
          >
            <div
              onClick={(event) => {
                if ((event.target as Element).closest('a')) setMobileOpen(false);
              }}
            >
              {sidebar}
            </div>
          </NavigationDrawer>
          <div ref={setSearchContainer} className="showcase-search-portal" />
          <DialogPrimitive.Root open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogPrimitive.Portal container={searchContainer}>
              <DialogPrimitive.Overlay className="showcase-search-overlay" />
              <DialogPrimitive.Content className="showcase-search-dialog" aria-describedby={undefined}>
                <DialogPrimitive.Title className="showcase-sr-only">{text('搜索页面')}</DialogPrimitive.Title>
                <div className="showcase-search-input">
                  <Search size={18} />
                  <input
                    autoFocus
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={text('搜索页面')}
                    aria-label={text('搜索页面')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        const first = pages.find((page) =>
                          `${page.title} ${page.category} ${text(page.title)} ${text(page.category)}`
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                        );
                        if (first) {
                          navigate(pageLink(first));
                          setSearchOpen(false);
                        }
                      }
                    }}
                  />
                  <DialogPrimitive.Close className="showcase-icon-button" aria-label={text('关闭搜索')}>
                    <X size={15} />
                  </DialogPrimitive.Close>
                </div>
                <div className="showcase-search-results">
                  {pages
                    .filter((page) =>
                      `${page.title} ${page.category} ${text(page.title)} ${text(page.category)}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                    )
                    .map((page) => (
                      <button
                        key={pageLink(page)}
                        className="showcase-search-result"
                        onClick={() => {
                          navigate(pageLink(page));
                          setSearchOpen(false);
                          setSearchTerm('');
                        }}
                      >
                        <FileText size={16} />
                        <span>
                          {text(page.title)}
                          <small>{text(page.category)}</small>
                        </span>
                        {page.access === 'restricted' && <LockKeyhole size={14} />}
                      </button>
                    ))}
                </div>
                <div className="showcase-search-footer">{text('Enter 打开 · Escape 关闭')}</div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
          <ThemeDrawer
            open={appearance}
            onOpenChange={setAppearance}
            accent={accent}
            dark={resolvedMode === 'dark'}
            onAccent={(themeColor) => save({ themeColor })}
            onTheme={(dark) => changeTheme(dark, appearanceTrigger.current ?? undefined)}
            text={text}
            restoreFocus={() => appearanceTrigger.current?.focus()}
          />
          <SiteCollaboration page={catalog.error ? undefined : selected}>
            <div className="showcase-route-view" key={location.pathname}>
              {home ? (
                <SiteLanding
                  pages={pages}
                  projectMenu={
                    <SiteProjectMenu
                      projects={projectCatalog.data?.projects ?? []}
                      value={displayedProject}
                      onChange={changeProject}
                      placement="inline"
                    />
                  }
                />
              ) : location.pathname === '/docs/changelog' ? (
                <SiteChangelog />
              ) : location.pathname === '/docs/graph' ? (
                <RequirementGraphPage
                  key={displayedProject}
                  projectId={displayedProject}
                  projectMenu={
                    <SiteProjectMenu
                      projects={projectCatalog.data?.projects ?? []}
                      value={displayedProject}
                      onChange={changeProject}
                    />
                  }
                />
              ) : isDocs ? (
                <SiteDocumentation key={location.pathname} path={location.pathname} pages={pages} />
              ) : selected ? (
                <Detail key={`${pageLink(selected)}/${session?.user?.id ?? 'anonymous'}`} page={selected} />
              ) : /^\/pages\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/.test(location.pathname) ? (
                <DirectPage path={location.pathname} />
              ) : (catalog.isPending && Boolean(displayedProject)) || projectCatalog.isPending || loading ? (
                <LoadingStage label="读取原型目录…" />
              ) : catalog.error || projectCatalog.error ? (
                <main className="showcase-error">{(catalog.error ?? projectCatalog.error)?.message}</main>
              ) : first && location.pathname === '/pages' ? (
                <Navigate to={pageLink(first)} replace />
              ) : (
                <main className="showcase-docs-intro">
                  <h1>{location.pathname.startsWith('/pages/') ? '页面不存在或已下架' : '暂无可展示页面'}</h1>
                  <p>
                    {location.pathname.startsWith('/pages/')
                      ? '请从左侧选择可用页面，或联系管理员核对页面状态。'
                      : '管理员可在现有后台创建项目、配置页面及访问范围。'}
                  </p>
                  {session?.user?.role === 'admin' && (
                    <Link
                      className="showcase-button"
                      to={
                        displayedProject
                          ? `/projects/${displayedProject}/settings?tab=menus`
                          : '/manage/projects'
                      }
                    >
                      菜单管理
                    </Link>
                  )}
                </main>
              )}
            </div>
          </SiteCollaboration>
        </SiteFrame>
      </div>
    </LocalizedView>
  );
}
export function ShowcaseApp() {
  return (
    <NativeAuthProvider>
      <Site />
    </NativeAuthProvider>
  );
}
