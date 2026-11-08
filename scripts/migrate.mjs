/** Deployment owns service isolation and backup; this command only migrates SQLite. */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, lstatSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { migrateNativeDatabase } from '../packages/project-core/src/platform/schema.js';
const position = process.argv.indexOf('--data');
if (position < 0 || !process.argv[position + 1]) throw new Error('Required: --data <private-directory>');
const directory = path.resolve(process.argv[position + 1]);
mkdirSync(directory, { recursive: true, mode: 0o700 });
if (lstatSync(directory).isSymbolicLink()) throw new Error('数据目录不能是符号链接');
const filename = path.join(directory, 'platform.sqlite');
try {
  if (lstatSync(filename).isSymbolicLink()) throw new Error('数据库不能是符号链接');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const database = new DatabaseSync(filename);
try {
  database.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  console.log(JSON.stringify(migrateNativeDatabase(database)));
} finally {
  database.close();
}
