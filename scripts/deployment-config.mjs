/** Host paths are explicit; runtime, state and private data have separate roots. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
export const RELEASE_ID = /^[a-f\d]{12}-[a-f\d]{12}$/;
export async function readDeploymentConfig(filename) {
  const config = JSON.parse(await fs.readFile(filename, 'utf8'));
  const keys = ['schemaVersion', 'installRoot', 'storageRoot', 'publicOrigin', 'port', 'service', 'node'];
  if (
    config.schemaVersion !== 1 ||
    Object.keys(config).some((key) => !keys.includes(key)) ||
    !Number.isInteger(config.port) ||
    config.port < 1024 ||
    config.port > 65535 ||
    config.service !== 'preview.service' ||
    !path.isAbsolute(config.node)
  )
    throw new Error('部署配置无效');
  const origin = new URL(config.publicOrigin);
  if (
    !['http:', 'https:'].includes(origin.protocol) ||
    origin.origin !== config.publicOrigin ||
    origin.username ||
    origin.password
  )
    throw new Error('部署origin必须为完整站点来源');
  for (const key of ['installRoot', 'storageRoot']) {
    if (
      !path.isAbsolute(config[key]) ||
      path.resolve(config[key]) === path.parse(config[key]).root ||
      /\s/.test(config[key]) ||
      [...config[key]].some((character) => character.charCodeAt(0) < 32)
    )
      throw new Error('部署根目录无效');
    if ((await fs.realpath(config[key])) !== path.resolve(config[key]))
      throw new Error('部署根目录不能含符号链接');
  }
  if (
    config.installRoot === config.storageRoot ||
    path.relative(config.installRoot, config.storageRoot).split(path.sep)[0] !== '..' ||
    path.relative(config.storageRoot, config.installRoot).split(path.sep)[0] !== '..'
  )
    throw new Error('安装与持久化目录必须彼此独立');
  return {
    ...config,
    releaseRoot: path.join(config.installRoot, 'releases'),
    stateRoot: path.join(config.installRoot, 'state'),
    dataRoot: path.join(config.storageRoot, 'data'),
    backupRoot: path.join(config.storageRoot, 'backups'),
    healthUrl: `http://127.0.0.1:${config.port}/api/native/health`,
  };
}
export async function prepareDeploymentPaths(config) {
  for (const directory of [config.releaseRoot, config.stateRoot, config.dataRoot, config.backupRoot]) {
    await fs.mkdir(directory, { recursive: true, mode: 0o700 });
    if ((await fs.realpath(directory)) !== directory) throw new Error('部署子目录不能为符号链接');
  }
}
export async function readJson(filename) {
  try {
    return JSON.parse(await fs.readFile(filename, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}
export async function writeJson(filename, data) {
  const temporary = `${filename}.${process.pid}.tmp`;
  const handle = await fs.open(temporary, 'wx', 0o600);
  try {
    await handle.writeFile(JSON.stringify(data, null, 2) + '\n');
    await handle.sync();
  } finally {
    await handle.close();
  }
  await fs.rename(temporary, filename);
  if (process.platform !== 'win32') {
    const directory = await fs.open(path.dirname(filename), 'r');
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
  }
}
export async function databaseFile(config) {
  const filename = path.join(config.dataRoot, 'platform.sqlite');
  for (const suffix of ['', '-wal', '-shm']) {
    const stat = await fs.lstat(filename + suffix).catch((error) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (stat && !stat.isFile()) throw new Error('数据库必须为普通文件');
  }
  return filename;
}
