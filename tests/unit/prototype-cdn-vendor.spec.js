// 原型页 CDN 依赖本地化：改写只作用于平台服务的 HTML，源文件与源码下载不受影响。
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  PROTOTYPE_CDN_ASSETS,
  prototypeVendorFilePath,
  prototypeVendorMimeType,
  rewritePrototypeCdnAssets,
} from '../../packages/project-core/src/index.js';

const VENDOR_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../vendor/prototype-cdn');

describe('rewritePrototypeCdnAssets', () => {
  it('把清单中全部 CDN 地址改写为本地 vendor 路径', () => {
    const source = PROTOTYPE_CDN_ASSETS.map(
      (asset) => `<script src="${asset.url}"></script>`,
    ).join('\n');
    const output = rewritePrototypeCdnAssets(source);
    for (const asset of PROTOTYPE_CDN_ASSETS) {
      expect(output).toContain(`/__vendor/prototype-cdn/${asset.file}`);
      expect(output).not.toContain(asset.url);
    }
  });

  it('静态构建模式使用 base 前缀', () => {
    const [first] = PROTOTYPE_CDN_ASSETS;
    const output = rewritePrototypeCdnAssets(`<script src="${first.url}"></script>`, '/prototype/Rental/vendor/prototype-cdn');
    expect(output).toBe(`<script src="/prototype/Rental/vendor/prototype-cdn/${first.file}"></script>`);
  });

  it('不含 CDN 地址的 HTML 原样返回', () => {
    const source = '<html><body><p>保持原文</p></body></html>';
    expect(rewritePrototypeCdnAssets(source)).toBe(source);
  });

  it('改写后 vendor 目录内每个映射文件都真实存在且非空', () => {
    for (const asset of PROTOTYPE_CDN_ASSETS) {
      const stat = readFileSync(path.join(VENDOR_ROOT, asset.file));
      expect(stat.length, `${asset.file} 不应为空`).toBeGreaterThan(0);
    }
  });
});

describe('prototypeVendorFilePath', () => {
  it('只放行清单内文件名，拒绝路径穿越', () => {
    expect(prototypeVendorFilePath('vue@3.4.21.global.prod.js')).toBe('vue@3.4.21.global.prod.js');
    expect(prototypeVendorFilePath('../package.json')).toBeNull();
    expect(prototypeVendorFilePath('unknown.js')).toBeNull();
    expect(prototypeVendorFilePath('')).toBeNull();
  });

  it('按扩展名返回 MIME 类型', () => {
    expect(prototypeVendorMimeType('vue@3.4.21.global.prod.js')).toContain('text/javascript');
    expect(prototypeVendorMimeType('element-plus@2.8.0.index.css')).toContain('text/css');
  });
});
