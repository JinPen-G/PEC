import { parse } from 'node-html-parser';
import { createHash } from 'node:crypto';

export function mapRimoStyleAssets(style, assets) {
  return style.replace(/url\(\s*(['"]?)([^'"()]+)\1\s*\)/g, (match, _quote, url) => {
    if (/^(data:|#)/i.test(url)) return match;
    const variable = `--rimo-asset-${createHash('sha256').update(url).digest('hex').slice(0, 12)}`;
    assets[variable] = url;
    return `var(${variable}, none)`;
  });
}

export const authoredRimoPages = new Set([
  'vehicle-groups', 'vehicle-transfer', 'pricing',
]);

export const authoredRimoModels = new Set([
  ...authoredRimoPages, 'vehicles', 'tbox-management',
  'vehicle-status-list', 'vehicle-console', 'rental-companies', 'stores',
]);

const parseMarkup = (source) => parse(source, { comment: true, parseNoneClosedTags: true });
const region = (source, name) =>
  source.match(new RegExp(`<!--[^>]*${name}_START[^>]*-->([\\s\\S]*?)<!--[^>]*${name}_END[^>]*-->`))?.[1];
const sourceShell =
  '[data-prototype-shell], [data-shell-breadcrumb], .prototype-sidebar, .prototype-topbar, .prototype-brand, .prototype-user';

export function extractRimoBusinessSurface(source, { pageKey, clientId }) {
  const desktop = ['operation', 'enterprise'].includes(clientId);
  const pageRegion = region(source, 'PAGE_CONTENT');
  const structured = desktop || Boolean(pageRegion);
  const html = parseMarkup(pageRegion ?? source);
  const content = structured ? html.querySelector('[data-business-content]') : html.querySelector('body');
  if (!content)
    throw new Error(
      `${pageKey}: explicit business content is missing; importing an application shell is forbidden`,
    );
  if (content.querySelector(sourceShell))
    throw new Error(`${pageKey}: application chrome found inside business content`);
  const overlayRegion = region(source, 'PAGE_OVERLAYS');
  const overlayTree = overlayRegion ? parseMarkup(overlayRegion) : null;
  const overlays = (overlayTree?.querySelectorAll('el-dialog, el-drawer') ?? []).filter((node) => {
    for (let parent = node.parentNode; parent; parent = parent.parentNode)
      if (['el-dialog', 'el-drawer'].includes(parent.rawTagName?.toLowerCase())) return false;
    return true;
  });
  const document = parseMarkup(source);
  const scopeClasses = [];
  for (let parent = content.parentNode; parent?.rawTagName; parent = parent.parentNode)
    scopeClasses.push(...(parent.getAttribute('class') ?? '').split(/\s+/).filter(Boolean));
  const stylesheet = structured
    ? document
        .querySelectorAll('style[data-page-style]')
        .map((node) => node.textContent)
        .join('\n')
    : document
        .querySelectorAll('style')
        .map((node) => node.textContent)
        .join('\n');
  const nodes = [content, ...overlays].flatMap((root) => [root, ...root.querySelectorAll('*')]);
  const collect = (predicate) =>
    nodes.flatMap((node) =>
      Object.entries(node.attributes ?? {})
        .filter(([name]) => predicate(name))
        .map(([name, value]) => ({ name, value })),
    );
  return {
    content,
    overlays,
    stylesheet,
    scopeClasses,
    contract: {
      pageKey,
      clientId,
      fields: collect((name) => name === 'v-model' || name.startsWith('v-model:')),
      actions: collect((name) => name.startsWith('@')),
      conditions: collect((name) => ['v-if', 'v-else-if', 'v-show', ':disabled'].includes(name)),
      columns: nodes
        .filter((node) => node.rawTagName?.toLowerCase() === 'el-table-column')
        .map((node) => ({
          field: node.getAttribute('prop') ?? null,
          label: node.getAttribute('label') ?? null,
        })),
      overlays: nodes
        .filter((node) => ['el-dialog', 'el-drawer'].includes(node.rawTagName?.toLowerCase()))
        .map((node) => ({
          title: node.getAttribute('title') ?? node.getAttribute(':title'),
          state: node.getAttribute('v-model'),
        })),
    },
  };
}
