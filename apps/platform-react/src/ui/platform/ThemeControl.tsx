import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Tooltip, type MenuProps } from '@/ui/ant';
import { DesktopOutlined, MoonOutlined, SunOutlined } from '@/ui/ant/icons';
import { usePlatformTheme, type PlatformThemeMode } from '@/features/theme/platform-theme';

export function ThemeControl({
  showLabel = false,
  iconOnly = false,
}: {
  showLabel?: boolean;
  iconOnly?: boolean;
}) {
  const { t } = useTranslation();
  const { mode, resolvedMode, setMode } = usePlatformTheme();
  const modeLabels: Record<PlatformThemeMode, string> = {
    system: t('chrome.theme.system'),
    dark: t('chrome.theme.dark'),
    glass: t('chrome.theme.light'),
  };
  const items: MenuProps['items'] = [
    {
      type: 'group',
      label: t('chrome.theme.group'),
      children: [
        { key: 'system', icon: <DesktopOutlined />, label: t('chrome.theme.system') },
        { key: 'glass', icon: <SunOutlined />, label: t('chrome.theme.light') },
        { key: 'dark', icon: <MoonOutlined />, label: t('chrome.theme.dark') },
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
  const tooltip = t('chrome.theme.tooltip', { mode: modeLabels[mode] });

  /** 頂欄形態只保留圖標，具體主題名稱由懸浮提示和菜單承載。 */
  if (iconOnly) {
    return (
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        classNames={{ root: 'app-pill-menu' }}
        menu={menu}
      >
        <Tooltip title={tooltip}>
          <button
            type="button"
            className="topnav-icon-button theme-control"
            aria-label={tooltip}
          >
            {icon}
          </button>
        </Tooltip>
      </Dropdown>
    );
  }

  return (
    <Dropdown trigger={['click']} menu={menu}>
      <Tooltip title={tooltip}>
        <Button className="theme-control" type="text" icon={icon} aria-label={tooltip}>
          {showLabel ? modeLabels[mode] : null}
        </Button>
      </Tooltip>
    </Dropdown>
  );
}
