import DOMPurify from 'dompurify';
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({ html: true, linkify: true, typographer: false, breaks: false });

function createHeadingId(value: string, usedIds: Set<string>) {
  const base =
    value
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/gu, '') || 'section';
  let id = base;
  let index = 2;
  while (usedIds.has(id)) id = `${base}-${index++}`;
  usedIds.add(id);
  return id;
}

export interface MarkdownHeading {
  id: string;
  text: string;
  level: number;
}

export interface MarkdownRenderOptions {
  documentPath?: string;
  resolveAssetUrl?: (path: string) => string;
  resolveDocumentUrl?: (path: string, anchor?: string) => string;
  privateAssets?: boolean;
}

function isExternalOrAbsoluteUrl(value: string) {
  return /^(?:[a-z][a-z\d+.-]*:|\/|#)/iu.test(value);
}

export function resolveDocumentAssetPath(documentPath: string, assetPath: string) {
  return resolveDocumentReference(documentPath, assetPath).split(/[?#]/u)[0];
}

export function resolveDocumentReference(documentPath: string, reference: string) {
  const directory = documentPath.includes('/')
    ? documentPath.slice(0, documentPath.lastIndexOf('/') + 1)
    : '';
  const resolved = new URL(reference, `https://docs.local/${directory}`);
  const encodedPath = resolved.pathname.replace(/^\//u, '');
  try {
    return `${decodeURIComponent(encodedPath)}${decodeURIComponent(resolved.search)}${decodeURIComponent(resolved.hash)}`;
  } catch {
    return `${encodedPath}${resolved.search}${resolved.hash}`;
  }
}

export function renderMarkdown(source: string, options: MarkdownRenderOptions = {}) {
  const sanitized = DOMPurify.sanitize(markdown.render(source), {
    ADD_ATTR: ['target', 'rel', 'data-doc-path'],
  });
  const parsed = new DOMParser().parseFromString(`<div id="document-root">${sanitized}</div>`, 'text/html');
  const root = parsed.getElementById('document-root');
  const headings: MarkdownHeading[] = [];
  const usedIds = new Set<string>();
  root?.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const text = heading.textContent || '';
    const id = createHeadingId(text, usedIds);
    heading.id = id;
    headings.push({ id, text, level: Number(heading.tagName.slice(1)) });
  });
  root?.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (options.privateAssets && /^(?:\/|(?:data|javascript|file):)/i.test(href)) {
      link.removeAttribute('href');
      return;
    }
    if (/^https?:\/\//iu.test(href)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      return;
    }
    if (!href || href.startsWith('#') || /^(?:mailto:|tel:|\/|[a-z][a-z\d+.-]*:)/iu.test(href)) return;
    const resolved = resolveDocumentReference(options.documentPath || '', href);
    const pathOnly = resolved.split(/[?#]/u)[0];
    const anchor = resolved.includes('#') ? resolved.slice(resolved.indexOf('#') + 1) : '';
    if (/\.md$/iu.test(pathOnly)) {
      link.setAttribute('data-doc-path', pathOnly);
      if (anchor) link.setAttribute('data-doc-anchor', anchor);
      if (options.resolveDocumentUrl) link.setAttribute('href', options.resolveDocumentUrl(pathOnly, anchor));
      return;
    }
    if (options.resolveAssetUrl) {
      link.setAttribute('href', options.resolveAssetUrl(pathOnly));
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
  root?.querySelectorAll('img[src], source[src]').forEach((asset) => {
    const sourcePath = asset.getAttribute('src') || '';
    if (options.privateAssets) {
      asset.removeAttribute('srcset');
      if (!sourcePath || isExternalOrAbsoluteUrl(sourcePath)) {
        asset.removeAttribute('src');
        return;
      }
    }
    if (!sourcePath || isExternalOrAbsoluteUrl(sourcePath) || !options.resolveAssetUrl) return;
    asset.setAttribute(
      'src',
      options.resolveAssetUrl(resolveDocumentAssetPath(options.documentPath || '', sourcePath)),
    );
  });
  if (options.privateAssets)
    root
      ?.querySelectorAll('video,audio,source,form,button,input,textarea,select')
      .forEach((element) => element.remove());
  if (options.privateAssets)
    root?.querySelectorAll('[srcset]').forEach((element) => element.removeAttribute('srcset'));
  return { html: root?.innerHTML || '', headings };
}
