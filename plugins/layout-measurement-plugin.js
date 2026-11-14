import { fileURLToPath, URL as NodeURL } from 'node:url';

const runtime = fileURLToPath(
  new NodeURL('../packages/preview-ui/src/admin-controls/runtime/', import.meta.url),
).replaceAll('\\', '/');
const controls = 'apps/admin/src/components/ui/';
const replacements = new Map([
  [
    `${runtime}${controls}ListFilterBar.tsx`,
    [
      ['setAvailable(node.getBoundingClientRect().width)', 'setAvailable(node.clientWidth)'],
      ['root.current?.getBoundingClientRect().width', 'root.current?.clientWidth'],
      ['node.getBoundingClientRect().width', 'node.offsetWidth'],
      ['moreTrigger.current?.getBoundingClientRect().width', 'moreTrigger.current?.offsetWidth'],
    ],
  ],
  [
    `${runtime}${controls}data-table/DataTable.tsx`,
    [
      ['header.getBoundingClientRect().height', 'header.offsetHeight'],
      [
        'if (!contentLayout || !root || !element) return;',
        'if (!contentLayout || !root || !element || !columns.some(column => column.getIsPinned())) return;',
      ],
    ],
  ],
  [
    `${runtime}${controls}data-table/ListCapabilities.tsx`,
    [['bar.getBoundingClientRect().height', 'bar.offsetHeight']],
  ],
]);

/** Layout measurements stay in CSS pixels inside a scaled Screen. Adapt only
 * these fixed controls; popup positioning still uses actual viewport coordinates. */
export function layoutMeasurementAdapter() {
  return {
    name: 'preview-layout-measurement',
    enforce: 'pre',
    transform(source, id) {
      const changes = replacements.get(id.split('?')[0].replaceAll('\\', '/'));
      if (!changes) return;
      let code = source;
      for (const [before, after] of changes) {
        if (code.split(before).length !== 2) {
          throw new Error(`Layout measurement source changed: ${id} (${before})`);
        }
        code = code.replace(before, after);
      }
      return { code, map: null };
    },
  };
}
