// 原型页语言桥运行时行为单测：在 jsdom 中 eval 运行时脚本，验证协议语义。
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, describe, expect, it, vi } from 'vitest';

import { PROTOTYPE_I18N_RUNTIME_SCRIPT } from '../../packages/project-core/src/index.js';

const runtimeSource = PROTOTYPE_I18N_RUNTIME_SCRIPT;

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function createPage({ html = '', dict = null, baseLang = 'zh-Hant' } = {}) {
  document.body.innerHTML = `
    <main data-page-content>
      <h1 id="title">訂單管理</h1>
      <p id="hint">共 <span id="count">5</span> 筆</p>
      <input id="search" placeholder="搜尋訂單" />
      <button id="ok" title="確認操作">確認</button>
      <span id="dynamic"></span>
    </main>
    <div data-page-overlay><el-dialog title="新增訂單" id="dialog-title"></el-dialog></div>
  `;
  document.documentElement.lang = baseLang;
  const head = document.head;
  if (dict) {
    const script = document.createElement('script');
    script.id = 'prototype-i18n';
    script.type = 'application/json';
    script.textContent = JSON.stringify(dict);
    head.append(script);
  }
  if (html) document.body.insertAdjacentHTML('beforeend', html);
}

function evalRuntime() {
  // 运行时脚本是 IIFE 源码：在 jsdom 全局下执行
  new Function(runtimeSource)();
}

afterAll(() => {
  document.body.innerHTML = '';
  document.documentElement.lang = '';
});

describe('prototype-i18n runtime', () => {
  it('无字典时 no-op：页面保持原文', () => {
    createPage({});
    evalRuntime();
    expect(window.PrototypeI18n).toBeTruthy();
    expect(document.getElementById('title').textContent).toBe('訂單管理');
    expect(document.getElementById('search').getAttribute('placeholder')).toBe('搜尋訂單');
    window.PrototypeI18n.setLocale('en');
    expect(document.getElementById('title').textContent).toBe('訂單管理');
    expect(document.documentElement.lang).toBe('zh-Hant');
  });

  it('en 字典应用：文本与属性按原文对译，lang 同步', () => {
    createPage({
      dict: {
        en: {
          訂單管理: 'Order Management',
          搜尋訂單: 'Search orders',
          確認操作: 'Confirm action',
          確認: 'Confirm',
          新增訂單: 'New order',
        },
      },
    });
    evalRuntime();
    window.PrototypeI18n.setLocale('en');
    expect(document.getElementById('title').textContent).toBe('Order Management');
    expect(document.getElementById('search').getAttribute('placeholder')).toBe('Search orders');
    expect(document.getElementById('ok').getAttribute('title')).toBe('Confirm action');
    expect(document.getElementById('ok').textContent).toBe('Confirm');
    expect(document.querySelector('[data-page-overlay] el-dialog').getAttribute('title')).toBe('New order');
    expect(document.documentElement.lang).toBe('en');
    // 字典未覆盖的文本保持原文（回退语义）
    expect(document.getElementById('hint').textContent).toContain('共');
  });

  it('zh-Hans 内置字符转换：无需字典', () => {
    createPage({});
    evalRuntime();
    window.PrototypeI18n.setLocale('zh-Hans');
    expect(document.getElementById('title').textContent).toBe('订单管理');
    expect(document.getElementById('search').getAttribute('placeholder')).toBe('搜寻订单');
    expect(document.documentElement.lang).toBe('zh-Hans');
  });

  it('MutationObserver：DOM 更新后重应用翻译（Vue 重渲染场景）', async () => {
    createPage({
      dict: { en: { 訂單管理: 'Order Management' } },
    });
    evalRuntime();
    window.PrototypeI18n.setLocale('en');
    // 模拟 Vue 重渲染回写原文
    document.getElementById('title').textContent = '訂單管理';
    // observer 回调经微任务/超时重应用
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(document.getElementById('title').textContent).toBe('Order Management');
  });

  it('setLocale(null) 回退原文', () => {
    createPage({ dict: { en: { 訂單管理: 'Order Management' } } });
    evalRuntime();
    window.PrototypeI18n.setLocale('en');
    expect(document.getElementById('title').textContent).toBe('Order Management');
    window.PrototypeI18n.setLocale(null);
    expect(document.getElementById('title').textContent).toBe('訂單管理');
    expect(document.documentElement.lang).toBe('zh-Hant');
  });
});
