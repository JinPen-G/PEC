import { describe, expect, it, vi } from 'vitest';
import { createRimoModel } from '../../packages/component-library/src/rimo-rental/lib/rimo-model.js';

const environment = () => ({ navigate: vi.fn(), notify: vi.fn(), confirm: vi.fn() });
const settle = async () => { await Promise.resolve(); await Promise.resolve(); };

describe('RIMO local React model', () => {
  it('reads nested computed statistics as values and preserves writable cell bindings', async () => {
    const model = createRimoModel(environment());
    let source;
    model.initialize(runtime => {
      source = runtime.cell(4);
      const statistics = runtime.record({ pending: runtime.derived(() => source.value), selected: source });
      return { statistics, explicitCells: runtime.record([source]) };
    });
    const stop = model.start();
    expect(model.view.statistics.pending).toBe(4);
    model.write(['statistics', 'selected'], 7);
    await settle();
    expect(source.value).toBe(7);
    expect(model.view.statistics.pending).toBe(7);
    expect(model.view.explicitCells[0].value).toBe(7);
    stop();
  });

  it('publishes nested edits, derived values and dependent rules', async () => {
    const model = createRimoModel(environment());
    const watcher = vi.fn();
    model.initialize(runtime => {
      const order = runtime.record({ quantity: 2, unitPrice: 30 });
      const total = runtime.derived(() => order.quantity * order.unitPrice);
      runtime.watch(total, watcher);
      return { order, total };
    });
    const subscriber = vi.fn();
    const unsubscribe = model.subscribe(subscriber);
    const stop = model.start();
    await settle();
    model.write(['order', 'quantity'], 4);
    await settle();
    expect(model.view.total).toBe(120);
    expect(watcher).toHaveBeenCalledWith(120, 60);
    expect(subscriber).toHaveBeenCalled();
    unsubscribe();
    stop();
  });

  it('keeps simulated data and storage within one page instance', async () => {
    const factory = runtime => ({ count: runtime.cell(0) });
    const first = createRimoModel(environment());
    const second = createRimoModel(environment());
    first.initialize(factory);
    second.initialize(factory);
    const stop = first.start();
    expect(first.increment(['count'], 1, false)).toBe(0);
    expect(first.increment(['count'], 2, true)).toBe(3);
    first.storage.setItem('draft', 'one');
    await settle();
    expect(second.view.count).toBe(0);
    expect(second.storage.getItem('draft')).toBeNull();
    stop();
  });

  it('cancels timers and window subscriptions after unmount', async () => {
    vi.useFakeTimers();
    const model = createRimoModel(environment());
    const timer = vi.fn();
    const resize = vi.fn();
    model.initialize(runtime => {
      runtime.onMount(() => {
        runtime.window.setTimeout(timer, 20);
        runtime.window.setInterval(timer, 10);
        runtime.window.addEventListener('resize', resize);
      });
      return {};
    });
    const stop = model.start();
    window.dispatchEvent(new Event('resize'));
    expect(resize).toHaveBeenCalledTimes(1);
    stop();
    window.dispatchEvent(new Event('resize'));
    await vi.advanceTimersByTimeAsync(50);
    expect(resize).toHaveBeenCalledTimes(1);
    expect(timer).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('reuses an existing chart and disposes only the live page instance', () => {
    const model = createRimoModel(environment());
    const chart = { isDisposed: vi.fn(() => false), dispose: vi.fn() };
    const engine = { getInstanceByDom: vi.fn().mockReturnValueOnce(undefined).mockReturnValue(chart), init: vi.fn(() => chart) };
    const element = document.createElement('div');
    model.initialize(() => ({}));
    const stop = model.start();
    expect(model.chart(engine, element)).toBe(chart);
    expect(model.chart(engine, element)).toBe(chart);
    expect(engine.init).toHaveBeenCalledTimes(1);
    stop();
    expect(chart.dispose).toHaveBeenCalledTimes(1);
  });

  it('binds dashboard references and derived methods to its local state', async () => {
    const model = createRimoModel(environment());
    const element = document.createElement('div');
    model.initialize(runtime => runtime.options({
      data: () => ({ amount: 4 }),
      computed: { doubled() { return this.amount * 2; } },
      methods: { increase() { this.amount++; } },
      mounted() { this.$refs.chart.dataset.ready = 'true'; },
    }));
    model.assignRef('chart', element);
    const stop = model.start();
    model.view.increase();
    await settle();
    expect(model.view.doubled).toBe(10);
    expect(element.dataset.ready).toBe('true');
    stop();
  });

  it('delegates navigation and confirmation instead of writing platform state', async () => {
    const services = environment();
    services.confirm.mockResolvedValue(true);
    const model = createRimoModel(services);
    model.window.location.href = 'orders.html';
    model.window.open('contract.html');
    model.notify('success', { message: '已更新本地示例' });
    await model.confirm('确认取消？', '取消预约');
    expect(services.navigate.mock.calls).toEqual([['orders.html'], ['contract.html']]);
    expect(services.notify).toHaveBeenCalledWith('success', '已更新本地示例');
    expect(services.confirm).toHaveBeenCalledWith('确认取消？', '取消预约');
  });
});
