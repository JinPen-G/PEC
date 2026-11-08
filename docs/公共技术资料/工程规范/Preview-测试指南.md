# Preview 测试指南

维护日期：2026-11-06。验证层级独立报告；没有执行的检查不能写通过。

| 命令                       | 范围与边界                                                          |
| -------------------------- | ------------------------------------------------------------------- |
| npm run docs:check         | 现行文档、链接和可用 npm 命令，只读                                 |
| npm run architecture:check | 自有源码静态导入方向，不证明运行权限                                |
| npm run test:governance    | 治理规则反例，临时夹具                                              |
| npm run typecheck          | React 及依赖类型，noEmit                                            |
| npm run lint:core          | 自有源码、脚本、测试；不包含真实项目                                |
| npm run format:check:core  | 维护范围格式；不覆盖 vendor/原稿/历史                               |
| npm run test:unit          | 原生身份、授权、项目、资料、发行及 React 测试；临时数据库与回环服务 |
| npm run build:core         | 隔离框架构建，不加载真实项目或 .env                                 |
| npm run build:web          | 注册 React 页面及正式应用构建，输出 output/web                      |
| npm run ui:source:check    | Preview 内固定 UI 来源与运行副本散列                                |
| npm run test:e2e           | 隔离 ui 模式下的浏览器冒烟，不覆盖真实权限                          |

quality:core 依次检查文档、分层、类型、lint、格式、单测、隔离构建。HTML 功能及其专项测试已经随产品退役；保留安全文件读取、错误分类、权限拒绝、原生资料和源码隔离测试。新增菜单授权测试必须覆盖：未授权、部分授权、撤权、跨项目、失效会话、乐观锁、批量失败原子性以及各读取入口。

文档改动跑 docs:check；代码改动按消费者选择定向测试。浏览器使用隔离合成账号/项目验证操作，不能修改真实业务权限来完成测试。用户视觉评审、第三方集成和生产发布分别记录。
