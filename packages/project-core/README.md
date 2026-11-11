# Project Core

领域层负责真实账号/会话、项目基础信息、菜单配置、页面授权、业务需求快照和安全文件读取。无 HTTP、Vite、React 或上游运行环境依赖。

- [store.js](src/platform/store.js)：SQLite 事务、版本冲突、授权及菜单身份。
- [project-content.js](src/platform/project-content.js)：业务资料白名单、散列与网页/AI有效关联。
- [page-documents.js](src/platform/page-documents.js)：页面与 PRD、图片的访问约束。
- [requirement-graph.js](src/platform/requirement-graph.js)：业务图谱合同、证据校验、权限投影与变更影响，不依赖前端画布。
- [filesystem.js](src/filesystem.js)：真实路径边界和原子文件操作。

旧 HTML 扫描、挂载、项目包迁移及旧路由管理已删除。独立 sources 文档适配器仅保留受控测试兼容，正式服务不开放本地文档目录参数。内部研发文档不得通过业务清单发布。

## 业务图谱

业务资料包的 manifest 可声明 `"graph": "graph.json"`。节点/关系字段见 [运行契约](../platform-contracts/src/requirement-graph.d.ts)，实际作者数据可参考脱离外部原稿整理的 [RIMO 图谱](../../project-content/rimo-rental/graph.json)。图谱来源仅限已登记业务 PRD。资料不带页面时默认受限，显式 `access: "public"` 才能匿名读取；已绑定页面的需求仍需通过全部页面权限与原始绑定的权限底线。

本地作者使用 `RequirementGraphDefinition`。API 里的 `stale/requirementStatus`、计数、分页、可读范围与维护诊断是服务端派生字段，不能粘贴进作者 JSON。核对记录同时绑定图谱、需求、页面关联和源码修订，修改图谱本身也会产生未核对提醒。

节点有稳定 ID、类型、主题集合、主要主题、生命周期、需求 ID、章节引用，以及 `none/partial/presented` 原型覆盖。引用保存 `requirementId/anchor/quote/revision`，原型保存 `clientId/pageKey/anchor/target/revision`。原型只表示交互画面的位置，不能据此推导生产实现。归属不是依赖；图谱响应同时返回 `vocabulary`，让远程 AI 获取关系传播方向和证据分类。

主题可选`category: "business" | "management"`，分别用于业务线与共用管理导航，未声明的旧图谱仍兼容。RIMO按业务线归集需求，共享规则通过多个`topics`归属保留唯一ID；分类不新增连线、不改变传播方向，也不授予跨页面访问权限。网页和MCP读取同一分类信息。前台将关联功能节点单独列为“管理功能关联”，业务前因/后果仍按关系的传播方向判断。

节点可选 `keyPoints`，供前台详解快速阅读：`kind` 为 `trigger`（触发条件）或 `rule`（关键规则），`text` 是 AI 提炼的简短说明，`evidence` 是本节点 `evidence` 数组的序号，至少一个且必须存在。每个节点最多 12 条、每条最多 300 字。要点只能复述引用原文，不能新增、合并出原文没有的规则；原文变化后与引用一同核对。API 返回的 `keyPoints` 始终为数组，并参与节点搜索。

当前关系为 `depends_on/provides_data/constrains/triggers/precedes/integrates_with/references/similar_to`。依赖关系的影响沿被依赖方到依赖方传播；数据、约束、触发及前置关系正向传播；对接双向；引用和相似不传播影响。路径查询沿声明方向，不能当作影响分析。对外关系只允许 `explicit` 且必须附PRD原文出处，不接受推断或待核实关系。过期依据和资料草稿仍标记维护/核对状态，不伪造当前生产规则；废弃对象默认不参与现行查询。

本地 AI 维护顺序：

1. `npm run graph:inspect -- --project <content-key>`：读取现行需求、源码指纹和绑定修订。
2. 修改业务 `graph.json`，逐项核对章节引用、关系原因、原型覆盖和当前指纹。无影响也写具体核对说明，不能只刷新散列。
3. `npm run graph:review -- --project <content-key> --note "<核对说明>"`：记录已核对版本。过期的节点/关系依据必须先修复，命令不会替作者确认。
4. `npm run graph:check`：报告遗漏及过期。日常修改强制维护；这些提醒不阻断部署。文件路径、资源预算、项目权限与发行散列仍严格校验。

MCP 在原有五个业务读取工具之外提供概况、主题、搜索、详情、邻接、路径与影响七个图谱工具。`offset/limit` 分页节点；关系归其源节点分页，目标可能位于其他节点页。每一节点页先读完 `edgeNextOffset`（通过 `edgeOffset/edgeLimit`），再切下一 `nextOffset`，按稳定 ID 合并。影响结果同样有分页/深度/工作量限制、证据、版本、可读范围和完整性状态；空结果不等于没有业务影响。

图谱通过既有完整发行和只读 MCP 发布。网页先进行权限投影，项目 AI 凭证允许全项目业务读取；凭证不授予代码执行或写入。内部研发四册、个人记录、凭据和原始宿主路径不会进入图谱。

前端2D底座为 `@antv/g6 5.1.1`（彩色圆点、连线、视口和tooltip）与 `@antv/layout 2.0.0`（Worker内一次性布局）；3D使用 `3d-force-graph 1.80.2` / `three 0.187.0` 的渲染、拾取和相机控制，固定球面坐标并停止持续模拟。`graphology 0.26.0` 与 `graphology-shortest-path 2.1.0`继续负责通用最短路径，均为MIT。安装包包含上游LICENSE，根package-lock固定版本和完整性，发行保留依赖许可资料；不修改上游源码。浏览器引擎不进入Node MCP领域运行时，领域层只维护业务传播、权限和证据策略。图例显隐与位置只影响呈现，不产生业务因果；前台按同一修订读取全部节点和边，异常或版本变化不返回模拟完整结果。

业务资料包可选`guides`清单，限定介绍、使用、主题、交互、AI和更新日志六种指南ID，每项明确`title`、`description`、`guides/*.md`路径及`public`或`project`访问范围。指南随同一受控快照与发行提供，通过`/showcase/{projectId}/guides`按当前项目权限读取，不将内部研发四册作为网页内容。指南不是新业务规则，不自动登记为需求节点，也不降低原PRD或资源的授权要求。
