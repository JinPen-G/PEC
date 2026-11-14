# Project Shared

维护不依赖 Node、HTTP、浏览器或 React 的通用纯转换。目前公共出口为繁简转换。HTML 原型注入脚本与旧项目上下文转换已经退役；原生业务上下文由 project-core 的业务资料快照维护。

需求图谱词汇及项目指南的固定ID集合也在本层维护，由platform-contracts对外导出、project-core校验，避免领域层反向依赖HTTP/浏览器合同适配。

[平台文档](src/platform-docs.js)和[通用治理](src/platform-governance.js)是前台Docs与MCP共用的公开来源，不依赖业务资料、浏览器或服务端。通用规范可以单独用于其他工程，本地需求文档可选。已有业务资料包的同名副本与此正文一致，项目专属补充规则使用其他ID并沿用发布白名单。

[治理接入说明](src/governance-adoption.js)维护MCP的读取、说明、询问和自查流程；contracts导出说明，project-core提供规则与版本。这里不保存用户选择或访问目标工程，平台更新与业务项目更新分别读取。
