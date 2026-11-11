# Preview

前台 Docs 已提供需求关系图谱：主题范围、节点依据、原型覆盖与变更影响；MCP 读取同一业务合同。本地 AI 的强制维护流程及分页约定见 [业务图谱](packages/project-core/README.md#业务图谱)。内部开发记录不对外发布。

Preview 是多项目原生页面与业务需求展示平台。前台采用 UIARC 式布局：功能分组、页面预览、源码和需求说明；后台复用 Rental OS 固定来源外壳与实际公共组件，管理项目基础信息、菜单与用户授权。

首页只展示当前项目最多6个公开精选，不再把完整菜单铺成预览墙。精选通过项目页面清单的`featuredOrder`维护；隐藏、下架或非公开项不进入首页，其他页面仍在“查看全部产品”、目录、搜索及Demo中。预览接近视口才加载，离开后卸载业务运行时。

页面像组件库里的组件一样直接使用 React 编写，业务需求在本地整理后随 Git 发布。网页只读展示业务内容。平台研发四册、个人开发记录和 AI 接续只保留在源码文档中，不对外发布。

可复用源码维护在 [component-library](packages/component-library/README.md)，基础组件与页面级区块按库分目录，展示入口只引用同一份实现。项目范围 Registry 按需复制源码及安装依赖；受限源码支持授权会话或 `components:read` 项目凭证，凭证通过请求头传递。

已登记公开组件/区块的页面标题下提供真实Registry快捷安装命令，与“页面源码”页签使用同一地址；切换项目后同步更新。复制的是完整命令，受限或未登记内容不提供匿名安装命令。页面链接、需求Markdown与AI接入保留在右侧页面操作中。

新项目使用[接入清单模板](templates/project/README.md)：放入 React 原型与 Markdown PRD，执行 `project:register -- --file <project.json>` 登记，重启开发服务或完整构建后，在后台选择已接入源码创建项目。初始菜单来自清单，已有项目配置不被覆盖；`project:check` 检查源码、PRD、组件依赖及图谱维护状态，正式 web 构建先执行该检查。

后续直接在本仓库开发：展示入口在 `apps/web/src/project-modules/{project-code}`，可复用组件/区块在 `packages/component-library/src/{project-code}`，PRD在 `project-content/{project-code}`。包括RIMO在内的展示项目统一由 `packages/platform-contracts/src/registered-projects.json` 登记，新增功能只改自己的源码与项目数据，具体步骤见[持续开发说明](templates/project/README.md#在当前仓库持续开发)。

后台“项目 → AI 接入”提供资料检查、凭证签发/撤销及 MCP 配置。三种权限为业务需求与图谱、已发布治理规则、组件源码与安装；旧凭证保持原业务范围。标准 Streamable HTTP MCP 在完整授权时提供18个工具，连接后先调用 `get_project_context`。治理规则只来自业务资料包明确登记的 `governance/*.md`，不发布内部研发文档。

## 项目与权限

- 项目：编码、名称、说明、图标、排序及归档状态。
- 菜单管理：选择工程中已登记的页面、名称、功能分组、顺序、上下架及访问范围。
- 用户授权：选择用户并勾选允许查看的受限菜单；保存后自动建立项目访问关系，不要求先配置成员角色。
- 公开菜单匿名可看；受限菜单须登录并经管理员授权。未授权菜单不进入普通用户的目录、搜索和项目切换列表；预览、源码、PRD 与资源由服务端继续校验。
- 新项目没有页面时显示空状态；源码新增页面不自动公开，管理员在菜单管理中添加后才展示。

项目详情为 `/projects/{id}/settings`，页内 Tab 为基础信息、菜单管理（`?tab=menus`）、用户授权（`?tab=access`）。侧栏始终选中项目管理，切换 Tab 保留已访问面板的未保存草稿。旧菜单/授权地址重定向到相应 Tab。

组件中心为 `/center/{projectId}?kind=requirements|components&category=...`。左侧一级菜单为需求管理、组件管理，二级菜单共用该项目前台的功能分类；右侧列出当前分类下的功能页面名或组件名。页面/组件身份由工程登记决定，菜单控制上下架与授权，业务需求仍只读。未登记组件时显示空状态。

Docs需求图谱默认使用G6彩色圆点2D，另提供Three.js / 3D Force Graph固定点阵球视图。节点与关系图例控制显隐，不再先进入业务分类；搜索、视图切换及详解共用同一份获准需求，不因筛选重排点位。2D布局在Worker中一次计算并缓存，3D关闭物理迭代与自动旋转，交互结束后暂停重绘。网站公共导航、项目切换及原文/MCP保留。对外关系只能有明确PRD原文依据，维护缺口仍如实提示；完整范围见[图谱需求第25节](docs/原生原型平台/原生原型平台-需求.md)。

Docs的介绍、使用指南、主题设置、动效、AI和MCP、更新日志来自当前业务资料包的`guides`清单。页面主标题使用栏目名称，项目介绍放在正文；RIMO与组件中心分别维护实际内容。指南复用UIARC指南页的章节、定义列表、步骤、变量表和代码区，不套用PRD排版。主题页色块读取当前颜色变量，代码示例与链接保留当前站点和项目；目录及前后篇导航沿用原版式。正文保留发布语言，未配置或无权读取时显示对应状态。新增项目的登记方式见[接入模板](templates/project/README.md)。

前台页面为 `/pages/{projectId}/{clientId}/{pageKey}`。应用使用 HashRouter，可直接访问 `/#/projects/...` 和 `/#/center/...`。

顶部 **Try the demo** 直接进入当前项目的 `/demo`：用管理后台式外壳组合前台可见页面，左侧分类菜单、右侧直接操作。当前项目由网址明确指定，返回首页或直接进入 Demo 时记住同一浏览器标签页的项目选择；可见目录仍由服务端校验。公开页面无需登录，隐藏、下架或撤权同步移除；Demo 不展示实际管理功能。单页地址为 `/#/demo/{projectId}/{clientId}/{pageKey}`。

2026-11-11按负责人要求，本地 RIMO 的71页与组件中心现有页面、PRD、图谱和组件资料暂时全部公开浏览。RIMO六份未绑定页面的资料也显式声明公开；原权限配置已保存在`.preview-data/archives/public-preview/2026-11-11`。实际项目管理和账号写入仍使用平台身份，在线协作需登录，MCP沿用项目读取凭证。

Demo 顶栏提供在线人数和主动跟随。同项目、同页面可见对方内容区鼠标；选择用户后跟随页面切换，退出后独立浏览。登录用户可在其可见的公开页面参与；受限页面继续逐项校验权限。弹窗仅同步已登记的只读状态，普通表单、筛选、滚动及业务操作不自动同步。

前台、管理后台与Demo顶栏均提供“休息”：选择10或30分钟，打开全屏音乐播放器，缩小后在右下角继续播放；同一访客或账号在三种界面间切换不重置歌曲或倒计时。30分钟单曲循环，到时停止；暂停或拖动歌曲不延长休息。已接入负责人提供的10:13 MP3与官方专辑封面；未配置默认资源的环境可选择本地音频，仅在当前浏览器播放。固定曲目接入位置与发布边界见[休息媒体](apps/web/src/features/rest/media/README.md)，关闭网页、刷新、登录/退出或账号身份变化后不自动续播；音频文件不提交Git。

展示前台的页面预览也提供“在线协作”，入口在预览工具栏与全屏预览头部。前台与Demo共用项目在线范围，跟随时保留当前浏览方式；源码、PRD和管理表单不采集鼠标。匿名浏览不加入协作，离开项目页面或退出登录后离开房间。

**HTML 导入、目录挂载、iframe 业务页、旧本机写入服务及旧静态导出流程已退役。** 原始 HTML、真实项目资料、上游快照不改。不要再使用旧项目包工具来创建新页面。

RIMO本轮接入只保留原型右侧业务内容，原侧栏、顶栏及外壳样式不进入区块。同规范页面按当前平台的React公共控件与布局批量适配，特殊业务分支单独处理，逐页核对全部字段、操作、状态和弹窗；整理要点放在预览下方，规范化全文通过“文档”页签阅读。已确认页面保留，普通构建不运行迁移或读取上游目录。工程登记与逐页验收分开，当前范围见原生需求第29节及专项接续。

## 工程入口

| 位置                                                                 | 职责                                   |
| -------------------------------------------------------------------- | -------------------------------------- |
| [apps/web](apps/web/README.md)                                       | React 前台、后台与独立项目页面         |
| [apps/api](apps/api/README.md)                                       | Node 服务装配                          |
| [packages/preview-ui](packages/preview-ui/README.md)                 | 公共 UI、主题、动效及来源              |
| [packages/component-library](packages/component-library/README.md) | 可复用组件、页面级区块与安装源码       |
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

RIMO当前登记71个React页面、132项需求及独立页面要点；现有本地菜单按负责人要求全部公开，后续新增菜单仍由管理员配置范围。图谱用节点/关系图例控制显隐，点选需求后查看直接关系、管理功能和原文依据；业务分类保留为资料归属。完整业务交互、跨文档冲突与生产验证继续单独记录。实际阶段证据见[开发记录](docs/原生原型平台/原生原型平台-开发记录.md)，当前待办见[协作接续](docs/原生原型平台/原生原型平台-协作接续.md)，不把框架代码或静态检查等同整个平台业务已完成。

工程入口按职责命名：scripts/dev.mjs、build-runtime.mjs、release.mjs、deploy.mjs；构建产物统一在 output/web、runtime、tools、ui、core。运行数据和备份在被忽略的 .preview-data。`npm run structure:check` 检查自有源码命名及根目录，禁止回填旧模板、历史版本目录或临时文件。原始资料与固定来源资源保留原始文件名。

Windows清理工具为 [clean-generated.ps1](scripts/clean-generated.ps1)：在本机终端运行 `powershell -NoProfile -STA -File .\scripts\clean-generated.ps1` 只读预览；自行添加 `-ConfirmCleanup` 才弹窗确认永久删除。仅处理脚本列明的构建、缓存、旧隔离目录及被最终截图替代且未被工程记录引用的截图，不整删output、node_modules或.preview-data。源码、PRD、数据库、凭证、备份、原稿和迁移清单保留；检测到工程进程、Git文件、链接或确认期间清单变化就停止。弹窗不提升权限，不用于绕过执行环境限制；删除构建后需要重新构建才能使用生产预览。

后台组件统一约束见[控件导读](packages/preview-ui/src/admin-controls/README.md)。整页/区块使用原像素加载，表格读取使用原骨架；不再在页面里重写这些组件。
