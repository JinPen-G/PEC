import './i18n';
import { installBrowserCompatibility } from './browser-compatibility';
import React from 'react';
import ReactDOM from 'react-dom/client';

// The native shell uses its fixed Rental OS styles. Legacy resets and link
// rules stay with the retained legacy pages instead of recoloring this frame.
import '../../../packages/preview-ui/src/styles.css';
import './features/shell/preview-app.css';
import './features/platform/platform.css';

import { App } from './app/App';

// 應用使用 HashRouter，但書籤、刷新或外部連結可能直達真實路徑（如 /tools/project-routes）。
// 靜態服務器會回退到 index.html，此時先把路徑改寫成等價的 hash 路由，再讓應用啟動，
// 否則頁面會停留在家頁且地址欄不變。入口路徑（/ 與 /index.html）無需處理。
function redirectPathToHashRoute() {
  const { pathname, search, hash } = window.location;
  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const rest = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname.replace(/^\/+/, '');
  const route = rest.replaceAll(/^\/+|\/+$/g, '');
  if (!route || route === 'index.html') return;
  window.location.replace(`${basePath}index.html#/${route}${search}${hash}`);
}

installBrowserCompatibility();
redirectPathToHashRoute();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
