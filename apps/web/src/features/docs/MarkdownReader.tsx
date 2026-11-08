import { memo, useEffect, useMemo, useRef, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert } from '@preview/ui/admin';
import { renderMarkdown, type MarkdownHeading } from './markdown';
import { LoadingStage } from '@preview/ui/loading';
import { siteDocument } from './site-document';

type MermaidInstance = (typeof import('mermaid'))['default'];

let mermaidModulePromise: Promise<MermaidInstance> | null = null;
let mermaidRenderSequence = 0;

function loadMermaid() {
  return (mermaidModulePromise ??= import('mermaid').then((module) => {
    // Vite production builds may unwrap a package's default export during
    // dynamic import, while development keeps the module namespace object.
    // Normalize both shapes before using Mermaid so the production bundle does
    // not fail before the diagram container is created.
    const candidate = (module as { default?: unknown }).default;
    const mermaid =
      candidate && typeof candidate === 'object' && 'initialize' in candidate
        ? (candidate as MermaidInstance)
        : (module as unknown as MermaidInstance);
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default' });
    return mermaid;
  }));
}

function replaceMermaidBlockWithError(block: HTMLElement, message: string) {
  const parent = block.parentElement;
  if (!parent) return;
  const container = document.createElement('div');
  container.className = 'mermaid-error';
  container.textContent = `圖表渲染失敗：${message}`;
  parent.replaceWith(container);
}

function findMermaidBlocks(article: HTMLElement | null) {
  return Array.from(article?.querySelectorAll<HTMLElement>('pre > code') ?? []).filter((code) =>
    code.classList.contains('language-mermaid'),
  );
}

export const MarkdownReader = memo(function MarkdownReader({
  source,
  loading,
  error,
  onHeadings,
  resolveAssetUrl,
  documentPath,
  resolveDocumentUrl,
  onDocumentNavigate,
  activeAnchor,
  privateAssets,
  layout,
}: {
  source: string;
  loading: boolean;
  error?: string;
  onHeadings?: (headings: MarkdownHeading[]) => void;
  resolveAssetUrl?: (path: string) => string;
  documentPath?: string;
  resolveDocumentUrl?: (path: string, anchor?: string) => string;
  onDocumentNavigate?: (path: string, anchor?: string) => void;
  activeAnchor?: string;
  privateAssets?: boolean;
  layout?: 'site';
}) {
  const { t } = useTranslation();
  const articleRef = useRef<HTMLElement>(null);
  const rendered = useMemo(
    () => renderMarkdown(source, { documentPath, resolveAssetUrl, resolveDocumentUrl, privateAssets }),
    [documentPath, resolveAssetUrl, resolveDocumentUrl, source, privateAssets],
  );
  const html = useMemo(
    () => (layout === 'site' ? siteDocument(rendered.html) : rendered.html),
    [layout, rendered.html],
  );

  function handleArticleClick(event: MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement | null;
    const link = target?.closest<HTMLAnchorElement>('a[data-doc-path]');
    if (link && onDocumentNavigate) {
      event.preventDefault();
      onDocumentNavigate(link.dataset.docPath || '', link.dataset.docAnchor || '');
      return;
    }

    const anchor = target?.closest<HTMLAnchorElement>('a[href^="#"]');
    const anchorId = anchor?.getAttribute('href')?.slice(1);
    if (!anchor || !anchorId) return;
    let decodedId = anchorId;
    try {
      decodedId = decodeURIComponent(anchorId);
    } catch {
      // 保留不完整的字面錨點，避免文檔鏈接中斷頁面交互。
    }
    const heading = articleRef.current?.querySelector<HTMLElement>(`#${CSS.escape(decodedId)}`);
    if (!heading) return;
    event.preventDefault();
    heading.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
  }

  useEffect(() => onHeadings?.(rendered.headings), [onHeadings, rendered.headings]);

  useEffect(() => {
    if (!findMermaidBlocks(articleRef.current).length) return;
    let cancelled = false;
    void loadMermaid()
      .then(async (mermaid) => {
        // The outline callback can update the parent while Mermaid is loading,
        // which may replace the article's children. Query the live DOM again
        // instead of retaining detached code-block nodes from the first pass.
        const blocks = findMermaidBlocks(articleRef.current);
        for (const [index, code] of blocks.entries()) {
          if (cancelled || !code.parentElement) return;
          const container = document.createElement('div');
          container.className = 'mermaid-diagram';
          code.parentElement.replaceWith(container);
          try {
            const result = await mermaid.render(
              `react-prd-${++mermaidRenderSequence}-${index}`,
              code.textContent || '',
            );
            if (cancelled) return;
            container.innerHTML = result.svg;
            result.bindFunctions?.(container);
          } catch (renderError) {
            container.className = 'mermaid-error';
            container.textContent = `圖表渲染失敗：${renderError instanceof Error ? renderError.message : '未知錯誤'}`;
          }
        }
      })
      .catch((loadError) => {
        if (cancelled) return;
        const message = loadError instanceof Error ? loadError.message : 'Mermaid 模塊加載失敗';
        findMermaidBlocks(articleRef.current).forEach((block) =>
          replaceMermaidBlockWithError(block, message),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [html]);

  useEffect(() => {
    if (!activeAnchor || loading) return;
    const frame = window.requestAnimationFrame(() => {
      articleRef.current?.querySelector<HTMLElement>(`#${CSS.escape(activeAnchor)}`)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeAnchor, loading, html]);

  if (loading) return <LoadingStage />;
  if (error) return <Alert type="error" showIcon title={t('docs.readError')} description={error} />;
  return (
    <article
      ref={articleRef}
      className={layout === 'site' ? 'markdown-body showcase-document-body' : 'markdown-body'}
      onClick={handleArticleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
