## 连接 MCP 服务

项目 MCP 使用 Streamable HTTP，提供只读业务上下文。管理员在当前项目“AI 接入”中签发读取凭证，将配置添加到支持该传输方式的 Agent 客户端。

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

用当前项目签发的凭证替换占位符。网页公开浏览和 MCP 的项目读取范围分别管理。

<dl>
<div><dt><code>get_project_context</code></dt><dd>首先确认项目、版本，以及可读取的需求、治理规则和组件范围。</dd></div>
<div><dt><code>search_requirements</code></dt><dd>按业务问题查找需求，返回匹配内容与原文位置。</dd></div>
<div><dt><code>read_requirement</code></dt><dd>读取具体需求原文及页面关联，按返回游标继续读取。</dd></div>
<div><dt><code>get_requirement_graph</code></dt><dd>读取需求节点、明确关系、原型覆盖和维护状态。</dd></div>
<div><dt><code>analyze_requirement_impact</code></dt><dd>根据关系含义检查上下游影响，返回原因与依据。</dd></div>
<div><dt><code>get_page_context</code></dt><dd>从一个页面定位其需求与业务说明。</dd></div>
</dl>

## 提供工程治理规则

将需要对外提供的工程规则登记到项目资料包的治理清单。Agent 先调用 `list_governance_rules`，再用 `read_governance_rule` 读取已发布条目；目录为空时，表示当前没有发布规则。

规则可以说明需求核对、实现约束、测试和交付要求。平台内部开发记录和协作接续不属于这份发布清单。

## 读取页面源码

使用 `list_components` 查找已上架区块，`get_component` 取得文件与依赖清单，再用 `read_component_file` 按页读完需要的文件。

公开区块也可以通过 shadcn CLI 安装：

```sh
npx shadcn@latest add {{origin}}/r/{{projectId}}/rimo-vehicle-groups.json
```

安装步骤与示例导入见[使用指南](usage.md)。

## 选择读取范围

1. ### 创建项目凭证

   在 RIMO 项目的 AI 接入中，为当前工具或工作场景创建凭证。

2. ### 勾选需要的能力

   `business:read` 用于需求和图谱，`governance:read` 用于已发布治理规则，`components:read` 用于源码与安装清单。

3. ### 配置客户端

   将凭证保存在客户端私有配置中。过期或撤销后更新配置，不把凭证写入源码或分享链接。

## 可读取的上下文

- **业务需求**：项目概况、PRD 原文、页面要点与完整说明。
- **功能关系**：前置条件、功能关联、数据流转与平台接口关系。
- **组件源码**：已登记区块、样式、辅助模块和依赖。
- **工程规则**：项目明确发布且凭证允许读取的治理条目。

读取结果有游标时继续分页；出现维护提醒或原文冲突时，保留差异并核对来源。图中的距离和颜色不作为业务依据。

## 试一个提示词

```text
使用 RIMO 项目的 MCP，先读取项目上下文。
查找“车辆可预约条件”的需求和关联页面，读取原文及上下游关系。
再查看相关区块源码，列出字段、前置条件和异常处理。
基于这些依据提出实现改动和验证项，不自行补写未确认的业务规则。
```

MCP 提供需求和源码上下文。真实订单、支付与控车仍由业务系统处理。
