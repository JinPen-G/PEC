import dayjs from 'dayjs';

export function hierarchicalOptions(items, settings = {}) {
  const {
    value: valueKey = 'value',
    label: labelKey = 'label',
    children: childrenKey = 'children',
    emitPath = false,
    checkStrictly = false,
  } = settings;
  const walk = (entries, path = [], labels = [], parentDisabled = false) =>
    entries.flatMap((item) => {
      const value = item[valueKey] ?? item.id;
      const branch = [...path, value];
      const names = [...labels, item[labelKey] ?? item.name ?? String(value)];
      const descendants = item[childrenKey] ?? [];
      const disabled = parentDisabled || Boolean(item.disabled);
      return [
        {
          value: emitPath ? JSON.stringify(branch) : value,
          originalValue: emitPath ? branch : value,
          label: names.join(' / '),
          disabled: disabled || (!checkStrictly && descendants.length > 0),
        },
        ...walk(descendants, branch, names, disabled),
      ];
    });
  return walk(items ?? []);
}

export function pickerValue(value, format) {
  if (!value) return null;
  return format ? value.format(format) : value.toDate();
}

export function clockText(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(value)) return value;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('HH:mm') : '';
}

export function clockValue(text, previous, format) {
  if (!text) return null;
  const [hour, minute, second = 0] = text.split(':').map(Number);
  if (
    ![hour, minute, second].every(Number.isInteger) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  )
    return null;
  const parsed = previous && dayjs(previous);
  const base = parsed?.isValid() ? parsed : dayjs(new Date(2000, 0, 1));
  return pickerValue(base.hour(hour).minute(minute).second(second).millisecond(0), format);
}
