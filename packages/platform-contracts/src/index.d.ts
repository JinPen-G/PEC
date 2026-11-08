export const PLATFORM_ERROR_CODES: Readonly<Record<string, string>>;
export class PlatformApiError extends Error {
  code: string;
  status: number;
  detail: unknown;
  constructor(
    message: string,
    options?: { code?: string; status?: number; detail?: unknown; cause?: unknown },
  );
}
export function isRecord(value: unknown): value is Record<string, unknown>;
export function errorCodeForStatus(status: number): string;
export function createApiError(
  payload: unknown,
  options?: { status?: number; fallbackMessage?: string; cause?: unknown },
): PlatformApiError;
