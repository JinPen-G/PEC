/** Extract only settings/header and mode-switch rules from the fixed source. */
export function rentalSettingsStyles(styles, operator) {
  const selectors = ['.page-header', '.page-toolbar', '.page-title-row', '.page-title'];
  const rules = selectors.map((selector) => {
    const start = styles.indexOf(`${selector} {`);
    if (start < 0) throw new Error(`Missing fixed style: ${selector}`);
    const end = styles.indexOf('}', start);
    return styles.slice(start, end + 1);
  });
  const mode = operator.split('\n').slice(1, 6).join('\n');
  return `/* Generated from the fixed Rental OS source; regenerate with the importer. */\n${rules.join('\n')}\n${mode}\n`;
}

/** Panel reset rules belong to the dock, not the business page beside it. */
export function rentalSidePanelStyles(styles) {
  return styles
    .replaceAll('.ai-side-panel button', '.ai-side-panel :where(.asp-dock) button')
    .replaceAll('.ai-side-panel textarea', '.ai-side-panel :where(.asp-dock) textarea');
}
