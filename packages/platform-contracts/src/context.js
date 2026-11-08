/** Read-only project business context; never includes internal development records. */
export const CONTEXT_API_PREFIX = '/api/project-context';
export const CONTEXT_SCHEMA_VERSION = 1;
export const CONTEXT_SCOPE = 'business:read';
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
  { name: 'get_graph_node', description: '读取稳定节点、PRD依据、原型定位和原文明示/推断/待核实关系。' },
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
