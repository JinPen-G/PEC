# Preview API

[main.mjs](main.mjs) 装配正式 Node 服务，独立于 Rental OS。真实账号、项目、菜单、授权和设置存入 SQLite，业务页面中的订单等操作仍是模拟交互。

开发使用 `npm run dev`；构建后以 `npm run serve:native -- --bootstrap` 启动。运行参数支持 --data、--host、--port、--origin、--releases；不再提供 --documents 本地目录挂载。业务 PRD 来自工程中的明确发布清单。

服务启动时将已退役的 local/sample 资料来源退出正式运行；原目录内容不删除。新项目的代码登记按项目编码匹配，只允许给尚未绑定业务页的空项目接入声明，不替换已有项目源码。账号、授权与已配置业务资料保持。

完整发行将 API 与依赖编译为独立 Node 运行包，不在服务器执行 npm install。稳定 systemd 启动器将 API、web 与业务资料固定到同一版本；升级使用迁移前备份、维护模式、候选健康检查及失败恢复。生产配置与命令见[部署说明](../../docs/公共技术资料/部署运维/Preview-更新与缓存.md)，实际服务器尚未接通。
