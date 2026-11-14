import { Component, type ErrorInfo, type ReactNode } from 'react';
import { FailurePage } from './FailurePage';
import { discardBrandBoot } from '../../../../packages/preview-ui/src/brand-boot';

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    discardBrandBoot();
    console.error('React platform render failed', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <FailurePage />;
  }
}
