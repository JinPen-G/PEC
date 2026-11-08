import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Result } from '@/ui/ant';

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('React platform render failed', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <ErrorFallback message={this.state.error.message} />;
  }
}

/** class 組件用不了 hook，回退 UI 拆成函數組件以接入 t()。 */
function ErrorFallback({ message }: { message: string }) {
  const { t } = useTranslation();
  return (
    <main className="system-result-page">
      <Result
        status="error"
        title={t('chrome.error.title')}
        subTitle={message}
        extra={<Button onClick={() => window.location.reload()}>{t('chrome.error.reload')}</Button>}
      />
    </main>
  );
}
