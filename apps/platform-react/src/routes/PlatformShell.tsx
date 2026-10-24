import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

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

const { Content } = Layout;
const COLLAPSED_KEY = 'product-experience-center:platform-nav-collapsed';

/**
 * 平臺導航分組。
 *
 * 分組標題是**不可點**的一級，二級頁面始終鋪開——展開態一個頁面都不用多點一次，
 * 收起態則退化成「圖標父項 + 懸浮浮層」。
 */
const navigationSections = [
  {
    key: 'overview',
    label: '概覽',
    icon: <DashboardOutlined />,
    items: [{ key: '/tools/console', label: '控制台', icon: <SettingOutlined /> }],
  },
  {
    key: 'projects',
    label: '項目資料',
    icon: <FolderOpenOutlined />,
    items: [
      { key: '/tools/projects', label: '項目包管理', icon: <FolderOpenOutlined /> },
      { key: '/tools/project-health', label: '項目健康檢查', icon: <SafetyCertificateOutlined /> },
      { key: '/tools/project-routes', label: '路由菜單管理', icon: <OrderedListOutlined /> },
    ],
  },
  {
    key: 'pages',
    label: '頁面與需求',
    icon: <DatabaseOutlined />,
    items: [{ key: '/tools/ai-context', label: 'AI 上下文中心', icon: <DatabaseOutlined /> }],
  },
  {
    key: 'reference',
    label: '參考',
    icon: <AppstoreOutlined />,
    items: [{ key: '/components', label: '組件規範', icon: <AppstoreOutlined /> }],
  },
];

const navigation = navigationSections.flatMap((section) => section.items);

/**
 * 展開態用 `type: "group"`（一級是標題）；收起態換成只有圖標的父項，
 * 二級收進懸浮浮層——64px 寬放不下分組標題，平鋪成一串圖標又會丟掉歸屬關係。
 */
function buildMenuItems(collapsed: boolean): MenuProps['items'] {
  return navigationSections.map((section) => {
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
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === '1');
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
          brandTitle="產品功能體驗中心"
          onBrandClick={() => navigate('/')}
          routeKey={location.pathname}
          nav={(isCollapsed) => (
            <Menu
              className="platform-workspace__menu"
              mode="inline"
              selectedKeys={currentPath ? [currentPath] : []}
              items={buildMenuItems(isCollapsed)}
              onClick={({ key }) => navigate(String(key))}
            />
          )}
          tools={(isCollapsed) => (
            <>
              <ThemeControl showLabel={!isCollapsed} />
              <Button type="text" icon={<HomeOutlined />} onClick={() => navigate('/')}>
                {isCollapsed ? null : '返回首頁'}
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
