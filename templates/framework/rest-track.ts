import type { RestTrack } from '@/features/rest/rest-player';

/** Media belongs to the host environment; the framework distributes no recording. */
export const REST_ARTWORK_FALLBACK = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#202020"/><circle cx="320" cy="200" r="128" fill="#353535"/><circle cx="320" cy="200" r="38" fill="#737373"/><circle cx="320" cy="200" r="8" fill="#202020"/></svg>')}`;
export const REST_TRACK: RestTrack = {
  title: '休息音乐',
  artist: '',
  artwork: REST_ARTWORK_FALLBACK,
  url: undefined,
};
export const REST_TRACK_VERSION = '';
export const REST_TRACK_ALBUM = '';
export const REST_TRACK_ALBUM_URL = '';
