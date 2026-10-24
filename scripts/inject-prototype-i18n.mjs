// 批量为原型 HTML 页面接入语言切换协议（幂等，只增不改既有代码）：
//   1. <html lang="zh-Hant">（缺省时补默认基础语言声明）
//   2. <script id="prototype-i18n" type="application/json">{"en":{}}</script>（可选字典块，作者后续填充）
//   3. <script data-prototype-i18n-runtime>（语言桥运行时：繁简转换 + 字典应用 + 顶栏切换控件）
// 用法：node scripts/inject-prototype-i18n.mjs [prototypesRoot]
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { PROTOTYPE_I18N_RUNTIME_SCRIPT } from '../packages/project-core/src/index.js';
import { walkFiles } from '../packages/project-core/src/index.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prototypesRoot = path.resolve(process.argv[2] || path.join(repositoryRoot, '..', 'RIMORental', '02_原型和PRD', '原型'));

const HTML_EXTENSIONS = new Set(['.html', '.htm']);
const LANG_DEFAULT = 'zh-Hant';
const DICT_BLOCK = '<script id="prototype-i18n" type="application/json">{"en":{}}</script>';
const RUNTIME_TAG = '<script data-prototype-i18n-runtime>';

function inject(source) {
  let updated = source;
  const changes = [];

  // 1) <html lang> 缺省声明
  const htmlTag = /<html\b([^>]*)>/iu.exec(updated);
  if (htmlTag && !/\blang=/iu.test(htmlTag[1])) {
    updated = updated.replace(htmlTag[0], `<html lang="${LANG_DEFAULT}"${htmlTag[1]}>`);
    changes.push('lang');
  }

  // 2) 字典块（放在 </head> 前；已存在则跳过）
  if (!updated.includes('id="prototype-i18n"')) {
    if (updated.includes('</head>')) {
      updated = updated.replace('</head>', `${DICT_BLOCK}\n</head>`);
      changes.push('dict');
    }
  }

  // 3) 运行时（放在 </body> 前；已存在则跳过）
  if (!updated.includes('data-prototype-i18n-runtime')) {
    if (updated.includes('</body>')) {
      updated = updated.replace('</body>', `${RUNTIME_TAG}\n${PROTOTYPE_I18N_RUNTIME_SCRIPT}\n</script>\n</body>`);
      changes.push('runtime');
    }
  }

  return { updated, changes };
}

async function main() {
  let files = 0;
  let modified = 0;
  const summary = { dict: 0, runtime: 0, lang: 0 };
  for (const absolutePath of await walkFiles(prototypesRoot, { extensions: HTML_EXTENSIONS })) {
    files += 1;
    const source = await fs.readFile(absolutePath, 'utf8');
    const { updated, changes } = inject(source);
    if (changes.length) {
      await fs.writeFile(absolutePath, updated, 'utf8');
      modified += 1;
      for (const change of changes) summary[change] += 1;
      console.log(`+ ${path.relative(prototypesRoot, absolutePath)} (${changes.join(', ')})`);
    }
  }
  console.log(`\n扫描 ${files} 个 HTML，注入 ${modified} 个：lang=${summary.lang} dict=${summary.dict} runtime=${summary.runtime}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
