import { promises as fs } from 'node:fs';
import path from 'node:path';

import { writeJsonAtomic } from '../packages/project-core/src/index.js';

const BODY_LIMIT = 16 * 1024;

function sendJson(res, payload, statusCode = 200) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function isLocalRequest(req) {
  const address = String(req.socket?.remoteAddress || '').replace('::ffff:', '');
  return address === '' || address === '127.0.0.1' || address === '::1' || address === 'localhost';
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) reject(new Error('配置内容过大。'));
      else chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Error('请求内容不是有效的 JSON。'));
      }
    });
    req.on('error', reject);
  });
}

function normalizeSettings(value) {
  return {
    developerMode: Boolean(value?.developerMode),
    remoteManagement: Boolean(value?.remoteManagement),
  };
}

async function readSettings(settingsPath) {
  try {
    const value = JSON.parse(await fs.readFile(settingsPath, 'utf8'));
    return normalizeSettings(value);
  } catch (error) {
    if (error.code === 'ENOENT') return normalizeSettings({});
    throw error;
  }
}

async function writeSettings(settingsPath, settings) {
  await writeJsonAtomic(settingsPath, settings);
}

export function platformSettingsPlugin({ settingsPath }) {
  const target = path.resolve(settingsPath);
  let isBuild = false;

  return {
    name: 'platform-settings',

    configResolved(config) {
      isBuild = config.command === 'build';
    },

    configureServer(server) {
      server.watcher.add(target);
      server.watcher.on('change', async (changedPath) => {
        if (path.resolve(changedPath) !== target) return;
        try {
          server.ws.send({
            type: 'custom',
            event: 'platform-settings:changed',
            data: await readSettings(target),
          });
        } catch {
          // 下一次请求会重新读取配置文件。
        }
      });

      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url || '/', 'http://localhost');
        if (requestUrl.pathname !== '/__platform/settings') {
          next();
          return;
        }

        if (req.method === 'GET') {
          try {
            sendJson(res, await readSettings(target));
          } catch (error) {
            sendJson(res, { message: '平台配置读取失败。', detail: error.message }, 500);
          }
          return;
        }

        if (req.method !== 'POST') {
          res.setHeader('Allow', 'GET, POST');
          sendJson(res, { message: '平台配置接口只支持 GET 和 POST。' }, 405);
          return;
        }

        if (!isLocalRequest(req)) {
          sendJson(res, { message: '平台配置只允许在服务主机上修改。' }, 403);
          return;
        }

        try {
          const settings = normalizeSettings(await readJsonBody(req));
          await writeSettings(target, settings);
          sendJson(res, { ok: true, settings, message: '平台配置已保存。' });
        } catch (error) {
          sendJson(res, { ok: false, message: error.message }, 400);
        }
      });
    },

    async buildStart() {
      if (!isBuild) return;
      this.emitFile({
        type: 'asset',
        fileName: 'platform-settings.json',
        source: `${JSON.stringify(await readSettings(target), null, 2)}\n`,
      });
    },
  };
}
