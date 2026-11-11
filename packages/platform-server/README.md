# Platform Server

[createNativeServer](src/server.js) 是唯一正式 HTTP 服务入口，校验会话、角色、CSRF 和资源权限。它调用 project-core，业务规则不复制到适配器。

- /api/native：账号、项目基础信息、菜单和用户授权。
- /api/native/showcase：当前用户允许访问的页面目录、预览声明、源码与 PRD。
- /page-assets：登记的原生页面运行资源，逐次授权校验。
- /api/project-context：独立只读业务资料凭证与 HTTP MCP。

旧无鉴权本机管理服务、HTML 挂载、目录选择器与静态项目快照服务已移除。静态原型源不能绕过授权下载。公开应用脚本不得依赖受限页面脚本。

已在构建中包含的`assets/*.mp3`支持`audio/mpeg`、HEAD及单段字节Range，以流式响应供休息播放器播放/定位，不把完整录音读入请求内存。仍先执行原公开资源、扩展名与真实路径校验；不新增项目媒体目录、上传入口或绕过业务资料权限。对应反例见[音频响应测试](../../tests/unit/audio-response.spec.js)。

定向验证见[平台](../../tests/unit/platform.spec.js)、[业务上下文](../../tests/unit/project-context.spec.js)与[构建隔离](../../tests/unit/showcase-build.spec.js)。
