# Preview 独立平台框架

这份构建包含前台、平台文档、后台、账号与项目权限、图谱、MCP、通用工程治理和部署工具。“示例”项目提供一个模拟车组管理页面、可安装区块及公开指南。使用者按项目接入清单登记自己的内容，账号数据库与私有配置由运行环境维护。

使用Node.js 24.13或同一受支持主版本启动。首次创建管理员使用独立数据目录；浏览器访问的地址必须与配置的origin一致。

```powershell
$env:PREVIEW_STATIC_ROOT = (Resolve-Path ./web).Path
$env:PREVIEW_CONTENT_ROOT = (Resolve-Path ./project-content).Path
node ./runtime/server.mjs --host 127.0.0.1 --port 5190 --origin http://127.0.0.1:5190 --data ../preview-data --bootstrap
```

首次通过浏览器创建管理员会建立“示例”项目。使用服务器 CLI 时加 `--with-projects` 可建立已登记项目，重复执行只补缺少的项目。管理后台创建空项目后即可签发治理读取凭证，MCP 可读取通用规范与平台更新。

平台源码位于 apps、platform-contracts、platform-client、platform-server、project-core、project-shared 及公共 UI。示例在 project-modules、component-library/src 和 project-content 中使用独立 example 目录。平台文档及通用治理在 project-shared 维护。框架构建读取公开默认登记，基础模板保留空工作台。

部署目录保留systemd/Nginx模板，tools保留发行、备份与部署程序。配置真实服务器、激活版本和部署需要使用者根据自己的环境执行，构建不连接生产系统。

该目录验证的是技术拆分，不代表已经完成开源发行。公共UI中的第三方实现保留原许可：侧栏含Commons Clause限制，网页观察样式和部分重建部件尚无独立开源许可证明。对外发布源码前需替换这些实现或取得明确许可；不能将它们整体改标MIT。浏览器和API的第三方声明随构建保留。
