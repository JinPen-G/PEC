import type { RestTrack } from './rest-player';
import { REST_MEDIA } from '../../../../../packages/platform-contracts/src/rest-media.js';

const audio = import.meta.glob<string>('./media/all-too-well.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});
const artwork = import.meta.glob<string>('./media/all-too-well-cover.{jpg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const deploymentMedia = Object.fromEntries(
  REST_MEDIA.map((entry) => [
    entry.name,
    document.querySelector<HTMLMetaElement>(`meta[name="${entry.name}"]`)?.content || undefined,
  ]),
);
export const REST_ARTWORK_FALLBACK = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#5b2831"/><circle cx="320" cy="200" r="140" fill="#201a1c"/><circle cx="320" cy="200" r="60" fill="#b98b80"/><circle cx="320" cy="200" r="8" fill="#201a1c"/></svg>')}`;

export const REST_TRACK: RestTrack = {
  title: 'All Too Well',
  artist: 'Taylor Swift',
  artwork: deploymentMedia['preview-rest-artwork'] ?? Object.values(artwork)[0] ?? REST_ARTWORK_FALLBACK,
  url: deploymentMedia['preview-rest-audio'] ?? audio['./media/all-too-well.mp3'],
};
export const REST_TRACK_VERSION = '10 Minute Version · Taylor’s Version';
export const REST_TRACK_ALBUM = 'Red (Taylor’s Version)';
export const REST_TRACK_ALBUM_URL =
  'https://music.apple.com/cn/album/red-taylors-version-a-message-from-taylor/1590368448';
