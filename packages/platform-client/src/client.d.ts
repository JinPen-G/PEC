import type { NativeSession } from '../../platform-contracts/src/platform';
export interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  text?: boolean;
}
export function createNativeClient(options?: {
  fetchImpl?: typeof fetch;
  baseUrl?: string;
  onUnauthorized?: () => void;
}): {
  request<T = unknown>(route: string, options?: RequestOptions): Promise<T>;
  session(signal?: AbortSignal): Promise<NativeSession>;
  login(username: string, password: string): Promise<NativeSession>;
  logout(): Promise<void>;
  bootstrap(input: { username: string; displayName: string; password: string }): Promise<unknown>;
  changePassword(input: { currentPassword: string; password: string }): Promise<unknown>;
  assetUrl(projectId: string, file: string): string;
};
