import vendorManifest from '../../../vendor/prototype-cdn/manifest.json' with { type: 'json' };

// 原型页统一从 CDN 加载 Vue / Element Plus / Tailwind 等渲染阻塞资源（每页 2~3.5MB，
// 跨 3 个外部主机）。平台在「服务给平台视图」时把这些地址改写为本仓库 vendor 目录的
// 固定版本副本：本地 API 模式走 /__vendor/prototype-cdn/，静态构建走 <base>vendor/prototype-cdn/。
// 原型源文件不改动；download=source 与项目包导出仍返回原始 CDN 地址，页面独立打开不受影响。
export const PROTOTYPE_CDN_ASSETS = Object.entries(vendorManifest.files).map(([file, url]) => ({
  file,
  url,
}));

const PROTOTYPE_VENDOR_FILES = new Set(PROTOTYPE_CDN_ASSETS.map((asset) => asset.file));
const PROTOTYPE_VENDOR_MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
]);

export function prototypeVendorFilePath(fileName) {
  return PROTOTYPE_VENDOR_FILES.has(fileName) ? fileName : null;
}

export function prototypeVendorMimeType(fileName) {
  return PROTOTYPE_VENDOR_MIME_TYPES.get(fileName.slice(fileName.lastIndexOf('.')).toLowerCase()) || '';
}

export function rewritePrototypeCdnAssets(source, vendorBase = '/__vendor/prototype-cdn/') {
  if (!source) return source;
  const base = String(vendorBase || '').replace(/\/+$/u, '');
  let output = source;
  for (const { file, url } of PROTOTYPE_CDN_ASSETS) {
    if (output.includes(url)) output = output.split(url).join(`${base}/${file}`);
  }
  return output;
}
