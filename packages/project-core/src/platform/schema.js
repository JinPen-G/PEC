/** Additive schema upgrades run in one transaction, shared by startup and deploy. */
export const DATABASE_SCHEMA = 3;
export const DATABASE_MIN_SCHEMA = 3;
export const DATABASE_MIGRATION_FROM = [0, 1, 2, 3];

export function migrateNativeDatabase(database) {
  const version = database.prepare('PRAGMA user_version').get().user_version;
  if (!DATABASE_MIGRATION_FROM.includes(version)) throw new Error('数据库版本不支持自动迁移');
  database.exec('BEGIN IMMEDIATE');
  try {
    database.exec(`
      CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE COLLATE NOCASE, display_name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','member')), disabled INTEGER NOT NULL DEFAULT 0, must_change INTEGER NOT NULL DEFAULT 0, revision INTEGER NOT NULL DEFAULT 1);
      CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES accounts(id), csrf TEXT NOT NULL, expires_at INTEGER NOT NULL, touched_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, icon TEXT NOT NULL, position INTEGER NOT NULL, archived INTEGER NOT NULL DEFAULT 0, module_key TEXT NOT NULL, source_id TEXT NOT NULL, configuration TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1);
      CREATE TABLE IF NOT EXISTS members (project_id TEXT NOT NULL REFERENCES projects(id), user_id TEXT NOT NULL REFERENCES accounts(id), role TEXT NOT NULL CHECK(role IN ('editor','viewer')), PRIMARY KEY(project_id,user_id));
      CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, at INTEGER NOT NULL, result TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), brand_name TEXT NOT NULL, brand_icon TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1);
      INSERT OR IGNORE INTO settings(id,brand_name,brand_icon) VALUES(1,'Preview','layers');`);
    if (
      !database
        .prepare('PRAGMA table_info(projects)')
        .all()
        .some((column) => column.name === 'content_key')
    )
      database.exec("ALTER TABLE projects ADD COLUMN content_key TEXT NOT NULL DEFAULT ''");
    database.exec(`
      CREATE TABLE IF NOT EXISTS context_tokens (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, project_id TEXT NOT NULL REFERENCES projects(id), issuer_id TEXT NOT NULL REFERENCES accounts(id), issuer_revision INTEGER NOT NULL, label TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, revoked_at INTEGER);
      CREATE TABLE IF NOT EXISTS page_grants (project_id TEXT NOT NULL REFERENCES projects(id), client_id TEXT NOT NULL, page_key TEXT NOT NULL, user_id TEXT NOT NULL REFERENCES accounts(id), PRIMARY KEY(project_id,client_id,page_key,user_id));
      PRAGMA user_version=${DATABASE_SCHEMA};`);
    if (
      database.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok' ||
      database.prepare('PRAGMA foreign_key_check').all().length
    )
      throw new Error('数据库完整性检查失败');
    database.exec('COMMIT');
    return { from: version, to: DATABASE_SCHEMA };
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}
