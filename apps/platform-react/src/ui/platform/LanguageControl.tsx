import { Button, Dropdown, Tooltip, type MenuProps } from '@/ui/ant';
import { GlobalOutlined } from '@/ui/ant/icons';
import { usePlatformLocale, type PlatformLocale } from '@/features/locale/platform-locale';

const localeLabels: Record<PlatformLocale, string> = {
  'zh-Hant': '繁體中文',
  en: 'English',
};

export function LanguageControl({
  showLabel = false,
  iconOnly = false,
}: {
  showLabel?: boolean;
  iconOnly?: boolean;
}) {
  const { locale, setLocale } = usePlatformLocale();
  const items: MenuProps['items'] = [
    {
      type: 'group',
      label: '語言 / Language',
      children: [
        { key: 'zh-Hant', label: '繁體中文' },
        { key: 'en', label: 'English' },
      ],
    },
  ];
  const menu = {
    items,
    selectable: true,
    selectedKeys: [locale],
    onClick: ({ key }: { key: string }) => {
      setLocale(key as PlatformLocale);
    },
  };

  /** 頂欄形態只保留圖標，具體語言名稱由懸浮提示和菜單承載。 */
  if (iconOnly) {
    return (
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        classNames={{ root: 'app-pill-menu' }}
        menu={menu}
      >
        <Tooltip title={`語言 / Language：${localeLabels[locale]}`}>
          <button
            type="button"
            className="topnav-icon-button language-control"
            aria-label={`語言 / Language：${localeLabels[locale]}`}
          >
            <GlobalOutlined />
          </button>
        </Tooltip>
      </Dropdown>
    );
  }

  return (
    <Dropdown trigger={['click']} menu={menu}>
      <Tooltip title={`語言 / Language：${localeLabels[locale]}`}>
        <Button
          className="language-control"
          type="text"
          icon={<GlobalOutlined />}
          aria-label={`語言 / Language：${localeLabels[locale]}`}
        >
          {showLabel ? localeLabels[locale] : null}
        </Button>
      </Tooltip>
    </Dropdown>
  );
}
