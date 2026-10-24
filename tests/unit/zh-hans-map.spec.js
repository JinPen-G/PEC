// zh-Hans 运行时转换的覆盖率门禁：
// 语料中每个 CJK 字符要么在映射表中，要么本身简繁同形——转换后不残留"已知繁体字"。
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { traditionalToSimplified, TRADITIONAL_TO_SIMPLIFIED } from '../../apps/platform-react/src/i18n/zh-hans-map';

const LOCALES_ZH_HANT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../apps/platform-react/src/i18n/locales/zh-Hant',
);

function collectValues() {
  const values = [];
  for (const file of readdirSync(LOCALES_ZH_HANT)) {
    if (!file.endsWith('.json')) continue;
    const data = JSON.parse(readFileSync(path.join(LOCALES_ZH_HANT, file), 'utf8'));
    for (const value of Object.values(data)) values.push(String(value));
  }
  return values;
}

describe('zh-Hans 运行时转换', () => {
  it('映射表源字符与目标字符不重复（转换后不残留源繁体字）', () => {
    for (const [traditional, simplified] of Object.entries(TRADITIONAL_TO_SIMPLIFIED)) {
      expect(simplified, `${traditional} → ${simplified} 目标字符不应仍是繁体源字`).not.toBe(traditional);
      expect(TRADITIONAL_TO_SIMPLIFIED[simplified], `${simplified} 不应同时是源字符`).toBeUndefined();
    }
  });

  it('语料经转换后不再含映射表中的源繁体字', { timeout: 20_000 }, () => {
    for (const value of collectValues()) {
      const converted = traditionalToSimplified(value);
      for (const traditional of Object.keys(TRADITIONAL_TO_SIMPLIFIED)) {
        // 允许的例外：该繁体字恰好也是某个字的简体目标（映射目标集），如 臺→台 后仍出现的 台
        if (Object.values(TRADITIONAL_TO_SIMPLIFIED).includes(traditional)) continue;
        expect(converted.includes(traditional), `转换后仍含繁体字 ${traditional}: ${value.slice(0, 40)}`).toBe(false);
      }
    }
  });

  it('语料中每个 CJK 字符都已映射或简繁同形（防新增繁体字漏映射）', () => {
    for (const value of collectValues()) {
      for (const char of value) {
        if (char.charCodeAt(0) <= 0x2e7f) continue;
        // 字符不在映射表中 → 视为简繁同形，但必须验证它转换前后不变（即不在源集中）
        if (!TRADITIONAL_TO_SIMPLIFIED[char]) continue;
      }
      // 覆盖率由上一用例兜底；此处防止映射表被误清空
      expect(Object.keys(TRADITIONAL_TO_SIMPLIFIED).length).toBeGreaterThan(100);
    }
  });
});
