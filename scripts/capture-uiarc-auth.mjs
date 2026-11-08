/** Retains browser-observed login styles and fixed free components separately.
 * Runtime copies adapt imports only; observed website scripts never execute. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
const root = path.resolve(import.meta.dirname, '..');
const upstream = path.join(root, 'packages/preview-ui/upstream/uiarc-site');
const runtime = path.join(root, 'packages/preview-ui/src/site');
const capture = path.join(upstream, 'auth-capture');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const records = [];
const output = postcss.root();
await fs.mkdir(capture, { recursive: true });
for (const asset of manifest.assets.filter((item) => ['font', 'stylesheet'].includes(item.kind))) {
  const bytes = await fs.readFile(asset.path);
  const name = path.basename(asset.name);
  await fs.writeFile(path.join(capture, name), bytes);
  records.push({ file: name, url: asset.url, kind: asset.kind, sha256: hash(bytes) });
  if (asset.kind !== 'stylesheet') continue;
  const css = postcss.parse(bytes.toString());
  css.walkRules((rule) => {
    if (rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;
    const selected = rule.selectors.filter((selector) =>
      /\.(?:auth-shell_|auth-flow_|auth-showcase_|morph-select_|confirm-morph_|line-chart_|icon-morph_|countdown_|color-picker_|text-scramble_|stopwatch_)/.test(
        selector,
      ),
    );
    if (!selected.length) return rule.remove();
    rule.selectors = selected.map((selector) => `.uiarc-showcase ${selector}`);
  });
  css.walkAtRules((rule) => {
    if (rule.name === 'font-face' || !rule.nodes?.length) rule.remove();
  });
  output.append(css.nodes);
}
const style = `/* UIARC observed login styles. URLs and hashes: auth-capture/manifest.json. */\n${output}\n`;
await fs.writeFile(path.join(runtime, 'uiarc-auth-source.css'), style);
const copied = [];
for (const name of [
  'morph-select',
  'confirm-morph',
  'line-chart',
  'icon-morph',
  'countdown',
  'color-picker',
  'text-morph',
  'animated-counter',
  'button',
  'segmented-control',
]) {
  const sourceDir = path.join(upstream, 'free-source/registry/components', name);
  const targetDir = path.join(runtime, 'auth-registry/components', name);
  await fs.mkdir(targetDir, { recursive: true });
  for (const file of await fs.readdir(sourceDir)) {
    const bytes = await fs.readFile(path.join(sourceDir, file));
    const content = file.endsWith('.tsx')
      ? bytes
          .toString()
          .replaceAll('@/lib/motion-tokens', '../../motion-tokens')
          .replaceAll('@/registry/components/', '../')
      : bytes;
    await fs.writeFile(path.join(targetDir, file), content);
    copied.push({
      source: `free-source/registry/components/${name}/${file}`,
      target: `auth-registry/components/${name}/${file}`,
      sourceSha256: hash(bytes),
      adaptedSha256: hash(content),
    });
  }
}
await fs.mkdir(path.join(runtime, 'auth-registry'), { recursive: true });
await fs.copyFile(
  path.join(upstream, 'free-source/registry/motion-tokens.ts'),
  path.join(runtime, 'auth-registry/motion-tokens.ts'),
);
const observed = [];
const publicAssets = [];
const avatarPath = 'apps/web/public/auth-assets/marcus-johnson.svg';
try {
  publicAssets.push({
    path: avatarPath,
    url: 'https://uiarc.dev/media/people/marcus-johnson.svg',
    sha256: hash(await fs.readFile(path.join(root, avatarPath))),
  });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
for (const file of (await fs.readdir(capture)).filter(
  (file) => file.endsWith('.js') || file.endsWith('.html'),
))
  observed.push({ file, sha256: hash(await fs.readFile(path.join(capture, file))), runtime: false });
await fs.writeFile(
  path.join(capture, 'manifest.json'),
  JSON.stringify(
    {
      reference: 'https://uiarc.dev/sign-in?redirect_url=%2Fcomponents%2Femoji-picker',
      capturedAt: new Date().toISOString(),
      records,
      copied,
      observed,
      publicAssets,
      reconstructedDemos: ['text-scramble', 'stopwatch'],
      freeSourceCommit: '8302b52ed9dc79ae7ca699b158a98dfdf09656f7',
      freeSourceLicense: 'MIT',
      websiteLicense: 'not declared',
      adaptedStyleSha256: hash(style),
    },
    null,
    2,
  ) + '\n',
);
console.log(`Captured ${records.length} login assets and ${copied.length} fixed component files.`);
