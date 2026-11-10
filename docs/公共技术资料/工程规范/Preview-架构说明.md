# Preview 架构说明

维护日期：2026-11-06。当前范围见[原生需求第20节](../../原生原型平台/原生原型平台-需求.md)。HTML 挂载与旧本机管理运行时已退役，原稿不改。Rental OS 仅是固定只读来源。

```text
独立 React 页面 + 明确发布的业务 PRD
              │
platform-contracts 统一登记
              │
apps/web → platform-client → platform-server → project-core
                                │                 │
                          HTTP / MCP          SQLite / 安全资料
```

项目管理只维护基本信息，项目下提供菜单管理和用户授权。页面/组件源码在工程中编写；后台只能绑定注册清单允许的页面，不能执行任意上传代码。菜单分组、顺序、上下架及权限保存在 SQLite；PRD 正文和默认关联保存在 Git 业务清单。

新项目由 `project:register` 校验明确JSON清单后写入 platform-contracts 的 `registered-projects.json`，浏览器、构建、API、MCP都消费同一声明。初始菜单只在创建项目时应用，更新源码登记不覆盖后台管理状态；项目领域校验位于 project-core，命令不执行输入源码或写入账号数据库。

AI读取使用独立项目凭证，业务、已发布治理规则与组件源码分别授权。schema4的scope表保留旧凭证business:read。agent-context领域模块负责组件、治理、接入状态；HTTP/MCP与Registry只做适配。治理目录是明确对外发布的项目内容，与仓库AGENTS、研发四册及协作记录分离。标准MCP完整授权提供18个工具，返回分页与版本，不执行源代码或修改业务资料。

可安装组件与页面级区块维护在 `packages/component-library`，按库、components/blocks、项分目录，不能依赖平台应用或后台外壳。网站 `project-modules` 仅引用源码和注入平台适配；基础组件组合为区块，完整原型页也可作为区块。`component-registry.js` 显式声明全部安装文件、目标位置、npm 与 Registry 依赖；project-core 校验依赖闭包和授权，HTTP 使用项目范围 `/r/{projectId}/{name}.json`。构建的完整源码位于受控 `page-source/registry`，不扩展公开静态白名单。详见[组件库接入](../../../packages/component-library/README.md)。

展示前台为 features/showcase，管理后台为 features/platform。两个界面共用真实身份和权限。预览、源码、PRD、图片、目录与 page-assets 都在服务端检查；公开应用包不能静态导入受限页面包。

project-core 拥有领域规则，HTTP/MCP 仅做适配；浏览器不读 Node 文件系统。project-shared 只放纯转换。运行资料和内部四册严格分开，业务清单不得公开开发记录/接续/凭证。

默认 dev/build 是正式入口；ui/core 只用于隔离框架演示与检查，无账号安全承诺。正式 Node 服务在 apps/api 装配，生产 API、web、注册声明和业务资料统一发布。平台领域在 project-core/src/platform，HTTP 服务在 platform-server/src/server.js，浏览器请求在 platform-client/src/client.js。源码命名和依赖约束见[代码规范](Preview-代码规范.md)，实际证据见[开发记录](../../原生原型平台/原生原型平台-开发记录.md)。
