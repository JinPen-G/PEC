import { parse } from '@babel/parser';
import postcss from 'postcss';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const shellMetricNames = [
  'panelInset',
  'sidebarWidth',
  'sidebarCollapsedWidth',
  'topRowHeight',
  'workspaceHeight',
  'workspaceMarkSize',
  'triggerSize',
  'accountHeight',
  'tenantNameSize',
  'tenantNameLineHeight',
  'workspaceNameSize',
  'workspaceNameLineHeight',
];

function fixedTokens(source) {
  const names = [
    'ADMIN_LAYOUT_SPACING',
    'ADMIN_SHELL_METRICS',
    'ADMIN_TYPOGRAPHY',
    'ADMIN_SIDEBAR_REFERENCE_MOTION',
  ];
  const constants = new Map();
  for (const statement of parse(source, { sourceType: 'module', plugins: ['typescript'] }).program.body) {
    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (declaration?.type !== 'VariableDeclaration') continue;
    for (const member of declaration.declarations) {
      if (member.id.type === 'Identifier' && names.includes(member.id.name))
        constants.set(member.id.name, member.init);
    }
  }
  const read = (node) => {
    if (node?.type === 'TSAsExpression') return read(node.expression);
    if (node?.type === 'NumericLiteral' || node?.type === 'StringLiteral') return node.value;
    if (node?.type === 'ArrayExpression') return node.elements.map(read);
    if (node?.type === 'ObjectExpression') {
      const value = {};
      for (const property of node.properties) {
        if (
          property.type !== 'ObjectProperty' ||
          property.computed ||
          property.key.type !== 'Identifier' ||
          property.key.name in value
        )
          throw new Error('Invalid fixed console token');
        value[property.key.name] = read(property.value);
      }
      return value;
    }
    if (
      node?.type === 'MemberExpression' &&
      !node.computed &&
      node.object.type === 'Identifier' &&
      node.property.type === 'Identifier' &&
      node.object.name === 'ADMIN_LAYOUT_SPACING'
    )
      return read(constants.get(node.object.name))[node.property.name];
    if (node?.type === 'BinaryExpression' && node.operator === '+') {
      const left = read(node.left),
        right = read(node.right);
      if (typeof left === 'number' && typeof right === 'number') return left + right;
    }
    throw new Error('Unsupported fixed console token expression');
  };
  const values = Object.fromEntries(names.map((name) => [name, read(constants.get(name))]));
  const metrics = values.ADMIN_SHELL_METRICS;
  if (
    Object.keys(metrics).length !== shellMetricNames.length ||
    shellMetricNames.some((name) => !Number.isInteger(metrics[name]) || metrics[name] <= 0)
  )
    throw new Error('Incomplete fixed console metrics');
  const typography = values.ADMIN_TYPOGRAPHY.body;
  if (
    ['size', 'lineHeight', 'weight'].some(
      (name) => !Number.isInteger(typography[name]) || typography[name] <= 0,
    )
  )
    throw new Error('Invalid fixed console typography');
  return {
    metrics,
    typography,
    layout: values.ADMIN_LAYOUT_SPACING,
    motion: values.ADMIN_SIDEBAR_REFERENCE_MOTION,
  };
}

export function rentalConsoleMotion(tokens) {
  const { motion } = fixedTokens(tokens);
  return `export const CONSOLE_SIDEBAR_MOTION = ${JSON.stringify(motion, null, 2)} as const;\n`;
}

export function rentalConsoleStyles(styles, tokens) {
  const start = styles.indexOf(':root:has(.app-frame-stage[data-tenant-console])');
  if (
    start < 0 ||
    !styles.includes('.rental-sidebar-top-row') ||
    !styles.includes('.rental-sidebar-submenu-motion')
  )
    throw new Error('Missing fixed console styles');
  const { metrics, typography, layout } = fixedTokens(tokens);
  const variables = Object.entries(metrics).map(
    ([name, value]) =>
      `  --rental-shell-${name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)}: ${value}px;`,
  );
  const scope = '.preview-console-host:not(.preview-screen-stage)';
  const root = `:root:has(${scope})`;
  const navigation = ':is(.rental-sidebar-navigation, .rental-sidebar-colors [data-sidebar="content"])';
  const palette = postcss.parse(styles);
  palette.walkRules((rule) => {
    rule.selectors = rule.selectors.map((original) => {
      const selector = original
        .replaceAll('.app-frame-stage[data-tenant-console]', scope)
        .replaceAll('.rental-sidebar-navigation', navigation);
      if (selector.includes(scope)) return selector;
      if (/^(?:html|:root)(?=[\s.:#[>+~]|$)/u.test(selector))
        return selector.replace(/^(?:html|:root)/u, (prefix) => `${prefix}:has(${scope})`);
      return `${root} ${selector}`;
    });
  });
  return `/* Generated from Rental OS console-source-manifest.json; preserve the fixed source. */
:root:has(${scope}) {
${variables.join('\n')}
  --rental-layout-context-height: ${layout.contextHeight}px;
  --rental-layout-context-inline-start: ${layout.contextInlineStart};
  --rental-layout-context-inline-end: ${layout.contextInlineEnd};
  --rental-control-height-toolbar: 32px;
  --rental-sidebar-avatar-size: 32px;
  --rental-ui-radius-pill: 9999px;
  --rental-typography-body-size: ${typography.size}px;
  --rental-typography-body-line-height: ${typography.lineHeight}px;
  --rental-typography-body-weight: ${typography.weight};
}
${palette.toString()}
${scope} {
  padding: 0;
  --rental-workspace-inset: var(--rental-shell-panel-inset);
  --rental-layout-context-height: ${layout.contextHeight}px;
  --rental-layout-context-inline-start: ${layout.contextInlineStart};
  --rental-layout-context-inline-end: ${layout.contextInlineEnd};
  --rental-typography-body-size: ${typography.size}px;
  --rental-typography-body-line-height: ${typography.lineHeight}px;
  --rental-typography-body-weight: ${typography.weight};
  background: var(--rental-sidebar-surface);
  font-size: var(--rental-typography-body-size);
  font-weight: var(--rental-typography-body-weight);
  line-height: var(--rental-typography-body-line-height);
}
${scope} .preview-native-root.app-shell { border: 0; border-radius: 0; box-shadow: none; }
${scope} .app-workspace {
  margin: var(--rental-workspace-inset) var(--rental-workspace-inset) var(--rental-workspace-inset) 0;
  background: var(--rental-shell-panel);
  border-color: var(--rental-shell-border);
}
${scope} [data-sidebar='header'] [data-sidebar='brand-mark'] > :is(svg, img) {
  width: 100%;
  height: 100%;
}
${scope} .preview-native-content { background: transparent; }
${scope} .preview-context-header {
  height: auto;
  min-height: var(--rental-layout-context-height);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: minmax(var(--rental-layout-context-height), auto) auto;
  column-gap: var(--space-2);
  row-gap: 0;
  padding: 0 var(--rental-layout-context-inline-end) var(--space-2) var(--rental-layout-context-inline-start);
}
${scope} .preview-context-location { grid-column: 1; grid-row: 1; padding: 0; }
${scope} .preview-context-actions { grid-column: 2; grid-row: 1; gap: var(--space-1); padding: 0; }
${scope} .preview-context-time { grid-column: 1 / -1; grid-row: 2; display: flex; justify-content: flex-end; min-height: 20px; }
${scope} .preview-context-time .workspace-clock { font-size: 11px; line-height: 20px; }
${scope} .preview-breadcrumb-separator { color: var(--text-muted); }
@media (max-width: 767px) {
  ${scope} .app-workspace { margin: var(--rental-workspace-inset); }
  ${scope} .preview-context-header { grid-template-columns: minmax(0, 1fr) auto; }
  ${scope} .preview-context-actions { flex-wrap: wrap; justify-content: flex-end; max-width: 240px; }
}
@media (max-width: 640px) {
  ${scope} .app-workspace { margin: 0; border: 0; border-radius: 0; }
}
`;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const root = fileURLToPath(new URL('../packages/preview-ui/', import.meta.url));
  const tokens = readFileSync(
    path.join(root, 'upstream/rental-console/apps/admin/src/app/designTokens.ts'),
    'utf8',
  );
  const styles = readFileSync(
    path.join(root, 'upstream/rental-console/apps/admin/src/components/animate-sidebar/sidebar-adapter.css'),
    'utf8',
  );
  writeFileSync(path.join(root, 'src/console-source.css'), rentalConsoleStyles(styles, tokens));
  writeFileSync(path.join(root, 'src/console-motion.ts'), rentalConsoleMotion(tokens));
}
