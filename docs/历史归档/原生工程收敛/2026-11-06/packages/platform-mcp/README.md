# Preview Platform MCP

本地 stdio 只读上下文适配，不监听网络端口，不提供账号权限或通用执行工具。

[启动脚本](../../scripts/platform-mcp.mjs)读取项目路径与本机挂载，再调用 [runMcpServer](src/index.js)。它从 [project-core](../project-core/README.md)读取项目、页面、文档、关联和健康事实，并在输出前投影及隐藏本地路径。

当前工具为 list_projects、get_project_overview、get_page_context、list_documents、list_associations、list_health_issues。客户端可以消费结果，但不能由模型参数扩大可读目录或执行任意命令。

根目录 npm run mcp:serve 会读取本地项目并占用 stdin/stdout，不能当作无副作用检查。验证使用[脱敏 MCP 测试](../../tests/unit/platform-mcp.spec.js)；工程规则从[文档导航](../../docs/文档导航.md)进入。
