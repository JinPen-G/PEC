# Rental OS 后台公共组件

后台页面统一从 `@preview/ui/admin` 引用表格、表单、弹窗、输入、下拉、分页、提示和空状态。整页与区块加载从 `@preview/ui/loading` 引用原像素加载组件，表格自身使用原骨架；不能在页面中重新拼 Ant 表格或浏览器原生 select。

整页异常提醒使用 `ResultPage`，独立错误入口从 `@preview/ui/result` 引用；结果原语 `Result` 仍由 `@preview/ui/admin` 导出。结果面板与整页布局固定于 Rental OS `9fb20dd236143f9b4c502bf7651b94ecc6bced8f`，新增来源单独记入现有控件清单，不替换既有156份控件版本。恢复页不依赖应用 Provider，错误细节交给控制台，重新加载和返回动作由调用方提供。

源码固定于 Rental OS 提交 `2a66243656a5f4866585fe8fdd757f4b98d022ab`。原文字节存放 `upstream/rental-controls`，运行副本位于本目录 runtime；运行副本只改导入路径。原作者来源、既定组件库/Tablecn/Motiq 许可和散列保存在 controls-source-manifest.json 及原目录中。

`environment.tsx` 适配 Preview 的语言、减少动效与本地选择状态身份。它不读取 Rental OS 的登录态、权限、API 或数据库；来源组件的 Copilot 扩展在 Preview 未接入时明确不可用。账号权限仍由 Preview 服务端负责。

表单保留原组件内的 Ant 校验状态，Tag、InputNumber 等保留来源工程本就使用的兼容原语。这不允许页面绕过公共入口选用另一套外观。搜索应使用 SearchField，菜单多选使用原 Select 支持的 multiple 配置。

Dialog、Select、Popover 和 Menu 必须共用一份 `react-dismissable-layer` 与 `react-focus-scope`。根包锁定同一底层实例；版本并存会造成嵌套关闭后 body 的 pointer-events 无法恢复。对应依赖回归检查在 tests/unit/rental-layer-dependencies.spec.js，不用强制清空页面样式绕过这一问题。

通过 `scripts/import-rental-controls.mjs --source <只读上游目录> --commit <固定提交>` 导入；脚本拒绝覆盖被修改的副本。更换上游版本须新建快照目录。`scripts/check-rental-controls.mjs` 校验原文和运行副本，只读取 Preview 内文件。
