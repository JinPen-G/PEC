/** UI review session only. This is never an identity/permission credential. */
export const DEMO_SESSION_KEY = 'preview:native-ui-demo:v1';
export interface DemoSession {
  mode: 'ui-demo';
  account: string;
}

export function readDemoSession(): DemoSession | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(DEMO_SESSION_KEY) || 'null');
    if (
      value &&
      typeof value === 'object' &&
      'mode' in value &&
      value.mode === 'ui-demo' &&
      'account' in value &&
      typeof value.account === 'string' &&
      value.account.trim()
    ) {
      return { mode: 'ui-demo', account: value.account };
    }
  } catch {
    /* Session storage is optional. */
  }
  return null;
}

export function saveDemoSession(account: string): DemoSession {
  const session: DemoSession = { mode: 'ui-demo', account: account.trim() || 'Demo' };
  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  } catch {
    /* Keep in memory. */
  }
  return session;
}

export function clearDemoSession() {
  try {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    /* Keep logout usable. */
  }
}
