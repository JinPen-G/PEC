// i18n 资源完整性自检：zh-Hant 与 en 的 key 集合必须完全一致（防漏翻/多翻）。
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const LOCALES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../apps/platform-react/src/i18n/locales',
);

function flattenKeys(object, prefix = '') {
  return Object.keys(object).flatMap((key) => {
    const value = object[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' ? flattenKeys(value, fullKey) : [fullKey];
  });
}

const namespaces = [
  'chrome', 'home', 'workspace', 'routes', 'packages',
  'console', 'ai', 'health', 'docs', 'dialogs', 'common',
];

describe('i18n 资源完整性', () => {
  it('每个命名空间的 zh-Hant 与 en key 集合完全一致', () => {
    for (const ns of namespaces) {
      const zhHant = JSON.parse(
        readFileSync(path.join(LOCALES_DIR, 'zh-Hant', `${ns}.json`), 'utf8'),
      );
      const en = JSON.parse(
        readFileSync(path.join(LOCALES_DIR, 'en', `${ns}.json`), 'utf8'),
      );
      const zhKeys = new Set(flattenKeys(zhHant));
      const enKeys = new Set(flattenKeys(en));
      const missingInEn = [...zhKeys].filter((key) => !enKeys.has(key));
      const missingInZh = [...enKeys].filter((key) => !zhKeys.has(key));
      expect(missingInEn, `${ns}: en 缺少 key`).toEqual([]);
      expect(missingInZh, `${ns}: zh-Hant 缺少 key`).toEqual([]);
    }
  });

  it('zh-Hant 资源不应混入简体字特征字（平台为繁体）', () => {
    // 抽样常见简体特征字；资源正文应保持繁体
    const simplifiedMarkers = ['项目', '数据', '切换', '客户端', '文档', '设置'];
    for (const ns of namespaces) {
      const content = readFileSync(path.join(LOCALES_DIR, 'zh-Hant', `${ns}.json`), 'utf8');
      for (const marker of simplifiedMarkers) {
        expect(content.includes(marker), `${ns}: 发现简体字样 ${marker}`).toBe(false);
      }
    }
  });
});
