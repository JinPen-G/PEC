# Preview 测试指南

维护日期：2026-11-05。命令以[根 package.json](../../../package.json)及脚本为准，文档覆盖范围不表示已经运行。

## 分层验证与副作用

| 命令                       | 范围                                          | 副作用与边界                                                          |
| -------------------------- | --------------------------------------------- | --------------------------------------------------------------------- |
| npm run docs:check         | 现行 Markdown、本地链接、npm 命令、已登记四册 | 只读，不联网、不执行命令；不查锚点/HTML 链接/历史/业务完成度          |
| npm run architecture:check | 已登记平台层及 Preview UI 的静态导入          | 只读 AST；不证明运行时权限或动态表达式安全                            |
| npm run test:governance    | 文档和分层检查器的反例                        | 临时文件及符号链接，测试后清理                                        |
| npm run typecheck          | React tsconfig 与类型依赖                     | noEmit；不是完整 Node JS 类型检查                                     |
| npm run lint:core          | 自有应用、包、插件、脚本、测试、样例与配置    | 不检查真实 projects；排除生成预览                                     |
| npm run format:check:core  | 自有代码、模板、样例与现行文档                | 只检查格式，排除历史快照与 vendor 等                                  |
| npm run test:unit          | tests/unit 与 React 源码测试                  | Vitest/jsdom；临时文件，部分服务测试监听回环地址                      |
| npm run test               | React 源码测试                                | 不覆盖 tests/unit 的全部核心测试                                      |
| npm run audit:examples     | examples 脱敏项目                             | 无主机挂载，不写项目                                                  |
| npm run build:core         | React、插件、脱敏样例与固定设置               | 禁用 .env 目录加载；重建 output/core-build，不读取真实项目或覆盖 dist |
| npm run build:ui           | 新前端框架演示                                | 禁用 .env 与旧项目/管理插件；重建 output/ui-build，不读取项目资料     |
| npm run ui:source:check    | Preview 内固定上游快照、侧栏副本与 CSS 适配   | 只读本地来源，不访问 Rental OS                                        |
| npm run audit:projects     | 真实 projects 与本机挂载                      | 只读真实资料，不是隔离底座证据                                        |
| npm run project:health     | 真实项目、HTML、PRD、路径与关联               | 只读，可发现项目自身问题                                              |
| npm run build              | 真实项目、挂载、设置及 React                  | 清理并重建 dist，可能包含项目资料                                     |
| npm run test:e2e           | 当前 Playwright 套件                          | 启动/复用 4174 Vite 与 Chromium，可读取真实项目并写报告               |

## 统一入口

`npm run quality:core` 依次执行文档、架构、类型、核心 lint、格式、全部单测、样例校验和隔离构建。`npm run quality` 是同一入口。失败时保留原错误，不能删除断言、放宽规则或覆盖截图掩盖失败。

`npm run quality:check` 保留真实项目 lint、格式、项目校验和正常 build 的旧组合，不包括底座全部验证。`npm run ci:check` 在 quality:core 后追加 E2E，会启动浏览器与开发服务。

当前 `.github` 工作流存在外部删除现场，本轮未恢复。这是本地可执行门禁，不能宣称已接入或运行 GitHub Actions。

## 当前实际覆盖

Vitest 包含[核心测试](../../../tests/unit)和[React 源码](../../../apps/web/src)中的 test 文件，涉及项目扫描、契约、路径、路由、HTML、MCP、Node 服务与 React 组件/纯逻辑。具体覆盖以断言为准，不能推定全部原型业务已被覆盖。

当前[浏览器冒烟](../../../tests/e2e/platform-smoke.spec.js)两项已按新入口更新：演示登录/退出且无旧工具或 iframe；导航刷新与文档侧窗 Escape/焦点。配置改为 ui 模式，不读取真实项目。没有覆盖真实账号权限、订单等业务，也没有正式截图基线回归；本轮未执行浏览器套件，不能把套件存在写成验证通过。

Playwright 使用 Chromium、1440×900、zh-CN、Asia/Shanghai，地址为 `http://127.0.0.1:4174`，会复用已有服务，运行前核对服务归属。报告与失败截图位于 output/playwright。纯文档整理不为形式启动浏览器。

## 按改动选择验证

- 文档与注释：docs:check、本地链接复核和 git diff --check。
- 检查器与命令：反例测试、相关 lint、实际新命令，并核对读写范围。
- 自有代码格式统一：核心 lint、类型、全部单测和隔离构建，保留真实业务与第三方原文。
- 契约、路径和写入：受影响的核心/消费者测试，保留失败与拒绝路径。
- UI 与动效：相关类型、测试和构建，按负责人要求核查浏览器交互；用户浏览器评审承担视觉验收。

检查后在专项记录写实际命令、退出码及未验范围。局部绿色不代表全产品完成。
