# Preview Web

唯一浏览器应用，入口 [main.tsx](src/main.tsx) → [App](src/app/App.tsx)。正式运行使用 UIARC 风格展示前台；管理员路径进入 Rental OS 风格后台，共用真实身份服务。

| 目录              | 职责                                                   |
| ----------------- | ------------------------------------------------------ |
| features/showcase | 预览、源码、PRD、登录、主题、目录和原站动效适配        |
| features/platform | 项目基础信息、项目菜单、用户授权、账号、文档和平台设置 |
| project-modules   | 独立 React 页面及页面自己的样式与模拟数据              |
| features/shell    | 隔离 UI 演示；不是正式认证兜底                         |
| features/docs     | 安全文档排版、目录、图片及 Mermaid                     |

[ProjectMenuPage](src/features/platform/ProjectMenuPage.tsx) 维护菜单；[ProjectAccessPage](src/features/platform/ProjectAccessPage.tsx) 管理页面权限；[RuntimePage](src/features/showcase/RuntimePage.tsx) 装载经过服务端授权的原生页面。HTML 挂载页面、旧工具路由与 iframe 容器已经删除。

页面从公共 UI 出口取得主题与原语，不将项目业务字段写进外壳。新增规范见[项目模板](../../templates/project/README.md)。类型、单测、构建及浏览器结果进入专项记录，演示截图不代表生产验收。

图谱页面共用领域数据和图例状态，2D使用G6彩色点，3D使用Three.js / 3D Force Graph固定点阵球，分别懒加载。2D布局在Worker中计算后缓存，交互只更新样式与视口；3D不持续模拟或自动旋转，空闲暂停渲染。源码中的球面坐标只供展示，不作为业务关系或MCP输入。

Docs读取当前项目的受控guides清单，复用已有UIARC正文和右侧目录；RIMO与组件中心内容保留在各自project-content资料包，外壳不硬编码项目业务文案。不存在或无权读取的指南不能回退成其他项目内容。
