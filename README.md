# Preview

前台 Docs 已提供需求关系图谱：主题范围、节点依据、原型覆盖与变更影响；MCP 读取同一业务合同。本地 AI 的强制维护流程及分页约定见 [业务图谱](packages/project-core/README.md#业务图谱)。内部开发记录不对外发布。

Preview 是多项目原生页面与业务需求展示平台。前台采用 UIARC 式布局：功能分组、页面预览、源码和需求说明；后台复用 Rental OS 固定来源外壳与实际公共组件，管理项目基础信息、菜单与用户授权。

页面像组件库里的组件一样直接使用 React 编写，业务需求在本地整理后随 Git 发布。网页只读展示业务内容。平台研发四册、个人开发记录和 AI 接续只保留在源码文档中，不对外发布。

## 项目与权限

- 项目：编码、名称、说明、图标、排序及归档状态。
- 菜单管理：选择工程中已登记的页面、名称、功能分组、顺序、上下架及访问范围。
- 用户授权：选择用户并勾选允许查看的受限菜单；保存后自动建立项目访问关系，不要求先配置成员角色。
- 公开菜单匿名可看；受限菜单须登录并经管理员授权。未授权菜单不进入普通用户的目录、搜索和项目切换列表；预览、源码、PRD 与资源由服务端继续校验。
- 新项目没有页面时显示空状态；源码新增页面不自动公开，管理员在菜单管理中添加后才展示。

项目详情为 `/projects/{id}/settings`，页内 Tab 为基础信息、菜单管理（`?tab=menus`）、用户授权（`?tab=access`）。侧栏始终选中项目管理，切换 Tab 保留已访问面板的未保存草稿。旧菜单/授权地址重定向到相应 Tab。

组件中心为 `/center/{projectId}?kind=requirements|components&category=...`。左侧一级菜单为需求管理、组件管理，二级菜单共用该项目前台的功能分类；右侧列出当前分类下的功能页面名或组件名。页面/组件身份由工程登记决定，菜单控制上下架与授权，业务需求仍只读。未登记组件时显示空状态。

Docs需求图谱已接入原生画布、需求出处和项目授权MCP。主题轮廓随可见节点分布变化；对外关系只能有明确PRD原文依据。当前演示取实际RIMO车辆控制台PRD，8个节点、7条关系；其他业务资料仍待整理。日常需求、PRD与原型开发必须同步维护，维护缺口提示不阻止部署，完整范围见[图谱需求第25节](docs/原生原型平台/原生原型平台-需求.md)。

前台页面为 `/pages/{projectId}/{clientId}/{pageKey}`。应用使用 HashRouter，可直接访问 `/#/projects/...` 和 `/#/center/...`。

**HTML 导入、目录挂载、iframe 业务页、旧本机写入服务及旧静态导出流程已退役。** 原始 HTML、真实项目资料、上游快照不改。不要再使用旧项目包工具来创建新页面。

## 工程入口

| 位置                                                                 | 职责                                   |
| -------------------------------------------------------------------- | -------------------------------------- |
| [apps/web](apps/web/README.md)                                       | React 前台、后台与独立项目页面         |
| [apps/api](apps/api/README.md)                                       | Node 服务装配                          |
| [packages/preview-ui](packages/preview-ui/README.md)                 | 公共 UI、主题、动效及来源              |
| [packages/project-core](packages/project-core/README.md)             | SQLite 身份、项目、菜单权限及受控资料  |
| [packages/platform-contracts](packages/platform-contracts/README.md) | 注册声明、HTTP 错误与类型              |
| [packages/platform-client](packages/platform-client/README.md)       | 带会话和 CSRF 的请求                   |
| [packages/platform-server](packages/platform-server/README.md)       | HTTP、页面资源及只读 MCP               |
| project-content                                                      | 明确允许发布的业务需求；不混入研发四册 |
| [templates/project](templates/project/README.md)                     | 页面与需求接入规范                     |
| resources                                                            | 品牌原稿与独立官网资料                 |
| deploy/server                                                        | 服务器安装、代理与服务配置             |

源码目录使用英文 kebab-case，React 组件文件使用 PascalCase；真实原稿、第三方资源和历史快照保持原名。工程规则见 [AGENTS](AGENTS.md) 与[文档导航](docs/文档导航.md)。

## 开发与验证

Node.js 24.13.0 或更新的受支持版本：

```powershell
npm install
npm run dev
```

默认前端 http://127.0.0.1:5191，API 5190。首次自行建立管理员，无默认密码；密码 8–128 字符。SQLite 文件位于被忽略的 `.preview-data`，不需要额外安装数据库服务。

```powershell
npm run typecheck
npm run test:unit
npm run build:web
npm run serve -- --bootstrap
npm run docs:check
npm run architecture:check
```

`quality:core` 包含文档、分层、类型、lint、格式、单测及隔离框架构建。`dev:ui`、`build:ui` 和 `build:core` 只用于框架演示/检查，不提供真实身份。默认 build 使用原生平台，不再存在 legacy 构建模式。`build-web.cmd` 目前只生成需配合正式 API 使用的 web 构建，不能当作免鉴权静态发布包。

GitHub Actions 已接入完整发行：推送 main 后统一构建前端、API、注册声明与业务资料，服务器自动备份、执行兼容迁移、重启并验证候选版本，成功后才开放访问。支持兼容回退和中断恢复；账号、授权及凭证保存在发行目录外。首次服务器初始化、TLS和GitHub配置见[自动部署说明](docs/公共技术资料/部署运维/Preview-更新与缓存.md)。本地隔离部署已验证，真实服务器、域名、密钥及生产流水线仍待环境提供。

当前仍只有两页 RIMO 原生示例。正式业务 PRD 整理、更多业务页面、用户视觉验收与生产验证单独记录。实际阶段证据见[开发记录](docs/原生原型平台/原生原型平台-开发记录.md)，当前待办见[协作接续](docs/原生原型平台/原生原型平台-协作接续.md)，不把框架代码或静态检查等同整个平台业务已完成。

工程入口按职责命名：scripts/dev.mjs、build-runtime.mjs、release.mjs、deploy.mjs；构建产物统一在 output/web、runtime、tools、ui、core。运行数据和备份在被忽略的 .preview-data。`npm run structure:check` 检查自有源码命名及根目录，禁止回填旧模板、历史版本目录或临时文件。原始资料与固定来源资源保留原始文件名。

后台组件统一约束见[控件导读](packages/preview-ui/src/admin-controls/README.md)。整页/区块使用原像素加载，表格读取使用原骨架；不再在页面里重写这些组件。
