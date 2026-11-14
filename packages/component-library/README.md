# 组件与区块接入

平台提供源码Registry，使用者在本地`src/{project-code}/components/{component-key}`或`src/{project-code}/blocks/{block-key}`维护React实现。网站入口位于`apps/web/src/project-modules/{project-code}/{page-key}`，通过`@preview/library`引用同一份实现。

每个安装项声明全部源码、样式、辅助文件、目标目录及npm/Registry依赖。安装源码独立于平台路由、账号和后台外壳，服务端按项目菜单与凭证校验读取权限。

框架默认保留 [示例区块](src/example/README.md)，它只包含车组管理页面实际使用的源码和辅助文件。本地项目源码和业务资料按用途保存在忽略目录，登记、构建和权限配置按[项目模板](../../templates/project/README.md)执行。
