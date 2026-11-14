/** Content-verified releases. Private data stays outside all version directories. */
import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import process from 'node:process';
import { loadContentCatalog } from '../packages/project-core/src/platform/project-content.js';
import { webAssetResidue } from '../packages/project-core/src/platform/web-assets.js';
import { NATIVE_MODULES, nativePublicAssetAllowed } from '../packages/platform-contracts/src/platform.js';
import { loadProjectCatalog } from '../packages/platform-server/src/project-catalog.js';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const idPattern = /^[a-f\d]{12}-[a-f\d]{12}$/;
async function files(root, relative = '') {
  if (!relative && !(await fs.lstat(root)).isDirectory()) throw new Error('发行根必须为真实目录');
  const result = [];
  for (const entry of await fs.readdir(path.join(root, relative), { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error('发行包不允许符号链接');
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) result.push(...(await files(root, name)));
    else if (entry.isFile()) result.push(name);
  }
  return result.sort();
}
const allowedWeb = (name, extended) =>
  nativePublicAssetAllowed(name) ||
  (extended && (name === 'page-manifest.json' || /^(page-assets|page-source)\//.test(name)));
const runtimeNames = [
  'server.mjs',
  'admin.mjs',
  'migrate.mjs',
  'registry.json',
  'package.json',
  'contract.json',
  'THIRD-PARTY-NOTICES.txt',
];
async function recordsFor(directory) {
  return Promise.all(
    (await files(directory)).map(async (name) => {
      const bytes = await fs.readFile(path.join(directory, name));
      return { path: name, bytes: bytes.length, sha256: hash(bytes) };
    }),
  );
}
function runtimeContract(contract) {
  if (
    contract.schemaVersion !== 1 ||
    contract.nodeMajor !== 24 ||
    contract.nodeMinimum !== '24.13.0' ||
    contract.protocol !== 1 ||
    contract.migrationPolicy !== 'additive' ||
    !Number.isSafeInteger(contract.databaseSchema) ||
    !Number.isSafeInteger(contract.databaseMinSchema) ||
    contract.databaseMinSchema < 1 ||
    contract.databaseMinSchema > contract.databaseSchema ||
    !Array.isArray(contract.migrationFrom) ||
    contract.migrationFrom.some(
      (version) => !Number.isSafeInteger(version) || version < 0 || version > contract.databaseSchema,
    )
  )
    throw new Error('API运行合同无效或迁移需要人工处理');
  return contract;
}
export async function packageRelease({
  buildRoot,
  contentRoot,
  runtimeRoot,
  destination,
  commit,
  uiCommit,
  dirty = false,
}) {
  const extended = Boolean(contentRoot);
  if (runtimeRoot && !extended) throw new Error('完整发行必须包含业务资料目录');
  const runtimeFiles = runtimeRoot ? await recordsFor(runtimeRoot) : [];
  if (
    runtimeRoot &&
    (runtimeFiles.length !== runtimeNames.length ||
      runtimeFiles.some((record) => !runtimeNames.includes(record.path)))
  )
    throw new Error('运行时包含未允许的文件');
  const runtime = runtimeRoot
    ? runtimeContract(JSON.parse(await fs.readFile(path.join(runtimeRoot, 'contract.json'), 'utf8')))
    : null;
  const registry = runtimeRoot
    ? JSON.parse(await fs.readFile(path.join(runtimeRoot, 'registry.json'), 'utf8'))
    : NATIVE_MODULES;
  const names = await files(buildRoot);
  if (!names.includes('index.html') || names.some((name) => !allowedWeb(name, extended)))
    throw new Error('原生构建包含未允许的项目或文档资源');
  const records = [];
  for (const name of names) {
    const bytes = await fs.readFile(path.join(buildRoot, name));
    if (webAssetResidue(name, bytes)) throw new Error(`构建包含已退役的原站内容：${name}`);
    records.push({ path: name, bytes: bytes.length, sha256: hash(bytes) });
  }
  const packages = extended ? await loadContentCatalog(contentRoot, registry) : [];
  const contentRecords = [];
  if (extended)
    for (const name of await files(contentRoot)) {
      const bytes = await fs.readFile(path.join(contentRoot, name));
      contentRecords.push({ path: name, bytes: bytes.length, sha256: hash(bytes) });
    }
  if (!/^[a-f\d]{40}$/.test(commit) || !/^[a-f\d]{40}$/.test(uiCommit)) throw new Error('固定来源提交无效');
  const releaseId = `${commit.slice(0, 12)}-${hash(JSON.stringify({ records, contentRecords, runtimeFiles })).slice(0, 12)}`;
  const release = path.join(destination, releaseId);
  await fs.mkdir(release, { recursive: false });
  await fs.cp(buildRoot, path.join(release, 'web'), { recursive: true, errorOnExist: true });
  if (runtimeRoot)
    await fs.cp(runtimeRoot, path.join(release, 'runtime'), { recursive: true, errorOnExist: true });
  if (extended)
    await fs.cp(contentRoot, path.join(release, 'project-content'), { recursive: true, errorOnExist: true });
  const manifest = {
    schemaVersion: runtimeRoot ? 3 : extended ? 2 : 1,
    releaseId,
    commit,
    uiCommit,
    dirty,
    protocol: 1,
    databaseSchema: runtime?.databaseSchema ?? (extended ? 3 : 1),
    registryVersion: 1,
    createdAt: new Date().toISOString(),
    files: records,
    ...(runtimeRoot ? { runtime, runtimeFiles } : {}),
    ...(extended
      ? {
          contentSchema: 1,
          contentFiles: contentRecords,
          contents: packages.map(({ manifest, revision }) => ({
            contentKey: manifest.contentKey,
            moduleKey: manifest.moduleKey,
            revision,
          })),
        }
      : {}),
  };
  await fs.writeFile(path.join(release, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return { release, manifest };
}
export async function verifyRelease(directory) {
  const manifest = JSON.parse(await fs.readFile(path.join(directory, 'manifest.json'), 'utf8'));
  if (
    ![1, 2, 3].includes(manifest.schemaVersion) ||
    manifest.protocol !== 1 ||
    !Number.isSafeInteger(manifest.databaseSchema) ||
    manifest.databaseSchema < 1 ||
    !idPattern.test(manifest.releaseId) ||
    !Array.isArray(manifest.files)
  )
    throw new Error('发行版本与服务不兼容');
  const roots = (await fs.readdir(directory)).sort();
  const expected = [
    'manifest.json',
    'web',
    ...(manifest.schemaVersion >= 2 ? ['project-content'] : []),
    ...(manifest.schemaVersion === 3 ? ['runtime'] : []),
  ].sort();
  if (JSON.stringify(roots) !== JSON.stringify(expected)) throw new Error('发行包含未声明的文件');
  let registry = NATIVE_MODULES;
  if (manifest.schemaVersion === 3) {
    runtimeContract(manifest.runtime);
    if (manifest.runtime.databaseSchema !== manifest.databaseSchema || !Array.isArray(manifest.runtimeFiles))
      throw new Error('运行时版本不一致');
    const actualRuntime = await recordsFor(path.join(directory, 'runtime'));
    if (
      actualRuntime.length !== runtimeNames.length ||
      actualRuntime.some((record) => !runtimeNames.includes(record.path)) ||
      JSON.stringify(actualRuntime) !== JSON.stringify(manifest.runtimeFiles)
    )
      throw new Error('API文件清单或散列不一致');
    if (
      JSON.stringify(JSON.parse(await fs.readFile(path.join(directory, 'runtime/contract.json'), 'utf8'))) !==
      JSON.stringify(manifest.runtime)
    )
      throw new Error('API运行合同与清单不一致');
    registry = JSON.parse(await fs.readFile(path.join(directory, 'runtime/registry.json'), 'utf8'));
    if (!Array.isArray(registry) || registry.some((module) => !module.key || !Array.isArray(module.pages)))
      throw new Error('API页面注册清单无效');
    if (
      !/^[a-f\d]{40}$/.test(manifest.commit) ||
      !/^[a-f\d]{40}$/.test(manifest.uiCommit) ||
      manifest.releaseId.slice(0, 12) !== manifest.commit.slice(0, 12)
    )
      throw new Error('固定来源提交无效');
    if (
      manifest.releaseId !==
      `${manifest.commit.slice(0, 12)}-${hash(JSON.stringify({ records: manifest.files, contentRecords: manifest.contentFiles, runtimeFiles: manifest.runtimeFiles })).slice(0, 12)}`
    )
      throw new Error('发行标识与内容散列不一致');
  }
  const actual = await files(path.join(directory, 'web'));
  if (
    actual.length !== manifest.files.length ||
    new Set(manifest.files.map((record) => record.path)).size !== actual.length
  )
    throw new Error('发行资源清单不一致');
  for (const record of manifest.files) {
    if (
      !actual.includes(record.path) ||
      !allowedWeb(record.path, manifest.schemaVersion >= 2) ||
      record.path.split('/').some((part) => part === '..' || !part) ||
      record.path.includes('\\')
    )
      throw new Error('发行路径越界');
    const bytes = await fs.readFile(path.join(directory, 'web', record.path));
    if (bytes.length !== record.bytes || hash(bytes) !== record.sha256)
      throw new Error(`发行文件散列不一致：${record.path}`);
    if (webAssetResidue(record.path, bytes)) throw new Error(`发行包含已退役的原站内容：${record.path}`);
  }
  if (manifest.schemaVersion >= 2) {
    if (
      manifest.contentSchema !== 1 ||
      !Array.isArray(manifest.contentFiles) ||
      !Array.isArray(manifest.contents)
    )
      throw new Error('业务发行清单无效');
    const actualContents = await files(path.join(directory, 'project-content'));
    if (
      actualContents.length !== manifest.contentFiles.length ||
      new Set(manifest.contentFiles.map((item) => item.path)).size !== actualContents.length
    )
      throw new Error('业务文件清单不一致');
    for (const record of manifest.contentFiles) {
      if (
        !actualContents.includes(record.path) ||
        record.path.includes('\\') ||
        record.path.split('/').some((part) => !part || part === '..')
      )
        throw new Error('业务发行路径越界');
      const bytes = await fs.readFile(path.join(directory, 'project-content', record.path));
      if (bytes.length !== record.bytes || hash(bytes) !== record.sha256)
        throw new Error('业务发行文件散列不一致');
    }
    const packages = await loadContentCatalog(path.join(directory, 'project-content'), registry);
    if (
      packages.length !== manifest.contents.length ||
      packages.some(
        (item) =>
          !manifest.contents.some(
            (entry) => entry.contentKey === item.manifest.contentKey && entry.revision === item.revision,
          ),
      )
    )
      throw new Error('业务内容版本清单不一致');
  }
  return manifest;
}
export async function activateRelease({ releaseRoot, candidate, sequence, rollback = false }) {
  const root = path.resolve(releaseRoot),
    directory = path.resolve(candidate);
  const relative = path.relative(root, directory);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || path.dirname(directory) !== root)
    throw new Error('发行候选必须为release根目录的直接子目录');
  const manifest = await verifyRelease(directory);
  if (path.basename(directory) !== manifest.releaseId) throw new Error('发行目录与标识不一致');
  const realRoot = await fs.realpath(root),
    realCandidate = await fs.realpath(directory);
  if (path.dirname(realCandidate) !== realRoot) throw new Error('发行目录不能逃逸真实根目录');
  const lockPath = path.join(root, '.activation-lock');
  const lock = await fs.open(lockPath, 'wx');
  try {
    await lock.writeFile(
      JSON.stringify({
        pid: process.pid,
        bootId: await fs.readFile('/proc/sys/kernel/random/boot_id', 'utf8').catch(() => null),
      }),
    );
    const pointerPath = path.join(root, 'current.json');
    const current = await fs
      .readFile(pointerPath, 'utf8')
      .then(JSON.parse)
      .catch((error) => {
        if (error.code === 'ENOENT') return null;
        throw error;
      });
    const nextSequence = sequence ?? (current?.sequence ?? 0) + 1;
    if (!Number.isSafeInteger(nextSequence) || nextSequence <= (current?.sequence ?? 0))
      throw new Error('旧发布任务不能覆盖更新的版本');
    if (rollback && current?.previous !== manifest.releaseId) throw new Error('只允许回退上一兼容版本');
    const next = {
      schemaVersion: 1,
      releaseId: manifest.releaseId,
      previous: current?.releaseId ?? null,
      sequence: nextSequence,
      activatedAt: new Date().toISOString(),
    };
    const temporary = path.join(root, `.current-${randomUUID()}.json`);
    const handle = await fs.open(temporary, 'wx', 0o600);
    try {
      await handle.writeFile(JSON.stringify(next, null, 2) + '\n');
      await handle.sync();
    } finally {
      await handle.close();
    }
    await fs.rename(temporary, pointerPath);
    if (process.platform !== 'win32') {
      const rootHandle = await fs.open(root, 'r');
      try {
        await rootHandle.sync();
      } finally {
        await rootHandle.close();
      }
    }
    return next;
  } finally {
    await lock.close();
    await fs.unlink(lockPath);
  }
}
const root = fileURLToPath(new URL('..', import.meta.url));
if (
  import.meta.previewBundled !== true &&
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  const args = process.argv.slice(2),
    command = args[0];
  const value = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
  if (command === 'package') {
    const destination = path.resolve(value('--output', path.join(root, 'output/releases')));
    await fs.mkdir(destination, { recursive: true });
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const dirty = Boolean(
      execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], {
        cwd: root,
        encoding: 'utf8',
      }).trim(),
    );
    const uiCommit = JSON.parse(
      await fs.readFile(path.join(root, 'packages/preview-ui/source-manifest.json'), 'utf8'),
    ).commit;
    const catalog = await loadProjectCatalog(path.join(root, 'packages/platform-contracts/src'));
    const contentRoot = catalog.projects.length
      ? path.join(root, 'project-content')
      : path.join(root, 'output/release-content');
    if (!catalog.projects.length) {
      await fs.mkdir(contentRoot, { recursive: true });
      if ((await fs.readdir(contentRoot)).length) throw new Error('空业务发行的资料目录必须为空');
    }
    const result = await packageRelease({
      buildRoot: path.join(root, 'output/web'),
      contentRoot,
      runtimeRoot: path.join(root, 'output/runtime'),
      destination,
      commit,
      uiCommit,
      dirty,
    });
    console.log(result.release);
  } else if (command === 'verify')
    console.log((await verifyRelease(path.resolve(value('--release', '')))).releaseId);
  else if (command === 'activate' || command === 'rollback') {
    const releaseRoot = path.resolve(value('--root', path.join(root, '.preview-data/releases')));
    const candidate =
      command === 'rollback'
        ? path.join(
            releaseRoot,
            JSON.parse(await fs.readFile(path.join(releaseRoot, 'current.json'), 'utf8')).previous,
          )
        : path.resolve(value('--release', ''));
    if ((await verifyRelease(candidate)).schemaVersion === 3)
      throw new Error('完整发行须使用deploy部署/回退，以同步API和数据库');
    console.log(
      JSON.stringify(
        await activateRelease({
          releaseRoot,
          candidate,
          sequence: args.includes('--sequence') ? Number(value('--sequence')) : undefined,
          rollback: command === 'rollback',
        }),
      ),
    );
  } else
    throw new Error(
      'Usage: release.mjs package | verify --release <dir> | activate --root <dir> --release <dir> [--sequence <number>] | rollback --root <dir>',
    );
}
