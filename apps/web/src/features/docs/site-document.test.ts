import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';
import { siteDocument } from './site-document';

describe('site PRD presentation', () => {
  it('preserves sanitized business content, stable anchors, nested lists and guarded assets', () => {
    const source =
      '# 车辆\n\n正文。\n\n## 约束\n- 不得支付\n  - 未知状态\n\n![流程](../assets/flow.png)\n\n```mermaid\ngraph LR\n A-->B\n```\n\n<script>unsafe()</script>';
    const rendered = renderMarkdown(source, {
      privateAssets: true,
      documentPath: 'requirements/rules.md',
      resolveAssetUrl: (path) => `/guarded?path=${encodeURIComponent(path)}`,
    });
    const html = siteDocument(rendered.html);
    const root = new DOMParser().parseFromString(html, 'text/html');
    expect(root.querySelectorAll('section[aria-labelledby]').length).toBe(2);
    expect(root.querySelector('#约束 a')?.getAttribute('href')).toBe('#%E7%BA%A6%E6%9D%9F');
    expect(root.querySelector('ul ul')?.textContent).toContain('未知状态');
    expect(root.querySelector('img')?.getAttribute('src')).toBe('/guarded?path=assets%2Fflow.png');
    expect(root.querySelector('code.language-mermaid')?.textContent).toContain('A-->B');
    expect(root.querySelector('script')).toBeNull();
    expect(root.body.textContent).toContain('不得支付');
  });
  it('retains native table semantics and every cell inside a keyboard-scrollable region', () => {
    const rendered = renderMarkdown('## 状态\n\n| 字段 | 规则 |\n| --- | --- |\n| status | 未知 |');
    const root = new DOMParser().parseFromString(siteDocument(rendered.html), 'text/html');
    expect(root.querySelector('.showcase-document-table')?.getAttribute('tabindex')).toBe('0');
    expect(root.querySelectorAll('th')).toHaveLength(2);
    expect([...root.querySelectorAll('td')].map((cell) => cell.textContent)).toEqual(['status', '未知']);
  });
});
