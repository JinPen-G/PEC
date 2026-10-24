import { useState, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, Layout, Menu, type MenuProps } from '@/ui/ant';
import {
  AppstoreOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  OrderedListOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
} from '@/ui/ant/icons';
import { AppSidebar } from '@/ui/platform/AppSidebar';
import { PlatformBrand } from '@/ui/platform/PlatformBrand';
import { ThemeControl } from '@/ui/platform/ThemeControl';
import { LanguageControl } from '@/ui/platform/LanguageControl';

const { Content } = Layout;
const COLLAPSED_KEY = 'product-experience-center:platform-nav-collapsed';

interface NavigationItem {
  key: string;
  label: string;
  icon: ReactNode;
}

interface NavigationSection {
  key: string;
  label: string;
  icon: ReactNode;
  items: NavigationItem[];
}

/**
 * 展開態用 `type: "group"`（一級是標題）；收起態換成只有圖標的父項，
 * 二級收進懸浮浮層——64px 寬放不下分組標題，平鋪成一串圖標又會丟掉歸屬關係。
 */
function buildMenuItems(sections: NavigationSection[], collapsed: boolean): MenuProps['items'] {
  return sections.map((section) => {
    const children = section.items.map((item) => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
    }));
    return collapsed
      ? { key: section.key, icon: section.icon, label: section.label, children }
      : { type: 'group' as const, key: section.key, label: section.label, children };
  });
}

export function PlatformShell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === '1');
  // 導航標題走 t()，因此分組數據在組件內構造，語言切換後隨重渲染更新。
  // 分組標題是**不可點**的一級，二級頁面始終鋪開——展開態一個頁面都不用多點一次。
  const navigationSections: NavigationSection[] = [
    {
      key: 'overview',
      label: t('chrome.nav.overview'),
      icon: <DashboardOutlined />,
      items: [{ key: '/tools/console', label: t('chrome.nav.console'), icon: <SettingOutlined /> }],
    },
    {
      key: 'projects',
      label: t('chrome.nav.projects'),
      icon: <FolderOpenOutlined />,
      items: [
        { key: '/tools/projects', label: t('chrome.nav.projectPackages'), icon: <FolderOpenOutlined /> },
        { key: '/tools/project-health', label: t('chrome.nav.projectHealth'), icon: <SafetyCertificateOutlined /> },
        { key: '/tools/project-routes', label: t('chrome.nav.routeMenus'), icon: <OrderedListOutlined /> },
      ],
    },
    {
      key: 'pages',
      label: t('chrome.nav.pages'),
      icon: <DatabaseOutlined />,
      items: [{ key: '/tools/ai-context', label: t('chrome.nav.aiContext'), icon: <DatabaseOutlined /> }],
    },
    {
      key: 'reference',
      label: t('chrome.nav.reference'),
      icon: <AppstoreOutlined />,
      items: [{ key: '/components', label: t('chrome.nav.componentGallery'), icon: <AppstoreOutlined /> }],
    },
  ];
  const navigation = navigationSections.flatMap((section) => section.items);
  const currentPath = navigation.find((item) => location.pathname.startsWith(item.key))?.key;

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0');
      return next;
    });
  }

  return (
    <Layout className="platform-workspace">
      <div className="app-shell-body platform-workspace__body">
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          brandMark={<PlatformBrand variant="mark" alt="" />}
          brandLogo={<PlatformBrand variant="full" />}
          brandTitle={t('chrome.brand.name')}
          onBrandClick={() => navigate('/')}
          routeKey={location.pathname}
          nav={(isCollapsed) => (
            <Menu
              className="platform-workspace__menu"
              mode="inline"
              selectedKeys={currentPath ? [currentPath] : []}
              items={buildMenuItems(navigationSections, isCollapsed)}
              onClick={({ key }) => navigate(String(key))}
            />
          )}
          tools={(isCollapsed) => (
            <>
              <ThemeControl showLabel={!isCollapsed} />
              <LanguageControl showLabel={!isCollapsed} />
              <Button type="text" icon={<HomeOutlined />} onClick={() => navigate('/')}>
                {isCollapsed ? null : t('chrome.action.backHome')}
              </Button>
            </>
          )}
        />
        <div className="app-workspace-panel">
          <Content className="platform-workspace__content">
            <div className="platform-workspace__route" key={location.pathname}>
              <Outlet />
            </div>
          </Content>
        </div>
      </div>
    </Layout>
  );
}
