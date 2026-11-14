/** Rental OS's full-page state surface. Callers own real errors and recovery;
 * this view can render without the application's appearance, identity or router providers. */
import type { CSSProperties } from 'react';
import { Button } from './admin-controls/runtime/apps/admin/src/components/ui/Button';
import { Result, type ResultProps } from './admin-controls/runtime/apps/admin/src/components/ui/Result';
import {
  ADMIN_CONTROL_HEIGHT,
  ADMIN_FONT_FAMILY,
  ADMIN_TYPOGRAPHY,
} from './admin-controls/runtime/apps/admin/src/app/designTokens';
import { DEFAULT_UI_RADII } from './radii';
import './result-source.css';
import './result-page.css';

export function ResultPage({
  status = '500',
  title,
  description,
  reloadLabel,
  homeLabel,
  onReload,
  onHome,
}: {
  status?: ResultProps['status'];
  title: string;
  description?: string;
  reloadLabel?: string;
  homeLabel?: string;
  onReload?: () => void;
  onHome?: () => void;
}) {
  return (
    <main
      className="route-error-page"
      style={
        {
          '--rental-typography-font-family': ADMIN_FONT_FAMILY,
          '--rental-typography-section-title-size': `${ADMIN_TYPOGRAPHY.sectionTitle.size}px`,
          '--rental-typography-section-title-line-height': `${ADMIN_TYPOGRAPHY.sectionTitle.lineHeight}px`,
          '--radius-control': `var(--rental-ui-radius-button, ${DEFAULT_UI_RADII.button}px)`,
          '--radius-panel': `var(--rental-ui-radius-container, ${DEFAULT_UI_RADII.container}px)`,
          '--control-height-md': `${ADMIN_CONTROL_HEIGHT.default}px`,
        } as CSSProperties
      }
    >
      <Result
        status={status}
        title={title}
        subTitle={description}
        extra={
          onReload || onHome ? (
            <>
              {onReload && (
                <Button type="primary" onClick={onReload}>
                  {reloadLabel}
                </Button>
              )}
              {onHome && <Button onClick={onHome}>{homeLabel}</Button>}
            </>
          ) : undefined
        }
      />
    </main>
  );
}
