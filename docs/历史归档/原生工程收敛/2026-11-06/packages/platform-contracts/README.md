# Platform Contracts

共用平台的框架无关前端契约。该包不依赖 React、Vite 或浏览器 API。

- `index.js` 提供运行时规范化、错误模型和最小响应校验；
- `index.d.ts` 提供 React/TypeScript 和其他客户端共用的类型；
- 项目包本身的持久化 Schema 继续以 `packages/project-core/schemas` 为准；
- 本包描述平台运行时接口，不重复定义项目包文件格式。

[运行时出口](src/index.js)与[类型声明](src/index.d.ts)必须同时维护；消费者为 [platform-client](../platform-client/README.md)、[Node 服务](../platform-server/README.md)及 React。协议变更核对实际生产者、类型消费者、规范化及错误分支，不把缺失数据静默转换成成功。

契约测试在[platform-contracts.spec.js](../../tests/unit/platform-contracts.spec.js)，导入方向由根 npm run architecture:check 检查。项目持久化 Schema 仍由 [project-core](../project-core/README.md)拥有。
