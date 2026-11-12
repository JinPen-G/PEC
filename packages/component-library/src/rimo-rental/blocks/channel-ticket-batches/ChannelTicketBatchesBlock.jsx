import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, RimoTable, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './channel-ticket-batches.css';
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
      record: reactive,
      derived: computed,
      watch: watch,
      onMount: onMounted,
      onDispose: onBeforeUnmount
    } = model;
    const filters = reactive({
      keyword: '',
      enterprise: '',
      status: '',
      issueMode: '',
      stationTypes: [],
      station: '',
      pickupRange: []
    });
    const moreFiltersVisible = ref(false);
    const filterToolbar = ref(null);
    const filterLayoutTier = ref(1);
    let filterResizeObserver = null;
    const updateFilterLayout = () => {
      const width = filterToolbar.value?.clientWidth || 0;
      if (width >= 1080) filterLayoutTier.value = 3;else if (width >= 820) filterLayoutTier.value = 2;else filterLayoutTier.value = 1;
    };
    onMounted(() => {
      filterResizeObserver = new ResizeObserver(updateFilterLayout);
      if (filterToolbar.value) filterResizeObserver.observe(filterToolbar.value);
      updateFilterLayout();
    });
    onBeforeUnmount(() => filterResizeObserver?.disconnect());
    const activeBatchCard = ref('');
    const batches = ref([{
      id: 1,
      batchNo: 'GT-KM-20260501-001',
      name: '金門 5 月 A 團租車券',
      enterprise: '金門風獅爺旅行社',
      issueMode: 'LIST',
      stationTypes: ['旅行社團體專用'],
      stations: ['金城民生停車場'],
      pickupAt: '2026-05-01 09:00',
      returnAt: '2026-05-01 17:00',
      availableStartAt: '2026-04-20 00:00',
      availableEndAt: '2026-05-01 17:00',
      totalCount: 12,
      unusedCount: 8,
      usedCount: 4,
      expiredCount: 0,
      issuedCount: 9,
      pendingIssueCount: 3,
      issueFailedCount: 0,
      availabilityStatus: '已過期',
      status: '啓用',
      visitors: [{
        name: '王志明',
        documentNo: 'A123456789',
        memberStatus: '已匹配會員',
        issueStatus: '已發放',
        issueRemark: '已發放到會員賬戶'
      }, {
        name: '林雅婷',
        documentNo: 'B223456789',
        memberStatus: '已匹配會員',
        issueStatus: '已發放',
        issueRemark: '已發放到會員賬戶'
      }, {
        name: '許家豪',
        documentNo: '110101199001011234',
        memberStatus: '待匹配會員',
        issueStatus: '待發放',
        issueRemark: '證件認證匹配後自動發放'
      }, {
        name: '吳佳穎',
        documentNo: '110101199202022345',
        memberStatus: '待匹配會員',
        issueStatus: '待發放',
        issueRemark: '證件認證匹配後自動發放'
      }],
      codes: [{
        code: 'KM-A0501-001',
        visitorName: '王志明',
        documentNo: 'A123456789',
        issueStatus: '已發放',
        status: '已使用',
        member: '王志明 A123456789',
        orderNo: 'TS-KM-20260501-0001',
        orderStatus: '已完成',
        settlementStatus: 'SETTLED',
        overdueMinutes: 0,
        abnormalFeeTotal: 0,
        usedAt: '2026-04-25 10:16'
      }, {
        code: 'KM-A0501-002',
        visitorName: '林雅婷',
        documentNo: 'B223456789',
        issueStatus: '已發放',
        status: '已使用',
        member: '林雅婷 B223456789',
        orderNo: 'TS-KM-20260501-0002',
        orderStatus: '已完成',
        settlementStatus: 'SETTLED',
        overdueMinutes: 42,
        abnormalFeeTotal: 480,
        usedAt: '2026-04-25 10:21'
      }, {
        code: 'KM-A0501-003',
        visitorName: '許家豪',
        documentNo: '110101199001011234',
        issueStatus: '待發放',
        status: '未使用',
        member: '-',
        orderNo: '',
        usedAt: '-'
      }, {
        code: 'KM-A0501-004',
        visitorName: '吳佳穎',
        documentNo: '110101199202022345',
        issueStatus: '待發放',
        status: '未使用',
        member: '-',
        orderNo: '',
        usedAt: '-'
      }, {
        code: 'KM-A0501-005',
        visitorName: '陳柏翰',
        documentNo: 'C123456789',
        issueStatus: '已發放',
        status: '已使用',
        member: '陳柏翰 C123456789',
        orderNo: 'TS-KM-20260501-0008',
        orderStatus: '用車中',
        settlementStatus: 'OVERDUE_IN_PROGRESS',
        overdueMinutes: 35,
        abnormalFeeTotal: null,
        usedAt: '2026-04-25 11:03'
      }, {
        code: 'KM-A0501-006',
        visitorName: '張怡君',
        documentNo: 'D223456789',
        issueStatus: '已發放',
        status: '已使用',
        member: '張怡君 D223456789',
        orderNo: 'TS-KM-20260501-0011',
        orderStatus: '已預約',
        usedAt: '2026-04-25 11:44'
      }]
    }, {
      id: 2,
      batchNo: 'GT-KM-20260503-002',
      name: '藍灣旅行社機場接駁團',
      enterprise: '金門藍灣旅行社',
      issueMode: 'LIST',
      stationTypes: ['旅行社團體專用'],
      stations: ['金湖機場停車場'],
      pickupAt: '2026-05-03 13:30',
      returnAt: '2026-05-03 19:30',
      availableStartAt: '2026-04-25 00:00',
      availableEndAt: '2026-05-03 19:30',
      totalCount: 8,
      unusedCount: 6,
      usedCount: 2,
      expiredCount: 0,
      issuedCount: 5,
      pendingIssueCount: 3,
      issueFailedCount: 0,
      availabilityStatus: '已過期',
      status: '啓用',
      visitors: [{
        name: '黃俊杰',
        documentNo: 'E123456789',
        memberStatus: '已匹配會員',
        issueStatus: '已發放',
        issueRemark: '已發放到會員賬戶'
      }, {
        name: '蔡佳玲',
        documentNo: 'F223456789',
        memberStatus: '已匹配會員',
        issueStatus: '已發放',
        issueRemark: '已發放到會員賬戶'
      }, {
        name: '周冠宇',
        documentNo: '110101198805053456',
        memberStatus: '待匹配會員',
        issueStatus: '待發放',
        issueRemark: '證件認證匹配後自動發放'
      }],
      codes: [{
        code: 'KM-B0503-001',
        visitorName: '黃俊杰',
        documentNo: 'E123456789',
        issueStatus: '已發放',
        status: '已使用',
        member: '黃俊杰 E123456789',
        orderNo: 'TS-KM-20260503-0003',
        orderStatus: '已完成',
        usedAt: '2026-04-25 12:12'
      }, {
        code: 'KM-B0503-002',
        visitorName: '蔡佳玲',
        documentNo: 'F223456789',
        issueStatus: '已發放',
        status: '已使用',
        member: '蔡佳玲 F223456789',
        orderNo: 'TS-KM-20260503-0006',
        orderStatus: '已取消',
        usedAt: '2026-04-25 12:18'
      }, {
        code: 'KM-B0503-003',
        visitorName: '周冠宇',
        documentNo: '110101198805053456',
        issueStatus: '待發放',
        status: '未使用',
        member: '-',
        orderNo: '',
        usedAt: '-'
      }, {
        code: 'KM-B0503-004',
        visitorName: '趙怡安',
        documentNo: 'G123456789',
        issueStatus: '已發放',
        status: '未使用',
        member: '趙怡安 G123456789',
        orderNo: '',
        usedAt: '-'
      }]
    }, {
      id: 4,
      batchNo: 'GT-KM-20260508-004',
      name: '金門環島假期待導入名單批次',
      enterprise: '金門環島假期',
      issueMode: 'LIST',
      stationTypes: ['旅行社團體專用'],
      stations: ['金湖機場停車場'],
      pickupAt: '2026-05-08 10:00',
      returnAt: '2026-05-08 18:00',
      availableStartAt: '2026-05-01 00:00',
      availableEndAt: '2026-05-08 18:00',
      totalCount: 0,
      unusedCount: 0,
      usedCount: 0,
      expiredCount: 0,
      issuedCount: 0,
      pendingIssueCount: 0,
      issueFailedCount: 0,
      availabilityStatus: '待導入名單',
      status: '待導入名單',
      visitors: [],
      codes: []
    }, {
      id: 3,
      batchNo: 'GT-KM-20260510-003',
      name: '海峽科技員工活動租車券',
      enterprise: '海峽科技股份有限公司',
      issueMode: 'QUANTITY',
      stationTypes: ['普通營運據點', '企業活動合作據點'],
      stations: ['山外車站停車場', '臺北信義企業停車場'],
      pickupAt: '2026-05-10 08:30',
      returnAt: '2026-05-10 16:30',
      availableStartAt: '2026-05-01 00:00',
      availableEndAt: '2026-05-10 16:30',
      totalCount: 20,
      unusedCount: 18,
      usedCount: 0,
      expiredCount: 2,
      issuedCount: 0,
      pendingIssueCount: 20,
      issueFailedCount: 0,
      availabilityStatus: '不可使用',
      status: '停用',
      visitors: [],
      codes: [{
        code: 'KM-C0510-001',
        visitorName: '-',
        documentNo: '-',
        issueStatus: '未領取',
        status: '未使用',
        member: '-',
        orderNo: '',
        usedAt: '-'
      }, {
        code: 'KM-C0510-002',
        visitorName: '-',
        documentNo: '-',
        issueStatus: '未領取',
        status: '未使用',
        member: '-',
        orderNo: '',
        usedAt: '-'
      }, {
        code: 'KM-C0510-003',
        visitorName: '-',
        documentNo: '-',
        issueStatus: '未領取',
        status: '已過期',
        member: '-',
        orderNo: '',
        usedAt: '-'
      }, {
        code: 'KM-C0510-004',
        visitorName: '-',
        documentNo: '-',
        issueStatus: '未領取',
        status: '已過期',
        member: '-',
        orderNo: '',
        usedAt: '-'
      }]
    }]);
    const detailVisible = ref(false);
    const batchDialogVisible = ref(false);
    const addTicketDialogVisible = ref(false);
    const importDialogVisible = ref(false);
    const importPreviewReady = ref(false);
    const currentBatch = ref(null);
    const editingBatch = ref(null);
    const addTicketForm = reactive({
      visitorName: '',
      documentNo: '',
      count: 1,
      reason: ''
    });
    const batchForm = reactive({
      name: '',
      enterprise: '',
      serviceMode: '同站租還',
      timeRuleType: 'FIXED_PERIOD',
      issueMode: 'LIST',
      stationTypes: [],
      stations: [],
      pickupAt: '',
      returnAt: '',
      availableStartAt: '',
      availableEndAt: '',
      totalCount: 0,
      hasImportedVisitors: false,
      matchedCount: 0,
      pendingMatchCount: 0,
      status: '啓用'
    });
    watch(() => batchForm.returnAt, val => {
      batchForm.availableEndAt = val || '';
    });
    const importSummary = reactive({
      status: '',
      message: '',
      total: 0,
      matched: 0,
      pending: 0,
      errors: []
    });
    const visitorImportRows = ref([{
      name: '王志明',
      documentNo: 'A123456789',
      memberStatus: '已匹配會員',
      issueStatus: '已發放',
      issueRemark: '已發放到會員賬戶'
    }, {
      name: '陳佩君',
      documentNo: 'C123456789',
      memberStatus: '已匹配會員',
      issueStatus: '已發放',
      issueRemark: '已發放到會員賬戶'
    }, {
      name: '林雅婷',
      documentNo: 'B223456789',
      memberStatus: '已匹配會員',
      issueStatus: '已發放',
      issueRemark: '已發放到會員賬戶'
    }, {
      name: '吳佳穎',
      documentNo: '110101199202022345',
      memberStatus: '待匹配會員',
      issueStatus: '待發放',
      issueRemark: '證件認證匹配後自動發放'
    }]);
    const visitorImportSummary = computed(() => ({
      matched: visitorImportRows.value.filter(item => item.memberStatus === '已匹配會員').length,
      pending: visitorImportRows.value.filter(item => item.issueStatus === '待發放').length
    }));
    const stationTypeOptions = ref([{
      label: '普通營運據點',
      value: '普通營運據點',
      normalEntryVisible: true
    }, {
      label: '旅行社團體專用',
      value: '旅行社團體專用',
      normalEntryVisible: false
    }, {
      label: '企業活動合作據點',
      value: '企業活動合作據點',
      normalEntryVisible: true
    }, {
      label: '機場取還車點',
      value: '機場取還車點',
      normalEntryVisible: true
    }, {
      label: '碼頭取還車點',
      value: '碼頭取還車點',
      normalEntryVisible: true
    }]);
    const batchStats = computed(() => batches.value.reduce((acc, item) => {
      acc.total += 1;
      if (item.status === '啓用') acc.enabled += 1;
      if (item.status === '停用') acc.disabled += 1;
      if (item.status === '待導入名單') acc.pendingImport += 1;
      return acc;
    }, {
      total: 0,
      enabled: 0,
      disabled: 0,
      pendingImport: 0
    }));
    const stationOptions = ref([{
      label: '金城民生停車場',
      value: '金城民生停車場',
      stationType: '旅行社團體專用'
    }, {
      label: '金湖機場停車場',
      value: '金湖機場停車場',
      stationType: '旅行社團體專用'
    }, {
      label: '山外車站停車場',
      value: '山外車站停車場',
      stationType: '普通營運據點'
    }, {
      label: '臺北信義企業停車場',
      value: '臺北信義企業停車場',
      stationType: '企業活動合作據點'
    }, {
      label: '水頭碼頭取還點',
      value: '水頭碼頭取還點',
      stationType: '碼頭取還車點'
    }]);
    const availableStationOptions = computed(() => {
      const selectedTypes = Array.isArray(batchForm.stationTypes) ? batchForm.stationTypes : [];
      if (!selectedTypes.length) return stationOptions.value;
      return stationOptions.value.filter(item => selectedTypes.includes(item.stationType));
    });
    const filterStationOptions = computed(() => {
      const selectedTypes = Array.isArray(filters.stationTypes) ? filters.stationTypes : [];
      if (!selectedTypes.length) return stationOptions.value;
      return stationOptions.value.filter(item => selectedTypes.includes(item.stationType));
    });
    const advancedFilterCount = computed(() => {
      let count = 0;
      if (Array.isArray(filters.stationTypes) && filters.stationTypes.length) count += 1;
      if (filters.station) count += 1;
      if (Array.isArray(filters.pickupRange) && filters.pickupRange.length === 2) count += 1;
      return count;
    });
    const stationVehicleCountMap = {
      '金城民生停車場': 10,
      '金湖機場停車場': 6,
      '山外車站停車場': 12,
      '臺北信義企業停車場': 18,
      '水頭碼頭取還點': 8
    };
    const capacityDemoMode = ref('SAFE');
    const capacityDemoScenarios = {
      SAFE: {
        relatedBatchCount: 1,
        relatedVoucherCount: 3,
        relatedMaxOccupancy: 3
      },
      RISK: {
        relatedBatchCount: 1,
        relatedVoucherCount: 15,
        relatedMaxOccupancy: 10
      }
    };
    const toTimestamp = value => {
      if (!value) return null;
      if (value instanceof Date) return value.getTime();
      const normalized = String(value).replace(' ', 'T');
      const time = new Date(normalized).getTime();
      return Number.isNaN(time) ? null : time;
    };
    const getBatchStations = batch => {
      if (Array.isArray(batch?.stations) && batch.stations.length) return batch.stations;
      return batch?.station ? [batch.station] : [];
    };
    const capacityHint = computed(() => {
      const currentDemand = 12;
      const availableVehicleCount = 16;
      const scenario = capacityDemoScenarios[capacityDemoMode.value];
      const remainingVehicleCount = Math.max(availableVehicleCount - scenario.relatedMaxOccupancy, 0);
      const hasRisk = currentDemand > remainingVehicleCount;
      return {
        visible: true,
        hasRisk,
        currentDemand,
        availableVehicleCount,
        relatedBatchCount: scenario.relatedBatchCount,
        relatedVoucherCount: scenario.relatedVoucherCount,
        relatedMaxOccupancy: scenario.relatedMaxOccupancy,
        remainingVehicleCount,
        tag: hasRisk ? '存在庫存風險' : '未發現庫存風險'
      };
    });
    const filteredBatches = computed(() => {
      return batches.value.filter(item => {
        const keywordMatch = !filters.keyword || item.name.includes(filters.keyword) || item.batchNo.includes(filters.keyword);
        const enterpriseMatch = !filters.enterprise || item.enterprise === filters.enterprise;
        const statusMatch = !filters.status || item.status === filters.status;
        const issueModeMatch = !filters.issueMode || item.issueMode === filters.issueMode;
        const stationTypeMatch = !filters.stationTypes.length || filters.stationTypes.some(type => (item.stationTypes || []).includes(type));
        const stationMatch = !filters.station || getBatchStations(item).includes(filters.station);
        const pickupRangeMatch = !Array.isArray(filters.pickupRange) || filters.pickupRange.length !== 2 || (() => {
          const itemPickupTs = toTimestamp(item.pickupAt);
          const startTs = toTimestamp(filters.pickupRange[0]);
          const endTs = toTimestamp(filters.pickupRange[1]);
          if (!itemPickupTs || !startTs || !endTs) return true;
          return itemPickupTs >= startTs && itemPickupTs <= endTs;
        })();
        return keywordMatch && enterpriseMatch && statusMatch && issueModeMatch && stationTypeMatch && stationMatch && pickupRangeMatch;
      });
    });
    const handleFilterStationTypeChange = () => {
      const availableValues = filterStationOptions.value.map(item => item.value);
      if (filters.station && !availableValues.includes(filters.station)) {
        filters.station = '';
      }
    };
    const resetFilters = () => {
      filters.keyword = '';
      filters.enterprise = '';
      filters.status = '';
      filters.issueMode = '';
      filters.stationTypes = [];
      filters.station = '';
      filters.pickupRange = [];
      moreFiltersVisible.value = false;
      activeBatchCard.value = '';
    };
    const toggleBatchCard = key => {
      const nextKey = activeBatchCard.value === key ? '' : key;
      activeBatchCard.value = nextKey;
      filters.status = nextKey && nextKey !== 'ALL' ? nextKey : '';
    };
    const syncBatchCard = status => {
      activeBatchCard.value = status || '';
    };
    const getIssueModeLabel = mode => {
      return mode === 'QUANTITY' ? '數量生成' : '名單發放';
    };
    const formatIssueSummary = batch => {
      if (batch?.issueMode === 'QUANTITY') {
        return `已領取 ${batch.issuedCount} / 未領取 ${batch.pendingIssueCount}`;
      }
      return `已發放 ${batch.issuedCount} / 待發放 ${batch.pendingIssueCount}`;
    };
    const formatIssueUsageSummary = batch => {
      const issueLabel = batch?.issueMode === 'QUANTITY' ? '已領取' : '已發放';
      return `${issueLabel} ${batch.issuedCount}，已使用 ${batch.usedCount}`;
    };
    const formatStationTypeRange = batch => {
      const values = Array.isArray(batch?.stationTypes) ? batch.stationTypes : [];
      if (!values.length || values.length === stationTypeOptions.value.length) return '全部據點類型';
      return values.join('、');
    };
    const formatStationRange = batch => {
      const values = getBatchStations(batch);
      if (!values.length || values.length === stationOptions.value.length) return '全部適用據點';
      return values.join('、');
    };
    const formatStationRangeSummary = batch => {
      const typeValues = Array.isArray(batch?.stationTypes) ? batch.stationTypes : [];
      const stationValues = getBatchStations(batch);
      const typeCount = !typeValues.length || typeValues.length === stationTypeOptions.value.length ? stationTypeOptions.value.length : typeValues.length;
      const stationCount = !stationValues.length || stationValues.length === stationOptions.value.length ? stationOptions.value.length : stationValues.length;
      return `${typeCount} 類據點 / ${stationCount} 個據點`;
    };
    const formatStationRangeTooltip = batch => {
      return `據點類型：${formatStationTypeRange(batch)}；適用據點：${formatStationRange(batch)}`;
    };
    const getStationTypeEntryText = option => {
      return option?.normalEntryVisible === false ? '不開放一般預約' : '一般預約可用';
    };
    const getStationTypeEntryTagType = option => {
      return option?.normalEntryVisible === false ? 'warning' : 'success';
    };
    const handleStationTypeChange = () => {
      const availableValues = availableStationOptions.value.map(item => item.value);
      batchForm.stations = batchForm.stations.filter(station => availableValues.includes(station));
    };
    const openDetail = row => {
      currentBatch.value = row;
      detailVisible.value = true;
    };
    const openDetailPage = row => {
      window.location.href = `channel_ticket_batch_detail.html?id=${row.id}`;
    };
    const openBatchDialog = row => {
      editingBatch.value = row || null;
      Object.assign(batchForm, row ? {
        name: row.name,
        enterprise: row.enterprise,
        serviceMode: row.serviceMode || '同站租還',
        timeRuleType: row.timeRuleType || 'FIXED_PERIOD',
        issueMode: row.issueMode || 'LIST',
        stationTypes: Array.isArray(row.stationTypes) ? [...row.stationTypes] : stationTypeOptions.value.map(item => item.value),
        stations: getBatchStations(row),
        pickupAt: row.pickupAt,
        returnAt: row.returnAt,
        availableStartAt: row.availableStartAt,
        availableEndAt: row.availableEndAt,
        totalCount: row.totalCount,
        hasImportedVisitors: (row.issueMode || 'LIST') === 'LIST',
        matchedCount: row.issuedCount,
        pendingMatchCount: row.pendingIssueCount,
        status: row.status
      } : {
        name: '',
        enterprise: '',
        serviceMode: '同站租還',
        timeRuleType: 'FIXED_PERIOD',
        issueMode: 'LIST',
        stationTypes: [],
        stations: [],
        pickupAt: '',
        returnAt: '',
        availableStartAt: '',
        availableEndAt: '',
        totalCount: 0,
        hasImportedVisitors: false,
        matchedCount: 0,
        pendingMatchCount: 0,
        status: '啓用'
      });
      batchDialogVisible.value = true;
    };
    const saveBatchMock = () => {
      if (!batchForm.stationTypes.length || !batchForm.stations.length) {
        feedback.ElMessage.warning('請選擇適用據點類型和適用據點');
        return;
      }
      if (batchForm.issueMode === 'QUANTITY' && !Number(batchForm.totalCount)) {
        feedback.ElMessage.warning('請填寫租車券數量');
        return;
      }
      if (batchForm.issueMode === 'LIST' && !batchForm.hasImportedVisitors) {
        batchForm.status = '待導入名單';
        if (!editingBatch.value) {
          const now = new Date();
          const pad = value => String(value).padStart(2, '0');
          batchForm.availableStartAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        }
        batchForm.availableEndAt = batchForm.returnAt;
        batchDialogVisible.value = false;
        feedback.ElMessage.success('原型示意：批次已保存爲待導入名單，後續可在詳情頁導入 / 追加名單');
        return;
      }
      if (!editingBatch.value) {
        const now = new Date();
        const pad = value => String(value).padStart(2, '0');
        batchForm.availableStartAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      }
      batchForm.availableEndAt = batchForm.returnAt;
      batchDialogVisible.value = false;
      feedback.ElMessage.success('原型示意：批次資料已保存');
    };
    const openOrder = row => {
      feedback.ElMessage.info(`打開訂單詳情：${row.orderNo}`);
    };
    const exportCodesMock = () => {
      feedback.ElMessage.success('原型示意：已導出 Excel，包含租車券列表和訂單完整數據兩個 Sheet');
    };
    const buildAddedTicketCode = batch => {
      const nextNo = (batch.codes?.length || 0) + 1;
      return `ADD-${String(batch.id).padStart(2, '0')}-${String(nextNo).padStart(3, '0')}`;
    };
    const openAddTicketDialog = () => {
      addTicketForm.visitorName = '';
      addTicketForm.documentNo = '';
      addTicketForm.count = 1;
      addTicketForm.reason = '';
      addTicketDialogVisible.value = true;
    };
    const saveAddTicketMock = () => {
      const batch = currentBatch.value;
      if (!batch) return;
      if (!addTicketForm.reason.trim()) {
        feedback.ElMessage.warning('請填寫新增原因');
        return;
      }
      if (batch.issueMode === 'LIST') {
        if (!addTicketForm.visitorName.trim() || !addTicketForm.documentNo.trim()) {
          feedback.ElMessage.warning('請填寫用券人姓名和證件號碼');
          return;
        }
        const normalizedDocumentNo = addTicketForm.documentNo.trim().toUpperCase();
        const duplicated = batch.codes.some(item => item.documentNo && item.documentNo !== '-' && item.documentNo.trim().toUpperCase() === normalizedDocumentNo);
        if (duplicated) {
          feedback.ElMessage.warning('該證件號碼已存在於當前批次，不允許重複新增');
          return;
        }
        const issueStatus = /^[A-F]/.test(normalizedDocumentNo) ? '已發放' : '待發放';
        const memberText = issueStatus === '已發放' ? `${addTicketForm.visitorName} ${normalizedDocumentNo}` : '-';
        batch.codes.push({
          code: buildAddedTicketCode(batch),
          visitorName: addTicketForm.visitorName,
          documentNo: normalizedDocumentNo,
          issueStatus,
          status: '未使用',
          member: memberText,
          orderNo: '',
          orderStatus: '',
          usedAt: '-'
        });
        batch.visitors.push({
          name: addTicketForm.visitorName,
          documentNo: normalizedDocumentNo,
          memberStatus: issueStatus === '已發放' ? '已匹配會員' : '待匹配會員',
          issueStatus,
          issueRemark: issueStatus === '已發放' ? '已發放到會員賬戶' : '證件認證匹配後自動發放'
        });
        batch.totalCount += 1;
        batch.unusedCount += 1;
        if (issueStatus === '已發放') batch.issuedCount += 1;else batch.pendingIssueCount += 1;
      } else {
        const count = Number(addTicketForm.count) || 0;
        if (count <= 0) {
          feedback.ElMessage.warning('請填寫新增數量');
          return;
        }
        for (let i = 0; i < count; i += 1) {
          batch.codes.push({
            code: buildAddedTicketCode(batch),
            visitorName: '-',
            documentNo: '-',
            issueStatus: '未領取',
            status: '未使用',
            member: '-',
            orderNo: '',
            orderStatus: '',
            usedAt: '-'
          });
        }
        batch.totalCount += count;
        batch.unusedCount += count;
        batch.pendingIssueCount += count;
      }
      addTicketDialogVisible.value = false;
      feedback.ElMessage.success('原型示意：已新增租車券');
    };
    const openImportDialog = () => {
      importPreviewReady.value = false;
      importSummary.status = '';
      importSummary.message = '';
      importSummary.total = 0;
      importSummary.matched = 0;
      importSummary.pending = 0;
      importSummary.errors = [];
      importDialogVisible.value = true;
    };
    const downloadTemplateMock = () => {
      feedback.ElMessage.info('原型示意：下載用券人名單模板');
    };
    const previewImportMock = hasError => {
      if (hasError) {
        importSummary.status = 'error';
        importSummary.message = '名單中存在證件號碼格式錯誤、重複或必填字段缺失，無法確認導入。請修正後重新選擇文件。';
        importSummary.total = 0;
        importSummary.matched = 0;
        importSummary.pending = 0;
        importSummary.errors = [{
          rowNo: 4,
          documentNo: 'A12345678',
          reason: '證件號碼格式錯誤'
        }, {
          rowNo: 6,
          documentNo: 'A123456789',
          reason: '與當前批次已有證件號碼重複'
        }, {
          rowNo: 8,
          documentNo: '',
          reason: '缺少證件號碼'
        }];
        importPreviewReady.value = true;
        feedback.ElMessage.error('導入異常：請修正格式、重複或缺失字段');
        return;
      }
      importSummary.status = 'success';
      importSummary.message = '名單校驗通過，可以確認導入；同一批次證件號碼均不重複。後續詳情頁只允許追加導入，不覆蓋原名單。';
      importSummary.total = visitorImportRows.value.length;
      importSummary.matched = visitorImportSummary.value.matched;
      importSummary.pending = visitorImportSummary.value.pending;
      importSummary.errors = [];
      importPreviewReady.value = true;
      feedback.ElMessage.success('導入成功');
    };
    const confirmImportVisitors = () => {
      if (importSummary.status !== 'success') {
        feedback.ElMessage.warning('導入異常未處理，不能確認匯入');
        return;
      }
      batchForm.totalCount = importSummary.total;
      batchForm.hasImportedVisitors = true;
      batchForm.matchedCount = importSummary.matched;
      batchForm.pendingMatchCount = importSummary.pending;
      importDialogVisible.value = false;
      feedback.ElMessage.success('原型示意：已導入用券人名單並完成會員匹配');
    };
    const getIssueStatusType = status => {
      if (status === '已發放') return 'success';
      if (status === '發放失敗') return 'danger';
      if (status === '未領取') return 'info';
      return 'warning';
    };
    const getTicketStatusType = status => {
      if (status === '已使用') return 'success';
      if (status === '已過期') return 'info';
      return 'warning';
    };
    const getOrderStatusType = status => {
      if (status === '已完成') return 'success';
      if (status === '已取消') return 'info';
      if (status === '用車中') return 'warning';
      return 'info';
    };
    return {
      filters,
      filterToolbar,
      filterLayoutTier,
      moreFiltersVisible,
      activeBatchCard,
      batchStats,
      advancedFilterCount,
      batches,
      filteredBatches,
      detailVisible,
      batchDialogVisible,
      addTicketDialogVisible,
      importDialogVisible,
      importPreviewReady,
      currentBatch,
      editingBatch,
      addTicketForm,
      batchForm,
      importSummary,
      visitorImportRows,
      visitorImportSummary,
      stationTypeOptions,
      availableStationOptions,
      filterStationOptions,
      capacityHint,
      capacityDemoMode,
      getIssueModeLabel,
      formatIssueSummary,
      formatIssueUsageSummary,
      formatStationTypeRange,
      formatStationRange,
      formatStationRangeSummary,
      formatStationRangeTooltip,
      getStationTypeEntryText,
      getStationTypeEntryTagType,
      handleStationTypeChange,
      handleFilterStationTypeChange,
      resetFilters,
      toggleBatchCard,
      syncBatchCard,
      openDetail,
      openDetailPage,
      openBatchDialog,
      saveBatchMock,
      openOrder,
      exportCodesMock,
      openAddTicketDialog,
      saveAddTicketMock,
      openImportDialog,
      downloadTemplateMock,
      previewImportMock,
      confirmImportVisitors,
      getIssueStatusType,
      getTicketStatusType,
      getOrderStatusType,
      filterResizeObserver,
      updateFilterLayout,
      stationOptions,
      stationVehicleCountMap,
      capacityDemoScenarios,
      toTimestamp,
      getBatchStations,
      buildAddedTicketCode
    };
  }
  return pageSetup();
}
export default function ChannelTicketBatchesBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="channel-ticket-batches" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="mb-5 flex justify-between items-start" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-900">{text("合作通路租車券")}</h1>
<p className="text-sm text-gray-500 mt-1">{text("用於合作通路企業發放免支付租車券，用券人使用後預約租還車輛，費用歸屬到租車券所屬企業。")}</p></div>
<div className="flex gap-3"><RimoElement kind="el-button" type="primary" size="large" className="shadow-md shadow-[color:var(--app-color-primary-shadow)]" onClick={_event => {
            view.openBatchDialog();
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增批次\n                        ")}</RimoElement></div></div>
<div className="grid grid-cols-4 gap-4 mb-5" data-rimo-grid="4"><button type="button" onClick={_event => {
          view.toggleBatchCard('ALL');
        }} className={rimoClass(["text-left bg-white rounded-lg border p-5 transition-all", rimoClass(view.activeBatchCard === 'ALL' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]')])}><div className="text-sm text-gray-500">{text("全部批次")}</div>
<div className="text-[28px] leading-tight font-bold text-gray-800 mt-1">{rimoText(view.batchStats.total)}</div></button>
<button type="button" onClick={_event => {
          view.toggleBatchCard('啓用');
        }} className={rimoClass(["text-left bg-white rounded-lg border p-5 transition-all", rimoClass(view.activeBatchCard === '啓用' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]')])}><div className="text-sm text-gray-500">{text("啓用")}</div>
<div className="text-[28px] leading-tight font-bold text-emerald-600 mt-1">{rimoText(view.batchStats.enabled)}</div></button>
<button type="button" onClick={_event => {
          view.toggleBatchCard('停用');
        }} className={rimoClass(["text-left bg-white rounded-lg border p-5 transition-all", rimoClass(view.activeBatchCard === '停用' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]')])}><div className="text-sm text-gray-500">{text("停用")}</div>
<div className="text-[28px] leading-tight font-bold text-gray-600 mt-1">{rimoText(view.batchStats.disabled)}</div></button>
<button type="button" onClick={_event => {
          view.toggleBatchCard('待導入名單');
        }} className={rimoClass(["text-left bg-white rounded-lg border p-5 transition-all", rimoClass(view.activeBatchCard === '待導入名單' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]')])}><div className="text-sm text-gray-500">{text("待導入名單")}</div>
<div className="text-[28px] leading-tight font-bold text-amber-500 mt-1">{rimoText(view.batchStats.pendingImport)}</div></button></div>
<section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" data-rimo-layout="list"><RimoElement kind="el-table" data={view.filteredBatches} className="w-full" rowKey="id" slots={{
          "toolbar": _slot => <><div className="adaptive-filter-toolbar flex flex-wrap items-center justify-between gap-3"><div className="adaptive-filter-controls flex flex-wrap items-center gap-3"><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
                  model.write(["filters", "keyword"], value);
                }} placeholder="批次名稱 / 批次編號" clearable={true} className="w-56"></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.enterprise} onModelChange={value => {
                  model.write(["filters", "enterprise"], value);
                }} placeholder="合作通路企業" clearable={true} className="w-52"><RimoElement kind="el-option" label="金門風獅爺旅行社" value="金門風獅爺旅行社"></RimoElement>
<RimoElement kind="el-option" label="金門藍灣旅行社" value="金門藍灣旅行社"></RimoElement>
<RimoElement kind="el-option" label="海峽科技股份有限公司" value="海峽科技股份有限公司"></RimoElement>
<RimoElement kind="el-option" label="金門環島假期" value="金門環島假期"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
                  model.write(["filters", "status"], value);
                }} placeholder="批次狀態" clearable={true} className="w-36" onChange={event => {
                  view.syncBatchCard?.(event);
                }}><RimoElement kind="el-option" label="待導入名單" value="待導入名單"></RimoElement>
<RimoElement kind="el-option" label="啓用" value="啓用"></RimoElement>
<RimoElement kind="el-option" label="停用" value="停用"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.issueMode} onModelChange={value => {
                  model.write(["filters", "issueMode"], value);
                }} placeholder="發券方式" clearable={true} className="w-40"><RimoElement kind="el-option" label="名單發放" value="LIST"></RimoElement>
<RimoElement kind="el-option" label="數量生成" value="QUANTITY"></RimoElement></RimoElement>
<RimoElement kind="el-tooltip" content="重置篩選" placement="top"><RimoElement kind="el-button" circle={true} onClick={event => {
                    view.resetFilters?.(event);
                  }} icon="Refresh" data-rimo-filter-reset="true" aria-label="重置筛选"></RimoElement></RimoElement></div></div>
<div className="mt-3 border-t border-gray-200 pt-3"><div className="adaptive-filter-controls flex flex-wrap items-center gap-3"><RimoElement kind="el-select" modelValue={view.filters.stationTypes} onModelChange={value => {
                  model.write(["filters", "stationTypes"], value);
                }} placeholder="適用據點類型" clearable={true} filterable={true} multiple={true} collapseTags={true} collapseTagsTooltip={true} className="w-64" onChange={event => {
                  view.handleFilterStationTypeChange?.(event);
                }} data-rimo-secondary="true">{rimoEntries(view.stationTypeOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-option" key={option.value} label={option.label} value={option.value}><div className="flex items-center justify-between gap-3 w-full"><span>{rimoText(option.label)}</span>
<RimoElement kind="el-tag" size="small" type={view.getStationTypeEntryTagType(option)} effect="plain">{text("\n                                                ")}{rimoText(view.getStationTypeEntryText(option))}{text("\n                                            ")}</RimoElement></div></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.station} onModelChange={value => {
                  model.write(["filters", "station"], value);
                }} placeholder="適用據點" clearable={true} filterable={true} className="w-56" data-rimo-secondary="true">{rimoEntries(view.filterStationOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-option" key={option.value} label={option.label} value={option.value}></RimoElement></Fragment>)}</RimoElement>
<div className="ticket-filter-daterange-wrap"><RimoElement kind="el-date-picker" modelValue={view.filters.pickupRange} onModelChange={value => {
                    model.write(["filters", "pickupRange"], value);
                  }} type="datetimerange" rangeSeparator="至" startPlaceholder="取車開始" endPlaceholder="取車結束" valueFormat="YYYY-MM-DD HH:mm:ss" className="ticket-filter-daterange" data-rimo-secondary="true"></RimoElement></div></div></div></>
        }}><RimoElement kind="el-table-column" prop="batchNo" label="批次編號" width="170"></RimoElement>
<RimoElement kind="el-table-column" label="批次名稱" minWidth="180" slots={{
            "default": ({
              row
            }) => <><div className="font-semibold text-gray-900">{rimoText(row.name)}</div>
<div className="text-xs text-gray-500">{text("同站租還 / 租車券")}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="enterprise" label="所屬合作企業" minWidth="160"></RimoElement>
<RimoElement kind="el-table-column" label="適用據點範圍" minWidth="160" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tooltip" content={view.formatStationRangeTooltip(row)} placement="top" effect="dark" popperClass="station-range-tooltip"><div><div className="text-sm text-gray-900 truncate">{rimoText(view.formatStationRangeSummary(row))}</div>
<div className="text-xs text-gray-500 truncate">{rimoText(view.formatStationTypeRange(row))}</div></div></RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="固定取還車時間" minWidth="230" slots={{
            "default": ({
              row
            }) => <><div>{rimoText(row.pickupAt)}</div>
<div className="text-xs text-gray-500">{rimoText(row.returnAt)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="可用時間段" minWidth="230" slots={{
            "default": ({
              row
            }) => <><div>{rimoText(row.availableStartAt)}</div>
<div className="text-xs text-gray-500">{rimoText(row.availableEndAt)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="發券方式" width="110" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type="info" effect="plain">{rimoText(view.getIssueModeLabel(row.issueMode))}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="數量 / 發放使用統計" width="210" slots={{
            "default": ({
              row
            }) => <><div className="text-sm text-gray-900">{text("總數 ")}{rimoText(row.totalCount)}</div>
<div className="text-xs text-gray-500">{rimoText(view.formatIssueUsageSummary(row))}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="100" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={row.status === '啓用' ? 'success' : row.status === '待導入名單' ? 'warning' : 'info'} effect="plain">{rimoText(row.status)}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="210" fixed="right" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                view.openDetailPage(row);
              }}>{text("查看詳情")}</RimoElement>
<RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                view.openBatchDialog(row);
              }}>{text("編輯")}</RimoElement>
<RimoElement kind="el-tooltip" content={row.status === '待導入名單' ? '進入詳情頁導入名單後再啓用' : '進入詳情頁填寫原因後處理'} placement="top"><RimoElement kind="el-button" type={row.status === '啓用' ? 'danger' : 'primary'} link={true} onClick={_event => {
                  view.openDetailPage(row);
                }}>{rimoText(row.status === '待導入名單' ? '導入名單' : row.status === '啓用' ? '停用' : '啓用')}</RimoElement></RimoElement></>
          }}></RimoElement></RimoElement></section></div><RimoElement kind="el-dialog" modelValue={view.detailVisible} onModelChange={value => {
      model.write(["detailVisible"], value);
    }} title="批次詳情" width="min(1320px, 92vw)" className="channel-ticket-batches-overlay">{() => <>{view.currentBatch ? <><div className="space-y-5"><RimoTable className="info-table"><tbody><tr><th>{text("批次編號")}</th>
<td>{rimoText(view.currentBatch.batchNo)}</td>
<th>{text("批次名稱")}</th>
<td>{rimoText(view.currentBatch.name)}</td></tr>
<tr><th>{text("所屬合作企業")}</th>
<td>{rimoText(view.currentBatch.enterprise)}</td>
<th>{text("適用服務")}</th>
<td>{text("分時租賃 / 同站租還")}</td></tr>
<tr><th>{text("適用據點類型")}</th>
<td><div>{rimoText(view.formatStationTypeRange(view.currentBatch))}</div></td>
<th>{text("批次狀態")}</th>
<td><RimoElement kind="el-tag" type={view.currentBatch.status === '啓用' ? 'success' : view.currentBatch.status === '待導入名單' ? 'warning' : 'info'} effect="plain">{text("\n                                    ")}{rimoText(view.currentBatch.status)}{text("\n                                ")}</RimoElement></td></tr>
<tr><th>{text("適用據點")}</th>
<td>{rimoText(view.formatStationRange(view.currentBatch))}</td>
<th>{text("發券方式")}</th>
<td>{rimoText(view.getIssueModeLabel(view.currentBatch.issueMode))}</td></tr>
<tr><th>{text("時間規則")}</th>
<td>{text("固定取還車時間")}</td>
<th>{text("固定時長模式")}</th>
<td>{text("預留，未開放")}</td></tr>
<tr><th>{text("固定取車時間")}</th>
<td>{rimoText(view.currentBatch.pickupAt)}</td>
<th>{text("固定還車時間")}</th>
<td>{rimoText(view.currentBatch.returnAt)}</td></tr>
<tr><th>{text("票券可用開始")}</th>
<td>{rimoText(view.currentBatch.availableStartAt)}</td>
<th>{text("票券可用結束")}</th>
<td>{rimoText(view.currentBatch.availableEndAt)}</td></tr>
<tr><th>{text("租車券數量")}</th>
<td>{rimoText(view.currentBatch.totalCount)}</td>
<th>{text("發放統計")}</th>
<td>{rimoText(view.formatIssueSummary(view.currentBatch))}{text(" / 失敗 ")}{rimoText(view.currentBatch.issueFailedCount)}</td></tr>
<tr><th>{text("使用統計")}</th>
<td>{text("未使用 ")}{rimoText(view.currentBatch.unusedCount)}{text(" / 已使用 ")}{rimoText(view.currentBatch.usedCount)}{text(" / 已過期 ")}{rimoText(view.currentBatch.expiredCount)}</td>
<th>{text("庫存口徑")}</th>
<td>{text("不保留車輛，按實時可用車輛查詢")}</td></tr></tbody></RimoTable>
<div><div className="flex items-center justify-between mb-3" data-rimo-layout="toolbar"><h3 className="font-semibold text-gray-900">{text("租車券列表")}</h3>
<div className="flex items-center gap-3"><span className="text-xs text-gray-500">{text("創建訂單即已使用；訂單取消後未過期前恢復未使用，可重新預約")}</span>
<RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={event => {
                    view.openAddTicketDialog?.(event);
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 新增租車券\n                            ")}</RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} size="small" title="導出 Excel：租車券列表 + 訂單完整數據" onClick={event => {
                    view.exportCodesMock?.(event);
                  }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text(" 導出\n                            ")}</RimoElement></div></div>
<RimoElement kind="el-table" data={view.currentBatch.codes} border={true}><RimoElement kind="el-table-column" prop="code" label="租車券編號" minWidth="150"></RimoElement>
<RimoElement kind="el-table-column" label="用券人信息" minWidth="145" slots={{
                  "default": ({
                    row
                  }) => <>{row.visitorName ? <><div className="text-sm text-gray-900">{rimoText(row.visitorName)}</div></> : null}
{row.documentNo ? <><div className="text-xs text-gray-500">{rimoText(row.documentNo)}</div></> : null}
{!row.visitorName && !row.documentNo ? <><span className="text-gray-400">{text("-")}</span></> : null}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="發放狀態" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" type={view.getIssueStatusType(row.issueStatus)} effect="plain">{text("\n                                    ")}{rimoText(row.issueStatus)}{text("\n                                ")}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="使用狀態" width="100" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-tag" type={view.getTicketStatusType(row.status)} effect="plain">{text("\n                                    ")}{rimoText(row.status)}{text("\n                                ")}</RimoElement></>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="member" label="使用會員" minWidth="135"></RimoElement>
<RimoElement kind="el-table-column" prop="orderNo" label="訂單號" minWidth="145" slots={{
                  "default": ({
                    row
                  }) => <>{row.orderNo ? <><div className="space-y-1"><div className="font-medium text-gray-900 break-all">{rimoText(row.orderNo)}</div>
<RimoElement kind="el-tag" size="small" type={view.getOrderStatusType(row.orderStatus)} effect="plain">{text("\n                                        ")}{rimoText(row.orderStatus || '訂單已建立')}{text("\n                                    ")}</RimoElement></div></> : <><span className="text-gray-400">{text("-")}</span></>}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" label="訂單結算" minWidth="165" slots={{
                  "default": ({
                    row
                  }) => <>{!row.orderNo ? <><span className="text-gray-400">{text("-")}</span></> : row.settlementStatus === 'OVERDUE_IN_PROGRESS' ? <><div className="space-y-1"><RimoElement kind="el-tag" type="warning" effect="plain" size="small">{text("逾時中")}</RimoElement>
<div className="text-xs text-amber-700">{text("已逾時 ")}{rimoText(row.overdueMinutes)}{text(" 分鐘")}</div>
<div className="text-xs text-gray-500">{text("費用待結算")}</div></div></> : Number(row.abnormalFeeTotal || 0) > 0 ? <><div className="space-y-1"><div className="text-sm font-medium text-red-600">{text("逾時 ")}{rimoText(row.overdueMinutes)}{text(" 分鐘")}</div>
<div className="text-xs text-gray-600">{text("異常費用 NT$ ")}{rimoText(Number(row.abnormalFeeTotal).toLocaleString())}</div></div></> : row.orderStatus === '已取消' ? <><span className="text-gray-500">{text("訂單已取消")}</span></> : row.orderStatus === '已完成' ? <><span className="text-green-600">{text("正常結算")}</span></> : <><div className="text-gray-500"><div>{text("暫無異常費用")}</div>
<div className="text-xs mt-1">{text("待結算")}</div></div></>}</>
                }}></RimoElement>
<RimoElement kind="el-table-column" prop="usedAt" label="使用時間" minWidth="140"></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="120" fixed="right" slots={{
                  "default": ({
                    row
                  }) => <><RimoElement kind="el-button" type="primary" link={true} disabled={!row.orderNo} onClick={_event => {
                      view.openOrder(row);
                    }}>{text("查看訂單")}</RimoElement></>
                }}></RimoElement></RimoElement></div></div></> : null}</>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.addTicketDialogVisible} onModelChange={value => {
      model.write(["addTicketDialogVisible"], value);
    }} title="新增租車券" width="560px" className="channel-ticket-batches-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["addTicketDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveAddTicketMock?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <>{view.currentBatch ? <><div className="space-y-4"><div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">{text("\n                    新增租車券將繼承當前批次的合作企業、固定取還車時間、可用時間段和適用據點範圍。\n                ")}</div>
<RimoElement kind="el-form" labelWidth="110px"><RimoElement kind="el-form-item" label="當前批次"><div className="text-sm text-gray-900">{rimoText(view.currentBatch.name)}</div></RimoElement>
<RimoElement kind="el-form-item" label="發券方式"><RimoElement kind="el-tag" type="info" effect="plain">{rimoText(view.getIssueModeLabel(view.currentBatch.issueMode))}</RimoElement></RimoElement>
{view.currentBatch.issueMode === 'LIST' ? <><><RimoElement kind="el-form-item" label="用券人姓名" required={true}><RimoElement kind="el-input" modelValue={view.addTicketForm.visitorName} onModelChange={value => {
                      model.write(["addTicketForm", "visitorName"], value);
                    }} placeholder="請輸入用券人姓名"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="證件號碼" required={true}><RimoElement kind="el-input" modelValue={view.addTicketForm.documentNo} onModelChange={value => {
                      model.write(["addTicketForm", "documentNo"], value);
                    }} placeholder="請輸入證件號碼"></RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("可填寫身份證或入臺證號碼，不選擇證件類型。匹配會員已認證資料時直接發放，未匹配時保持待發放。")}</div></RimoElement></></> : <><><RimoElement kind="el-form-item" label="新增數量" required={true}><RimoElement kind="el-input-number" modelValue={view.addTicketForm.count} onModelChange={value => {
                      model.write(["addTicketForm", "count"], value);
                    }} min={1} max={99} controlsPosition="right"></RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("保存後生成對應數量的租車券和兌換碼，初始狀態爲未領取。")}</div></RimoElement></></>}
<RimoElement kind="el-form-item" label="新增原因" required={true}><RimoElement kind="el-input" modelValue={view.addTicketForm.reason} onModelChange={value => {
                  model.write(["addTicketForm", "reason"], value);
                }} type="textarea" rows={3} placeholder="例如：名單遺漏、活動臨時加名額、現場補發"></RimoElement></RimoElement></RimoElement></div></> : null}</>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.batchDialogVisible} onModelChange={value => {
      model.write(["batchDialogVisible"], value);
    }} title={view.editingBatch ? '編輯批次' : '新增批次'} width="960px" className="channel-ticket-batches-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["batchDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveBatchMock?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" labelWidth="120px"><div className="grid grid-cols-2 gap-4" style={rimoStyle("align-items: flex-start;")} data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="批次名稱" required={true}><RimoElement kind="el-input" modelValue={view.batchForm.name} onModelChange={value => {
                model.write(["batchForm", "name"], value);
              }} placeholder="例如：海峽科技員工活動租車券"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="所屬合作企業" required={true}><RimoElement kind="el-select" modelValue={view.batchForm.enterprise} onModelChange={value => {
                model.write(["batchForm", "enterprise"], value);
              }} placeholder="選擇合作通路企業" filterable={true} className="w-full"><RimoElement kind="el-option" label="金門風獅爺旅行社" value="金門風獅爺旅行社"></RimoElement>
<RimoElement kind="el-option" label="金門藍灣旅行社" value="金門藍灣旅行社"></RimoElement>
<RimoElement kind="el-option" label="金門環島假期" value="金門環島假期"></RimoElement>
<RimoElement kind="el-option" label="海峽科技股份有限公司" value="海峽科技股份有限公司"></RimoElement></RimoElement></RimoElement></div>
<RimoElement kind="el-form-item" label="適用營運類型" required={true}><RimoElement kind="el-radio-group" modelValue={view.batchForm.serviceMode} onModelChange={value => {
              model.write(["batchForm", "serviceMode"], value);
            }}><RimoElement kind="el-radio-button" label="同站租還"></RimoElement>
<RimoElement kind="el-radio-button" label="甲租乙還" disabled={true}></RimoElement></RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("本期僅支持同站租還。")}</div></RimoElement>
<RimoElement kind="el-form-item" label="時間規則" required={true}><RimoElement kind="el-radio-group" modelValue={view.batchForm.timeRuleType} onModelChange={value => {
              model.write(["batchForm", "timeRuleType"], value);
            }}><RimoElement kind="el-radio-button" label="FIXED_PERIOD">{text("固定取還車時間")}</RimoElement>
<RimoElement kind="el-radio-button" label="FIXED_DURATION" disabled={true}>{text("固定租用時長（預留）")}</RimoElement></RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("固定租用時長用於金門後續迭代及臺灣市場擴展，本期不可選擇。")}</div></RimoElement>
<div className="grid grid-cols-2 gap-4" style={rimoStyle("align-items: flex-start;")} data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="適用據點類型" required={true}><RimoElement kind="el-select" modelValue={view.batchForm.stationTypes} onModelChange={value => {
                model.write(["batchForm", "stationTypes"], value);
              }} placeholder="請選擇適用據點類型" filterable={true} className="w-full" multiple={true} collapseTags={true} collapseTagsTooltip={true} onChange={event => {
                view.handleStationTypeChange?.(event);
              }}>{rimoEntries(view.stationTypeOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-option" key={option.value} label={option.label} value={option.value}><div className="flex items-center justify-between gap-3 w-full"><span>{rimoText(option.label)}</span>
<RimoElement kind="el-tag" size="small" type={view.getStationTypeEntryTagType(option)} effect="plain">{text("\n                                        ")}{rimoText(view.getStationTypeEntryText(option))}{text("\n                                    ")}</RimoElement></div></RimoElement></Fragment>)}</RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("普通企業活動可選擇一般預約可用的據點類型；專用活動可選擇不開放一般預約的據點類型。")}</div></RimoElement>
<RimoElement kind="el-form-item" label="適用據點" required={true}><RimoElement kind="el-select" modelValue={view.batchForm.stations} onModelChange={value => {
                model.write(["batchForm", "stations"], value);
              }} placeholder="請選擇適用據點" filterable={true} className="w-full" multiple={true} collapseTags={true} collapseTagsTooltip={true}>{rimoEntries(view.availableStationOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-option" key={option.value} label={option.label} value={option.value}></RimoElement></Fragment>)}</RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("用券人只能在本批次選定的據點範圍內查詢車輛和預約訂單。")}</div></RimoElement></div>
<div className="grid grid-cols-2 gap-4" style={rimoStyle("align-items: flex-start;")} data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="取車時間" required={true}><RimoElement kind="el-date-picker" modelValue={view.batchForm.pickupAt} onModelChange={value => {
                model.write(["batchForm", "pickupAt"], value);
              }} type="datetime" placeholder="選擇取車時間" className="w-full" style={rimoStyle("width: 100%;")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="還車時間" required={true}><RimoElement kind="el-date-picker" modelValue={view.batchForm.returnAt} onModelChange={value => {
                model.write(["batchForm", "returnAt"], value);
              }} type="datetime" placeholder="選擇還車時間" className="w-full" style={rimoStyle("width: 100%;")}></RimoElement></RimoElement></div>
<div className="grid grid-cols-2 gap-4" style={rimoStyle("align-items: flex-start;")} data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="可用開始時間"><RimoElement kind="el-date-picker" modelValue={view.batchForm.availableStartAt} onModelChange={value => {
                model.write(["batchForm", "availableStartAt"], value);
              }} type="datetime" placeholder="正式批次建立時自動生成" className="w-full" style={rimoStyle("width: 100%;")} disabled={true}></RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("系統固定取正式批次建立成功時間，不提供人工選擇。")}</div></RimoElement>
<RimoElement kind="el-form-item" label="可用結束時間"><RimoElement kind="el-date-picker" modelValue={view.batchForm.availableEndAt} onModelChange={value => {
                model.write(["batchForm", "availableEndAt"], value);
              }} type="datetime" placeholder="默認固定還車時間" className="w-full" style={rimoStyle("width: 100%;")} disabled={true}></RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("系統固定等於固定還車時間，不提供人工選擇。")}</div></RimoElement></div>
<RimoElement kind="el-form-item" label="發券方式"><RimoElement kind="el-radio-group" modelValue={view.batchForm.issueMode} onModelChange={value => {
              model.write(["batchForm", "issueMode"], value);
            }}><RimoElement kind="el-radio-button" label="LIST">{text("名單發放")}</RimoElement>
<RimoElement kind="el-radio-button" label="QUANTITY">{text("數量生成")}</RimoElement></RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("兩種方式都固定取還車時間；數量生成後由合作企業對外發放兌換碼，用戶在 APP 主動兌換。")}</div></RimoElement>
<div className="grid grid-cols-2 gap-4" style={rimoStyle("align-items: flex-start;")} data-rimo-grid="2" data-rimo-layout="form-grid">{view.batchForm.issueMode === 'QUANTITY' ? <><RimoElement kind="el-form-item" label="租車券數量" required={true}><RimoElement kind="el-input-number" modelValue={view.batchForm.totalCount} onModelChange={value => {
                  model.write(["batchForm", "totalCount"], value);
                }} min={0} max={999} className="w-full"></RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("數量生成時由營運人員填寫。")}</div></RimoElement></> : null}
<RimoElement kind="el-form-item" label="批次狀態">{view.batchForm.issueMode === 'LIST' && !view.batchForm.hasImportedVisitors ? <><><RimoElement kind="el-tag" type="warning" effect="plain">{text("待導入名單")}</RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("名單發放可先保存批次基礎信息；保存後不會生成租車券，也不會在 APP 展示。")}</div></></> : <><RimoElement kind="el-radio-group" modelValue={view.batchForm.status} onModelChange={value => {
                  model.write(["batchForm", "status"], value);
                }}><RimoElement kind="el-radio-button" label="啓用"></RimoElement>
<RimoElement kind="el-radio-button" label="停用"></RimoElement></RimoElement></>}</RimoElement></div>
{view.batchForm.issueMode === 'LIST' ? <><RimoElement kind="el-form-item" label="用券人名單"><div className="w-full"><div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4"><div className="flex items-center justify-between gap-3" data-rimo-layout="toolbar"><div><div className="text-sm font-semibold text-gray-900">{text("名單發放")}</div>
<div className="text-xs text-gray-500 mt-1">{text("支持創建時導入，也可先保存批次後在詳情頁導入 / 追加名單；不支持覆蓋原名單。")}</div></div>
<RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={event => {
                      view.openImportDialog?.(event);
                    }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Upload" /></RimoElement>
{text(" 導入名單\n                                ")}</RimoElement></div></div></div></RimoElement></> : null}
<div className="ml-[120px] mb-4"><div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 space-y-2"><div className="flex items-start gap-3"><div className="w-[84px] shrink-0 pt-0.5 text-xs font-medium text-gray-700">{text("\n                                ")}{rimoText(view.batchForm.issueMode === 'LIST' ? '名單匯入結果' : '生成數量')}{text("\n                            ")}</div>
<div className="min-w-0 flex-1"><div className="flex items-center gap-2"><RimoElement kind="el-tag" type={view.batchForm.issueMode === 'LIST' ? view.batchForm.hasImportedVisitors ? 'info' : 'warning' : view.batchForm.totalCount > 0 ? 'success' : 'warning'} effect="plain" size="small">{text("\n                                        ")}{rimoText(view.batchForm.issueMode === 'LIST' ? view.batchForm.hasImportedVisitors ? '已匯入' : '待匯入' : view.batchForm.totalCount > 0 ? '已填寫' : '待填寫')}{text("\n                                    ")}</RimoElement>
<div className={rimoClass(["text-xs leading-5", rimoClass(view.batchForm.issueMode === 'LIST' ? view.batchForm.hasImportedVisitors ? 'text-blue-700' : 'text-amber-700' : 'text-blue-700')])}>{text("\n                                        ")}{rimoText(view.batchForm.issueMode === 'LIST' ? view.batchForm.hasImportedVisitors ? `名單 ${view.batchForm.totalCount} 行；已匹配會員 ${view.batchForm.matchedCount} 行；待匹配會員 ${view.batchForm.pendingMatchCount} 行。` : '尚未導入用券人名單；可先保存爲待導入名單，後續在詳情頁導入 / 追加。' : `批次保存後生成 ${view.batchForm.totalCount || 0} 張租車券及兌換碼。`)}{text("\n                                    ")}</div></div>
<div className="text-xs mt-0.5 leading-5 text-gray-500">{text("\n                                    ")}{rimoText(view.batchForm.issueMode === 'LIST' ? view.batchForm.hasImportedVisitors ? '同一批次證件號碼不得重複；未匹配會員的租車券保留待發放。' : '支持字段：用券人姓名、證件號碼；不設置證件類型；創建後只允許追加導入。' : '數量生成不預綁定證件號碼；用戶在 APP 兌換後，租車券綁定到當前會員賬戶。')}{text("\n                                ")}</div></div></div>
<div className="border-t border-slate-200"></div>
<div className="flex items-start gap-3"><div className="w-[84px] shrink-0 pt-0.5 text-xs font-medium text-gray-700">{text("車輛庫存提醒")}</div>
<div className="min-w-0 flex-1"><div className="flex items-center gap-2"><RimoElement kind="el-tag" type={view.capacityHint.hasRisk ? 'warning' : 'success'} effect="plain" size="small">{text("\n                                        ")}{rimoText(view.capacityHint.tag)}{text("\n                                    ")}</RimoElement></div>
<div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600"><span>{text("當前批次 ")}
<b className="text-gray-800">{rimoText(view.capacityHint.currentDemand)}{text(" 張")}</b></span>
<span>{text("適用據點可用 ")}
<b className="text-gray-800">{rimoText(view.capacityHint.availableVehicleCount)}{text(" 臺")}</b></span>
<span>{text("其他相關批次最多佔用 ")}
<b className="text-gray-800">{rimoText(view.capacityHint.relatedMaxOccupancy)}{text(" 臺")}</b></span>
<span>{text("預計剩餘 ")}
<b className={rimoClass(view.capacityHint.hasRisk ? 'text-amber-700' : 'text-emerald-700')}>{rimoText(view.capacityHint.remainingVehicleCount)}{text(" 臺")}</b></span></div></div>
<div className="ml-auto shrink-0"><div className="mb-1 text-right text-[11px] text-gray-400">{text("原型狀態")}</div>
<RimoElement kind="el-button-group"><RimoElement kind="el-button" size="small" type={view.capacityDemoMode === 'SAFE' ? 'primary' : 'default'} onClick={_event => {
                      model.write(["capacityDemoMode"], 'SAFE');
                    }}>{text("無庫存風險")}</RimoElement>
<RimoElement kind="el-button" size="small" type={view.capacityDemoMode === 'RISK' ? 'warning' : 'default'} onClick={_event => {
                      model.write(["capacityDemoMode"], 'RISK');
                    }}>{text("有庫存風險")}</RimoElement></RimoElement></div></div></div></div></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.importDialogVisible} onModelChange={value => {
      model.write(["importDialogVisible"], value);
    }} title="導入用券人名單" width="680px" className="channel-ticket-batches-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["importDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" disabled={!view.importPreviewReady || view.importSummary.status !== 'success'} onClick={event => {
          view.confirmImportVisitors?.(event);
        }}>{text("確認匯入")}</RimoElement></>
    }}>{() => <><div className="space-y-4"><div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3" data-rimo-layout="toolbar"><div><div className="text-sm font-semibold text-gray-900">{text("名單模板")}</div>
<div className="text-xs text-gray-500 mt-1">{text("模板字段：用券人姓名、證件號碼，不包含證件類型。同一批次證件號碼不得重複；後續只允許追加導入。")}</div></div>
<RimoElement kind="el-button" plain={true} size="small" onClick={event => {
                view.downloadTemplateMock?.(event);
              }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text(" 下載模板\n                        ")}</RimoElement></div></div>
<div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center"><RimoElement kind="el-icon" className="text-2xl text-slate-400"><RimoIcon name="UploadFilled" /></RimoElement>
<div className="text-sm text-gray-900 mt-2">{text("選擇名單文件")}</div>
<div className="text-xs text-gray-500 mt-1">{text("原型示意爲直接生成匯入結果")}</div>
<div className="mt-3 flex items-center justify-center gap-2"><RimoElement kind="el-button" type="primary" plain={true} size="small" onClick={_event => {
                view.previewImportMock(false);
              }}>{text("模擬成功導入")}</RimoElement>
<RimoElement kind="el-button" type="danger" plain={true} size="small" onClick={_event => {
                view.previewImportMock(true);
              }}>{text("模擬格式異常")}</RimoElement></div></div>
{view.importPreviewReady ? <><div className="rounded-lg border border-blue-100 bg-blue-50 p-4"><RimoElement kind="el-alert" title={view.importSummary.status === 'success' ? '導入成功' : '導入異常'} type={view.importSummary.status === 'success' ? 'success' : 'error'} showIcon={true} closable={false} slots={{
                "default": _slot => <>{rimoText(view.importSummary.message)}</>
              }}></RimoElement>
{view.importSummary.status === 'success' ? <><div className="grid grid-cols-3 gap-3 mt-3 text-sm" data-rimo-grid="3"><div className="bg-white rounded-lg border border-blue-100 p-3"><div className="text-gray-500 text-xs">{text("名單行數")}</div>
<div className="font-semibold text-gray-900">{rimoText(view.importSummary.total)}{text(" 行")}</div></div>
<div className="bg-white rounded-lg border border-blue-100 p-3"><div className="text-gray-500 text-xs">{text("已匹配會員")}</div>
<div className="font-semibold text-emerald-700">{rimoText(view.importSummary.matched)}{text(" 行")}</div></div>
<div className="bg-white rounded-lg border border-blue-100 p-3"><div className="text-gray-500 text-xs">{text("待匹配會員")}</div>
<div className="font-semibold text-amber-700">{rimoText(view.importSummary.pending)}{text(" 行")}</div></div></div></> : <><RimoElement kind="el-table" data={view.importSummary.errors} size="small" className="mt-3" border={true}><RimoElement kind="el-table-column" prop="rowNo" label="行號" width="80"></RimoElement>
<RimoElement kind="el-table-column" prop="documentNo" label="證件號碼" width="160"></RimoElement>
<RimoElement kind="el-table-column" prop="reason" label="異常原因" minWidth="220"></RimoElement></RimoElement></>}</div></> : null}</div></>}</RimoElement></RimoRoot>;
}