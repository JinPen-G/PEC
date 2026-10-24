/** Reload the static entry after a release while preserving the current hash route. */
export function startDeploymentVersionCheck({
  buildId,
  baseUrl,
  fetchImpl = window.fetch.bind(window),
  replace = (url: string) => window.location.replace(url),
}: {
  buildId: string;
  baseUrl: string;
  fetchImpl?: typeof fetch;
  replace?: (url: string) => void;
}) {
  if (!buildId) return;
  let stopped = false;
  let reloading = false;
  let pending: AbortController | null = null;

  async function check() {
    if (stopped || reloading || pending || document.visibilityState === 'hidden') return;
    const controller = new AbortController();
    pending = controller;
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const url = new URL(`${baseUrl}version.json`, window.location.href);
      url.searchParams.set('_check', String(Date.now()));
      const response = await fetchImpl(url.href, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) return;
      const release = await response.json();
      if (
        stopped ||
        release.schemaVersion !== 1 ||
        typeof release.version !== 'string' ||
        !/^[a-z0-9-]+$/i.test(release.version) ||
        release.version === buildId
      )
        return;

      const entry = new URL(`${baseUrl}index.html`, window.location.href);
      entry.search = window.location.search;
      // A stale CDN response must not cause an endless reload cycle.
      if (entry.searchParams.get('_release') === release.version) return;
      entry.searchParams.set('_release', release.version);
      entry.hash = window.location.hash;
      reloading = true;
      replace(entry.href);
    } catch {
      // Keep the current page usable during network errors or an incomplete upload.
    } finally {
      window.clearTimeout(timeout);
      if (pending === controller) pending = null;
    }
  }

  void check();
  const interval = window.setInterval(() => void check(), 60_000);
  const onFocus = () => void check();
  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onFocus);
  return () => {
    stopped = true;
    pending?.abort();
    window.clearInterval(interval);
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('visibilitychange', onFocus);
  };
}
