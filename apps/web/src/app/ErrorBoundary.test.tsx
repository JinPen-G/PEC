import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/i18n';
import { ErrorBoundary } from './ErrorBoundary';
import { FailurePage } from './FailurePage';
import { registerBrandBoot } from '../../../../packages/preview-ui/src/brand-boot';
import { renderStartupFailure } from './startup-error';
import { AppProviders } from './AppProviders';
import { useAppearancePreferences } from '@/features/appearance/appearance-preferences';

const recovery = vi.hoisted(() => ({ reloadPage: vi.fn(), returnHome: vi.fn() }));
vi.mock('./recovery-navigation', () => recovery);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('application rendering recovery', () => {
  it('provides appearance state through the real application entry', () => {
    function Preferences() {
      const { preferences } = useAppearancePreferences();
      return <p>Appearance version {preferences.version}</p>;
    }
    render(
      <ErrorBoundary>
        <AppProviders native>
          <Preferences />
        </AppProviders>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Appearance version 1')).toBeInTheDocument();
    expect(screen.queryByText(/页面暂时无法显示/)).not.toBeInTheDocument();
  });

  it('renders the Rental OS state without app providers and keeps private error details in the console', async () => {
    await i18n.changeLanguage('zh-Hans');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const dispose = vi.fn(),
      release = vi.fn();
    registerBrandBoot({ controller: { dispose } as never, release });
    function FailedPage(): never {
      throw new Error('AppearanceProvider is required · private detail');
    }
    const view = render(
      <ErrorBoundary>
        <FailedPage />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('heading', { name: '页面暂时无法显示' })).toBeInTheDocument();
    expect(screen.getByText('请重新加载页面。若刚提交过操作，请先核对结果。')).toBeInTheDocument();
    expect(view.container.querySelector('[data-result-status="500"]')).toBeInTheDocument();
    expect(view.container.querySelector('.ant-result')).not.toBeInTheDocument();
    expect(screen.queryByText(/AppearanceProvider/)).not.toBeInTheDocument();
    expect(log).toHaveBeenCalledWith('React platform render failed', expect.any(Error), expect.any(Object));
    expect(dispose).toHaveBeenCalled();
    expect(release).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '重新加载' }));
    expect(recovery.reloadPage).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: '返回可访问页面' }));
    expect(recovery.returnHome).toHaveBeenCalledOnce();
  });

  it.each(['zh-Hant', 'en'])('keeps recovery readable in %s without provider state', async (language) => {
    await i18n.changeLanguage(language);
    render(<FailurePage />);
    const heading = language === 'en' ? 'Page temporarily unavailable' : '頁面暫時無法顯示';
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('loads an independent recovery view after the main application fails to import', async () => {
    await i18n.changeLanguage('zh-Hans');
    const target = document.createElement('div');
    document.body.append(target);
    let root: ReturnType<typeof renderStartupFailure>;
    try {
      await act(async () => {
        root = renderStartupFailure(target);
      });
      expect(screen.getByRole('heading', { name: '页面暂时无法显示' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '重新加载' }));
      expect(recovery.reloadPage).toHaveBeenCalledOnce();
    } finally {
      await act(async () => root?.unmount());
      target.remove();
    }
  });
});
