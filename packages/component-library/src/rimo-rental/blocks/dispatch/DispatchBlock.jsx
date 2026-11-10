import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import dayjs from 'dayjs';
import './dispatch.css';
function createPageState(model) {
  const _document = model.document;
  const window = model.window;
  const _localStorage = model.storage;
  const _sessionStorage = model.storage;
  const _themeColor = () => model.theme();
  const _themeColorLight = level => model.theme(level);
  const _themeRGBA = alpha => model.themeAlpha(alpha);
  const feedback = {
    ElMessage: Object.assign(message => model.notify('info', message), {
      success: message => model.notify('success', message),
      warning: message => model.notify('warning', message),
      error: message => model.notify('error', message),
      info: message => model.notify('info', message)
    }),
    ElMessageBox: {
      confirm: (message, title) => model.confirm(message, title),
      alert: (message, title) => model.confirm(message, title)
    }
  };
  function pageSetup() {
    const {
      cell: ref,
      derived: computed,
      onMount: _onMounted,
      onDispose: onBeforeUnmount
    } = model;
    const currentDate = ref(dayjs().startOf('week'));
    const viewMode = ref('week');
    const filterGroup = ref('all');
    const filterStatus = ref('all');
    const filterLocation = ref([]);
    const locationOptions = [{
      value: 'dealer_1',
      label: 'RIMO (直營)',
      children: [{
        value: 'store_1',
        label: '臺北總店'
      }, {
        value: 'store_2',
        label: '桃園機場店'
      }]
    }, {
      value: 'dealer_2',
      label: '聯通租車 (加盟)',
      children: [{
        value: 'store_3',
        label: '臺中高鐵店'
      }, {
        value: 'store_4',
        label: '臺南車站店'
      }]
    }];
    const drawerVisible = ref(false);
    const selectedOrder = ref(null);
    const reassignVisible = ref(false);
    const newVehicleId = ref('');
    const smartDispatchVisible = ref(false);
    const aiDispatchVisible = ref(false);
    const aiDispatchActiveTab = ref('result');
    const aiModelConfigured = ref(true);
    const aiModelInfo = {
      provider: 'OpenAI Compatible',
      model: 'gpt-xxx',
      promptSourceText: '租戶專屬版',
      promptConfigVersion: 'prompt-config-20260519.01',
      promptVersion: 'rimo-store-dispatch-agent-v1',
      promptHash: 'sha256:8c21...f09a',
      dataVersion: 'dispatch-packet-v1'
    };
    const vehicleDrawerVisible = ref(false);
    const selectedVehicle = ref(null);
    const dailyOpsVisible = ref(false);
    const selectedDate = ref(null);
    const dailyOrders = ref({
      pickup: [],
      return: []
    });
    const strategyConfigVisible = ref(false);
    const optimizationDays = ref(7);
    const isCalculating = ref(false);
    const calculationStage = ref(1);
    let optimizationTimers = [];
    const optimizationFixedRules = [{
      title: '默認先預覽',
      desc: '開始優化後只生成結果，確認應用後才寫入預分配。'
    }, {
      title: '保護人工結果',
      desc: '人工改派和免費升等訂單固定不參與批量優化。'
    }, {
      title: '臨近取車保護',
      desc: '進入硬鎖定時間點前 2 小時的訂單不參與批量優化。'
    }, {
      title: '硬鎖自動分派',
      desc: '每筆訂單到硬鎖定時間點時自動複覈預分配；無有效車輛時重新匹配，失敗進入人工調度。'
    }];
    const aiModelSummaryCards = [{
      label: '模型提供商',
      value: aiModelInfo.provider,
      hint: '租戶自有 API Key 接入'
    }, {
      label: '模型名稱',
      value: aiModelInfo.model,
      hint: '由租戶管理員配置'
    }, {
      label: '提示詞來源',
      value: aiModelInfo.promptSourceText,
      hint: '優先使用租戶專屬版'
    }, {
      label: '提示詞版本',
      value: aiModelInfo.promptVersion,
      hint: '配置文件版本 ' + aiModelInfo.promptConfigVersion
    }, {
      label: '數據包版本',
      value: aiModelInfo.dataVersion,
      hint: '僅提交調度必要數據'
    }];
    const aiRequestLog = {
      analysisId: 'AI-DISPATCH-20260519-0008',
      requestTime: '2026-05-19 14:32',
      operator: '王店長 / 門市店長',
      promptSource: 'tenant_override',
      promptSourceText: aiModelInfo.promptSourceText,
      promptConfigVersion: aiModelInfo.promptConfigVersion,
      promptVersion: aiModelInfo.promptVersion,
      promptHash: aiModelInfo.promptHash,
      filteredFields: ['手機號', '證件號', '支付資料', 'API Key', '未脫敏敏感備註']
    };
    const aiRequestLogCards = [{
      label: '分析任務',
      value: aiRequestLog.analysisId,
      hint: aiRequestLog.requestTime
    }, {
      label: '發起人',
      value: aiRequestLog.operator,
      hint: '僅查看自己發起的本次請求'
    }, {
      label: '提示詞來源',
      value: aiRequestLog.promptSourceText,
      hint: aiRequestLog.promptVersion
    }, {
      label: '隱私過濾',
      value: '5 類',
      hint: '不提交手機號、證件號、支付資料等'
    }];
    const aiRequestPromptText = `你是 RIMO Rental 門市租賃 AI 調度分析 Agent。

你的職責是幫助營運平臺調度員分析門市租賃車輛排程風險，並在系統已經完成硬約束過濾後的合法候選車輛範圍內，生成可供調度員確認的預分配推薦。

你不是自動派車執行系統。你不能直接修改訂單、車輛、排程、預分配、硬鎖、改派、取消、支付、退款或賬單。

必須遵守：不得跨車行調度、不得推薦不匹配車組的車輛、不得覆蓋人工改派和已硬鎖訂單，推薦車輛必須來自 candidatesByOrder。`;
    const aiRequestPayload = JSON.stringify({
      analysisContext: {
        tenantId: 'tenant-rimo-tpe',
        businessLine: 'store_rental',
        windowDays: optimizationDays.value,
        storeScope: ['臺北總店', '桃園機場店'],
        requestedBy: '王店長',
        requestedAt: aiRequestLog.requestTime
      },
      dispatchRules: {
        sameDealerOnly: true,
        candidatePoolRequired: true,
        hardLockProtection: true,
        manualReassignProtection: true
      },
      orders: [{
        orderNo: 'ORD-202605-0108',
        pickupAt: '2026-05-20 10:00',
        returnAt: '2026-05-22 10:00',
        vehicleGroup: 'A-SUV',
        expectedAmount: 7200,
        phone: '[excluded]'
      }, {
        orderNo: 'ORD-202605-0115',
        pickupAt: '2026-05-21 09:00',
        returnAt: '2026-05-21 18:00',
        vehicleGroup: 'B-Sedan',
        expectedAmount: 2600,
        phone: '[excluded]'
      }],
      candidatesByOrder: {
        'ORD-202605-0108': ['VH-TPE-2841', 'VH-TPE-6630'],
        'ORD-202605-0115': ['VH-TPE-7716']
      },
      privacyFilter: aiRequestLog.filteredFields
    }, null, 2);
    const aiResponsePayload = JSON.stringify({
      analysisId: aiRequestLog.analysisId,
      summary: {
        riskLevel: 'medium',
        riskCount: 6,
        recommendedActionCount: 4,
        manualReviewCount: 2
      },
      parseStatus: 'JSON_SCHEMA_PASSED',
      validationStatus: 'PARTIAL_PASSED'
    }, null, 2);
    const aiRiskCards = [{
      label: '綜合風險',
      value: '中',
      hint: '未來 7 天存在整備與接續風險',
      cardClass: 'border-amber-100 bg-amber-50/70',
      valueClass: 'text-amber-600'
    }, {
      label: '風險訂單',
      value: '6 單',
      hint: '需要重點關注的訂單數量',
      cardClass: 'border-white bg-white shadow-sm',
      valueClass: 'text-gray-800'
    }, {
      label: '推薦調整',
      value: '4 單',
      hint: 'AI 推薦可調整預分配',
      cardClass: 'border-[color:var(--app-color-primary-light-8)] bg-[color:var(--app-color-primary-light-9)]',
      valueClass: 'text-[color:var(--app-color-primary)]'
    }, {
      label: '需人工確認',
      value: '2 項',
      hint: '無明確可派車輛或數據不足',
      cardClass: 'border-white bg-white shadow-sm',
      valueClass: 'text-gray-800'
    }];
    const aiRiskRows = [{
      riskType: '整備壓力',
      orderNo: 'ORD-202605-0108',
      description: '當前預分配車輛前序還車後僅預留 45 分鐘整備緩衝，低於門店高峯期實際平均整備耗時。',
      suggestion: '改派同車組車輛 TPE-2841，保留 120 分鐘整備緩衝。',
      severity: 'medium',
      severityText: '中'
    }, {
      riskType: '未來衝突',
      orderNo: 'ORD-202605-0115',
      description: '基線方案會導致同一車輛連續三段短租接續，後續任一晚還都會影響隔日硬鎖。',
      suggestion: '保留當前訂單，調整後續低價值訂單進入人工複覈。',
      severity: 'high',
      severityText: '高'
    }, {
      riskType: '資料不足',
      orderNo: 'ORD-202605-0120',
      description: '候選車輛最近清潔狀態缺少同步時間，無法判斷是否滿足自助取車交付標準。',
      suggestion: '人工確認車輛清潔狀態後再應用推薦。',
      severity: 'medium',
      severityText: '中'
    }];
    const aiRecommendationRows = [{
      orderNo: 'ORD-202605-0108',
      currentVehicle: 'TPE-1932',
      recommendedVehicle: 'TPE-2841',
      reason: 'AI_RISK_AVOIDANCE：降低整備不足風險，同時保持同車行、同車組和時間窗無衝突。',
      confidence: 'high',
      confidenceText: '高',
      validation: '通過'
    }, {
      orderNo: 'ORD-202605-0112',
      currentVehicle: '未分配',
      recommendedVehicle: 'TPE-6630',
      reason: 'ASSIGN_PENDING：候選車輛滿足可交付範圍，且後續 24 小時無接續衝突。',
      confidence: 'medium',
      confidenceText: '中',
      validation: '通過'
    }, {
      orderNo: 'ORD-202605-0115',
      currentVehicle: 'TPE-7716',
      recommendedVehicle: '人工確認',
      reason: 'AI_MANUAL_REVIEW：連續接續風險較高，但候選車輛均存在整備或未來衝突風險。',
      confidence: 'medium',
      confidenceText: '中',
      validation: '需人工'
    }, {
      orderNo: 'ORD-202605-0120',
      currentVehicle: 'TPE-5208',
      recommendedVehicle: 'TPE-3920',
      reason: 'AI_DATA_INSUFFICIENT：目標車輛清潔同步時間缺失，當前推薦不得直接應用。',
      confidence: 'low',
      confidenceText: '低',
      validation: '未通過'
    }];
    const aiManualReviewCount = computed(() => aiRiskRows.filter(row => row.severity !== 'low').length);
    const aiApplicableCount = computed(() => aiRecommendationRows.filter(row => row.validation === '通過').length);
    const optimizationSnapshots = {
      3: {
        participating: 12,
        preassigned: 8,
        pending: 4,
        locked: 5,
        vehicles: 9
      },
      7: {
        participating: 27,
        preassigned: 19,
        pending: 8,
        locked: 11,
        vehicles: 16
      },
      14: {
        participating: 41,
        preassigned: 29,
        pending: 12,
        locked: 18,
        vehicles: 24
      }
    };
    const optimizationResultBase = {
      3: {
        adjustedBase: 9,
        manualProtected: 1,
        changeReduction: 1,
        idleReducedHours: 8,
        idleTradeoff: 1,
        utilizationLift: 3.2,
        utilizationTradeoff: 0.4,
        manualReduction: 2,
        beforeAssignedRate: 66.7,
        afterAssignedRate: 91.7,
        beforeFragments: 6,
        afterFragments: 3,
        beforeHighValueMismatch: 2,
        afterHighValueMismatch: 0,
        beforeManualPending: 3,
        afterManualPending: 1,
        nearLock: 1,
        unavailableVehicles: 1
      },
      7: {
        adjustedBase: 21,
        manualProtected: 2,
        changeReduction: 1,
        idleReducedHours: 24,
        idleTradeoff: 2,
        utilizationLift: 6.8,
        utilizationTradeoff: 0.6,
        manualReduction: 6,
        beforeAssignedRate: 70.4,
        afterAssignedRate: 92.6,
        beforeFragments: 14,
        afterFragments: 6,
        beforeHighValueMismatch: 5,
        afterHighValueMismatch: 1,
        beforeManualPending: 8,
        afterManualPending: 2,
        nearLock: 3,
        unavailableVehicles: 2
      },
      14: {
        adjustedBase: 34,
        manualProtected: 3,
        changeReduction: 2,
        idleReducedHours: 41,
        idleTradeoff: 3,
        utilizationLift: 9.4,
        utilizationTradeoff: 0.8,
        manualReduction: 11,
        beforeAssignedRate: 70.7,
        afterAssignedRate: 95.1,
        beforeFragments: 21,
        afterFragments: 9,
        beforeHighValueMismatch: 8,
        afterHighValueMismatch: 2,
        beforeManualPending: 13,
        afterManualPending: 4,
        nearLock: 5,
        unavailableVehicles: 3
      }
    };
    const optimizationChangeBaseRows = [{
      orderNo: 'ST240325001',
      pickupTime: '03-25 09:00 取',
      returnTime: '03-27 10:00 還',
      group: '經濟型',
      beforeVehicle: 'RAC-1235',
      optimizedVehicle: 'RAF-5566',
      reasonOptimized: '車輛評分更優',
      reasonStable: '保持原車',
      risk: '低',
      nearLock: false,
      category: 'candidate',
      priority: 1
    }, {
      orderNo: 'ST240325008',
      pickupTime: '03-25 14:00 取',
      returnTime: '03-26 18:00 還',
      group: '經濟型',
      beforeVehicle: 'RAB-6789',
      optimizedVehicle: 'RAH-9900',
      reasonOptimized: '避免車輛衝突',
      reasonStable: '保持原車',
      risk: '中',
      nearLock: false,
      category: 'candidate',
      priority: 2
    }, {
      orderNo: 'ST240326014',
      pickupTime: '03-26 08:30 取',
      returnTime: '03-27 12:00 還',
      group: '商務型',
      beforeVehicle: 'RBB-8888',
      optimizedVehicle: 'RBF-3333',
      reasonOptimized: '車輛評分更優',
      reasonStable: '保持原車',
      risk: '低',
      nearLock: false,
      category: 'candidate',
      priority: 3
    }, {
      orderNo: 'ST240326021',
      pickupTime: '03-26 15:00 取',
      returnTime: '03-28 10:00 還',
      group: 'SUV',
      beforeVehicle: 'RCC-1234',
      optimizedVehicle: 'RCE-9012',
      reasonOptimized: '車輛評分更優',
      reasonStable: '保持原車',
      risk: '低',
      nearLock: false,
      category: 'candidate',
      priority: 4
    }, {
      orderNo: 'ST240327006',
      pickupTime: '03-27 09:00 取',
      returnTime: '03-28 09:30 還',
      group: '經濟型',
      beforeVehicle: 'RAG-7788',
      optimizedVehicle: 'RAE-3322',
      reasonOptimized: '避免車輛衝突',
      reasonStable: '保持原車',
      risk: '中',
      nearLock: false,
      category: 'candidate',
      priority: 5
    }, {
      orderNo: 'ST240327012',
      pickupTime: '03-27 13:00 取',
      returnTime: '03-29 11:00 還',
      group: 'SUV',
      beforeVehicle: 'RCD-5678',
      optimizedVehicle: 'RCC-1234',
      reasonOptimized: '車輛評分更優',
      reasonStable: '保持原車',
      risk: '低',
      nearLock: false,
      category: 'candidate',
      priority: 6
    }, {
      orderNo: 'ST240327023',
      pickupTime: '03-27 17:30 取',
      returnTime: '03-28 09:00 還',
      group: '商務型',
      beforeVehicle: 'RBC-6666',
      optimizedVehicle: 'RBC-6666',
      reasonOptimized: '臨近取車保護',
      reasonStable: '臨近取車保護',
      risk: '中',
      nearLock: true,
      category: 'near_lock',
      priority: 7
    }, {
      orderNo: 'ST240328004',
      pickupTime: '03-28 10:00 取',
      returnTime: '03-30 10:00 還',
      group: '商務型',
      beforeVehicle: 'RBF-3333',
      optimizedVehicle: 'RBD-1111',
      reasonOptimized: '人工結果保護',
      reasonStable: '人工結果保護',
      risk: '低',
      nearLock: false,
      category: 'manual',
      priority: 8
    }, {
      orderNo: 'ST240328017',
      pickupTime: '03-28 14:00 取',
      returnTime: '03-29 18:00 還',
      group: '經濟型',
      beforeVehicle: 'RAF-5566',
      optimizedVehicle: 'RAF-5566',
      reasonOptimized: '保持原車',
      reasonStable: '保持原車',
      risk: '低',
      nearLock: false,
      category: 'stable',
      priority: 9
    }];
    const vehicles = [{
      id: 'v1',
      plate: 'RAC-1235',
      model: 'Toyota Altis',
      group: 'economy',
      status: 'idle',
      statusText: '空閒'
    }, {
      id: 'v2',
      plate: 'RAB-6789',
      model: 'Toyota Altis',
      group: 'economy',
      status: 'rented',
      statusText: '在租'
    }, {
      id: 'v5',
      plate: 'RAE-3322',
      model: 'Toyota Corolla',
      group: 'economy',
      status: 'maintenance',
      statusText: '維修中'
    }, {
      id: 'v6',
      plate: 'RAF-5566',
      model: 'Toyota Corolla',
      group: 'economy',
      status: 'idle',
      statusText: '空閒'
    }, {
      id: 'v7',
      plate: 'RAG-7788',
      model: 'Nissan Sentra',
      group: 'economy',
      status: 'rented',
      statusText: '在租'
    }, {
      id: 'v8',
      plate: 'RAH-9900',
      model: 'Nissan Sentra',
      group: 'economy',
      status: 'idle',
      statusText: '空閒'
    }, {
      id: 'v3',
      plate: 'RBB-8888',
      model: 'Toyota Alphard',
      group: 'business',
      status: 'maintenance',
      statusText: '維修中'
    }, {
      id: 'v4',
      plate: 'RBC-6666',
      model: 'Benz E-Class',
      group: 'business',
      status: 'idle',
      statusText: '空閒'
    }, {
      id: 'v9',
      plate: 'RBD-1111',
      model: 'VW Passat',
      group: 'business',
      status: 'rented',
      statusText: '在租'
    }, {
      id: 'v10',
      plate: 'RBE-2222',
      model: 'VW Passat',
      group: 'business',
      status: 'rented',
      statusText: '在租'
    }, {
      id: 'v11',
      plate: 'RBF-3333',
      model: 'Benz E-Class',
      group: 'business',
      status: 'idle',
      statusText: '空閒'
    }, {
      id: 'v12',
      plate: 'RCC-1234',
      model: 'Toyota RAV4',
      group: 'suv',
      status: 'idle',
      statusText: '空閒'
    }, {
      id: 'v13',
      plate: 'RCD-5678',
      model: 'Toyota RAV4',
      group: 'suv',
      status: 'rented',
      statusText: '在租'
    }, {
      id: 'v14',
      plate: 'RCE-9012',
      model: 'BMW X5',
      group: 'suv',
      status: 'idle',
      statusText: '空閒'
    }];
    const monthTime = (day, hour) => dayjs().startOf('month').date(day).hour(hour).minute(0).second(0).format('YYYY-MM-DD HH:mm');
    const orders = ref([{
      id: 'o1',
      vehicleId: 'v1',
      customer: '張三',
      phone: '13811111111',
      status: '待取車',
      dispatchStatus: 'pre_assigned',
      startTime: dayjs().day(1).hour(10).format('YYYY-MM-DD HH:mm'),
      endTime: dayjs().day(2).hour(10).format('YYYY-MM-DD HH:mm')
    }, {
      id: 'o2_1',
      vehicleId: 'v2',
      customer: '李四 (上午)',
      phone: '13922222222',
      status: '已還車',
      dispatchStatus: 'locked',
      startTime: dayjs().day(1).hour(8).format('YYYY-MM-DD HH:mm'),
      endTime: dayjs().day(1).hour(12).format('YYYY-MM-DD HH:mm')
    }, {
      id: 'o2_2',
      vehicleId: 'v2',
      customer: '王五 (下午)',
      phone: '13933333333',
      status: '用車中',
      dispatchStatus: 'locked',
      startTime: dayjs().day(1).hour(14).format('YYYY-MM-DD HH:mm'),
      endTime: dayjs().day(3).hour(18).format('YYYY-MM-DD HH:mm')
    }, {
      id: 'o3',
      vehicleId: 'v4',
      customer: '趙六',
      phone: '13733333333',
      status: '已預訂',
      dispatchStatus: 'locked',
      startTime: dayjs().day(3).hour(14).format('YYYY-MM-DD HH:mm'),
      endTime: dayjs().day(5).hour(14).format('YYYY-MM-DD HH:mm')
    }, {
      id: 'o4',
      vehicleId: 'v7',
      customer: '孫七',
      phone: '13644444444',
      status: '用車中',
      dispatchStatus: 'locked',
      startTime: dayjs().day(0).hour(10).format('YYYY-MM-DD HH:mm'),
      endTime: dayjs().day(6).hour(10).format('YYYY-MM-DD HH:mm')
    }, {
      id: 'o5',
      vehicleId: 'v9',
      customer: '周八',
      phone: '13555555555',
      status: '用車中',
      dispatchStatus: 'locked',
      startTime: dayjs().day(1).hour(9).format('YYYY-MM-DD HH:mm'),
      endTime: dayjs().day(2).hour(18).format('YYYY-MM-DD HH:mm')
    }, {
      id: 'o6',
      vehicleId: 'v10',
      customer: '吳九',
      phone: '13466666666',
      status: '用車中',
      dispatchStatus: 'locked',
      startTime: dayjs().day(2).hour(12).format('YYYY-MM-DD HH:mm'),
      endTime: dayjs().day(4).hour(12).format('YYYY-MM-DD HH:mm')
    }, {
      id: 'o7',
      vehicleId: 'v13',
      customer: '鄭十',
      phone: '13377777777',
      status: '用車中',
      dispatchStatus: 'locked',
      startTime: dayjs().day(3).hour(8).format('YYYY-MM-DD HH:mm'),
      endTime: dayjs().day(5).hour(20).format('YYYY-MM-DD HH:mm')
    }, {
      id: 'o8',
      vehicleId: 'v1',
      customer: '陳十一',
      phone: '13288888888',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: dayjs().day(4).hour(10).format('YYYY-MM-DD HH:mm'),
      endTime: dayjs().day(6).hour(10).format('YYYY-MM-DD HH:mm')
    }, {
      id: 'm1',
      vehicleId: 'v6',
      customer: '林小姐',
      phone: '13210000001',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: monthTime(2, 9),
      endTime: monthTime(3, 10)
    }, {
      id: 'm2',
      vehicleId: 'v8',
      customer: '黃先生',
      phone: '13210000002',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: monthTime(3, 13),
      endTime: monthTime(5, 11)
    }, {
      id: 'm3',
      vehicleId: 'v11',
      customer: '企業-Acer',
      phone: '13210000003',
      status: '待取車',
      dispatchStatus: 'locked',
      startTime: monthTime(4, 10),
      endTime: monthTime(6, 18)
    }, {
      id: 'm4',
      vehicleId: 'v12',
      customer: '何先生',
      phone: '13210000004',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: monthTime(5, 8),
      endTime: monthTime(7, 20)
    }, {
      id: 'm5',
      vehicleId: 'v14',
      customer: '企業-宏碁',
      phone: '13210000005',
      status: '待取車',
      dispatchStatus: 'locked',
      startTime: monthTime(7, 9),
      endTime: monthTime(10, 9)
    }, {
      id: 'm6',
      vehicleId: 'v6',
      customer: '蔡先生',
      phone: '13210000006',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: monthTime(8, 14),
      endTime: monthTime(9, 18)
    }, {
      id: 'm7',
      vehicleId: 'v4',
      customer: '企業-聯華',
      phone: '13210000007',
      status: '待取車',
      dispatchStatus: 'locked',
      startTime: monthTime(9, 10),
      endTime: monthTime(12, 12)
    }, {
      id: 'm8',
      vehicleId: 'v8',
      customer: '郭小姐',
      phone: '13210000008',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: monthTime(11, 9),
      endTime: monthTime(12, 16)
    }, {
      id: 'm9',
      vehicleId: 'v12',
      customer: '許先生',
      phone: '13210000009',
      status: '待取車',
      dispatchStatus: 'locked',
      startTime: monthTime(12, 11),
      endTime: monthTime(14, 18)
    }, {
      id: 'm10',
      vehicleId: 'v1',
      customer: '企業-臺塑',
      phone: '13210000010',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: monthTime(14, 9),
      endTime: monthTime(16, 9)
    }, {
      id: 'm11',
      vehicleId: 'v11',
      customer: '彭小姐',
      phone: '13210000011',
      status: '待取車',
      dispatchStatus: 'locked',
      startTime: monthTime(15, 13),
      endTime: monthTime(17, 11)
    }, {
      id: 'm12',
      vehicleId: 'v14',
      customer: '曾先生',
      phone: '13210000012',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: monthTime(17, 10),
      endTime: monthTime(19, 16)
    }, {
      id: 'm13',
      vehicleId: 'v6',
      customer: '企業-華碩',
      phone: '13210000013',
      status: '待取車',
      dispatchStatus: 'locked',
      startTime: monthTime(18, 9),
      endTime: monthTime(21, 12)
    }, {
      id: 'm14',
      vehicleId: 'v8',
      customer: '邱先生',
      phone: '13210000014',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: monthTime(20, 15),
      endTime: monthTime(22, 10)
    }, {
      id: 'm15',
      vehicleId: 'v4',
      customer: '企業-長榮',
      phone: '13210000015',
      status: '待取車',
      dispatchStatus: 'locked',
      startTime: monthTime(22, 9),
      endTime: monthTime(24, 18)
    }, {
      id: 'm16',
      vehicleId: 'v12',
      customer: '賴小姐',
      phone: '13210000016',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: monthTime(24, 11),
      endTime: monthTime(25, 20)
    }, {
      id: 'm17',
      vehicleId: 'v14',
      customer: '企業-鴻海',
      phone: '13210000017',
      status: '待取車',
      dispatchStatus: 'locked',
      startTime: monthTime(25, 8),
      endTime: monthTime(27, 12)
    }, {
      id: 'm18',
      vehicleId: 'v1',
      customer: '蘇先生',
      phone: '13210000018',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: monthTime(27, 14),
      endTime: monthTime(28, 18)
    }, {
      id: 'm19',
      vehicleId: 'v11',
      customer: '企業-統一',
      phone: '13210000019',
      status: '待取車',
      dispatchStatus: 'locked',
      startTime: monthTime(28, 10),
      endTime: monthTime(30, 10)
    }, {
      id: 'm20',
      vehicleId: 'v8',
      customer: '洪小姐',
      phone: '13210000020',
      status: '已預訂',
      dispatchStatus: 'pre_assigned',
      startTime: monthTime(29, 13),
      endTime: monthTime(30, 19)
    }]);
    const gridDates = computed(() => {
      const dates = [];
      let start, daysCount;
      if (viewMode.value === 'month') {
        start = dayjs(currentDate.value).startOf('month');
        daysCount = start.daysInMonth();
      } else if (viewMode.value === 'day') {
        start = dayjs(currentDate.value);
        daysCount = 1;
      } else {
        start = dayjs(currentDate.value).startOf('week');
        daysCount = 7;
      }
      for (let i = 0; i < daysCount; i++) {
        dates.push(start.add(i, 'day'));
      }
      return dates;
    });
    const gridStyle = computed(() => {
      const colCount = gridDates.value.length;
      const minWidth = viewMode.value === 'month' ? '40px' : '140px';
      return {
        display: 'grid',
        gridTemplateColumns: `250px repeat(${colCount}, minmax(${minWidth}, 1fr))`,
        borderTop: '1px solid #e5e7eb',
        borderLeft: '1px solid #e5e7eb',
        width: 'max-content',
        minWidth: '100%'
      };
    });
    const filteredGroups = computed(() => {
      const groups = [{
        id: 'g_eco',
        name: '經濟型 (Economy)',
        vehicles: []
      }, {
        id: 'g_bus',
        name: '商務型 (Business)',
        vehicles: []
      }, {
        id: 'g_suv',
        name: 'SUV / 越野 (SUV)',
        vehicles: []
      }];
      vehicles.forEach(v => {
        if (filterGroup.value !== 'all' && v.group !== filterGroup.value) return;
        if (filterStatus.value !== 'all' && v.status !== filterStatus.value) return;
        if (v.group === 'economy') groups[0].vehicles.push(v);
        if (v.group === 'business') groups[1].vehicles.push(v);
        if (v.group === 'suv') groups[2].vehicles.push(v);
      });
      return groups.filter(g => g.vehicles.length > 0);
    });
    const getLocationLabelByPath = (options, path) => {
      if (!path || !path.length) return 'Center Store（當前門店）';
      let currentOptions = options;
      const labels = [];
      path.forEach(value => {
        const matched = currentOptions.find(item => item.value === value);
        if (matched) {
          labels.push(matched.label);
          currentOptions = matched.children || [];
        }
      });
      return labels.length ? labels.join(' / ') : 'Center Store（當前門店）';
    };
    const optimizationScope = computed(() => {
      const snapshot = optimizationSnapshots[optimizationDays.value] || optimizationSnapshots[7];
      return {
        ...snapshot,
        storeScopeLabel: getLocationLabelByPath(locationOptions, filterLocation.value),
        storeCountText: filterLocation.value.length ? '1 個門店' : '當前門店'
      };
    });
    const aiScopeCards = computed(() => [{
      label: '分析窗口',
      value: `未來 ${optimizationDays.value} 天`,
      hint: '只支持 3 / 7 / 14 天三個分析窗口'
    }, {
      label: '分析訂單上限',
      value: `${optimizationScope.value.participating} / 50`,
      hint: '超過 50 筆訂單時，頁面提示縮小門店或時間範圍'
    }, {
      label: '候選車輛上限',
      value: `${optimizationScope.value.vehicles} / 120`,
      hint: '超過 120 輛候選車時，系統按相關性裁剪後再發起分析'
    }, {
      label: '返回結構',
      value: 'JSON Schema',
      hint: '模型返回後仍執行結構校驗、候選池校驗與硬約束複覈'
    }]);
    const optimizationOverviewCards = computed(() => [{
      label: '優化時間範圍',
      value: `未來 ${optimizationDays.value} 天`,
      hint: '按預計取車時間進入本次優化窗口'
    }, {
      label: '參與優化訂單數',
      value: optimizationScope.value.participating,
      hint: '未硬鎖定、可參與本次全局重排'
    }, {
      label: '已預分配訂單數',
      value: optimizationScope.value.preassigned,
      hint: '已有預分配車輛，可參與重新編排'
    }, {
      label: '待分配訂單數',
      value: optimizationScope.value.pending,
      hint: '尚未分配車輛，將一併進入本次優化'
    }, {
      label: '已硬鎖定訂單數',
      value: optimizationScope.value.locked,
      hint: '僅展示，不參與本次優化',
      tone: 'muted',
      tag: '不參與',
      tagType: 'info'
    }, {
      label: '涉及車輛數',
      value: optimizationScope.value.vehicles,
      hint: '參與本次預分配重排的可用車輛池'
    }]);
    const hasOptimizableOrders = computed(() => optimizationScope.value.participating > 0);
    const optimizationResultMetrics = computed(() => {
      const base = optimizationResultBase[optimizationDays.value] || optimizationResultBase[7];
      const manualProtected = base.manualProtected;
      const changeReduction = base.changeReduction;
      const adjusted = Math.max(0, base.adjustedBase - manualProtected - changeReduction);
      const unchanged = Math.max(0, optimizationScope.value.participating - adjusted);
      const idleReducedHours = Math.max(1, base.idleReducedHours - base.idleTradeoff);
      const utilizationLift = Math.max(0.5, base.utilizationLift - base.utilizationTradeoff);
      const manualReduction = Math.max(0, base.manualReduction - 1);
      const afterAssignedRate = Math.max(base.beforeAssignedRate + 1, base.afterAssignedRate - 1.0 - 0.8);
      const afterFragments = base.afterFragments + 1;
      const afterHighValueMismatch = base.afterHighValueMismatch + 1;
      const afterManualPending = base.afterManualPending + 1;
      return {
        adjusted,
        unchanged,
        involvedVehicles: optimizationScope.value.vehicles,
        idleReducedHours,
        utilizationLift,
        manualReduction,
        beforeAssignedRate: base.beforeAssignedRate,
        afterAssignedRate,
        beforeFragments: base.beforeFragments,
        afterFragments,
        beforeHighValueMismatch: base.beforeHighValueMismatch,
        afterHighValueMismatch,
        beforeManualPending: base.beforeManualPending,
        afterManualPending,
        nearLock: base.nearLock,
        unavailableVehicles: base.unavailableVehicles,
        manualProtected
      };
    });
    const optimizationResultCards = computed(() => [{
      label: '參與優化訂單數',
      value: optimizationScope.value.participating,
      delta: `${optimizationDays.value} 天窗口`,
      hint: '僅統計未硬鎖定訂單',
      cardClass: 'border-white bg-white shadow-sm',
      valueClass: 'text-gray-800',
      deltaClass: 'text-gray-400'
    }, {
      label: '被調整訂單數',
      value: `${optimizationResultMetrics.value.adjusted} 單`,
      delta: '重點優化',
      hint: '預分配車輛發生替換或重排',
      cardClass: 'border-emerald-100 bg-emerald-50/70',
      valueClass: 'text-emerald-600',
      deltaClass: 'text-emerald-600'
    }, {
      label: '保持不變訂單數',
      value: `${optimizationResultMetrics.value.unchanged} 單`,
      delta: '無需改動',
      hint: '當前方案已較優或不滿足調整條件',
      cardClass: 'border-white bg-white shadow-sm',
      valueClass: 'text-gray-800',
      deltaClass: 'text-gray-400'
    }, {
      label: '涉及車輛數',
      value: `${optimizationResultMetrics.value.involvedVehicles} 輛`,
      delta: '全局重排',
      hint: '參與本次預分配優化的車輛池',
      cardClass: 'border-white bg-white shadow-sm',
      valueClass: 'text-gray-800',
      deltaClass: 'text-gray-400'
    }, {
      label: '預計減少閒置時長',
      value: `-${optimizationResultMetrics.value.idleReducedHours}h`,
      delta: '閒置下降',
      hint: '通過連續排布與錯峯接續減少空檔',
      cardClass: 'border-blue-100 bg-blue-50/70',
      valueClass: 'text-blue-600',
      deltaClass: 'text-blue-600'
    }, {
      label: '預計提升車輛利用率',
      value: `+${optimizationResultMetrics.value.utilizationLift.toFixed(1)}%`,
      delta: '利用率提升',
      hint: '兼顧高價值訂單與全局利用效率',
      cardClass: 'border-[color:var(--app-color-primary-light-8)] bg-[color:var(--app-color-primary-light-9)]',
      valueClass: 'text-[color:var(--app-color-primary)]',
      deltaClass: 'text-[color:var(--app-color-primary)]'
    }]);
    const optimizationChangeRows = computed(() => {
      const candidateKeepThreshold = 4;
      return optimizationChangeBaseRows.map(row => {
        if (row.category === 'candidate') {
          const shouldKeep = row.priority > candidateKeepThreshold;
          if (shouldKeep) {
            return {
              ...row,
              afterVehicle: row.beforeVehicle,
              reason: row.reasonStable,
              status: '保持原車'
            };
          }
          return {
            ...row,
            afterVehicle: row.optimizedVehicle,
            reason: row.reasonOptimized,
            status: '已優化'
          };
        }
        if (row.category === 'manual') {
          return {
            ...row,
            afterVehicle: row.beforeVehicle,
            reason: row.reasonStable,
            status: '未納入'
          };
        }
        if (row.category === 'near_lock') {
          return {
            ...row,
            afterVehicle: row.beforeVehicle,
            reason: row.reasonStable,
            status: '未納入'
          };
        }
        return {
          ...row,
          afterVehicle: row.beforeVehicle,
          reason: row.reasonStable,
          status: '保持原車'
        };
      });
    });
    const optimizationAdjustedCount = computed(() => optimizationResultMetrics.value.adjusted);
    const isToday = date => date.isSame(dayjs(), 'day');
    const getStatusType = status => {
      if (status === 'rented') return 'primary';
      if (status === 'maintenance') return 'info';
      return 'success';
    };
    const getDispatchStatusText = status => {
      const map = {
        pre_assigned: '預分配',
        locked: '已硬鎖',
        manual_reassigned: '人工改派',
        upgraded: '免費升等',
        pending: '待派車'
      };
      return map[status] || '待派車';
    };
    const getDispatchStatusShortText = status => {
      const map = {
        pre_assigned: '預',
        locked: '鎖',
        manual_reassigned: '改',
        upgraded: '升',
        pending: '待'
      };
      return map[status] || '待';
    };
    const getDispatchBadgeClass = status => {
      const map = {
        pre_assigned: 'bg-amber-50 text-amber-700 border-amber-300',
        locked: 'bg-emerald-50 text-emerald-700 border-emerald-300',
        manual_reassigned: 'bg-orange-50 text-orange-700 border-orange-300',
        upgraded: 'bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary-hover)] border-[color:var(--app-color-primary-light-7)]',
        pending: 'bg-slate-50 text-slate-600 border-slate-300'
      };
      return map[status] || map.pending;
    };
    const getDispatchTagType = status => {
      if (status === 'locked') return 'success';
      if (status === 'pre_assigned') return 'warning';
      if (status === 'manual_reassigned') return 'warning';
      if (status === 'upgraded') return 'primary';
      return 'info';
    };
    const getOrdersForDay = (vehicle, day) => {
      return orders.value.filter(o => o.vehicleId === vehicle.id).filter(o => {
        const start = dayjs(o.startTime);
        const end = dayjs(o.endTime);
        return start.isSame(day, 'day') || end.isSame(day, 'day') || start.isBefore(day, 'day') && end.isAfter(day, 'day');
      });
    };
    const isOrderEnd = (order, day) => {
      return dayjs(order.endTime).isSame(day, 'day');
    };
    const getOrderClass = (order, day) => {
      let classes = [];
      const isStart = dayjs(order.startTime).isSame(day, 'day');
      const isEnd = isOrderEnd(order, day);
      if (order.status === '用車中') {
        classes.push('bg-green-100 text-green-800 border-green-500');
      } else {
        classes.push('bg-blue-100 text-blue-800 border-blue-500');
      }
      if (isStart) {
        classes.push('border-l-4');
      }
      if (isEnd) {
        classes.push('border-r-4 text-right');
      }
      return classes.join(' ');
    };
    const getOrderTimeText = (order, day) => {
      const start = dayjs(order.startTime);
      const end = dayjs(order.endTime);
      if (viewMode.value === 'month') {
        if (start.isSame(day, 'day')) return '取';
        if (end.isSame(day, 'day')) return '還';
        return '';
      }
      if (start.isSame(day, 'day')) return `${start.format('HH:mm')} 取`;
      if (end.isSame(day, 'day')) return `${end.format('HH:mm')} 還`;
      return '全天佔用';
    };
    const openOrderDrawer = order => {
      selectedOrder.value = {
        ...order,
        vehiclePlate: vehicles.find(v => v.id === order.vehicleId)?.plate
      };
      drawerVisible.value = true;
    };
    const openVehicleDrawer = vehicle => {
      selectedVehicle.value = vehicle;
      vehicleDrawerVisible.value = true;
    };
    const getVehicleOrders = vehicleId => {
      return orders.value.filter(o => o.vehicleId === vehicleId).sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));
    };
    const getVehiclePlate = vid => {
      return vehicles.find(v => v.id === vid)?.plate || '未知車輛';
    };
    const openDatePanel = day => {
      selectedDate.value = day;
      const pickups = orders.value.filter(o => dayjs(o.startTime).isSame(day, 'day'));
      const returns = orders.value.filter(o => dayjs(o.endTime).isSame(day, 'day'));
      dailyOrders.value = {
        pickup: pickups,
        return: returns
      };
      dailyOpsVisible.value = true;
    };
    const showReassignDialog = () => {
      newVehicleId.value = '';
      reassignVisible.value = true;
    };
    const confirmReassign = () => {
      feedback.ElMessage.info('將打開與訂單詳情頁一致的改派窗口');
      reassignVisible.value = false;
      drawerVisible.value = false;
      goToDetail();
    };
    const goToDetail = () => {
      window.location.href = 'order_detail.html';
    };
    const clearOptimizationTimers = () => {
      optimizationTimers.forEach(timer => window.clearTimeout(timer));
      optimizationTimers = [];
      calculationStage.value = 1;
    };
    const handleStrategyClose = done => {
      if (isCalculating.value) return;
      clearOptimizationTimers();
      done();
    };
    const closeStrategyConfig = () => {
      if (isCalculating.value) return;
      clearOptimizationTimers();
      strategyConfigVisible.value = false;
    };
    const openStrategyConfig = () => {
      clearOptimizationTimers();
      isCalculating.value = false;
      strategyConfigVisible.value = true;
    };
    const runOptimization = () => {
      if (!hasOptimizableOrders.value) return;
      isCalculating.value = true;
      calculationStage.value = 1;
      clearOptimizationTimers();
      calculationStage.value = 1;
      optimizationTimers = [window.setTimeout(() => {
        calculationStage.value = 2;
      }, 700), window.setTimeout(() => {
        calculationStage.value = 3;
      }, 1500), window.setTimeout(() => {
        isCalculating.value = false;
        strategyConfigVisible.value = false;
        smartDispatchVisible.value = true;
        feedback.ElMessage.success('優化方案已生成，請確認後應用。');
        clearOptimizationTimers();
      }, 2300)];
    };
    const applySmartDispatch = () => {
      feedback.ElMessage.success(`已應用通過校驗的優化結果，更新 ${optimizationResultMetrics.value.adjusted} 筆訂單預分配。`);
      smartDispatchVisible.value = false;
    };
    const openAiDispatchAnalysis = () => {
      if (!aiModelConfigured.value) {
        feedback.ElMessage.warning('當前租戶未完成 AI 模型配置');
        return;
      }
      aiDispatchVisible.value = true;
    };
    const applyAiDispatchRecommendations = () => {
      feedback.ElMessage.success(`已應用通過系統校驗的 AI 推薦，更新 ${aiApplicableCount.value} 筆訂單預分配。`);
      aiDispatchVisible.value = false;
    };
    const closeSmartDispatch = () => {
      smartDispatchVisible.value = false;
    };
    const getOptimizationStatusType = status => {
      if (status === '已優化') return 'success';
      if (status === '未納入') return 'warning';
      if (status === '保持原車') return 'info';
      return '';
    };
    const getOptimizationRiskType = risk => {
      if (risk === '高') return 'danger';
      if (risk === '中') return 'warning';
      return 'success';
    };
    const getAiRiskType = risk => {
      if (risk === 'high') return 'danger';
      if (risk === 'medium') return 'warning';
      return 'success';
    };
    const getAiConfidenceType = confidence => {
      if (confidence === 'high') return 'success';
      if (confidence === 'medium') return 'warning';
      return 'info';
    };
    onBeforeUnmount(() => {
      clearOptimizationTimers();
    });
    const resetFilters = () => {
      filterGroup.value = 'all';
      filterStatus.value = 'all';
      filterLocation.value = [];
    };
    return {
      currentDate,
      viewMode,
      filterGroup,
      filterStatus,
      filterLocation,
      locationOptions,
      gridDates,
      gridStyle,
      filteredGroups,
      drawerVisible,
      selectedOrder,
      reassignVisible,
      newVehicleId,
      showReassignDialog,
      confirmReassign,
      smartDispatchVisible,
      openStrategyConfig,
      runOptimization,
      applySmartDispatch,
      isToday,
      getStatusType,
      getDispatchStatusText,
      getDispatchStatusShortText,
      getDispatchBadgeClass,
      getDispatchTagType,
      getOrdersForDay,
      getOrderClass,
      getOrderTimeText,
      openOrderDrawer,
      openVehicleDrawer,
      goToDetail,
      vehicleDrawerVisible,
      selectedVehicle,
      getVehicleOrders,
      dailyOpsVisible,
      selectedDate,
      dailyOrders,
      openDatePanel,
      getVehiclePlate,
      dayjs,
      isOrderEnd,
      strategyConfigVisible,
      optimizationDays,
      optimizationFixedRules,
      isCalculating,
      calculationStage,
      optimizationOverviewCards,
      optimizationScope,
      hasOptimizableOrders,
      closeStrategyConfig,
      handleStrategyClose,
      optimizationResultCards,
      optimizationChangeRows,
      optimizationAdjustedCount,
      closeSmartDispatch,
      getOptimizationStatusType,
      getOptimizationRiskType,
      aiDispatchVisible,
      aiDispatchActiveTab,
      aiModelConfigured,
      aiModelInfo,
      aiModelSummaryCards,
      aiScopeCards,
      aiRiskCards,
      aiRiskRows,
      aiRecommendationRows,
      aiManualReviewCount,
      aiApplicableCount,
      aiRequestLog,
      aiRequestLogCards,
      aiRequestPromptText,
      aiRequestPayload,
      aiResponsePayload,
      openAiDispatchAnalysis,
      applyAiDispatchRecommendations,
      getAiRiskType,
      getAiConfidenceType,
      optimizationTimers,
      optimizationSnapshots,
      optimizationResultBase,
      optimizationChangeBaseRows,
      vehicles,
      monthTime,
      orders,
      getLocationLabelByPath,
      optimizationResultMetrics,
      clearOptimizationTimers,
      resetFilters
    };
  }
  return pageSetup();
}
export default function DispatchBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="dispatch" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="px-6 pt-6 pb-2 flex justify-between items-end"><div data-rimo-layout="heading"><div className="flex items-center gap-3"><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("車輛排程看板")}</h1></div>
<p className="text-gray-500 text-sm mt-1">{text("可視化管理車輛排班、調度與衝突處理。")}</p></div>
<div className="flex items-center gap-3"><RimoElement kind="el-button-group" className="shadow-sm"><RimoElement kind="el-button" type={view.viewMode === 'day' ? 'primary' : ''} onClick={_event => {
              model.write(["viewMode"], 'day');
            }}>{text("日")}</RimoElement>
<RimoElement kind="el-button" type={view.viewMode === 'week' ? 'primary' : ''} onClick={_event => {
              model.write(["viewMode"], 'week');
            }}>{text("周")}</RimoElement>
<RimoElement kind="el-button" type={view.viewMode === 'month' ? 'primary' : ''} onClick={_event => {
              model.write(["viewMode"], 'month');
            }}>{text("月")}</RimoElement></RimoElement>
{view.viewMode === 'month' ? <><RimoElement kind="el-date-picker" modelValue={view.currentDate} onModelChange={value => {
              model.write(["currentDate"], value);
            }} type="month" placeholder="選擇月" clearable={false} format="YYYY年 MM月" style={rimoStyle("width: 140px")}></RimoElement></> : <><RimoElement kind="el-date-picker" modelValue={view.currentDate} onModelChange={value => {
              model.write(["currentDate"], value);
            }} type="week" placeholder="選擇周" clearable={false} format="YYYY 第 ww 周" style={rimoStyle("width: 160px")}></RimoElement></>}
<RimoElement kind="el-button" type="primary" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={event => {
            view.openStrategyConfig?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="MagicStick" /></RimoElement>
{text(" 智能優化\n                        ")}</RimoElement>
<RimoElement kind="el-button" type="primary" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" disabled={!view.aiModelConfigured} onClick={event => {
            view.openAiDispatchAnalysis?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Connection" /></RimoElement>
{text(" AI分析\n                        ")}</RimoElement></div></div>
<div className="px-6 pt-1 pb-1" data-rimo-layout="filters"><div className="bg-white rounded-lg border border-gray-200 p-2 flex items-center justify-between shadow-sm"><div className="flex items-center space-x-4 pl-2"><span className="text-sm text-gray-500">{text("篩選:")}</span>
<RimoElement kind="el-cascader" modelValue={view.filterLocation} onModelChange={value => {
              model.write(["filterLocation"], value);
            }} options={view.locationOptions} placeholder="選擇車行/門店" style={rimoStyle("width: 220px")} clearable={true} showAllLevels={false}></RimoElement>
<RimoElement kind="el-select" modelValue={view.filterGroup} onModelChange={value => {
              model.write(["filterGroup"], value);
            }} placeholder="車型組" style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="全部車型" value="all"></RimoElement>
<RimoElement kind="el-option" label="經濟型 (Economy)" value="economy"></RimoElement>
<RimoElement kind="el-option" label="商務型 (Business)" value="business"></RimoElement>
<RimoElement kind="el-option" label="SUV (SUV)" value="suv"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filterStatus} onModelChange={value => {
              model.write(["filterStatus"], value);
            }} placeholder="狀態" style={rimoStyle("width: 120px")}><RimoElement kind="el-option" label="全部狀態" value="all"></RimoElement>
<RimoElement kind="el-option" label="空閒" value="idle"></RimoElement>
<RimoElement kind="el-option" label="在租" value="rented"></RimoElement></RimoElement>
<RimoElement kind="el-tooltip" content="重置篩選" placement="top"><RimoElement kind="el-button" circle={true} onClick={event => {
                view.resetFilters?.(event);
              }}><RimoElement kind="el-icon"><RimoIcon name="Refresh" /></RimoElement></RimoElement></RimoElement></div>
<div className="flex items-center space-x-4 text-xs text-gray-500 pr-2"><div className="flex items-center"><span className="w-3 h-3 bg-blue-100 border border-blue-300 mr-1"></span>
{text(" 在租")}</div>
<div className="flex items-center"><span className="w-3 h-3 bg-green-100 border border-green-300 mr-1"></span>
{text(" 完好空閒")}</div>
<div className="flex items-center"><span className="w-3 h-3 bg-gray-100 border border-gray-300 mr-1"></span>
{text(" 維修中")}</div>
<div className="flex items-center"><span className="w-3 h-3 bg-amber-50 border border-amber-300 mr-1"></span>
{text(" 預分配")}</div>
<div className="flex items-center"><span className="w-3 h-3 bg-emerald-50 border border-emerald-300 mr-1"></span>
{text(" 已硬鎖")}</div></div></div></div>
<div className="flex-1 flex flex-col overflow-hidden px-6 pb-6"><div className="flex-1 overflow-auto custom-scroll bg-white rounded-lg border border-gray-200 shadow-sm w-full mt-2 relative"><div style={rimoStyle("width: max-content; min-width: 100%;")}><div className="gantt-grid bg-slate-50 sticky top-0 z-50" style={rimoStyle(view.gridStyle)}><div className="gantt-cell gantt-header flex items-center justify-center border-b-2 sticky left-0 z-50 bg-slate-50">{text("\n                                    車輛資源\n                                ")}</div>
{rimoEntries(view.gridDates).map(([day, index], _itemIndex) => <Fragment key={index}><div key={index} className={rimoClass(["gantt-cell gantt-header flex flex-col justify-center cursor-pointer hover:bg-blue-100 transition-colors", rimoClass({
                  'bg-blue-50 text-blue-600': view.isToday(day)
                })])} onClick={_event => {
                  view.openDatePanel(day);
                }}><span>{rimoText(day.format('MM/DD'))}</span>
<span className="text-xs mt-1">{rimoText(day.format('ddd'))}</span></div></Fragment>)}</div>
{rimoEntries(view.filteredGroups).map(([group], _itemIndex) => <Fragment key={group.id}><div className="gantt-grid" key={group.id} style={rimoStyle(view.gridStyle)}><div className="bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 border-b border-gray-200 sticky left-0 z-40 border-r" style={rimoStyle({
                  gridColumn: '1 / span 1'
                })}>{text("\n                                    ")}{rimoText(group.name)}{text(" (")}{rimoText(group.vehicles.length)}{text("輛)\n                                ")}</div>
<div className="bg-gray-100 border-b border-gray-200" style={rimoStyle({
                  gridColumn: '2 / -1'
                })}></div>
{rimoEntries(group.vehicles).map(([vehicle], _itemIndex) => <Fragment key={vehicle.id}><><div className="gantt-cell bg-white hover:bg-gray-50 flex flex-col justify-center px-4 cursor-pointer border-r sticky left-0 z-40" onClick={_event => {
                      view.openVehicleDrawer(vehicle);
                    }}><div className="flex items-center justify-between"><span className="font-bold text-slate-800 text-sm">{rimoText(vehicle.plate)}</span>
<RimoElement kind="el-tag" size="small" effect="light" type={view.getStatusType(vehicle.status)} className="scale-90 origin-right border-0">{rimoText(vehicle.statusText)}</RimoElement></div>
<div className="text-xs text-gray-400 mt-0.5 truncate" title={vehicle.model}>{rimoText(vehicle.model)}</div></div>
{rimoEntries(view.gridDates).map(([day, dIndex], _itemIndex) => <Fragment key={dIndex}><div key={dIndex} className={rimoClass(["gantt-cell flex flex-row gap-1 p-1 h-[64px] items-stretch", rimoClass({
                        'bg-slate-50': [0, 6].includes(day.day())
                      })])}>{rimoEntries(view.getOrdersForDay(vehicle, day)).map(([order], _itemIndex) => <Fragment key={order.id}><div key={order.id} className={rimoClass(["relative flex-1 rounded px-2 py-0.5 text-xs cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-center", rimoClass(view.getOrderClass(order, day))])} onClick={event => {
                            event.stopPropagation();
                            view.openOrderDrawer(order);
                          }}><div className="flex items-center justify-between gap-1"><div className="font-bold truncate">{rimoText(order.customer)}</div>
<span className={rimoClass(["shrink-0 rounded border px-1 py-[1px] text-[10px] leading-3 font-medium", rimoClass(view.getDispatchBadgeClass(order.dispatchStatus))])} title={view.getDispatchStatusText(order.dispatchStatus)}>{text("\n                                                    ")}{rimoText(view.viewMode === 'month' ? view.getDispatchStatusShortText(order.dispatchStatus) : view.getDispatchStatusText(order.dispatchStatus))}{text("\n                                                ")}</span></div>
<div className={rimoClass(["scale-90 text-opacity-80 truncate", rimoClass(view.isOrderEnd(order, day) ? 'origin-right' : 'origin-left')])}>{text("\n                                                ")}{rimoText(view.getOrderTimeText(order, day))}{text("\n                                            ")}</div></div></Fragment>)}</div></Fragment>)}</></Fragment>)}</div></Fragment>)}</div></div></div></div><RimoElement kind="el-dialog" modelValue={view.reassignVisible} onModelChange={value => {
      model.write(["reassignVisible"], value);
    }} title="改派車輛" width="560px" className="dispatch-overlay" slots={{
      "footer": _slot => <><span className="dialog-footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["reassignVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmReassign?.(event);
          }}>{text("進入訂單改派")}</RimoElement></span></>
    }}>{() => <><div className="p-4 bg-blue-50 text-blue-700 rounded-md mb-4 text-sm flex items-start"><RimoElement kind="el-icon" className="mr-2 mt-0.5 text-lg"><RimoIcon name="InfoFilled" /></RimoElement>
{text("\n                調度頁發起改派時，實際打開的改派窗口與訂單詳情頁“訂單改派 & 車輛升級”一致，包含車輛選擇、可用時段校驗、同車行限制、差價試算、改派原因、免費升等原因和操作記錄。\n            ")}</div>
<div className="space-y-4"><div><div className="text-xs text-gray-500 mb-1">{text("當前車輛")}</div>
<div className="font-bold text-lg">{rimoText(view.selectedOrder?.vehiclePlate)}</div></div>
<div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 leading-6"><div>{text("本期不在調度頁維護一套獨立改派表單。")}</div>
<div>{text("點擊確認後進入訂單改派流程，目標車輛池、原因枚舉、費用差額和企業月結調增/調減口徑均按訂單詳情頁規則處理。")}</div></div></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.strategyConfigVisible} onModelChange={value => {
      model.write(["strategyConfigVisible"], value);
    }} width="820px" top="8vh" showClose={!view.isCalculating} closeOnClickModal={!view.isCalculating} closeOnPressEscape={!view.isCalculating} beforeClose={view.handleStrategyClose} className="dispatch-overlay" slots={{
      "header": _slot => <><div className="pr-8"><div className="flex items-start gap-4"><div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600"><RimoElement kind="el-icon" size="20"><RimoIcon name="Operation" /></RimoElement></div>
<div><div className="text-[22px] font-bold text-gray-800 tracking-tight">{text("智能優化排班")}</div>
<div className="text-sm text-gray-500 mt-1">{text("對未硬鎖定訂單進行全局重排，生成更優的車輛預分配結果")}</div></div></div></div></>,
      "footer": _slot => <>{!view.isCalculating ? <><div className="w-full flex items-center justify-between"><div className="text-sm">{!view.hasOptimizableOrders ? <><span className="text-amber-600">{text("當前無可優化訂單")}</span></> : null}</div>
<div className="flex items-center gap-3"><RimoElement kind="el-button" onClick={event => {
                view.closeStrategyConfig?.(event);
              }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" disabled={!view.hasOptimizableOrders} onClick={event => {
                view.runOptimization?.(event);
              }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="VideoPlay" /></RimoElement>
{text(" 開始優化\n                        ")}</RimoElement></div></div></> : <><div className="w-full text-left text-sm text-gray-500">{text("正在計算更優排版方案，請稍候…")}</div></>}</>
    }}>{() => <>{!view.isCalculating ? <><div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm font-semibold text-gray-800">{text("優化時間窗口")}</div>
<div className="mt-4 space-y-4"><div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"><RimoElement kind="el-radio-group" modelValue={view.optimizationDays} onModelChange={value => {
                    model.write(["optimizationDays"], value);
                  }} size="default"><RimoElement kind="el-radio-button" label={3}>{text("未來 3 天")}</RimoElement>
<RimoElement kind="el-radio-button" label={7}>{text("未來 7 天")}</RimoElement>
<RimoElement kind="el-radio-button" label={14}>{text("未來 14 天")}</RimoElement></RimoElement></div>
<div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{rimoEntries(view.optimizationFixedRules).map(([rule], _itemIndex) => <Fragment key={rule.title}><div key={rule.title} className="rounded-xl border border-slate-200 bg-white px-4 py-3"><div className="text-sm font-semibold text-gray-800">{rimoText(rule.title)}</div>
<div className="text-xs text-gray-500 mt-1 leading-5">{rimoText(rule.desc)}</div></div></Fragment>)}</div></div></section>
<section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"><div className="flex items-center justify-between mb-4"><div className="text-sm font-semibold text-gray-800">{text("優化範圍概覽")}</div>
<RimoElement kind="el-tag" type="info" effect="plain" round={true}>{text("預分配重排")}</RimoElement></div>
<div className="grid grid-cols-3 gap-3">{rimoEntries(view.optimizationOverviewCards).map(([card], _itemIndex) => <Fragment key={card.label}><div key={card.label} className={rimoClass(["rounded-xl border p-4", rimoClass(card.tone === 'muted' ? 'border-slate-200 bg-slate-100/80' : 'border-white bg-white shadow-sm')])}><div className="flex items-center justify-between"><div className="text-xs text-gray-400 uppercase tracking-wider">{rimoText(card.label)}</div>
{card.tag ? <><RimoElement kind="el-tag" size="small" effect="plain" type={card.tagType || 'info'}>{rimoText(card.tag)}</RimoElement></> : null}</div>
<div className="text-2xl font-bold text-gray-800 mt-3">{rimoText(card.value)}</div>
<div className="text-xs text-gray-500 mt-2 leading-5">{rimoText(card.hint)}</div></div></Fragment>)}</div>
<div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between"><div><div className="text-xs text-gray-400 uppercase tracking-wider">{text("涉及門店 / 當前門店範圍")}</div>
<div className="text-sm font-semibold text-gray-800 mt-1">{rimoText(view.optimizationScope.storeScopeLabel)}</div>
<div className="text-xs text-gray-500 mt-1">{text("本期僅使用取車門店可交付車輛，不發起跨門店調撥。")}</div></div>
<RimoElement kind="el-tag" effect="plain" type="info">{rimoText(view.optimizationScope.storeCountText)}</RimoElement></div></section></div></> : <><div className="py-8 px-2"><div className="flex flex-col items-center"><div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600"><RimoElement kind="el-icon" className="is-loading" size="26"><RimoIcon name="Loading" /></RimoElement></div>
<div className="text-lg font-semibold text-gray-800 mt-5">{text("正在計算更優排版方案，請稍候…")}</div>
<div className="text-sm text-gray-500 mt-2">{text("系統將自動分析訂單、可用車輛與時間衝突，生成本次優化建議")}</div></div>
<div className="mt-8 px-8"><RimoElement kind="el-steps" active={view.calculationStage} alignCenter={true} finishStatus="success"><RimoElement kind="el-step" title="分析訂單" description="篩選未來時間窗內未硬鎖定訂單"></RimoElement>
<RimoElement kind="el-step" title="計算可用車輛" description="校驗庫存、整備緩衝與時間衝突"></RimoElement>
<RimoElement kind="el-step" title="生成優化方案" description="輸出可預覽、可確認的預分配建議"></RimoElement></RimoElement></div></div></>}</>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.smartDispatchVisible} onModelChange={value => {
      model.write(["smartDispatchVisible"], value);
    }} width="1180px" top="4vh" className="dispatch-overlay" slots={{
      "header": _slot => <><div className="pr-8 flex items-start justify-between gap-4"><div><div className="text-[22px] font-bold text-gray-800 tracking-tight">{text("智能優化結果")}</div>
<div className="text-sm text-gray-500 mt-1">{text("已生成新的預分配方案，請確認是否應用")}</div></div>
<div className="flex items-center gap-2"><RimoElement kind="el-tag" type="success" effect="dark" round={true}>{text("優化完成")}</RimoElement>
<RimoElement kind="el-tag" type="info" effect="plain" round={true}>{text("結果預覽")}</RimoElement></div></div></>,
      "footer": _slot => <><div className="w-full flex items-center justify-end gap-3"><RimoElement kind="el-button" onClick={event => {
            view.closeSmartDispatch?.(event);
          }}>{text("關閉")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.applySmartDispatch?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 確認應用優化結果\n                    ")}</RimoElement></div></>
    }}>{() => <><div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2"><section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"><div className="text-sm font-semibold text-gray-800 mb-4">{text("結果總覽")}</div>
<div className="grid grid-cols-3 gap-3">{rimoEntries(view.optimizationResultCards).map(([card], _itemIndex) => <Fragment key={card.label}><div key={card.label} className={rimoClass(["rounded-xl border p-4", rimoClass(card.cardClass)])}><div className="flex items-center justify-between"><div className="text-xs uppercase tracking-wider text-gray-400">{rimoText(card.label)}</div>
<span className={rimoClass(["text-xs font-medium", rimoClass(card.deltaClass)])}>{rimoText(card.delta)}</span></div>
<div className={rimoClass(["text-[28px] font-bold mt-3", rimoClass(card.valueClass)])}>{rimoText(card.value)}</div>
<div className="text-xs text-gray-500 mt-2">{rimoText(card.hint)}</div></div></Fragment>)}</div></section>
<section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between mb-4"><div><div className="text-sm font-semibold text-gray-800">{text("訂單變更明細")}</div>
<div className="text-xs text-gray-500 mt-1">{text("按影響度排序，展示本次重點變更與未納入優化的訂單")}</div></div>
<RimoElement kind="el-tag" type="success" effect="plain">{rimoText(view.optimizationAdjustedCount)}{text(" 筆訂單已優化")}</RimoElement></div>
<RimoElement kind="el-table" data={view.optimizationChangeRows} border={true} stripe={true} height="320"><RimoElement kind="el-table-column" prop="orderNo" label="訂單編號" width="150"></RimoElement>
<RimoElement kind="el-table-column" label="取還車時間" minWidth="180" slots={{
                "default": scope => <><div className="text-sm text-gray-700">{rimoText(scope.row.pickupTime)}</div>
<div className="text-xs text-gray-400 mt-1">{rimoText(scope.row.returnTime)}</div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" prop="group" label="車型組" width="110"></RimoElement>
<RimoElement kind="el-table-column" label="優化前車輛" width="120" slots={{
                "default": scope => <><span className="font-medium text-gray-700">{rimoText(scope.row.beforeVehicle)}</span></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="優化後車輛" width="120" slots={{
                "default": scope => <><span className={rimoClass(["font-medium", rimoClass(scope.row.status === '已優化' ? 'text-emerald-600' : 'text-gray-500')])}>{rimoText(scope.row.afterVehicle)}</span></>
              }}></RimoElement>
<RimoElement kind="el-table-column" prop="reason" label="變更原因" minWidth="240"></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="140" slots={{
                "default": scope => <><RimoElement kind="el-tag" size="small" effect="plain" type={view.getOptimizationStatusType(scope.row.status)}>{rimoText(scope.row.status)}</RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="風險狀態" width="100" slots={{
                "default": scope => <><RimoElement kind="el-tag" size="small" effect="plain" type={view.getOptimizationRiskType(scope.row.risk)}>{rimoText(scope.row.risk)}</RimoElement></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="臨近鎖定" width="110" slots={{
                "default": scope => <><RimoElement kind="el-tag" size="small" effect="plain" type={scope.row.nearLock ? 'warning' : 'success'}>{rimoText(scope.row.nearLock ? '是' : '否')}</RimoElement></>
              }}></RimoElement></RimoElement></section></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.aiDispatchVisible} onModelChange={value => {
      model.write(["aiDispatchVisible"], value);
    }} width="1180px" top="4vh" className="dispatch-overlay" slots={{
      "header": _slot => <><div className="pr-8 flex items-start justify-between gap-4"><div><div className="text-[22px] font-bold text-gray-800 tracking-tight">{text("AI調度分析")}</div>
<div className="text-sm text-gray-500 mt-1">{text("基於租戶模型配置、命中提示詞和調度數據包生成風險診斷與推薦動作")}</div></div>
<div className="flex items-center gap-2"><RimoElement kind="el-tag" type="success" effect="plain" round={true}>{rimoText(view.aiModelInfo.provider)}</RimoElement>
<RimoElement kind="el-tag" type="warning" effect="plain" round={true}>{rimoText(view.aiModelInfo.promptSourceText)}</RimoElement>
<RimoElement kind="el-tag" type="info" effect="plain" round={true}>{rimoText(view.aiModelInfo.promptVersion)}</RimoElement></div></div></>,
      "footer": _slot => <><div className="w-full flex items-center justify-between gap-3"><div className="text-xs text-gray-500">{text("AI 推薦應用前仍執行訂單狀態、車輛狀態、時間窗、人工保護和權限二次校驗。")}</div>
<div className="flex items-center gap-3"><RimoElement kind="el-button" plain={true} onClick={_event => {
              model.write(["aiDispatchActiveTab"], 'requestLog');
            }}>{text("查看請求日誌")}</RimoElement>
<RimoElement kind="el-button" onClick={_event => {
              model.write(["aiDispatchVisible"], false);
            }}>{text("關閉")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
              view.applyAiDispatchRecommendations?.(event);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Check" /></RimoElement>
{text(" 應用可通過校驗的推薦\n                        ")}</RimoElement></div></div></>
    }}>{() => <><RimoElement kind="el-tabs" modelValue={view.aiDispatchActiveTab} onModelChange={value => {
          model.write(["aiDispatchActiveTab"], value);
        }}><RimoElement kind="el-tab-pane" label="分析結果" name="result"><div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2"><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between mb-4"><div><div className="text-sm font-semibold text-gray-800">{text("模型接入狀態")}</div>
<div className="text-xs text-gray-500 mt-1">{text("API Key 由租戶管理員在系統通用參數中維護，前端不回顯明文。")}</div></div>
<RimoElement kind="el-tag" type="success" effect="dark" round={true}>{text("已配置")}</RimoElement></div>
<div className="grid grid-cols-5 gap-3">{rimoEntries(view.aiModelSummaryCards).map(([item], _itemIndex) => <Fragment key={item.label}><div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"><div className="text-xs uppercase tracking-wider text-gray-400">{rimoText(item.label)}</div>
<div className="text-sm font-semibold text-gray-800 mt-2">{rimoText(item.value)}</div>
<div className="text-xs text-gray-500 mt-2 leading-5">{rimoText(item.hint)}</div></div></Fragment>)}</div></section>
<section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"><div className="flex items-center justify-between mb-4"><div><div className="text-sm font-semibold text-gray-800">{text("分析範圍與調用上限")}</div>
<div className="text-xs text-gray-500 mt-1">{text("初版只允許在系統候選池過濾完成後發起模型分析，超出範圍不調用模型。")}</div></div>
<RimoElement kind="el-tag" type="info" effect="plain" round={true}>{text("當前窗口 ")}{rimoText(view.optimizationDays)}{text(" 天")}</RimoElement></div>
<div className="grid grid-cols-4 gap-3">{rimoEntries(view.aiScopeCards).map(([item], _itemIndex) => <Fragment key={item.label}><div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4"><div className="text-xs uppercase tracking-wider text-gray-400">{rimoText(item.label)}</div>
<div className="text-sm font-semibold text-gray-800 mt-2">{rimoText(item.value)}</div>
<div className="text-xs text-gray-500 mt-2 leading-5">{rimoText(item.hint)}</div></div></Fragment>)}</div></section>
<section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"><div className="text-sm font-semibold text-gray-800 mb-4">{text("AI風險總覽")}</div>
<div className="grid grid-cols-4 gap-3">{rimoEntries(view.aiRiskCards).map(([card], _itemIndex) => <Fragment key={card.label}><div key={card.label} className={rimoClass(["rounded-xl border p-4", rimoClass(card.cardClass)])}><div className="text-xs uppercase tracking-wider text-gray-400">{rimoText(card.label)}</div>
<div className={rimoClass(["text-[28px] font-bold mt-3", rimoClass(card.valueClass)])}>{rimoText(card.value)}</div>
<div className="text-xs text-gray-500 mt-2">{rimoText(card.hint)}</div></div></Fragment>)}</div></section>
<section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between mb-4"><div><div className="text-sm font-semibold text-gray-800">{text("風險診斷明細")}</div>
<div className="text-xs text-gray-500 mt-1">{text("AI 僅輸出分析，最終是否處理由調度員確認。")}</div></div>
<RimoElement kind="el-tag" type="warning" effect="plain">{text("需人工複覈 ")}{rimoText(view.aiManualReviewCount)}{text(" 項")}</RimoElement></div>
<RimoElement kind="el-table" data={view.aiRiskRows} border={true} stripe={true} height="220"><RimoElement kind="el-table-column" prop="riskType" label="風險類型" width="130" slots={{
                    "default": scope => <><RimoElement kind="el-tag" size="small" effect="plain" type={view.getAiRiskType(scope.row.severity)}>{rimoText(scope.row.riskType)}</RimoElement></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" prop="orderNo" label="訂單編號" width="150"></RimoElement>
<RimoElement kind="el-table-column" prop="description" label="風險說明" minWidth="320"></RimoElement>
<RimoElement kind="el-table-column" prop="suggestion" label="建議動作" minWidth="240"></RimoElement>
<RimoElement kind="el-table-column" prop="severity" label="等級" width="90" slots={{
                    "default": scope => <><RimoElement kind="el-tag" size="small" type={view.getAiRiskType(scope.row.severity)}>{rimoText(scope.row.severityText)}</RimoElement></>
                  }}></RimoElement></RimoElement></section>
<section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between mb-4"><div><div className="text-sm font-semibold text-gray-800">{text("AI推薦動作")}</div>
<div className="text-xs text-gray-500 mt-1">{text("通過系統校驗的推薦才允許應用；未通過校驗只展示原因。")}</div></div>
<RimoElement kind="el-tag" type="success" effect="plain">{rimoText(view.aiApplicableCount)}{text(" 項可應用")}</RimoElement></div>
<RimoElement kind="el-table" data={view.aiRecommendationRows} border={true} stripe={true} height="280"><RimoElement kind="el-table-column" prop="orderNo" label="訂單編號" width="150"></RimoElement>
<RimoElement kind="el-table-column" prop="currentVehicle" label="當前車輛" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="recommendedVehicle" label="推薦車輛" width="120" slots={{
                    "default": scope => <><span className={rimoClass(["font-medium", rimoClass(scope.row.validation === '通過' ? 'text-[color:var(--app-color-primary)]' : 'text-gray-500')])}>{rimoText(scope.row.recommendedVehicle)}</span></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" prop="reason" label="推薦原因" minWidth="280"></RimoElement>
<RimoElement kind="el-table-column" prop="confidence" label="信心等級" width="110" slots={{
                    "default": scope => <><RimoElement kind="el-tag" size="small" effect="plain" type={view.getAiConfidenceType(scope.row.confidence)}>{rimoText(scope.row.confidenceText)}</RimoElement></>
                  }}></RimoElement>
<RimoElement kind="el-table-column" prop="validation" label="系統校驗" width="110" slots={{
                    "default": scope => <><RimoElement kind="el-tag" size="small" effect="plain" type={scope.row.validation === '通過' ? 'success' : 'warning'}>{rimoText(scope.row.validation)}</RimoElement></>
                  }}></RimoElement></RimoElement></section></div></RimoElement>
<RimoElement kind="el-tab-pane" label="請求日誌" name="requestLog"><div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2"><section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-4 mb-4"><div><div className="text-sm font-semibold text-gray-800">{text("本次模型請求日誌")}</div>
<div className="text-xs text-gray-500 mt-1">{text("展示本次實際提交給模型的提示詞和調度數據包，不展示 API Key 和鑑權 Header。")}</div></div>
<RimoElement kind="el-tag" type="success" effect="plain">{text("已完成隱私過濾")}</RimoElement></div>
<div className="grid grid-cols-4 gap-3">{rimoEntries(view.aiRequestLogCards).map(([item], _itemIndex) => <Fragment key={item.label}><div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"><div className="text-xs uppercase tracking-wider text-gray-400">{rimoText(item.label)}</div>
<div className="text-sm font-semibold text-gray-800 mt-2">{rimoText(item.value)}</div>
<div className="text-xs text-gray-500 mt-2 leading-5">{rimoText(item.hint)}</div></div></Fragment>)}</div></section>
<section className="grid grid-cols-2 gap-4"><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold text-gray-800">{text("完整提示詞正文")}</div>
<RimoElement kind="el-button" size="small" plain={true}>{text("複製提示詞")}</RimoElement></div>
<pre className="h-[320px] overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap">{rimoText(view.aiRequestPromptText)}</pre></div>
<div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold text-gray-800">{text("完整請求數據包")}</div>
<RimoElement kind="el-button" size="small" plain={true}>{text("導出 JSON")}</RimoElement></div>
<pre className="h-[320px] overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap">{rimoText(view.aiRequestPayload)}</pre></div></section>
<section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between mb-4"><div><div className="text-sm font-semibold text-gray-800">{text("隱私過濾與模型返回")}</div>
<div className="text-xs text-gray-500 mt-1">{text("用於讓調度員確認本次請求未提交手機號、證件號、支付資料和 API Key。")}</div></div>
<RimoElement kind="el-tag" type="info" effect="plain">{rimoText(view.aiRequestLog.filteredFields.length)}{text(" 類資料已排除")}</RimoElement></div>
<div className="grid grid-cols-3 gap-4"><div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"><div className="text-xs uppercase tracking-wider text-gray-400 mb-3">{text("已排除資料")}</div>
<div className="flex flex-wrap gap-2">{rimoEntries(view.aiRequestLog.filteredFields).map(([item], _itemIndex) => <Fragment key={item}><RimoElement kind="el-tag" key={item} size="small" type="info" effect="plain">{rimoText(item)}</RimoElement></Fragment>)}</div></div>
<div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4"><div className="text-xs uppercase tracking-wider text-gray-400 mb-3">{text("模型原始返回摘要")}</div>
<pre className="h-[160px] overflow-auto rounded-lg bg-white p-3 text-xs leading-5 text-gray-700 whitespace-pre-wrap">{rimoText(view.aiResponsePayload)}</pre></div></div></section></div></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-drawer" modelValue={view.drawerVisible} onModelChange={value => {
      model.write(["drawerVisible"], value);
    }} title={view.selectedOrder ? '訂單調度詳情' : '詳情'} size="400px" className="dispatch-overlay">{() => <>{view.selectedOrder ? <><><div className="space-y-6"><div className="bg-blue-50 p-4 rounded-lg border border-blue-100"><div className="flex justify-between items-start mb-2"><span className="text-lg font-bold text-blue-900">{rimoText(view.selectedOrder.customer)}</span>
<RimoElement kind="el-tag" type="warning">{rimoText(view.selectedOrder.status)}</RimoElement></div>
<div className="text-sm text-blue-700 space-y-1"><div><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Phone" /></RimoElement>
{text(" ")}{rimoText(view.selectedOrder.phone)}</div>
<div><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Van" /></RimoElement>
{text(" 當前車輛: ")}
<b>{rimoText(view.selectedOrder.vehiclePlate)}</b></div>
<div><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Operation" /></RimoElement>
{text(" 派車狀態:\n                                ")}
<RimoElement kind="el-tag" size="small" effect="plain" type={view.getDispatchTagType(view.selectedOrder.dispatchStatus)}>{text("\n                                    ")}{rimoText(view.getDispatchStatusText(view.selectedOrder.dispatchStatus))}{text("\n                                ")}</RimoElement></div></div></div>
<div><h4 className="text-sm font-bold text-gray-500 mb-2 uppercase">{text("租期信息")}</h4>
<RimoElement kind="el-timeline"><RimoElement kind="el-timeline-item" timestamp={view.selectedOrder.startTime} type="primary" hube="dot"><div className="font-medium">{text("取車 (門店)")}</div></RimoElement>
<RimoElement kind="el-timeline-item" timestamp={view.selectedOrder.endTime} type="success" hube="dot"><div className="font-medium">{text("還車 (門店)")}</div></RimoElement></RimoElement></div>
<div className="pt-4 border-t border-gray-100"><h4 className="text-sm font-bold text-gray-500 mb-4 uppercase">{text("調度操作")}</h4>
<div className="grid grid-cols-2 gap-3"><RimoElement kind="el-button" type="primary" plain={true} onClick={event => {
                    view.showReassignDialog?.(event);
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Refresh" /></RimoElement>
{text(" 改派車輛\n                            ")}</RimoElement>
<RimoElement kind="el-button" type="warning" plain={true}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Calendar" /></RimoElement>
{text(" 修改租期\n                            ")}</RimoElement>
<RimoElement kind="el-button" plain={true} className="col-span-2" onClick={event => {
                    view.goToDetail?.(event);
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Document" /></RimoElement>
{text(" 查看完整訂單詳情\n                            ")}</RimoElement></div></div></div></></> : null}</>}</RimoElement>
<RimoElement kind="el-drawer" modelValue={view.vehicleDrawerVisible} onModelChange={value => {
      model.write(["vehicleDrawerVisible"], value);
    }} title="車輛排程看板詳情" size="450px" className="dispatch-overlay">{() => <>{view.selectedVehicle ? <><><div className="space-y-6"><div className="bg-gray-50 p-4 rounded-lg border border-gray-200"><div className="flex justify-between items-start mb-2"><span className="text-xl font-bold text-slate-800">{rimoText(view.selectedVehicle.plate)}</span>
<RimoElement kind="el-tag" type={view.getStatusType(view.selectedVehicle.status)}>{rimoText(view.selectedVehicle.statusText)}</RimoElement></div>
<div className="text-sm text-gray-500 mb-2">{rimoText(view.selectedVehicle.model)}</div>
<div className="flex items-center space-x-4 text-xs text-gray-400"><span><RimoElement kind="el-icon"><RimoIcon name="Location" /></RimoElement>
{text(" 中心門店")}</span>
<span><RimoElement kind="el-icon"><RimoIcon name="Odometer" /></RimoElement>
{text(" 28,500 km")}</span>
<span><RimoElement kind="el-icon"><RimoIcon name="Lightning" /></RimoElement>
{text(" 油量 85%")}</span></div></div>
<div><h4 className="text-sm font-bold text-gray-500 mb-4 uppercase">{text("排班時間軸 (Timeline)")}</h4>
<div className="pl-2"><RimoElement kind="el-timeline"><RimoElement kind="el-timeline-item" timestamp="2026-02-01" placement="top" type="success"><div className="bg-green-50 p-2 rounded border border-green-100 mb-2"><div className="font-bold text-green-800">{text("保養完成")}</div>
<div className="text-xs text-green-600">{text("4S店定期保養")}</div></div></RimoElement>
{rimoEntries(view.getVehicleOrders(view.selectedVehicle.id)).map(([order], _itemIndex) => <Fragment key={order.id}><><RimoElement kind="el-timeline-item" timestamp={order.startTime} placement="top" color="#409eff"><div className="bg-blue-50 p-3 rounded border border-blue-100 hover:shadow-md transition-shadow cursor-pointer" onClick={_event => {
                            view.openOrderDrawer(order);
                          }}><div className="flex justify-between items-center mb-1"><span className="font-bold text-blue-900">{text("訂單: ")}{rimoText(order.customer)}</span>
<RimoElement kind="el-tag" size="small">{text("用車")}</RimoElement></div>
<div className="text-xs text-blue-700"><div>{rimoText(view.dayjs(order.startTime).format('MM-DD HH:mm'))}{text(" 取車")}</div>
<div>{rimoText(view.dayjs(order.endTime).format('MM-DD HH:mm'))}{text(" 還車")}</div></div></div></RimoElement></></Fragment>)}
<RimoElement kind="el-timeline-item" placement="top" color="#e4e7ed"><div className="text-gray-400 text-xs text-center py-2">{text("未來暫無更多排班")}</div></RimoElement></RimoElement></div></div></div></></> : null}</>}</RimoElement>
<RimoElement kind="el-drawer" modelValue={view.dailyOpsVisible} onModelChange={value => {
      model.write(["dailyOpsVisible"], value);
    }} direction="btt" size="60%" className="dispatch-overlay" slots={{
      "header": _slot => <><div className="flex items-center space-x-4"><h3 className="text-xl font-bold">{rimoText(view.selectedDate ? view.selectedDate.format('YYYY年MM月DD日 (dddd)') : '')}{text("\n                        運營看板")}</h3>
<RimoElement kind="el-tag" type="danger" effect="dark" round={true}>{text("今日衝突: 0")}</RimoElement>
<RimoElement kind="el-tag" type="primary" effect="plain" round={true}>{text("訂單總量: ")}{rimoText(view.dailyOrders.pickup.length + view.dailyOrders.return.length)}</RimoElement></div></>
    }}>{() => <><div className="flex h-full space-x-6 pb-6"><div className="flex-1 bg-blue-50 rounded-xl p-4 flex flex-col"><div className="flex justify-between items-center mb-4 pb-2 border-b border-blue-200"><h4 className="font-bold text-blue-900 flex items-center"><RimoElement kind="el-icon" className="mr-2"><RimoIcon name="Key" /></RimoElement>
{text(" 待取車 (Pickups)")}</h4>
<span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">{rimoText(view.dailyOrders.pickup.length)}</span></div>
<div className="flex-1 overflow-y-auto custom-scroll space-y-3">{rimoEntries(view.dailyOrders.pickup).map(([order], _itemIndex) => <Fragment key={order.id}><div key={order.id} className="bg-white p-3 rounded shadow-sm border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-all" onClick={_event => {
                  view.openOrderDrawer(order);
                }}><div className="flex justify-between"><span className="font-bold text-gray-800">{rimoText(order.customer)}</span>
<span className="font-mono text-blue-600 font-bold">{rimoText(view.dayjs(order.startTime).format('HH:mm'))}</span></div>
<div className="text-xs text-gray-500 mt-1 flex justify-between"><span>{rimoText(view.getVehiclePlate(order.vehicleId))}</span>
<span>{rimoText(order.phone)}</span></div></div></Fragment>)}
{view.dailyOrders.pickup.length === 0 ? <><div className="text-center text-gray-400 py-10">{text("今日無取車任務\n                        ")}</div></> : null}</div></div>
<div className="flex-1 bg-green-50 rounded-xl p-4 flex flex-col"><div className="flex justify-between items-center mb-4 pb-2 border-b border-green-200"><h4 className="font-bold text-green-900 flex items-center"><RimoElement kind="el-icon" className="mr-2"><RimoIcon name="SuccessFilled" /></RimoElement>
{text(" 待還車 (Returns)")}</h4>
<span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">{rimoText(view.dailyOrders.return.length)}</span></div>
<div className="flex-1 overflow-y-auto custom-scroll space-y-3">{rimoEntries(view.dailyOrders.return).map(([order], _itemIndex) => <Fragment key={order.id}><div key={order.id} className="bg-white p-3 rounded shadow-sm border-l-4 border-green-500 cursor-pointer hover:shadow-md transition-all" onClick={_event => {
                  view.openOrderDrawer(order);
                }}><div className="flex justify-between"><span className="font-bold text-gray-800">{rimoText(order.customer)}</span>
<span className="font-mono text-green-600 font-bold">{rimoText(view.dayjs(order.endTime).format('HH:mm'))}</span></div>
<div className="text-xs text-gray-500 mt-1 flex justify-between"><span>{rimoText(view.getVehiclePlate(order.vehicleId))}</span>
<span>{text("門店還車")}</span></div></div></Fragment>)}
{view.dailyOrders.return.length === 0 ? <><div className="text-center text-gray-400 py-10">{text("今日無還車任務\n                        ")}</div></> : null}</div></div>
<div className="flex-1 bg-gray-50 rounded-xl p-4 flex flex-col"><div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200"><h4 className="font-bold text-gray-700 flex items-center"><RimoElement kind="el-icon" className="mr-2"><RimoIcon name="Tools" /></RimoElement>
{text(" 待整備 (Maint)")}</h4>
<span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold">{text("0")}</span></div>
<div className="flex-1 overflow-y-auto custom-scroll"><div className="text-center text-gray-400 py-10">{text("今日無整備任務")}</div></div></div></div></>}</RimoElement></RimoRoot>;
}