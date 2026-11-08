/** Credentialed native client; every error remains visible, with no static fallback. */
import { createApiError } from '../../platform-contracts/src/index.js';
import { NATIVE_API_PREFIX } from '../../platform-contracts/src/platform.js';
export function createNativeClient({
  fetchImpl = globalThis.fetch,
  baseUrl = NATIVE_API_PREFIX,
  onUnauthorized = () => {},
} = {}) {
  let csrf = null;
  let generation = 0;
  async function request(route, { method = 'GET', body, signal, text = false } = {}) {
    const epoch = generation;
    const response = await fetchImpl(`${baseUrl}${route}`, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      signal,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(method === 'GET' ? {} : { 'X-Preview-CSRF': csrf ?? '' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) {
      const value = await response.json().catch(() => null);
      if (response.status === 401 && route !== '/login' && epoch === generation) {
        generation++;
        csrf = null;
        onUnauthorized();
      }
      throw createApiError(value, { status: response.status });
    }
    return text ? response.text() : response.json();
  }
  return {
    request,
    async session(signal) {
      const epoch = generation;
      const value = await request('/session', { signal });
      if (epoch === generation) csrf = value.csrf;
      return value;
    },
    async login(username, password) {
      const epoch = ++generation;
      const value = await request('/login', { method: 'POST', body: { username, password } });
      if (epoch === generation) csrf = value.csrf;
      return value;
    },
    async logout() {
      await request('/logout', { method: 'POST', body: {} });
      generation++;
      csrf = null;
    },
    bootstrap(input) {
      return request('/bootstrap', { method: 'POST', body: input });
    },
    async changePassword(input) {
      const result = await request('/password', { method: 'POST', body: input });
      generation++;
      csrf = null;
      onUnauthorized();
      return result;
    },
    assetUrl(projectId, file) {
      return `${baseUrl}/projects/${encodeURIComponent(projectId)}/document?path=${encodeURIComponent(file)}`;
    },
  };
}
