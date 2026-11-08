/** Builds a scoped visual baseline from browser-exported assets. Original
 * downloads remain unchanged; only selectors and local font URLs are adapted. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import postcss from 'postcss';

const root = fileURLToPath(new URL('..', import.meta.url));
const target = path.join(root, 'packages/preview-ui/upstream/uiarc-site/browser-capture');
const runtime = path.join(root, 'packages/preview-ui/src/site');
const entries = [];
await fs.mkdir(target, { recursive: true });
await fs.mkdir(path.join(runtime, 'fonts'), { recursive: true });
for (const [index, manifestFile] of process.argv.slice(2).entries()) {
  const manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
  for (const item of manifest.assets) {
    if (!['font', 'stylesheet'].includes(item.kind)) continue;
    const bytes = await fs.readFile(item.path);
    const name = path.basename(item.name);
    const destination = path.join(target, index === 0 ? 'detail' : 'home', name);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, bytes);
    if (item.kind === 'font') await fs.writeFile(path.join(runtime, 'fonts', name), bytes);
    entries.push({
      url: item.url,
      kind: item.kind,
      file: path.relative(target, destination).replaceAll('\\', '/'),
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
  }
}
const families =
  /\.(?:page_|docs_|library-docs_|library-sidebar_|preview-shell_|global-command-menu_|site-nav_|site-footer_|landing_|clip-sections_|how-it-works_|text-reveal_|in-view-title_|copy-button_|pro-badge_|get-pro-link_)/;
function splitSelectors(value) {
  const result = [];
  let depth = 0,
    start = 0;
  for (let index = 0; index < value.length; index++) {
    if ('(['.includes(value[index])) depth++;
    if (')]'.includes(value[index])) depth--;
    if (value[index] === ',' && depth === 0) {
      result.push(value.slice(start, index));
      start = index + 1;
    }
  }
  return [...result, value.slice(start)];
}
const sheet = postcss.root();
const seen = new Set();
for (const entry of entries.filter((item) => item.kind === 'stylesheet')) {
  if (seen.has(entry.sha256)) continue;
  seen.add(entry.sha256);
  const original = postcss.parse(await fs.readFile(path.join(target, entry.file), 'utf8'));
  original.walkRules((rule) => {
    let parent = rule.parent;
    while (parent) {
      if (parent.type === 'atrule' && parent.name.includes('keyframes')) return;
      parent = parent.parent;
    }
    const matched = splitSelectors(rule.selector).filter(
      (selector) => families.test(selector) || /^:root/.test(selector.trim()),
    );
    if (!matched.length) {
      rule.remove();
      return;
    }
    rule.selector = matched
      .map((selector) => {
        const value = selector.trim();
        if (/^:root/.test(value)) return value.replace(/^:root/, '.uiarc-showcase');
        if (/^\[data-(theme|accent)=/.test(value)) return `.uiarc-showcase${value}`;
        return `.uiarc-showcase ${value}`;
      })
      .join(',');
  });
  original.walkAtRules((rule) => {
    if (rule.name === 'font-face') {
      rule.walkDecls('src', (declaration) => {
        declaration.value = declaration.value.replace(
          /url\(([^)]+)\)/g,
          (_match, value) => `url('./fonts/${path.basename(value.replaceAll('"', '').replaceAll("'", ''))}')`,
        );
      });
    } else if (rule.name === 'property' || !rule.nodes?.length) rule.remove();
  });
  sheet.append(original.nodes);
}
const css = `/* Browser-captured UIARC layout. Original files, URLs and SHA-256: upstream/uiarc-site/browser-capture/manifest.json. */\n${sheet.toString()}\n`;
await fs.writeFile(path.join(runtime, 'uiarc-layout-source.css'), css);
await fs.writeFile(
  path.join(target, 'manifest.json'),
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      reference: ['https://uiarc.dev/components/button', 'https://uiarc.dev/'],
      files: entries,
      adaptedStyleSha256: createHash('sha256').update(css).digest('hex'),
    },
    null,
    2,
  ) + '\n',
);
const sourceManifestFile = path.join(root, 'packages/preview-ui/upstream/uiarc-site/source-manifest.json');
const sourceManifest = JSON.parse(await fs.readFile(sourceManifestFile, 'utf8'));
await fs.writeFile(
  sourceManifestFile,
  JSON.stringify(
    {
      ...sourceManifest,
      initialAdaptedStyleSha256:
        sourceManifest.initialAdaptedStyleSha256 ?? sourceManifest.adaptedStyleSha256,
      layoutBaseline: 'browser-capture/manifest.json',
      adaptedStyleSha256: createHash('sha256').update(css).digest('hex'),
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify({
    captured: entries.length,
    stylesheetFamilies: seen.size,
    fonts: entries.filter((entry) => entry.kind === 'font').length,
  }),
);
