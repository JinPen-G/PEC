/** Build the public platform with its selected example, independent of local projects. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import process from 'node:process';
import { build } from 'vite';
import { buildRuntime } from './build-runtime.mjs';
import { frameworkBusinessSource } from '../plugins/framework-build-plugin.js';
import frameworkModules from '../templates/framework/builtin-modules.json' with { type: 'json' };
import { loadProjectCatalog } from '../packages/platform-server/src/project-catalog.js';
import { loadContentPackage } from '../packages/project-core/src/platform/project-content.js';

export function frameworkRuntimePlugin(root) {
  return {
    name: 'preview-framework-registry',
    setup(builder) {
      builder.onResolve({ filter: /(?:registered-projects|builtin-modules)\.json$/ }, (args) => {
        const source = path.resolve(args.resolveDir, args.path);
        if (source !== path.resolve(root, 'packages/platform-contracts/src/builtin-modules.json'))
          return undefined;
        return { path: path.join(root, 'templates/framework', path.basename(args.path)) };
      });
      builder.onLoad({ filter: /\.(?:js|mjs|ts|tsx|jsx|json)$/ }, (args) => {
        if (frameworkBusinessSource(args.path))
          throw new Error('Framework API cannot import business sources');
        return undefined;
      });
    },
  };
}
export async function prepareFrameworkOutput(root) {
  const output = path.resolve(root, 'output/framework');
  const outputRoot = path.resolve(root, 'output');
  await fs.mkdir(outputRoot, { recursive: true });
  if ((await fs.realpath(outputRoot)) !== outputRoot) throw new Error('框架输出根目录不能是链接');
  for (const name of ['', 'web', 'runtime', 'tools', 'project-content', 'deploy']) {
    const target = path.join(output, name);
    if (target !== output && !target.startsWith(`${output}${path.sep}`)) throw new Error('框架输出越界');
    const stat = await fs.lstat(target).catch((error) => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (stat && (!stat.isDirectory() || stat.isSymbolicLink())) throw new Error('框架输出目录不可用');
    await fs.mkdir(target, { recursive: true });
  }
  if ((await fs.readdir(path.join(output, 'project-content'))).some((name) => name !== 'example'))
    throw new Error('框架资料目录只能包含示例');
  // Only these generated directories are disposable; never include runtime data or source packages.
  for (const name of ['web', 'runtime', 'tools', 'deploy', 'project-content']) {
    const target = path.resolve(output, name);
    if (!target.startsWith(`${output}${path.sep}`) || (await fs.realpath(target)) !== target)
      throw new Error('框架产物清理越界');
    await fs.rm(target, { recursive: true, force: true });
    await fs.mkdir(target);
    if ((await fs.readdir(target)).length) throw new Error('框架旧产物未清理完成');
  }
  return output;
}
export async function buildFramework(root = fileURLToPath(new URL('..', import.meta.url))) {
  const catalog = await loadProjectCatalog(path.join(root, 'packages/platform-contracts/src'), {
    local: false,
  });
  const moduleCatalog = [...frameworkModules, ...catalog.moduleCatalog.filter((module) => module.projectId)];
  const output = await prepareFrameworkOutput(root);
  await build({ mode: 'framework', build: { outDir: path.join(output, 'web'), emptyOutDir: true } });
  const runtime = await buildRuntime({
    root,
    destination: path.join(output, 'runtime'),
    toolsDestination: path.join(output, 'tools'),
    moduleCatalog,
    plugins: [frameworkRuntimePlugin(root)],
  });
  if (runtime.inputs.some(frameworkBusinessSource)) throw new Error('框架构建含业务来源');
  const pageManifest = JSON.parse(await fs.readFile(path.join(output, 'web/page-manifest.json'), 'utf8'));
  const expectedPages = catalog.projects
    .flatMap(({ module }) => module.pages.map((page) => `${module.key}/${page.key}`))
    .sort();
  if (
    JSON.stringify(pageManifest.entries.map((page) => `${page.moduleKey}/${page.pageKey}`).sort()) !==
    JSON.stringify(expectedPages)
  )
    throw new Error('框架页面与公开示例登记不一致');
  if (
    (await fs.readdir(path.join(output, 'web/assets'))).some((name) => /\.(?:mp3|mp4|wav|ogg)$/i.test(name))
  )
    throw new Error('框架构建不能包含私有媒体文件');
  const content = await loadContentPackage(path.join(root, 'project-content'), 'example', moduleCatalog);
  const contentDestination = path.join(output, 'project-content/example');
  await fs.mkdir(contentDestination, { recursive: true });
  const stat = await fs.lstat(contentDestination);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('示例资料输出目录不可用');
  await fs.writeFile(
    path.join(contentDestination, 'manifest.json'),
    JSON.stringify(content.manifest, null, 2) + '\n',
  );
  for (const [name, bytes] of content.files) {
    const filename = path.join(contentDestination, name);
    await fs.mkdir(path.dirname(filename), { recursive: true });
    await fs.writeFile(filename, bytes);
  }
  await loadContentPackage(path.join(output, 'project-content'), 'example', moduleCatalog);
  await fs.cp(path.join(root, 'deploy/server'), path.join(output, 'deploy/server'), { recursive: true });
  await fs.copyFile(path.join(root, 'templates/framework/README.md'), path.join(output, 'README.md'));
  await fs.writeFile(
    path.join(output, 'framework-manifest.json'),
    JSON.stringify(
      {
        schemaVersion: 1,
        businessPages: 0,
        businessComponents: 0,
        examplePages: expectedPages.length,
        exampleComponents: catalog.componentRegistry.length,
        contentPackages: 1,
        capabilities: [
          'frontend',
          'administration',
          'accounts',
          'project-access',
          'graph',
          'mcp',
          'governance',
          'deployment',
        ],
        publication: 'license-review-required',
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`Framework built with ${expectedPages.length} selected example page: ${output}`);
  return output;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await buildFramework();
