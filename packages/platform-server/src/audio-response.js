import { createReadStream, promises as fs } from 'node:fs';
import { pipeline } from 'node:stream/promises';

/** Streams an already authorized, path-validated deployment asset. This does not resolve paths or publish project files. */
export async function sendAudioAsset(request, response, file) {
  const { size } = await fs.stat(file);
  const headers = { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Content-Length': size };
  const range = request.method === 'GET' && !request.headers['if-range'] ? request.headers.range : undefined;
  let start = 0;
  let end = size - 1;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(String(range).trim());
    const suffix = match?.[1] === '';
    const first = Number(match?.[1]);
    const last = Number(match?.[2]);
    const valid =
      match && (match[1] || match[2]) && Number.isSafeInteger(first) && Number.isSafeInteger(last);
    if (valid) {
      start = suffix ? Math.max(0, size - last) : first;
      end = suffix || !match[2] ? size - 1 : Math.min(last, size - 1);
    }
    if (!valid || !size || start >= size || end < start || (suffix && last === 0)) {
      response.writeHead(416, { ...headers, 'Content-Range': `bytes */${size}`, 'Content-Length': 0 });
      response.end();
      return;
    }
    headers['Content-Length'] = end - start + 1;
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  response.writeHead(range ? 206 : 200, headers);
  if (request.method === 'HEAD' || !size) {
    response.end();
    return;
  }
  await pipeline(createReadStream(file, { start, end }), response);
}
