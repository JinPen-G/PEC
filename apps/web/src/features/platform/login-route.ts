/** Return URLs are same-app paths. Account role is verified again at destination. */
export function safeReturnTo(value: string | null) {
  return value &&
    /^\/(?:pages(?:\/|$)|manage(?:\/|$)|projects(?:\/|$)|center(?:\/|$)|p\/|docs(?:\/|$)|documents$)/.test(
      value,
    ) &&
    !/[\\\r\n]/.test(value)
    ? value
    : null;
}
export function loginRoute(path: string) {
  return `/login?returnTo=${encodeURIComponent(safeReturnTo(path) ?? '/pages')}`;
}
/** Required password changes occur on the login route. Preserve its original
 * destination rather than wrapping /login again and losing the return path. */
export function loginAfterPasswordChange(pathname: string, search: string) {
  const destination = pathname === '/login' ? new URLSearchParams(search).get('returnTo') : pathname + search;
  return loginRoute(safeReturnTo(destination) ?? '/pages');
}
