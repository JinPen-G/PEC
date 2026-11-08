/** Starts only Preview's native API and web development processes. */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
const root = fileURLToPath(new URL('..', import.meta.url));
const children = [
  spawn(
    process.execPath,
    ['apps/api/main.mjs', '--api-only', '--bootstrap', '--origin', 'http://127.0.0.1:5191'],
    { cwd: root, stdio: 'inherit', windowsHide: true },
  ),
  spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', '--mode', 'development', '--host', '127.0.0.1', '--port', '5191'],
    { cwd: root, stdio: 'inherit', windowsHide: true },
  ),
];
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill());
}
for (const child of children) {
  child.on('error', () => {
    console.error('原生开发进程无法启动');
    process.exitCode = 1;
    stop();
  });
  child.on('exit', (code) => {
    if (!stopping) {
      process.exitCode = code ?? 1;
      stop();
    }
  });
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, stop);
