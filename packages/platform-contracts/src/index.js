/** Framework-neutral runtime contract. Keep normalization and index.d.ts in
 * sync; project file schemas remain owned by project-core. */
export const PLATFORM_ERROR_CODES = Object.freeze({
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  CONFLICT: 'CONFLICT',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  STATIC_READ_ONLY: 'STATIC_READ_ONLY',
  UNKNOWN: 'UNKNOWN',
});

const STATUS_ERROR_CODES = new Map([
  [400, PLATFORM_ERROR_CODES.BAD_REQUEST],
  [401, PLATFORM_ERROR_CODES.UNAUTHORIZED],
  [403, PLATFORM_ERROR_CODES.FORBIDDEN],
  [404, PLATFORM_ERROR_CODES.NOT_FOUND],
  [405, PLATFORM_ERROR_CODES.METHOD_NOT_ALLOWED],
  [409, PLATFORM_ERROR_CODES.CONFLICT],
  [413, PLATFORM_ERROR_CODES.PAYLOAD_TOO_LARGE],
]);

export class PlatformApiError extends Error {
  constructor(message, { code = PLATFORM_ERROR_CODES.UNKNOWN, status = 0, detail = null, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'PlatformApiError';
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

export function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function errorCodeForStatus(status) {
  if (STATUS_ERROR_CODES.has(status)) return STATUS_ERROR_CODES.get(status);
  if (status >= 500) return PLATFORM_ERROR_CODES.SERVER_ERROR;
  return PLATFORM_ERROR_CODES.UNKNOWN;
}

export function createApiError(payload, { status = 0, fallbackMessage = '平台请求失败。', cause } = {}) {
  if (payload instanceof PlatformApiError) return payload;
  const source = isRecord(payload) ? payload : {};
  const message = source.message || source.error || fallbackMessage;
  const detail = source.detail ?? source.details ?? null;
  return new PlatformApiError(String(message), {
    code: String(source.code || errorCodeForStatus(status)),
    status,
    detail,
    cause,
  });
}
