// 批量为原型 HTML 页面接入/升级语言切换协议（幂等，只增改协议块，不动既有代码）：
//   1. <html lang="zh-Hant">（缺省时补默认基础语言声明）
//   2. <script id="prototype-i18n" type="application/json"> 字典块（作者维护，注入时清理空值/插值 key）
//   3. <script data-prototype-i18n-runtime="<版本>"> 语言桥运行时（版本升级时替换旧块）
// 默认跳过 Email 模板目录（邮件资产不应混入脚本）；--include-email 可显式包含。
// 用法：node scripts/inject-prototype-i18n.mjs [prototypesRoot]
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  PROTOTYPE_I18N_RUNTIME_SCRIPT,
  PROTOTYPE_I18N_RUNTIME_VERSION,
} from '../packages/project-core/src/index.js';
import { walkFiles } from '../packages/project-core/src/index.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prototypesRoot = path.resolve(
  process.argv[2] || path.join(repositoryRoot, '..', 'RIMORental', '02_原型和PRD', '原型'),
);
const SKIP_DIR_NAMES = new Set(['Email信件模板']);
const HTML_EXTENSIONS = new Set(['.html', '.htm']);
const LANG_DEFAULT = 'zh-Hant';
const RUNTIME_MARKER = 'data-prototype-i18n-runtime';

const DICT_BLOCK_PREFIX = '<script id="prototype-i18n" type="application/json">';
const RUNTIME_BLOCK_PREFIX = `<script ${RUNTIME_MARKER}="${PROTOTYPE_I18N_RUNTIME_VERSION}">`;

// 清理字典：空值 key（骨架残留，运行时会忽略但徒增噪音）与 Vue 插值 key（运行时无法静态匹配）
function cleanDictionary(source) {
  const match = /<script id="prototype-i18n" type="application\/json">([\s\S]*?)<\/script>/u.exec(source);
  if (!match) return { source, removed: 0 };
  let dict;
  try {
    dict = JSON.parse(match[1].trim() || '{}');
  } catch {
    return { source, removed: 0 };
  }
  let removed = 0;
  for (const locale of Object.keys(dict)) {
    const entries = dict[locale];
    if (!entries || typeof entries !== 'object') continue;
    for (const [key, value] of Object.entries(entries)) {
      if (key.includes('{{') || typeof value !== 'string' || !value.trim()) {
        delete entries[key];
        removed += 1;
      }
    }
    const remaining = Object.keys(entries).length;
    if (!remaining && locale !== 'en') delete dict[locale]; // en 空对象保留作协议声明
  }
  if (!removed) return { source, removed: 0 };
  if (!dict.en) dict.en = {};
  const serialized = `${DICT_BLOCK_PREFIX}${JSON.stringify(dict, null, 2)}</script>`;
  const next = serialized
    ? source.replace(match[0], serialized)
    : source.replace(match[0], '').replaceAll('\n\n\n', '\n\n');
  return { source: next, removed };
}

function inject(source) {
  let updated = source;
  const changes = [];

  // 1) <html lang> 缺省声明
  const htmlTag = /<html\b([^>]*)>/iu.exec(updated);
  if (htmlTag && !/\blang=/iu.test(htmlTag[1])) {
    updated = updated.replace(htmlTag[0], `<html lang="${LANG_DEFAULT}"${htmlTag[1]}>`);
    changes.push('lang');
  }

  // 2) 字典块（head 尾；缺失时补空骨架，已有则清理空值/插值 key）
  if (!/<script id="prototype-i18n"/iu.test(updated)) {
    if (updated.includes('</head>')) {
      updated = updated.replace('</head>', `${DICT_BLOCK_PREFIX}{"en":{}}</script>\n</head>`);
      changes.push('dict');
    }
  } else {
    const cleaned = cleanDictionary(updated);
    if (cleaned.removed) {
      updated = cleaned.source;
      changes.push(`dict-clean(${cleaned.removed})`);
    }
  }

  // 3) 运行时块：版本化替换（旧版本/无版本标记一律升级为当前版本）
  const runtimePattern = new RegExp(
    `<script ${RUNTIME_MARKER}(="[^"]*")?>[\\s\\S]*?</script>`,
    'u',
  );
  const hasRuntime = runtimePattern.test(updated);
  if (hasRuntime) {
    const current = `<script ${RUNTIME_MARKER}="${PROTOTYPE_I18N_RUNTIME_VERSION}">`;
    if (!updated.includes(current)) {
      updated = updated.replace(runtimePattern, `${RUNTIME_BLOCK_PREFIX}\n${PROTOTYPE_I18N_RUNTIME_SCRIPT}\n</script>`);
      changes.push(`runtime-upgraded(v${PROTOTYPE_I18N_RUNTIME_VERSION})`);
    }
  } else {
    const bodyCloseIndex = updated.lastIndexOf('</body>');
    if (bodyCloseIndex !== -1) {
      updated =
        updated.slice(0, bodyCloseIndex) +
        `${RUNTIME_BLOCK_PREFIX}\n${PROTOTYPE_I18N_RUNTIME_SCRIPT}\n</script>\n` +
        updated.slice(bodyCloseIndex);
      changes.push(`runtime(v${PROTOTYPE_I18N_RUNTIME_VERSION})`);
    } else {
      console.warn(`  ! 无 </body>，跳过运行时注入：${path.basename(prototypesRoot)}`);
    }
  }

  return { updated, changes };
}

async function main() {
  const includeEmail = process.argv.includes('--include-email');
  let files = 0;
  let modified = 0;
  const summary = {};
  for (const absolutePath of await walkFiles(prototypesRoot, { extensions: HTML_EXTENSIONS })) {
    if (!includeEmail && absolutePath.split(path.sep).some((segment) => SKIP_DIR_NAMES.has(segment))) {
      continue;
    }
    files += 1;
    const source = await fs.readFile(absolutePath, 'utf8');
    const { updated, changes } = inject(source);
    if (changes.length) {
      await fs.writeFile(absolutePath, updated, 'utf8');
      modified += 1;
      for (const change of changes) summary[change] = (summary[change] || 0) + 1;
      console.log(`+ ${path.relative(prototypesRoot, absolutePath)} (${changes.join(', ')})`);
    }
  }
  console.log(`\n扫描 ${files} 个 HTML，注入/升级 ${modified} 个：`, JSON.stringify(summary));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
