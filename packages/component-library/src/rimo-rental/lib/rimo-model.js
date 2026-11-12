/** React-owned local prototype state. It never calls a rental API or mutates platform accounts. */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRimoEnvironment } from './RimoEnvironment.jsx';

const cells = new WeakSet();
const scalar = value => cells.has(value) ? value.value : value;
const signature = value => {
  if (Array.isArray(value)) return value.map(signature);
  if (value && typeof value === 'object') return JSON.stringify(value);
  return value;
};
const same = (first, second) => Array.isArray(first) && Array.isArray(second)
  ? first.length === second.length && first.every((item, index) => same(item, second[index]))
  : Object.is(first, second);

export function createRimoModel(environment) {
  let revision = 0;
  let initialized = false;
  let queued = false;
  let active = false;
  let root = null;
  let exports = {};
  const listeners = new Set();
  const proxies = new WeakMap();
  const rawValues = new WeakSet();
  const mounted = [];
  const cleanups = [];
  const watchers = [];
  const storage = new Map();
  const timers = new Set();
  const intervals = new Set();
  const charts = new Set();
  const colours = new Map();
  const refs = new Map();
  const referenceValues = {};
  const flush = () => {
    queued = false;
    if (!active) return;
    for (let pass = 0; pass < 16; pass++) {
      let changed = false;
      for (const watcher of watchers) {
        const value = watcher.read();
        const next = signature(value);
        if (same(next, watcher.previous)) continue;
        const previous = watcher.value;
        watcher.previous = next;
        watcher.value = value;
        watcher.callback(value, previous);
        changed = true;
      }
      if (!changed) break;
      if (pass === 15) throw new Error('Prototype state updates did not settle');
    }
    revision++;
    listeners.forEach(listener => listener());
  };
  const changed = () => {
    if (!initialized || queued) return;
    queued = true;
    queueMicrotask(flush);
  };
  const record = value => {
    if (!value || typeof value !== 'object' || cells.has(value) || rawValues.has(value) || value instanceof Date || value instanceof RegExp || value instanceof Map || value instanceof Set || (typeof Element !== 'undefined' && value instanceof Element))
      return value;
    if (proxies.has(value)) return proxies.get(value);
    const proxy = new Proxy(value, {
      get(target, key, receiver) {
        const current = Reflect.get(target, key, receiver);
        return record(Array.isArray(target) ? current : scalar(current));
      },
      set(target, key, next) {
        const previous = target[key];
        if (!Array.isArray(target) && cells.has(previous) && !cells.has(next)) {
          previous.value = next;
          return true;
        }
        const accepted = Reflect.set(target, key, next);
        if (!Object.is(previous, next)) changed();
        return accepted;
      },
      deleteProperty(target, key) { const accepted = Reflect.deleteProperty(target, key); changed(); return accepted; },
    });
    proxies.set(value, proxy);
    proxies.set(proxy, proxy);
    return proxy;
  };
  const cell = value => {
    let current = record(value);
    const result = {
      get value() { return current; },
      set value(next) { if (!Object.is(current, next)) { current = record(next); changed(); } },
    };
    cells.add(result);
    return result;
  };
  const derived = source => {
    const getter = typeof source === 'function' ? source : source.get;
    const result = {
      get value() { return getter(); },
      set value(value) { if (typeof source.set === 'function') source.set(value); },
    };
    cells.add(result);
    return result;
  };
  const watch = (source, callback, options = {}) => {
    const read = () => typeof source === 'function' ? source()
      : Array.isArray(source) ? source.map(item => typeof item === 'function' ? item() : scalar(item))
      : scalar(source);
    const value = read();
    watchers.push({ read, callback, value, previous: signature(value) });
    if (options.immediate) callback(value, undefined);
  };
  const documentScope = {
    get body() { return root; },
    get documentElement() { return root; },
    get activeElement() { return root?.ownerDocument.activeElement; },
    querySelector(selector) { return root?.querySelector(selector) ?? null; },
    querySelectorAll(selector) { return root?.querySelectorAll(selector) ?? []; },
    getElementById(id) { return root?.querySelector(`[id="${CSS.escape(id)}"]`) ?? null; },
    createElement(tag) { return document.createElement(tag); },
    addEventListener(name, callback, options) {
      root?.addEventListener(name, callback, options);
      cleanups.push(() => root?.removeEventListener(name, callback, options));
    },
    removeEventListener(name, callback, options) { root?.removeEventListener(name, callback, options); },
  };
  const scopedStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  };
  const locationScope = {
    get search() { return environment.search ?? ''; },
    get href() { return '#'; },
    set href(value) { environment.navigate(value); },
    assign(value) { environment.navigate(value); },
    replace(value) { environment.navigate(value); },
    reload() { environment.notify('info', '重新载入页面后恢复示例数据'); },
  };
  const windowScope = {
    location: locationScope,
    document: documentScope,
    navigator,
    localStorage: scopedStorage,
    sessionStorage: scopedStorage,
    get innerWidth() { return root?.clientWidth ?? window.innerWidth; },
    get innerHeight() { return root?.clientHeight ?? window.innerHeight; },
    open(url) { environment.navigate(url); },
    print() { environment.notify('info', '演示资料已准备，可通过页面复制功能保存'); },
    addEventListener(name, callback, options) {
      window.addEventListener(name, callback, options);
      cleanups.push(() => window.removeEventListener(name, callback, options));
    },
    removeEventListener(name, callback, options) { window.removeEventListener(name, callback, options); },
    setTimeout(callback, delay, ...args) {
      const timer = setTimeout(() => { timers.delete(timer); if (active) callback(...args); }, delay);
      timers.add(timer);
      return timer;
    },
    clearTimeout(timer) { clearTimeout(timer); timers.delete(timer); },
    setInterval(callback, delay, ...args) { const timer = setInterval(() => active && callback(...args), delay); intervals.add(timer); return timer; },
    clearInterval(timer) { clearInterval(timer); intervals.delete(timer); },
  };
  const view = new Proxy({}, {
    get(_target, key) {
      if (key === 'feedbackMessage') return Object.fromEntries(['info', 'success', 'warning', 'error'].map(type => [type, message => environment.notify(type, message)]));
      return scalar(exports[key]);
    },
    set(_target, key, value) { if (cells.has(exports[key])) exports[key].value = value; else { exports[key] = record(value); changed(); } return true; },
    ownKeys() { return Reflect.ownKeys(exports); },
    getOwnPropertyDescriptor() { return { enumerable: true, configurable: true }; },
  });
  return {
    cell, record, derived, watch,
    onMount(callback) { mounted.push(callback); },
    onDispose(callback) { cleanups.push(callback); },
    nextTick(callback) { return Promise.resolve().then(() => callback?.()); },
    markRaw(value) { if (value && typeof value === 'object') rawValues.add(value); return value; },
    toRefs(value) { return Object.fromEntries(Object.keys(value).map(key => [key, derived({ get: () => value[key], set: next => { value[key] = next; } })])); },
    document: documentScope, window: windowScope,
    storage: scopedStorage, view,
    assign(target, key, value) { target[key] = value; return value; },
    theme(level) {
      const property = level == null ? '--app-color-primary' : `--app-color-primary-light-${level}`;
      const colour = getComputedStyle(root ?? document.documentElement).getPropertyValue(property).trim() || (level == null ? '#3b82f6' : '#dbeafe');
      if (/^#|^rgba?\(/i.test(colour) || typeof CanvasRenderingContext2D === 'undefined') return colour;
      if (colours.has(colour)) return colours.get(colour);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return colour;
      context.fillStyle = colour;
      context.fillRect(0, 0, 1, 1);
      const pixel = context.getImageData(0, 0, 1, 1).data;
      const resolved = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      colours.set(colour, resolved);
      return resolved;
    },
    themeAlpha(alpha) {
      const colour = this.theme();
      const channels = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/.exec(colour);
      if (channels) return `rgba(${channels[1]}, ${channels[2]}, ${channels[3]}, ${Math.min(1, Math.max(0, alpha))})`;
      if (!/^#[a-f\d]{6}$/i.test(colour)) return colour;
      const number = Number.parseInt(colour.slice(1), 16);
      return `rgba(${number >> 16 & 255}, ${number >> 8 & 255}, ${number & 255}, ${alpha})`;
    },
    chart(engine, element, ...options) {
      const chart = engine.getInstanceByDom(element) ?? engine.init(element, ...options);
      rawValues.add(chart);
      charts.add(chart);
      return chart;
    },
    write(path, value) {
      let target = view;
      for (const key of path.slice(0, -1)) target = target[key];
      target[path.at(-1)] = value;
      return value;
    },
    increment(path, amount, prefix) {
      let target = view;
      for (const key of path.slice(0, -1)) target = target[key];
      const previous = target[path.at(-1)];
      target[path.at(-1)] = previous + amount;
      return prefix ? previous + amount : previous;
    },
    initialize(factory) { exports = factory(this) ?? {}; initialized = true; return view; },
    options(definition) {
      const result = record(definition.data?.() ?? {});
      Object.defineProperty(result, '$refs', { value: referenceValues, configurable: true });
      for (const [key, method] of Object.entries(definition.methods ?? {})) result[key] = method.bind(result);
      for (const [key, getter] of Object.entries(definition.computed ?? {}))
        Object.defineProperty(result, key, { configurable: true, enumerable: true, get: () => (typeof getter === 'function' ? getter : getter.get).call(result) });
      for (const [key, handler] of Object.entries(definition.watch ?? {})) {
        const callback = typeof handler === 'function' ? handler : handler.handler;
        watch(() => result[key], callback.bind(result), typeof handler === 'function' ? {} : handler);
      }
      if (definition.mounted) mounted.push(() => definition.mounted.call(result));
      if (definition.beforeUnmount) cleanups.push(() => definition.beforeUnmount.call(result));
      return result;
    },
    setRoot(element) { root = element; },
    assignRef(name, value) { referenceValues[name] = value; if (cells.has(exports[name])) exports[name].value = value; else exports[name] = value; },
    ref(name) { if (!refs.has(name)) refs.set(name, value => this.assignRef(name, value)); return refs.get(name); },
    start() {
      active = true;
      mounted.forEach(callback => { const cleanup = callback(); if (typeof cleanup === 'function') cleanups.push(cleanup); });
      changed();
      return () => {
        active = false;
        cleanups.splice(0).forEach(callback => callback());
        timers.forEach(clearTimeout);
        intervals.forEach(clearInterval);
        charts.forEach(chart => { if (!chart.isDisposed()) chart.dispose(); });
        charts.clear();
        colours.clear();
      };
    },
    subscribe(callback) { listeners.add(callback); return () => listeners.delete(callback); },
    snapshot() { return revision; },
    configure(next) { environment = next; },
    notify(type, message) { return environment.notify(type, typeof message === 'object' ? message?.message ?? String(message) : message); },
    confirm(message, title) { return environment.confirm(message, title); },
  };
}

export function useRimoModel(factory) {
  const environment = useRimoEnvironment();
  const [model] = useState(() => {
    const value = createRimoModel(environment);
    value.initialize(factory);
    return value;
  });
  model.configure(environment);
  useSyncExternalStore(model.subscribe, model.snapshot, model.snapshot);
  useEffect(() => model.start(), [model]);
  return model;
}

export function rimoEntries(value) {
  if (Array.isArray(value)) return value.map((item, index) => [item, index, index]);
  if (Number.isInteger(value) && value >= 0) return Array.from({ length: Math.min(value, 10000) }, (_, index) => [index + 1, index, index]);
  if (value && typeof value === 'object') return Object.entries(value).map(([key, item], index) => [item, key, index]);
  return [];
}
