import { describe, expect, it } from 'vitest';

import { renderMarkdown, resolveDocumentAssetPath } from './markdown';

describe('React Markdown reader', () => {
  it('resolves document-relative assets without changing external URLs', () => {
    expect(resolveDocumentAssetPath('公務車/規則/說明.md', '../images/流程圖.png')).toBe(
      '公務車/images/流程圖.png',
    );
    const rendered = renderMarkdown('![本地圖](../images/a.png)\n\n![網絡圖](https://example.com/a.png)', {
      documentPath: '公務車/規則/說明.md',
      resolveAssetUrl: (path) => `/docs/${path}`,
    });
    expect(rendered.html).toContain('src="/docs/公務車/images/a.png"');
    expect(rendered.html).toContain('src="https://example.com/a.png"');
  });

  it('creates stable, unique heading anchors', () => {
    const rendered = renderMarkdown('# 標題\n\n## 小節\n\n## 小節');
    expect(rendered.headings.map((heading) => heading.id)).toEqual(['標題', '小節', '小節-2']);
  });

  it('marks relative Markdown links for in-reader navigation', () => {
    const rendered = renderMarkdown('[下一章](../訂單/詳情.md#費用)', {
      documentPath: '公務車/規則/說明.md',
      resolveDocumentUrl: (path, anchor) => `/docs?doc=${path}&anchor=${anchor}`,
    });
    expect(rendered.html).toContain('data-doc-path="公務車/訂單/詳情.md"');
    expect(rendered.html).toContain('data-doc-anchor="費用"');
    expect(rendered.html).toContain('href="/docs?doc=公務車/訂單/詳情.md&amp;anchor=費用"');
  });
});
