import { createElement, memo, useEffect, useMemo, useRef, type MouseEvent, type ReactNode } from 'react';
import { SITE_ACCENTS } from '@preview/ui';
import { ArrowRight } from 'lucide-react';
import { renderMarkdown, type MarkdownHeading } from '@/features/docs/markdown';
import { SourcePanel } from './SourcePanel';
import { useShowcaseText } from './showcase-locale';
import './guide-body.css';

const colorTokens = new Set([
  '--background',
  '--surface',
  '--surface-raised',
  '--surface-muted',
  '--foreground',
  '--text-secondary',
  '--text-muted',
  '--border',
  '--border-subtle',
  '--border-strong',
  '--accent',
  '--accent-strong',
  '--accent-subtle',
  '--success',
  '--warning',
  '--danger',
  '--info',
]);
const elementClasses: Record<string, string> = {
  dl: 'library-docs_defs__rKfvJ',
  ul: 'library-docs_list__bETPU',
  ol: 'library-docs_steps___R3KD',
  h3: 'library-docs_subhead__l9zJy',
  h4: 'library-docs_minorhead__ihsF5',
};
const supportedTags = new Set([
  'a',
  'p',
  'div',
  'span',
  'strong',
  'em',
  'code',
  'kbd',
  'br',
  'hr',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'dl',
  'dt',
  'dd',
  'ul',
  'ol',
  'li',
  'blockquote',
]);

export const GuideBody = memo(function GuideBody({
  source,
  documentPath,
  projectId,
  resolveDocumentUrl,
  onHeadings,
  activeAnchor,
}: {
  source: string;
  documentPath: string;
  projectId: string;
  resolveDocumentUrl: (file: string, anchor?: string) => string;
  onHeadings: (headings: MarkdownHeading[]) => void;
  activeAnchor?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const text = useShowcaseText();
  const parsed = useMemo(() => {
    const markdown = source
      .replaceAll('{{origin}}', window.location.origin)
      .replaceAll('{{projectId}}', projectId);
    const result = renderMarkdown(markdown, { documentPath, resolveDocumentUrl });
    const document = new DOMParser().parseFromString(result.html, 'text/html');
    const sections: { id: string; nodes: Node[] }[] = [];
    for (const node of [...document.body.childNodes]) {
      if (node instanceof Element && /^H[12]$/.test(node.tagName)) sections.push({ id: node.id, nodes: [] });
      if (!sections.length) sections.push({ id: '', nodes: [] });
      sections.at(-1)!.nodes.push(node);
    }
    return { sections, headings: result.headings };
  }, [source, documentPath, projectId, resolveDocumentUrl]);
  useEffect(() => onHeadings(parsed.headings), [parsed.headings, onHeadings]);
  useEffect(() => {
    if (!activeAnchor) return;
    const frame = requestAnimationFrame(() => {
      root.current?.querySelector<HTMLElement>(`#${CSS.escape(activeAnchor)}`)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeAnchor, parsed]);

  const renderNode = (node: Node, key: string): ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (!(node instanceof Element)) return null;
    const children = () => [...node.childNodes].map((child, index) => renderNode(child, `${key}-${index}`));
    if (node.getAttribute('data-guide-example') === 'next-steps')
      return (
        <div key={key} className="library-docs_cards__3I1_w">
          {[...node.querySelectorAll('li')].map((item, index) => {
            const link = item.querySelector('a[href]');
            if (!link) return null;
            const title = link.textContent ?? '';
            const description = (item.textContent ?? '').slice(title.length).replace(/^[:：]\s*/, '');
            return (
              <a key={index} className="library-docs_card__PVOg9" href={link.getAttribute('href')!}>
                <strong>{title}</strong>
                <span>{description}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            );
          })}
        </div>
      );
    if (node.getAttribute('data-guide-example') === 'accents')
      return (
        <div key={key} className="library-docs_accents__BRKFM">
          {SITE_ACCENTS.map((accent) => (
            <span key={accent.key}>
              <i aria-hidden="true" style={{ background: accent.color }} />
              <code>{accent.key}</code>
            </span>
          ))}
        </div>
      );
    if (node.tagName === 'PRE') {
      const code = node.querySelector('code');
      const language = code?.className.replace('language-', '') ?? '';
      const label = ['sh', 'bash', 'powershell'].includes(language)
        ? text('终端')
        : language === 'text'
          ? text('提示词')
          : language.toUpperCase();
      return (
        <SourcePanel
          key={key}
          fileName={label || text('源码')}
          source={(code?.textContent ?? node.textContent ?? '').replace(/\n$/, '')}
          plain={language === 'text' || language === 'sh' || language === 'bash' || language === 'powershell'}
        />
      );
    }
    if (node.tagName === 'TABLE') {
      const rows = [...node.querySelectorAll('tr')];
      return (
        <div key={key} role="table" className="library-docs_table__mLlrf">
          {rows.map((row, rowIndex) => {
            const cells = [...row.children];
            const header = cells.every((cell) => cell.tagName === 'TH');
            return (
              <div
                key={rowIndex}
                role="row"
                className={`library-docs_row__lJECr${cells.length === 3 ? ' library-docs_row3__nCo8f' : ''}${header ? ' library-docs_head__KZnEX' : ''}`}
              >
                {cells.map((cell, cellIndex) => {
                  const token = cell.querySelector('code')?.textContent ?? '';
                  const swatch = cellIndex === 0 && colorTokens.has(token);
                  return (
                    <span
                      key={cellIndex}
                      role={header ? 'columnheader' : 'cell'}
                      className={swatch ? 'library-docs_token__rN99f' : undefined}
                    >
                      {swatch && (
                        <i
                          aria-hidden="true"
                          data-color-token={token}
                          style={{ background: `var(${token})` }}
                        />
                      )}
                      {[...cell.childNodes].map((child, index) =>
                        renderNode(child, `${key}-${rowIndex}-${cellIndex}-${index}`),
                      )}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    }
    const tag = node.tagName.toLowerCase();
    if (!supportedTags.has(tag)) return children();
    const attributes: Record<string, string> = {};
    for (const name of ['id', 'href', 'target', 'rel', 'title']) {
      const value = node.getAttribute(name);
      if (value !== null) attributes[name] = value;
    }
    return createElement(tag, { key, ...attributes, className: elementClasses[tag] }, ...children());
  };
  const followAnchor = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest('a[href^="#"]');
    const href = link?.getAttribute('href');
    if (!href || href.startsWith('#/')) return;
    let anchor;
    try {
      anchor = decodeURIComponent(href.slice(1));
    } catch {
      return;
    }
    const target = root.current?.querySelector<HTMLElement>(`#${CSS.escape(anchor)}`);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start',
    });
  };
  return (
    <div ref={root} className="showcase-guide-body" onClick={followAnchor}>
      {parsed.sections.map((section, index) => (
        <section
          key={section.id || index}
          className="library-docs_section__WJnkm"
          aria-labelledby={section.id || undefined}
        >
          {section.nodes.map((node, nodeIndex) => renderNode(node, `${index}-${nodeIndex}`))}
        </section>
      ))}
    </div>
  );
});
