// @vitest-environment node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const source = new URL('../../packages/preview-ui/upstream/uiarc-rest/', import.meta.url);

it('retains the exact twelve independently reconstructed UIARC implementation files', async () => {
  const manifest = JSON.parse(await readFile(new URL('source-manifest.json', source), 'utf8'));
  expect(manifest.version).toBe('snapshot-v3');
  expect(manifest.files).toHaveLength(12);
  for (const entry of manifest.files) {
    const content = await readFile(new URL(entry.path, source));
    expect(content.byteLength, entry.path).toBe(entry.bytes);
    expect(createHash('sha256').update(content).digest('hex'), entry.path).toBe(entry.sha256);
  }
});

it('adapts only the copied motion preference and preserves original motion exports', () => {
  const importer = fileURLToPath(new URL('media-player/MediaPlayer.tsx', source));
  const plugin = new URL('../../plugins/motion-preference-plugin.js', import.meta.url).href;
  const script = `import { motionPreferenceAdapter } from ${JSON.stringify(plugin)};
const adapter = motionPreferenceAdapter();
const moduleId = adapter.resolveId('../primitives/motion', ${JSON.stringify(importer)});
console.log(JSON.stringify({ moduleId, source: adapter.load(moduleId), unrelated: adapter.resolveId('../primitives/motion', 'unrelated/components/Player.tsx') ?? null }));`;
  const result = JSON.parse(
    execFileSync(process.execPath, ['--input-type=module', '--eval', script], { encoding: 'utf8' }),
  );
  expect(result.moduleId).toBe('\0preview-rest-motion-preference');
  expect(result.source).toContain('motionTokens, springFromDuration, useHydrated');
  expect(result.source).toContain('usePrefersReducedMotion as useReducedMotion');
  expect(result.unrelated).toBeNull();
});
