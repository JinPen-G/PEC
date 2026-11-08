/** Extracts the exact assistant logo paths from the fixed observed website
 * script. Original files stay unchanged; hashes document the derived assets. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const upstream = path.join(root, 'packages/preview-ui/upstream/uiarc-site');
const scripts = await fs.readdir(path.join(upstream, 'observed-assets'));
const starts = {
  chatgpt: 'M22.2819 9.8211',
  claude: 'm4.7144 15.9555',
  cursor: 'M11.503.131',
  v0: 'M14.066 6.028',
};
const paths = {},
  records = [];
for (const file of scripts.filter((file) => file.endsWith('.js'))) {
  const bytes = await fs.readFile(path.join(upstream, 'observed-assets', file));
  const source = bytes.toString('utf8');
  for (const [name, start] of Object.entries(starts)) {
    if (paths[name]) continue;
    const index = source.indexOf(`d:"${start}`);
    if (index < 0) continue;
    const value = source.slice(index + 3).split('"')[0];
    if (!/^[\dA-Za-z\s.,+-]+$/.test(value)) throw new Error('Unexpected SVG path');
    paths[name] = value;
    records.push({
      icon: name,
      source: `observed-assets/${file}`,
      sourceSha256: createHash('sha256').update(bytes).digest('hex'),
      pathSha256: createHash('sha256').update(value).digest('hex'),
    });
  }
}
if (Object.keys(paths).length !== 4) throw new Error('Missing original assistant icon paths');
await fs.writeFile(
  path.join(root, 'packages/preview-ui/src/site/assistant-icon-paths.json'),
  JSON.stringify(paths, null, 2) + '\n',
);
await fs.writeFile(
  path.join(upstream, 'assistant-icons-manifest.json'),
  JSON.stringify(
    { reference: 'https://uiarc.dev/components/button', viewBox: '0 0 24 24', size: 15, records },
    null,
    2,
  ) + '\n',
);
console.log('Captured 4 original assistant SVG paths.');
