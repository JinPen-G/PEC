// 清理 en 字典骨架中无法静态翻译的 Vue 插值 key（{{ ... }}）。
// 插值在运行时才计算，字典无法按模板源码匹配；运行时翻译针对渲染后的文本。
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { walkFiles } from '../packages/project-core/src/index.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prototypesRoot = path.resolve(process.argv[2] || path.join(repositoryRoot, '..', 'RIMORental', '02_原型和PRD', '原型'));

async function main() {
  let cleaned = 0;
  for (const absolutePath of await walkFiles(prototypesRoot, { extensions: new Set(['.html']) })) {
    const source = await fs.readFile(absolutePath, 'utf8');
    const match = /<script id="prototype-i18n" type="application\/json">([\s\S]*?)<\/script>/u.exec(source);
    if (!match) continue;
    let dict;
    try {
      dict = JSON.parse(match[1].trim() || '{}');
    } catch {
      continue;
    }
    if (!dict.en) continue;
    const before = Object.keys(dict.en).length;
    dict.en = Object.fromEntries(
      Object.entries(dict.en).filter(([key]) => !key.includes('{{')),
    );
    if (Object.keys(dict.en).length < before) {
      const updated = source.replace(
        /(<script id="prototype-i18n" type="application\/json">)[\s\S]*?(<\/script>)/u,
        `$1${JSON.stringify(dict, null, 2)}$2`,
      );
      await fs.writeFile(absolutePath, updated, 'utf8');
      cleaned += 1;
    }
  }
  console.log(`清理 ${cleaned} 个文件的插值 key`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
