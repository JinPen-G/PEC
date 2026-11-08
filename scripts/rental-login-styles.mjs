/** Select fixed upstream login/field rules; keep every declaration unchanged.
 * Only the bundled background URL is adapted to Preview's local snapshot. */
import postcss from 'postcss';

export function rentalLoginStyles(source) {
  const root = postcss.parse(source);
  const select = (container) => {
    for (const node of [...container.nodes]) {
      if (node.type === 'rule') {
        const selectors = node.selectors.filter((selector) =>
          /\.(?:login-|arc-form-field|arc-password-field|arc-segmented|language-toggle|sider-link-switch)/u.test(
            selector,
          ),
        );
        if (!selectors.length) node.remove();
        else node.selectors = selectors;
      } else if (node.type === 'atrule' && node.nodes) {
        select(node);
        if (!node.nodes.length) node.remove();
      } else node.remove();
    }
  };
  select(root);
  return (
    '/* Generated from the fixed Rental OS styles.css; do not edit. */\n' +
    root
      .toString()
      .replaceAll(
        '"/brand/login-graphite.webp"',
        '"../upstream/rental-admin/apps/admin/public/brand/login-graphite.webp"',
      )
  );
}
