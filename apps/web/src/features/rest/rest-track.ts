import type { RestTrack } from './rest-player';

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

export const REST_TRACK: RestTrack = {
  title: 'All Too Well',
  artist: 'Taylor Swift',
  artwork: Object.values(artwork)[0] ?? 'https://i.ytimg.com/vi/aPnqx56V8-0/maxresdefault.jpg',
  url: audio['./media/all-too-well.mp3'],
};
export const REST_TRACK_VERSION = '10 Minute Version · Taylor’s Version';
export const REST_TRACK_ALBUM = 'Red (Taylor’s Version)';
export const REST_TRACK_ALBUM_URL =
  'https://music.apple.com/cn/album/red-taylors-version-a-message-from-taylor/1590368448';
