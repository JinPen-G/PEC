# Platform Client

共用平台的框架无关浏览器数据访问层，由 React 平台消费独立服务或静态快照。

客户端通过构造参数接收 `fetch`、`baseUrl` 和运行环境，不依赖 React 或 Vite。静态部署的只读边界由客户端统一处理，页面来源统一为 HTML 原型、项目文档和项目配置。

[createPlatformClient](src/index.js)调用注入的 fetch 并复用 [platform-contracts](../platform-contracts/README.md)归一化响应；[类型声明](src/index.d.ts)与运行时同步。[React 装配](../../apps/web/src/data/platform-api.ts)注入 baseUrl 与当前运行模式。

不读取 Node 文件系统，不承担服务端授权。响应失败与真实空数据保持区分，静态只读错误不能被页面伪装成写入成功。

验证入口为[契约与客户端测试](../../tests/unit/platform-contracts.spec.js)和根 npm run architecture:check；整体规则见[文档导航](../../docs/文档导航.md)。
