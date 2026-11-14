/** Read-only project business context; never includes internal development records. */
export {
  GOVERNANCE_ADOPTION_QUESTION,
  PROJECT_CONTEXT_INSTRUCTIONS,
} from '../../project-shared/src/governance-adoption.js';
export const CONTEXT_API_PREFIX = '/api/project-context';
export const CONTEXT_SCHEMA_VERSION = 1;
export const CONTEXT_SCOPE = 'business:read';
export const AGENT_TOOLS = Object.freeze([
  {
    name: 'get_project_context',
    description: '首先读取权限、资料与源码范围、通用工程治理及更新入口；没有需求资料也可采用治理规范。',
    scope: null,
  },
  {
    name: 'read_project_updates',
    description:
      '分页读取更新；source=platform读取规范与平台更新，无需业务资料；source=project读取凭证项目更新，项目范围记录需business:read。',
    scope: null,
  },
  {
    name: 'list_governance_rules',
    description: '分页列出已发布的具体工程治理方法；逐条读完正文后向当前用户说明并询问是否采用。',
    scope: 'governance:read',
  },
  {
    name: 'read_governance_rule',
    description:
      '按ID读完治理步骤、文档范例和自查方法；用户选择采用后才在其授权工程落实，不自动授予写入权限。',
    scope: 'governance:read',
  },
  {
    name: 'list_components',
    description: '搜索项目已上架的组件、区块和页面源码条目，返回类型、页面键及安装入口。',
    scope: 'components:read',
  },
  {
    name: 'get_component',
    description: '读取组件/区块/页面的完整文件清单、npm及Registry依赖和版本；继续读取源码、样式和辅助文件。',
    scope: 'components:read',
  },
  {
    name: 'read_component_file',
    description: '按清单目标路径分页读取组件源码；必须检查nextOffset和版本。',
    scope: 'components:read',
  },
]);
export const CONTEXT_TOOLS = Object.freeze([
  { name: 'get_project_overview', description: '读取获授权项目的业务概况及当前资料版本。' },
  { name: 'list_requirements', description: '分页读取已发布业务需求目录，不读取内部开发文档。' },
  { name: 'read_requirement', description: '按稳定需求ID读取业务原文和页面关联。' },
  { name: 'search_requirements', description: '在获授权项目的已发布业务需求中搜索，返回原文摘录及定位。' },
  { name: 'get_page_context', description: '读取原生页面对应的业务需求，不提供源码或开发过程。' },
  {
    name: 'get_requirement_graph',
    description:
      '读取项目细节业务图谱、主题圈、原型覆盖和维护状态；默认不含废弃历史。支持节点分页，complete=false时不得认定无影响。',
  },
  { name: 'list_graph_topics', description: '读取业务主题；主题归属独立于菜单，不表示业务依赖。' },
  { name: 'search_graph_nodes', description: '按名称、别名、类型或主题查找业务节点，包含尚无原型的需求。' },
  { name: 'get_graph_node', description: '读取稳定节点、PRD依据、原型定位和有明确原文依据的关系。' },
  { name: 'get_graph_neighbors', description: '读取节点直接连接及关系含义；邻接不等于改动影响。' },
  {
    name: 'find_graph_path',
    description: '按声明的关系方向查找两节点的最短路径，返回每一步关系和依据；不是影响分析。',
  },
  {
    name: 'analyze_requirement_impact',
    description:
      '按业务传播语义查询具体修改的直接、间接、潜在影响与待核实项；返回原因、路径、原型覆盖和过期缺口，必须结合PRD核对。',
  },
]);
