# Preview React 应用

唯一的平台应用入口，当前负责原生框架 UI 演示、路由、主题和说明文档阅读。旧 HTML 承载及工具页保留源码。工程共用规则见根 [AGENTS](../../AGENTS.md)，资料入口见[文档导航](../../docs/文档导航.md)。

## 阅读链路

1. [main.tsx](src/main.tsx)导入主题样式，兼容真实路径到 hash 路由并挂载应用。
2. [App](src/app/App.tsx)和 [AppProviders](src/app/AppProviders.tsx)装配 Router、查询、语言和主题。
3. [PreviewApp](src/features/shell/PreviewApp.tsx)提供演示登录、管理导航、空画布和文档样例，使用 [Preview UI](../../packages/preview-ui/README.md)外壳。
4. [AppRoutes](src/app/AppRoutes.tsx)、[PlatformShell](src/routes/PlatformShell.tsx)和 [ClientWorkspacePage](src/pages/ClientWorkspacePage.tsx)属于保留的旧实现，本轮不接入新主入口；旧 HTML 承载保留在 [PrototypeFrame](src/features/prototypes/PrototypeFrame.tsx)。
5. [platform-api](src/data/platform-api.ts)为旧数据客户端；新演示入口不发起项目或账号请求。真实平台 API 后续单独实施。

公共 UI 位于 ui/ant 与 ui/platform，主题位于 features/theme 与 styles。业务项目字段、模拟数据和 HTML 留在项目包；页面不能直接导入 Node 领域核心。

浏览器安全的上下文和语言转换来自 [project-shared](../../packages/project-shared/README.md)，与 Node 核心分开维护。

默认原生入口为 features/platform/NativePlatformApp.tsx，使用真实服务端身份、项目授权、客户端与菜单、文档和轻量协同。App仅在ui/core/legacy模式使用保留的PreviewApp演示入口；正式登录失败不回退任意密码模式。Electron未实现。

`features/platform`提供管理、身份、协作与文档界面；`features/prototypes/native-registry.tsx`按稳定模块键懒加载页面；`features/orders`为合成订单示例。后续HTML逐页转换成React并接入注册器，方法见[原生接入模板](../../templates/native-project/README.md)。

`features/shell` 负责框架装配、品牌项目弹层与文档/管理模式切换；`features/appearance` 负责本地主题色和三组圆角；`features/motion` 与 `features/sound` 负责偏好和全局反馈。原版控件通过 `@preview/ui` 使用，来源原文保留在公共包。设置保存、试听、跨浏览器标签更新和刷新保持可用，但不代表真实账号或服务器同步。

## 验证

根目录的 npm run typecheck、npm run lint:app 和 npm run test 检查本端；npm run quality:core 同时验证核心与隔离样例构建。浏览器与视觉验收单独记录，详见[测试指南](../../docs/公共技术资料/工程规范/Preview-测试指南.md)。
