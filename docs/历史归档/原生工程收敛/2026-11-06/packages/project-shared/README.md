# Preview Project Shared

浏览器和 Node 共用的纯转换逻辑，不读取文件、不依赖 React、Vite 或 HTTP。与 project-core 的 Node 文件规则分开，防止前端沿导入链引入文件系统。

[公开出口](src/index.js)提供上下文/追溯算法、繁简映射和原型语言桥脚本文本，消费者是 React、project-core 与间接的 CLI/MCP。语言桥输出字符串在原型浏览器中执行，本包自身不访问宿主 DOM。

原 project-core 的三个文件保留 re-export 兼容入口，没有第二套实现；新前端引用直接指向本包，避免依赖 Node 核心层。

根 npm run architecture:check 禁止此包导入 Node/应用/传输层；原上下文、繁简与原型语言桥测试继续验证兼容出口，治理测试补充新旧出口同一性的断言。整体边界见[代码规范](../../docs/公共技术资料/工程规范/Preview-代码规范.md)。
