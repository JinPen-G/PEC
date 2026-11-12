/** Resolve only the two declared media files from the private deployment directory. */
import { promises as fs } from 'node:fs';
import { REST_MEDIA } from '../../platform-contracts/src/rest-media.js';
import { resolveExistingPathInsideRoot } from '../../project-core/src/filesystem.js';

export function createRestMedia(directory) {
  async function resolve(entry) {
    if (!directory) return null;
    const root = await fs.lstat(directory).catch((error) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (!root) return null;
    if (!root.isDirectory() || root.isSymbolicLink()) throw new Error('媒体目录必须为真实目录');
    return resolveExistingPathInsideRoot(directory, entry.file, { allowedExtensions: [entry.extension] });
  }
  return {
    async file(relative) {
      const entry = REST_MEDIA.find((item) => item.url === `/${relative}`);
      return entry ? resolve(entry) : null;
    },
    async index(bytes) {
      let html = bytes.toString('utf8');
      for (const entry of REST_MEDIA) {
        if (await resolve(entry))
          html = html.replace(
            `<meta name="${entry.name}" content=""`,
            `<meta name="${entry.name}" content="${entry.url}"`,
          );
      }
      return html;
    },
  };
}
