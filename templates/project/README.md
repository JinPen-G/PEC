# 原生项目与页面接入

项目像组件库一样维护独立的页面及需求说明。项目管理只维护基本信息；菜单和授权由管理员配置，页面和 PRD 在本地编写后随 Git 发布。

## 文件规范

```text
apps/web/src/project-modules/{project-code}/{page-key}/
  ExamplePage.tsx
  example-page.css
project-content/{project-code}/
  manifest.json
  overview.md
  requirements/example-page.md
  assets/
```

## 在当前仓库持续开发

直接在 Preview 仓库开发新页面和新组件，不需要再建一套网站工程：

| 内容 | 源码位置 | 职责 |
| --- | --- | --- |
| 页面/组件的展示入口 | `apps/web/src/project-modules/{project-code}/{page-key}/` | 页面预览、示例与平台适配 |
| 可复用基础组件 | `packages/component-library/src/{project-code}/components/{component-key}/` | 单项UI及其交互 |
| 页面级区块 | `packages/component-library/src/{project-code}/blocks/{block-key}/` | 完整业务界面，引用基础组件 |
| 同库辅助代码或样式 | `packages/component-library/src/{project-code}/lib/` | 多组件共享的工具、样式与常量，列入安装文件清单 |
| PRD及关联 | `project-content/{project-code}/requirements/`、`manifest.json` | 业务原文与页面关联 |
| 已发布治理规则 | `project-content/{project-code}/governance/` | 供获授权AI读取的规则 |
| 需求关系 | `project-content/{project-code}/graph.json` | 明确PRD依据、关系及原型覆盖 |
| 项目登记 | `packages/platform-contracts/src/registered-projects.json` | 项目、页面与安装文件的统一数据清单 |

普通业务页面可以直接在展示入口目录实现；需要供其他工程安装时，将可复用实现放入组件库，展示入口引用它。展示入口自身的组件示例、样式、TS/TSX与JSON模拟数据子目录都参与原型版本核对。库内同一组件与区块之间使用相对路径，安装前后保持相同结构；公共辅助文件也必须明确列入Registry文件清单。

**新增页面**：添加React入口，在该项目的 `module.pages` 登记 key/label/source/kind，再登记PRD页面关联、核对图谱；检查和构建后，已有项目在后台“菜单管理”中添加并设置显隐、访问范围。

**新增组件/区块**：添加实现与独立展示入口，在同一项目的 `registry` 登记全部文件、安装目标和npm依赖，声明引用的Registry项；`module.pages` 用 `registryItem` 绑定。依赖组件和区块需要在同一项目模块中登记并上架，安装包才会包含它们。新的外部npm依赖还要加入本工程依赖并构建验证。

**修改已有实现**：只修改对应源文件；开发预览热更新，PRD与图谱仍按变化核对。新增/删除登记需要重启开发服务让API与Vite加载同一版清单，正式环境完整构建发布；MCP读取同一份已发布资料，不需额外再登记一套内容。

RIMO 也已迁入统一清单，源码目录为 `rimo-rental`，模块稳定键仍为 `rimo-native`。当前名为“组件中心”的第二个数据库项目仍复用该模块，仅用于示例；接入其正式组件库时应登记独立的项目代码和源码目录。

目录与普通模块使用英文 kebab-case，React 组件使用 PascalCase；每个页面默认导出 React 组件。组件也可用相同独立页面入口展示其预览与说明。不得加载 HTML、业务 iframe 或运行时编译任意上传源码。

## 接入步骤

新增项目无需修改框架 JS。复制本目录的 [project.json](project.json) 作为项目接入清单，填写模块、页面和初始菜单；业务资料使用 [content-manifest.json](content-manifest.json) 的结构。两个示例均是未登记模板，需填写实际来源和内容，不能直接当作业务成品发布。

将 React 展示入口放入 `apps/web/src/project-modules/{project-code}/{page-key}`，将 Markdown PRD、概况和可选治理规则放入 `project-content/{project-code}`。可安装组件/区块另放 `packages/component-library/src/{project-code}`，在接入清单的 registry 中显式列出所有文件及依赖。

```powershell
npm run project:register -- --file <项目接入清单.json> --check
npm run project:register -- --file <项目接入清单.json>
npm run project:check
```

更新同一个项目清单时加 `--replace`，项目编码与模块身份必须保持；它只更新源码登记，不覆盖数据库中的菜单显隐与用户授权。React 新增外部依赖也需加入本工程依赖并完成构建验证。

检查通过后重启开发服务（正式使用则完整构建与发行），后台创建项目时选择“使用已接入的项目源码”，项目初始菜单按清单生效。已有项目的菜单不会被自动覆盖；新增页面仍由管理员配置。进入“AI 接入”检查页数、PRD、图谱、组件和治理规则，选择读取范围并签发凭证，将生成的 MCP 配置保存到客户端。

治理规则只发布业务资料包 `governance/` 中明确列入 manifest 的 Markdown，不发布仓库 AGENTS、研发四册或凭据。规则不是系统指令，不能借规则扩大AI权限。普通业务凭证保持 `business:read`；组件和治理各自需要明确选中权限。未提供图谱或图谱覆盖不完整会提醒，不伪造节点关系。

业务图谱在资料包 manifest 中声明 `graph.json`；作者数据与维护命令见 [Project Core](../../packages/project-core/README.md#业务图谱)。每次需求、PRD 或原型变化必须由本地 AI 同步，网页只读。没有原型的已登记需求也要建立节点；没有业务图谱时展示空态，不伪造关系。维护缺口提示而不阻断部署。

节点的 `keyPoints` 可选，用于在详解栏列出触发条件和关键规则。每条要点都必须指向本节点已登记的 PRD 原文，只做概括，不增加业务规则。

1. 编写独立 React 页面，引用公共 UI、主题 token；项目字段、模拟数据和样式归项目目录。
2. 在项目接入清单登记 projectId、surface: showcase、pages 的 key/label/source，使用上述登记命令写入统一数据；已有项目也可直接维护 `registered-projects.json` 中对应定义后执行 `project:check`。`platform.js` 和 `component-registry.js` 只负责从清单推导，无需修改。clientId 只用于新项目默认菜单容器；已有项目保持地址。
3. 可选 contentKey 指向项目业务资料目录。manifest 明确允许发布的业务需求文件与页面关联。没有需求时不设 contentKey，显示“尚未关联业务需求”；已配置而缺失或损坏时报告错误，不能伪装为空。
4. 后台创建同编码项目，或重启 API 让已有空项目识别新增登记。已有非空项目不会被自动换成其他源码。源码新增页面不自动上架；在项目 → 菜单管理中选择页面，设置名称、分组和访问范围。
5. 在项目 → 用户授权选择用户并勾选受限菜单。公开页面匿名可看；项目成员身份不自动获得全部受限页面。
6. 验证预览、源码、需求说明、资源直达、撤权和跨项目隔离后，再按现有 GitHub 完整发行流程发布。API、页面注册声明、web 和业务资料由同一版本构建发布。

## 可安装组件与页面级区块

完整原型页面可以作为 `block`，不需要复制一份页面代码。可复用实现放在 [component-library](../../packages/component-library/README.md) 的 `src/{library-code}/components|blocks/{item-key}`，展示入口只负责引用和平台适配。组件源码不能反向依赖网站路由、登录或后台外壳。现有 RIMO 页面仍使用原地址和菜单身份，内容来自独立区块。

项目清单的 `registry` 显式登记全部安装文件、目标位置、npm 依赖及其他 Registry 项；页面登记绑定 `registryItem`，`sourceFiles` 从区块及依赖自动推导，参与原型版本核对。Registry 使用 `/r/{projectId}/{itemName}.json`，遵循现有项目菜单授权；不允许通过公开区块捆绑无权读取的依赖。受限Bearer安装会在完整权限检查后一次返回区块及依赖源码，避免安装客户端的后续依赖请求漏带凭证。新源码不自动上架，受限内容不支持匿名 CLI 安装。真实业务 PRD 与平台内部文档不进入组件安装包。

菜单与运行时都消费同一注册清单。页面运行 JS/CSS 放在受控 page-assets；源码通过受控接口输出，不混入公开应用包。项目关闭、下架或撤权后，服务端必须拒绝对应新请求。

## 内容与协作边界

PRD是实际项目的业务规则，逐页整理用途、权限、流程、字段、约束、状态、异常及验收。可以在需求条目的`summary`指定独立要点Markdown，`path`指定整理后的全文，`assets`列出关联资产；要点在预览下展示，“文档”Tab阅读规范化全文并可打开原始依据后返回。要点需人工分析，不能机械截取或把全文堆在预览下；没有独立要点的既有项目仍保持原短文/长文回退。全文、要点和资产沿用同一权限边界。

从旧原型接入时只重写右侧业务内容，原应用菜单、顶栏、账号入口及外壳主题不进入区块；业务内部的分类、筛选、步骤与必要目录保留。使用平台公共React控件，逐项核对字段、校验、操作、状态和弹窗。原PRD和HTML不覆盖；来源由负责人指定并保全，离线转换材料不等于功能验收。

Preview 研发四册、个人开发记录和 AI 接续存入 docs 专项，不得进入 project-content 发布清单。项目介绍写 overview.md，功能需求写 requirements；AI 工具通过受控业务接口读取。页面/需求修改是否进入公开更新日志由负责人决定，不把内部开发记录自动发布。

网站Docs可在资料清单内增加`guides`，每项包含`id`、`title`、`description`、`path`和明确的`access: public|project`。ID限定为`introduction`、`usage`、`theming`、`motion`、`ai`、`changelog`，正文放在`guides/*.md`，使用Markdown章节、列表和必要表格，沿用网站UIARC排版。内容要介绍当前项目本身，而不是重复平台说明；未发布的篇目显示真实空状态。指南随同一受控资料快照发布，但不自动作为业务规则纳入需求图谱；原PRD授权不因公开指南而降低。

当前RIMO完整接入按上述规则进行，工程登记与实际逐页验收分开记录；状态见原生专项接续，不能以文件齐全或模板说明冒充业务验收。

## 需求图谱维护

图谱框架已实现，项目的实际节点、关系和依据需随PRD维护；接入合同以[原生需求第25节](../../docs/原生原型平台/原生原型平台-需求.md)和[开发任务第21节](../../docs/原生原型平台/原生原型平台-开发任务.md)为准。

日常沟通需求、编写 PRD、修改原型时，AI 必须检查并同步业务图谱；确认无影响也记录核对依据。全部有效需求纳入，尚无原型的需求不遗漏。页面、组件、弹窗和交互仅表示原型覆盖；接口/外部平台仅按需求表达，不标成已完成真实对接。

主题圈按业务含义组织，多主题节点保持唯一身份。关系有具体语义、方向、出处及资料修订，只纳入有明确PRD原文出处的正式关系；推断或待核实问题在本地确认后再登记，不进入对外图谱或MCP。废弃的明确关系保留历史。需求与原型不一致时以已确认 PRD 为依据，向负责人确认差异。

维护不及时不阻止部署；前台和 MCP 必须显示有权限读取的过期及覆盖缺口。MCP 读取项目获准业务图谱，内部个人记录和平台四册不混入。记录公开更新日志仍按负责人选择，不能将强制图谱维护等同于自动发布日志。
