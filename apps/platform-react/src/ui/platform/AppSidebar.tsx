import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Drawer, Layout, Tooltip } from '@/ui/ant';
import { MenuFoldOutlined, MenuOutlined, MenuUnfoldOutlined } from '@/ui/ant/icons';

const { Sider } = Layout;

// 與 BoardUI 桌面側欄保持同一 260px 節奏；內外留白由 app-shell-frame.css 統一控制。
const SIDER_WIDTH = 260;
const SIDER_COLLAPSED_WIDTH = 64;
const DRAWER_WIDTH = 272;
const DESKTOP_QUERY = '(min-width: 992px)';

/**
 * 側欄 / 抽屜的切換點。
 *
 * 刻意不用 antd 的 `Grid.useBreakpoint()`：它首幀返回空對象，
 * 實測視口變窄後也不一定更新，結果仍被判成桌面、抽屜永遠出不來。
 * `matchMedia` 是同一件事的直接表達，首幀就有確定值。
 */
export function useMinWidth(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [query]);
  return matches;
}

export interface AppSidebarProps {
  /** 常駐側欄是否收起；抽屜內永遠是展開態。 */
  collapsed: boolean;
  onToggleCollapsed: () => void;
  brandMark: ReactNode;
  /** 展開態可使用完整正式品牌標誌；未提供時回退到圖形 + 文字。 */
  brandLogo?: ReactNode;
  brandTitle: string;
  brandSubtitle?: string;
  onBrandClick?: () => void;
  /** 品牌區下方的選擇器槽位（平臺側無此槽位）。 */
  selector?: ReactNode;
  /** 菜單區。收起態傳 true，調用方據此切換 group / submenu 結構。 */
  nav: (collapsed: boolean) => ReactNode;
  /** 菜單與賬號之間的工具區。 */
  tools?: (collapsed: boolean) => ReactNode;
  /** 側欄最底部。 */
  account?: (collapsed: boolean) => ReactNode;
  /** 路由標識；變化即關抽屜。 */
  routeKey?: string;
}

/**
 * 兩個外殼共用的側欄框架。
 *
 * 縱向五段：品牌（含摺疊按鈕）→ 選擇器 → 菜單（獨立滾動）→ 工具 → 賬號。
 * 常駐側欄與窄屏抽屜必須是同一份導航，各寫一份遲早只改其中一處，
 * 因此內容抽成渲染函數，`inDrawer` 隻影響收起態（抽屜裏沒有收起的意義）。
 */
export function AppSidebar({
  collapsed,
  onToggleCollapsed,
  brandMark,
  brandLogo,
  brandTitle,
  brandSubtitle,
  onBrandClick,
  selector,
  nav,
  tools,
  account,
  routeKey,
}: AppSidebarProps) {
  const { t } = useTranslation();
  const isDesktop = useMinWidth(DESKTOP_QUERY);
  function renderShell(inDrawer: boolean) {
    const isCollapsed = collapsed && !inDrawer;

    return (
      <div className={`app-sider-shell${isCollapsed ? ' app-sider-shell--collapsed' : ''}`}>
        <div className="app-sider__brand">
          <button type="button" className="app-sider__brand-button" onClick={onBrandClick}>
            {!isCollapsed && brandLogo ? (
              <span className="app-sider__brand-logo">{brandLogo}</span>
            ) : (
              <>
                <span className="app-sider__brand-mark">{brandMark}</span>
                {isCollapsed ? null : (
                  <span className="app-sider__brand-copy">
                    <b>{brandTitle}</b>
                    {brandSubtitle ? <small>{brandSubtitle}</small> : null}
                  </span>
                )}
              </>
            )}
          </button>
          {inDrawer ? null : (
            <Tooltip title={isCollapsed ? t('chrome.nav.expand') : t('chrome.nav.collapse')} placement="right">
              <Button
                type="text"
                className="app-sider__collapse"
                aria-label={isCollapsed ? t('chrome.nav.expand') : t('chrome.nav.collapse')}
                icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={onToggleCollapsed}
              />
            </Tooltip>
          )}
        </div>

        {selector && !isCollapsed ? <div className="app-sider__slot">{selector}</div> : null}

        <div className="app-sider__nav">{nav(isCollapsed)}</div>

        {tools ? <div className="app-sider__tools">{tools(isCollapsed)}</div> : null}
        {account ? <div className="app-sider__account">{account(isCollapsed)}</div> : null}
      </div>
    );
  }

  if (!isDesktop) {
    return <MobileAppSidebar key={routeKey}>{renderShell(true)}</MobileAppSidebar>;
  }

  return (
    <Sider
      className="app-sider"
      width={SIDER_WIDTH}
      collapsedWidth={SIDER_COLLAPSED_WIDTH}
      collapsed={collapsed}
      trigger={null}
    >
      {renderShell(false)}
    </Sider>
  );
}

function MobileAppSidebar({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Button
        type="text"
        className="app-sider-drawer-trigger"
        aria-label={t('chrome.nav.open')}
        icon={<MenuOutlined />}
        onClick={() => setDrawerOpen(true)}
      />
      <Drawer
        className="app-sider-drawer"
        placement="left"
        size={DRAWER_WIDTH}
        open={drawerOpen}
        closable={false}
        styles={{ body: { padding: 0 } }}
        onClose={() => setDrawerOpen(false)}
      >
        {children}
      </Drawer>
    </>
  );
}
