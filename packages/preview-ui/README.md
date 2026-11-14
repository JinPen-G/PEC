# Preview UI

Preview 内维护的前端外壳，固定来源为 Rental OS 提交 `2a66243656a5f4866585fe8fdd757f4b98d022ab`。本包不连接 Rental OS 运行环境，依赖由 Preview 根目录安装，不使用软链接、共享 node_modules 或 file 依赖。

Demo 与管理后台共用的控制台样式固定于 Rental OS 提交 `215b515adcc263aeda0606566e8e1d3e72daa6e1`，原文及散列见 [console-source-manifest.json](console-source-manifest.json)。[生成器](../../scripts/rental-console-styles.mjs)解析固定样式和字面 token，不执行上游源码；运行 `node scripts/rental-console-styles.mjs` 同步 [console-source.css](src/console-source.css) 与 [console-motion.ts](src/console-motion.ts)，来源检查同时核对两份输出。外壳自己提供 `preview-console-host`，嵌入式 Screens 保持独立范围。桌面侧栏展开/收起为 248px/56px，内容面板上、下、右留白 8px，菜单为 14px/20px，滚动条为 6px；52px 首行与 54px 侧栏身份行对齐，时间独立放在第二行。顶部使用单下箭头，底部账号使用双向箭头，面包屑使用 13px、1.75 线宽的细右箭头。收缩宽度与子菜单高度共用原站无回弹动效，保留搜索恢复、键盘、菜单节点和页面草稿。业务控件主题色、圆角偏好和权限仍由 Preview 宿主管理。

## 来源与维护边界

[source-manifest.json](source-manifest.json)登记105份固定来源。当前[维护副本](upstream/rental-admin)按职责命名，原始散列与改名后的副本散列分开记录；原文及不再使用的网页参考已独立保全。维护副本不因改名成为自行编写，完整版权、许可及档案解释见[NOTICE](NOTICE.md)。这些来源文件不参与全量格式整理。

保留 [侧栏许可](upstream/rental-admin/apps/admin/src/components/animate-sidebar/LICENSE.md)、[侧栏来源清单](upstream/rental-admin/apps/admin/src/components/animate-sidebar/sources.json)及 [第三方UI组件 许可](upstream/rental-admin/packages/ui-primitives/LICENSE)。侧栏允许作为产品的一部分使用，原始组件不能单独出售或重新分发；本包为私有应用内部模块。

自有适配集中在 [FrameworkShell](src/FrameworkShell.tsx)、[DocumentDock](src/DocumentDock.tsx)、[environment](src/environment.tsx)与 [framework.css](src/framework.css)。路由、文案、账号显示和主题通过属性/回调传入；不导入应用账号状态、平台服务或租赁接口。DocumentDock 复用 Copilot 布局，正文槽位只负责阅读，不加载聊天 Provider。

[LoginFrame](src/LoginFrame.tsx)采用固定 LoginPage 的双栏品牌/表单结构，背景、输入框、密码控件、分段控制和主题开关直接使用本地固定来源。login-source.css 由[选择器提取器](../../scripts/rental-login-styles.mjs)生成，保留原声明，只选择登录/语言控件规则并调整背景资源路径，不引入原账号、租户或 API。Preview 登录适配只保存演示账号，验证码模式不发消息，第三方按钮只显示预览说明。

原 Ant 颜色与密度通过 [admin-theme](../../apps/web/src/features/theme/admin-theme.ts)按 arcTokens/theme/designTokens 投影，保留原色转换、状态色对、控件高度和圆角；不以近似全局颜色替代原 token。账号头像来自固定资源，菜单分组顺序与时钟沿用原外壳。

负责人明确要求原样复刻：颜色、字体、字号、行高、间距、圆角、交互状态及动效沿用固定上游定义，只适配 Preview 的名称、菜单内容与业务接点。新主入口不加载旧 Preview 全局样式，也不包在旧 AntApp 的全局链接样式下；ConfigProvider 只供保留的 Ant 组件使用。基础字体和侧栏尺寸按原 designTokens 定义，文档正文样式限定在阅读区域。

Tailwind 4 由 [Vite](../../vite.config.js)编译，[范围插件](../../plugins/sidebar-styles.js)由固定上游 TypeScript 转译，限制侧栏 reset 与变量的作用范围。CSS 扫描适配只将 AppShell 扫描路径改为 Preview 外壳文件；原始 CSS 保留。第三方UI组件 按钮的 motion token 别名由 Preview 构建和类型配置提供。

外观与音效的选色器、滑块、开关、选择器、分段控件、原版“音效一”的九种声音合成定义和引擎来自固定来源；源码中的音效二/三只是扩展注释，没有相应方案实现。[settings 样式提取器](../../scripts/rental-settings-styles.mjs)生成标题/模式切换样式，并将侧窗按钮重置限定到 dock，避免覆盖旁边的业务页。品牌入口沿用空间弹层，隔离 UI 演示显示两个明确的演示项目；模式切换以组件中心替换 Agent 工作台，并保留管理页返回位置。组件中心使用需求管理、组件管理及共用功能分类，由正式应用传入已授权菜单；公共外壳与隔离演示不自行读取真实项目或账号权限。

主题色、三组圆角、动效和音效由 [AppearancePage](../../apps/web/src/features/appearance/AppearancePage.tsx)适配，偏好保存在 Preview 的浏览器命名空间。主题色和圆角分开保存，通知/结果音连接本地保存的实际结果；未连接通知中心。账户同步、租户配置和 Rental OS 的保存接口不接入。

原版动效适配器在 Preview 内转译为 motion-preference-plugin.js，仅替换共享偏好 hook 的路径；保留 Motion 原始出口。它将原控件的减少动效 hook 与独立 CSS 媒体查询接到同一浏览器设置，使完整动效能够覆盖系统偏好，减少动效能够立即更新已挂载控件。

休息播放器通过`@preview/ui/rest-player`导出MediaPlayer与NowPlaying。来源为负责人提供的[独立重建组件](upstream/rest-widgets/README.md)，不是官方Pro TSX；12份实现保留原始版本、原始散列及当前维护散列，不进入组件Registry。宿主负责真实音频、倒计时与全屏/悬浮位置，减少动效hook通过构建适配器读取平台偏好。来源完整性与适配边界由`tests/unit/rest-widget-source.spec.js`验证。

## 使用与验证

应用从 `@preview/ui` 导入公共出口；主题和语言仍由 Preview 提供。当前只是前端演示，管理与订单画布为空，文档展示平台说明样例，不代表项目授权或真实项目文档已接入。

在根目录执行 `npm run dev:ui` 可预览，`npm run build:ui` 生成 output/ui。两者不加载 .env、项目挂载、本机设置或旧 HTML 管理插件。它们不是正式服务或发布包。

`npm run ui:source:check`只校验Preview内维护副本，不访问Rental OS；[定向测试](../../tests/unit/rental-framework.spec.js)覆盖来源损坏与禁止反向导入。[导入脚本](../../scripts/import-rental-framework.mjs)须显式提供source/commit；外部组件包的目录不同于`packages/ui-primitives`时，额外用`--primitives-root <包相对目录>`映射。本地已适配副本不会被原文自动覆盖；更新需核对差异、原始散列和许可，不跟随活动工作目录。

订单示例使用固定RentalOrdersPage与列布局参考、DataTable.module.css的原表格几何；保留[Tablecn许可](upstream/rental-admin/packages/ui-tablecn/LICENSE.md)。真实身份和业务接点由原生应用提供，来源外壳不读取上游运行环境。

展示前台与旧Rental管理外壳分开维护。既定组件库布局、字体和原站观察资源分别见[网站来源](upstream/site-library/source-manifest.json)及登录来源档案。公开组件采用固定MIT仓库原文；[登录组件运行副本](src/site/auth-registry)仅适配导入并保留散列，不能将其许可扩大到整个官网。观察到的官网脚本不执行，Text scramble与Stopwatch是自有行为重建，未宣称取得未公开源码。

展示运行时统一使用`preview-showcase`作用域，公开主题指南中的代码示例与之同步。当前适配样式散列由网站来源清单的`adaptedStyleSha256`和`adaptedLoginStyleSha256`记录，历史捕获清单用于追溯。登录轮播使用Preview本地演示内容，复制示例文本；项目名、活动、统计和计时均标明示例用途。

废弃原站头像仅保留在非公开来源目录，原路径、来源和原始SHA-256见退役资源清单。历史捕获清单保留当时位置；公开资源合同与捕获工具不再把头像作为网站资源。

前台登录采用既定组件库双栏并左右对换，真实认证由Preview应用提供；公共包只导出展示原语及样式。第三方登录尚未配置，不能以保留按钮证明外部身份接通。手机外框和导航过渡由应用适配，业务页面继续原生React运行，来源文件、原型HTML和业务PRD均不为视觉还原而改写。

本轮助手品牌资源来自官方渠道，原文与适配清单见 upstream/assistant-brands/manifest.json。菜单、侧栏、全屏观察资源见 upstream/site-library/interaction-capture；抽屉运行副本只适配导入与可翻译的关闭标签，来源与运行副本散列在drawer-adaptation.json。原站网页观察资源与MIT组件许可分别保留，不扩大许可范围。

## 后台控件正式入口

后台通用控件从 @preview/ui/admin 引用，页面加载从 @preview/ui/loading 引用；[控件导读](src/admin-controls/README.md)说明来源、兼容原语和宿主边界。控件源固定于同一Rental OS提交，156份新来源记录保留在 controls-source-manifest.json，不接入上游服务。

原像素加载、6行表格骨架、Tablecn工具栏/分页、表单、弹窗、下拉和提示组件已用于正式Preview后台。ui模式仍是独立演示，不能代替真实权限。来源校验同时检查旧框架105份与新增控件156份记录；这不是261个独立组件数量。
