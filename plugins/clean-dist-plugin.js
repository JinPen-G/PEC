import { promises as fs } from 'node:fs';
import path from 'node:path';

import { removePathReliably } from '../packages/project-core/src/index.js';

// Node 24 在部分 Windows 路径（例如包含中文的目录）上 fs.rm 会静默不生效，
// Vite 内置的 emptyOutDir 因此形同虚设，dist 里会逐次堆积历史构建产物。
// 该插件在构建开始前自行清空输出目录，语义与 vite.config.js 中的 emptyOutDir: true 对齐。
const KEEP_ENTRIES = new Set(['.git']);

export function cleanDistPlugin() {
  let outDir = '';

  return {
    name: 'clean-dist',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async buildStart() {
      const entries = await fs.readdir(outDir, { withFileTypes: true }).catch(() => []);
      for (const entry of entries) {
        if (KEEP_ENTRIES.has(entry.name)) continue;
        await removePathReliably(path.join(outDir, entry.name)).catch((error) => {
          throw new Error(`清理构建输出目录失败（${entry.name}）：${error.message}`);
        });
      }
    },
  };
}
