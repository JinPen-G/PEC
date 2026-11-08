import { expect, test } from 'vitest';
import { renderMarkdown } from './markdown';
test('private documents keep relative resources behind the authorized endpoint and block remote image bypasses', () => {
  const rendered = renderMarkdown(
    '# Guide\n\n![local](images/item.png)\n\n<img src="https://remote.invalid/track" srcset="https://remote.invalid/t 2x">\n\n[another](other.md)',
    {
      documentPath: 'folder/guide.md',
      privateAssets: true,
      resolveAssetUrl: (path) => `/api/private?path=${encodeURIComponent(path)}`,
      resolveDocumentUrl: (path) => `#/documents?doc=${encodeURIComponent(path)}`,
    },
  );
  expect(rendered.html).toContain('/api/private?path=folder%2Fimages%2Fitem.png');
  expect(rendered.html).not.toContain('remote.invalid');
  expect(rendered.html).not.toContain('srcset');
  expect(rendered.html).toContain('data-doc-path="folder/other.md"');
});
