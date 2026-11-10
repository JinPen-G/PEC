import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import {
  clockText,
  clockValue,
  hierarchicalOptions,
  pickerValue,
} from '../../packages/component-library/src/rimo-rental/lib/rimo-control-values.js';

describe('RIMO control value contracts', () => {
  const tree = [
    {
      id: 'company',
      label: '车行',
      children: [{ id: 'store', label: '门市', children: [{ id: 'station', label: '据点' }] }],
    },
  ];
  it('keeps complete cascader paths and configurable identity fields', () => {
    const result = hierarchicalOptions(tree, { value: 'id', emitPath: true });
    expect(result[0].disabled).toBe(true);
    expect(result.at(-1)).toEqual({
      value: '["company","store","station"]',
      originalValue: ['company', 'store', 'station'],
      label: '车行 / 门市 / 据点',
      disabled: false,
    });
  });

  it('supports flat multi-selection and inherited disabled organizations', () => {
    expect(hierarchicalOptions(tree, { value: 'id', checkStrictly: true })[0]).toMatchObject({
      value: 'company',
      originalValue: 'company',
      disabled: false,
    });
    const disabled = hierarchicalOptions([{ ...tree[0], disabled: true }], {
      value: 'id',
      checkStrictly: true,
    });
    expect(disabled.every((option) => option.disabled)).toBe(true);
  });

  it('preserves Date objects unless the source requests a formatted string', () => {
    const date = dayjs('2026-11-09 09:30:00');
    expect(pickerValue(date)).toEqual(date.toDate());
    expect(pickerValue(date, 'YYYY-MM-DD')).toBe('2026-11-09');
    expect(pickerValue(null)).toBeNull();
  });

  it('edits only the time without replacing a range or changing its date', () => {
    const previous = new Date(2026, 10, 9, 8, 30);
    const changed = clockValue('19:15', previous);
    expect(changed).toEqual(new Date(2026, 10, 9, 19, 15));
    expect(previous.getHours()).toBe(8);
    expect(clockText(changed)).toBe('19:15');
    expect(clockValue('19:15', previous, 'HH:mm')).toBe('19:15');
    expect(clockText('08:30')).toBe('08:30');
  });

  it.each(['25:00', '11:99', '11:30:80', 'unknown'])('does not invent a valid time for %s', (value) => {
    expect(clockValue(value)).toBeNull();
  });
});
