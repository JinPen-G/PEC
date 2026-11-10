export function csvContent(columns, records) {
  const quote = value => {
    const text = value == null ? '' : String(value);
    const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [columns.map(column => quote(column.label)).join(','), ...records.map(row => columns.map(column => quote(typeof column.read === 'function' ? column.read(row) : row[column.key])).join(','))].join('\r\n');
}

export function downloadCsv(filename, columns, records) {
  const url = URL.createObjectURL(new Blob([csvContent(columns, records)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function numericValue(value) {
  if (value == null || value === '' || value === 'NA') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function booleanValue(value) {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  return null;
}

export function validCoordinates(latitude, longitude) {
  const lat = numericValue(latitude);
  const lon = numericValue(longitude);
  return lat !== null && lon !== null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}

export function flattenOrganization(items, { prefix = '', includeParents = false } = {}) {
  return items.flatMap(item => {
    const label = [prefix, item.label ?? item.name].filter(Boolean).join(' / ');
    const value = item.value ?? item.id;
    const children = item.children ?? [];
    return [...(!children.length || includeParents ? [{ label, value, disabled: Boolean(item.disabled) }] : []), ...flattenOrganization(children, { prefix: label, includeParents })];
  });
}
