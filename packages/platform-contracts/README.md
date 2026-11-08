# Platform Contracts

[platform.js](src/platform.js) 与对应声明维护项目/页面登记及类型；[showcase.js](src/showcase.js) 从同一清单派生页面源码入口；[context.js](src/context.js) 维护只读业务上下文工具。[index.js](src/index.js) 维护可区分的 HTTP 错误。

无 Node、React、存储或浏览器依赖。新增页面以稳定 pageKey 登记，目录和组件文件按工程规范命名。项目管理不让用户选择模块或 HTML 文件。

旧 HTML 归一化协议已经退役。权限、注册和资料安全测试见[项目上下文测试](../../tests/unit/project-context.spec.js)与[错误测试](../../tests/unit/api-errors.spec.js)。
