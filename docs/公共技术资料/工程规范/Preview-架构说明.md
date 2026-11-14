# Preview 架构说明

维护日期：2026-11-06。框架提供真实账号、项目权限、页面展示、图谱和MCP。HTML 挂载与旧本机管理运行时已退役，原稿不改。Rental OS 仅是固定只读来源。

```text
独立 React 页面 + 明确发布的业务 PRD
              │
platform-contracts 统一登记
              │
apps/web → platform-client → platform-server → project-core
                                │                 │
                          HTTP / MCP          SQLite / 安全资料
```

项目管理只维护基本信息，项目下提供菜单管理和用户授权。页面/组件源码在工程中编写；后台只能绑定注册清单允许的页面，不能执行任意上传代码。菜单分组、顺序、上下架及权限保存在 SQLite；PRD正文和默认关联保存在本地项目接入清单。

新项目由 `project:register` 校验明确 JSON 清单后写入本地项目登记。公开默认 `registered-projects.json` 包含“示例”，本地可使用忽略的 `registered-projects.local.json`。浏览器、构建、API、MCP 都消费同一声明。初始菜单只在创建项目时应用，更新源码登记保留后台管理状态。项目领域校验位于 project-core。

AI读取使用独立项目凭证，业务、工程治理与源码分别授权，旧凭证保留business:read。agent-context负责组件、治理、更新和接入状态，HTTP/MCP与Registry只做适配。通用规范和平台文档在project-shared维护，与业务包、内部四册和协作记录分离；无业务包时仍提供通用治理。标准MCP完整授权有19个工具，返回分页与版本，不执行源码或修改资料。`read_project_updates`区分platform与project来源，项目范围更新仍需business:read，通用规则分页使用governanceRevision。

Docs 采用独立平台内容，目录由各项目获准页面组成，项目仍为后台权限和 MCP 读取边界。`build:framework` 使用正式前后台入口与公开默认登记，输出完整 web/API/部署工具及“示例”，对本地项目来源进行独立校验。实际业务通过可选包接入。`build:core` 和 `build:ui` 用于隔离界面检查。来源许可处理与技术拆分分别验收。

可安装组件与页面级区块维护在 `packages/component-library`，按库、components/blocks、项分目录，不能依赖平台应用或后台外壳。网站 `project-modules` 仅引用源码和注入平台适配；基础组件组合为区块，完整原型页也可作为区块。`component-registry.js` 显式声明全部安装文件、目标位置、npm 与 Registry 依赖；project-core 校验依赖闭包和授权，HTTP 使用项目范围 `/r/{projectId}/{name}.json`。构建的完整源码位于受控 `page-source/registry`，不扩展公开静态白名单。详见[组件库接入](../../../packages/component-library/README.md)。

展示前台为 features/showcase，管理后台为 features/platform。两个界面共用真实身份和权限。预览、源码、PRD、图片、目录与 page-assets 都在服务端检查；公开应用包不能静态导入受限页面包。

project-core 拥有领域规则，HTTP/MCP 仅做适配；浏览器不读 Node 文件系统。project-shared 只放纯转换。运行资料和内部四册严格分开，业务清单不得公开开发记录/接续/凭证。

默认 dev/build 是正式入口；ui/core 只用于隔离框架演示与检查，无账号安全承诺。正式 Node 服务在 apps/api 装配，生产 API、web、注册声明和业务资料统一发布。平台领域在 project-core/src/platform，HTTP 服务在 platform-server/src/server.js，浏览器请求在 platform-client/src/client.js。源码命名和依赖约束见[代码规范](Preview-代码规范.md)，项目实施记录由维护者本地保存。
