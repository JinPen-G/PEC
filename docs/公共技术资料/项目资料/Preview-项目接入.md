# Preview 项目与页面接入

项目页面直接使用 React 编写，业务需求以明确清单随 Git 发布。代码规范与步骤见[项目模板](../../../templates/project/README.md)，平台不提供 HTML 上传或目录挂载。

源码目录为 apps/web/src/project-modules/{project-code}/{page-key}，页面文件使用 PascalCase，样式与普通模块使用 kebab-case。项目介绍与业务需求分别写入 project-content/{project-code}/overview.md 和 requirements，manifest.json 明确列出允许发布的文件。

平台注册声明在 packages/platform-contracts/src/platform.js，展示页登记由 showcase.js 派生。项目编码决定源码目录，模块与页面稳定键用于授权和运行，不因文件整理而修改既有身份。管理员在项目内添加菜单并配置上下架、分类和授权。

新增源码不自动公开。公开页可匿名访问，受限页须登录并由管理员授权；预览、源码、需求与资源均由服务端检查。内部研发四册、个人记录、宿主配置和凭据不加入业务资料清单。

原 HTML、原 PRD、品牌素材与第三方原文保持原始内容。转换时新增 React 页面和整理后的需求，不覆盖原稿。完整发布统一包含 API、web、注册声明和业务资料，步骤见[部署说明](../部署运维/Preview-更新与缓存.md)。
