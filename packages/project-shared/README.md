# Project Shared

维护不依赖 Node、HTTP、浏览器或 React 的通用纯转换。目前公共出口为繁简转换。HTML 原型注入脚本与旧项目上下文转换已经退役；原生业务上下文由 project-core 的业务资料快照维护。

需求图谱词汇及项目指南的固定ID集合也在本层维护，由platform-contracts对外导出、project-core校验，避免领域层反向依赖HTTP/浏览器合同适配。
