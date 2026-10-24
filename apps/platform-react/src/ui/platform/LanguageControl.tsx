import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Tooltip, type MenuProps } from '@/ui/ant';
import { GlobalOutlined } from '@/ui/ant/icons';
import { usePlatformLocale, type PlatformLocale } from '@/features/locale/platform-locale';

const localeLabels: Record<PlatformLocale, string> = {
  'zh-Hant': '繁體中文',
  'zh-Hans': '简体中文',
  en: 'English',
};

export function LanguageControl({
  showLabel = false,
  iconOnly = false,
}: {
  showLabel?: boolean;
  iconOnly?: boolean;
}) {
  const { t } = useTranslation();
  const { locale, setLocale } = usePlatformLocale();
  const items: MenuProps['items'] = [
    {
      type: 'group',
      label: t('chrome.language.group'),
      children: [
        { key: 'zh-Hant', label: '繁體中文' },
        { key: 'zh-Hans', label: '简体中文' },
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
        <Tooltip title={t('chrome.language.tooltip', { locale: localeLabels[locale] })}>
          <button
            type="button"
            className="topnav-icon-button language-control"
            aria-label={t('chrome.language.tooltip', { locale: localeLabels[locale] })}
          >
            <GlobalOutlined />
          </button>
        </Tooltip>
      </Dropdown>
    );
  }

  return (
    <Dropdown trigger={['click']} menu={menu}>
      <Tooltip title={t('chrome.language.tooltip', { locale: localeLabels[locale] })}>
        <Button
          className="language-control"
          type="text"
          icon={<GlobalOutlined />}
          aria-label={t('chrome.language.tooltip', { locale: localeLabels[locale] })}
        >
          {showLabel ? localeLabels[locale] : null}
        </Button>
      </Tooltip>
    </Dropdown>
  );
}
