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
export function rimoContainerQuery(value) {
  const query = value.replace(/^screen\s+and\s+/i, '').trim();
  const width = '\\(\\s*(?:(?:min|max)-width\\s*:|width\\s*[<>]=?)\\s*[\\d.]+(?:px|rem|em)\\s*\\)';
  return new RegExp(`^${width}(?:\\s+and\\s+${width})*$`, 'i').test(query) ? query : null;
}
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
const queryControls = 'el-input, el-select, el-cascader, el-tree-select, el-date-picker, el-time-picker';
const listTables = 'el-table, table';
const listCount =
  /^(?:(?:共|共計|共计|合計|合计|顯示|显示)?\s*\{\{[^{}]+\}\}\s*(?:個|个|筆|笔|條|条|台|臺|輛|辆|位|項|项|家|人)\s*[^{}。；：:]{0,16}|(?:總數量|总数量|總計|总计)\s*\{\{[^{}]+\}\})$/;
const presentationToggle = /^(?:moreFiltersVisible|searchPanelExpanded|showAdvancedFilters|showMoreFilters)$/;
const layoutCondition = /^filterLayoutTier\s*(>=|<)\s*(\d+)$/;
const isPureContainer = (node) =>
  ['div', 'section', 'header'].includes(tag(node)) &&
  Object.entries(node.attributes).every(
    ([name, value]) =>
      ['class', 'style', 'data-page-node-id', 'data-rimo-layout'].includes(name) ||
      (name === 'ref' && value === 'filterToolbar') ||
      (['v-if', 'v-show'].includes(name) && presentationToggle.test(value.trim())),
  );

function removeListNotes(root) {
  let removed = 0;
  for (const node of root.querySelectorAll('span,p,div')) {
    if (
      children(node).length ||
      Object.keys(node.attributes).some(
        (name) => name.startsWith('@') || name.startsWith('v-') || name === 'ref',
      )
    )
      continue;
    if (!listCount.test(node.textContent.trim())) continue;
    let parent = node.parentNode;
    let protectedContent = false;
    while (parent && parent !== root) {
      if (
        ['el-table', 'el-table-column', 'table', 'button', 'el-button', 'el-pagination'].includes(
          tag(parent),
        ) ||
        /stat|metric/.test(parent.getAttribute('class') ?? '')
      )
        protectedContent = true;
      parent = parent.parentNode;
    }
    if (!protectedContent) {
      node.remove();
      removed++;
    }
  }
  return removed;
}

function normalizeFilterControls(filters, changes) {
  const descendants = () => filters.flatMap((root) => [root, ...root.querySelectorAll('*')]);
  const removeAttribute = (node, name) => {
    if (!node.hasAttribute(name)) return;
    changes.push(JSON.stringify([tag(node), name, node.getAttribute(name)]));
    node.removeAttribute(name);
  };
  const removeNode = (node) => {
    changes.push(...rimoTemplateContract({ content: node, overlays: [] }));
    node.remove();
  };
  const signature = (node) => {
    const copy = parse(node.toString()).firstChild;
    for (const element of [copy, ...copy.querySelectorAll('*')]) {
      element.removeAttribute('class');
      element.removeAttribute('style');
      if (layoutCondition.test(element.getAttribute('v-if') ?? '')) element.removeAttribute('v-if');
    }
    const content = (element) =>
      element.nodeType === 1
        ? [
            tag(element),
            Object.entries(element.attributes).sort(([first], [second]) => first.localeCompare(second)),
            element.childNodes.map(content).filter(Boolean),
          ]
        : element.textContent.trim() || null;
    return JSON.stringify(content(copy));
  };
  for (const node of descendants()) {
    const match = layoutCondition.exec(node.getAttribute('v-if') ?? '');
    if (!match || match[1] !== '>=') continue;
    const fallback = descendants().find((candidate) => {
      const other = layoutCondition.exec(candidate.getAttribute('v-if') ?? '');
      return other?.[1] === '<' && other[2] === match[2] && signature(candidate) === signature(node);
    });
    if (!fallback)
      throw new Error(`Unmatched responsive filter: ${node.getAttribute('v-model') ?? node.rawTagName}`);
    removeNode(fallback);
    removeAttribute(node, 'v-if');
  }
  for (const node of descendants()) {
    if (tag(node) === 'el-button' && !node.hasAttribute('icon') && !node.hasAttribute(':icon')) {
      const icon = children(node).find(
        (child) => tag(child) === 'el-icon' && !Object.keys(child.attributes).length,
      );
      const drawing = icon && children(icon)[0];
      if (drawing && !Object.keys(drawing.attributes).length && !drawing.childNodes.length) {
        node.setAttribute('icon', drawing.rawTagName);
        icon.remove();
      }
    }
    const condition = node.getAttribute('v-if') ?? node.getAttribute('v-show');
    if (condition && presentationToggle.test(condition.trim())) {
      removeAttribute(node, 'v-if');
      removeAttribute(node, 'v-show');
      for (const field of node.querySelectorAll(queryControls))
        field.setAttribute('data-rimo-secondary', 'true');
    }
    if (node.getAttribute('ref') === 'filterToolbar') removeAttribute(node, 'ref');
    if (
      ['el-button', 'button'].includes(tag(node)) &&
      /^(?:reset|clear)[\w]*(?:\(\))?$/i.test(node.getAttribute('@click') ?? '')
    ) {
      node.setAttribute('data-rimo-filter-reset', 'true');
      if (!node.hasAttribute('aria-label')) node.setAttribute('aria-label', '重置筛选');
    }
    if (
      ['el-button', 'button'].includes(tag(node)) &&
      /更多篩選|更多筛选|收起篩選|收起筛选/.test(node.textContent)
    ) {
      const action = node.getAttribute('@click')?.replace(/\s/g, '') ?? '';
      const toggle = /^([\w]+)=!\1$/.exec(action);
      if (toggle && presentationToggle.test(toggle[1])) removeNode(node);
    }
  }
}

function listFilters(table, root) {
  for (let container = table.parentNode; container?.rawTagName; container = container.parentNode) {
    if (!['div', 'section', 'template', 'el-tab-pane'].includes(tag(container))) break;
    const peers = children(container);
    const filters = peers.filter(
      (node) =>
        node !== table &&
        isPureContainer(node) &&
        node.querySelector(queryControls) &&
        !node.querySelector('el-table, table, el-form, el-tabs, h1, h2, h3'),
    );
    const tables = container.querySelectorAll(listTables);
    if (filters.length && tables.length === 1) return { container, tables, filters };
    if (
      filters.length &&
      tables.length > 1 &&
      tables.every(
        (item) =>
          tag(item.parentNode) === 'template' &&
          ['v-if', 'v-else-if', 'v-else'].some((name) => item.parentNode.hasAttribute(name)),
      )
    )
      return { container, tables, filters };
    if (container === root || tag(container) === 'el-tab-pane') break;
  }
  return null;
}

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
  const adapted = { headings: 0, tableToolbars: 0, summaries: 0, formGrids: 0, decorations: 0, listNotes: 0 };
  if (page.clientId === 'email' && !surface.content.hasAttribute('data-business-content')) {
    for (const table of surface.content.querySelectorAll('table')) {
      const width = Number(table.getAttribute('width') ?? 0);
      if (width > 300 || /(?:^|\s)(?:mail-frame|hero|card-shell|account-frame|app-panel)(?:\s|$)/.test(table.getAttribute('class') ?? ''))
        table.setAttribute('data-rimo-mail-fluid', 'true');
      const support = table.querySelector('.support-title');
      if (hasClass(table, 'app-panel') || (width > 300 && support?.closest('table[width]') === table))
        table.setAttribute('data-rimo-mail-stack', 'true');
    }
    return { ...adapted, contractEntries: rimoTemplateContract(surface).length, preserved: true };
  }
  const root = surface.content;
  const before = rimoTemplateContract(surface);
  const presentationChanges = [];
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
      if (title.parentNode === heading) {
        const copy = children(heading).filter((node) => ['h1', 'p'].includes(tag(node)));
        if (copy.length > 1) {
          heading.insertAdjacentHTML(
            'afterbegin',
            `<div>${copy.map((node) => node.toString()).join('')}</div>`,
          );
          for (const node of copy) node.remove();
        }
      }
      heading.setAttribute('data-rimo-layout', 'heading');
      adapted.headings++;
    }
  }
  const handled = new Set();
  for (const table of root.querySelectorAll(listTables)) {
    if (handled.has(table)) continue;
    const layout = listFilters(table, root);
    if (!layout) continue;
    const { container, filters, tables } = layout;
    for (const filter of filters) adapted.listNotes += removeListNotes(filter);
    for (const filter of filters) {
      const summaries = filter
        .querySelectorAll('div')
        .filter(
          (node) =>
            /(?:summary|stats|metric)/.test(node.getAttribute('class') ?? '') &&
            !node.querySelector(queryControls) &&
            node.textContent.trim(),
        );
      for (const summary of summaries) {
        if (summaries.some((parent) => parent !== summary && parent.contains(summary))) continue;
        summary.setAttribute('data-rimo-layout', 'list-summary');
        container.insertAdjacentHTML('afterbegin', summary.toString());
        summary.remove();
      }
    }
    normalizeFilterControls(filters, presentationChanges);
    if (container !== root) container.setAttribute('data-rimo-layout', 'list');
    const toolbar = parse('<template #toolbar></template>').firstChild;
    for (const filter of filters) {
      for (const node of [...filter.childNodes]) toolbar.appendChild(node);
      filter.remove();
    }
    if (tables.length === 1) table.appendChild(toolbar);
    else {
      container.setAttribute('data-rimo-list', 'true');
      container.appendChild(toolbar);
      for (const shared of tables) shared.setAttribute('data-rimo-shared-toolbar', 'true');
    }
    for (const item of tables) handled.add(item);
    adapted.tableToolbars += tables.length;
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
    const classes = node.getAttribute('class') ?? '';
    const columns = Number(/(?:^|\s)grid-cols-(\d+)(?=\s|$)/.exec(classes)?.[1] ?? 1);
    if (columns > 1 && !/(?:^|\s)[\w-]+:grid-cols-/.test(classes))
      node.setAttribute('data-rimo-grid', String(columns));
    if (!node.hasAttribute('data-rimo-layout') && hasClass(node, 'flex') && items.some(item => ['el-select', 'el-date-picker', 'el-time-picker', 'el-input-number'].includes(tag(item))) && !node.closest('el-table,table'))
      node.setAttribute('data-rimo-layout', 'field-row');
    if (
      ['stations-main-grid', 'employee-layout'].some((name) => hasClass(node, name)) ||
      /grid-template-columns:\s*\d+px\s+minmax/.test(node.getAttribute('style') ?? '')
    )
      node.setAttribute('data-rimo-layout', 'columns');
    if (
      !node.hasAttribute('data-rimo-layout') &&
      hasClass(node, 'flex') &&
      hasClass(node, 'justify-between') &&
      node.querySelector('el-button,button') &&
      node.textContent.trim().length > 40 &&
      !node.querySelector('el-table,table,el-form,el-tabs') &&
      !node.closest('el-table,table')
    )
      node.setAttribute('data-rimo-layout', 'toolbar');
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
      (items.filter((item) => tag(item) === 'el-form-item').length > 1 ||
        (columns > 1 && items.length > 1 && items.every((item) => item.querySelector(queryControls))))
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
  if (page.pageKey === 'dispatch') {
    const header = children(root)[0];
    if (header?.querySelector('h1')) {
      for (const child of header.querySelectorAll('[data-rimo-layout="heading"]'))
        child.removeAttribute('data-rimo-layout');
      header.setAttribute('data-rimo-layout', 'heading');
    }
  }
  const after = rimoTemplateContract(surface);
  if (JSON.stringify(before) !== JSON.stringify([...after, ...presentationChanges].sort()))
    throw new Error(
      `${page.pageKey}: layout adaptation changed a field, action, condition, reference or column`,
    );
  return { ...adapted, contractEntries: before.length, presentationChanges, preserved: true };
}
