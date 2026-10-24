import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import '@/i18n';

import { PlatformPage } from './PlatformPage';

describe('PlatformPage', () => {
  it('renders orientation, supporting copy and page content', () => {
    render(
      <PlatformPage
        eyebrow="PROJECT LIBRARY"
        title="項目包狀態"
        description="讀取本地項目包"
        actions={<button>重新掃描</button>}
      >
        <div>項目清單</div>
      </PlatformPage>,
    );

    expect(screen.getByRole('main', { name: '項目包狀態' })).toHaveAttribute(
      'data-description',
      '讀取本地項目包',
    );
    // 頁面標題必須是真實 heading：既服務無障礙，也是 E2E 定位頁面的依據。
    expect(screen.getByRole('heading', { name: '項目包狀態', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('PROJECT LIBRARY')).toBeInTheDocument();
    expect(screen.getByText('讀取本地項目包')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重新掃描' })).toBeInTheDocument();
    expect(screen.getByText('項目清單')).toBeInTheDocument();
  });

  it('省略可選文案時只渲染標題', () => {
    render(
      <PlatformPage title="控制台">
        <div>內容</div>
      </PlatformPage>,
    );

    expect(screen.getByRole('heading', { name: '控制台', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('main', { name: '控制台' })).not.toHaveAttribute('data-description');
  });
});
