/** Serial deployment transaction. Maintenance isolates writes until health passes;
 * pre-commit failures restore a stopped database, code rollback keeps live data. */
import { promises as fs, constants } from 'node:fs';
import { DatabaseSync, backup } from 'node:sqlite';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { activateRelease, verifyRelease } from './release.mjs';
import {
  readDeploymentConfig,
  prepareDeploymentPaths,
  readJson,
  writeJson,
  databaseFile,
  RELEASE_ID,
} from './deployment-config.mjs';
const run = promisify(execFile);
async function staleLock(filename) {
  const owner = JSON.parse(await fs.readFile(filename, 'utf8'));
  if (!Number.isSafeInteger(owner.pid) || owner.pid < 1) throw new Error('部署锁无效，需人工核对');
  const bootId = await fs.readFile('/proc/sys/kernel/random/boot_id', 'utf8').catch(() => null);
  if (bootId && owner.bootId && bootId !== owner.bootId) return true;
  try {
    process.kill(owner.pid, 0);
    return false;
  } catch (error) {
    if (error.code === 'ESRCH') return true;
    throw error;
  }
}
export async function unpackRelease(archive, config) {
  if (!(await fs.lstat(archive)).isFile() || (await fs.stat(archive)).size > 512 * 1024 * 1024)
    throw new Error('发行压缩包无效或过大');
  const listing = (await run('tar', ['-tzf', archive], { maxBuffer: 4 * 1024 * 1024 })).stdout
    .trim()
    .split(/\r?\n/);
  const releaseId = listing[0]?.split('/')[0];
  if (
    !RELEASE_ID.test(releaseId || '') ||
    listing.length > 10000 ||
    new Set(listing).size !== listing.length ||
    listing.some(
      (name) =>
        !name.startsWith(`${releaseId}/`) ||
        name.includes('\\') ||
        [...name].some((character) => character.charCodeAt(0) < 32) ||
        name.split('/').some((part) => part === '..' || part === '.') ||
        !(
          name === `${releaseId}/` ||
          name === `${releaseId}/manifest.json` ||
          /^(web|runtime|project-content)\//.test(name.slice(releaseId.length + 1))
        ),
    )
  )
    throw new Error('发行压缩包路径越界或重复');
  const details = (await run('tar', ['-tvzf', archive], { maxBuffer: 8 * 1024 * 1024 })).stdout
    .trim()
    .split(/\r?\n/);
  if (
    details.some((line) => !['-', 'd'].includes(line[0])) ||
    details.reduce((total, line) => total + Number(line.trim().split(/\s+/)[2] || 0), 0) > 1024 * 1024 * 1024
  )
    throw new Error('发行包只允许普通文件和目录，展开上限1GiB');
  const staging = await fs.mkdtemp(path.join(config.releaseRoot, '.incoming-'));
  await run('tar', ['-xzf', archive, '-C', staging, '--no-same-owner', '--no-same-permissions'], {
    timeout: 60000,
  });
  const extracted = path.join(staging, releaseId);
  const manifest = await verifyRelease(extracted);
  if (manifest.schemaVersion !== 3 || manifest.dirty) throw new Error('线上只允许固定提交的完整干净发行');
  const candidate = path.join(config.releaseRoot, releaseId);
  if (
    await fs.lstat(candidate).catch((error) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    })
  ) {
    const existing = await verifyRelease(candidate);
    if (JSON.stringify(existing) !== JSON.stringify(manifest)) throw new Error('已有发行目录内容不同');
  } else await fs.rename(extracted, candidate);
  return { candidate, manifest };
}
function schemaVersion(filename) {
  const database = new DatabaseSync(filename, { readOnly: true });
  try {
    if (database.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok')
      throw new Error('数据库完整性检查失败');
    return database.prepare('PRAGMA user_version').get().user_version;
  } finally {
    database.close();
  }
}
export async function checkHealth(config, manifest, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(config.healthUrl, { signal: AbortSignal.timeout(2000) });
      const health = response.ok ? await response.json() : null;
      if (
        health?.status === 'ok' &&
        health.releaseId === manifest.releaseId &&
        health.protocol === manifest.protocol &&
        health.databaseSchema >= manifest.runtime.databaseMinSchema &&
        health.databaseSchema <= manifest.runtime.databaseSchema &&
        health.releaseSchemas?.includes(3)
      ) {
        const homepage = await fetch(`http://127.0.0.1:${config.port}/`, {
          signal: AbortSignal.timeout(2000),
        });
        if (homepage.ok && (await homepage.text()).includes('<html')) return health;
      }
    } catch {
      /* Retry readiness without treating a failed request as success. */
    }
    await delay(500);
  }
  throw new Error('候选API/页面健康检查失败');
}
async function restoreStoppedDatabase(config, transaction) {
  if (!transaction.databaseMayChange) return;
  const filename = await databaseFile(config);
  const failed = path.join(config.backupRoot, `${transaction.id}-failed`);
  await fs.mkdir(failed, { mode: 0o700, recursive: true });
  for (const suffix of ['', '-wal', '-shm']) {
    try {
      await fs.copyFile(
        filename + suffix,
        path.join(failed, `platform.sqlite${suffix}`),
        constants.COPYFILE_EXCL,
      );
    } catch (error) {
      if (!['ENOENT', 'EEXIST'].includes(error.code)) throw error;
    }
  }
  if (transaction.backup) {
    const source = path.join(config.backupRoot, transaction.backup);
    schemaVersion(source);
    const temporary = `${filename}.restore-${transaction.id}`;
    await fs.copyFile(source, temporary);
    await fs.rename(temporary, filename);
  } else
    await fs.unlink(filename).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  for (const suffix of ['-wal', '-shm'])
    await fs.unlink(filename + suffix).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
}
export async function deployRelease({
  config,
  archive,
  sequence,
  rollback = false,
  recover = false,
  bootRecover = false,
  service,
  healthTimeout,
}) {
  await prepareDeploymentPaths(config);
  const control = bootRecover
    ? async () => {}
    : service ||
      (async (action) => {
        await run('sudo', ['-n', 'systemctl', action, config.service], { timeout: 60000 });
      });
  const lockPath = path.join(config.stateRoot, 'deploy.lock');
  try {
    const lock = await fs.open(lockPath, 'wx', 0o600);
    await lock.writeFile(
      JSON.stringify({
        pid: process.pid,
        bootId: await fs.readFile('/proc/sys/kernel/random/boot_id', 'utf8').catch(() => null),
      }),
    );
    await lock.close();
  } catch (error) {
    if (!recover || error.code !== 'EEXIST') throw new Error('另一个部署正在执行或存在未恢复的部署锁');
    if (!(await staleLock(lockPath))) throw new Error('部署进程仍在运行');
    await fs.unlink(lockPath);
    return deployRelease({
      config,
      archive,
      sequence,
      rollback,
      recover,
      bootRecover,
      service,
      healthTimeout,
    });
  }
  const journalPath = path.join(config.stateRoot, 'transaction.json');
  const maintenance = path.join(config.stateRoot, 'maintenance');
  async function recoverTransaction(transaction) {
    const current = await readJson(path.join(config.releaseRoot, 'current.json'));
    await fs.writeFile(maintenance, 'updating\n', { mode: 0o644 });
    await control('stop');
    if (current?.releaseId !== transaction.releaseId || current.sequence !== transaction.sequence)
      await restoreStoppedDatabase(config, transaction);
    transaction.candidateReady = false;
    transaction.databaseMayChange = false;
    await writeJson(journalPath, transaction);
    if (current && !bootRecover) {
      const active = await verifyRelease(path.join(config.releaseRoot, current.releaseId));
      await control('start');
      await checkHealth(config, active, healthTimeout);
      await fs.unlink(maintenance);
    }
    await fs.unlink(journalPath);
    return { recovered: true, releaseId: current?.releaseId ?? null };
  }
  try {
    const pending = await readJson(journalPath);
    if (
      pending &&
      (!RELEASE_ID.test(pending.releaseId || '') ||
        !/^[a-zA-Z0-9-]{1,64}$/.test(pending.id || '') ||
        !Number.isSafeInteger(pending.sequence) ||
        pending.sequence < 1 ||
        (pending.backup !== null && !/^[a-zA-Z0-9-]{1,64}\.sqlite$/.test(pending.backup || '')))
    )
      throw new Error('部署事务日志无效，保持维护并人工核对');
    if (recover) {
      const activationLock = path.join(config.releaseRoot, '.activation-lock');
      if (await fs.stat(activationLock).catch(() => null)) {
        if (!(await staleLock(activationLock))) throw new Error('发行激活仍在运行');
        await fs.unlink(activationLock);
      }
    }
    if (pending) {
      if (!recover) throw new Error('上次部署未结束，请先执行recover');
      return await recoverTransaction(pending);
    }
    if (recover) return { recovered: true, message: '没有待恢复的部署' };
    const current = await readJson(path.join(config.releaseRoot, 'current.json'));
    if (
      current &&
      (!RELEASE_ID.test(current.releaseId || '') ||
        !Number.isSafeInteger(current.sequence) ||
        (current.previous !== null && !RELEASE_ID.test(current.previous || '')))
    )
      throw new Error('当前发行指针无效');
    const nextSequence = sequence ?? (current?.sequence ?? 0) + 1;
    if (!Number.isSafeInteger(nextSequence) || nextSequence <= (current?.sequence ?? 0))
      throw new Error('旧发布任务不能覆盖更新的版本');
    const candidate = rollback
      ? path.join(config.releaseRoot, current?.previous || '')
      : (await unpackRelease(archive, config)).candidate;
    const manifest = await verifyRelease(candidate);
    if (
      manifest.schemaVersion !== 3 ||
      manifest.dirty ||
      (rollback && current?.previous !== manifest.releaseId)
    )
      throw new Error('回退仅支持上一完整兼容发行');
    const [nodeMajor, nodeMinor] = (await run(config.node, ['--version'])).stdout
      .trim()
      .slice(1)
      .split('.')
      .map(Number);
    if (nodeMajor !== manifest.runtime.nodeMajor || nodeMinor < 13)
      throw new Error('服务器需Node.js 24.13.0或更新的24.x');
    const filename = await databaseFile(config);
    const exists = Boolean(
      await fs.stat(filename).catch((error) => {
        if (error.code === 'ENOENT') return null;
        throw error;
      }),
    );
    const schema = exists ? schemaVersion(filename) : 0;
    if (
      rollback
        ? schema < manifest.runtime.databaseMinSchema || schema > manifest.runtime.databaseSchema
        : !manifest.runtime.migrationFrom.includes(schema)
    )
      throw new Error('数据库与候选版本不兼容；不能自动回退数据库');
    const transaction = {
      id: randomUUID(),
      releaseId: manifest.releaseId,
      sequence: nextSequence,
      backup: null,
      databaseMayChange: false,
      candidateReady: false,
      rollback,
      startedAt: new Date().toISOString(),
    };
    await writeJson(journalPath, transaction);
    try {
      await fs.writeFile(maintenance, 'updating\n', { mode: 0o644 });
      await control('stop');
      if (exists) {
        transaction.backup = `${transaction.id}.sqlite`;
        const database = new DatabaseSync(filename, { readOnly: true });
        try {
          await backup(database, path.join(config.backupRoot, transaction.backup));
        } finally {
          database.close();
        }
        await fs.chmod(path.join(config.backupRoot, transaction.backup), 0o600);
      }
      transaction.databaseMayChange = true;
      await writeJson(journalPath, transaction);
      if (!rollback)
        await run(config.node, [path.join(candidate, 'runtime/migrate.mjs'), '--data', config.dataRoot], {
          timeout: 60000,
        });
      transaction.candidateReady = true;
      await writeJson(journalPath, transaction);
      await control('start');
      await checkHealth(config, manifest, healthTimeout);
      const activated = await activateRelease({
        releaseRoot: config.releaseRoot,
        candidate,
        sequence: nextSequence,
        rollback,
      });
      await fs.unlink(journalPath);
      await fs.unlink(maintenance);
      console.log(`部署完成：${manifest.releaseId}`);
      return activated;
    } catch (error) {
      try {
        await recoverTransaction(transaction);
      } catch (recoveryError) {
        throw new AggregateError([error, recoveryError], '部署失败且恢复未完成；保持维护模式，执行recover');
      }
      throw error;
    }
  } finally {
    await fs.unlink(lockPath);
  }
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const args = process.argv.slice(2);
  const value = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
  const command = args[0];
  if (!['deploy', 'rollback', 'recover', 'status'].includes(command))
    throw new Error(
      'Usage: deploy.mjs deploy --archive <file> --sequence <number> | rollback | recover | status [--config <file>]',
    );
  const config = await readDeploymentConfig(value('--config', '/etc/preview/deploy.json'));
  const bootRecover = args.includes('--boot');
  if (bootRecover) {
    if (command !== 'recover') throw new Error('--boot只允许开机恢复');
    const state = await run('systemctl', ['is-active', config.service]).catch((error) => ({
      stdout: error.stdout || '',
    }));
    if (!['inactive', 'failed', 'unknown'].includes(state.stdout.trim()))
      throw new Error('开机恢复必须确认平台服务未运行');
  }
  if (command === 'status')
    console.log(
      JSON.stringify(
        {
          current: await readJson(path.join(config.releaseRoot, 'current.json')),
          transaction: await readJson(path.join(config.stateRoot, 'transaction.json')),
          maintenance: Boolean(await fs.stat(path.join(config.stateRoot, 'maintenance')).catch(() => null)),
        },
        null,
        2,
      ),
    );
  else {
    if (command === 'deploy' && (!args.includes('--archive') || !args.includes('--sequence')))
      throw new Error('deploy需要--archive及--sequence');
    console.log(
      JSON.stringify(
        await deployRelease({
          config,
          archive: value('--archive'),
          sequence: args.includes('--sequence') ? Number(value('--sequence')) : undefined,
          rollback: command === 'rollback',
          recover: command === 'recover',
          bootRecover,
        }),
      ),
    );
  }
}
