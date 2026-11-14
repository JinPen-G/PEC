# Preview

Preview 是面向页面展示、源码复用与 AI 协作的平台框架。它提供前台、管理后台、账号与权限、需求图谱、MCP 和部署工具。仓库附带一个名为“示例”的车组管理页面，用于演示页面接入、源码阅读与 Registry 安装。使用者可继续接入自己的业务内容。

平台不依赖某个业务项目才能运行。没有业务内容时，账号管理、平台文档、通用工程治理与 MCP 仍可使用，内容目录和图谱显示对应空状态。

## 平台能力

- **展示与文档**：页面、组件、区块按类型、功能分类和具体条目组织；支持交互预览、源码阅读、主题、动效和平台使用指南。
- **账号与权限**：管理项目、菜单、公开范围和用户授权，服务端校验目录、页面、源码、资料与资源访问。
- **源码分发**：Registry 和 MCP 提供明确登记的源码、样式、辅助模块及依赖，可按项接入其他 React 工程。
- **需求与图谱**：接入可选的 Markdown 需求资料，按原文出处维护关系、页面覆盖与变更影响；没有资料时不生成示例业务结论。
- **AI 与工程治理**：提供可独立采用的需求确认、任务拆分、协作、验证、交接和清理规范，不要求使用平台里的需求。
- **运行与部署**：Node.js、SQLite、完整前后端构建、发行校验、备份恢复，以及 systemd / Nginx 部署模板。

## 框架与业务边界

| 位置                                                   | 职责                                       |
| ------------------------------------------------------ | ------------------------------------------ |
| `apps/web`、`apps/api`                                 | 平台界面与服务入口                         |
| `packages/preview-ui`                                  | 公共外壳、控件、主题与动效                 |
| `packages/platform-contracts`                          | 运行协议、类型与接入声明                   |
| `packages/platform-client`、`packages/platform-server` | 浏览器请求、HTTP 与 MCP 适配               |
| `packages/project-core`                                | 身份、授权、项目、资料、图谱及源码读取规则 |
| `packages/project-shared`                              | 公共纯逻辑、平台文档和通用工程治理         |
| `templates/framework`、`deploy/server`                 | 基础配置与部署模板                         |
| `apps/web/src/project-modules`                         | 可选的业务页面入口                         |
| `packages/component-library/src`                       | 可选的业务组件与区块源码                   |
| `project-content`                                      | 可选的业务需求、图谱与项目资料             |

框架构建只使用公开登记的“示例”，包含一个模拟页面、一个安装区块及其公开指南。使用者通过独立清单接入自己的内容，公共平台代码无需跟随业务字段修改。账号数据库、凭证、部署配置与媒体资源由运行环境单独维护。

## 构建与运行

环境要求：Node.js 24.13.0 或更新的 24.x 版本，npm 使用仓库锁文件安装依赖。

```powershell
npm ci
npm run build:framework
```

构建输出到 `output/framework`，包含 `web`、`runtime`、`tools`、示例的 `project-content` 和部署模板。此构建使用完整平台入口，包含真实账号和权限能力。

```powershell
cd output/framework
$env:PREVIEW_STATIC_ROOT = (Resolve-Path ./web).Path
$env:PREVIEW_CONTENT_ROOT = (Resolve-Path ./project-content).Path
node ./runtime/server.mjs --host 127.0.0.1 --port 5190 --origin http://127.0.0.1:5190 --data ../preview-data --bootstrap
```

访问 `http://127.0.0.1:5190`，首次自行创建管理员，同时建立“示例”项目。`--bootstrap` 只用于首次初始化，后续启动可移除。SQLite 数据目录放在发行目录外，升级时保留账号、权限和凭证。服务器 CLI 首次初始化时可用 `--with-projects` 建立已登记项目。

## 接入自己的内容

1. 在可选业务目录编写 React 页面、组件或区块，登记全部源码、样式与依赖。
2. 用项目清单声明页面身份、类型、功能分类和安装项；完整页面使用 `kind: page`，基础组件使用 `component`，组合区块使用 `block`。
3. 按需接入业务需求和图谱；没有需求时不配置资料包，不影响框架运行。
4. 构建包含这些内容的应用，在后台设置菜单上下架与访问范围。

接入清单、命令和源码约束见[项目接入模板](templates/project/README.md)。新增业务内容后使用 `npm run build:web` 和 `npm run build:runtime` 构建应用。`build:framework` 始终使用公开登记的“示例”。

## MCP 与工程治理

MCP 使用 Streamable HTTP，入口为 `/api/project-context/mcp`。在后台创建项目并签发读取凭证后，将地址与 `Authorization: Bearer <token>` 配置到 Agent 客户端。空项目也可签发治理凭证。

| 权限              | 可读取内容                               |
| ----------------- | ---------------------------------------- |
| `governance:read` | 通用工程治理规范，以及明确发布的补充规则 |
| `components:read` | 已上架组件、区块和页面的源码与依赖       |
| `business:read`   | 可选的业务需求、图谱与项目范围资料       |

连接后先调用 `get_project_context`。治理规范使用 `list_governance_rules` 和 `read_governance_rule` 读取；`read_project_updates` 的 `source: platform` 提供平台更新，`source: project` 提供可选项目更新。源码通过 `list_components`、`get_component` 和 `read_component_file` 读取。

Agent 读完规范后说明方法、询问是否采用，并按实际证据自查。已有选择直接沿用，本地需求文档按需要建立。MCP 提供引导和资料，不代替使用者确认需求或授予工程写入、提交、部署权限。

## 验证与部署

```powershell
npm run docs:check
npm run architecture:check
npm run typecheck
npm run test:unit
npm run build:framework
```

按变更范围选择相应测试。`build:core` 和 `build:ui` 用于隔离界面检查，完整平台验证使用 `build:framework`。

正式部署由前端、API、接入声明和可选资料构成同一发行，运行数据独立保存。发行、备份、恢复和服务器配置见[部署说明](docs/公共技术资料/部署运维/Preview-更新与缓存.md)。模板和本地构建不代表真实服务器已经部署。

## 来源与开源发布

框架自有实现与第三方 UI 的来源、许可分别维护，完整声明见[UI 来源与许可](packages/preview-ui/NOTICE.md)。当前部分侧栏实现包含 Commons Clause 限制，部分网页观察样式及重建部件仍需核定开源分发许可；这些内容需要取得许可或替换后，才能完成框架的开源发行，不能整体改标 MIT。

框架开发规则见[工程治理规范](docs/公共技术资料/工程规范/Preview-工程治理规范.md)，架构与维护入口见[文档导航](docs/文档导航.md)。

## 本地文件管理

Git 跟踪平台源码、示例页面及其区块、构建与检查工具、脱敏测试、公开文档和必要第三方许可。本地业务内容、PRD、内部四册、品牌原稿、数据库、媒体和构建缓存按用途保存在忽略目录。

默认项目登记包含“示例”。本地可维护 `packages/platform-contracts/src/registered-projects.local.json`、`builtin-modules.local.json`，以及页面和媒体的 `*.local.tsx`、`*.local.ts` 适配。开发和应用构建会校验并读取本地登记，`build:framework` 使用公开默认登记。

待清理的一次性文件统一记录在`output/.cleanup-pending`，删除或移动前核对实际路径、归属、占用和链接。来源原文与唯一备份按用途保留。
