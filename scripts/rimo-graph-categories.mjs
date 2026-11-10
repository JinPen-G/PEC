export const rimoGraphTopics = [
  ['same-station', '同站租还', '按具体车辆预约，同一据点取还车、计费与结算。', 'business'],
  ['one-way', '甲租乙还', '不同据点取还车、可还车位、地区费用与订单。', 'business'],
  ['store-rental', '门市租赁', '按车组预约、派车、人工及自助取还、结算与异常。', 'business'],
  ['official', '公务车', '员工预约、审批、企业车辆、配额与合约账单。', 'business'],
  ['vouchers', '租车券专项', '企业申报、批次、发放领取、用券预约和费用归属。', 'business'],
  ['fleet', '车辆管理', '车辆资产、车组、车机资料、控车与车况。', 'management'],
  ['sites', '车行、门市与据点', '组织层级、物理据点、服务能力及经营范围。', 'management'],
  ['members', '会员与企业', '会员审核、载具资格、企业身份与签约服务。', 'management'],
  ['dispatch', '车辆调度', '候选池、评分、预分配、硬锁和人工改派。', 'management'],
  ['pricing', '价格与行销', '标准价、行销方案、增值服务及规则快照。', 'management'],
  ['contracts', '合约与配额', '合约生效、配额分配、换约任务和账单。', 'management'],
  ['insights', '统计与工作台', '使用率、运营指标、统计范围和待办。', 'management'],
  ['notifications', '通知与教程', '账号通知、业务提醒和操作指引。', 'management'],
  ['platform', '账号与权限', '租户识别、登录、角色和管理范围。', 'management'],
].map(([id, label, description, category]) => ({ id, label, description, category }));

const stationNodes = new Set([
  'feature-rental-companies',
  'feature-stores',
  'feature-stations',
  'site-organization',
  'site-parent-status',
  'site-restore-status',
  'station-capability',
  'fleet-dealer',
  'fleet-store',
  'fleet-station',
  'station-service-status',
  'station-shared-capacity',
  'station-public-scope',
  'store-business-availability',
  'sharing-return-capacity',
]);
const sharedRentalNodes = new Set([
  'feature-time-share-orders',
  'feature-enterprise-time-share-orders',
  'sharing-company-selfpay',
  'sharing-enterprise-readonly',
  'sharing-stats-scope',
  'sharing-stats-perspective',
]);
const oneWayNodes = new Set([
  'sharing-one-way',
  'sharing-return-capacity',
  'sharing-regional-fee',
  'feature-new-order-one-way',
]);
const sameStationNodes = new Set(['sharing-same-station', 'feature-new-order-same-station']);

export function applyRimoGraphCategories(nodes, documents) {
  const documentPaths = new Map(documents.map((document) => [document.id, document.path]));
  for (const node of nodes) {
    const normalize = (topic) =>
      topic === 'time-share'
        ? oneWayNodes.has(node.id)
          ? 'one-way'
          : 'same-station'
        : ['telematics', 'vehicle-operations'].includes(topic)
          ? 'fleet'
          : topic;
    const topics = new Set(node.topics.map(normalize));
    node.primaryTopic = normalize(node.primaryTopic);
    if (stationNodes.has(node.id)) {
      topics.delete('fleet');
      topics.add('sites');
      node.primaryTopic = 'sites';
    }
    if (oneWayNodes.has(node.id)) topics.add('one-way');
    if (sameStationNodes.has(node.id)) topics.add('same-station');
    if (sharedRentalNodes.has(node.id)) {
      topics.add('same-station');
      topics.add('one-way');
    }
    for (const source of node.evidence) {
      const document = documentPaths.get(source.requirementId) ?? '';
      if (document.startsWith('requirements/official-vehicles/')) topics.add('official');
      if (document.startsWith('requirements/store-rental/') && !stationNodes.has(node.id))
        topics.add('store-rental');
      if (document.endsWith('channel-tickets/合作渠道租车券（同站租还）.md')) {
        topics.add('vouchers');
        if (['voucher-create-order', 'voucher-enterprise-settlement'].includes(node.id))
          topics.add('same-station');
      }
    }
    if (node.id === 'feature-new-order-one-way') {
      topics.delete('same-station');
      topics.add('one-way');
      node.primaryTopic = 'one-way';
    }
    if (node.id === 'feature-new-order-same-station') node.primaryTopic = 'same-station';
    if (
      [
        'feature-enterprise-dashboard',
        'feature-official-vehicle-contracts',
        'feature-enterprise-contract-quotas',
        'feature-enterprise-official-car-bill',
        'feature-official-guide',
      ].includes(node.id)
    )
      topics.add('official');
    if (node.id === 'feature-enterprise-corporate-login' || node.id === 'feature-enterprise-login')
      topics.add('official');
    node.topics = [...topics];
  }
}
