# Preview Platform Server

独立 Node HTTP 适配与生命周期，不拥有项目文件格式或浏览器状态。

## 入口与调用链

[启动脚本](../../scripts/platform-server.mjs)读取参数并调用 [runtime](src/runtime.js)预检、启动及安装退出处理；[createPlatformServer](src/index.js)分发平台设置、项目、路由、HTML、文档和静态资源请求。

领域操作复用 [project-core](../project-core/README.md)，响应共享 [platform-contracts](../platform-contracts/README.md)，地址解析与目录选择在本包适配。直接消费者是[浏览器客户端](../platform-client/README.md)、启动脚本与[服务测试](../../tests/unit/platform-server.spec.js)。

## 当前限制

默认本机可写、远程只读；remoteManagement 可以允许远程管理，但没有账号、会话或项目授权。独立服务与 Vite 开发接口并不完全相同，不能把其中一端通过视为另一端通过。

请求路径复用领域核心的路径边界；文件写入沿用原子写入和回滚。客户端传来的项目 ID、角色或路径不能作为未来服务端授权依据。

## 运行与验证

在根执行 npm run serve:local -- --help 查看真实参数；启动前需先有正常构建。治理阶段只使用临时夹具测试和 npm run build:core，不启动真实项目服务。

核心测试包含 runtime、地址/分享、扫描缓存与 HTTP 行为；副作用和覆盖见[测试指南](../../docs/公共技术资料/工程规范/Preview-测试指南.md)。
