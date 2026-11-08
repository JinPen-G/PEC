/** Rental OS's original pixel grid; containers reuse its route/auth geometry. */
import { LoadingState as OriginalLoadingState } from './admin-controls/runtime/apps/admin/src/components/LoadingState';
import './loading-source.css';

export const LoadingState = OriginalLoadingState;
export function LoadingStage({
  label,
  scope = 'page',
}: {
  label?: string;
  scope?: 'screen' | 'page' | 'inline';
}) {
  if (scope === 'inline') return <OriginalLoadingState label={label} />;
  return (
    <div className={scope === 'screen' ? 'auth-loader' : 'route-loader'} data-loading-scope={scope}>
      <OriginalLoadingState label={label} />
    </div>
  );
}
