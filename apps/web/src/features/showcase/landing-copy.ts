/** Homepage commands use the current server origin and existing Streamable HTTP contract. */
export function createLandingCommands(origin: string) {
  const endpoint = `${origin}/api/project-context/mcp`;
  return [
    {
      id: 'codex',
      label: 'Codex',
      command: `codex mcp add preview --url ${endpoint} --bearer-token-env-var PREVIEW_MCP_TOKEN`,
    },
    {
      id: 'cursor',
      label: 'Cursor',
      command: JSON.stringify(
        {
          mcpServers: {
            preview: { url: endpoint, headers: { Authorization: 'Bearer <project-read-only-token>' } },
          },
        },
        null,
        2,
      ),
    },
    {
      id: 'http',
      label: 'HTTP',
      command: `curl "${endpoint}" -X POST -H "Authorization: Bearer <project-read-only-token>" -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"preview-client","version":"1.0"}}}'`,
    },
  ];
}
export const LANDING_ENGLISH: Record<string, string> = {
  '让团队和 Agent': 'Help teams and agents',
  读懂需求: 'understand requirements',
  复用源码: 'reuse source code',
  组织开发: 'organize development',
  '从预览，走向实现。': 'From preview to implementation.',
  '浏览组件、区块和完整页面，体验交互、阅读需求、复用源码。连接 MCP，让 Agent 获取上下文与工程治理指引。':
    'Explore components, blocks and complete screens. Try the interactions, read requirements and reuse source code. Connect through MCP for context and engineering guidance.',
  组件与页面: 'Components and screens',
  需求与源码: 'Requirements and source',
  工程治理: 'Engineering governance',
  浏览页面: 'Browse screens',
  接入方式: 'Connection method',
  复制接入命令: 'Copy connection command',
  已复制接入命令: 'Connection command copied',
  '接入命令已复制。': 'Connection command copied.',
  '复制失败，请手动复制命令。': 'Could not copy. Select and copy the command manually.',
  组件交互演示: 'Interactive component examples',
  '每个界面，都可以动手体验。': 'Every interface, ready to try.',
  '试一试，交互就在这里。': 'Go ahead, play with them.',
  '把开发的上下文，交给 Agent。': 'Give your agent the context to build.',
  '用自然语言提出任务，让 Agent 读取需求原文、获取完整源码，或学习工程治理方法。先核对依据，再在你的工程中开发。':
    'Ask in plain words. Your agent reads original requirements, retrieves complete source code or learns an engineering method. Verify the context, then build in your own project.',
  读取需求: 'Requirements',
  读取源码: 'Source code',
  查看更新: 'Updates',
  '连接 Preview MCP，找到相关需求，先说明规则和验收条件。':
    'Connect to Preview MCP, find the requirements and explain the rules and acceptance criteria.',
  '调用 `get_project_context`，确认可读范围和资料版本':
    'Read `get_project_context` for access scopes and content versions',
  '用 `search_requirements` 查找，再用 `read_requirement` 读原文':
    'Find requirements with `search_requirements`, then read the original with `read_requirement`',
  '核对字段、流程、异常和验收条件，不用演示覆盖需求':
    'Check fields, flows, exceptions and acceptance criteria against the requirements',
  '保留出处与版本，冲突先向负责人确认': 'Keep sources and versions; confirm conflicts with the owner',
  '示例：需求已定位，带着原文与验收条件继续开发':
    'Example: requirements located, with sources and acceptance criteria',
  '找到合适的组件、区块或页面，把源码和依赖带到我的工程。':
    'Find a component, block or screen and bring its source and dependencies into my project.',
  '调用 `list_components` 查找可用组件、区块和页面':
    'Search available components, blocks and screens with `list_components`',
  '用 `get_component` 读取文件清单与依赖': 'Read the file list and dependencies with `get_component`',
  '按 `read_component_file` 读完整源码、样式与辅助模块':
    'Use `read_component_file` for complete source, styles and helper modules',
  '核对来源、许可和版本，再接入已有工程': 'Check provenance, licenses and versions before integration',
  '示例：源码与依赖已整理，可在本地按需接入':
    'Example: source and dependencies gathered for local integration',
  '读取工程治理指引，说明如何采用，再检查我的工程。':
    'Read the engineering guide, explain how to adopt it, then check my project.',
  '用 `list_governance_rules` 和 `read_governance_rule` 读完规范':
    'Read the full rules with `list_governance_rules` and `read_governance_rule`',
  '说明需求确认、任务拆分、协作和验证的方法':
    'Explain requirement confirmation, task planning, collaboration and verification',
  '询问是否采用，已有选择沿用；本地需求文档按需建立':
    'Ask whether to adopt the method; honor an existing choice. Local requirement documents are optional',
  '按证据自查，授权内同步 Git 并清理自产临时文件':
    'Check evidence, sync Git within authorization and clean up your own temporary files',
  '示例：规则可独立用于任何工程，采用方式由你决定':
    'Example: the method works independently; adoption is your choice',
  '继续开发前，先检查更新，告诉我哪些内容需要重新核对。':
    'Before continuing, check updates and tell me what needs to be reviewed again.',
  '调用 `read_project_updates`，先读 `source: platform`':
    'Call `read_project_updates` with `source: platform` first',
  '涉及已发布需求时，再读 `source: project` 的更新':
    'For published requirements, also read updates with `source: project`',
  '核对变化的版本，重新读取受影响的需求和源码':
    'Compare versions and re-read affected requirements and source code',
  '更新任务与接续，更新记录不能替代需求原文':
    'Update tasks and handoff notes; changelogs do not replace requirements',
  '示例：变化已核对，按当前依据继续任务': 'Example: changes reviewed, ready to continue with current sources',
  '读取中…': 'Reading…',
  已读取需求: 'Requirements read',
  读取需求原文: 'Read requirements',
  '组件入口.tsx': 'component.tsx',
  '样式.css': 'styles.css',
  '依赖清单.json': 'dependencies.json',
  '辅助模块.ts': 'helpers.ts',
  来源与许可: 'Provenance and license',
  需求依据: 'Requirement sources',
  确认来源与版本: 'Confirm sources and versions',
  先核对: 'Verify',
  任务与协作: 'Tasks and collaboration',
  '拆任务，保留他人修改': 'Plan tasks, preserve others’ changes',
  按范围: 'Keep scope',
  验证与交付: 'Verification and delivery',
  用实际结果说明完成情况: 'Report actual results and gaps',
  留证据: 'Keep evidence',
  'Git 与清理': 'Git and cleanup',
  '授权内同步，清理自产临时文件': 'Sync within scope, clean up your files',
  可接续: 'Hand off',
  '是否在你的工程中采用这套治理规范？': 'Would you adopt this engineering method in your project?',
  '开始或继续任务前，先查看更新。': 'Check updates before starting or continuing.',
  '本地开发 · 示例': 'localhost · example',
  'MCP 工作流演示': 'MCP workflow example',
  'MCP 开发场景': 'MCP development scenarios',
  '适用于 Codex、Cursor、Claude Code 等支持 MCP 的开发工具。':
    'Works with Codex, Cursor, Claude Code and other MCP-compatible tools.',
  '在开发工具中配置 MCP 地址与项目读取凭证。':
    'Configure the MCP URL and project read token in your development tool.',
  阅读接入文档: 'Read the connection guide',
  查看工程治理: 'Read engineering guidance',
  由: 'Built by',
  '制作。源码发布在': '. Source code is available on',
  页脚导航: 'Footer navigation',
  更新记录: 'Changelog',
};
