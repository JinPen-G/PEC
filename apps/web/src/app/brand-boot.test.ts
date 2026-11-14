import { expect, it } from 'vitest';
import { isHomepageEntry } from '../../../../packages/preview-ui/src/brand-boot';

it.each(['', '#', '#/', '#/?project=rimo-rental', '#?project=rimo-rental'])(
  'recognizes the homepage hash %s before the router loads',
  (hash) => {
    expect(isHomepageEntry({ pathname: '/', hash })).toBe(true);
    expect(isHomepageEntry({ pathname: '/index.html', hash })).toBe(true);
    expect(isHomepageEntry({ pathname: '/preview/', hash }, '/preview/')).toBe(true);
    expect(isHomepageEntry({ pathname: '/preview/index.html', hash }, '/preview/')).toBe(true);
  },
);

it.each([
  { pathname: '/', hash: '#/docs' },
  { pathname: '/index.html', hash: '#/login' },
  { pathname: '/docs', hash: '' },
  { pathname: '/tools/project-routes', hash: '' },
  { pathname: '/other/', hash: '#/' },
  { pathname: '/preview/docs', hash: '' },
])('excludes a direct nonhome route $pathname$hash', (location) => {
  expect(isHomepageEntry(location)).toBe(false);
  expect(isHomepageEntry(location, '/preview/')).toBe(false);
});
