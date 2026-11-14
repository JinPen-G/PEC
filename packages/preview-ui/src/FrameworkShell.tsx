/** Rental OS sidebar composition, with Preview-owned navigation and account ports.
 * Primitives, menu geometry and motion come from the fixed source snapshot. */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Highlight, HighlightItem } from '@animate-ui/react/primitives/effects/highlight';
import { toCssTiming, useTempoTransition } from '@animate-ui/react/utils/motion';
import { motion } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Settings01Icon,
  SunMoonIcon,
  LanguageSkillIcon,
  Logout01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { BookOpen, ChevronDown, ChevronRight, ChevronsUpDown, FileText, LayoutDashboard, PanelLeft, Search } from 'lucide-react';
import { Button as ControlButton } from './admin-controls/runtime/apps/admin/src/components/ui/Button';
import SegmentedControl from '../upstream/rental-admin/packages/ui-arc/vendor/registry/components/segmented-control/segmented-control';
import defaultAvatar from '../upstream/rental-admin/apps/admin/src/assets/default-user-avatar.jpg';
import { useUiEnvironment } from './environment';
import { CONSOLE_SIDEBAR_MOTION } from './console-motion';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarInput,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from './animate-sidebar/runtime/sidebar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from './animate-sidebar/runtime/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from './animate-sidebar/runtime/avatar';
import { TooltipProvider } from './animate-sidebar/runtime/tooltip';
import { Separator } from './animate-sidebar/runtime/separator';

export interface ShellRoute {
  key: string;
  label: string;
  icon: ReactNode;
}
export interface ShellSection {
  key: string;
  label: string;
  icon: ReactNode;
  routes: ShellRoute[];
}
export interface FrameworkShellProps {
  embedded?: boolean;
  compact?: boolean;
  title: string;
  subtitle: string;
  workspaces: { key: string; label: string; icon: ReactNode }[];
  workspaceKey: string;
  onWorkspaceChange: (key: string) => void;
  navigationMode: 'components' | 'admin';
  onNavigationModeChange: (mode: 'components' | 'admin') => void;
  showNavigationModeSwitch?: boolean;
  showAppearanceLink?: boolean;
  showDocumentControl?: boolean;
  brand: ReactNode;
  account: string;
  accountDescription: string;
  sections: ShellSection[];
  selectedKey: string;
  onNavigate: (path: string) => void;
  preference: string;
  onThemeChange: (theme: string) => void;
  locale: string;
  onLocaleChange: (locale: string) => void;
  onLogout?: () => void;
  onPasswordChange?: () => void;
  contextControls?: ReactNode;
  documentAvailable: boolean;
  documentUnavailableReason?: string;
  documentOpen: boolean;
  onDocumentToggle: () => void;
  labels: Record<string, string>;
  children: ReactNode;
}

function Navigation({
  sections,
  selectedKey,
  query,
  onNavigate,
  emptyLabel,
  groupLabel,
  keepEmptySections,
  embedded = false,
}: Pick<FrameworkShellProps, 'sections' | 'selectedKey' | 'onNavigate'> & {
  query: string;
  emptyLabel: string;
  groupLabel: string;
  keepEmptySections: boolean;
  embedded?: boolean;
}) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { reducedMotion } = useUiEnvironment();
  const layoutTransition = useTempoTransition(CONSOLE_SIDEBAR_MOTION.layout);
  const enterTransition = useTempoTransition(CONSOLE_SIDEBAR_MOTION.contentEnter);
  const exitTransition = useTempoTransition(CONSOLE_SIDEBAR_MOTION.contentExit);
  const submenuTransition = { ...layoutTransition, opacity: enterTransition };
  const submenuExitTransition = { ...layoutTransition, opacity: exitTransition };
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [popup, setPopup] = useState<string | null>(null);
  const keyword = query.trim().toLocaleLowerCase();
  const visible = sections
    .map((section) => ({
      ...section,
      routes: section.routes.filter((route) => !keyword || route.label.toLocaleLowerCase().includes(keyword)),
    }))
    .filter((section) => section.routes.length || (keepEmptySections && !keyword));
  const collapsed = !embedded && !isMobile && state === 'collapsed';
  const expanded = (section: ShellSection) =>
    Boolean(
      keyword || (openGroups[section.key] ?? section.routes.some((route) => route.key === selectedKey)),
    );
  const active = visible.find((section) => section.routes.some((route) => route.key === selectedKey));
  const selected = active ? (collapsed || !expanded(active) ? `group:${active.key}` : selectedKey) : null;
  const visit = (key: string) => {
    setPopup(null);
    setOpenMobile(false);
    onNavigate(key);
  };
  return (
    <Highlight
      mode="parent"
      controlledItems
      value={selected}
      enabled={!embedded && selected !== null}
      hover={false}
      click={false}
      containerClassName="rental-sidebar-navigation"
      className="rental-sidebar-route-highlight"
    >
      <SidebarGroup>
        <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
        <SidebarMenu>
          {!visible.length && (
            <li className="preview-menu-empty" role="status">
              {emptyLabel}
            </li>
          )}
          {visible.map((section) => {
            const groupOpen = expanded(section);
            const panelOpen = groupOpen && !collapsed;
            const panelId = `preview-menu-${encodeURIComponent(section.key)}`;
            return (
              <DropdownMenu
                key={section.key}
                modal={false}
                open={collapsed && popup === section.key}
                onOpenChange={(open, details) => {
                  if (!collapsed) { details.cancel(); return; }
                  setPopup(open ? section.key : null);
                }}
              >
                <SidebarMenuItem className="rental-menu-group" data-open={panelOpen || undefined}>
                  <HighlightItem value={`group:${section.key}`} asChild>
                    <div className="rental-sidebar-route-target">
                      <DropdownMenuTrigger
                        aria-label={section.label}
                        aria-expanded={collapsed ? popup === section.key : groupOpen}
                        aria-controls={collapsed ? undefined : panelId}
                        onClick={() => {
                          if (!collapsed) setOpenGroups((groups) => ({ ...groups, [section.key]: !groupOpen }));
                        }}
                        render={<SidebarMenuButton isActive={active?.key === section.key && !panelOpen} />}
                      >
                        {section.icon}
                        <span className="rental-sidebar-label" title={section.label}>{section.label}</span>
                        <ChevronRight size={13} strokeWidth={1.75} className="rental-sidebar-group-chevron" aria-hidden="true" />
                      </DropdownMenuTrigger>
                    </div>
                  </HighlightItem>
                  <motion.div
                    id={panelId}
                    className="rental-sidebar-submenu-motion"
                    role="group"
                    aria-label={section.label}
                    aria-hidden={!panelOpen || undefined}
                    inert={!panelOpen || undefined}
                    data-rail={collapsed || undefined}
                    initial={false}
                    animate={{ height: panelOpen ? 'auto' : 0, opacity: groupOpen ? 1 : 0 }}
                    transition={reducedMotion ? { duration: 0 } : groupOpen ? submenuTransition : submenuExitTransition}
                  >
                    <div className="rental-sidebar-submenu-content">
                      <SidebarMenuSub>
                        {section.routes.map((route) => (
                          <HighlightItem key={route.key} value={route.key} activeClassName="rental-sidebar-sub-highlight" asChild>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                aria-current={route.key === selectedKey ? 'page' : undefined}
                                isActive={route.key === selectedKey}
                                render={<a href={`#${route.key}`} />}
                                onClick={(event) => {
                                  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                                  event.preventDefault();
                                  visit(route.key);
                                }}
                              ><span>{route.label}</span></SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </HighlightItem>
                        ))}
                      </SidebarMenuSub>
                    </div>
                  </motion.div>
                </SidebarMenuItem>
                <DropdownMenuContent
                  className="rental-sidebar-submenu"
                  side="right"
                  align="start"
                  sideOffset={8}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{section.label}</DropdownMenuLabel>
                    {section.routes.map((route) => (
                      <DropdownMenuItem
                        key={route.key}
                        render={<a href={`#${route.key}`} />}
                        onClick={(event) => {
                          if (
                            event.button ||
                            event.metaKey ||
                            event.ctrlKey ||
                            event.shiftKey ||
                            event.altKey
                          )
                            return;
                          event.preventDefault();
                          visit(route.key);
                        }}
                        aria-current={route.key === selectedKey ? 'page' : undefined}
                      >
                        <span>{route.label}</span>
                        {route.key === selectedKey && <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </Highlight>
  );
}

function AccountMenu(props: FrameworkShellProps) {
  const { isMobile } = useSidebar();
  const { labels } = props;
  const identity = (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={defaultAvatar} alt="" />
        <AvatarFallback className="rounded-lg">{props.account.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{props.account}</span>
        <span className="truncate text-xs">{props.accountDescription}</span>
      </div>
    </>
  );
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={labels.account}
            render={
              <SidebarMenuButton
                size="lg"
                className="rental-account-trigger data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            {identity}
            <ChevronsUpDown size={14} strokeWidth={1.75} className="rental-account-chevron" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">{identity}</div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {props.onPasswordChange && (
                <DropdownMenuItem onClick={props.onPasswordChange}>
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
                  {labels.passwordChange}
                </DropdownMenuItem>
              )}
              {props.showAppearanceLink !== false && (
                <DropdownMenuItem onClick={() => props.onNavigate('/manage/appearance')}>
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
                  {labels.appearance}
                </DropdownMenuItem>
              )}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HugeiconsIcon icon={SunMoonIcon} strokeWidth={2} />
                  {labels.theme}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={props.preference} onValueChange={props.onThemeChange}>
                    <DropdownMenuRadioItem value="glass">{labels.light}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">{labels.dark}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">{labels.system}</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HugeiconsIcon icon={LanguageSkillIcon} strokeWidth={2} />
                  {labels.language}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={props.locale} onValueChange={props.onLocaleChange}>
                    <DropdownMenuRadioItem value="zh-Hans">简体中文</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="zh-Hant">繁體中文</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            {props.onLogout && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={props.onLogout}>
                    <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                    {labels.logout}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function ConsoleSidebarHeader({ workspace, query, onQueryChange, labels }: {
  workspace: ReactNode;
  query: string;
  onQueryChange: (value: string) => void;
  labels: Record<string, string>;
}) {
  const { state, isMobile, openMobile, toggleSidebar } = useSidebar();
  const expanded = isMobile ? openMobile : state === 'expanded';
  const collapsed = !isMobile && state === 'collapsed';
  const label = expanded ? labels.collapse : labels.expand;
  const search = useRef<HTMLInputElement>(null);
  const focusSearch = useRef(false);
  useEffect(() => {
    if (expanded && focusSearch.current) {
      focusSearch.current = false;
      search.current?.focus();
    }
  }, [expanded]);
  return <>
    <div className="rental-sidebar-top-row">
      <div className="rental-sidebar-workspace" inert={collapsed || undefined} aria-hidden={collapsed || undefined}>{workspace}</div>
      <SidebarTrigger className="rental-sidebar-top-trigger" aria-label={label}
        aria-expanded={expanded} aria-controls="preview-sidebar-navigation" aria-keyshortcuts="Control+B Meta+B"
        inert={collapsed || undefined} aria-hidden={collapsed || undefined} tabIndex={collapsed ? -1 : undefined}
        title={`${label} (Ctrl / ⌘ B)`}>
        <PanelLeft size={16} strokeWidth={1.75} aria-hidden="true" />
      </SidebarTrigger>
      <button type="button" className="rental-sidebar-rail-trigger" aria-label={labels.expand}
        aria-expanded="false" aria-controls="preview-sidebar-navigation" aria-keyshortcuts="Control+B Meta+B"
        inert={!collapsed || undefined} aria-hidden={!collapsed || undefined} tabIndex={collapsed ? 0 : -1}
        title={`${labels.expand} (Ctrl / ⌘ B)`} onClick={toggleSidebar}>
        <PanelLeft size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
    <div className="rental-sidebar-search-row">
      <SidebarInput ref={search} className="rental-sidebar-search-input" type="search"
        aria-label={labels.search} placeholder={labels.search} value={query}
        inert={collapsed || undefined} aria-hidden={collapsed || undefined} tabIndex={collapsed ? -1 : undefined}
        onChange={(event) => onQueryChange(event.target.value)} />
      <button type="button" className="rental-sidebar-search-trigger" aria-label={labels.search}
        inert={!collapsed || undefined} aria-hidden={!collapsed || undefined} tabIndex={collapsed ? 0 : -1}
        onClick={() => { focusSearch.current = true; toggleSidebar(); }}>
        <Search size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  </>;
}

function ShellContents(props: FrameworkShellProps) {
  const [query, setQuery] = useState('');
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const embeddedSidebarOpen = props.compact ? mobileNavigationOpen : !sidebarHidden;
  const sidebarToggle = <ControlButton type="text" size="small" icon={<PanelLeft size={16} />}
    aria-label={embeddedSidebarOpen ? props.labels.collapse : props.labels.expand}
    aria-expanded={embeddedSidebarOpen}
    onClick={() => props.compact ? setMobileNavigationOpen(!mobileNavigationOpen) : setSidebarHidden(!sidebarHidden)} />;
  const route = props.sections
    .flatMap((section) => section.routes)
    .find((item) => item.key === props.selectedKey);
  const section = props.sections.find((item) => item.routes.some((entry) => entry.key === props.selectedKey));
  useEffect(() => {
    setOpenMobile(false);
  }, [props.selectedKey, setOpenMobile]);
  const brandContent = (
    <>
      <div
        data-sidebar="brand-mark"
        className="flex aspect-square size-8 items-center justify-center rounded-lg"
      >
        {props.brand}
      </div>
      <span className={props.embedded ? 'grid flex-1 text-left text-sm leading-tight' : 'rental-workspace-identity'}>
        <span className={props.embedded ? 'truncate font-medium' : 'rental-workspace-tenant-name'} title={props.title}>{props.title}</span>
        {!props.embedded && <span className="rental-workspace-name" title={props.subtitle}>{props.subtitle}</span>}
      </span>
    </>
  );
  const workspace = <SidebarMenu className="rental-workspace-menu"><SidebarMenuItem>
    {props.workspaces.length < 2 ?
      <SidebarMenuButton size="lg" className="rental-workspace-trigger"
        render={<div role="group" tabIndex={0} aria-label={`${props.title} · ${props.subtitle}`} title={`${props.title} · ${props.subtitle}`} />}>
        {brandContent}
      </SidebarMenuButton> : <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`${props.title} · ${props.subtitle}`} title={`${props.title} · ${props.subtitle}`}
          render={<SidebarMenuButton size="lg" className="rental-workspace-trigger data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground" />}>
          {brandContent}<ChevronDown size={14} strokeWidth={1.75} className="rental-workspace-chevron" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rental-workspace-popup w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          align="start" sideOffset={4} side={isMobile ? 'bottom' : 'right'}>
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">{props.labels.projects}</DropdownMenuLabel>
            {props.workspaces.map((item) => <DropdownMenuItem key={item.key} className="gap-2 p-2"
              aria-label={item.label} aria-current={item.key === props.workspaceKey ? 'true' : undefined}
              onClick={() => { props.onWorkspaceChange(item.key); setQuery(''); setOpenMobile(false); }}>
              <span data-sidebar="workspace-icon" className="flex size-6 shrink-0 items-center justify-center">{item.icon}</span>
              <span className="rental-workspace-option-name">{item.label}</span>
            </DropdownMenuItem>)}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>}
  </SidebarMenuItem></SidebarMenu>;
  return (
    <>
      <Sidebar collapsible={props.embedded ? 'none' : 'icon'}
        transition={props.embedded ? undefined : CONSOLE_SIDEBAR_MOTION.layout}
        className={`rental-sidebar-colors${props.embedded ? ' preview-screen-sidebar' : ''}`}
        hidden={props.embedded && (props.compact ? !mobileNavigationOpen : sidebarHidden)}>
        <SidebarHeader>
          {props.embedded ? <><SidebarMenu>
            <SidebarMenuItem>
              <div className="preview-screen-brand">{brandContent}{sidebarToggle}</div>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarInput
            className="group-data-[collapsible=icon]:hidden"
            type="search"
            aria-label={props.labels.search}
            placeholder={props.labels.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          </> : <ConsoleSidebarHeader workspace={workspace} query={query} onQueryChange={setQuery} labels={props.labels} />}
        </SidebarHeader>
        {props.showNavigationModeSwitch !== false && (
          <div className="operator-mode-switch">
            <div className="operator-mode-expanded">
              <div className="arc-segmented arc-segmented-block">
                <SegmentedControl
                  label={props.labels.workMode}
                  value={props.navigationMode}
                  options={[
                    { label: props.labels.center, value: 'components' },
                    { label: props.labels.admin, value: 'admin' },
                  ]}
                  onValueChange={(value) => {
                    setQuery('');
                    props.onNavigationModeChange(value as 'components' | 'admin');
                  }}
                />
              </div>
            </div>
            <div className="operator-mode-collapsed">
              <button
                type="button"
                className="preview-mode-trigger"
                aria-label={
                  props.navigationMode === 'admin' ? props.labels.switchCenter : props.labels.switchAdmin
                }
                onClick={() =>
                  props.onNavigationModeChange(props.navigationMode === 'admin' ? 'components' : 'admin')
                }
              >
                {props.navigationMode === 'admin' ? <BookOpen size={18} /> : <LayoutDashboard size={18} />}
              </button>
            </div>
          </div>
        )}
        <SidebarContent id={props.embedded ? undefined : 'preview-sidebar-navigation'}>
          <Navigation
            keepEmptySections={props.navigationMode === 'components'}
            groupLabel={
              props.navigationMode === 'components' ? props.labels.center : (props.sections[0]?.label ?? '')
            }
            sections={props.sections}
            embedded={props.embedded}
            selectedKey={props.selectedKey}
            query={query}
            onNavigate={(path) => { setMobileNavigationOpen(false); props.onNavigate(path); }}
            emptyLabel={props.labels.noMenu}
          />
        </SidebarContent>
        <SidebarFooter>
          {props.embedded ? <div className="preview-screen-account">
            <Avatar className="h-8 w-8 rounded-lg"><AvatarImage src={defaultAvatar} alt="" /><AvatarFallback>{props.account.slice(0, 1)}</AvatarFallback></Avatar>
            <span><strong>{props.account}</strong><small>{props.accountDescription}</small></span>
          </div> : <AccountMenu {...props} />}
        </SidebarFooter>
        {!props.embedded && <SidebarRail />}
      </Sidebar>
      {props.embedded && props.compact && mobileNavigationOpen && <button className="preview-screen-navigation-scrim"
        type="button" aria-label={props.labels.collapse} onClick={() => setMobileNavigationOpen(false)} />}
      <SidebarInset className="app-workspace min-h-0">
        <header className="rental-sidebar-colors native-workspace-context preview-context-header">
          <div className="preview-context-location">
            {props.embedded ? (!embeddedSidebarOpen && <div className="preview-screen-compact-brand"><span>{props.title}</span>{sidebarToggle}</div>) : isMobile && <SidebarTrigger
              className="-ml-1"
              aria-label={openMobile ? props.labels.collapse : props.labels.expand}
              aria-expanded={openMobile}
              aria-controls="preview-sidebar-navigation"
            />}
            {!props.embedded && isMobile && <Separator orientation="vertical" className="mr-2 h-4" />}
            <nav aria-label={props.labels.breadcrumb} className="preview-breadcrumb">
              <span>{section?.label ?? props.subtitle}</span>
              <ChevronRight size={13} strokeWidth={1.75} className="preview-breadcrumb-separator" aria-hidden="true" />
              <span aria-current="page">
                {route?.label ??
                  (props.selectedKey === '/manage/appearance'
                    ? props.labels.appearance
                    : props.subtitle)}
              </span>
            </nav>
          </div>
          <div className="preview-context-actions">
            {props.contextControls}
            {props.showDocumentControl !== false && (
              <button
                type="button"
                className="preview-document-trigger"
                disabled={!props.documentAvailable}
                title={
                  !props.documentAvailable
                    ? (props.documentUnavailableReason ?? '本页尚未关联文档')
                    : undefined
                }
                aria-controls="preview-page-document"
                aria-expanded={props.documentOpen}
                onClick={props.onDocumentToggle}
              >
                <FileText size={15} />
                {props.labels.pageDocument}
              </button>
            )}
          </div>
          {!props.embedded && <div className="preview-context-time"><WorkspaceClock locale={props.locale} /></div>}
        </header>
        {props.children}
      </SidebarInset>
    </>
  );
}

/** Original WorkspaceClock: local display only, no server polling. */
function WorkspaceClock({ locale }: { locale: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const language = locale === 'en' ? 'en-US' : locale === 'zh-Hant' ? 'zh-TW' : 'zh-CN';
  return (
    <time className="workspace-clock" dateTime={now.toISOString()}>
      <span className="workspace-clock-date">
        {new Intl.DateTimeFormat(language, { year: 'numeric', month: 'short', day: 'numeric' }).format(now)}
        <span aria-hidden="true"> · </span>
      </span>
      <span>{new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(now)}</span>
    </time>
  );
}

export function FrameworkShell(props: FrameworkShellProps) {
  const { dark, reducedMotion } = useUiEnvironment();
  const sidebarMotion = toCssTiming(useTempoTransition(CONSOLE_SIDEBAR_MOTION.layout));
  const labelMotion = toCssTiming(useTempoTransition(CONSOLE_SIDEBAR_MOTION.label));
  const style = {
    '--sidebar-width': 'var(--rental-sidebar-expanded-width)',
    ...(!props.embedded ? {
      '--rental-sidebar-expanded-width': 'var(--rental-shell-sidebar-width)',
      '--rental-sidebar-collapsed-width': 'var(--rental-shell-sidebar-collapsed-width)',
      '--sidebar-width-icon': 'var(--rental-shell-sidebar-collapsed-width)',
      '--animate-ui-sidebar-duration': `${reducedMotion ? 0 : sidebarMotion.duration}ms`,
      '--animate-ui-sidebar-easing': sidebarMotion.easing,
      '--rental-sidebar-label-duration': `${reducedMotion ? 0 : labelMotion.duration}ms`,
      '--rental-sidebar-label-easing': labelMotion.easing,
    } : {}),
  } as CSSProperties;
  return (
    <TooltipProvider>
      <div className={`preview-native-stage${props.embedded ? ' preview-screen-stage' : ' preview-console-host'}`} data-compact={props.embedded && props.compact || undefined}>
        <div className="app-shell native-admin-shell preview-native-root">
          <SidebarProvider
            animateOnHover={false}
            className={`rental-animate-scope relative h-full min-h-0${dark ? ' dark' : ''}`}
            style={style}
          >
            <ShellContents {...props} />
          </SidebarProvider>
        </div>
      </div>
    </TooltipProvider>
  );
}
