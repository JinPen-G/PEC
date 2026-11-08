import { expect, test } from 'vitest';
import { createApiError } from '../../packages/platform-contracts/src/index.js';
test('API errors keep authentication, missing-resource and server failures distinct', () => {
  for (const [status, code] of [
    [401, 'UNAUTHORIZED'],
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
    [409, 'CONFLICT'],
    [503, 'SERVER_ERROR'],
  ]) {
    const error = createApiError({ message: '真实服务错误' }, { status });
    expect(error.status).toBe(status);
    expect(error.code).toBe(code);
    expect(error.message).toBe('真实服务错误');
    expect(createApiError(error)).toBe(error);
  }
});
