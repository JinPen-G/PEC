## 连接 MCP 服务

MCP 为 Agent 提供项目范围内的组件目录、源码与依赖。使用支持 Streamable HTTP 的客户端，填入组件中心项目签发的读取凭证。

```json
{
  "mcpServers": {
    "{{projectId}}": {
      "url": "{{origin}}/api/project-context/mcp",
      "headers": {
        "Authorization": "Bearer <project-read-only-token>"
      }
    }
  }
}
```

网页和 Registry 当前公开浏览。MCP 的读取范围仍由项目凭证决定，组件源码需要 `components:read`。

<dl>
<div><dt><code>get_project_context</code></dt><dd>确认当前项目、版本、可用资料与组件能力。</dd></div>
<div><dt><code>list_components</code></dt><dd>搜索已登记的组件与页面级区块。</dd></div>
<div><dt><code>get_component</code></dt><dd>取得安装文件、目标目录、npm 依赖和组件依赖。</dd></div>
<div><dt><code>read_component_file</code></dt><dd>按清单逐份读取源码，并按游标读完长文件。</dd></div>
</dl>

## 提供工程规则

组件接入规范、主题约定和验证要求可以作为项目治理规则发布。Agent 通过 `list_governance_rules` 和 `read_governance_rule` 读取当前已发布内容；没有发布的规则不会由示例自动补全。

规则和源码一起提供上下文。真实项目的需求、权限与外部操作继续由该项目自身决定。

## 通过 CLI 安装

Agent 可以使用页面提供的同一条 Registry 命令安装公开区块：

```sh
npx shadcn@latest add {{origin}}/r/{{projectId}}/rimo-vehicle-groups.json
```

安装前先核对文件和依赖，安装后检查目标主题、字段、校验、键盘和弹层。完整准备步骤见[使用指南](usage.md)。

## 读取范围与凭证

1. ### 创建凭证

   在组件中心项目的 AI 接入中创建凭证，并启用组件源码读取范围。

2. ### 放入客户端

   用真实凭证替换配置中的占位符，保存在客户端私有配置中。

3. ### 更新或撤销

   工具不再使用时撤销凭证。凭证过期后重新配置，不将它提交到组件仓库。

## 可读取的上下文

- **项目能力**：当前项目的组件目录、资料范围与版本。
- **安装清单**：目标路径、包依赖与区块之间的引用。
- **源码文件**：组件、样式、辅助模块与示例数据。
- **治理规则**：已发布并允许当前凭证读取的工程约定。

当前目录中的车组管理是接入示例，后续组件按正式登记继续增加。查找时以接口返回的实际目录为准。

## 试一个提示词

```text
使用组件中心 MCP，先读取项目上下文和组件目录。
找到车组管理区块，读取完整安装清单、源码和样式。
按目标项目的目录与主题接入，保留字段、筛选和编辑交互。
检查依赖、键盘操作、表单校验与窄屏布局，并说明需要替换的模拟数据。
```
