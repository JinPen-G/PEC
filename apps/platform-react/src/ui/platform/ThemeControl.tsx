import { Button, Dropdown, Tooltip, type MenuProps } from '@/ui/ant';
import { DesktopOutlined, MoonOutlined, SunOutlined } from '@/ui/ant/icons';
import { usePlatformTheme, type PlatformThemeMode } from '@/features/theme/platform-theme';

const modeLabels: Record<PlatformThemeMode, string> = {
  system: '跟隨系統',
  dark: '深色主題',
  glass: '淺色主題',
};

export function ThemeControl({
  showLabel = false,
  iconOnly = false,
}: {
  showLabel?: boolean;
  iconOnly?: boolean;
}) {
  const { mode, resolvedMode, setMode } = usePlatformTheme();
  const items: MenuProps['items'] = [
    {
      type: 'group',
      label: '界面主題',
      children: [
        { key: 'system', icon: <DesktopOutlined />, label: '跟隨系統' },
        { key: 'glass', icon: <SunOutlined />, label: '淺色主題' },
        { key: 'dark', icon: <MoonOutlined />, label: '深色主題' },
      ],
    },
  ];
  const icon =
    mode === 'system' ? (
      <DesktopOutlined />
    ) : resolvedMode === 'dark' ? (
      <MoonOutlined />
    ) : resolvedMode === 'glass' ? (
      <SunOutlined />
    ) : (
      <SunOutlined />
    );
  const menu = {
    items,
    selectable: true,
    selectedKeys: [mode],
    onClick: ({ key }: { key: string }) => {
      setMode(key as PlatformThemeMode);
    },
  };

  /** 頂欄形態只保留圖標，具體主題名稱由懸浮提示和菜單承載。 */
  if (iconOnly) {
    return (
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        classNames={{ root: 'app-pill-menu' }}
        menu={menu}
      >
        <Tooltip title={`主題：${modeLabels[mode]}`}>
          <button
            type="button"
            className="topnav-icon-button theme-control"
            aria-label={`主題：${modeLabels[mode]}`}
          >
            {icon}
          </button>
        </Tooltip>
      </Dropdown>
    );
  }

  return (
    <Dropdown trigger={['click']} menu={menu}>
      <Tooltip title={`主題：${modeLabels[mode]}`}>
        <Button className="theme-control" type="text" icon={icon} aria-label={`主題：${modeLabels[mode]}`}>
          {showLabel ? modeLabels[mode] : null}
        </Button>
      </Tooltip>
    </Dropdown>
  );
}
