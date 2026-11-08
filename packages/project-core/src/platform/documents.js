/** Authorized callers select a configured source ID. Only relative Markdown and
 * inert image resources are read; realpath checks reject symlink escapes. */
import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { resolveExistingPathInsideRoot } from '../filesystem.js';
import { fail } from './store.js';

const extensions = ['.md', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif'];
export function createNativeDocuments({ sources }) {
  function root(project) {
    const source = sources[project.sourceId];
    if (!source) fail(503, '文档源未配置', 'DOCUMENT_SOURCE_UNAVAILABLE');
    return source.perProject ? path.join(source.root, project.id) : source.root;
  }
  async function safeRoot(project) {
    const directory = root(project);
    const source = sources[project.sourceId];
    const stats = await fs.lstat(directory).catch(() => null);
    if (source.perProject && stats?.isSymbolicLink())
      fail(403, '项目文档根目录不能指向其他目录', 'FORBIDDEN');
    if (!stats?.isDirectory() && !stats?.isSymbolicLink())
      fail(503, '文档源目录不可用，请联系管理员', 'DOCUMENT_SOURCE_UNAVAILABLE');
    const sourceRoot = await fs.realpath(sources[project.sourceId].root).catch(() => null);
    const realRoot = await fs.realpath(directory).catch(() => null);
    if (!sourceRoot || !realRoot) fail(503, '文档源目录不可用，请联系管理员', 'DOCUMENT_SOURCE_UNAVAILABLE');
    const relative = path.relative(sourceRoot, realRoot);
    if (relative.startsWith('..') || path.isAbsolute(relative)) fail(403, '文档源越界', 'FORBIDDEN');
    return directory;
  }
  async function read(project, file) {
    if (
      typeof file !== 'string' ||
      file.length > 512 ||
      /[:\\]/.test(file) ||
      [...file].some((char) => char.charCodeAt(0) < 32) ||
      file.split('/').some((segment) => segment === '..' || segment === '.' || !segment)
    )
      fail(400, '文档路径无效');
    const directory = await safeRoot(project);
    const resolved = await resolveExistingPathInsideRoot(directory, file, { allowedExtensions: extensions });
    if (!resolved) fail(404, '文档或资源不存在', 'DOCUMENT_NOT_FOUND');
    const stat = await fs.stat(resolved);
    if (stat.size > (/\.md$/i.test(file) ? 2 : 8) * 1024 * 1024)
      fail(413, '文档或资源过大', 'PAYLOAD_TOO_LARGE');
    const bytes = await fs.readFile(resolved);
    return {
      bytes,
      extension: path.extname(file).toLowerCase(),
      revision: createHash('sha256').update(bytes).digest('hex'),
    };
  }
  async function list(project) {
    const directory = await safeRoot(project),
      items = [];
    let scanned = 0;
    async function scan(relative = '', depth = 0) {
      if (depth > 12) fail(413, '文档目录层级过深', 'PAYLOAD_TOO_LARGE');
      const entries = await fs.readdir(path.join(directory, relative), { withFileTypes: true });
      for (const entry of entries) {
        if (++scanned > 4000) fail(413, '文档目录过大', 'PAYLOAD_TOO_LARGE');
        if (entry.isSymbolicLink() || entry.name.startsWith('.')) continue;
        const file = relative ? `${relative}/${entry.name}` : entry.name;
        if (entry.isDirectory()) await scan(file, depth + 1);
        else if (entry.isFile() && /\.md$/i.test(entry.name)) {
          const { bytes, revision } = await read(project, file);
          const title = /^#\s+(.+)$/m.exec(bytes.toString('utf8'))?.[1] ?? entry.name.replace(/\.md$/i, '');
          items.push({ path: file, title, size: bytes.length, revision });
        }
      }
    }
    await scan();
    return items.sort((a, b) => a.path.localeCompare(b.path));
  }
  return {
    list,
    read,
    sources: () => Object.entries(sources).map(([id, source]) => ({ id, label: source.label })),
  };
}
