import type { RestTrack } from './rest-player';
import { REST_MEDIA } from '../../../../../packages/platform-contracts/src/rest-media.js';

/** Optional recordings are supplied by the server or selected in the browser. */
const media = Object.fromEntries(
  REST_MEDIA.map((entry) => [
    entry.name,
    document.querySelector<HTMLMetaElement>(`meta[name="${entry.name}"]`)?.content || undefined,
  ]),
);
export const REST_ARTWORK_FALLBACK = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#202020"/><circle cx="320" cy="200" r="128" fill="#353535"/><circle cx="320" cy="200" r="38" fill="#737373"/><circle cx="320" cy="200" r="8" fill="#202020"/></svg>')}`;
export const REST_TRACK: RestTrack = {
  title: '休息音乐',
  artist: '',
  artwork: media['preview-rest-artwork'] ?? REST_ARTWORK_FALLBACK,
  url: media['preview-rest-audio'],
};
export const REST_TRACK_VERSION = '';
export const REST_TRACK_ALBUM = '';
export const REST_TRACK_ALBUM_URL = '';
