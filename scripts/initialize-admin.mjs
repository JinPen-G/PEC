/** First-admin server initialization; password never enters arguments or output. */
import { createNativeStore } from '../packages/project-core/src/platform/store.js';
import { NATIVE_MODULES } from '../packages/platform-contracts/src/platform.js';
import path from 'node:path';
import process from 'node:process';
const args = process.argv.slice(2);
const value = (name) => args[args.indexOf(name) + 1];
if (!args.includes('--data') || !args.includes('--username') || !args.includes('--name'))
  throw new Error(
    'Required: --data <private-dir> --username <account> --name <display-name>; set PREVIEW_ADMIN_PASSWORD temporarily',
  );
const password = process.env.PREVIEW_ADMIN_PASSWORD;
delete process.env.PREVIEW_ADMIN_PASSWORD;
const store = createNativeStore({
  dataDirectory: path.resolve(value('--data')),
  moduleCatalog: NATIVE_MODULES,
});
try {
  store.bootstrap({ username: value('--username'), displayName: value('--name'), password });
  console.log('平台管理员初始化完成，没有输出明文密码。');
} finally {
  store.close();
}
