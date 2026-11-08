# Preview API

独立原生平台进程。入口 main.mjs 装配 packages/platform-server 的正式适配器，领域规则与 SQLite 存储由 project-core/native-platform 维护。账号、会话、项目、成员、客户端、菜单、文档关联和品牌设置真实持久化；订单业务没有服务端。

`npm run dev:native` 同时启动回环 API 5190 与原生 Vite 5191。`npm run build:native` 生成 output/native-build，`npm run serve:native -- --bootstrap` 在5190提供构建及仅本机一次性管理员初始化。默认数据在被忽略的 .preview-data/platform.sqlite；没有默认管理员密码。

正式服务只暴露 /api/native、index.html、assets 和 brand，不挂旧 HTML/项目管理 API。运行参数包括 --data、--documents、--host、--port、--origin、--releases；文档源 local 从服务机器的指定目录读取 {projectId}/ 下的Markdown/允许图片，sample 指向合成文档夹具。真实资料不打入前端发行包。

发布机器使用独立数据目录、HTTPS固定origin和已安装的API代码。自动发布只更新验证后的web发行目录，不安装新API或迁移数据库。数据库/API/协议变化必须独立安排兼容升级；运行、备份恢复和CI配置见原生专项任务册。
