function appIndexUrl() {
  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${baseUrl}index.html`;
}

export function appRouteUrl(route: string) {
  const path = route.startsWith('/') ? route : `/${route}`;
  return `${appIndexUrl()}#${path}`;
}

export function appHomeUrl() {
  return appIndexUrl();
}
