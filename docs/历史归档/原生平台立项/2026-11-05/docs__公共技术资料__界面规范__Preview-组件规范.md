# Preview 组件规范

维护日期：2026-11-05。本文描述当前 React 平台，不能以旧组件名或未来 UI 迁移替代现状。工程边界见[代码规范](../工程规范/Preview-代码规范.md)。

## 当前入口

基础组件从 `@/ui/ant` 引入，图标从 `@/ui/ant/icons` 引入；共享组合组件位于 `@/ui/platform`，见 [ui 目录](../../../apps/platform-react/src/ui)。

| 模块                           | 职责                           |
| ------------------------------ | ------------------------------ |
| PlatformPage / Surface         | 页面标题、说明、操作与内容表面 |
| AppSidebar                     | 桌面侧栏、折叠和窄屏抽屉       |
| PlatformBrand / ProjectIcon    | 平台正式品牌与项目图标         |
| ThemeControl / LanguageControl | 主题与语言切换                 |
| LoadingState                   | 加载反馈                       |
| AnimatedPillNav                | 工作台导航交互                 |

不再登记旧的 PageLayout、DataTablePanel、FormDialog 等不存在的组件。只有稳定结构和行为确实重复时才抽象，不强行给每页套同样的统计卡片与表格。

## 主题与交互

React 主题由 [theme 目录](../../../apps/platform-react/src/features/theme)通过 ConfigProvider 和 Ant Design token 下发，平台及 HTML 桥接沿用 `--app-*` 语义变量。字号、间距、圆角、阴影、状态和控件尺寸使用共享 token；正文沿用共享系统字体链，代码与路径使用等宽字体。

样式限定在自己的 CSS Module 或根类名下，不改全局样式修补单个项目。保留加载、空、失败、禁用、键盘焦点和窄屏状态；异步动作等待实际结果，不吞错或定时假成功。主题与动效切换不能重挂载表单、丢失草稿或改变业务值。

## HTML 原型

[PrototypeFrame](../../../apps/platform-react/src/features/prototypes/PrototypeFrame.tsx)承载项目 HTML。业务字段、模拟数据、资源和 PRD 留在项目包，不在 React 中重写。

新原型从[模板](../../../templates/html-prototype-page.html)开始，保留内容根、Manifest、编辑边界和主题桥接，规则见[创建提示词](../项目资料/HTML原型-创建提示词.md)。原型不能复制平台侧栏、顶栏或污染父页面样式。

## Rental OS UI 复用方向

负责人已确认计划复用 Rental OS 后台框架与整套 UI；本轮只做治理，尚未迁入。迁移时核对原组件、适配层、样式、主题、动效和许可，保留表单校验、键盘、ref、nullable 值、异步失败与弹窗生命周期；只适配 Preview 的数据和动作。

第三方原版源码与集成层分开，保留来源和版本，不修改 vendor 仿造另一种效果。组件清单、兼容回退与验收进入正式任务，本文不宣称 UIArc/Animate UI 已安装或全部适配。

## 验证

按[测试指南](../工程规范/Preview-测试指南.md)选检查，区分组件测试、构建、浏览器交互与用户视觉评审，不以修改行为或覆盖期望让测试通过。
