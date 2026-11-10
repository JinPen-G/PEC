import { describe, expect, it, vi } from 'vitest';
import { createRimoModel } from '../../packages/component-library/src/rimo-rental/lib/rimo-model.js';

const environment = () => ({ navigate: vi.fn(), notify: vi.fn(), confirm: vi.fn() });
const settle = async () => { await Promise.resolve(); await Promise.resolve(); };

describe('RIMO local React model', () => {
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
