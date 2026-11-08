# Preview

Preview 是用于原生原型开发、产品评审与项目业务需求阅读的平台，基于 React、Ant Design、Vite 与独立 Node 服务。正式入口提供真实账号、项目授权、原生页面、菜单和文档；旧 HTML 承载工具保留为独立 legacy 入口。

已确认的范围见[原生原型平台需求](docs/原生原型平台/原生原型平台-需求.md)。**当前已有真实账号、项目与成员、基础客户端/菜单配置、合成订单示例、文档与轻量协同代码，但后台管理与权限尚未完成本轮收口。** 固定来源外壳、外观音效、发行校验、版本提示、备份恢复与 GitHub 发布流程在 Preview 内维护；真实服务器部署等待负责人提供环境。旧项目 HTML 保留不动；Rental OS 始终只读。

先读[共用开发规则](AGENTS.md)和[文档导航](docs/文档导航.md)。新产品准备从[原生平台任务](docs/原生原型平台/原生原型平台-开发任务.md)进入；既有治理证据保留在[平台建设四册](docs/平台建设/Preview-开发记录.md)，不以 README 代替进度表。

本轮评审发现页面路由管理入口不足、菜单排序/PRD关联不一致及两项页面权限问题，详见[需求复核](docs/原生原型平台/原生原型平台-需求.md#19-需求复核与后台管理闭环2026-11-06)和[后台收口任务](docs/原生原型平台/原生原型平台-开发任务.md#15-需求与后台管理复核后的实施顺序)。基础配置入口为“项目管理 → 配置 → 客户端与菜单/页面文档关联”，不能将其描述为完整页面路由管理。

平台采用同一应用和统一登录：管理员管理账号/项目/成员/平台品牌，普通用户只见获授权项目，编辑者可维护本项目资料、客户端/菜单及文档关联。真实身份来自服务端会话，写请求校验来源及CSRF，退出/停用/重置撤销会话。`ui` 模式保留独立演示登录，不是正式登录失败的兜底。旧工具页保留源码，不接入新菜单。

“本页文档”复用 Copilot 式侧窗，文档中心提供当前项目目录、标题大纲、正文定位、相对图片/互链和Mermaid。目录、正文与图片均受项目授权，资料由服务机器的显式文档源提供；个人中心不放文档入口。

当前前台采用UIARC网站获取的原CSS、字体及公开组件作本地适配，提供直接功能分组、公开/授权页面、预览/源码切换、关联业务PRD、主题色与三种界面语言；Rental OS风格界面保留为管理后台。首批只有两张RIMO原生示例，原HTML/CSS保留不改，其他项目入口以后安排。业务资料、凭证、HTTP/MCP与一致发布已有本地代码推进，综合与服务器验收分别执行；范围见[需求第17/18节](docs/原生原型平台/原生原型平台-需求.md)，任务与现状见[开发任务](docs/原生原型平台/原生原型平台-开发任务.md)。Preview自身四册、个人记录和AI接续仍是内部资料，不进入网站业务内容或远程索引。

## 工程组成

| 位置                        | 职责与入口                                                                        |
| --------------------------- | --------------------------------------------------------------------------------- |
| apps/web                    | 唯一平台应用；[React 导读](apps/web/README.md)                                    |
| apps/api                    | 原生平台运行装配；[API 导读](apps/api/README.md)                                  |
| packages/preview-ui         | 固定来源外壳与 Preview 适配；[UI 来源与使用](packages/preview-ui/README.md)       |
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

以上为保留的旧实现能力，新主入口不加载旧 HTML 或旧工具页。演示登录不提供身份验证；旧 Node/Vite 管理接口仍不是账号权限系统。

## 本地运行

使用 Node.js 24.13.0 或更新的受支持版本，在根目录执行：

```powershell
npm install
npm run dev
```

默认真实平台地址为 `http://127.0.0.1:5191`，API在5190。首次由你在页面建立管理员，没有默认密码；账号编码为2–64位小写字母/数字/连字符，密码为8–128字符。SQLite使用单个本地数据库文件，不需要另装数据库服务。管理员创建项目并授权账号后即可使用；没有授权的账号不会自动加入示例项目。

构建并运行：`npm run build:native` 后运行 `npm run serve:native -- --bootstrap`，访问5190。初始化完成后运行时可去掉 --bootstrap。生产部署、固定HTTPS origin、发行目录、CI密钥和备份恢复见专项任务册，未配置真实服务器。

本轮界面评审使用 `npm run dev:ui`，地址为 `http://127.0.0.1:5188`。该模式不读取真实项目、主机挂载、设置或 .env，不挂载旧 HTML/管理 API；`npm run build:ui` 输出 output/ui-build，不覆盖 dist。输入任意账号和密码即可进入，管理与订单画布按本轮范围留空。

Windows [启动脚本](start-dev.cmd)沿用旧局域网开发方式；新平台使用上面的 dev:native，不借旧接口的本机写入开关授权。脚本会启动进程，不能作为只读检查运行。

需要样例时运行 `npm run project:example`，会写入被忽略的 `projects/sample-project`，目标存在时拒绝覆盖。

## 旧 HTML 项目与原型（legacy）

项目至少包含 project.json、page-definitions.js 和 HTML 页面，详见[项目包指南](docs/公共技术资料/项目资料/项目包-使用指南.md)。资料可保存在 `projects/{project-id}`，或由 `project-mounts.local.json` 配置外部项目、文档和 HTML 目录。

目录属于运行服务的机器。本地读取本地目录，服务器部署后读取服务器目录；目前没有浏览器读取任意远程用户磁盘的能力。

```powershell
npm run project -- help
npm run project -- init --id sample-project --name "示例项目"
npm run project -- preflight --file D:\prototypes\page.html
npm run audit:projects
npm run project:health
```

init 写入旧格式项目；preflight、validate、health 读取指定文件或本地项目与挂载资料。需要维护旧 HTML 时从[模板](templates/html-prototype-page.html)和[创建提示词](docs/公共技术资料/项目资料/HTML原型-创建提示词.md)进入。这些命令不代表原生项目接入；新项目直接开发React，负责人指定的旧页转换按原生任务NP-28推进，未指定的旧资料保留原样。

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

默认 build 与 build:native 只编译原生应用到 output/native-build，不加载旧项目、挂载、设置或.env。旧 build:legacy 读取真实 projects 与本地配置并重建dist；旧 serve:local 仍未鉴权，不能作为新平台正式服务。

| 形态         | 入口               | 当前边界                                         |
| ------------ | ------------------ | ------------------------------------------------ |
| 静态评审包   | build-static.cmd   | dist 只读快照，包含打包项目资源，无服务端管理    |
| Node 服务包  | build-server.cmd   | 构建、服务代码与项目文件；按本机/远程开关限制    |
| 隔离检查产物 | npm run build:core | 只有脱敏样例，输出 output/core-build，不是发布包 |

更新顺序见[更新与缓存](docs/公共技术资料/部署运维/Preview-更新与缓存.md)。远程账号产品化仍需完成[需求中的边界](docs/平台建设/Preview-需求.md)。

## UI演示路由与正式原生入口

- `/login`：前端演示登录。
- `/manage/projects`、`/manage/accounts`、`/manage/access`：管理导航与空画布。
- `/workspace/orders`：订单示例空画布；`/documents`：平台说明样例。
- `/manage/appearance`：外观设置。未登记路径回到项目管理；未登录时进入登录页。
- 外观与音效包含主题色、容器/按钮/输入框圆角、动效、原版音效方案及九种试听；偏好保存在当前浏览器。顶部模式切换可进入文档中心并返回原管理页面；左上角品牌弹层切换演示项目。

以上演示路由属于ui/core模式。默认原生入口使用 `/manage/projects`、`/manage/accounts`、`/manage/access`、`/manage/settings`；普通成员落地 `/projects`，项目页为 `/p/{projectId}/{clientId}/{pageKey}`，文档为 `/p/{projectId}/documents`，配置为 `/projects/{projectId}/config`。页面菜单与API均校验真实角色和项目授权。

旧路由保留在 AppRoutes 源码中，本轮不接入主入口：

- `/`：项目入口；`/p/{project-id}/{client-id}/{page-path}`：HTML 原型。
- `/p/{project-id}/docs`：文档；`/p/{project-id}/mobile`：移动端静态演示。
- `/tools/projects`、`/tools/project-routes`、`/tools/project-health`：项目、菜单和健康管理。
- `/tools/console`、`/tools/ai-context`、`/components`：控制台、AI 上下文和组件展示。

应用使用 HashRouter，静态部署入口应为 `index.html#/...`。已有真实路径入口会在启动时转换为对应 hash 路由。

## AI 上下文中心

`npm run mcp:serve` 启动本地 stdio MCP，读取本地项目与挂载，不监听网络端口。工具与读取边界见 [MCP 导读](packages/platform-mcp/README.md)；它不是远程账号服务或项目授权网关。

## 贡献与发布

参阅[贡献指南](docs/公共技术资料/工程规范/Preview-贡献指南.md)、[安全指南](docs/公共技术资料/工程规范/Preview-安全指南.md)和[发布清单](docs/公共技术资料/工程规范/Preview-发布清单.md)。用户可见变化见 [CHANGELOG](CHANGELOG.md)，开发证据归专项记录。
