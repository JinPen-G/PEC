/** Build the API and its locked dependencies; no server-side npm install is needed. */
import { build } from 'esbuild';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NATIVE_MODULES } from '../packages/platform-contracts/src/platform.js';
import {
  DATABASE_SCHEMA,
  DATABASE_MIN_SCHEMA,
  DATABASE_MIGRATION_FROM,
} from '../packages/project-core/src/platform/schema.js';
const root = fileURLToPath(new URL('..', import.meta.url));
const destination = path.join(root, 'output/runtime');
await fs.mkdir(destination, { recursive: true });
const result = await build({
  absWorkingDir: root,
  entryPoints: {
    server: 'apps/api/main.mjs',
    admin: 'scripts/initialize-admin.mjs',
    migrate: 'scripts/migrate.mjs',
  },
  outdir: destination,
  outExtension: { '.js': '.mjs' },
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  metafile: true,
  banner: {
    js: 'import { createRequire as previewCreateRequire } from "node:module"; const require = previewCreateRequire(import.meta.url);',
  },
});
const dependencies = new Map();
for (const filename of Object.keys(result.metafile.inputs)) {
  const match = /^(.*node_modules\/(?:@[^/]+\/)?[^/]+)/.exec(filename.replaceAll('\\', '/'));
  if (!match || dependencies.has(match[1])) continue;
  const directory = path.join(root, match[1]);
  const metadata = JSON.parse(await fs.readFile(path.join(directory, 'package.json'), 'utf8'));
  const licenseNames = (await fs.readdir(directory)).filter((name) =>
    /^(license|copying|notice)(\.|$)/i.test(name),
  );
  const licenses = await Promise.all(
    licenseNames.map(async (name) => `${name}\n${await fs.readFile(path.join(directory, name), 'utf8')}`),
  );
  if (!licenses.length) throw new Error(`依赖缺少许可文件：${metadata.name}`);
  dependencies.set(
    match[1],
    `${metadata.name}@${metadata.version} (${metadata.license || 'SEE LICENSE'})\n${licenses.join('\n')}\n`,
  );
}
await fs.writeFile(
  path.join(destination, 'THIRD-PARTY-NOTICES.txt'),
  [...dependencies.values()].sort().join('\n---\n'),
);
await fs.writeFile(path.join(destination, 'registry.json'), JSON.stringify(NATIVE_MODULES, null, 2) + '\n');
await fs.writeFile(
  path.join(destination, 'package.json'),
  JSON.stringify(
    { name: 'preview-runtime', private: true, type: 'module', engines: { node: '>=24.13.0 <25' } },
    null,
    2,
  ) + '\n',
);
await fs.writeFile(
  path.join(destination, 'contract.json'),
  JSON.stringify(
    {
      schemaVersion: 1,
      nodeMajor: 24,
      nodeMinimum: '24.13.0',
      protocol: 1,
      databaseSchema: DATABASE_SCHEMA,
      databaseMinSchema: DATABASE_MIN_SCHEMA,
      migrationFrom: DATABASE_MIGRATION_FROM,
      migrationPolicy: 'additive',
    },
    null,
    2,
  ) + '\n',
);
console.log(`Runtime built: ${destination}`);
await build({
  absWorkingDir: root,
  entryPoints: {
    deploy: 'scripts/deploy.mjs',
    supervisor: 'scripts/supervisor.mjs',
    backup: 'scripts/backup.mjs',
  },
  outdir: path.join(root, 'output/tools'),
  outExtension: { '.js': '.mjs' },
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  define: { 'import.meta.previewBundled': 'true' },
});
