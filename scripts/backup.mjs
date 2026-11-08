/** SQLite online backup is consistent with WAL. Never copies credentials into
 * release bundles; restore requires an explicitly stopped destination service. */
import { DatabaseSync, backup } from 'node:sqlite';
import { promises as fs } from 'node:fs';
import { constants } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2),
  command = args[0];
const value = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const data = path.resolve(value('--data', path.join(root, '.preview-data')));
if (command === 'backup') {
  const output = path.resolve(value('--output', path.join(root, '.preview-data/backups')));
  await fs.mkdir(output, { recursive: true });
  const target = path.join(output, `preview-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`);
  const source = new DatabaseSync(path.join(data, 'platform.sqlite'), { readOnly: true });
  try {
    await backup(source, target);
  } finally {
    source.close();
  }
  console.log(target);
} else if (command === 'restore') {
  if (!args.includes('--service-stopped'))
    throw new Error('Restore requires --service-stopped after stopping the native service');
  const source = path.resolve(value('--backup', ''));
  const database = new DatabaseSync(source, { readOnly: true });
  try {
    if (
      database.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok' ||
      ![1, 2, 3].includes(database.prepare('PRAGMA user_version').get().user_version)
    )
      throw new Error('Backup is invalid or incompatible');
  } finally {
    database.close();
  }
  await fs.mkdir(data, { recursive: true });
  const target = path.join(data, 'platform.sqlite');
  if (await fs.stat(target).catch(() => null))
    throw new Error(
      'Restore destination already has a database; choose an empty directory and preserve the existing files',
    );
  await fs.copyFile(source, target, constants.COPYFILE_EXCL);
  console.log('Restored verified database into the empty destination.');
} else
  throw new Error(
    'Usage: backup.mjs backup [--data <dir>] [--output <dir>] | restore --backup <file> --data <empty-dir> --service-stopped',
  );
