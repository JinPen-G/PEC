import { createHash } from 'node:crypto';
import { rentalFlowNodes, rentalFlowEdges } from './rimo-graph-rental.mjs';
import { contractFlowNodes, contractFlowEdges } from './rimo-graph-contracts.mjs';
import { voucherFlowNodes, voucherFlowEdges } from './rimo-graph-vouchers.mjs';
import { operationFlowNodes, operationFlowEdges } from './rimo-graph-operations.mjs';
import { telematicsFlowNodes, telematicsFlowEdges } from './rimo-graph-telematics.mjs';
import { sharingFlowNodes, sharingFlowEdges } from './rimo-graph-sharing.mjs';
import {
  lifecycleFlowNodes,
  lifecycleFlowEdges,
  lifecycleSupportingSources,
} from './rimo-graph-lifecycle.mjs';

const official = 'official-vehicles/00_全局口径与角色权限.md';
const orders = 'official-vehicles/02_公务订单管理.md';
const createOrder = 'official-vehicles/03_新增公务订单.md';
const schedule = 'official-vehicles/04_车辆调度排程.md';
const employees = 'official-vehicles/10_员工管理.md';
const employeeReview = 'official-vehicles/11_员工审核.md';
const branches = 'official-vehicles/12_分公司管理.md';
const departments = 'official-vehicles/13_部门管理.md';
const approval = 'official-vehicles/14_审批设定.md';
const stations = 'official-vehicles/17_公务车据点管理.md';

export const rimoFlowNodes = [
  {
    id: 'official-employee-eligible',
    label: '可预约公务车的员工',
    type: 'object',
    topic: 'official',
    summary: '通过企业加入审核且未停用的员工，才能进入代建公务订单的员工选择范围。',
    points: [
      [employees, '新增公务订单选择员工时，读取员工管理中的已通过且未停用员工。', 'rule'],
      [employeeReview, '审核通过后，员工加入对应分公司和部门。', 'trigger'],
    ],
  },
  {
    id: 'official-employee-disable',
    label: '员工停用边界',
    type: 'rule',
    topic: 'official',
    summary: '停用阻止新预约，不自动取消员工已有未完成订单。',
    points: [
      [employees, '员工停用后，不允许新增公务车预约。', 'trigger'],
      [employees, '员工已有未完成订单时，停用不自动取消订单，企业内部自行处理。', 'rule'],
    ],
  },
  {
    id: 'official-branch-station-access',
    label: '分公司可用据点',
    type: 'object',
    topic: 'official',
    summary: '企业授权和分公司可用范围是两层关系；员工按其所属分公司的可用据点查询车辆。',
    points: [
      [branches, '分公司员工只能在本分公司可用据点内预约车辆。', 'rule'],
      [
        stations,
        '`PLATFORM` 据点被授权给企业后，不自动开放给所有分公司；仍需企业总管理员在分公司管理中分配给具体分公司。',
        'rule',
      ],
      [
        stations,
        '`ownerBranchId` 不等同于员工可用范围。员工能否使用据点，以分公司可用据点关系为准。',
        'rule',
      ],
    ],
  },
  {
    id: 'official-branch-disable',
    label: '分公司停用边界',
    type: 'rule',
    topic: 'official',
    summary: '停用分公司阻止其员工新建公务订单，已有订单不自动取消。',
    points: [
      [branches, '分公司停用后，不允许该分公司员工创建新公务车订单。', 'trigger'],
      [branches, '分公司停用不自动取消历史订单和未完成订单。', 'rule'],
      [branches, '分公司已有员工、订单、车辆、账单时，不允许物理删除。', 'rule'],
    ],
  },
  {
    id: 'official-department-scope',
    label: '部门车辆使用范围',
    type: 'rule',
    topic: 'official',
    summary: '按部门配置的车辆使用范围由该部门员工继承，部门停用不改历史快照。',
    points: [
      [departments, '用车管理按部门配置时，部门下新增员工自动继承该部门车辆使用范围。', 'trigger'],
      [departments, '部门停用后，不允许新员工归入该部门。', 'rule'],
      [departments, '停用部门不自动调整历史员工、订单和统计快照。', 'rule'],
    ],
  },
  {
    id: 'official-station-source',
    label: '公务车据点来源',
    type: 'object',
    topic: 'official',
    summary: '平台授权据点和企业自建据点共用数据底座，通过来源字段区分管理方和车辆范围。',
    points: [
      [
        stations,
        '本期使用同一套据点数据底座，不拆成两套据点表。系统通过据点来源字段区分平台授权据点和企业自建据点。',
        'rule',
      ],
      [stations, '企业端对平台授权据点只读。', 'rule'],
      [stations, '`ENTERPRISE` 据点不得被其他企业查看、选择或使用。', 'rule'],
    ],
  },
  {
    id: 'official-site-authorization',
    label: '平台据点授权给企业',
    type: 'process',
    topic: 'official',
    summary: '营运端开启公务车服务并关联企业；企业管理员再分配给具体分公司。',
    points: [
      [stations, '营运端在公务车服务能力配置中关联企业客户 `corporateIds`。', 'rule'],
      [stations, '被关联企业可在企业端“平台授权据点”tab 查看该据点。', 'trigger'],
      [stations, '平台授权据点是否开放给某个分公司，仍由企业总管理员在分公司管理中配置。', 'rule'],
    ],
  },
  {
    id: 'official-site-source-match',
    label: '车辆与据点来源匹配',
    type: 'rule',
    topic: 'official',
    summary: '企业自有车只进入企业自建据点，营运方车辆只进入平台授权据点。',
    points: [
      [stations, '企业自有车辆选择所在据点时，只能选择 `ENTERPRISE` 据点。', 'rule'],
      [stations, '营运方提供车辆选择所在据点时，只能选择 `PLATFORM` 据点。', 'rule'],
      [stations, '企业端不可编辑营运方车辆所在据点。', 'rule'],
    ],
  },
  {
    id: 'official-station-disable',
    label: '据点停用与既有预约',
    type: 'rule',
    topic: 'official',
    summary: '停用据点不再参与新预约，既有预约继续按原订单快照展示。',
    points: [
      [stations, '停用后，车辆仍可保留在该据点资料中，但不得作为新预约可用车辆展示。', 'trigger'],
      [stations, '停用不自动取消已创建预约。', 'rule'],
      [stations, '已创建预约继续按订单快照展示原据点信息。', 'rule'],
    ],
  },
  {
    id: 'official-vehicle-availability',
    label: '公务车预约可用性',
    type: 'rule',
    topic: 'official',
    summary: '同时检查车辆启用上架、管控、员工据点范围、时间冲突、专用范围及有效配额；提交时重新校验。',
    points: [
      [createOrder, '车辆启用且上架。', 'rule'],
      [createOrder, '车辆未被管控。', 'rule'],
      [createOrder, '车辆所在据点属于员工所属分公司可用据点。', 'rule'],
      [createOrder, '车辆在预约时间段内没有排程冲突。', 'rule'],
      [createOrder, '车辆符合用车管理中的员工 / 部门使用范围限制。', 'rule'],
      [createOrder, '车辆如需合约配额，必须存在有效配额。', 'rule'],
      [createOrder, '提交时系统重新校验车辆是否仍可预约。', 'trigger'],
    ],
  },
  {
    id: 'official-quota-expired',
    label: '合约到期或配额失效',
    type: 'state',
    topic: 'contracts',
    summary: '失效后关闭新预约，已预约订单保留，不自动取消。',
    points: [
      [official, '车辆合约到期或配额失效后，不开放新预约；已预约订单保留，由企业内部自行处理。', 'trigger'],
    ],
  },
  {
    id: 'official-change-employee',
    label: '更换员工重置用车资料',
    type: 'process',
    topic: 'official',
    summary: '更换员工会重置据点、车款、车牌、目的地、事由和时间，防止沿用旧员工范围。',
    points: [
      [
        createOrder,
        '更换员工后，系统清空取车据点、预定车款、车牌号、目的地、用车事由和预约时间，避免沿用旧员工的数据范围。',
        'trigger',
      ],
    ],
  },
  {
    id: 'official-order-pending',
    label: '公务订单待审批',
    type: 'state',
    topic: 'official',
    summary: '员工所属分公司开启预约审批时，提交后进入待审批；该状态不能直接当成最终有效预约。',
    points: [
      [createOrder, '员工所属分公司开启预约审批时，订单创建后进入待审批。', 'trigger'],
      [
        approval,
        '待审批订单不应被视为最终有效预约，除非当前实现已明确采用提交即暂占车辆；如采用暂占，需在订单状态和排程中明确标识。',
        'rule',
      ],
    ],
  },
  {
    id: 'official-order-reserved',
    label: '公务订单已预约',
    type: 'state',
    topic: 'official',
    summary: '无需审批的提交或审批通过后形成有效预约，并占用车辆排程。',
    points: [
      [createOrder, '员工所属分公司未开启预约审批时，订单创建后直接进入已预约。', 'trigger'],
      [approval, '审批通过后订单进入已预约，并占用车辆排程。', 'trigger'],
    ],
  },
  {
    id: 'official-order-in-use',
    label: '公务订单用车中',
    type: 'state',
    topic: 'official',
    summary: '开始用车后，以实际取车时间作为占用起点。',
    points: [
      [orders, '| 用车中 | 已到取车流程并开始用车 | 查看详情 |', 'trigger'],
      [schedule, '| 用车中 | 实际取车时间 | 预约还车时间 |', 'rule'],
    ],
  },
  {
    id: 'official-order-completed',
    label: '公务订单已完成',
    type: 'state',
    topic: 'official',
    summary: '完成还车后保留实际取还时间和历史排程。',
    points: [
      [orders, '| 已完成 | 已完成还车 | 查看详情 |', 'trigger'],
      [schedule, '已完成订单按实际取还车时间保留历史排程。', 'rule'],
    ],
  },
  {
    id: 'official-order-rejected',
    label: '公务订单已驳回',
    type: 'state',
    topic: 'official',
    summary: '审批驳回形成终结状态，不占用车辆排程。',
    points: [[approval, '审批驳回后订单进入已驳回，不占用车辆排程。', 'trigger']],
  },
  {
    id: 'official-order-cancelled',
    label: '公务订单已取消',
    type: 'state',
    topic: 'official',
    summary: '取消后保留订单历史，但不占用车辆。',
    points: [
      [orders, '| 已取消 | 订单被取消 | 查看详情 |', 'trigger'],
      [schedule, '已取消和已驳回订单不占用车辆。', 'rule'],
    ],
  },
  {
    id: 'official-review-approved',
    label: '公务预约审批通过',
    type: 'process',
    topic: 'official',
    summary: '审批通过将订单变为已预约，进入车辆占用排程，并通知员工。',
    points: [
      [approval, '审批通过后订单进入已预约，并占用车辆排程。', 'trigger'],
      [approval, '审批通过或驳回后，通知预约员工。', 'rule'],
    ],
  },
  {
    id: 'official-review-rejected',
    label: '公务预约审批驳回',
    type: 'process',
    topic: 'official',
    summary: '审批驳回后不占车辆，并通知员工。',
    points: [
      [approval, '审批驳回后订单进入已驳回，不占用车辆排程。', 'trigger'],
      [approval, '审批通过或驳回后，通知预约员工。', 'rule'],
    ],
  },
  {
    id: 'official-schedule-active',
    label: '公务车有效占用区间',
    type: 'object',
    topic: 'official',
    summary: '已预约和用车中占用车辆；时间冲突判断依该排程进行，不以当前车辆名称代替历史依据。',
    points: [
      [schedule, '已预约和用车中订单占用车辆排程。', 'rule'],
      [schedule, '| 已预约 / 待开始 | 预约取车时间 | 预约还车时间 |', 'rule'],
      [schedule, '| 用车中 | 实际取车时间 | 预约还车时间 |', 'rule'],
    ],
  },
  {
    id: 'official-schedule-history',
    label: '公务车历史排程',
    type: 'object',
    topic: 'official',
    summary: '完成订单按实际取还时间保留历史，当前车辆调拨、改名和停用不改写历史排程。',
    points: [
      [schedule, '已完成订单按实际取还车时间保留历史排程。', 'rule'],
      [schedule, '历史排程展示读取订单快照，不受车辆后续调拨、改名、停用影响。', 'rule'],
    ],
  },
  {
    id: 'official-return-early',
    label: '公务车提前还车',
    type: 'process',
    topic: 'official',
    summary: '提前还车使用实际还车时间结束占用，不再占到原预计还车时间。',
    points: [[schedule, '提前还车后，时间轴结束时间使用实际还车时间，避免继续显示车辆被占用。', 'trigger']],
  },
  {
    id: 'official-order-snapshot',
    label: '公务订单创建快照',
    type: 'object',
    topic: 'official',
    summary: '创建时固定员工、车辆、据点、时间和审批规则，历史展示不跟随主数据回写。',
    points: [
      [createOrder, '订单创建后保存员工、车辆、据点、预约时间、目的地、用车事由和审批规则快照。', 'trigger'],
      [orders, '历史订单中的员工、车辆、据点、审批结果按订单快照展示。', 'rule'],
    ],
  },
];

export const rimoFlowEdges = [
  [
    'feature-enterprise-employee-review',
    'official-employee-eligible',
    'triggers',
    '审核通过建立员工身份',
    employeeReview,
    '审核通过后，员工加入对应分公司和部门。',
  ],
  [
    'official-employee-eligible',
    'feature-enterprise-official-order-add',
    'provides_data',
    '提供已通过且启用员工',
    employees,
    '新增公务订单选择员工时，读取员工管理中的已通过且未停用员工。',
  ],
  [
    'official-employee-disable',
    'feature-enterprise-official-order-add',
    'constrains',
    '停用阻止新预约',
    employees,
    '员工停用后，不允许新增公务车预约。',
  ],
  [
    'feature-enterprise-branch-company-management',
    'official-branch-station-access',
    'provides_data',
    '配置分公司可用据点',
    stations,
    '分公司可用据点仍在分公司管理中配置。',
  ],
  [
    'official-site-authorization',
    'official-branch-station-access',
    'precedes',
    '授权企业后再分配分公司',
    stations,
    '`PLATFORM` 据点被授权给企业后，不自动开放给所有分公司；仍需企业总管理员在分公司管理中分配给具体分公司。',
  ],
  [
    'official-branch-station-access',
    'official-vehicle-availability',
    'constrains',
    '仅查询员工可用据点车辆',
    createOrder,
    '车辆所在据点属于员工所属分公司可用据点。',
  ],
  [
    'official-department-scope',
    'official-vehicle-availability',
    'constrains',
    '校验员工及部门专用范围',
    createOrder,
    '车辆符合用车管理中的员工 / 部门使用范围限制。',
  ],
  [
    'feature-enterprise-department-management',
    'official-department-scope',
    'provides_data',
    '新增员工继承部门用车范围',
    departments,
    '用车管理按部门配置时，部门下新增员工自动继承该部门车辆使用范围。',
  ],
  [
    'official-branch-disable',
    'feature-enterprise-official-order-add',
    'constrains',
    '停用分公司不得新建订单',
    branches,
    '分公司停用后，不允许该分公司员工创建新公务车订单。',
  ],
  [
    'official-station-disable',
    'official-vehicle-availability',
    'constrains',
    '停用据点不提供新预约车辆',
    stations,
    '停用后，车辆仍可保留在该据点资料中，但不得作为新预约可用车辆展示。',
  ],
  [
    'official-site-source-match',
    'feature-enterprise-official-vehicle-add',
    'constrains',
    '企业自有车只选企业自建据点',
    stations,
    '企业端新增或编辑企业自有车辆时，所在据点下拉只展示当前企业可用的 `ENTERPRISE` 据点。',
  ],
  [
    'official-site-source-match',
    'feature-enterprise-official-vehicles',
    'constrains',
    '企业端不可改营运车辆据点',
    stations,
    '企业端不可编辑营运方车辆所在据点。',
  ],
  [
    'official-quota-expired',
    'official-vehicle-availability',
    'constrains',
    '失效后关闭新预约',
    official,
    '车辆合约到期或配额失效后，不开放新预约；已预约订单保留，由企业内部自行处理。',
  ],
  [
    'official-vehicle-availability',
    'feature-enterprise-official-order-add',
    'constrains',
    '提交时重新校验可预约性',
    createOrder,
    '提交时系统重新校验车辆是否仍可预约。',
  ],
  [
    'official-change-employee',
    'official-vehicle-availability',
    'triggers',
    '更换员工重算可选车辆',
    createOrder,
    '选择员工后，可用据点和车辆范围按员工所属分公司重新计算。',
  ],
  [
    'feature-enterprise-official-order-add',
    'official-order-pending',
    'triggers',
    '提交且开启审批',
    createOrder,
    '员工所属分公司开启预约审批时，订单创建后进入待审批。',
  ],
  [
    'feature-enterprise-official-order-add',
    'official-order-reserved',
    'triggers',
    '提交且无需审批',
    createOrder,
    '员工所属分公司未开启预约审批时，订单创建后直接进入已预约。',
  ],
  [
    'official-order-pending',
    'official-review-approved',
    'precedes',
    '待审批时可通过',
    orders,
    '| 待审批 | 员工或管理员提交订单，且员工所属分公司开启预约审批 | 审批通过、驳回、取消 |',
  ],
  [
    'official-order-pending',
    'official-review-rejected',
    'precedes',
    '待审批时可驳回',
    orders,
    '| 待审批 | 员工或管理员提交订单，且员工所属分公司开启预约审批 | 审批通过、驳回、取消 |',
  ],
  [
    'official-order-pending',
    'official-order-cancelled',
    'precedes',
    '待审批时可取消',
    orders,
    '| 待审批 | 员工或管理员提交订单，且员工所属分公司开启预约审批 | 审批通过、驳回、取消 |',
  ],
  [
    'official-order-reserved',
    'official-order-cancelled',
    'precedes',
    '已预约时可取消',
    orders,
    '| 已预约 | 无需审批直接创建成功，或审批通过后生效 | 取消、查看详情 |',
  ],
  [
    'official-review-approved',
    'official-order-reserved',
    'triggers',
    '通过后进入已预约',
    approval,
    '审批通过后订单进入已预约，并占用车辆排程。',
  ],
  [
    'official-review-rejected',
    'official-order-rejected',
    'triggers',
    '驳回后不占车辆',
    approval,
    '审批驳回后订单进入已驳回，不占用车辆排程。',
  ],
  [
    'official-order-reserved',
    'official-schedule-active',
    'provides_data',
    '预约时间形成占用',
    schedule,
    '| 已预约 / 待开始 | 预约取车时间 | 预约还车时间 |',
  ],
  [
    'official-order-in-use',
    'official-schedule-active',
    'provides_data',
    '实际取车作为占用起点',
    schedule,
    '| 用车中 | 实际取车时间 | 预约还车时间 |',
  ],
  [
    'official-order-completed',
    'official-schedule-history',
    'provides_data',
    '实际取还时间保留历史',
    schedule,
    '已完成订单按实际取还车时间保留历史排程。',
  ],
  [
    'official-order-cancelled',
    'official-schedule-active',
    'constrains',
    '已取消不计入占用',
    schedule,
    '已取消和已驳回订单不占用车辆。',
  ],
  [
    'official-order-rejected',
    'official-schedule-active',
    'constrains',
    '已驳回不计入占用',
    schedule,
    '已取消和已驳回订单不占用车辆。',
  ],
  [
    'official-return-early',
    'official-schedule-active',
    'triggers',
    '按实际还车结束占用',
    schedule,
    '提前还车后，时间轴结束时间使用实际还车时间，避免继续显示车辆被占用。',
  ],
  [
    'official-schedule-active',
    'official-vehicle-availability',
    'constrains',
    '冲突时间不可预约',
    createOrder,
    '车辆在预约时间段内没有排程冲突。',
  ],
  [
    'official-schedule-active',
    'feature-enterprise-dispatch-schedule',
    'provides_data',
    '展示有效占用',
    schedule,
    '已预约和用车中订单占用车辆排程。',
  ],
  [
    'official-schedule-history',
    'feature-enterprise-dispatch-schedule',
    'provides_data',
    '展示历史实际区间',
    schedule,
    '已完成订单按实际取还车时间保留历史排程。',
  ],
  [
    'feature-enterprise-official-order-add',
    'official-order-snapshot',
    'provides_data',
    '创建时保存业务快照',
    createOrder,
    '订单创建后保存员工、车辆、据点、预约时间、目的地、用车事由和审批规则快照。',
  ],
  [
    'official-order-snapshot',
    'feature-enterprise-official-order',
    'provides_data',
    '历史订单读取创建快照',
    orders,
    '历史订单中的员工、车辆、据点、审批结果按订单快照展示。',
  ],
  [
    'official-order-snapshot',
    'official-schedule-history',
    'provides_data',
    '历史排程不跟随主数据改写',
    schedule,
    '历史排程展示读取订单快照，不受车辆后续调拨、改名、停用影响。',
  ],
];

export function appendRimoFlowGraph({ nodes, edges, resolveEvidence }) {
  for (const definition of [
    ...rimoFlowNodes,
    ...rentalFlowNodes,
    ...contractFlowNodes,
    ...voucherFlowNodes,
    ...operationFlowNodes,
    ...telematicsFlowNodes,
    ...sharingFlowNodes,
    ...lifecycleFlowNodes,
  ]) {
    const existing = nodes.find((node) => node.id === definition.id);
    if (existing && definition.id !== 'official-station-source')
      throw new Error(`Duplicate authored flow node: ${definition.id}`);
    const evidence = definition.points.map(([document, quote]) => resolveEvidence(document, quote));
    const node = {
      id: definition.id,
      label: definition.label,
      type: definition.type,
      summary: definition.summary,
      aliases: [],
      topics: definition.topics ?? [definition.topic],
      primaryTopic: definition.topic,
      status: 'active',
      requirements: [...new Set(evidence.map((item) => item.requirementId))],
      evidence,
      keyPoints: definition.points.map(([, quote, kind, text], index) => ({
        kind,
        text:
          text ??
          quote
            .replace(/`/g, '')
            .replace(/^\|\s*|\s*\|$/g, '')
            .replace(/\s*\|\s*/g, ' · '),
        evidence: [index],
      })),
      coverage: existing?.coverage ?? 'none',
      prototypes: existing?.prototypes ?? [],
    };
    if (existing) Object.assign(existing, node);
    else nodes.push(node);
  }
  for (const [source, target, relation, label, document, quote] of [
    ...rimoFlowEdges,
    ...rentalFlowEdges,
    ...contractFlowEdges,
    ...voucherFlowEdges,
    ...operationFlowEdges,
    ...telematicsFlowEdges,
    ...sharingFlowEdges,
    ...lifecycleFlowEdges,
  ]) {
    if (![source, target].every((id) => nodes.some((node) => node.id === id)))
      throw new Error(`Missing authored flow endpoint: ${source} -> ${target}`);
    const id = `flow-${createHash('sha256').update(`${source}/${relation}/${target}`).digest('hex').slice(0, 16)}`;
    if (edges.some((edge) => edge.id === id)) throw new Error(`Duplicate authored flow relation: ${id}`);
    edges.push({
      id,
      source,
      target,
      relation,
      label,
      reason: quote,
      basis: 'explicit',
      status: 'active',
      evidence: [resolveEvidence(document, quote)],
    });
  }
  const supportingSources = [
    ...lifecycleSupportingSources,
    [
      'feature-vehicle-groups',
      'requirements/vehicle-groups.md',
      '管理不同载具类型的车组基础资料，为车辆建档和车型展示提供品牌、型号、规格及特性信息。',
    ],
    [
      'feature-vehicle-transfer',
      'requirements/vehicle-transfer.md',
      '本页面不执行真实车机命令、不迁移车辆资产归属、不共享库存，也不建立真实订单。',
    ],
    [
      'feature-vehicle-console',
      'requirements/vehicle-status.md',
      '页面每分钟重新判断一次资料逾时状态。新资料入库后立即重新计算。',
    ],
    [
      'feature-enterprise-dashboard',
      'official-vehicles/01_Dashboard.md',
      '车辆数和使用率按资产归属统计；本月订单次数、用车时长按员工所属分公司统计。',
    ],
    [
      'official-order-snapshot',
      'official-vehicles/16_数据快照与验收标准.md',
      '公务车后台涉及订单、车辆、合约、账单和提醒记录时，历史展示必须读取快照，不允许被当前主数据反向覆盖。',
    ],
    [
      'store-accident',
      'store-rental/订单/事故出险处理.md',
      '`completed` 后补录的事故费用进入追缴费用，不改变订单主状态。',
    ],
    [
      'feature-order-detail',
      'store-rental/订单/订单详情.md',
      '详情页不单独定义各子流程的业务规则，子流程规则以取车、还车、延长用车、改派、取消与关闭订单、费用管理等专项文档为准。',
    ],
    [
      'feature-store-orders',
      'store-rental/订单/门市租车订单列表.md',
      '列表需要在一屏内同时呈现订单主状态、派车状态、支付状态、追缴状态和风险标记，帮助门店员工快速判断下一步处理动作。',
    ],
  ];
  for (const [nodeId, document, quote] of supportingSources) {
    const node = nodes.find((item) => item.id === nodeId);
    if (!node) throw new Error(`Missing supporting source node: ${nodeId}`);
    const proof = resolveEvidence(document, quote);
    if (!node.requirements.includes(proof.requirementId)) node.requirements.push(proof.requirementId);
    if (
      !node.evidence.some((item) => item.requirementId === proof.requirementId && item.quote === proof.quote)
    )
      node.evidence.push(proof);
  }
}
