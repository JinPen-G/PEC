import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { GuideBody } from './GuideBody';

vi.mock('./showcase-locale', () => ({ useShowcaseText: () => (value: string) => value }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const props = {
  projectId: 'rental',
  documentPath: 'guides/theming.md',
  resolveDocumentUrl: (file: string) => `#/docs/${file.split('/').at(-1)?.replace('.md', '')}?project=rental`,
  onHeadings: vi.fn(),
};

it('uses the original guide sections, definition rows and ordered steps without PRD styling', () => {
  const source =
    '## 内容组织\n\n<dl><div><dt>区块</dt><dd>组合功能</dd></div></dl>\n\n## 使用\n\n1. ### 选择页面\n\n   检查字段。\n\n[主题](theming.md)';
  render(<GuideBody {...props} source={source} />);
  expect(document.querySelectorAll('.library-docs_section__WJnkm')).toHaveLength(2);
  expect(document.querySelector('.library-docs_defs__rKfvJ dt')).toHaveTextContent('区块');
  expect(document.querySelector('.library-docs_steps___R3KD h3')).toHaveTextContent('选择页面');
  expect(document.querySelector('.showcase-document-body')).toBeNull();
  expect(screen.getByRole('link', { name: '主题' })).toHaveAttribute('href', '#/docs/theming?project=rental');
});

it('renders theme token swatches from declared CSS variables and retains table semantics', () => {
  render(
    <GuideBody
      {...props}
      source={
        '## 颜色变量\n\n| 变量 | 用途 |\n| --- | --- |\n| `--surface` | 面板 |\n| `--unknown` | 自定义 |\n\n<div data-guide-example="accents"></div>'
      }
    />,
  );
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('row')).toHaveLength(3);
  expect(within(table).getAllByRole('columnheader')).toHaveLength(2);
  const swatch = table.querySelector<HTMLElement>('[data-color-token="--surface"]');
  expect(swatch?.style.background).toBe('var(--surface)');
  expect(table.querySelector('[data-color-token="--unknown"]')).toBeNull();
  expect(document.querySelectorAll('.library-docs_accents__BRKFM > span')).toHaveLength(8);
});

it('copies code for the current project and renders potentially active markup only as text', async () => {
  const copy = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: copy } });
  const source =
    '## 配置\n\n```json\n{"url":"{{origin}}/r/{{projectId}}/item.json","value":"<img src=x onerror=alert(1)>"}\n```\n\n<script>unsafe()</script><button onclick="unsafe()">文本</button>';
  const instance = render(<GuideBody {...props} source={source} />);
  expect(document.querySelector('script,img')).toBeNull();
  expect(screen.queryByRole('button', { name: '文本' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '复制' }));
  expect(await screen.findByText('已复制', { selector: '[data-visible="true"]' })).toBeInTheDocument();
  expect(copy).toHaveBeenCalledWith(
    `{"url":"${window.location.origin}/r/rental/item.json","value":"<img src=x onerror=alert(1)>"}`,
  );
  instance.rerender(<GuideBody {...props} projectId="components" source={source} />);
  expect(document.querySelector('pre')).toHaveTextContent('/r/components/item.json');
});

it('keeps project-scoped links in the original next-step cards', () => {
  render(
    <GuideBody
      {...props}
      source={'## 下一步\n\n<div data-guide-example="next-steps">\n\n- [主题设置](theming.md)：颜色变量与品牌。\n\n</div>'}
    />,
  );
  expect(screen.getByRole('link', { name: /主题设置\s*颜色变量与品牌。/ })).toHaveAttribute(
    'href',
    '#/docs/theming?project=rental',
  );
  expect(document.querySelector('.library-docs_cards__3I1_w .library-docs_card__PVOg9')).not.toBeNull();
});
