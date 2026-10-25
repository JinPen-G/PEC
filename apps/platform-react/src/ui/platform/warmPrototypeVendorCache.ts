// 预热原型页公共依赖（vendor/prototype-cdn）：这些文件名含版本号、内容不可变，
// 每个浏览器会话只需下载一次。平台空闲时以最低优先级 prefetch，
// 用户打开任意原型页时 iframe 不再等待外部 CDN（每页 2~3.5MB 渲染阻塞脚本）。
const PROTOTYPE_VENDOR_PREFETCH_FILES = [
  'tailwind-cdn@3.4.17.js',
  'vue@3.4.21.global.prod.js',
  'element-plus@2.8.0.index.css',
  'element-plus@2.8.0.index.full.min.js',
  'element-plus-icons-vue@2.3.1.index.iife.min.js',
  'element-plus@2.8.0.locale.zh-cn.js',
] as const;

let warmed = false;

export function warmPrototypeVendorCache() {
  if (warmed || typeof window === 'undefined') return;
  warmed = true;

  const localApi = import.meta.env.DEV || window.__PLATFORM_RUNTIME__?.mode === 'local';
  const vendorBase = localApi
    ? '/__vendor/prototype-cdn/'
    : `${import.meta.env.BASE_URL}vendor/prototype-cdn/`;

  const schedule = (callback: () => void) => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => callback(), { timeout: 3000 });
      return;
    }
    window.setTimeout(callback, 1200);
  };

  schedule(() => {
    for (const file of PROTOTYPE_VENDOR_PREFETCH_FILES) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = file.endsWith('.css') ? 'style' : 'script';
      link.href = `${vendorBase}${file}`;
      document.head.append(link);
    }
  });
}
