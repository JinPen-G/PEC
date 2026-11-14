/** Authenticated HTTP/MCP adapters share one business snapshot service. No
 * internal files, source execution, browser cookies or write tools are exposed. */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
  CONTEXT_API_PREFIX,
  CONTEXT_TOOLS,
  AGENT_TOOLS,
  PROJECT_CONTEXT_INSTRUCTIONS,
} from '../../platform-contracts/src/context.js';
import { requireScope } from '../../project-core/src/platform/agent-context.js';
import { queryBusinessContext, readContentFile } from '../../project-core/src/platform/project-content.js';
import { fail, NativeError } from '../../project-core/src/platform/store.js';
import { URL } from 'node:url';

const mime = {
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};
const properties = {
  source: {
    type: 'string',
    enum: ['platform', 'project'],
    description: '更新记录来源，默认project；platform可在无业务资料时读取。',
  },
  governanceRevision: { type: 'string', description: '治理目录返回的版本；跨页保持一致。' },
  name: { type: 'string', description: '组件目录中的稳定名称。' },
  file: { type: 'string', description: 'get_component 返回的完整 target，不接受任意本地路径。' },
  registryRevision: { type: 'string', description: '组件清单版本，防止读取时混用版本。' },
  edgeOffset: { type: 'integer', minimum: 0, description: '当前节点分页内的关系分页偏移。' },
  edgeLimit: {
    type: 'integer',
    minimum: 1,
    maximum: 2000,
    description: '关系分页数量，先读完edgeNextOffset再换节点分页。',
  },
  projectId: { type: 'string', description: '可省略；若提供必须等于凭证绑定项目。' },
  id: { type: 'string', description: '对应业务需求或治理规则目录返回的稳定ID。' },
  query: { type: 'string', minLength: 1, maxLength: 160 },
  offset: { type: 'integer', minimum: 0 },
  limit: { type: 'integer', minimum: 1 },
  clientId: { type: 'string' },
  pageKey: { type: 'string' },
  contentRevision: { type: 'string' },
  graphRevision: { type: 'string', description: '获取图谱时返回的版本；用于避免混读旧关系。' },
  targetId: { type: 'string', description: '路径查询目标稳定节点ID。' },
  topic: { type: 'string', description: '业务主题ID。' },
  type: {
    type: 'string',
    enum: ['feature', 'object', 'field', 'state', 'rule', 'process', 'interface', 'platform'],
  },
  history: { type: 'boolean', description: '显式请求废弃历史；影响查询默认只使用现行内容。' },
  maxDepth: { type: 'integer', minimum: 1, maximum: 8 },
  change: { type: 'string', maxLength: 2000, description: '本次拟修改内容，影响结果仍需结合此场景核对。' },
};
export function createProjectContextHandler({ store, content, agentContext, publicOrigin, json, body }) {
  const rates = new Map();
  function authenticate(request) {
    const header = request.headers.authorization;
    if (typeof header !== 'string' || !header.startsWith('Bearer '))
      fail(401, '需要项目业务只读凭证', 'UNAUTHORIZED');
    return { secret: header.slice(7), ...store.authenticateContextToken(header.slice(7)) };
  }
  async function query(secret, operation, args) {
    const initial = store.authenticateContextToken(secret);
    let result;
    if (AGENT_TOOLS.some((tool) => tool.name === operation))
      result = await agentContext.query(initial, operation, args);
    else {
      requireScope(initial, 'business:read');
      const snapshot = await content.snapshot(initial.project, args.contentRevision);
      result = queryBusinessContext(snapshot, initial.project, operation, args);
    }
    const current = store.authenticateContextToken(secret);
    if (current.project.revision !== initial.project.revision)
      fail(409, '项目配置已变更，请重新读取', 'CONTENT_REVISION_CHANGED');
    return result;
  }
  return async (request, response, url) => {
    if (!url.pathname.startsWith(`${CONTEXT_API_PREFIX}/`)) return false;
    const identity = authenticate(request);
    const at = Date.now();
    for (const [key, rate] of rates) if (at - rate.at > 60000) rates.delete(key);
    const rate = rates.get(identity.tokenId) ?? { at, count: 0 };
    rate.count++;
    rates.set(identity.tokenId, rate);
    if (rate.count > 120 || rates.size > 2048) fail(429, '业务读取过于频繁，请稍后重试', 'RATE_LIMITED');
    if (request.headers.origin && request.headers.origin !== new URL(publicOrigin).origin)
      fail(403, '请求来源不允许', 'FORBIDDEN');
    if (url.pathname === `${CONTEXT_API_PREFIX}/mcp`) {
      if (request.method !== 'POST') {
        json(response, { code: 'METHOD_NOT_ALLOWED', message: 'MCP使用POST只读协议' }, 405);
        return true;
      }
      const input = await body(request);
      store.authenticateContextToken(identity.secret);
      const server = new Server(
        { name: 'preview-project-business', version: '1.0.0' },
        {
          capabilities: { tools: {} },
          instructions: PROJECT_CONTEXT_INSTRUCTIONS,
        },
      );
      server.setRequestHandler(ListToolsRequestSchema, () => ({
        tools: [
          ...(identity.scopes.includes('business:read') ? CONTEXT_TOOLS : []),
          ...AGENT_TOOLS.filter((tool) => !tool.scope || identity.scopes.includes(tool.scope)),
        ].map(({ name, description }) => ({
          name,
          description,
          inputSchema: { type: 'object', properties, additionalProperties: false },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
          },
        })),
      }));
      server.setRequestHandler(CallToolRequestSchema, async (call) => {
        try {
          const result = await query(identity.secret, call.params.name, call.params.arguments ?? {});
          return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  code: error instanceof NativeError ? error.code : 'SERVER_ERROR',
                  message: error instanceof NativeError ? error.message : '业务读取失败',
                }),
              },
            ],
          };
        }
      });
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      response.once('close', () => {
        void server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(request, response, input);
      return true;
    }
    if (request.method !== 'GET') {
      json(response, { code: 'METHOD_NOT_ALLOWED', message: '业务资料仅支持读取' }, 405);
      return true;
    }
    const parts = url.pathname.slice(CONTEXT_API_PREFIX.length + 1).split('/');
    if (parts.length !== 2 || decodeURIComponent(parts[0]) !== identity.project.id)
      fail(404, '项目不存在或无权访问', 'NOT_FOUND');
    const resource = parts[1];
    const args = Object.fromEntries(url.searchParams);
    if (resource === 'asset') {
      requireScope(identity, 'business:read');
      const snapshot = await content.snapshot(identity.project, args.contentRevision);
      if (!snapshot.manifest.assets.includes(args.path)) fail(404, '业务资源未发布', 'CONTENT_NOT_FOUND');
      const result = readContentFile(snapshot, args.path);
      const current = store.authenticateContextToken(identity.secret);
      if (current.project.revision !== identity.project.revision)
        fail(409, '项目配置已变更', 'CONTENT_REVISION_CHANGED');
      response.writeHead(200, {
        'Content-Type': mime[result.extension],
        'X-Preview-Content-Revision': snapshot.revision,
      });
      response.end(result.bytes);
      return true;
    }
    const operations = {
      context: 'get_project_context',
      updates: 'read_project_updates',
      'governance-rules': 'list_governance_rules',
      'governance-rule': 'read_governance_rule',
      components: 'list_components',
      component: 'get_component',
      'component-file': 'read_component_file',
      overview: 'get_project_overview',
      requirements: 'list_requirements',
      document: 'read_requirement',
      search: 'search_requirements',
      page: 'get_page_context',
      graph: 'get_requirement_graph',
      'graph-topics': 'list_graph_topics',
      'graph-search': 'search_graph_nodes',
      'graph-node': 'get_graph_node',
      'graph-neighbors': 'get_graph_neighbors',
      'graph-path': 'find_graph_path',
      'graph-impact': 'analyze_requirement_impact',
      'llms.txt': 'get_project_overview',
    };
    const operation = operations[resource];
    if (!operation) fail(404, '业务入口不存在', 'NOT_FOUND');
    const format = args.format;
    delete args.format;
    const result = await query(identity.secret, operation, { ...args, projectId: identity.project.id });
    if (format === 'markdown' || resource === 'llms.txt') {
      const markdown = result.markdown ?? '';
      response.writeHead(200, {
        'Content-Type': mime['.md'],
        'X-Preview-Content-Revision': result.contentRevision,
      });
      response.end(
        resource === 'llms.txt'
          ? `# ${result.title}\n\n${markdown}\n\n业务目录：${CONTEXT_API_PREFIX}/${identity.project.id}/requirements\n业务图谱：${CONTEXT_API_PREFIX}/${identity.project.id}/graph\n改动影响：${CONTEXT_API_PREFIX}/${identity.project.id}/graph-impact?id=<node-id>\n先检查图谱维护状态和影响路径，再读取PRD依据；原型覆盖不代表实际业务系统。所有入口需要Authorization项目凭证。\n`
          : markdown,
      );
    } else json(response, result);
    return true;
  };
}
