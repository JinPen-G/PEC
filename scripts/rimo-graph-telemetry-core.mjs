const definitions = [
  [
    'telemetry-upload',
    '车机资料接收',
    'interface',
    '车机接收接口按资料类别处理上报，更新最新状态并保留原始记录。',
    [
      '其余三类资料写入原始上报记录，并更新该 CID 的最新状态；缺少的字段不得覆盖既有有效值。',
      'RITI 车机服务端；前端不得直接调用。',
      'RIMO 接收端仍须以来源网络、签章或双方确认的其他机制保护接口。',
      '`IduInfo` 更新车机基础资料，不覆盖车辆即时状态。',
      '每次上报完整保存原始 JSON、`DataType`、供应商 `ts` 与平台 `receivedAt`，时间统一以 UTC 保存，供问题追查。',
    ],
  ],
  [
    'latest-telemetry',
    '最新车机状态',
    'object',
    '即时及休眠资料更新对应 CID 的最新状态；缺失字段不覆盖有效值。',
    [
      '其余三类资料写入原始上报记录，并更新该 CID 的最新状态；缺少的字段不得覆盖既有有效值。',
      '`IduInfo` 更新车机基础资料，不覆盖车辆即时状态。',
    ],
  ],
  [
    'received-at',
    '平台接收时间',
    'field',
    '平台接收时间统一以UTC保存；不得用供应商时间或前端刷新时间替代。',
    [
      'RIMO 接收 `immediateInfoUpload` 并完成入库时写入，以 UTC 保存；页面按租户时区转换显示。不得使用供应商 `ts` 或前端刷新时间替代。',
    ],
  ],
  [
    'telemetry-freshness',
    '10 分钟逾时',
    'rule',
    '以平台接收时间判断资料逾时，每分钟及新资料入库后重新计算。',
    [
      '资料逾时 = 当前 UTC 时间 - latest.receivedAt（UTC） > 10 分钟',
      '页面每分钟重新判断一次资料逾时状态。新资料入库后立即重新计算。',
      '`逾时未上报` | 不发起控车指令。',
    ],
  ],
  [
    'device-online',
    '车机在线状态',
    'state',
    '只有GPRS在线且资料未逾时，才判定页面车机在线；供应商离线回覆同样禁止控车。',
    [
      '页面车机在线 = Data.iduGPRSStatus = 1 AND 非资料逾时',
      '`GPRS 离线` | 不发起控车指令。',
      '供应商指令回覆 `ErrorCode=004` 时同样显示为车机未上线。',
    ],
  ],
  [
    'vehicle-control',
    '汽车控车',
    'feature',
    '仅在线汽车允许控车，受理不等于成功；同一指令防重，密钥只留在后端。',
    [
      '仅 `Vehicle` 且页面车机在线时允许下发；`MicroEV` 本期不显示控制按钮。',
      '仅代表供应商已接受调用，不代表指令成功。',
      '同一指令 5 秒内不可重复发送。页面在请求中与最终结果返回前禁用同一车辆同一指令。',
      '前端不得保存或传递 `CheckKey`。',
    ],
  ],
  [
    'vehicle-quick-view',
    '速查表提醒',
    'feature',
    '资料逾时只标通讯异常，缺失值不产生异常；标签按车去重，不改变业务状态或控车权限。',
    [
      '资料逾时按离线处理，只显示“通讯异常”，不再叠加“定位异常”。',
      '`NA`、空值或字段缺失不产生异常标签。',
      '“异常待关注”按车辆去重；同一车辆存在多个异常标签时只统计 1 台。',
      '标签仅用于提示和筛选，不改变车辆启用状态、营运状态、订单状态或控车权限。',
    ],
  ],
  [
    'telemetry-history',
    '资料历史记录',
    'feature',
    '按车辆和平台接收时间保留不可覆盖的历史快照，分页读取既有记录。',
    [
      '每次接收并完成字段标准化的车机资料，按车辆、`receivedAt`保存为不可覆盖的历史快照。速查表操作区提供“历史记录”，以近全屏弹窗分页查看。',
      '历史记录不得以当前最新状态覆盖。',
      '历史记录不使用展开行。',
    ],
  ],
];

export function rimoTelemetryCore(resolveEvidence) {
  const nodes = definitions.map(([id, label, type, summary, quotes]) => ({
    id,
    label,
    type,
    summary,
    aliases: [],
    topics: ['fleet'],
    primaryTopic: 'fleet',
    status: 'active',
    requirements: ['vehicle-status'],
    evidence: quotes.map(resolveEvidence),
    coverage: 'none',
    prototypes: [],
    keyPoints: [{ kind: 'rule', text: summary, evidence: quotes.map((_quote, index) => index) }],
  }));
  const relations = [
    [
      'upload-latest',
      'telemetry-upload',
      'latest-telemetry',
      'provides_data',
      '更新状态',
      'latest-telemetry',
    ],
    ['upload-time', 'telemetry-upload', 'received-at', 'provides_data', '记录时间', 'received-at'],
    [
      'time-freshness',
      'received-at',
      'telemetry-freshness',
      'provides_data',
      '判断逾时',
      'telemetry-freshness',
    ],
    [
      'freshness-online',
      'telemetry-freshness',
      'device-online',
      'constrains',
      '决定在线状态',
      'device-online',
    ],
    ['online-control', 'device-online', 'vehicle-control', 'constrains', '控车前置条件', 'vehicle-control'],
    [
      'freshness-reminder',
      'telemetry-freshness',
      'vehicle-quick-view',
      'constrains',
      '逾时提醒',
      'vehicle-quick-view',
    ],
    [
      'upload-history',
      'telemetry-upload',
      'telemetry-history',
      'provides_data',
      '保存快照',
      'telemetry-history',
    ],
  ];
  const edges = relations.map(([id, source, target, relation, label, proof]) => {
    const node = nodes.find((node) => node.id === proof);
    return {
      id,
      source,
      target,
      relation,
      label,
      reason: node.summary,
      basis: 'explicit',
      status: 'active',
      evidence: [node.evidence[0]],
    };
  });
  return { nodes, edges };
}
