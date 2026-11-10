/** Copy audited business documents and assets; preserve originals and explicit document/page identities. */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const workspace = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const report = JSON.parse(await fs.readFile(path.join(workspace, 'output/rimo-import/inventory.json'), 'utf8'));
const pages = JSON.parse(await fs.readFile(path.join(workspace, 'output/rimo-import/pages.json'), 'utf8'));
const archive = path.join(workspace, '.preview-data/archives/rimo-rental/2026-11-09/source');
const root = path.join(workspace, 'project-content/rimo-rental');
const hash = value => createHash('sha256').update(value).digest('hex');
const categories = { '公务车': 'official-vehicles', '合作通路': 'channel-tickets', '会员管理': 'members', '接口文档': 'interfaces', '门市租赁': 'store-rental', '车辆管理': 'vehicles', '分时租赁': 'time-share', '平台架构': 'platform' };
const bindings = {
  '00_全局口径与角色权限': ['enterprise-dashboard','enterprise-approval-setting','enterprise-contract-quotas'],
  '01_Dashboard': ['enterprise-dashboard'], '01A_Dashboard使用率统计与明细': ['enterprise-dashboard'],
  '02_公务订单管理': ['enterprise-official-order'], '03_新增公务订单': ['enterprise-official-order-add'],
  '04_车辆调度排程': ['enterprise-dispatch-schedule'], '05_公务车辆管理': ['enterprise-official-vehicles','enterprise-official-vehicle-add'],
  '07_营运端公务车辆合约管理': ['official-vehicle-contracts'], '08_合约配额管理': ['enterprise-contract-quotas'],
  '09_用车管理': ['enterprise-car-use-management'], '10_员工管理': ['enterprise-employee-management'],
  '11_员工审核': ['enterprise-employee-review'], '12_分公司管理': ['enterprise-branch-company-management'],
  '13_部门管理': ['enterprise-department-management'], '14_审批设定': ['enterprise-approval-setting'],
  '15_账单管理': ['enterprise-official-car-bill'], '16_数据快照与验收标准': ['enterprise-official-order','enterprise-official-car-bill'],
  '17_公务车据点管理': ['stations'], '18_清洁保养提醒': ['enterprise-official-vehicle-reminders'],
  '会员资质认证审核': ['member-review','member-detail','members'],
  '分时租赁订单列表标签与状态说明': ['time-share-orders','enterprise-time-share-orders'],
  '合作渠道租车券（同站租还）': ['channel-ticket-batches','channel-ticket-batch-detail','channel-ticket-applications','enterprise-channel-ticket-batches','enterprise-channel-ticket-batch-detail','mobile-channel-ticket-app','mobile-channel-ticket-app-compatible'],
  'RIMO_车辆与车机状态资料字段整理_微电车': ['vehicle-console','vehicle-status-list','tbox-management'],
  '车辆控制台与车机状态对接PRD': ['vehicle-console','vehicle-status-list','tbox-management'],
  'RIMO Rental APP 第三方控車 API 說明': ['vehicle-console'], 'RIMO Rental 管理後台車輛控車 API 說明': ['vehicle-console','tbox-management'],
  'AI智能调度分析Agent': ['dispatch','war-room'], '动态调价策略（牌价&费率）': ['pricing'],
  '基础产品定价（车组）': ['service-products','vehicle-groups'], '增值服务管理（保险&配件）': ['services'],
  '智能调度派车算法': ['dispatch','order-detail'], '智能调度派车规则': ['dispatch','order-detail'],
  '服务站点管理': ['stations'], '租赁业务规则': ['settings'], '行销方案管理': ['marketing'],
  '车行与门市管理': ['rental-companies','stores'], '门市租赁端到端业务流程': ['store-orders','new-order','order-detail'],
  '门市租赁调度边界与履约规则': ['dispatch','order-detail'], '门市租赁业务总索引': ['store-orders','dispatch'],
  '门市租车订单列表': ['store-orders'], '新建订单': ['new-order'],
  '门市租车订单状态': ['store-orders','order-detail'], '门市租车订单总索引': ['store-orders','order-detail'],
  '订单详情': ['order-detail'], '订单取车': ['order-detail'], '订单还车': ['order-detail'],
  '订单改派': ['order-detail','dispatch'], '延长用车': ['order-detail'], '取消与关闭订单': ['order-detail'],
  '费用管理': ['order-detail'], '事故出险处理': ['order-detail'],
};

const imported = [];
const assets = [];
const assetAliases = {};
const documentAliases = {};
for (const document of report.documents.filter(item => ['knowledge', 'requirement'].includes(item.kind))) {
  const category = document.kind === 'knowledge' ? 'knowledge' : categories[document.path.split('/')[2]] ?? 'business';
  const target = document.kind === 'knowledge' ? `requirements/knowledge/${path.basename(document.path)}`
    : `requirements/${category}/${document.path.split('/').slice(3).join('/')}`;
  documentAliases[document.path] = target;
  const basename = path.basename(document.path);
  if (documentAliases[basename] && documentAliases[basename] !== target) throw new Error(`Ambiguous source document: ${basename}`);
  documentAliases[basename] = target;
}
for (const file of report.files.filter(item => item.kind === 'asset' && /\.(png|jpe?g|gif|webp|avif)$/i.test(item.path))) {
  const filename = `${file.sha256.slice(0,16)}${path.extname(file.path).toLowerCase()}`;
  const target = `assets/${filename}`;
  if (!assets.includes(target)) {
    const bytes = await fs.readFile(path.join(archive, file.path));
    if (hash(bytes) !== file.sha256) throw new Error(`Source asset changed: ${file.path}`);
    await fs.mkdir(path.join(root, 'assets'), { recursive: true });
    await fs.writeFile(path.join(root, target), bytes);
    assets.push(target);
  }
  assetAliases[file.path] = target;
  assetAliases[path.basename(file.path)] = target;
}

for (const document of report.documents.filter(item => ['knowledge','requirement'].includes(item.kind))) {
  const stem = path.basename(document.path, '.md');
  const category = document.kind === 'knowledge' ? 'knowledge' : categories[document.path.split('/')[2]] ?? 'business';
  const id = stem === '车辆控制台与车机状态对接PRD' ? 'vehicle-status' : `${category}-${hash(document.path).slice(0,10)}`;
  const file = document.kind === 'knowledge' ? `requirements/knowledge/${path.basename(document.path)}`
    : `requirements/${category}/${document.path.split('/').slice(3).join('/')}`;
  const original = await fs.readFile(path.join(archive, document.path), 'utf8');
  if (hash(original) !== document.sha256) throw new Error(`Source requirement changed: ${document.path}`);
  const referenced = pages.filter(page => original.includes(path.basename(page.path)));
  const chosen = [...new Set([...(bindings[stem] ?? []), ...referenced.map(page => page.pageKey)])];
  const links = chosen.map(key => {
    const page = pages.find(page => page.pageKey === key);
    if (!page) throw new Error(`Document binding references an unknown page: ${key}`);
    return { clientId: page.clientId, pageKey: page.pageKey };
  });
  let markdown = original.replace(/D:\\工作文件\\car-rental-enterprise/g, '企业端源码快照').replace(/D:\\工作文件\\car-rental/g, '营运端源码快照');
  markdown = markdown.replace(/(!?\[[^\]]*\]\()([^\s)]+)(\))/g, (match, prefix, href, suffix) => {
    if (/^(https?:|mailto:|#)/i.test(href)) return match;
    const [base, anchor] = href.split('#');
    let resolved;
    try { resolved = path.posix.normalize(path.posix.join(path.posix.dirname(document.path), decodeURIComponent(base))); } catch { return match; }
    const target = assetAliases[resolved] ?? (prefix.startsWith('!') ? null : documentAliases[resolved] ?? documentAliases[path.posix.basename(resolved)]);
    return target ? `${prefix}${path.posix.relative(path.posix.dirname(file), target)}${anchor ? `#${anchor}` : ''}${suffix}` : match;
  });
  await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
  await fs.writeFile(path.join(root, file), markdown);
  imported.push({ id, title: document.title, category: document.kind === 'knowledge' ? '业务知识库' : document.path.split('/')[2], status: /AI智能调度|逐页说明稿/.test(stem) ? 'planned' : 'confirmed', path: file, pages: links, source: document.path, originalHash: document.sha256, importedHash: hash(markdown) });
}

const manifest = {
  schemaVersion: 1, contentKey: 'rimo-rental', moduleKey: 'rimo-native', title: 'RIMO Rental 产品与业务知识',
  overview: 'overview.md', graph: 'graph.json',
  requirements: [
    { id: 'vehicle-groups', title: '车型组管理 · 页面说明', category: '车辆管理', status: 'draft', path: 'requirements/vehicle-groups.md', pages: [{ clientId: 'operation', pageKey: 'vehicle-groups' }] },
    { id: 'vehicle-transfer', title: '车辆调拨管理 · 页面说明', category: '车辆管理', status: 'draft', path: 'requirements/vehicle-transfer.md', pages: [{ clientId: 'operation', pageKey: 'vehicle-transfer' }] },
    { id: 'vehicle-status-excerpt', title: '车辆状态与控车 · 示例节录', category: '车辆管理', status: 'draft', path: 'requirements/vehicle-status.md', pages: [{ clientId: 'operation', pageKey: 'vehicle-console' }] },
    ...imported.map(({ source: _source, originalHash: _originalHash, importedHash: _importedHash, ...definition }) => definition),
  ], assets,
};
let authoredPages = 0;
for (const page of pages) {
  const full = `requirements/pages/${page.pageKey}.md`;
  const summary = `requirements/page-summaries/${page.pageKey}.md`;
  const exists = await Promise.all([full, summary].map(file => fs.stat(path.join(root, file)).then(stat => stat.isFile()).catch(error => {
    if (error.code === 'ENOENT') return false;
    throw error;
  })));
  if (!exists.some(Boolean)) continue;
  if (!exists.every(Boolean)) throw new Error(`Page reading material is incomplete: ${page.pageKey}`);
  const markdown = await fs.readFile(path.join(root, full), 'utf8');
  const brief = await fs.readFile(path.join(root, summary), 'utf8');
  if (!brief.trim() || brief.length > 1800) throw new Error(`Page summary must contain concise authored rules: ${page.pageKey}`);
  const title = markdown.match(/^#\s+(.+)$/m)?.[1];
  if (!title) throw new Error(`Page requirement needs an authored title: ${page.pageKey}`);
  manifest.requirements.push({ id: `page-${page.pageKey}`, title, category: `${page.clientId} · 页面需求`, status: 'draft', path: full, summary, assets: [...new Set(Object.values(page.assetMap ?? {}))], pages: [{ clientId: page.clientId, pageKey: page.pageKey }] });
  authoredPages++;
}
const overview = '# RIMO Rental\n\nRIMO Rental 面向租车营运商和企业客户，涵盖分时租赁、公务用车与门市租赁。合作通路租車券是分时租赁的跨模式功能，当前一期 PRD 仅定义同站租还。\n\n## 浏览产品\n\n营运端、企业端、移动端、公开教程和通知信件按客户端组织。页面提供模拟交互，业务逻辑以关联 PRD 和业务知识库原文为依据。\n\n## 业务资料\n\n' + imported.filter(item => item.category === '业务知识库').map(item => `- [${item.title}](${item.path})`).join('\n') + '\n\n正式 PRD 按公务车、门市租赁、分时租赁、合作通路、会员与车机接口分类。历史材料、测试执行产物和平台研发资料不作为现行业务规则发布。\n\n## 访问与 AI\n\n公开页面直接浏览；受限资料按项目和菜单授权。AI 通过项目 MCP 读取同一份知识库、PRD、需求关系和组件源码。演示页面的账号、订单和费用操作使用模拟数据，不调用真实租赁服务。\n';
await fs.writeFile(path.join(root, 'overview.md'), overview);
await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2));
await fs.writeFile(path.join(workspace, 'output/rimo-import/content.json'), JSON.stringify({ documents: imported, assets: assetAliases }, null, 2));
console.log(JSON.stringify({ documents: imported.length, assets: assets.length, requirementEntries: manifest.requirements.length, authoredPages, unstructuredPages: pages.length - authoredPages }));
