# Project Core

项目包、HTML 页面定义、文档和 PRD 关联的纯 Node 核心。该目录不依赖 React、Vite 或浏览器 API，供以下入口复用：

- Vite 开发与构建插件；
- 项目包命令行工具；
- 独立 Node 服务、本地只读 MCP 与自动化测试。

`schemas/` 是对外的机器可读契约，`src/` 保留包含跨字段、文件存在性和路径边界检查的运行时校验。JSON Schema 与运行时校验必须同步维护。

核心模块只负责领域规则和文件系统能力，不包含 HTTP 路由、Vite 热更新、React 组件或界面状态。

## 阅读与维护入口

[src/index.js](src/index.js)是公共出口；project-scanner / project-manifest 发现和校验项目，html-prototypes 生成页面目录，documents 装载文档，route-management 维护路由，filesystem / project-mounts 拥有路径边界与原子文件操作。

消费者通过 [Node 服务](../platform-server/README.md)、[Vite 插件](../../plugins)、[CLI](../../scripts/project-cli.mjs)及 [MCP](../platform-mcp/README.md)进入同一规则。修改文件契约时同步 schemas、运行时校验和相关夹具，不在适配层另写一套规则。

上下文纯算法、语言映射与原型语言桥实现归 [project-shared](../project-shared/README.md)；原文件与公开出口保留 re-export 兼容。React 直接使用共享包，不能导入本包的 Node 文件规则。

根 npm run architecture:check 检查导入方向，npm run test:unit 覆盖扫描、路径、文件和消费者；真实项目资料另行核查，详见[测试指南](../../docs/公共技术资料/工程规范/Preview-测试指南.md)。
