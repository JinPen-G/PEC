import { expect, it } from 'vitest';
import { loginAfterPasswordChange, loginRoute, safeReturnTo } from './login-route';
it('preserves same-app administration links while refusing outside and unknown return URLs', () => {
  expect(loginRoute('/manage/pages?project=sample')).toBe(
    '/login?returnTo=%2Fmanage%2Fpages%3Fproject%3Dsample',
  );
  expect(safeReturnTo('/pages/sample/admin/example')).toBe('/pages/sample/admin/example');
  expect(loginRoute('/center/sample?kind=components&category=vehicles')).toBe(
    '/login?returnTo=%2Fcenter%2Fsample%3Fkind%3Dcomponents%26category%3Dvehicles',
  );
  for (const value of ['https://other.example', '//other.example', '/\\other.example', '/login', '/unknown'])
    expect(safeReturnTo(value)).toBeNull();
});
it('keeps the original destination through a required password change', () => {
  expect(loginAfterPasswordChange('/login', '?returnTo=%2Fmanage%2Fpages%3Fproject%3Dsample')).toBe(
    '/login?returnTo=%2Fmanage%2Fpages%3Fproject%3Dsample',
  );
  expect(loginAfterPasswordChange('/login', '?returnTo=https%3A%2F%2Fother.example')).toBe(
    '/login?returnTo=%2Fpages',
  );
  expect(loginAfterPasswordChange('/pages/sample/admin/example', '')).toBe(
    '/login?returnTo=%2Fpages%2Fsample%2Fadmin%2Fexample',
  );
});
it('returns to the demo after sign-in and required password changes', () => {
  const route = '/demo/sample/operation/vehicle-groups';
  expect(safeReturnTo(route)).toBe(route);
  expect(loginRoute('/demo?project=sample')).toBe('/login?returnTo=%2Fdemo%3Fproject%3Dsample');
  expect(loginAfterPasswordChange('/login', `?returnTo=${encodeURIComponent(route)}`)).toBe(
    loginRoute(route),
  );
  expect(loginAfterPasswordChange(route, '')).toBe(loginRoute(route));
  for (const value of ['/demolition', '/demo\\other', '/demo\nother', '//demo'])
    expect(safeReturnTo(value)).toBeNull();
});
