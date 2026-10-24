import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Buffer } from 'node:buffer';

import { DEFAULT_SCAN_IGNORES } from './constants.js';

export function toWebPath(filePath) {
  return String(filePath || '')
    .split(path.sep)
    .join('/');
}

export function isInsideRoot(root, target, { allowRoot = false } = {}) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  if (!relative) return allowRoot;
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function isSafeRelativePath(value) {
  const normalized = String(value || '').replaceAll('\\', '/');
  return (
    Boolean(normalized) &&
    !normalized.startsWith('/') &&
    !/^[a-z]:\//iu.test(normalized) &&
    !normalized.split('/').includes('..')
  );
}

function hasAllowedExtension(filePath, allowedExtensions) {
  if (!allowedExtensions) return true;
  const normalized = new Set(
    [...allowedExtensions].map((extension) =>
      String(extension || '')
        .trim()
        .toLowerCase(),
    ),
  );
  return normalized.has(path.extname(filePath).toLowerCase());
}

async function nearestExistingDirectory(directory, fsApi = fs) {
  let current = path.resolve(directory);
  while (true) {
    try {
      const stats = await fsApi.stat(current);
      if (stats.isDirectory()) return current;
      return null;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export async function resolveExistingPathInsideRoot(
  root,
  relativePath,
  { allowedExtensions = null, type = 'file', allowRoot = false, fsApi = fs } = {},
) {
  if (!isSafeRelativePath(relativePath)) return null;
  const absoluteRoot = path.resolve(root);
  const target = path.resolve(absoluteRoot, ...String(relativePath).replaceAll('\\', '/').split('/'));
  if (!isInsideRoot(absoluteRoot, target, { allowRoot })) return null;
  if (!hasAllowedExtension(target, allowedExtensions)) return null;

  const [realRoot, realTarget] = await Promise.all([
    fsApi.realpath(absoluteRoot).catch(() => null),
    fsApi.realpath(target).catch(() => null),
  ]);
  if (!realRoot || !realTarget || !isInsideRoot(realRoot, realTarget, { allowRoot })) return null;
  const stats = await fsApi.stat(realTarget).catch(() => null);
  if (!stats) return null;
  if (type === 'file' && !stats.isFile()) return null;
  if (type === 'directory' && !stats.isDirectory()) return null;
  return realTarget;
}

export async function resolveWritablePathInsideRoot(
  root,
  relativePath,
  { allowedExtensions = null, fsApi = fs } = {},
) {
  if (!isSafeRelativePath(relativePath)) return null;
  const absoluteRoot = path.resolve(root);
  const target = path.resolve(absoluteRoot, ...String(relativePath).replaceAll('\\', '/').split('/'));
  if (!isInsideRoot(absoluteRoot, target) || !hasAllowedExtension(target, allowedExtensions)) return null;

  const [realRoot, existingParent] = await Promise.all([
    fsApi.realpath(absoluteRoot).catch(() => null),
    nearestExistingDirectory(path.dirname(target), fsApi),
  ]);
  if (!realRoot || !existingParent) return null;
  const realParent = await fsApi.realpath(existingParent).catch(() => null);
  if (!realParent || !isInsideRoot(realRoot, realParent, { allowRoot: true })) return null;
  return target;
}

export async function fileExists(filePath, type = 'file') {
  return fs
    .stat(filePath)
    .then((stats) => (type === 'directory' ? stats.isDirectory() : stats.isFile()))
    .catch(() => false);
}

export async function readJsonFile(filePath, { fallback, allowMissing = fallback !== undefined } = {}) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (allowMissing && error.code === 'ENOENT') return fallback;
    if (error instanceof SyntaxError) {
      error.message = `${path.basename(filePath)} 不是有效的 JSON：${error.message}`;
    }
    throw error;
  }
}

export async function importJavaScriptFile(filePath, { cacheKey = Date.now() } = {}) {
  const source = await fs.readFile(filePath, 'utf8');
  const moduleSource = `${source}\n//# sourceURL=${toWebPath(filePath)}\n// cache-key:${cacheKey}\n`;
  return import(`data:text/javascript;base64,${Buffer.from(moduleSource, 'utf8').toString('base64')}`);
}

async function pathExists(targetPath, fsApi) {
  try {
    await fsApi.lstat(targetPath);
    return true;
  } catch {
    return false;
  }
}

// Node 24 在部分 Windows 路径（例如包含中文的目录）上 fs.rm 会静默不生效：既不删除也不报错。
// 先按常规方式调用 fs.rm，校验结果，仍存在时回退为 lstat + unlink/rmdir 的手工递归删除。
async function removePathByHand(targetPath, fsApi) {
  const stats = await fsApi.lstat(targetPath);
  if (!stats.isDirectory()) {
    await fsApi.unlink(targetPath);
    return;
  }
  for (const entry of await fsApi.readdir(targetPath)) {
    await removePathByHand(path.join(targetPath, entry), fsApi);
  }
  await fsApi.rmdir(targetPath);
}

export async function removePathReliably(targetPath, { fsApi = fs } = {}) {
  try {
    await fsApi.rm(targetPath, { recursive: true, force: true });
  } catch {
    // 忽略：统一由下方校验与回退兜底。
  }
  if (!(await pathExists(targetPath, fsApi))) return;
  await removePathByHand(targetPath, fsApi);
}

export async function writeFileAtomic(filePath, content, options = {}) {
  const { fsApi = fs, ...writeOptions } = options;
  const directory = path.dirname(filePath);
  const temporaryPath = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`,
  );
  await fsApi.mkdir(directory, { recursive: true });
  try {
    await fsApi.writeFile(temporaryPath, content, writeOptions);
    await fsApi.rename(temporaryPath, filePath);
  } catch (error) {
    await removePathReliably(temporaryPath, { fsApi }).catch(() => {});
    throw error;
  }
}

export async function writeJsonAtomic(filePath, value, options = {}) {
  return writeFileAtomic(filePath, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: 'utf8',
    ...options,
  });
}

async function snapshotFile(filePath, fsApi) {
  try {
    const stats = await fsApi.lstat(filePath);
    if (stats.isSymbolicLink()) throw new Error(`事务文件不允许是符号链接：${filePath}`);
    if (!stats.isFile()) throw new Error(`事务路径不是文件：${filePath}`);
    return { filePath, existed: true, content: await fsApi.readFile(filePath), mode: stats.mode };
  } catch (error) {
    if (error.code === 'ENOENT') return { filePath, existed: false };
    throw error;
  }
}

export async function withFileRollback(filePaths, operation, { fsApi = fs } = {}) {
  const normalizedPaths = [...new Set(filePaths.filter(Boolean).map((filePath) => path.resolve(filePath)))];
  const snapshots = [];
  for (const filePath of normalizedPaths) snapshots.push(await snapshotFile(filePath, fsApi));
  try {
    return await operation();
  } catch (error) {
    const rollbackErrors = [];
    for (const snapshot of [...snapshots].reverse()) {
      try {
        if (snapshot.existed) {
          await writeFileAtomic(snapshot.filePath, snapshot.content, { mode: snapshot.mode, fsApi });
        } else {
          await removePathReliably(snapshot.filePath, { fsApi });
        }
      } catch (rollbackError) {
        rollbackErrors.push({ filePath: snapshot.filePath, message: rollbackError.message });
      }
    }
    error.rollback = { ok: rollbackErrors.length === 0, errors: rollbackErrors };
    throw error;
  }
}

export async function walkFiles(
  root,
  { extensions, skippedDirectories = DEFAULT_SCAN_IGNORES, includeHidden = true } = {},
) {
  const files = [];
  const normalizedExtensions = extensions
    ? new Set([...extensions].map((extension) => String(extension).toLowerCase()))
    : null;

  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true }).catch((error) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    });
    entries.sort((left, right) => left.name.localeCompare(right.name, 'zh-Hans-CN', { numeric: true }));

    for (const entry of entries) {
      if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;
      if (!includeHidden && entry.name.startsWith('.')) continue;
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
      } else if (
        entry.isFile() &&
        (!normalizedExtensions || normalizedExtensions.has(path.extname(entry.name).toLowerCase()))
      ) {
        files.push(absolutePath);
      }
    }
  }

  await walk(path.resolve(root));
  return files;
}

export async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(Math.max(1, limit), items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}
