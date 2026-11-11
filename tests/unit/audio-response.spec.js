// @vitest-environment node
import { afterEach, beforeEach, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createNativeServer } from '../../packages/platform-server/src/server.js';

let runtime;
let directory;
let base;
const bytes = Buffer.from('ID3-test-recording-byte-range');
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(tmpdir(), 'preview-audio-test-'));
  const staticRoot = path.join(directory, 'web');
  await fs.mkdir(path.join(staticRoot, 'assets'), { recursive: true });
  await fs.mkdir(path.join(staticRoot, 'project-content'), { recursive: true });
  await fs.writeFile(path.join(staticRoot, 'assets', 'song-hash.mp3'), bytes);
  await fs.writeFile(path.join(staticRoot, 'project-content', 'private.mp3'), bytes);
  runtime = createNativeServer({ dataDirectory: path.join(directory, 'data'), staticRoot });
  await new Promise((resolve) => runtime.server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${runtime.server.address().port}`;
});
afterEach(async () => {
  await runtime?.close();
  runtime = undefined;
  if (directory) {
    if (path.dirname(directory) !== tmpdir() || !path.basename(directory).startsWith('preview-audio-test-'))
      throw new Error('Unsafe fixture cleanup');
    await fs.rm(directory, { recursive: true, force: true });
  }
});

it('serves deployment audio with its real MIME type, size and a body-free HEAD response', async () => {
  const response = await fetch(`${base}/assets/song-hash.mp3`);
  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe('audio/mpeg');
  expect(response.headers.get('accept-ranges')).toBe('bytes');
  expect(response.headers.get('content-length')).toBe(String(bytes.length));
  expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes);
  const head = await fetch(`${base}/assets/song-hash.mp3`, {
    method: 'HEAD',
    headers: { Range: 'bytes=4-8' },
  });
  expect(head.status).toBe(200);
  expect(head.headers.get('content-length')).toBe(String(bytes.length));
  expect((await head.arrayBuffer()).byteLength).toBe(0);
});

it.each([
  ['bytes=0-0', 0, 1],
  ['bytes=4-8', 4, 9],
  ['bytes=4-', 4, bytes.length],
  ['bytes=-6', bytes.length - 6, bytes.length],
  ['bytes=4-9999', 4, bytes.length],
])('streams only the requested range %s', async (range, start, end) => {
  const response = await fetch(`${base}/assets/song-hash.mp3`, { headers: { Range: range } });
  expect(response.status).toBe(206);
  expect(response.headers.get('content-range')).toBe(`bytes ${start}-${end - 1}/${bytes.length}`);
  expect(response.headers.get('content-length')).toBe(String(end - start));
  expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes.subarray(start, end));
});

it.each([
  'bytes=9999-',
  'bytes=8-4',
  'bytes=-0',
  'bytes=-',
  'bytes=0-1,4-5',
  'bytes=999999999999999999999-',
  'items=0-4',
])('rejects invalid or unsupported ranges %s without sending audio', async (range) => {
  const response = await fetch(`${base}/assets/song-hash.mp3`, { headers: { Range: range } });
  expect(response.status).toBe(416);
  expect(response.headers.get('content-range')).toBe(`bytes */${bytes.length}`);
  expect((await response.arrayBuffer()).byteLength).toBe(0);
});

it('does not treat an unverified If-Range validator as a matching file revision', async () => {
  const response = await fetch(`${base}/assets/song-hash.mp3`, {
    headers: { Range: 'bytes=4-8', 'If-Range': '"unknown-revision"' },
  });
  expect(response.status).toBe(200);
  expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes);
});

it('keeps private and escaping media paths outside the public asset boundary', async () => {
  for (const route of [
    '/project-content/private.mp3',
    '/assets/%2e%2e%2fproject-content/private.mp3',
    '/assets/missing.mp3',
  ]) {
    const response = await fetch(`${base}${route}`);
    expect(response.status, route).toBe(404);
  }
});
