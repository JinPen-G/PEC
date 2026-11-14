// @vitest-environment node
import { afterEach, expect, test, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import {
  createProjectContent,
  loadContentPackage,
  loadPrototypeRevisions,
} from '../../packages/project-core/src/platform/project-content.js';

const directories = [];
afterEach(async () => {
  vi.restoreAllMocks();
  for (const directory of directories.splice(0)) {
    if (
      path.dirname(directory) !== tmpdir() ||
      !path.basename(directory).startsWith('preview-content-loading-')
    ) {
      throw new Error('Unsafe fixture path');
    }
    await fs.rm(directory, { recursive: true, force: true });
  }
});

async function fixture() {
  const root = await fs.mkdtemp(path.join(tmpdir(), 'preview-content-loading-'));
  directories.push(root);
  const contentRoot = path.join(root, 'content');
  const packageRoot = path.join(contentRoot, 'catalog-content');
  const sourceRoot = path.join(root, 'source');
  const pageRoot = path.join(sourceRoot, 'apps/web/src/project-modules/catalog/items');
  await fs.mkdir(path.join(packageRoot, 'requirements'), { recursive: true });
  await fs.mkdir(pageRoot, { recursive: true });
  const manifest = {
    schemaVersion: 1,
    contentKey: 'catalog-content',
    moduleKey: 'catalog-module',
    title: 'Catalog',
    overview: 'overview.md',
    requirements: [
      {
        id: 'item-rule',
        title: 'Items',
        category: 'Catalog',
        status: 'confirmed',
        path: 'requirements/items.md',
        pages: [{ clientId: 'main', pageKey: 'items' }],
      },
    ],
    assets: [],
  };
  await fs.writeFile(path.join(packageRoot, 'manifest.json'), JSON.stringify(manifest));
  await fs.writeFile(path.join(packageRoot, 'overview.md'), '# Catalog\nPublished overview.');
  await fs.writeFile(path.join(packageRoot, 'requirements/items.md'), '# Items\nItem names are required.');
  await fs.writeFile(path.join(pageRoot, 'Items.tsx'), 'export default function Items() { return null; }');
  const moduleCatalog = [
    { key: 'catalog-module', projectId: 'catalog', pages: [{ key: 'items', source: 'Items.tsx' }] },
  ];
  const project = {
    id: 'catalog-project',
    moduleKey: 'catalog-module',
    contentKey: 'catalog-content',
    clients: [{ id: 'main', pages: [{ key: 'items' }] }],
  };
  return {
    root,
    packageRoot,
    contentRoot,
    sourceRoot,
    moduleCatalog,
    project,
    content: createProjectContent({ contentRoot, moduleCatalog, pageSourceRoot: sourceRoot }),
  };
}

test('document-only snapshots avoid prototype reads and retain content byte revisions', async () => {
  const item = await fixture();
  const reader = vi.spyOn(fs, 'readFile');
  const snapshot = await item.content.snapshot(item.project, undefined, { includePrototypes: false });
  expect(reader.mock.calls.every(([file]) => !String(file).startsWith(item.sourceRoot))).toBe(true);
  expect(snapshot).not.toHaveProperty('prototypeRevisions');
  expect(snapshot.records.map((record) => record.path)).toEqual([...snapshot.files.keys()]);
  expect(snapshot.revision).toBe(
    (await loadContentPackage(item.contentRoot, item.project.contentKey, item.moduleCatalog)).revision,
  );
  const full = await item.content.snapshot(item.project);
  expect(full.revision).toBe(snapshot.revision);
  expect(full.prototypeRevisions['main/items']).toMatch(/^[a-f0-9]{64}$/);
});

test('document-only snapshots immediately detect edits, stale revisions and module mismatches', async () => {
  const item = await fixture();
  const before = await item.content.snapshot(item.project, undefined, { includePrototypes: false });
  await fs.writeFile(
    path.join(item.packageRoot, 'requirements/items.md'),
    '# Items\nUpdated published rule.',
  );
  const after = await item.content.snapshot(item.project, undefined, { includePrototypes: false });
  expect(after.revision).not.toBe(before.revision);
  expect(after.files.get('requirements/items.md').toString()).toContain('Updated published rule');
  await expect(
    item.content.snapshot(item.project, before.revision, { includePrototypes: false }),
  ).rejects.toMatchObject({ code: 'CONTENT_REVISION_CHANGED' });
  await expect(
    item.content.snapshot({ ...item.project, moduleKey: 'unrelated-module' }, undefined, {
      includePrototypes: false,
    }),
  ).rejects.toThrow('不匹配');
});

test('parallel content reads preserve whitelist and Markdown link validation after a successful read', async () => {
  const item = await fixture();
  await item.content.snapshot(item.project, undefined, { includePrototypes: false });
  await fs.writeFile(path.join(item.packageRoot, 'unpublished.md'), 'Do not publish');
  await expect(item.content.snapshot(item.project, undefined, { includePrototypes: false })).rejects.toThrow(
    '未列入',
  );
  await fs.unlink(path.join(item.packageRoot, 'unpublished.md'));
  await fs.writeFile(path.join(item.packageRoot, 'requirements/items.md'), '[Internal](../../private.md)');
  await expect(item.content.snapshot(item.project, undefined, { includePrototypes: false })).rejects.toThrow(
    '未发布',
  );
});

test('prototype receipts read shared files once per snapshot and observe later edits and missing files', async () => {
  const item = await fixture();
  const source = 'apps/web/src/project-modules/catalog/items/Items.tsx';
  const otherRoot = path.join(item.sourceRoot, 'apps/web/src/project-modules/catalog/other');
  await fs.mkdir(otherRoot, { recursive: true });
  await fs.writeFile(path.join(otherRoot, 'Other.tsx'), 'export default function Other() { return null; }');
  const moduleCatalog = [
    {
      ...item.moduleCatalog[0],
      pages: [
        { key: 'items', source: 'Items.tsx', sourceFiles: [source] },
        { key: 'other', source: 'Other.tsx', sourceFiles: [source] },
      ],
    },
  ];
  const options = { moduleCatalog, moduleKey: 'catalog-module', pageSourceRoot: item.sourceRoot };
  const reader = vi.spyOn(fs, 'readFile');
  const before = await loadPrototypeRevisions(options);
  expect(
    reader.mock.calls.filter(([file]) => String(file) === path.join(item.sourceRoot, source)),
  ).toHaveLength(1);
  expect(Object.keys(before)).toEqual(['items', 'other']);
  await fs.writeFile(
    path.join(item.sourceRoot, source),
    'export default function Items() { return "updated"; }',
  );
  const after = await loadPrototypeRevisions(options);
  expect(after.items).not.toBe(before.items);
  expect(after.other).not.toBe(before.other);
  await fs.unlink(path.join(item.sourceRoot, source));
  expect(await loadPrototypeRevisions(options)).toEqual({});
});

test('built prototype receipts parse one manifest and recheck the next call', async () => {
  const item = await fixture();
  const filename = path.join(item.root, 'page-manifest.json');
  const entry = { moduleKey: 'catalog-module', pageKey: 'items', prototypeRevision: 'a'.repeat(64) };
  const moduleCatalog = [
    {
      ...item.moduleCatalog[0],
      pages: [...item.moduleCatalog[0].pages, { key: 'other', source: 'Other.tsx' }],
    },
  ];
  await fs.writeFile(filename, JSON.stringify({ entries: [entry, { ...entry, pageKey: 'other' }] }));
  const reader = vi.spyOn(fs, 'readFile');
  const options = { moduleCatalog, moduleKey: 'catalog-module', staticRoot: item.root };
  expect(await loadPrototypeRevisions(options)).toEqual({ items: 'a'.repeat(64), other: 'a'.repeat(64) });
  expect(reader.mock.calls.filter(([file]) => String(file) === filename)).toHaveLength(1);
  await fs.writeFile(
    filename,
    JSON.stringify({ entries: [{ ...entry, prototypeRevision: 'b'.repeat(64) }] }),
  );
  expect(await loadPrototypeRevisions(options)).toEqual({ items: 'b'.repeat(64) });
});

test('built source fallbacks cannot follow a source directory outside the published root', async () => {
  const item = await fixture();
  const staticRoot = path.join(item.root, 'web');
  const external = path.join(item.root, 'external-source');
  await fs.mkdir(path.join(staticRoot, 'page-source'), { recursive: true });
  await fs.mkdir(external);
  await fs.writeFile(
    path.join(external, 'Items.tsx'),
    'export default function Items() { return "external"; }',
  );
  await fs.symlink(
    external,
    path.join(staticRoot, 'page-source/items'),
    process.platform === 'win32' ? 'junction' : 'dir',
  );
  await fs.writeFile(
    path.join(staticRoot, 'page-manifest.json'),
    JSON.stringify({
      entries: [{ moduleKey: 'catalog-module', pageKey: 'items', source: 'page-source/items/Items.tsx' }],
    }),
  );
  expect(
    await loadPrototypeRevisions({
      moduleCatalog: item.moduleCatalog,
      moduleKey: 'catalog-module',
      staticRoot,
    }),
  ).toEqual({});
});
