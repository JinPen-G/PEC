import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Layers3 } from 'lucide-react';
import { FrameworkShell, ScreenPortalProvider, UiEnvironmentProvider } from '@preview/ui';
import { Button } from '@preview/ui/admin';
import { LoadingStage } from '@preview/ui/loading';
import { useNativeAuth } from '@/features/platform/platform-api';
import { usePlatformTheme } from '@/features/theme/platform-theme';
import { usePlatformLocale } from '@/features/locale/platform-locale';
import { usePrefersReducedMotion } from '@/features/motion/use-motion-preference';
import { useShellLabels } from '@/features/shell/shell-labels';
import { useShowcasePages, type CatalogPage } from './showcase-catalog';
import { useShowcaseText } from './showcase-locale';
import { catalogKind, catalogPageQualifier, catalogPageTitle } from './catalog-sections';
import './screen-workspace.css';

export function ScreenWorkspace({
  page,
  compact,
  children,
}: {
  page: CatalogPage;
  compact: boolean;
  children: ReactNode;
}) {
  const text = useShowcaseText();
  const labels = useShellLabels();
  const { session } = useNativeAuth();
  const { resolvedMode } = usePlatformTheme();
  const { locale } = usePlatformLocale();
  const reduced = usePrefersReducedMotion();
  const navigate = useNavigate();
  const catalog = useShowcasePages(page.projectId);
  const pages = catalog.data?.pages.filter((item) => item.allowed && catalogKind(item) === 'page') ?? [];
  const path = (item: CatalogPage) => `/pages/${item.projectId}/${item.clientId}/${item.pageKey}`;
  return (
    <UiEnvironmentProvider dark={resolvedMode === 'dark'} reducedMotion={reduced}>
      <div className="showcase-screen-workspace">
        <ScreenPortalProvider>
          <FrameworkShell
            embedded
            compact={compact}
            title={page.projectName}
            subtitle=""
            brand={<Layers3 size={24} />}
            workspaces={[]}
            workspaceKey={page.projectId}
            onWorkspaceChange={() => {}}
            navigationMode="components"
            onNavigationModeChange={() => {}}
            showNavigationModeSwitch={false}
            showAppearanceLink={false}
            showDocumentControl={false}
            account={session?.user?.displayName ?? text('访客')}
            accountDescription={text('公开浏览')}
            sections={[
              {
                key: page.projectId,
                label: page.projectName,
                icon: <Layers3 size={16} />,
                flat: true,
                routes: pages.map((item) => {
                  const qualifier = catalogPageQualifier(item, pages);
                  return {
                    key: path(item),
                    label: text(catalogPageTitle(item)),
                    icon: <FileText size={16} />,
                    qualifier: qualifier ? text(qualifier) : undefined,
                  };
                }),
              },
            ]}
            selectedKey={path(page)}
            onNavigate={navigate}
            preference={resolvedMode}
            onThemeChange={() => {}}
            locale={locale}
            onLocaleChange={() => {}}
            labels={{ ...labels, center: '' }}
            documentAvailable={false}
            documentOpen={false}
            onDocumentToggle={() => {}}
          >
            {catalog.isPending && <LoadingStage label={text('读取页面目录…')} />}
            {catalog.error && (
              <p role="alert" className="showcase-error">
                {text('目录读取失败')}{' '}
                <Button size="small" onClick={() => void catalog.refetch()}>
                  {text('重试')}
                </Button>
              </p>
            )}
            <div className="showcase-screen-content">{children}</div>
          </FrameworkShell>
        </ScreenPortalProvider>
      </div>
    </UiEnvironmentProvider>
  );
}
