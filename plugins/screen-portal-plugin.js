import { fileURLToPath, URL } from 'node:url';

const runtime = fileURLToPath(new URL('../packages/preview-ui/src/admin-controls/runtime/apps/admin/src/components/ui/', import.meta.url)).replaceAll('\\', '/');
const dialog = fileURLToPath(new URL('../packages/preview-ui/src/screen-dialog.tsx', import.meta.url));

/** Preserve fixed source bytes and the single Radix instance; only the two
 * business overlay primitives receive the optional Screen portal boundary. */
export function screenPortalAdapter() {
  return {
    name: 'preview-screen-portal',
    enforce: 'pre',
    resolveId(source, importer) {
      const parent = importer?.split('?')[0].replaceAll('\\', '/');
      if (source === '@radix-ui/react-dialog' && (parent === `${runtime}Dialog.tsx` || parent === `${runtime}TaskDrawer.tsx`)) return dialog;
    },
  };
}
