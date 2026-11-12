import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NATIVE_MODULES } from '../packages/platform-contracts/src/platform.js';
import {
  loadContentPackage,
  loadPrototypeRevisions,
} from '../packages/project-core/src/platform/project-content.js';
import {
  graphHash,
  validateRequirementGraph,
} from '../packages/project-core/src/platform/requirement-graph.js';
import { graphHeadingId } from '../packages/project-shared/src/requirement-graph.js';
import { writeFileAtomic } from '../packages/project-core/src/filesystem.js';
import { appendRimoFlowGraph } from './rimo-graph-flows.mjs';
import { rimoGraphTopics, applyRimoGraphCategories } from './rimo-graph-categories.mjs';
import { rimoGraphQuote } from './rimo-graph-evidence.mjs';
import { focusRimoGraph } from './rimo-graph-focus.mjs';
import { rimoTelemetryCore } from './rimo-graph-telemetry-core.mjs';

const workspace = fileURLToPath(new URL('..', import.meta.url));
const root = path.join(workspace, 'project-content/rimo-rental');
const snapshot = await loadContentPackage(
  path.join(workspace, 'project-content'),
  'rimo-rental',
  NATIVE_MODULES,
);
const pages = JSON.parse(await fs.readFile(path.join(workspace, 'output/rimo-import/pages.json'), 'utf8'));
const existing = JSON.parse(snapshot.files.get('graph.json'));
const backup = path.join(workspace, '.preview-data/archives/rimo-rental/2026-11-09/graph-before-import.json');
if (!(await fs.stat(backup).catch(() => null)))
  await writeFileAtomic(backup, JSON.stringify(existing, null, 2));
const revisions = await loadPrototypeRevisions({
  moduleCatalog: NATIVE_MODULES,
  moduleKey: 'rimo-native',
  pageSourceRoot: workspace,
});
const documents = snapshot.manifest.requirements;
const source = (document) => snapshot.files.get(document.path).toString('utf8');
const find = (suffix) => {
  const matches = documents.filter((document) => document.path.endsWith(suffix));
  if (matches.length !== 1) throw new Error(`Ambiguous graph source: ${suffix}`);
  return matches[0];
};
const evidence = (document, quote) => {
  const markdown = source(document);
  let match;
  try {
    match = rimoGraphQuote(markdown, quote);
  } catch {
    throw new Error(`Graph quote missing from ${document.path}: ${quote}`);
  }
  const { position } = match;
  const headings = [...markdown.slice(0, position).matchAll(/^#{1,6}\s+(.+)$/gm)];
  if (!headings.length) throw new Error(`Graph quote has no section: ${document.path}`);
  return {
    requirementId: document.id,
    anchor: graphHeadingId(headings.at(-1)[1]),
    quote: match.quote,
    revision: graphHash(snapshot.files.get(document.path)),
  };
};
const paragraph = (document) => {
  let historical = false;
  let fenced = false;
  for (const line of source(document).split('\n')) {
    if (/^```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      historical = /版本|更新|历史/.test(line);
      continue;
    }
    if (fenced || historical || !line.trim() || /^[|#>]/.test(line)) continue;
    const value = line.replace(/^\s*(?:[-*]|\d+\.)\s+/, '').trim();
    if (
      value.length >= 14 &&
      !/^(`|原型页面|对应原型|关联原型|页面文件|本文档?|本文件|读取顺序|适用客户端|适用角色)/.test(value)
    )
      return value.slice(0, 500);
  }
  throw new Error(`Graph source needs an authored excerpt: ${document.path}`);
};

const topics = rimoGraphTopics;
const topicFor = (page) => {
  const key = page.pageKey;
  if (['email', 'public'].includes(page.clientId)) return 'notifications';
  if (key.includes('channel-ticket')) return 'vouchers';
  if (key.includes('contract') || key.includes('official-car-bill')) return 'contracts';
  if (/dashboard|war-room|workbench/.test(key)) return 'insights';
  if (/login|permission|^employees$|system-rules/.test(key)) return 'platform';
  if (page.clientId === 'enterprise' && !key.includes('time-share')) return 'official';
  if (/member|corporate/.test(key)) return 'members';
  if (/time-share|new-order-(same|one)/.test(key)) return 'time-share';
  if (/vehicle-console|vehicle-status/.test(key)) return 'vehicle-operations';
  if (key === 'tbox-management') return 'telematics';
  if (/^vehicle|stations|stores|rental-companies/.test(key)) return 'fleet';
  if (/pricing|service|marketing/.test(key)) return 'pricing';
  if (key === 'dispatch') return 'dispatch';
  return 'store-rental';
};
const shared = new Map([
  ...['tutorial', 'tutorial-index', 'tutorial-documentation', 'tutorial-editor'].map((key) => [
    key,
    ['official-guide', '公务车教程与维护'],
  ]),
  ...['permissions', 'permissions-grouped'].map((key) => [key, ['business-roles', '业务角色权限']]),
  ...['corporate-login', 'enterprise-corporate-login'].map((key) => [
    key,
    ['enterprise-login', '企业后台登录'],
  ]),
]);
const features = new Map();
const pageNodes = new Map();
for (const page of pages) {
  const [key, label] = shared.get(page.pageKey) ?? [page.pageKey, page.title];
  const id = `feature-${key}`;
  const document = find(`requirements/pages/${page.pageKey}.md`);
  const quote = paragraph(document);
  const topic = topicFor(page);
  if (!features.has(id))
    features.set(id, {
      id,
      label,
      type: 'feature',
      summary: quote,
      aliases: [],
      topics: [topic],
      primaryTopic: topic,
      status: 'active',
      requirements: [],
      evidence: [],
      keyPoints: [],
      coverage: 'partial',
      prototypes: [],
    });
  const node = features.get(id);
  node.requirements.push(document.id);
  node.evidence.push(evidence(document, quote));
  if (label !== page.title && !node.aliases.includes(page.title)) node.aliases.push(page.title);
  if (!revisions[page.pageKey]) throw new Error(`Unregistered prototype revision: ${page.pageKey}`);
  node.prototypes.push({
    clientId: page.clientId,
    pageKey: page.pageKey,
    anchor: '',
    target: page.title,
    revision: revisions[page.pageKey],
  });
  pageNodes.set(page.pageKey, id);
}

const rules = [];
const rule = (id, label, topic, suffix, quote, type = 'rule') => {
  const document = find(suffix);
  rules.push({
    id,
    label,
    type,
    summary: quote,
    aliases: [],
    topics: [topic],
    primaryTopic: topic,
    status: 'active',
    requirements: [document.id],
    evidence: [evidence(document, quote)],
    keyPoints: [{ kind: 'rule', text: quote.length <= 300 ? quote : label, evidence: [0] }],
    coverage: 'none',
    prototypes: [],
  });
};
const global = 'knowledge/RIMO租赁平台业务全局说明.md';
const voucher = 'channel-tickets/合作渠道租车券（同站租还）.md';
const scope = 'store-rental/门市租赁调度边界与履约规则.md';
const dispatch = 'store-rental/智能调度派车规则.md';
const official = 'official-vehicles/00_全局口径与角色权限.md';
const contract = 'official-vehicles/07_营运端公务车辆合约管理.md';
const quota = 'official-vehicles/08_合约配额管理.md';
const maintenance = 'official-vehicles/18_清洁保养提醒.md';
const price = 'store-rental/基础产品定价（车组）.md';
const identity = 'members/会员资质认证审核.md';
const usage = 'official-vehicles/01A_Dashboard使用率统计与明细.md';
const organization = 'store-rental/车行与门市管理.md';

rule('tenant-identity', '租户与营运商', 'platform', global, '当前一个租户对应一个营运商主体。', 'object');
rule(
  'member-enterprise-identity',
  '会员与企业身份',
  'members',
  global,
  '用户注册后默认为个人会员。',
  'object',
);
rule(
  'enterprise-service-access',
  '企业签约服务范围',
  'members',
  global,
  '企业签约服务类型控制员工能否使用企业身份预约对应服务。',
);
rule(
  'member-vehicle-qualification',
  '会员可用载具类型',
  'members',
  identity,
  '驾驶执照审核通过时，将选择结果写入会员资料。',
);
rule(
  'review-overall-result',
  '四项审核整体结果',
  'members',
  identity,
  '整体审核结果由四项结果自动计算，不提供独立的整体“通过 / 不通过”选择。',
);
rule(
  'review-high-risk',
  '高风险不可复审',
  'members',
  identity,
  '高风险会员不允许重新提交审核申请，不允许营运人员再次审核。',
);
rule(
  'site-organization',
  '车行、门市与据点层级',
  'fleet',
  organization,
  '一个门市只能属于一个车行，可以建立多个据点。',
  'object',
);
rule(
  'site-parent-status',
  '上级停用与下级业务',
  'fleet',
  organization,
  '上级停用期间，下级即使自身为启用，也不得参与新业务。',
);
rule(
  'site-restore-status',
  '上级恢复不改下级状态',
  'fleet',
  organization,
  '上级重新启用后，系统重新按下级自身状态和服务能力判断，不自动把已暂停或停用的下级改为启用。',
);
rule(
  'station-capability',
  '实体据点与服务能力',
  'fleet',
  'store-rental/服务站点管理.md',
  '一个实体据点可以同时具备多个服务能力',
  'object',
);
rule(
  'asset-location',
  '车辆资产与当前位置',
  'fleet',
  scope,
  '普通调度、还车归位、门店备车和车辆位置调整只改变车辆当前位置，不改变车辆资产所属车行。',
);
rule(
  'dealer-dispatch-boundary',
  '同车行履约边界',
  'dispatch',
  scope,
  '本期不支持跨车行自动派车、跨车行人工改派、跨车行改还车门市、跨车行转单、跨车行还车、跨车行车辆调拨和跨车行库存共享。',
);
rule(
  'vehicle-state-axes',
  '四条独立状态轴',
  'dispatch',
  scope,
  '门市租赁调度必须同时判断以下四条独立状态轴线，不能将其视为同一套状态机：',
);
rule(
  'group-inventory',
  '订单车组库存占用',
  'dispatch',
  dispatch,
  '每笔有效门市租赁订单固定占用 1 个车组库存名额。',
);
rule(
  'dispatch-no-double-count',
  '派车不重复扣库存',
  'dispatch',
  dispatch,
  '`pre_assigned`、`locked`、`manual_reassigned`、`upgraded` 只表示订单已经绑定具体车辆，不在车组库存层额外重复扣减。',
);
rule('dispatch-hard-lock', '发车前必须硬锁', 'dispatch', scope, '未锁定车辆时，不允许确认发车。');
rule('dispatch-human-queue', '无车进入人工调度', 'dispatch', scope, '订单主状态不自动取消。');
rule(
  'ai-dispatch-control',
  'AI 推荐须复核确认',
  'dispatch',
  'store-rental/AI智能调度分析Agent.md',
  'AI 输出结果必须经过系统解析、JSON Schema 校验、业务硬约束校验和人工确认后，才能按现有调度服务写入预分配或进入人工处理。',
);
rule(
  'price-baseline',
  '订单价格基线',
  'pricing',
  price,
  '后续车组改价或动态调价不反向改写已创建订单的基线快照。',
);
rule('price-day-hour', '门市时租转日租', 'pricing', price, '剩余计费小时达到第 5 小时起，按 1 天计费。');
rule(
  'product-mileage',
  '车型组里程规则',
  'pricing',
  price,
  '一个车型 ID 在同一时间只能属于一个有效的产品组。',
);
rule(
  'marketing-site-proof',
  '到店优惠资格核验',
  'pricing',
  'store-rental/行销方案管理.md',
  '核验未通过时，原行销方案不得继续生效，必须在取车流程内更换为客户当场符合资格的行销方案或不使用优惠。',
);
rule(
  'service-order-snapshot',
  '增值服务订单快照',
  'pricing',
  'store-rental/增值服务管理（保险&配件）.md',
  '后续增值服务主数据被修改、停用、删除、改价或调整库存规则时，不得反向改写已创建订单中的服务快照。',
);
rule(
  'pending-payment-reservation',
  '待支付库存保留',
  'store-rental',
  'store-rental/订单/新建订单.md',
  '待支付资源保留时长到期仍未完成预授权押金确认时，系统将订单置为 `cancelled`，释放车组库存和派车关系，不生成取消费。',
);
rule(
  'order-finance-status',
  '主状态与资金子状态',
  'store-rental',
  'store-rental/订单/门市租车订单状态.md',
  '派车状态、支付状态、追缴状态、风险标记不混入主状态',
);
rule(
  'extension-confirmation',
  '续租确认后变更状态',
  'store-rental',
  'store-rental/订单/延长用车.md',
  '门店打开弹窗、选择时间、查看费用或关闭弹窗时，订单不进入 `renewing`。',
);
rule(
  'extension-conflict',
  '续租后续占用校验',
  'store-rental',
  'store-rental/订单/延长用车.md',
  '当前车辆从“当前预计还车时间”到“新预计还车时间 + 订单间隔时间”之间是否存在后续订单。',
);
rule(
  'order-terminal-collection',
  '终态追缴不回退',
  'store-rental',
  'store-rental/订单/门市租车订单状态.md',
  '追缴费用不改变订单主状态，主状态保持原终态',
);
rule(
  'order-snapshot-history',
  '历史订单快照',
  'store-rental',
  'store-rental/订单/门市租车订单总索引.md',
  '历史订单展示必须使用快照中的名称和文本。',
);
rule('voucher-scope', '租车券一期服务范围', 'vouchers', voucher, '本 PRD 只定义一期同站租还实现');
rule(
  'voucher-user-identity',
  '用券人身份与费用方',
  'vouchers',
  voucher,
  '用券人仍是个人会员，不加入合作通路企业，不生成企业员工关系。',
);
rule(
  'voucher-batch-review',
  '申报通过才生成批次',
  'vouchers',
  voucher,
  '审批通过与正式批次生成必须在同一事务内完成，重复审批请求不得重复生成批次。',
);
rule(
  'voucher-identity-match',
  '证件名单匹配与去重',
  'vouchers',
  voucher,
  '证件号码比较前去除前后空格并统一英文字母大小写；标准化后相同即视为重复。',
);
rule(
  'voucher-two-statuses',
  '发放与使用双状态',
  'vouchers',
  voucher,
  '租車券的“发放 / 领取状态”和“使用状态”是两条独立状态轴。',
);
rule(
  'voucher-pause',
  '批次停用影响范围',
  'vouchers',
  voucher,
  '批次停用不是租車券状态，不回滚已发放 / 已领取记录，不取消已创建订单。',
);
rule(
  'voucher-stock-risk',
  '批次库存风险不锁车',
  'vouchers',
  voucher,
  '提醒按批次整体计算，只做参考，不锁车、不阻止保存。',
);
rule(
  'voucher-stock-capacity',
  '相关批次最大占用',
  'vouchers',
  voucher,
  '单个相关批次的分配量不得超过该批次剩余需求；单个据点的分配总量不得超过该据点可用车辆；相关批次只能分配到自身适用据点与当前批次适用据点的交集。',
);
rule(
  'voucher-period',
  '租车券取还时间边界',
  'vouchers',
  voucher,
  'APP 传入的预约还车时间必须等于批次最晚还车时间。',
);
rule(
  'voucher-one-active-order',
  '每券一笔有效订单',
  'vouchers',
  voucher,
  '同一个租車券同一时间只能关联一笔有效订单。',
);
rule(
  'voucher-overlapping-orders',
  '不同券可建立重叠订单',
  'vouchers',
  voucher,
  '同一会员账号可使用不同未使用租車券，创建多笔时间重叠的租車券订单。',
);
rule(
  'voucher-user-zero-payment',
  '用券人应付为零',
  'vouchers',
  voucher,
  '用券人应付固定为 0，不发起个人预授权、支付、补款或退款，也不因未付款阻断还车。',
);
rule(
  'official-asset-owner',
  '公务车资产管理归属',
  'official',
  official,
  '车辆资产归属分公司负责管理车辆资料、绑定合约配额、处理清洁保养提醒。',
);
rule(
  'official-order-owner',
  '公务订单员工归属',
  'official',
  official,
  '员工所属分公司决定订单归属、审批归属、统计归属。',
);
rule(
  'official-no-personal-payment',
  '公务车不向员工收费',
  'official',
  official,
  '公务车订单不发起个人支付、个人预授权、个人退款。',
);
rule(
  'official-approval',
  '分公司预约审批',
  'official',
  'official-vehicles/14_审批设定.md',
  '管理员代员工新增公务订单时，也按员工所属分公司的审批设定执行。',
);
rule(
  'official-use-scope',
  '车辆专用范围与基础规则',
  'official',
  'official-vehicles/09_用车管理.md',
  '用车范围限制不覆盖车辆启用状态、所在据点、合约配额、时间冲突等基础规则。',
);
rule(
  'official-station-source',
  '公务车据点来源',
  'official',
  'official-vehicles/17_公务车据点管理.md',
  '本期车辆与据点来源严格匹配。',
);
rule(
  'official-usage-union',
  '使用率服务与用车区间',
  'insights',
  usage,
  '有效服务区间 =（车辆上架区间 ∪ 订单实际用车区间）∩ 所选口径的计入时间',
);
rule(
  'official-usage-ratio',
  '使用率按时长加总',
  'insights',
  usage,
  '公司、分公司先加总时长再相除，不能平均各车或各分公司百分比，也不能用当前车辆数乘整月时间。',
);
rule(
  'official-usage-difference',
  '使用率同期差值',
  'insights',
  usage,
  '较上月同期 = 本月使用率 - 上月同期使用率',
);
rule('reminder-not-work-order', '清洁保养只提醒', 'official', maintenance, '本期只做提醒闭环：');
rule(
  'reminder-deduplication',
  '提醒基线与去重',
  'official',
  maintenance,
  '同一车辆、同一提醒类型只保留 1 条待处理提醒',
);
rule(
  'reminder-ignore',
  '忽略不等于完成',
  'official',
  maintenance,
  '忽略只表示本次提醒不再作为待处理提醒触达，不代表车辆已经完成保养或清洁。',
);
rule(
  'reminder-baseline',
  '登记后开启下一周期',
  'official',
  maintenance,
  '登记已保养或登记已清洁后，系统回写新基线，才进入下一轮提醒周期。',
);
rule(
  'contract-effective-time',
  '合约生效与收费期间',
  'contracts',
  contract,
  '生效时间与合约开始日期必须分别保存，不得使用同一个字段。',
);
rule(
  'contract-free-period',
  '赠送期不延长到期',
  'contracts',
  contract,
  '赠送期不延长合约结束日期。合约仍在原设定的结束日期到期。',
);
rule(
  'contract-binding-transfer',
  '换约只改变绑定',
  'contracts',
  contract,
  '转移只改变车辆的合约绑定，不改变车辆资产归属分公司、所在据点、业务状态和既有预约。',
);
rule(
  'contract-capacity-reservation',
  '换约目标容量预留',
  'contracts',
  quota,
  '同一来源仅允许一条待执行任务。',
);
rule(
  'contract-task-readonly',
  '已有换约任务只读',
  'contracts',
  quota,
  '已有任务不提供内容编辑；如需调整，必须先取消任务并释放预留，再新建任务。',
);
rule(
  'contract-transfer-atomicity',
  '车辆换约事务一致性',
  'contracts',
  contract,
  '立即转移和预约计划执行均必须在同一事务内完成目标分公司配额补足、目标预留容量释放和车辆改绑；任一步失败时全部回滚，来源分公司配额不修改。',
);
rule(
  'contract-history-retained',
  '换约不迁移旧账单',
  'contracts',
  contract,
  '来源合约已经产生的账单仍归属于来源合约，不迁移到目标合约。',
);
rule(
  'contract-billing-source',
  '公务账单来自合约',
  'contracts',
  'official-vehicles/15_账单管理.md',
  '公务车账单来自企业合约和配额，不来自单笔员工公务车订单。',
);

const telemetry = rimoTelemetryCore(quote => evidence(documents.find(document => document.id === 'vehicle-status'), quote));
const nodes = [...telemetry.nodes, ...features.values(), ...rules];
const edges = [...telemetry.edges];
const constrain = (sourceId, targets, label) => {
  const node = nodes.find((node) => node.id === sourceId);
  for (const pageKey of targets) {
    const target = pageNodes.get(pageKey) ?? pageKey;
    if (!nodes.some((node) => node.id === target)) throw new Error(`Graph target missing: ${target}`);
    edges.push({
      id: `relation-${graphHash(`${sourceId}/${target}`).slice(0, 16)}`,
      source: sourceId,
      target,
      relation: 'constrains',
      label,
      reason: node.evidence[0].quote,
      basis: 'explicit',
      status: 'active',
      evidence: [node.evidence[0]],
    });
  }
};
constrain(
  'enterprise-service-access',
  ['corporates', 'new-order-same-station', 'new-order-one-way'],
  '按企业签约服务校验',
);
constrain(
  'member-vehicle-qualification',
  ['member-review', 'member-detail', 'mobile-channel-ticket-app', 'mobile-channel-ticket-app-compatible'],
  '按载具资格处理',
);
constrain('review-overall-result', ['member-review'], '由四项结果决定');
constrain('review-high-risk', ['member-review'], '禁止高风险复审');
constrain('site-parent-status', ['stores', 'stations'], '停用期间阻断新业务');
constrain('site-restore-status', ['stores', 'stations'], '恢复后重验下级状态');
constrain('asset-location', ['vehicles', 'vehicle-transfer'], '位置不改变资产归属');
constrain('dealer-dispatch-boundary', ['dispatch', 'order-detail', 'vehicle-transfer'], '不得跨车行履约');
constrain('group-inventory', ['new-order', 'dispatch'], '每单只占一个车组名额');
constrain('dispatch-no-double-count', ['dispatch'], '绑定车牌不重复扣库存');
constrain('dispatch-hard-lock', ['order-detail', 'dispatch'], '硬锁后才可确认发车');
constrain('ai-dispatch-control', ['dispatch', 'system-rules'], '推荐须校验并确认');
constrain('price-baseline', ['pricing', 'service-products', 'order-detail'], '改价不回写订单基线');
constrain('price-day-hour', ['new-order', 'order-detail'], '按余时计费阈值');
constrain('marketing-site-proof', ['marketing', 'order-detail'], '资格不符必须换方案');
constrain('service-order-snapshot', ['services', 'order-detail'], '保留服务历史版本');
constrain('pending-payment-reservation', ['new-order', 'store-orders'], '超时释放待支付占用');
constrain('order-finance-status', ['store-orders', 'order-detail'], '状态轴独立展示');
constrain('extension-confirmation', ['order-detail'], '确认前不改续租状态');
constrain('extension-conflict', ['order-detail', 'dispatch'], '续租重验后续占用');
constrain('order-terminal-collection', ['store-orders', 'order-detail'], '追缴保留订单终态');
constrain(
  'voucher-batch-review',
  ['channel-ticket-applications', 'enterprise-channel-ticket-batches'],
  '通过与建批次同事务',
);
constrain(
  'voucher-identity-match',
  ['channel-ticket-batches', 'channel-ticket-batch-detail'],
  '标准化证件去重',
);
constrain(
  'voucher-two-statuses',
  ['channel-ticket-batch-detail', 'enterprise-channel-ticket-batch-detail'],
  '分开发放与使用状态',
);
constrain(
  'voucher-pause',
  ['channel-ticket-batches', 'mobile-channel-ticket-app', 'mobile-channel-ticket-app-compatible'],
  '停用不取消既有订单',
);
constrain(
  'voucher-stock-risk',
  ['channel-ticket-batches', 'channel-ticket-batch-detail', 'channel-ticket-applications'],
  '风险提醒不锁车',
);
constrain(
  'voucher-stock-capacity',
  ['channel-ticket-batches', 'channel-ticket-batch-detail'],
  '据点与批次容量共同约束',
);
constrain(
  'voucher-period',
  ['mobile-channel-ticket-app', 'mobile-channel-ticket-app-compatible'],
  '预约还车等于批次最晚时间',
);
constrain(
  'voucher-one-active-order',
  ['mobile-channel-ticket-app', 'mobile-channel-ticket-app-compatible'],
  '每券一笔有效订单',
);
constrain(
  'voucher-overlapping-orders',
  ['mobile-channel-ticket-app', 'mobile-channel-ticket-app-compatible'],
  '不同券允许时间重叠',
);
constrain(
  'voucher-user-zero-payment',
  ['mobile-channel-ticket-app', 'enterprise-channel-ticket-batch-detail'],
  '用券人不承担个人支付',
);
constrain(
  'official-asset-owner',
  ['enterprise-official-vehicles', 'enterprise-official-vehicle-reminders'],
  '资产分公司决定管理权',
);
constrain(
  'official-order-owner',
  ['enterprise-official-order', 'enterprise-official-order-add', 'enterprise-dashboard'],
  '员工分公司决定订单归属',
);
constrain(
  'official-no-personal-payment',
  ['enterprise-official-order-add', 'enterprise-official-car-bill'],
  '不执行个人资金流程',
);
constrain(
  'official-approval',
  ['enterprise-official-order-add', 'enterprise-approval-setting'],
  '代建遵循员工审批设定',
);
constrain(
  'official-use-scope',
  ['enterprise-car-use-management', 'enterprise-official-order-add'],
  '范围不替代基础校验',
);
constrain('official-usage-union', ['enterprise-dashboard'], '服务区间包含实际用车');
constrain('official-usage-ratio', ['enterprise-dashboard'], '合计时长后相除');
constrain('official-usage-difference', ['enterprise-dashboard'], '同期按使用率差值');
constrain('reminder-deduplication', ['enterprise-official-vehicle-reminders'], '同类型待办去重');
constrain('reminder-ignore', ['enterprise-official-vehicle-reminders'], '忽略不更新完成基线');
constrain(
  'reminder-baseline',
  ['enterprise-official-vehicle-reminders', 'enterprise-official-vehicles'],
  '登记回写车辆基线',
);
constrain(
  'contract-effective-time',
  ['official-vehicle-contracts', 'enterprise-contract-quotas'],
  '生效与收费日期分开',
);
constrain('contract-free-period', ['official-vehicle-contracts'], '赠送期不顺延到期');
constrain(
  'contract-binding-transfer',
  ['official-vehicle-contracts', 'enterprise-contract-quotas'],
  '只改合约绑定',
);
constrain(
  'contract-task-readonly',
  ['official-vehicle-contracts', 'enterprise-contract-quotas'],
  '取消后才能重建',
);
constrain(
  'contract-transfer-atomicity',
  ['official-vehicle-contracts', 'enterprise-contract-quotas'],
  '换约失败整体回滚',
);
constrain('contract-history-retained', ['enterprise-official-car-bill'], '历史账单仍归原合约');
constrain('contract-billing-source', ['enterprise-official-car-bill'], '按合约和配额计费');

appendRimoFlowGraph({ nodes, edges, resolveEvidence: (suffix, quote) => evidence(find(suffix), quote) });
applyRimoGraphCategories(nodes, documents);
const focused = focusRimoGraph({ schemaVersion: 1, topics, nodes, edges, review: existing.review });
const graph = focused.graph;
const prototypeIndex = new Map([...features.values()].flatMap(node => node.prototypes.map(page => [`${page.clientId}/${page.pageKey}`, page])));
for (const node of graph.nodes) {
  if (node.prototypes.length) continue;
  const related = documents.filter(document => node.requirements.includes(document.id)).flatMap(document => document.pages);
  node.prototypes = [...new Map(related.map(page => {
    const key = `${page.clientId}/${page.pageKey}`;
    const prototype = prototypeIndex.get(key);
    if (!prototype) throw new Error(`Graph document references an unknown prototype: ${key}`);
    return [key, prototype];
  })).values()];
  node.coverage = node.prototypes.length ? 'partial' : 'none';
}
validateRequirementGraph(graph);
await writeFileAtomic(path.join(root, 'graph.json'), `${JSON.stringify(graph, null, 2)}\n`);
await writeFileAtomic(path.join(workspace, 'output/rimo-import/graph-focus.json'), `${JSON.stringify({ mapping: focused.mapping, internalEdges: focused.internalEdges }, null, 2)}\n`);
const unrepresented = documents
  .filter((document) => !nodes.some((node) => node.requirements.includes(document.id)))
  .map((document) => document.path);
console.log(
  JSON.stringify({
    topics: topics.length,
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    authoredNodes: nodes.length,
    authoredEdges: edges.length,
    requirements: documents.length,
    prototypes: pages.length,
    unrepresented,
    reviewed: false,
  }),
);
