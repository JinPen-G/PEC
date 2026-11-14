// @vitest-environment node
import { afterEach, expect, test } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { loadProjectCatalog } from '../../packages/platform-server/src/project-catalog.js';
import { projectSourcePlugin } from '../../plugins/project-source-plugin.js';
import { TEST_PROJECT } from '../fixtures/project-catalog.js';

const roots = [];
afterEach(async () => {
  for (const root of roots.splice(0)) {
    if (path.dirname(root) !== tmpdir() || !path.basename(root).startsWith('preview-catalog-test-'))
      throw new Error('Unsafe catalog fixture');
    await fs.rm(root, { recursive: true, force: true });
  }
});
async function fixture() {
  const root = await fs.mkdtemp(path.join(tmpdir(), 'preview-catalog-test-'));
  roots.push(root);
  return root;
}
test('a public checkout retains the example while an explicit local catalog preserves its project definitions', async () => {
  const root = await fixture();
  expect((await loadProjectCatalog(root)).projects.map((project) => project.module.projectId)).toEqual([
    'example',
  ]);
  await fs.writeFile(path.join(root, 'registered-projects.local.json'), JSON.stringify([TEST_PROJECT]));
  const local = await loadProjectCatalog(root);
  expect(
    local.moduleCatalog.find((module) => module.key === 'fixture-module').pages[0].sourceFiles,
  ).toContain('packages/component-library/src/fixture/blocks/groups/GroupsBlock.tsx');
  expect(local.componentRegistry).toHaveLength(2);
  expect(
    (await loadProjectCatalog(root, { local: false })).projects.map((project) => project.module.projectId),
  ).toEqual(['example']);
  await fs.writeFile(path.join(root, 'registered-projects.local.json'), 'broken json');
  await expect(loadProjectCatalog(root)).rejects.toThrow();
});
test('linked local catalogs and adapters are rejected before reading or building them', async () => {
  const root = await fixture();
  const real = path.join(root, 'linked-directory');
  await fs.mkdir(real);
  await fs.symlink(real, path.join(root, 'registered-projects.local.json'), 'junction');
  await expect(loadProjectCatalog(root)).rejects.toThrow('普通JSON文件');
  const directory = path.join(root, 'packages/platform-contracts/src');
  await fs.mkdir(directory, { recursive: true });
  await fs.symlink(real, path.join(directory, 'registered-projects.local.json'), 'junction');
  expect(() => projectSourcePlugin(root)).toThrow('普通文件');
});
