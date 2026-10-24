import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPlatformClient } from '../../../../packages/platform-client/src/index.js';
import { startDeploymentVersionCheck } from './deployment-updates';

describe('static deployment updates', () => {
  let stop: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    window.history.replaceState({}, '', '/prototype/Rental/index.html#/p/rimo-rental/docs?doc=test.md');
  });

  afterEach(() => {
    stop?.();
    stop = undefined;
    vi.useRealTimers();
  });

  function releaseResponse(version: string) {
    return { ok: true, json: async () => ({ schemaVersion: 1, version }) } as Response;
  }

  it('reloads a new release through an uncached entry while preserving the route', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(releaseResponse('release-b'));
    const replace = vi.fn();
    stop = startDeploymentVersionCheck({
      buildId: 'release-a',
      baseUrl: '/prototype/Rental/',
      fetchImpl,
      replace,
    });
    await vi.advanceTimersByTimeAsync(0);
    const target = new URL(replace.mock.calls[0][0]);
    expect(target.pathname).toBe('/prototype/Rental/index.html');
    expect(target.searchParams.get('_release')).toBe('release-b');
    expect(target.hash).toBe('#/p/rimo-rental/docs?doc=test.md');
    expect(fetchImpl.mock.calls[0][1]?.cache).toBe('no-store');
    expect(new URL(String(fetchImpl.mock.calls[0][0])).searchParams.has('_check')).toBe(true);
    window.dispatchEvent(new Event('focus'));
    await vi.advanceTimersByTimeAsync(60_000);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it('keeps the current release and retries after a temporary network error', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(releaseResponse('release-a'));
    const replace = vi.fn();
    stop = startDeploymentVersionCheck({
      buildId: 'release-a',
      baseUrl: '/prototype/Rental/',
      fetchImpl,
      replace,
    });
    await vi.advanceTimersByTimeAsync(0);
    window.dispatchEvent(new Event('focus'));
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(replace).not.toHaveBeenCalled();
  });

  it('avoids a reload loop when the entry is still served from an old cache', async () => {
    window.history.replaceState(
      {},
      '',
      '/prototype/Rental/index.html?_release=release-b#/p/rimo-rental/docs',
    );
    const replace = vi.fn();
    stop = startDeploymentVersionCheck({
      buildId: 'release-a',
      baseUrl: '/prototype/Rental/',
      fetchImpl: vi.fn<typeof fetch>().mockResolvedValue(releaseResponse('release-b')),
      replace,
    });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(replace).not.toHaveBeenCalled();
  });

  it('gives HTML and its relative assets a new address for each release', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue({ ok: true, json: async () => ({ projects: {} }) } as Response);
    const client = createPlatformClient({
      baseUrl: '/prototype/Rental/',
      staticAssetVersion: 'release-b',
      fetchImpl,
    });
    const page = client.getHtmlPrototypeUrl('rimo-rental', 'operation', 'workbench.html');
    expect(page).toBe(
      '/prototype/Rental/projects/rimo-rental/prototype/releases/release-b/operation/workbench.html',
    );
    expect(new URL('theme.css', `https://example.com${page}`).pathname).toContain(
      '/releases/release-b/operation/theme.css',
    );
    await client.loadHtmlPageCatalog();
    expect(String(fetchImpl.mock.calls[0][0])).toContain('html-pages.json?_release=release-b');
    const local = createPlatformClient({ development: true, staticAssetVersion: 'release-b', fetchImpl });
    expect(local.getHtmlPrototypeUrl('rimo-rental', 'operation', 'workbench.html')).toBe(
      '/__projects/html-content/rimo-rental/operation/workbench.html',
    );
  });
});
