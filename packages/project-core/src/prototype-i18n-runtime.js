// 原型页语言桥运行时（协议 v1）源码。
// 平台（PrototypeFrame 同源）在 iframe load 时把本脚本注入页面文档；
// 批量注入脚本（scripts/inject-prototype-i18n.mjs）也会把它嵌进页面本体。
//
// 页面协议：
//   <html lang="zh-Hant">                     ← 页面基础语言（缺省视为 zh-Hant）
//   <script id="prototype-i18n" type="application/json">
//     { "en": { "原文": "译文" }, ... }        ← 按"原文→译文"对译的字典（可选）
//   </script>
//
// 行为：
//   - zh-Hans：内置繁→简字符映射，无需字典即可整页转换
//   - en 等其他语言：按字典原文查找（文本节点 + placeholder/title/aria-label/value）
//   - 页面无字典或无目标语言 → no-op，保持原文展示（协议回退语义）
//   - MutationObserver 幂等重应用（Vue 重渲染回写原文后自动恢复译文）
//   - 在原型顶栏（管理员头像前）注入页内语言切换控件；平台嵌入时由平台接管
import { TRADITIONAL_TO_SIMPLIFIED } from './traditional-simplified-map.js';

export const PROTOTYPE_I18N_RUNTIME_VERSION = '3';

export const PROTOTYPE_I18N_RUNTIME_SCRIPT = `
(() => {
  const STORAGE_KEY = 'product-experience-center:locale';
  const TRANSLATED_ATTRS = ['placeholder', 'title', 'aria-label'];
  const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'textarea', 'code', 'pre']);
  const T2S = ${JSON.stringify(TRADITIONAL_TO_SIMPLIFIED)};
  const LOCALE_LABELS = { 'zh-Hant': '繁', 'zh-Hans': '简', en: 'EN' };
  const BASE_LANG_FALLBACK = 'zh-Hant';
  let dictionary = {};
  let currentLocale = null;
  let applying = false;

  const readDictScript = () => {
    const node = document.getElementById('prototype-i18n');
    if (!node) return {};
    try {
      const parsed = JSON.parse(node.textContent || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  };

  const readStoredLocale = () => {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'en' || value === 'zh-Hant' || value === 'zh-Hans' ? value : null;
    } catch {
      return null;
    }
  };

  const dictionaryFor = (locale) => (locale === 'zh-Hans' ? null : dictionary[locale] || null);

  // 原文记忆：翻译前记录原始文本，回退原语言时恢复
  const originalTexts = new WeakMap();
  const originalOf = (node) => {
    if (!originalTexts.has(node)) originalTexts.set(node, node.textContent);
    return originalTexts.get(node);
  };
  const originalAttrs = new WeakMap();
  const originalAttrOf = (element, attr) => {
    if (!originalAttrs.has(element)) originalAttrs.set(element, {});
    const store = originalAttrs.get(element);
    if (!(attr in store)) store[attr] = element.getAttribute(attr);
    return store[attr];
  };

  const translateWithDictionary = (text, entry) => {
    if (typeof text !== 'string') return null;
    const trimmed = text.trim();
    if (!trimmed) return null;
    const translated = entry[trimmed];
    if (typeof translated !== 'string' || !translated.trim() || translated === trimmed) return null;
    // 保留原文节点的前导/尾随空白（HTML 渲染折叠空白，不影响视觉）
    // 注意：本文件是模板字面量，正则中 \\s 需写成 \\\\s 才能发射正确的 \\s
    const leading = text.match(/^\\s*/u)[0];
    const trailing = text.match(/\\s*$/u)[0];
    return leading + translated + trailing;
  };

  const translateToZhHans = (text) =>
    text.replace(/[\\u3400-\\u9fff\\uf900-\\ufaff]/gu, (char) => T2S[char] ?? char);

  const translateText = (text) => {
    if (!currentLocale || typeof text !== 'string' || !text.trim()) return null;
    if (currentLocale === BASE_LANG_FALLBACK) return null;
    if (currentLocale === 'zh-Hans') {
      const converted = translateToZhHans(text);
      return converted !== text ? converted : null;
    }
    const entry = dictionaryFor(currentLocale);
    return entry ? translateWithDictionary(text, entry) : null;
  };

  const applyToElement = (element) => {
    let changed = false;
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const original = originalOf(node);
        const translated = translateText(original);
        const target = translated ?? original;
        if (node.textContent !== target) {
          node.textContent = target;
          changed = true;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // 跳过代码/样式/表单编辑区：转换这些内容会破坏脚本与用户输入
        if (SKIP_TAGS.has(node.tagName?.toLowerCase() || '')) continue;
        if (applyToElement(node)) changed = true;
      }
    }
    return changed;
  };

  let everTranslated = false;
  const apply = () => {
    if (applying || !document.body) return;
    applying = true;
    try {
      // 基础语言从页面原始声明读取（注入器保留 <html lang>，平台不改写此属性）
    const baseLang = document.documentElement.getAttribute('data-prototype-base-lang') || document.documentElement.getAttribute('lang') || BASE_LANG_FALLBACK;
      const targetLang = currentLocale || baseLang;
      if (document.documentElement.lang !== targetLang) {
        document.documentElement.lang = targetLang;
      }
      // 从未翻译过（默认繁体原文态）无需遍历；切回基础语言时必须遍历恢复原文
      if (!currentLocale && !everTranslated) {
        updateControl();
        return;
      }
      if (currentLocale) everTranslated = true;
      const seen = new Set();
      const roots = [...document.querySelectorAll('[data-page-content], [data-page-overlay]'), document.body];
      for (const root of roots) {
        if (seen.has(root)) continue;
        seen.add(root);
        applyToElement(root);
        for (const attr of TRANSLATED_ATTRS) {
          for (const element of root.querySelectorAll('[' + attr + ']')) {
            if (seen.has(element)) continue;
            seen.add(element);
            const original = originalAttrOf(element, attr);
            const translated = translateText(original);
            const target = translated ?? original;
            if (element.getAttribute(attr) !== target) element.setAttribute(attr, target);
          }
        }
      }
      updateControl();
    } finally {
      applying = false;
    }
  };

  const setLocale = (locale) => {
    if (locale === BASE_LANG_FALLBACK) locale = null; // 基础语言 = 回退原文
    const next = typeof locale === 'string' && locale ? locale : readStoredLocale();
    // 切回基础语言：apply() 通过 WeakMap 原文记忆恢复繁体（实测正确，含翻译期间新建的 Text node）。
    // reload 分支仅在 localStorage 读失败/被清空时兜底触发（此时 WeakMap 不可靠）。
    if (next === null && everTranslated) {
      try {
        localStorage.setItem(STORAGE_KEY, BASE_LANG_FALLBACK);
      } catch {}
      location.reload();
      return;
    }
    currentLocale = next;
    dictionary = readDictScript();
    if (currentLocale && currentLocale !== 'zh-Hans' && !dictionary[currentLocale]) currentLocale = null;
    apply();
  };

  let pendingApplyTimer = null;
  const observer = new MutationObserver(() => {
    // Vue 重渲染会回写原文：去抖后幂等重应用，避免同步递归与高频全量遍历
    if (applying) return;
    clearTimeout(pendingApplyTimer);
    pendingApplyTimer = setTimeout(() => setLocale(currentLocale), 80);
  });
  const observe = () => {
    observer.disconnect();
    if (document.body) {
      observer.observe(document.body, {
        childList: true, characterData: true, subtree: true,
        attributes: true, attributeFilter: TRANSLATED_ATTRS,
      });
    }
  };

  // ---- 页内语言切换控件（顶栏管理员头像前；平台嵌入时 content-only 会隐藏顶栏，由平台接管）----
  const CONTROL_CLASS = 'prototype-locale-switch';
  let controlOpen = false;

  const updateControl = () => {
    const current = controlOpen ? undefined : document.querySelector('.' + CONTROL_CLASS + '__current');
    if (current) current.textContent = LOCALE_LABELS[currentLocale] || (currentLocale || '').toUpperCase() || '繁';
    const options = document.querySelectorAll('.' + CONTROL_CLASS + '__option');
    for (const option of options) {
      const active = option.dataset.locale === currentLocale;
      option.style.fontWeight = active ? '600' : '400';
      option.style.background = active ? 'var(--el-color-primary-light-9, rgba(0,104,158,0.08))' : 'transparent';
      option.style.color = active ? 'var(--el-color-primary, var(--app-color-primary, #00689e))' : 'inherit';
    }
  };

  const buildControl = () => {
    if (document.querySelector('.' + CONTROL_CLASS)) return;
    const topbar = document.querySelector('[data-prototype-shell="topbar"], .prototype-topbar');
    const userDropdown = topbar ? topbar.querySelector('.el-dropdown') : null;

    const wrap = document.createElement('div');
    wrap.className = CONTROL_CLASS;
    // 有顶栏头像时内联插入头像前；无顶栏结构（full-shell/自研壳）时兜底挂 body 右上角
    const inlineStyle = 'display:inline-flex;align-items:center;margin-right:8px;position:relative;';
    const fallbackStyle = 'display:inline-flex;align-items:center;position:fixed;top:12px;right:12px;z-index:2200;';
    wrap.style.cssText = userDropdown ? inlineStyle : fallbackStyle;
    const locales = ['zh-Hant', 'zh-Hans', ...Object.keys(readDictScript()).filter((l) => l !== 'zh-Hant' && l !== 'zh-Hans')];
    const labels = { 'zh-Hant': '繁', 'zh-Hans': '简', en: 'EN' };
    wrap.innerHTML =
      '<button type="button" class="' + CONTROL_CLASS + '__current" style="' +
      'display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;' +
      'border:1px solid var(--app-color-border, transparent);background:transparent;color:inherit;' +
      'cursor:pointer;font-size:12px; padding:0;">' + (LOCALE_LABELS[currentLocale] || '繁') + '</button>' +
      '<div class="' + CONTROL_CLASS + '__menu" style="display:none;position:absolute;top:100%;right:0;z-index:2200;' +
      'min-width:88px;background:var(--el-bg-color-overlay, #fff);border:1px solid var(--app-color-border, #e4e7ed);' +
      'border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.12);padding:4px 0;">' +
      locales.map((locale) =>
        '<div class="' + CONTROL_CLASS + '__option" data-locale="' + locale + '" style="' +
        'padding:6px 12px;font-size:13px;cursor:pointer;white-space:nowrap;">' +
        (locale === 'zh-Hans' ? '简体中文' : locale === 'zh-Hant' ? '繁體中文' : 'English') + '</div>',
      ).join('') +
      '</div>';

    const currentButton = wrap.querySelector('.' + CONTROL_CLASS + '__current');
    const menu = wrap.querySelector('.' + CONTROL_CLASS + '__menu');
    currentButton.addEventListener('click', (event) => {
      event.stopPropagation();
      controlOpen = !controlOpen;
      menu.style.display = controlOpen ? 'block' : 'none';
      updateControl();
    });
    for (const option of wrap.querySelectorAll('.' + CONTROL_CLASS + '__option')) {
      option.addEventListener('click', (event) => {
        event.stopPropagation();
        controlOpen = false;
        menu.style.display = 'none';
        const locale = option.dataset.locale;
        try {
          localStorage.setItem(STORAGE_KEY, locale);
        } catch {}
        setLocale(locale);
        // 平台嵌入时通知宿主（宿主可自行决定是否跟随）
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'prototype-locale-change', locale }, '*');
        }
      });
    }
    document.addEventListener('click', () => {
      if (controlOpen) { controlOpen = false; menu.style.display = 'none'; }
    });
    if (userDropdown) {
      userDropdown.parentElement.insertBefore(wrap, userDropdown);
    } else {
      document.body.append(wrap);
    }
    updateControl();
  };

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) setLocale(event.newValue);
  });
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'prototype-locale-change' && event.source === window.parent) {
      setLocale(event.data.locale);
    }
  });

  window.PrototypeI18n = {
    setLocale,
    refresh: () => setLocale(currentLocale),
    get locale() {
      return currentLocale;
    },
    get supportedLocales() {
      // 与页内控件列表同源：基础语言 + 内置 zh-Hans + 字典声明的其他语言
      return ['zh-Hant', 'zh-Hans', ...Object.keys(readDictScript()).filter((l) => l !== 'zh-Hant' && l !== 'zh-Hans')];
    },
  };

  const start = () => {
    setLocale(readStoredLocale());
    observe();
    buildControl();
    // Vue 挂载完成后重应用一次（字典可能覆盖 {{ }} 渲染出的中文）
    setTimeout(() => { setLocale(currentLocale); observe(); }, 0);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => { setLocale(currentLocale); observe(); });
  }
})();
`;
