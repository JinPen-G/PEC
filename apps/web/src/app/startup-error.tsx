/** Lazy, independent recovery entry when the main application fails to import. */
import '@/i18n';
import { createRoot } from 'react-dom/client';
import { FailurePage } from './FailurePage';

export function renderStartupFailure(target = document.getElementById('root')) {
  if (!target) return;
  const root = createRoot(target);
  root.render(<FailurePage />);
  return root;
}
