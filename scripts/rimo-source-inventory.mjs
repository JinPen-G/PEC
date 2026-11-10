/** Read-only RIMO inventory and byte-preserving local snapshot for native migration. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parse as parseHtml } from 'node-html-parser';

const workspace = fileURLToPath(new URL('..', import.meta.url));
const archiveRoot = path.join(workspace, '.preview-data', 'archives', 'rimo-rental', '2026-11-09');
const sourceArgument = process.argv.indexOf('--source');
const archivedManifest = await fs.readFile(path.join(archiveRoot, 'manifest.json'), 'utf8').catch(error => {
  if (error.code === 'ENOENT') return null;
  throw error;
});
const sourceDirectory = sourceArgument >= 0 ? process.argv[sourceArgument + 1] : archivedManifest ? JSON.parse(archivedManifest).sourceRoot : null;
if (typeof sourceDirectory !== 'string' || !sourceDirectory.trim() || sourceDirectory.startsWith('--'))
  throw new Error('Specify --source for the first snapshot; subsequent verification reads the private archive manifest');
const sourceRoot = path.resolve(sourceDirectory);
const reportRoot = path.join(workspace, 'output', 'rimo-import');
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function inventory(directory, relative = '') {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    const stat = await fs.lstat(absolute);
    if (stat.isSymbolicLink()) throw new Error(`Source link requires review: ${name}`);
    if (entry.isDirectory()) files.push(...await inventory(absolute, name));
    else if (entry.isFile()) {
      const bytes = await fs.readFile(absolute);
      files.push({ path: name, bytes: bytes.length, sha256: digest(bytes) });
    }
  }
  return files.sort((first, second) => first.path.localeCompare(second.path, 'en'));
}

function sourceKind(name) {
  if (/^(output|\.playwright-cli)\//.test(name)) return 'evidence';
  if (/(?:^|\/)(?:归档|存档|原型-[^/]*backup)(?:\/|$)/.test(name)) return 'historical';
  if (name.startsWith('01_业务知识库/') && name.endsWith('.md')) return 'knowledge';
  if (name.startsWith('02_原型和PRD/PRD/')) {
    if (name.includes('/测试与验收/')) return 'acceptance';
    return name.endsWith('.md') ? 'requirement' : 'supporting';
  }
  if (name.startsWith('02_原型和PRD/原型/')) return name.endsWith('.html') ? 'prototype' : 'asset';
  return 'supporting';
}

async function main() {
  const before = await inventory(sourceRoot);
  if (process.argv.includes('--verify')) {
    const expected = JSON.parse(await fs.readFile(path.join(archiveRoot, 'manifest.json'), 'utf8'));
    const unchanged = JSON.stringify(before) === JSON.stringify(expected.files);
    const report = { unchanged, files: before.length, sourceRoot, checkedAt: new Date().toISOString() };
    await fs.mkdir(reportRoot, { recursive: true });
    await fs.writeFile(path.join(reportRoot, 'source-verification.json'), JSON.stringify(report, null, 2));
    if (!unchanged) throw new Error('RIMO source changed since the migration snapshot');
    console.log(JSON.stringify(report));
    return;
  }
  await fs.mkdir(archiveRoot, { recursive: true });
  const existing = await fs.readFile(path.join(archiveRoot, 'manifest.json'), 'utf8').catch(error => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (existing && JSON.stringify(JSON.parse(existing).files) !== JSON.stringify(before))
    throw new Error('Existing archive describes a different source revision');
  for (const file of before) {
    const target = path.resolve(archiveRoot, 'source', file.path);
    if (!target.startsWith(`${path.resolve(archiveRoot, 'source')}${path.sep}`))
      throw new Error('Snapshot path escaped the intended archive');
    const bytes = await fs.readFile(path.join(sourceRoot, file.path));
    if (digest(bytes) !== file.sha256) throw new Error(`Source changed while reading: ${file.path}`);
    await fs.mkdir(path.dirname(target), { recursive: true });
    const copied = await fs.readFile(target).catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    if (copied && digest(copied) !== file.sha256) throw new Error(`Archive conflict: ${file.path}`);
    if (!copied) await fs.writeFile(target, bytes, { flag: 'wx' });
  }
  const gitEnvironment = { ...process.env, GIT_OPTIONAL_LOCKS: '0' };
  const status = execFileSync('git', ['status', '--porcelain=v1', '-z'], { cwd: sourceRoot, env: gitEnvironment });
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot, env: gitEnvironment, encoding: 'utf8' }).trim();
  const manifest = { schemaVersion: 1, sourceRoot, sourceHead: head, capturedAt: new Date().toISOString(), files: before };
  if (!existing) {
    await fs.writeFile(path.join(archiveRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
    await fs.writeFile(path.join(archiveRoot, 'git-status.bin'), status);
  }
  const pages = [];
  const documents = [];
  for (const file of before) {
    const kind = sourceKind(file.path);
    if (kind === 'prototype') {
      const source = await fs.readFile(path.join(sourceRoot, file.path), 'utf8');
      const html = parseHtml(source, { comment: true });
      const identitySource = html.querySelector('#prototype-page-manifest')?.textContent;
      let identity = null;
      if (identitySource) identity = JSON.parse(identitySource);
      const script = source.match(/PAGE_LOGIC_START[^\n]*\n([\s\S]*?)\/\*\s*PAGE_LOGIC_END/)?.[1] ?? '';
      pages.push({
        ...file, kind, identity,
        title: identity?.menuTitle ?? html.querySelector('title')?.textContent ?? path.basename(file.path, '.html'),
        setup: /function pageSetup\s*\(/.test(script),
        options: /(?:const|let)\s+pageOptions\s*=/.test(script),
      });
    } else if (['knowledge', 'requirement', 'acceptance'].includes(kind) && file.path.endsWith('.md')) {
      const markdown = await fs.readFile(path.join(sourceRoot, file.path), 'utf8');
      documents.push({ ...file, kind, title: markdown.match(/^#\s+(.+)$/m)?.[1] ?? path.basename(file.path, '.md') });
    }
  }
  const after = await inventory(sourceRoot);
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Source changed during snapshot');
  const report = { schemaVersion: 1, sourceRoot, sourceHead: head, files: before.map(file => ({ ...file, kind: sourceKind(file.path) })), pages, documents };
  await fs.mkdir(reportRoot, { recursive: true });
  await fs.writeFile(path.join(reportRoot, 'inventory.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ files: before.length, prototypes: pages.length, documents: documents.length, archiveRoot, reportRoot }));
}

await main();
