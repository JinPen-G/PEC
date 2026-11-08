// i18n 资源完整性自检：zh-Hant 与 en 的 key 集合必须完全一致（防漏翻/多翻）。
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const LOCALES_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../apps/web/src/i18n/locales',
);

function flattenKeys(object, prefix = '') {
  return Object.keys(object).flatMap((key) => {
    const value = object[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' ? flattenKeys(value, fullKey) : [fullKey];
  });
}

const namespaces = [
  'chrome',
  'home',
  'workspace',
  'routes',
  'packages',
  'console',
  'ai',
  'health',
  'docs',
  'dialogs',
  'common',
];

// 简体专用特征词（字符级扫描，覆盖常见简繁差异）
const SIMPLIFIED_MARKERS = [
  '项目',
  '数据',
  '切换',
  '客户端',
  '文档',
  '设置',
  '视图',
  '网络',
  '服务',
  '组件',
  '确认',
  '删除',
  '备份',
  '标签',
  '属性',
  '默认',
  '用户',
  '权限',
  '记录',
  '验证',
  '访问',
  '关联',
  '后端',
  '启动',
  '预览',
  '上传',
  '下载',
  '软件',
  '紧急',
  '确认框',
];

const EMPTY_VALUE_WHITELIST = new Set(['common.unit.count']);

// 提取 {{var}} 插值变量集合
function interpolationVars(value) {
  return new Set([...String(value).matchAll(/\{\{(\w+)\}\}/gu)].map((match) => match[1]));
}

describe('i18n 资源完整性', () => {
  it('每个命名空间的 zh-Hant 与 en key 集合完全一致', () => {
    for (const ns of namespaces) {
      const zhHant = JSON.parse(readFileSync(path.join(LOCALES_DIR, 'zh-Hant', `${ns}.json`), 'utf8'));
      const en = JSON.parse(readFileSync(path.join(LOCALES_DIR, 'en', `${ns}.json`), 'utf8'));
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
    for (const ns of namespaces) {
      const content = readFileSync(path.join(LOCALES_DIR, 'zh-Hant', `${ns}.json`), 'utf8');
      for (const marker of SIMPLIFIED_MARKERS) {
        expect(content.includes(marker), `${ns}: 发现简体字样 ${marker}`).toBe(false);
      }
    }
  });

  it('zh/en 同 key 的插值变量集合一致', () => {
    for (const ns of namespaces) {
      const zhHant = JSON.parse(readFileSync(path.join(LOCALES_DIR, 'zh-Hant', `${ns}.json`), 'utf8'));
      const en = JSON.parse(readFileSync(path.join(LOCALES_DIR, 'en', `${ns}.json`), 'utf8'));
      for (const key of Object.keys(zhHant)) {
        const zhVars = interpolationVars(zhHant[key] ?? '');
        const enVars = interpolationVars(en[key] ?? '');
        const missing = [...zhVars].filter((v) => !enVars.has(v));
        const extra = [...enVars].filter((v) => !zhVars.has(v));
        expect(missing, `${ns}.${key}: en 缺少插值变量`).toEqual([]);
        expect(extra, `${ns}.${key}: en 多出插值变量`).toEqual([]);
      }
    }
  });

  it('跨命名空间重复 key 的值必须一致（zh 与 en 各自校验）', () => {
    for (const locale of ['zh-Hant', 'en']) {
      const merged = {};
      const duplicates = new Map();
      for (const ns of namespaces) {
        const data = JSON.parse(readFileSync(path.join(LOCALES_DIR, locale, `${ns}.json`), 'utf8'));
        for (const [key, value] of Object.entries(data)) {
          if (key in merged && merged[key].value !== value) {
            duplicates.set(key, `${merged[key].ns} vs ${ns}`);
          }
          merged[key] = { ns, value };
        }
      }
      expect([...duplicates.entries()], `${locale}: 跨 ns 重复且值不一致的 key`).toEqual([]);
    }
  });

  it('en 值非空（白名单除外）', () => {
    for (const ns of namespaces) {
      const en = JSON.parse(readFileSync(path.join(LOCALES_DIR, 'en', `${ns}.json`), 'utf8'));
      for (const [key, value] of Object.entries(en)) {
        if ([...EMPTY_VALUE_WHITELIST].some((allowed) => key === allowed || key.endsWith(`.${allowed}`)))
          continue;
        expect(String(value).trim().length > 0, `${ns}.${key}: en 值为空`).toBe(true);
      }
    }
  });
});
