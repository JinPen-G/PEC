# Preview

Preview 是用于产品评审与原型演示的工程，提供项目入口、HTML 页面承载、菜单、文档和 PRD 关联，基于 React、Ant Design、Vite 与独立 Node 服务。

已确认的演进目标见[原生原型平台需求](docs/原生原型平台/原生原型平台-需求.md)：独立真实账号与项目权限、React 项目包、同系列前端底座、一个模拟订单示例、轻量鼠标/页面/弹窗协同及 Git 自动发布。旧项目 HTML 保留不动，其他未实现内容区留空；Rental OS 始终只读。**当前代码尚未实现这些新能力，也没有 Electron 应用。** 原型中的业务不连接真实业务后端。

先读[共用开发规则](AGENTS.md)和[文档导航](docs/文档导航.md)。新产品准备从[原生平台任务](docs/原生原型平台/原生原型平台-开发任务.md)进入；既有治理证据保留在[平台建设四册](docs/平台建设/Preview-开发记录.md)，不以 README 代替进度表。

## 工程组成

| 位置                        | 职责与入口                                                                        |
| --------------------------- | --------------------------------------------------------------------------------- |
| apps/platform-react         | 唯一平台应用；[React 导读](apps/platform-react/README.md)                         |
| packages/project-core       | 项目包、HTML、文档、路径和路由规则；[核心导读](packages/project-core/README.md)   |
| packages/project-shared     | 浏览器/Node 共用纯转换；[共享模块导读](packages/project-shared/README.md)         |
| packages/platform-contracts | 运行时协议、错误、归一化与类型；[契约导读](packages/platform-contracts/README.md) |
| packages/platform-client    | 框架无关请求与静态只读边界；[客户端导读](packages/platform-client/README.md)      |
| packages/platform-server    | 独立 Node HTTP 服务；[服务导读](packages/platform-server/README.md)               |
| packages/platform-mcp       | 本地 stdio 只读上下文；[MCP 导读](packages/platform-mcp/README.md)                |
| plugins / scripts           | Vite 适配、CLI、构建和工程检查                                                    |
| examples / templates        | 可提交的脱敏样例与 HTML/项目模板                                                  |
| projects                    | 不提交的真实项目包，可用本地配置挂载外部目录                                      |
| docs                        | 正式四册、公共技术资料和原文归档；[导航](docs/文档导航.md)                        |
| output / dist               | 检查输出与正常构建产物，不作为源码维护                                            |

维护边界见[架构说明](docs/公共技术资料/工程规范/Preview-架构说明.md)与[代码规范](docs/公共技术资料/工程规范/Preview-代码规范.md)。精确依赖查 [package.json](package.json)与锁文件；内部包目前仍由根目录安装和运行，不是 npm workspaces 工程。

## 当前能力

- 项目 Manifest、客户端入口、托管 HTML 和外部 HTML 目录扫描。
- 公共侧栏、顶栏、主题、语言、响应式布局和 HTML 内容区承载。
- Markdown 文档、目录搜索、Mermaid、相对图片和文档链接。
- 页面/组件 PRD 关联、路由菜单、健康检查、Schema 迁移和只读 AI 上下文。
- 静态评审构建与 Node 服务；服务默认限制远程写入，remoteManagement 可扩大写入范围，尚无账号权限。

管理入口隐藏和演示登录不提供身份验证。隐藏的菜单页面仍可通过 URL 访问，不能用它实现项目授权。Rental OS 框架与 UI 的复用尚未开始。

## 本地运行

使用 Node.js 20 或更新的受支持版本，在根目录执行：

```powershell
npm install
npm run dev
```

默认地址为 `http://127.0.0.1:5188`。Windows [启动脚本](启动React开发环境.cmd)会检查依赖，并打开本机 5188 与局域网 8080 两个开发服务；它会启动进程，不能作为只读检查运行。

需要样例时运行 `npm run project:example`，会写入被忽略的 `projects/sample-project`，目标存在时拒绝覆盖。

## 项目与原型

项目至少包含 project.json、page-definitions.js 和 HTML 页面，详见[项目包指南](docs/公共技术资料/项目资料/项目包-使用指南.md)。资料可保存在 `projects/{project-id}`，或由 `project-mounts.local.json` 配置外部项目、文档和 HTML 目录。

目录属于运行服务的机器。本地读取本地目录，服务器部署后读取服务器目录；目前没有浏览器读取任意远程用户磁盘的能力。

```powershell
npm run project -- help
npm run project -- init --id sample-project --name "示例项目"
npm run project -- preflight --file D:\prototypes\page.html
npm run audit:projects
npm run project:health
```

init 写入新项目；preflight、validate、health 读取指定文件或本地项目与挂载资料。新 HTML 从[模板](templates/html-prototype-page.html)开始，规则见[创建提示词](docs/公共技术资料/项目资料/HTML原型-创建提示词.md)。项目业务页面不因平台治理转换为 React。

## 验证命令

```powershell
npm run docs:check          # 现行文档、本地链接、npm 命令、四册
npm run architecture:check  # 平台源码的层间导入方向
npm run test:governance     # 治理检查器的反例测试
npm run quality:core       # 文档、分层、类型、lint、格式、单测、样例和隔离构建
```

quality:core 不读取真实项目清单、主机挂载或设置；构建只使用 examples 和固定设置，输出 `output/core-build`，不会覆盖 dist。单测会创建/清理临时夹具，部分服务测试监听回环地址，不是完全无副作用。

`npm run quality` 与 quality:core 相同。真实项目单独执行 `npm run audit:projects`、`npm run project:health` 等检查。`npm run quality:check` 保留真实项目 lint/校验和正常 build，不能作为隔离底座检查。

`npm run format:core` 写入自有代码、模板、脱敏样例和现行文档；功能修改优先只格式化改动文件。历史快照、真实 projects、vendor 和临时生成目录不参与。

完整覆盖、副作用和浏览器边界见[测试指南](docs/公共技术资料/工程规范/Preview-测试指南.md)。类型、单测和构建不能替代浏览器、用户视觉验收、真实外部集成或生产发布。

## 构建与运行服务

```powershell
npm run build
npm run serve:local -- --host 127.0.0.1 --port 5188
```

正常 build 读取真实 projects、本地挂载与设置，重建 dist，执行前核对打包范围。Node 服务默认本机可写、远程只读；开启 remoteManagement 后远程也可管理，但未提供账号和项目隔离。

| 形态         | 入口               | 当前边界                                         |
| ------------ | ------------------ | ------------------------------------------------ |
| 静态评审包   | 打包生产包.cmd     | dist 只读快照，包含打包项目资源，无服务端管理    |
| Node 服务包  | 打包服务包.cmd     | 构建、服务代码与项目文件；按本机/远程开关限制    |
| 隔离检查产物 | npm run build:core | 只有脱敏样例，输出 output/core-build，不是发布包 |

更新顺序见[更新与缓存](docs/公共技术资料/部署运维/Preview-更新与缓存.md)。远程账号产品化仍需完成[需求中的边界](docs/平台建设/Preview-需求.md)。

## 主要路由

- `/`：项目入口；`/p/{project-id}/{client-id}/{page-path}`：HTML 原型。
- `/p/{project-id}/docs`：文档；`/p/{project-id}/mobile`：移动端静态演示。
- `/tools/projects`、`/tools/project-routes`、`/tools/project-health`：项目、菜单和健康管理。
- `/tools/console`、`/tools/ai-context`、`/components`：控制台、AI 上下文和组件展示。

应用使用 HashRouter，静态部署入口应为 `index.html#/...`。已有真实路径入口会在启动时转换为对应 hash 路由。

## AI 上下文中心

`npm run mcp:serve` 启动本地 stdio MCP，读取本地项目与挂载，不监听网络端口。工具与读取边界见 [MCP 导读](packages/platform-mcp/README.md)；它不是远程账号服务或项目授权网关。

## 贡献与发布

参阅[贡献指南](docs/公共技术资料/工程规范/Preview-贡献指南.md)、[安全指南](docs/公共技术资料/工程规范/Preview-安全指南.md)和[发布清单](docs/公共技术资料/工程规范/Preview-发布清单.md)。用户可见变化见 [CHANGELOG](CHANGELOG.md)，开发证据归专项记录。
