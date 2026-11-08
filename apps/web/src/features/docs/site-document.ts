/** Adapts already sanitized Markdown to the observed UIARC reading structure.
 * Only presentation changes: original text, safe links, IDs and diagrams stay. */
export function siteDocument(html: string) {
  const document = new DOMParser().parseFromString(`<article>${html}</article>`, 'text/html');
  const root = document.querySelector('article')!;
  let section: HTMLElement | null = null;
  for (const node of [...root.childNodes]) {
    if (node instanceof HTMLElement && /^(H1|H2)$/.test(node.tagName)) {
      section = document.createElement('section');
      section.className = 'docs_section__uRfmU';
      section.setAttribute('aria-labelledby', node.id);
      const head = document.createElement('div');
      head.className = 'docs_sectionHead__FNONV';
      root.insertBefore(section, node);
      head.append(node);
      section.append(head);
    } else if (section) section.append(node);
  }
  root.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((heading) => {
    if (!heading.id || heading.querySelector('a')) return;
    const link = document.createElement('a');
    link.className = 'docs_anchor__uE8Zx';
    link.href = `#${encodeURIComponent(heading.id)}`;
    link.append(...heading.childNodes);
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('width', '14');
    icon.setAttribute('height', '14');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '1.75');
    icon.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(icon.namespaceURI, 'path');
    path.setAttribute(
      'd',
      'M10 13a5 5 0 0 0 7 .5l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7-.5l-3 3a5 5 0 0 0 7 7l2-2',
    );
    icon.append(path);
    link.append(icon);
    heading.append(link);
  });
  root.querySelectorAll('ul').forEach((list) => list.classList.add('docs_notes__6jcWA'));
  root.querySelectorAll('table').forEach((table) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'showcase-document-table';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', table.caption?.textContent || 'PRD table');
    table.replaceWith(wrapper);
    wrapper.append(table);
  });
  return root.innerHTML;
}
