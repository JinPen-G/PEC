# Preview 代码规范

版本：1.0。维护日期：2026-11-05。当前结构见[架构说明](Preview-架构说明.md)，协作规则见根 [AGENTS](../../../AGENTS.md)。精确依赖版本以[根包声明](../../../package.json)与锁文件为准。

新业务原型按[原生平台需求](../../原生原型平台/原生原型平台-需求.md)和[任务](../../原生原型平台/原生原型平台-开发任务.md)使用 React 项目包；HTML 挂载及相关工具已退役，新页面不得生成或加载 HTML 副本。后续新增 UI/原型运行时/正式 API 层时同步核对分层检查，不能提前豁免反向依赖。

## 目录与依赖方向

| 层                 | 允许依赖                                                     | 负责内容                                                                          |
| ------------------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| platform-contracts | 平台无关的数据声明与纯逻辑                                   | 响应、错误、归一化和类型，不依赖 Node、DOM、React 或其他平台包                    |
| platform-client    | platform-contracts、注入的 fetch                             | 请求、静态只读边界和响应归一化，不依赖 Node、React、Vite 或文件系统               |
| project-shared     | 平台无关纯逻辑                                               | 浏览器与 Node 共用的上下文算法、语言映射和桥接脚本文本，不读取宿主文件或 DOM      |
| component-library | React 与明确声明的组件依赖                                    | 可安装基础组件与区块，不依赖网站 features、账号、Node 或平台后台外壳              |
| project-core       | Node 基础库、project-shared、自身领域模块                    | 文件契约、扫描、路径、文档、路由、迁移与原子写入，不依赖 HTTP、Vite、React 或应用 |
| platform-server    | project-core、platform-contracts、Node                       | HTTP 与 MCP 适配、生命周期和运行边界，不依赖浏览器应用                            |
| plugins / scripts  | 对应领域包与工具库                                           | Vite、CLI、构建及检查入口，不复制领域规则                                         |
| web                | platform-client、platform-contracts、project-shared、公共 UI、component-library | 路由、原生页面、交互与主题，不直接调用 Node 领域核心或服务端实现                  |
| api                | platform-server、Node                                        | 正式原生平台启动装配，不拥有领域规则或浏览器代码                                  |

公共出口优先复用；内部模块间相对导入可以保留，不为形式创建更多适配层。新增跨层依赖先说明职责变化，不以扩充白名单掩盖反向依赖。

公共包统一使用 @preview 命名。project-shared 维护纯语言转换；旧 HTML 注入、CDN 重写和 stdio 扫描接口已移除。

## 源码维护

工程目录按职责使用英文 kebab-case，唯一浏览器应用为 `apps/web`，公共 UI 为 `packages/preview-ui`；不把 React 等实现技术写进应用目录名。功能目录使用 `appearance`、`shell`、`sound` 等职责名。React 组件文件使用 PascalCase，纯模块和工程脚本使用 kebab-case；测试保留对应模块名及 `.test`/`.spec` 后缀，标准配置文件沿用工具要求的名称。

根目录 Windows 入口为 `start-dev.cmd`、`start-server.cmd`、`build-web.cmd`、`build-server.cmd`。重命名同时修复导入、别名、npm 命令、检测规则、构建和现行文档链接。正式中文四册沿用文档治理命名；上游原稿、品牌资源、真实项目、历史快照和生成产物保留原名及字节，不纳入源码命名转换。

自有源码按当前职责命名，不用 native/legacy 区分历史实现，不追加 new/final/latest/v2 等版本后缀。当前入口为 scripts/dev.mjs、build-runtime.mjs、release.mjs、deploy.mjs；API、领域和请求分别为 platform-server/src/server.js、project-core/src/platform、platform-client/src/client.js。构建产物统一在 output/web、runtime、tools、ui、core；数据库与持久备份在 .preview-data。结构检查入口为 npm run structure:check；旧 npm 命令仅兼容转发到同一实现，不维护另一套运行代码。

- React 页面按 app、features、project-modules、ui 分工。服务状态沿用 TanStack Query，派生状态保持确定性，页面不重复创建请求栈。
- 公共接口的运行时 JS 与 TypeScript 声明同步；已发布业务清单由核心运行时校验；旧 HTML 项目的 JSON Schema 不再使用。兼容规则写在拥有该契约的模块。
- 入口和复杂边界的文件头只说明职责与限制。解释并发、回退、原子写入、路径边界等非显然原因；不对简单代码逐句注释。
- 异步操作等待实际结果，保留错误、取消、未配置和无权限状态；不以定时器、模拟返回或吞错替代真实完成。
- 前端显示状态不承担服务端授权。涉及文件的输入先经过现有路径解析和根目录校验，写操作复用原子写入、回滚和备份能力。

## 格式与修改范围

自有代码统一使用根 Prettier 配置：110 列、单引号、分号、尾随逗号与 LF。通过命令选择范围，不复制另一份格式配置。

格式整理与功能重构分阶段进行。批量格式统一只涉及受版本控制的自有源码、工程脚本、配置、测试、模板和脱敏样例；不扫描真实项目、vendor、产物或临时生成目录。历史文档快照保持原文字节。

功能变更只格式化实际修改文件。不要为改一处功能重新格式化整个工程，也不通过忽略自有代码来让门禁通过。

## UI、原型和来源

新外壳从 `@preview/ui` 引入，旧页面公共 UI 保留 `@/ui/ant` 与 `@/ui/platform`，主题、字号、间距、圆角和状态使用共享 token；细则见[组件规范](../界面规范/Preview-组件规范.md)。Rental OS 固定来源外壳已在 Preview 内适配；原始副本不参与自有源码格式整理，保留键盘行为和许可，不搬入其租赁业务。

页面内容属于独立 React 项目目录，平台负责路由、权限、主题及资料关联。生成工具的中间文件不成为第二套正式应用入口。

## 验证与交付

选择能够发现本次问题的最小有效验证，公共契约和核心边界必须覆盖生产者与消费者。测试优先验证行为、拒绝路径和失败恢复，不为可逆的小改动机械添加镜像测试。

统一门禁及副作用见[测试指南](Preview-测试指南.md)。使用脱敏样例建立底座证据，真实项目另行核查；构建、截图和代码检查分别陈述，视觉验收由用户浏览器评审确认。
