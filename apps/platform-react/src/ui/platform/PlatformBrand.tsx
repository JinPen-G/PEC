import { useTranslation } from 'react-i18next';

import { usePlatformTheme } from '@/features/theme/platform-theme';

type PlatformBrandVariant = 'full' | 'mark';

const brandAsset = (fileName: string) => `${import.meta.env.BASE_URL}brand/${fileName}`;

export function PlatformBrand({
  variant = 'mark',
  alt,
  className,
}: {
  variant?: PlatformBrandVariant;
  alt?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const { resolvedMode } = usePlatformTheme();
  // 未顯式傳 alt 時回退到品牌名（本地化）；空字符串表示裝飾性圖標，保持原樣。
  const resolvedAlt = alt ?? t('chrome.brand.name');
  const fileName =
    variant === 'full'
      ? `logo-horizontal-cn${resolvedMode === 'dark' ? '-white' : ''}.svg`
      : 'icon-sidebar.svg';

  return (
    <img
      className={`platform-brand platform-brand--${variant}${className ? ` ${className}` : ''}`}
      src={brandAsset(fileName)}
      alt={resolvedAlt}
      draggable={false}
    />
  );
}
