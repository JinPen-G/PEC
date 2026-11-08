# Preview 架构说明

维护日期：2026-11-05。本文描述当前实现和稳定职责，产品目标与阶段证据见[需求](../../平台建设/Preview-需求.md)、[任务](../../平台建设/Preview-开发任务.md)和[开发记录](../../平台建设/Preview-开发记录.md)。

新原生产品已另立[专项需求](../../原生原型平台/原生原型平台-需求.md)与[实施任务](../../原生原型平台/原生原型平台-开发任务.md)。下面的 HTML/iframe 链路是仍保留的现有代码，不是新产品目标；新平台采用 React 页面、独立账号/项目授权、轻量协同及自动发布，尚未实施。Rental OS 只读，不迁入其仓库或共用运行环境。

## 当前链路

正式原生入口：apps/api → platform-server/native-server → project-core/native-platform（SQLite/权限/文档）；浏览器通过platform-client/native与platform-contracts/native通信。轻量协同使用同源POST意图和SSE快照，所有收发复用真实账号和项目守卫。下面的HTML链路仅属legacy保留实现。

```text
项目包 / 外部 HTML 与文档目录
              │
    packages/project-core
              │
  ┌───────────┼────────────┐
Vite plugins Node 服务   CLI / stdio MCP
  └───────────┬────────────┘
   platform-contracts 协议
              │
      platform-client
              │
  React 平台外壳 + HTML iframe
```

领域核心不依赖 React、Vite、HTTP 或浏览器。传输层调用核心，浏览器经 platform-client 访问接口，不在页面中引入 Node 核心读取文件。

## 入口与规则归属

| 模块           | 入口                                                                                                                                | 拥有内容                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| React          | [main.tsx](../../../apps/web/src/main.tsx)、[PreviewApp](../../../apps/web/src/features/shell/PreviewApp.tsx)                       | 新外壳演示、HashRouter、主题、说明样例；旧 AppRoutes 保留源码 |
| Preview UI     | [导读](../../../packages/preview-ui/README.md)、[出口](../../../packages/preview-ui/src/index.ts)                                   | 固定来源外壳、侧栏/菜单、文档停靠与环境适配                   |
| Contracts      | [出口](../../../packages/platform-contracts/src/index.js)、[类型](../../../packages/platform-contracts/src/index.d.ts)              | 响应、错误、规范化、消费者类型                                |
| Client         | [出口](../../../packages/platform-client/src/index.js)                                                                              | 注入 fetch/baseUrl 的请求与静态只读回退                       |
| Project Shared | [出口](../../../packages/project-shared/src/index.js)                                                                               | 浏览器/Node 共用的纯上下文、语言映射与桥接脚本文本            |
| Project Core   | [出口](../../../packages/project-core/src/index.js)                                                                                 | 项目文件、扫描、路由、文档、路径、迁移、原子写入              |
| Node 服务      | [createPlatformServer](../../../packages/platform-server/src/index.js)、[runtime](../../../packages/platform-server/src/runtime.js) | HTTP、内容响应、当前写入边界、启动退出                        |
| Vite           | [配置](../../../vite.config.js)、[插件](../../../plugins)                                                                           | 开发接口、热更新、静态快照与打包                              |
| CLI            | [project-cli](../../../scripts/project-cli.mjs)                                                                                     | 参数、输出和调用领域命令                                      |
| MCP            | [runMcpServer](../../../packages/platform-mcp/src/index.js)                                                                         | stdio 只读工具与响应投影，无网络监听                          |

内部包由根 package.json 管理依赖，尚未启用 npm workspaces；目录存在不证明分包安装、构建或发布机制已经具备。

React 与 project-core 通过 project-shared 共用纯转换；核心旧文件只保留 re-export 路径兼容。文件系统和 HTTP 逻辑仍不进入前端依赖链。

## 数据与文件契约

project.json、page-definitions.js、HTML、文档与资源是现有项目资料。外部挂载保存在忽略的本地配置中，不修改可移植项目包。

project-core/schemas 提供 JSON Schema，src 提供跨字段、文件存在性和路径校验，两者同步维护。platform-contracts 定义运行时接口，不重复项目持久化格式。

托管 HTML 位于 html-pages/{client-id}，外部 HTML 按 prototype 配置扫描，统一生成页面目录。React 管理导航、主题和 PRD 对照，原 HTML 负责业务内容。项目专属数据不进入公共模块。

目录指运行服务所在机器的目录。文件读取复用相对路径、真实路径及目录边界校验，写入复用原子操作和回滚；目录选择与 HTTP 限制属于适配层。

## 构建和运行

- 普通开发读取真实 projects、挂载和设置，提供 Vite 开发接口。
- 正常 build 生成包含项目资源的静态评审快照；Node 服务提供本机/远程写入开关控制的管理接口。静态构建本身没有管理 API。
- core 模式只读取 examples，挂载为空，设置来自固定夹具，不加载 .env 目录，输出 output/core-build，不覆盖 dist；用于底座检查，不是发布包。
- ui 模式只编译新框架演示，不加载 .env 或任何旧项目/设置/管理插件，输出 output/ui-build；npm run dev:ui 用于本地 UI 评审，不是正式账号/API 服务。

详细副作用见[测试指南](Preview-测试指南.md)。正常 build 读取真实项目，不能放入声称隔离资料的检查链路。

## 当前身份边界

默认原生平台已使用真实cookie会话、服务端项目成员和写请求CSRF校验，管理与项目菜单由服务端身份决定。账号停用/重置/角色变化撤销会话，撤权/归档使文档和协同失效。数据库、文档、发行包分开保存。下述未鉴权限制仅属于保留的legacy服务，不能作为新平台正式入口。

项目登录页是演示跳转，没有账号会话。Node 服务默认本机可写，remoteManagement 可扩大远程写入；Vite 开发接口仍以本机检查为主，两者权限语义不完全相同。

旧静态快照中的隐藏菜单页面仍可直达，新演示主入口不登记这些旧路由。本机地址判断、入口隐藏和演示表单不是按项目授权。Rental OS 固定外壳已迁入，演示账号只维持前端会话；真实账号、三角色、数据库、项目文件授权与 Electron 尚未实施。

## 维护和验证

依赖规则见[代码规范](Preview-代码规范.md)，模块导读从[导航](../../文档导航.md)进入。静态分层检查覆盖 import、re-export、字面量动态导入，不覆盖非字面量加载、运行时授权或全部全局 API。

协议改动核对生产者与消费者；文件规则改动同步 Schema、运行时及夹具；入口与生命周期改动检查调用链。阶段证据进入开发记录，不建立逐文件进度副本。
