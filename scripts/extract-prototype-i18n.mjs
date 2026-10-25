// 从原型 HTML 提取中文可见文本，生成 en 字典骨架（key=原文，value=空待填）。
// 已有字典的 key 会保留（不覆盖人工已填内容）。
// 用法：node scripts/extract-prototype-i18n.mjs [prototypesRoot]
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { parse } from 'node-html-parser';

import { walkFiles } from '../packages/project-core/src/index.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prototypesRoot = path.resolve(process.argv[2] || path.join(repositoryRoot, '..', 'RIMORental', '02_原型和PRD', '原型'));

const CJK = /[\u3400-\u9fff\uf900-\ufaff]/u;

function extractTexts(source) {
  const root = parse(source, { comment: false });
  const texts = new Set();
  // roots 对齐运行时（[data-page-content] + [data-page-overlay] + body 全页）
  const scope = [...root.querySelectorAll('[data-page-content], [data-page-overlay]'), root.querySelector('body')].filter(Boolean);
  for (const area of scope) {
    for (const node of area.querySelectorAll('*')) {
      if (['script', 'style', 'noscript', 'textarea', 'code', 'pre'].includes(node.tagName?.toLowerCase() || '')) continue;
      // Vue 插值以外的纯文本（整节点 trim 口径对齐运行时）
      for (const child of node.childNodes) {
        if (child.nodeType === 3 && child.rawText && CJK.test(child.rawText)) {
          const trimmed = child.rawText.trim();
          if (trimmed && CJK.test(trimmed)) texts.add(trimmed);
        }
      }
      for (const attr of ['placeholder', 'title', 'aria-label']) {
        const value = node.getAttribute(attr);
        if (value && CJK.test(value)) texts.add(value.trim());
      }
    }
  }
  return [...texts];
}

async function main() {
  let updated = 0;
  for (const absolutePath of await walkFiles(prototypesRoot, { extensions: new Set(['.html', '.htm']) })) {
    const source = await fs.readFile(absolutePath, 'utf8');
    if (!source.includes('id="prototype-i18n"')) continue;
    const dictMatch = /<script id="prototype-i18n" type="application\/json">([\s\S]*?)<\/script>/u.exec(source);
    let dict;
    try {
      dict = JSON.parse(dictMatch[1].trim() || '{}');
    } catch {
      continue;
    }
    const en = dict.en && typeof dict.en === 'object' ? dict.en : {};
    const before = Object.keys(en).length;
    for (const text of extractTexts(source)) {
      if (!(text in en)) en[text] = '';
    }
    const after = Object.keys(en).length;
    if (after > before) {
      dict.en = Object.fromEntries(Object.entries(en).sort(([a], [b]) => a.localeCompare(b)));
      const updatedSource = source.replace(
        /(<script id="prototype-i18n" type="application\/json">)[\s\S]*?(<\/script>)/u,
        `$1${JSON.stringify(dict, null, 2)}$2`,
      );
      await fs.writeFile(absolutePath, updatedSource, 'utf8');
      updated += 1;
      console.log(`+ ${path.relative(prototypesRoot, absolutePath)}: ${before} → ${after} keys`);
    }
  }
  console.log(`\n更新 ${updated} 个字典骨架（value 待填英文翻译）`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
