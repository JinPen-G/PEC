import { parse } from 'node-html-parser';

export const rimoControlKinds = new Set(
  [
    'alert',
    'avatar',
    'badge',
    'button',
    'button-group',
    'card',
    'carousel',
    'carousel-item',
    'cascader',
    'checkbox',
    'checkbox-group',
    'col',
    'date-picker',
    'descriptions',
    'descriptions-item',
    'dialog',
    'divider',
    'drawer',
    'dropdown',
    'dropdown-item',
    'dropdown-menu',
    'empty',
    'form',
    'form-item',
    'icon',
    'image',
    'input',
    'input-number',
    'link',
    'option',
    'option-group',
    'pagination',
    'popconfirm',
    'popover',
    'progress',
    'radio',
    'radio-button',
    'radio-group',
    'row',
    'segmented',
    'select',
    'step',
    'steps',
    'switch',
    'tab-pane',
    'table',
    'table-column',
    'tabs',
    'tag',
    'time-picker',
    'time-select',
    'timeline',
    'timeline-item',
    'tooltip',
    'tree',
    'tree-select',
    'upload',
  ].map((name) => `el-${name}`),
);

const directives = new Set([
  'v-for',
  'v-if',
  'v-else',
  'v-else-if',
  'v-show',
  'v-cloak',
  'v-model',
  'v-model:current-page',
  'v-model:page-size',
  'v-html',
]);
const eventNames = {
  keydown: 'KeyDown',
  keyup: 'KeyUp',
  dblclick: 'DoubleClick',
  mouseenter: 'MouseEnter',
  mouseleave: 'MouseLeave',
  mousedown: 'MouseDown',
  mouseup: 'MouseUp',
  dragstart: 'DragStart',
  dragover: 'DragOver',
  dragend: 'DragEnd',
  dragenter: 'DragEnter',
  dragleave: 'DragLeave',
  drop: 'Drop',
};
export const rimoEventProperty = (event) =>
  `on${eventNames[event] ?? event.replace(/(^|-)([a-z])/g, (_match, _separator, letter) => letter.toUpperCase())}`;
export function rimoScopedSelector(selector, scope, classes = []) {
  const escaped = classes.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const root = escaped.length
    ? new RegExp(`^(?:${escaped.map((name) => `\\.${name}`).join('|')})(?=$|\\s|[.#:\\[])`)
    : null;
  let next = selector;
  if (root?.test(next)) next = next.replace(root, scope);
  else if (/^(?:html|body|:root|:host|#app)(?=$|\s|[.#:]|\[)/.test(next))
    next = next.replace(/^(?:html|body|:root|:host|#app)/, scope);
  else next = `${scope} ${next}`;
  return next;
}

export function rimoThemeColors(value) {
  const colors = {
    '#fff': '--app-color-panel',
    '#ffffff': '--app-color-panel',
    '#f8fafc': '--app-color-surface-muted',
    '#f9fafb': '--app-color-surface-muted',
    '#f1f5f9': '--app-color-surface-muted',
    '#f3f4f6': '--app-color-surface-muted',
    '#f5f5f5': '--app-color-surface-muted',
    '#e2e8f0': '--app-color-border',
    '#e5e7eb': '--app-color-border',
    '#d1d5db': '--app-color-border',
    '#dbe3ea': '--app-color-border',
    '#94a3b8': '--app-color-text-secondary',
    '#9ca3af': '--app-color-text-secondary',
    '#64748b': '--app-color-text-secondary',
    '#6b7280': '--app-color-text-secondary',
    '#475569': '--app-color-text-secondary',
    '#334155': '--app-color-text',
    '#374151': '--app-color-text',
    '#1f2937': '--app-color-text',
    '#1e293b': '--app-color-text',
    '#111827': '--app-color-text',
    '#0f172a': '--app-color-text',
    '#000': '--app-color-text',
    '#000000': '--app-color-text',
    '#3b82f6': '--app-color-primary',
    '#2563eb': '--app-color-primary',
    '#007aff': '--app-color-primary',
  };
  return value.replace(/#[\da-f]{3,8}\b/gi, (color) =>
    colors[color.toLowerCase()] ? `var(${colors[color.toLowerCase()]})` : color,
  );
}
const allNodes = (surface) =>
  [surface.content, ...surface.overlays].flatMap((root) => [root, ...root.querySelectorAll('*')]);
const hasClass = (node, name) => (node.getAttribute('class') ?? '').split(/\s+/).includes(name);
const children = (node) => node.childNodes.filter((child) => child.nodeType === 1);
const tag = (node) => node.rawTagName?.toLowerCase();

export function rimoTemplateContract(surface) {
  return allNodes(surface)
    .flatMap((node) =>
      Object.entries(node.attributes ?? {})
        .filter(
          ([name]) =>
            name.startsWith('v-') ||
            name.startsWith('@') ||
            name.startsWith(':') ||
            name === 'ref' ||
            (tag(node) === 'el-table-column' && ['label', 'prop'].includes(name)),
        )
        .map(([name, value]) => JSON.stringify([tag(node), name, value])),
    )
    .sort();
}

export function assertRimoSupportedMarkup(surface, pageKey) {
  for (const node of allNodes(surface)) {
    if (tag(node)?.startsWith('el-') && !rimoControlKinds.has(tag(node)))
      throw new Error(`${pageKey}: unsupported control ${tag(node)}`);
    for (const name of Object.keys(node.attributes ?? {})) {
      if (name.startsWith('v-') && !name.startsWith('v-slot:') && !directives.has(name))
        throw new Error(`${pageKey}: unsupported directive ${name}`);
      if (name.startsWith('@')) {
        const [, ...modifiers] = name.slice(1).split('.');
        if (modifiers.some((modifier) => !['stop', 'prevent', 'enter'].includes(modifier)))
          throw new Error(`${pageKey}: unsupported event modifier ${name}`);
      }
    }
  }
}

export function adaptRimoBusinessLayout(surface, page) {
  assertRimoSupportedMarkup(surface, page.pageKey);
  const before = rimoTemplateContract(surface);
  const adapted = { headings: 0, tableToolbars: 0, summaries: 0, formGrids: 0, decorations: 0 };
  if (page.clientId === 'email' && !surface.content.hasAttribute('data-business-content'))
    return { ...adapted, contractEntries: before.length, preserved: true };
  const root = surface.content;
  root.setAttribute('data-rimo-layout', 'page');
  const title = root.querySelector('h1');
  if (title) {
    let heading = title.parentNode;
    if (
      heading !== root &&
      children(heading).every((node) => ['h1', 'p', 'span'].includes(tag(node))) &&
      heading.parentNode !== root
    )
      heading = heading.parentNode;
    if (heading !== root && !heading.querySelector('el-table, el-form')) {
      heading.setAttribute('data-rimo-layout', 'heading');
      adapted.headings++;
    }
  }
  for (const table of root.querySelectorAll('el-table')) {
    const panel = table.parentNode;
    if (panel === root || tag(panel) !== 'div') continue;
    const peers = children(panel);
    if (
      !panel.querySelector('h1, h2, el-form') &&
      peers.filter((node) => tag(node) === 'el-table').length === 1
    )
      panel.setAttribute('data-rimo-layout', 'list');
    const filters = peers.find(
      (node) =>
        node !== table &&
        tag(node) === 'div' &&
        node.querySelector('el-input, el-select, el-cascader, el-date-picker') &&
        !node.querySelector('el-table, el-form, el-tabs, h1, h2, h3') &&
        Object.keys(node.attributes).every((name) => ['class', 'style', 'data-page-node-id'].includes(name)),
    );
    if (!filters || peers.filter((node) => tag(node) === 'el-table').length !== 1) continue;
    const toolbar = parse('<template #toolbar></template>').firstChild;
    for (const node of [...filters.childNodes]) toolbar.appendChild(node);
    filters.remove();
    table.appendChild(toolbar);
    adapted.tableToolbars++;
  }
  for (const node of children(root)) {
    if (
      !node.hasAttribute('data-rimo-layout') &&
      node.querySelector('el-input, el-select, el-cascader') &&
      !node.querySelector('el-table, el-form, h1, h2, el-dialog, el-tabs')
    )
      node.setAttribute('data-rimo-layout', 'filters');
  }
  for (const node of allNodes(surface)) {
    const items = children(node);
    if (
      items.length &&
      (hasClass(node, 'summary-grid') ||
        hasClass(node, 'stats-grid') ||
        (items.length > 1 &&
          items.every(
            (item) =>
              tag(item) === 'div' &&
              item.hasAttribute('@click') &&
              !item.querySelector('el-table, el-form, el-input, el-select'),
          )))
    ) {
      node.setAttribute('data-rimo-layout', 'summary');
      for (const item of items) item.setAttribute('data-rimo-layout', 'stat');
      adapted.summaries++;
    }
    if (
      (hasClass(node, 'grid') || hasClass(node, 'form-grid')) &&
      items.filter((item) => tag(item) === 'el-form-item').length > 1
    ) {
      node.setAttribute('data-rimo-layout', 'form-grid');
      adapted.formGrids++;
    }
    if (
      !node.getAttribute('data-rimo-layout') &&
      (hasClass(node, 'filter-toolbar') || hasClass(node, 'filter-bar'))
    )
      node.setAttribute('data-rimo-layout', 'filters');
    if (hasClass(node, 'prototype-permission-switcher')) node.setAttribute('data-rimo-layout', 'permissions');
    if (
      tag(node) === 'div' &&
      !node.textContent.trim() &&
      items.length === 0 &&
      hasClass(node, 'pointer-events-none') &&
      /\bbg-gradient-/.test(node.getAttribute('class') ?? '') &&
      Object.keys(node.attributes).every((name) => ['class', 'style'].includes(name))
    ) {
      node.remove();
      adapted.decorations++;
    }
  }
  const after = rimoTemplateContract(surface);
  if (JSON.stringify(before) !== JSON.stringify(after))
    throw new Error(
      `${page.pageKey}: layout adaptation changed a field, action, condition, reference or column`,
    );
  return { ...adapted, contractEntries: before.length, preserved: true };
}
