/** Rental OS sidebar composition, with Preview-owned navigation and account ports.
 * Primitives, menu geometry and motion come from the fixed source snapshot. */
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Highlight, HighlightItem } from '@animate-ui/react/primitives/effects/highlight';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  UnfoldMoreIcon,
  Settings01Icon,
  SunMoonIcon,
  LanguageSkillIcon,
  Logout01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { BookOpen, FileText, LayoutDashboard } from 'lucide-react';
import SegmentedControl from '../upstream/rental-admin/packages/ui-arc/vendor/registry/components/segmented-control/segmented-control';
import defaultAvatar from '../upstream/rental-admin/apps/admin/src/assets/default-user-avatar.jpg';
import { useUiEnvironment } from './environment';
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './animate-sidebar/runtime/collapsible';
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
  title: string;
  subtitle: string;
  workspaces: { key: string; label: string; icon: ReactNode }[];
  workspaceKey: string;
  onWorkspaceChange: (key: string) => void;
  navigationMode: 'components' | 'admin';
  onNavigationModeChange: (mode: 'components' | 'admin') => void;
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
  onLogout: () => void;
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
}: Pick<FrameworkShellProps, 'sections' | 'selectedKey' | 'onNavigate'> & {
  query: string;
  emptyLabel: string;
  groupLabel: string;
  keepEmptySections: boolean;
}) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [popup, setPopup] = useState<string | null>(null);
  const keyword = query.trim().toLocaleLowerCase();
  const visible = sections
    .map((section) => ({
      ...section,
      routes: section.routes.filter((route) => !keyword || route.label.toLocaleLowerCase().includes(keyword)),
    }))
    .filter((section) => section.routes.length || (keepEmptySections && !keyword));
  const collapsed = !isMobile && state === 'collapsed';
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
      enabled={selected !== null}
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
          {visible.map((section) =>
            collapsed ? (
              <DropdownMenu
                key={section.key}
                modal={false}
                open={popup === section.key}
                onOpenChange={(open) => setPopup(open ? section.key : null)}
              >
                <SidebarMenuItem>
                  <HighlightItem value={`group:${section.key}`} asChild>
                    <div className="rental-sidebar-route-target">
                      <DropdownMenuTrigger
                        aria-label={section.label}
                        render={<SidebarMenuButton isActive={active?.key === section.key} />}
                      >
                        {section.icon}
                      </DropdownMenuTrigger>
                    </div>
                  </HighlightItem>
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
            ) : (
              <Collapsible
                key={section.key}
                open={expanded(section)}
                onOpenChange={(open) => setOpenGroups((groups) => ({ ...groups, [section.key]: open }))}
                className="group/collapsible rental-menu-group"
              >
                <SidebarMenuItem>
                  <HighlightItem value={`group:${section.key}`} asChild>
                    <div className="rental-sidebar-route-target">
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuButton isActive={active?.key === section.key && !expanded(section)} />
                        }
                      >
                        {section.icon}
                        <span>{section.label}</span>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          strokeWidth={2}
                          className="ml-auto transition-transform duration-350 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-data-open/collapsible:rotate-90"
                        />
                      </CollapsibleTrigger>
                    </div>
                  </HighlightItem>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {section.routes.map((route) => (
                        <HighlightItem
                          key={route.key}
                          value={route.key}
                          activeClassName="rental-sidebar-sub-highlight"
                          asChild
                        >
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              aria-current={route.key === selectedKey ? 'page' : undefined}
                              isActive={route.key === selectedKey}
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
                            >
                              <span>{route.label}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </HighlightItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ),
          )}
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
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            {identity}
            <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="ml-auto size-4" />
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
              <DropdownMenuItem onClick={() => props.onNavigate('/manage/appearance')}>
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
                {labels.appearance}
              </DropdownMenuItem>
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
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={props.onLogout}>
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                {labels.logout}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function ShellContents(props: FrameworkShellProps) {
  const [query, setQuery] = useState('');
  const { state, isMobile, setOpenMobile } = useSidebar();
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
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{props.title}</span>
        <span className="truncate text-xs">{props.subtitle}</span>
      </div>
    </>
  );
  return (
    <>
      <Sidebar collapsible="icon" className="rental-sidebar-colors">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`${props.title} · ${props.subtitle}`}
                  render={
                    <SidebarMenuButton
                      size="lg"
                      className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                    />
                  }
                >
                  {brandContent}
                  <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="ml-auto" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  align="start"
                  sideOffset={4}
                  side={isMobile ? 'bottom' : 'right'}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {props.labels.projects}
                    </DropdownMenuLabel>
                    {props.workspaces.map((workspace) => (
                      <DropdownMenuItem
                        key={workspace.key}
                        className="gap-2 p-2"
                        onClick={() => {
                          props.onWorkspaceChange(workspace.key);
                          setQuery('');
                          setOpenMobile(false);
                        }}
                        aria-current={workspace.key === props.workspaceKey ? 'true' : undefined}
                      >
                        <span
                          data-sidebar="workspace-icon"
                          className="flex size-6 shrink-0 items-center justify-center"
                        >
                          {workspace.icon}
                        </span>
                        <span className="truncate">{workspace.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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
        </SidebarHeader>
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
        <SidebarContent>
          <Navigation
            keepEmptySections={props.navigationMode === 'components'}
            groupLabel={
              props.navigationMode === 'components' ? props.labels.center : (props.sections[0]?.label ?? '')
            }
            sections={props.sections}
            selectedKey={props.selectedKey}
            query={query}
            onNavigate={props.onNavigate}
            emptyLabel={props.labels.noMenu}
          />
        </SidebarContent>
        <SidebarFooter>
          <AccountMenu {...props} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="app-workspace min-h-0">
        <header className="rental-sidebar-colors native-workspace-context preview-context-header">
          <div className="preview-context-location">
            <SidebarTrigger
              className="-ml-1"
              aria-label={state === 'collapsed' ? props.labels.expand : props.labels.collapse}
            />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <nav aria-label={props.labels.breadcrumb} className="preview-breadcrumb">
              <span>{section?.label ?? props.subtitle}</span>
              <span aria-hidden="true">/</span>
              <span aria-current="page">
                {route?.label ??
                  (props.selectedKey === '/manage/appearance' ? props.labels.appearance : props.subtitle)}
              </span>
            </nav>
          </div>
          <div className="preview-context-actions">
            {props.contextControls}
            <WorkspaceClock locale={props.locale} />
            <button
              type="button"
              className="preview-document-trigger"
              disabled={!props.documentAvailable}
              title={
                !props.documentAvailable ? (props.documentUnavailableReason ?? '本页尚未关联文档') : undefined
              }
              aria-controls="preview-page-document"
              aria-expanded={props.documentOpen}
              onClick={props.onDocumentToggle}
            >
              <FileText size={15} />
              {props.labels.pageDocument}
            </button>
          </div>
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
  const { dark } = useUiEnvironment();
  return (
    <TooltipProvider>
      <div className="preview-native-stage">
        <div className="app-shell native-admin-shell preview-native-root">
          <SidebarProvider
            animateOnHover={false}
            className={`rental-animate-scope relative h-full min-h-0${dark ? ' dark' : ''}`}
            style={{ '--sidebar-width': 'var(--rental-sidebar-expanded-width)' } as CSSProperties}
          >
            <ShellContents {...props} />
          </SidebarProvider>
        </div>
      </div>
    </TooltipProvider>
  );
}
