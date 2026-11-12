import { useRimoModel } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, RimoTable, rimoClass, rimoText } from '../../lib/RimoElements.jsx';
import './channel-ticket-batch-detail.css';
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
      derived: computed
    } = model;
    const batches = ref([{
      id: 1,
      batchNo: 'GT-KM-20260501-001',
      name: '金門 5 月 A 團租車券',
      enterprise: '金門風獅爺旅行社',
      issueMode: 'LIST',
      stationTypes: ['旅行社團體專用'],
      stations: ['金城民生停車場', '金湖機場停車場'],
      pickupAt: '2026-05-01 09:00',
      returnAt: '2026-05-01 17:00',
      availableStartAt: '2026-04-20 00:00',
      availableEndAt: '2026-05-01 17:00',
      totalCount: 12,
      unusedCount: 5,
      usedCount: 6,
      expiredCount: 0,
      voidCount: 1,
      issuedCount: 9,
      pendingIssueCount: 3,
      issueFailedCount: 0,
      status: '啓用',
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
        orderStatus: '',
        usedAt: '-'
      }, {
        code: 'KM-A0501-004',
        visitorName: '吳佳穎',
        documentNo: '110101199202022345',
        issueStatus: '待發放',
        status: '未使用',
        member: '-',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }, {
        code: 'KM-A0501-007',
        visitorName: '劉冠廷',
        documentNo: 'H223456789',
        issueStatus: '已發放',
        status: '已作廢',
        member: '劉冠廷 H223456789',
        orderNo: '',
        orderStatus: '',
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
        settlementStatus: 'PENDING',
        overdueMinutes: 0,
        abnormalFeeTotal: 0,
        usedAt: '2026-04-25 11:44'
      }, {
        code: 'KM-A0501-008',
        visitorName: '李承恩',
        documentNo: 'E123456780',
        issueStatus: '已發放',
        status: '已使用',
        member: '李承恩 E123456780',
        orderNo: 'TS-KM-20260501-0013',
        orderStatus: '用車中',
        settlementStatus: 'PENDING',
        overdueMinutes: 0,
        abnormalFeeTotal: 0,
        usedAt: '2026-04-25 12:06'
      }, {
        code: 'KM-A0501-009',
        visitorName: '郭佩珊',
        documentNo: 'F223456780',
        issueStatus: '已發放',
        status: '未使用',
        member: '郭佩珊 F223456780',
        orderNo: 'TS-KM-20260501-0015',
        orderStatus: '已取消',
        settlementStatus: 'CANCELED',
        overdueMinutes: 0,
        abnormalFeeTotal: 0,
        usedAt: '2026-04-25 12:18'
      }, {
        code: 'KM-A0501-010',
        visitorName: '黃俊杰',
        documentNo: 'G123456780',
        issueStatus: '已發放',
        status: '已使用',
        member: '黃俊杰 G123456780',
        orderNo: 'TS-KM-20260501-0016',
        orderStatus: '已完成',
        settlementStatus: 'SETTLED',
        overdueMinutes: 0,
        abnormalFeeLabel: '其他費用',
        abnormalFeeTotal: 300,
        usedAt: '2026-04-25 12:31'
      }, {
        code: 'KM-A0501-011',
        visitorName: '蔡佳玲',
        documentNo: 'H223456780',
        issueStatus: '已發放',
        status: '未使用',
        member: '蔡佳玲 H223456780',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }, {
        code: 'KM-A0501-012',
        visitorName: '周冠宇',
        documentNo: '110101198805053456',
        issueStatus: '待發放',
        status: '未使用',
        member: '-',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }],
      operationLogs: [{
        time: '2026-04-25 13:05',
        type: '作廢租車券',
        operator: 'Admin',
        content: '作廢租車券 KM-A0501-007',
        reason: '名單證件號碼填寫錯誤，已改由新增租車券補發'
      }, {
        time: '2026-04-25 12:30',
        type: '導出租車券',
        operator: 'Admin',
        content: '導出本批次 Excel（租車券列表、訂單完整數據）',
        reason: '旅行社對賬確認'
      }, {
        time: '2026-04-20 09:15',
        type: '創建批次',
        operator: 'Admin',
        content: '創建租車券批次，共 12 張',
        reason: '金門 5 月 A 團活動'
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
      voidCount: 0,
      issuedCount: 5,
      pendingIssueCount: 3,
      issueFailedCount: 0,
      status: '啓用',
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
        orderStatus: '',
        usedAt: '-'
      }],
      operationLogs: [{
        time: '2026-04-25 10:20',
        type: '創建批次',
        operator: 'Admin',
        content: '創建租車券批次，共 8 張',
        reason: '機場接駁團活動'
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
      voidCount: 0,
      issuedCount: 0,
      pendingIssueCount: 0,
      issueFailedCount: 0,
      status: '待導入名單',
      codes: [],
      operationLogs: [{
        time: '2026-05-01 09:10',
        type: '創建批次',
        operator: 'Admin',
        content: '保存名單發放批次，尚未導入用券人名單',
        reason: '合作企業名單尚未確認'
      }]
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
      voidCount: 0,
      issuedCount: 0,
      pendingIssueCount: 20,
      issueFailedCount: 0,
      status: '停用',
      codes: [{
        code: 'KM-C0510-001',
        visitorName: '-',
        documentNo: '-',
        issueStatus: '未領取',
        status: '未使用',
        member: '-',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }, {
        code: 'KM-C0510-002',
        visitorName: '-',
        documentNo: '-',
        issueStatus: '未領取',
        status: '未使用',
        member: '-',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }, {
        code: 'KM-C0510-003',
        visitorName: '-',
        documentNo: '-',
        issueStatus: '未領取',
        status: '已過期',
        member: '-',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }, {
        code: 'KM-C0510-004',
        visitorName: '-',
        documentNo: '-',
        issueStatus: '未領取',
        status: '已過期',
        member: '-',
        orderNo: '',
        orderStatus: '',
        usedAt: '-'
      }],
      operationLogs: [{
        time: '2026-05-01 09:30',
        type: '停用批次',
        operator: 'Admin',
        content: '批次狀態：啓用 -> 停用',
        reason: '企業活動日期調整，暫停售券使用'
      }, {
        time: '2026-05-01 08:50',
        type: '創建批次',
        operator: 'Admin',
        content: '創建數量生成批次，共 20 張',
        reason: '海峽科技員工活動'
      }]
    }]);
    const currentId = Number(new URLSearchParams(window.location.search).get('id')) || 1;
    const currentBatch = computed(() => batches.value.find(item => item.id === currentId) || batches.value[0]);
    const addTicketDialogVisible = ref(false);
    const appendListDialogVisible = ref(false);
    const appendImportPreviewReady = ref(false);
    const voidTicketDialogVisible = ref(false);
    const statusDialogVisible = ref(false);
    const selectedTicket = ref(null);
    const addTicketForm = reactive({
      visitorName: '',
      documentNo: '',
      count: 1,
      reason: ''
    });
    const appendListForm = reactive({
      reason: ''
    });
    const appendImportSummary = reactive({
      status: '',
      message: '',
      total: 0,
      matched: 0,
      pending: 0,
      errors: []
    });
    const voidTicketForm = reactive({
      reason: ''
    });
    const statusForm = reactive({
      reason: ''
    });
    const nowText = () => {
      const d = new Date();
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    const nextStatus = computed(() => currentBatch.value.status === '啓用' || currentBatch.value.status === '待導入名單' ? '停用' : '啓用');
    const statusActionTitle = computed(() => `${nextStatus.value}批次`);
    const capacityDemoMode = ref('SAFE');
    const stationCapacityMock = {
      '金城民生停車場': {
        vehicleCount: 10,
        batchCount: 0,
        ticketCount: 0
      },
      '金湖機場停車場': {
        vehicleCount: 6,
        batchCount: 1,
        ticketCount: 8
      },
      '山外車站停車場': {
        vehicleCount: 12,
        batchCount: 2,
        ticketCount: 11
      },
      '臺北信義企業停車場': {
        vehicleCount: 18,
        batchCount: 1,
        ticketCount: 6
      }
    };
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
    const capacityInfo = computed(() => {
      const currentDemand = Number(currentBatch.value.totalCount) || 0;
      const availableVehicleCount = (currentBatch.value.stations || []).reduce((sum, station) => {
        return sum + (stationCapacityMock[station]?.vehicleCount || 0);
      }, 0);
      const scenario = capacityDemoScenarios[capacityDemoMode.value];
      const relatedMaxOccupancy = Math.min(scenario.relatedMaxOccupancy, availableVehicleCount);
      const remainingVehicleCount = Math.max(availableVehicleCount - relatedMaxOccupancy, 0);
      const hasRisk = currentDemand > remainingVehicleCount;
      return {
        hasRisk,
        currentDemand,
        availableVehicleCount,
        relatedBatchCount: scenario.relatedBatchCount,
        relatedVoucherCount: scenario.relatedVoucherCount,
        relatedMaxOccupancy,
        remainingVehicleCount,
        tag: hasRisk ? '存在庫存風險' : '未發現庫存風險'
      };
    });
    const goBack = () => {
      window.location.href = 'channel_ticket_batches.html';
    };
    const getIssueModeLabel = mode => mode === 'QUANTITY' ? '數量生成' : '名單發放';
    const formatStationTypeRange = batch => (batch.stationTypes || []).join('、') || '全部據點類型';
    const formatStationRange = batch => (batch.stations || []).join('、') || '全部適用據點';
    const formatIssueSummary = batch => {
      if (batch.issueMode === 'QUANTITY') return `已領取 ${batch.issuedCount} / 未領取 ${batch.pendingIssueCount}`;
      return `已發放 ${batch.issuedCount} / 待發放 ${batch.pendingIssueCount}`;
    };
    const getIssueStatusType = status => {
      if (status === '已發放' || status === '已領取') return 'success';
      if (status === '發放失敗') return 'danger';
      if (status === '未領取') return 'info';
      return 'warning';
    };
    const getTicketStatusType = status => {
      if (status === '已使用') return 'success';
      if (status === '已作廢') return 'danger';
      if (status === '已過期') return 'info';
      return 'warning';
    };
    const getOrderStatusType = status => {
      if (status === '已完成') return 'success';
      if (status === '已取消') return 'info';
      if (status === '用車中') return 'warning';
      return 'info';
    };
    const buildAddedTicketCode = batch => {
      const nextNo = (batch.codes?.length || 0) + 1;
      return `ADD-${String(batch.id).padStart(2, '0')}-${String(nextNo).padStart(3, '0')}`;
    };
    const appendImportRows = [{
      name: '郭怡萱',
      documentNo: 'K123456789'
    }, {
      name: '賴柏宇',
      documentNo: 'L223456789'
    }, {
      name: '陳佩君',
      documentNo: '110101199303034567'
    }];
    const openAppendListDialog = () => {
      appendListForm.reason = '';
      appendImportPreviewReady.value = false;
      appendImportSummary.status = '';
      appendImportSummary.message = '';
      appendImportSummary.total = 0;
      appendImportSummary.matched = 0;
      appendImportSummary.pending = 0;
      appendImportSummary.errors = [];
      appendListDialogVisible.value = true;
    };
    const downloadAppendTemplateMock = () => {
      feedback.ElMessage.info('原型示意：下載用券人名單模板');
    };
    const previewAppendImportMock = hasError => {
      if (hasError) {
        appendImportSummary.status = 'error';
        appendImportSummary.message = '名單中存在證件號碼格式錯誤、重複或必填字段缺失，無法確認導入。請修正後重新選擇文件。';
        appendImportSummary.total = 0;
        appendImportSummary.matched = 0;
        appendImportSummary.pending = 0;
        appendImportSummary.errors = [{
          rowNo: 3,
          documentNo: 'A12345678',
          reason: '證件號碼格式錯誤'
        }, {
          rowNo: 4,
          documentNo: 'A123456789',
          reason: '與當前批次已有證件號碼重複'
        }, {
          rowNo: 5,
          documentNo: '',
          reason: '缺少證件號碼'
        }];
        appendImportPreviewReady.value = true;
        feedback.ElMessage.error('導入異常：請修正格式、重複或缺失字段');
        return;
      }
      appendImportSummary.status = 'success';
      appendImportSummary.message = '名單校驗通過。本次導入會按追加處理，不覆蓋原名單和已生成租車券。';
      appendImportSummary.total = appendImportRows.length;
      appendImportSummary.matched = 2;
      appendImportSummary.pending = 1;
      appendImportSummary.errors = [];
      appendImportPreviewReady.value = true;
      feedback.ElMessage.success('導入成功');
    };
    const confirmAppendImportMock = () => {
      const batch = currentBatch.value;
      if (appendImportSummary.status !== 'success') {
        feedback.ElMessage.warning('導入異常未處理，不能確認導入');
        return;
      }
      if (!appendListForm.reason.trim()) {
        feedback.ElMessage.warning('請填寫導入原因');
        return;
      }
      const existingDocumentNos = new Set(batch.codes.filter(item => item.documentNo && item.documentNo !== '-').map(item => item.documentNo.trim().toUpperCase()));
      const importDocumentNos = new Set();
      const duplicateRow = appendImportRows.find(item => {
        const normalized = item.documentNo.trim().toUpperCase();
        if (existingDocumentNos.has(normalized) || importDocumentNos.has(normalized)) return true;
        importDocumentNos.add(normalized);
        return false;
      });
      if (duplicateRow) {
        feedback.ElMessage.warning(`證件號碼 ${duplicateRow.documentNo} 已存在於當前批次，不允許重複導入`);
        return;
      }
      appendImportRows.forEach(item => {
        const normalizedDocumentNo = item.documentNo.trim().toUpperCase();
        const issueStatus = /^[A-Z]/.test(normalizedDocumentNo) ? '已發放' : '待發放';
        batch.codes.push({
          code: buildAddedTicketCode(batch),
          visitorName: item.name,
          documentNo: normalizedDocumentNo,
          issueStatus,
          status: '未使用',
          member: issueStatus === '已發放' ? `${item.name} ${normalizedDocumentNo}` : '-',
          orderNo: '',
          orderStatus: '',
          usedAt: '-'
        });
      });
      batch.totalCount += appendImportSummary.total;
      batch.unusedCount += appendImportSummary.total;
      batch.issuedCount += appendImportSummary.matched;
      batch.pendingIssueCount += appendImportSummary.pending;
      if (batch.status === '待導入名單') {
        batch.status = '停用';
      }
      batch.operationLogs.unshift({
        time: nowText(),
        type: '導入名單',
        operator: 'Admin',
        content: `追加導入 ${appendImportSummary.total} 行；已匹配會員 ${appendImportSummary.matched} 行，待匹配會員 ${appendImportSummary.pending} 行`,
        reason: appendListForm.reason
      });
      appendListDialogVisible.value = false;
      feedback.ElMessage.success('原型示意：已追加導入名單並生成租車券；待導入名單批次默認轉爲停用，確認後再啓用');
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
        const issueStatus = /^[A-Z]/.test(normalizedDocumentNo) ? '已發放' : '待發放';
        batch.codes.push({
          code: buildAddedTicketCode(batch),
          visitorName: addTicketForm.visitorName,
          documentNo: normalizedDocumentNo,
          issueStatus,
          status: '未使用',
          member: issueStatus === '已發放' ? `${addTicketForm.visitorName} ${normalizedDocumentNo}` : '-',
          orderNo: '',
          orderStatus: '',
          usedAt: '-'
        });
        batch.totalCount += 1;
        batch.unusedCount += 1;
        if (issueStatus === '已發放') batch.issuedCount += 1;else batch.pendingIssueCount += 1;
        batch.operationLogs.unshift({
          time: nowText(),
          type: '新增租車券',
          operator: 'Admin',
          content: `補發 1 張給 ${addTicketForm.visitorName} ${normalizedDocumentNo}`,
          reason: addTicketForm.reason
        });
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
        batch.operationLogs.unshift({
          time: nowText(),
          type: '新增租車券',
          operator: 'Admin',
          content: `數量生成補發 ${count} 張租車券`,
          reason: addTicketForm.reason
        });
      }
      addTicketDialogVisible.value = false;
      feedback.ElMessage.success('原型示意：已新增租車券');
    };
    const canVoidTicket = row => {
      return row && row.status === '未使用' && !row.orderNo;
    };
    const openVoidTicketDialog = row => {
      if (!canVoidTicket(row)) return;
      selectedTicket.value = row;
      voidTicketForm.reason = '';
      voidTicketDialogVisible.value = true;
    };
    const saveVoidTicketMock = () => {
      const ticket = selectedTicket.value;
      const batch = currentBatch.value;
      if (!ticket || !canVoidTicket(ticket)) {
        feedback.ElMessage.warning('僅未使用且無有效訂單佔用的租車券可作廢');
        return;
      }
      if (!voidTicketForm.reason.trim()) {
        feedback.ElMessage.warning('請填寫作廢原因');
        return;
      }
      const oldStatus = ticket.status;
      ticket.status = '已作廢';
      ticket.usedAt = '-';
      if (batch.unusedCount > 0) batch.unusedCount -= 1;
      batch.voidCount = (batch.voidCount || 0) + 1;
      if ((ticket.issueStatus === '待發放' || ticket.issueStatus === '未領取') && batch.pendingIssueCount > 0) {
        batch.pendingIssueCount -= 1;
      }
      batch.operationLogs.unshift({
        time: nowText(),
        type: '作廢租車券',
        operator: 'Admin',
        content: `租車券 ${ticket.code}：${oldStatus} -> 已作廢`,
        reason: voidTicketForm.reason
      });
      voidTicketDialogVisible.value = false;
      feedback.ElMessage.success('原型示意：已作廢租車券');
    };
    const openStatusDialog = () => {
      statusForm.reason = '';
      statusDialogVisible.value = true;
    };
    const saveStatusChangeMock = () => {
      if (!statusForm.reason.trim()) {
        feedback.ElMessage.warning('請填寫原因或備註');
        return;
      }
      const oldStatus = currentBatch.value.status;
      currentBatch.value.status = nextStatus.value;
      currentBatch.value.operationLogs.unshift({
        time: nowText(),
        type: `${currentBatch.value.status}批次`,
        operator: 'Admin',
        content: `批次狀態：${oldStatus} -> ${currentBatch.value.status}`,
        reason: statusForm.reason
      });
      statusDialogVisible.value = false;
      feedback.ElMessage.success('原型示意：批次狀態已更新');
    };
    const exportCodesMock = () => {
      currentBatch.value.operationLogs.unshift({
        time: nowText(),
        type: '導出租車券',
        operator: 'Admin',
        content: '導出本批次 Excel（租車券列表、訂單完整數據）',
        reason: '營運覈對'
      });
      feedback.ElMessage.success('原型示意：已導出 Excel，包含租車券列表和訂單完整數據兩個 Sheet');
    };
    const editBatchMock = () => {
      feedback.ElMessage.info('原型示意：打開批次編輯彈窗');
    };
    const openOrder = row => {
      feedback.ElMessage.info(`打開訂單詳情：${row.orderNo}`);
    };
    return {
      currentBatch,
      addTicketDialogVisible,
      appendListDialogVisible,
      appendImportPreviewReady,
      voidTicketDialogVisible,
      statusDialogVisible,
      selectedTicket,
      addTicketForm,
      appendListForm,
      appendImportSummary,
      voidTicketForm,
      statusForm,
      nextStatus,
      statusActionTitle,
      capacityInfo,
      capacityDemoMode,
      goBack,
      getIssueModeLabel,
      formatStationTypeRange,
      formatStationRange,
      formatIssueSummary,
      getIssueStatusType,
      getTicketStatusType,
      getOrderStatusType,
      openAppendListDialog,
      downloadAppendTemplateMock,
      previewAppendImportMock,
      confirmAppendImportMock,
      canVoidTicket,
      openAddTicketDialog,
      saveAddTicketMock,
      openVoidTicketDialog,
      saveVoidTicketMock,
      openStatusDialog,
      saveStatusChangeMock,
      exportCodesMock,
      editBatchMock,
      openOrder,
      batches,
      currentId,
      nowText,
      stationCapacityMock,
      capacityDemoScenarios,
      buildAddedTicketCode,
      appendImportRows
    };
  }
  return pageSetup();
}
export default function ChannelTicketBatchDetailBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="channel-ticket-batch-detail" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="mb-5 flex items-start justify-between gap-4" data-rimo-layout="toolbar"><div><div className="flex items-center gap-3"><RimoElement kind="el-button" plain={true} onClick={event => {
              view.goBack?.(event);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Back" /></RimoElement>
{text("返回列表\n                            ")}</RimoElement></div>
<div className="flex items-center gap-3 mt-4" data-rimo-layout="heading"><h1 className="text-2xl font-bold text-gray-900">{rimoText(view.currentBatch.name)}</h1>
<RimoElement kind="el-tag" type={view.currentBatch.status === '啓用' ? 'success' : view.currentBatch.status === '待導入名單' ? 'warning' : 'info'} effect="plain">{rimoText(view.currentBatch.status)}</RimoElement>
<RimoElement kind="el-tag" type="info" effect="plain">{rimoText(view.getIssueModeLabel(view.currentBatch.issueMode))}</RimoElement></div>
<p className="text-sm text-gray-500 mt-1">{rimoText(view.currentBatch.batchNo)}{text("｜")}{rimoText(view.currentBatch.enterprise)}{text("｜分時租賃 / 同站租還")}</p></div>
<div className="flex flex-wrap justify-end gap-2"><RimoElement kind="el-button" plain={true} onClick={event => {
            view.openStatusDialog?.(event);
          }}>{text("\n                            ")}{rimoText(view.nextStatus)}{text("批次\n                        ")}</RimoElement>
<RimoElement kind="el-button" plain={true} onClick={event => {
            view.editBatchMock?.(event);
          }}>{text("編輯批次")}</RimoElement></div></div>
<div className="grid grid-cols-5 gap-4 mb-5" data-rimo-grid="5"><div className="stat-card"><div className="text-xs text-gray-500">{text("租車券總數")}</div>
<div className="text-2xl font-bold text-gray-900 mt-2">{rimoText(view.currentBatch.totalCount)}</div></div>
<div className="stat-card"><div className="text-xs text-gray-500">{rimoText(view.currentBatch.issueMode === 'QUANTITY' ? '已領取' : '已發放')}</div>
<div className="text-2xl font-bold text-emerald-600 mt-2">{rimoText(view.currentBatch.issuedCount)}</div></div>
<div className="stat-card"><div className="text-xs text-gray-500">{rimoText(view.currentBatch.issueMode === 'QUANTITY' ? '未領取' : '待發放')}</div>
<div className="text-2xl font-bold text-amber-600 mt-2">{rimoText(view.currentBatch.pendingIssueCount)}</div></div>
<div className="stat-card"><div className="text-xs text-gray-500">{text("已使用")}</div>
<div className="text-2xl font-bold text-[color:var(--app-color-primary)] mt-2">{rimoText(view.currentBatch.usedCount)}</div></div>
<div className="stat-card"><div className="text-xs text-gray-500">{text("已過期")}</div>
<div className="text-2xl font-bold text-gray-500 mt-2">{rimoText(view.currentBatch.expiredCount)}</div></div></div>
<section className="section-card p-5 mb-5"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-gray-900">{text("批次基礎信息")}</h2>
<span className="text-xs text-gray-500">{text("新增租車券會繼承本批次固定條件")}</span></div>
<RimoTable className="info-table"><tbody><tr><th>{text("批次編號")}</th>
<td>{rimoText(view.currentBatch.batchNo)}</td>
<th>{text("發券方式")}</th>
<td>{rimoText(view.getIssueModeLabel(view.currentBatch.issueMode))}</td></tr>
<tr><th>{text("所屬合作企業")}</th>
<td>{rimoText(view.currentBatch.enterprise)}</td>
<th>{text("適用服務")}</th>
<td>{text("分時租賃 / 同站租還")}</td></tr>
<tr><th>{text("適用據點類型")}</th>
<td>{rimoText(view.formatStationTypeRange(view.currentBatch))}</td>
<th>{text("適用據點")}</th>
<td>{rimoText(view.formatStationRange(view.currentBatch))}</td></tr>
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
<tr><th>{text("發放統計")}</th>
<td>{rimoText(view.formatIssueSummary(view.currentBatch))}{text(" / 失敗 ")}{rimoText(view.currentBatch.issueFailedCount)}</td>
<th>{text("使用統計")}</th>
<td>{text("未使用 ")}{rimoText(view.currentBatch.unusedCount)}{text(" / 已使用 ")}{rimoText(view.currentBatch.usedCount)}{text(" / 已過期 ")}{rimoText(view.currentBatch.expiredCount)}{text(" / 已作廢 ")}{rimoText(view.currentBatch.voidCount || 0)}</td></tr></tbody></RimoTable></section>
<section className="section-card p-5 mb-5"><div className="flex items-center justify-between gap-4" data-rimo-layout="toolbar"><h2 className="text-lg font-bold text-gray-900">{text("車輛庫存提醒")}</h2>
<div className="flex items-center gap-3 shrink-0"><RimoElement kind="el-button-group"><RimoElement kind="el-button" size="small" type={view.capacityDemoMode === 'SAFE' ? 'primary' : 'default'} onClick={_event => {
                model.write(["capacityDemoMode"], 'SAFE');
              }}>{text("無庫存風險")}</RimoElement>
<RimoElement kind="el-button" size="small" type={view.capacityDemoMode === 'RISK' ? 'warning' : 'default'} onClick={_event => {
                model.write(["capacityDemoMode"], 'RISK');
              }}>{text("有庫存風險")}</RimoElement></RimoElement>
<RimoElement kind="el-tag" type={view.capacityInfo.hasRisk ? 'warning' : 'success'} effect="plain">{rimoText(view.capacityInfo.tag)}</RimoElement></div></div>
<div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-gray-600"><span>{text("當前批次 ")}
<b className="text-gray-800">{rimoText(view.capacityInfo.currentDemand)}{text(" 張")}</b></span>
<span>{text("適用據點可用 ")}
<b className="text-gray-800">{rimoText(view.capacityInfo.availableVehicleCount)}{text(" 臺")}</b></span>
<span>{text("其他相關批次最多佔用 ")}
<b className="text-gray-800">{rimoText(view.capacityInfo.relatedMaxOccupancy)}{text(" 臺")}</b></span>
<span>{text("預計剩餘 ")}
<b className={rimoClass(view.capacityInfo.hasRisk ? 'text-amber-700' : 'text-emerald-700')}>{rimoText(view.capacityInfo.remainingVehicleCount)}{text(" 臺")}</b></span></div></section>
<section className="section-card p-5 mb-5"><div className="flex items-center justify-between mb-4" data-rimo-layout="toolbar"><div><h2 className="text-lg font-bold text-gray-900">{text("租車券列表")}</h2>
<p className="text-sm text-gray-500 mt-1">{text("創建訂單即已使用；訂單取消後未過期前恢復未使用，可重新預約。作廢爲時間充裕時開發的可選能力。")}</p></div>
<div className="flex gap-2">{view.currentBatch.issueMode === 'LIST' ? <><RimoElement kind="el-button" type="primary" plain={true} onClick={event => {
                view.openAppendListDialog?.(event);
              }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Upload" /></RimoElement>
{text("導入/追加名單\n                            ")}</RimoElement></> : null}
<RimoElement kind="el-button" type="primary" plain={true} onClick={event => {
              view.openAddTicketDialog?.(event);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text("新增租車券\n                            ")}</RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} title="導出 Excel：租車券列表 + 訂單完整數據" onClick={event => {
              view.exportCodesMock?.(event);
            }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text("導出\n                            ")}</RimoElement></div></div>
<RimoElement kind="el-table" data={view.currentBatch.codes} border={true}><RimoElement kind="el-table-column" prop="code" label="租車券編號" minWidth="150"></RimoElement>
<RimoElement kind="el-table-column" label="用券人信息" minWidth="150" slots={{
            "default": ({
              row
            }) => <>{row.visitorName && row.visitorName !== '-' ? <><div className="text-sm text-gray-900">{rimoText(row.visitorName)}</div></> : null}
{row.documentNo && row.documentNo !== '-' ? <><div className="text-xs text-gray-500">{rimoText(row.documentNo)}</div></> : null}
{!row.visitorName || row.visitorName === '-' ? <><span className="text-gray-400">{text("-")}</span></> : null}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="發放狀態" width="110" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={view.getIssueStatusType(row.issueStatus)} effect="plain">{rimoText(row.issueStatus)}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="使用狀態" width="110" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={view.getTicketStatusType(row.status)} effect="plain">{rimoText(row.status)}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="member" label="使用會員" minWidth="145"></RimoElement>
<RimoElement kind="el-table-column" label="訂單號 / 狀態" minWidth="170" slots={{
            "default": ({
              row
            }) => <>{row.orderNo ? <><div className="space-y-1"><div className="font-medium text-gray-900 break-all">{rimoText(row.orderNo)}</div>
<RimoElement kind="el-tag" size="small" type={view.getOrderStatusType(row.orderStatus)} effect="plain">{rimoText(row.orderStatus || '訂單已建立')}</RimoElement></div></> : <><span className="text-gray-400">{text("-")}</span></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="訂單結算" minWidth="165" slots={{
            "default": ({
              row
            }) => <>{!row.orderNo ? <><span className="text-gray-400">{text("-")}</span></> : row.settlementStatus === 'OVERDUE_IN_PROGRESS' ? <><div className="space-y-1"><RimoElement kind="el-tag" type="warning" effect="plain" size="small">{text("逾時中")}</RimoElement>
<div className="text-xs text-amber-700">{text("已逾時 ")}{rimoText(row.overdueMinutes)}{text(" 分鐘")}</div>
<div className="text-xs text-gray-500">{text("費用待結算")}</div></div></> : Number(row.abnormalFeeTotal || 0) > 0 ? <><div className="space-y-1"><div className="text-sm font-medium text-red-600">{text("\n                                        ")}{rimoText(row.overdueMinutes ? `逾時 ${row.overdueMinutes} 分鐘` : row.abnormalFeeLabel || '有異常費用')}{text("\n                                    ")}</div>
<div className="text-xs text-gray-600">{text("異常費用 NT$ ")}{rimoText(Number(row.abnormalFeeTotal).toLocaleString())}</div></div></> : row.orderStatus === '已取消' ? <><span className="text-gray-500">{text("訂單已取消")}</span></> : row.orderStatus === '已完成' ? <><span className="text-green-600">{text("正常結算")}</span></> : <><div className="text-gray-500"><div>{text("暫無異常費用")}</div>
<div className="text-xs mt-1">{text("待結算")}</div></div></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" prop="usedAt" label="使用時間" minWidth="140"></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="170" fixed="right" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-button" type="primary" link={true} disabled={!row.orderNo} onClick={_event => {
                view.openOrder(row);
              }}>{text("查看訂單")}</RimoElement>
<RimoElement kind="el-tooltip" content={view.canVoidTicket(row) ? '作廢後不可恢復，需要填寫原因' : '僅未使用且無有效訂單佔用的租車券可作廢'} placement="top"><RimoElement kind="el-button" type="danger" link={true} disabled={!view.canVoidTicket(row)} onClick={_event => {
                  view.openVoidTicketDialog(row);
                }}>{text("作廢")}</RimoElement></RimoElement></>
          }}></RimoElement></RimoElement></section>
<section className="section-card p-5"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-gray-900">{text("操作記錄")}</h2>
<span className="text-xs text-gray-500">{text("啓用、停用、新增租車券、作廢、導出等關鍵操作都需要記錄原因或備註。")}</span></div>
<RimoElement kind="el-table" data={view.currentBatch.operationLogs} border={true}><RimoElement kind="el-table-column" prop="time" label="操作時間" width="170"></RimoElement>
<RimoElement kind="el-table-column" prop="type" label="操作類型" width="130"></RimoElement>
<RimoElement kind="el-table-column" prop="operator" label="操作人" width="110"></RimoElement>
<RimoElement kind="el-table-column" prop="content" label="操作內容" minWidth="260"></RimoElement>
<RimoElement kind="el-table-column" prop="reason" label="原因 / 備註" minWidth="260"></RimoElement></RimoElement></section></div><RimoElement kind="el-dialog" modelValue={view.addTicketDialogVisible} onModelChange={value => {
      model.write(["addTicketDialogVisible"], value);
    }} title="新增租車券" width="560px" className="channel-ticket-batch-detail-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["addTicketDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveAddTicketMock?.(event);
        }}>{text("保存")}</RimoElement></>
    }}>{() => <><div className="space-y-4"><div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">{text("\n                    新增租車券將繼承當前批次的合作企業、固定取還車時間、可用時間段和適用據點範圍。\n                ")}</div>
<RimoElement kind="el-form" labelWidth="110px"><RimoElement kind="el-form-item" label="當前批次"><div className="text-sm text-gray-900">{rimoText(view.currentBatch.name)}</div></RimoElement>
<RimoElement kind="el-form-item" label="發券方式"><RimoElement kind="el-tag" type="info" effect="plain">{rimoText(view.getIssueModeLabel(view.currentBatch.issueMode))}</RimoElement></RimoElement>
{view.currentBatch.issueMode === 'LIST' ? <><><RimoElement kind="el-form-item" label="用券人姓名" required={true}><RimoElement kind="el-input" modelValue={view.addTicketForm.visitorName} onModelChange={value => {
                    model.write(["addTicketForm", "visitorName"], value);
                  }} placeholder="請輸入用券人姓名"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="證件號碼" required={true}><RimoElement kind="el-input" modelValue={view.addTicketForm.documentNo} onModelChange={value => {
                    model.write(["addTicketForm", "documentNo"], value);
                  }} placeholder="請輸入證件號碼"></RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("可填寫身份證或入臺證號碼，不選擇證件類型。同一批次證件號碼不得重複。")}</div></RimoElement></></> : <><><RimoElement kind="el-form-item" label="新增數量" required={true}><RimoElement kind="el-input-number" modelValue={view.addTicketForm.count} onModelChange={value => {
                    model.write(["addTicketForm", "count"], value);
                  }} min={1} max={99} controlsPosition="right"></RimoElement>
<div className="mt-1 text-xs text-gray-500">{text("保存後生成對應數量的租車券和兌換碼，初始狀態爲未領取。")}</div></RimoElement></></>}
<RimoElement kind="el-form-item" label="新增原因" required={true}><RimoElement kind="el-input" modelValue={view.addTicketForm.reason} onModelChange={value => {
                model.write(["addTicketForm", "reason"], value);
              }} type="textarea" rows={3} placeholder="例如：名單遺漏、活動臨時加名額、現場補發"></RimoElement></RimoElement></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.appendListDialogVisible} onModelChange={value => {
      model.write(["appendListDialogVisible"], value);
    }} title="導入 / 追加用券人名單" width="680px" className="channel-ticket-batch-detail-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["appendListDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" disabled={!view.appendImportPreviewReady || view.appendImportSummary.status !== 'success'} onClick={event => {
          view.confirmAppendImportMock?.(event);
        }}>{text("確認導入")}</RimoElement></>
    }}>{() => <><div className="space-y-4"><div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">{text("\n                    名單發放批次只支持追加導入，不覆蓋原名單和已生成租車券。導入成功後按有效名單行新增租車券，並寫入操作記錄。\n                ")}</div>
<RimoElement kind="el-form" labelWidth="110px"><RimoElement kind="el-form-item" label="當前批次"><div className="text-sm text-gray-900">{rimoText(view.currentBatch.name)}</div></RimoElement>
<RimoElement kind="el-form-item" label="導入原因" required={true}><RimoElement kind="el-input" modelValue={view.appendListForm.reason} onModelChange={value => {
                model.write(["appendListForm", "reason"], value);
              }} type="textarea" rows={3} placeholder="例如：合作企業補名單、現場追加名額、首次導入名單"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="名單文件"><div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3" data-rimo-layout="toolbar"><div><div className="text-sm font-semibold text-gray-900">{text("用券人名單模板")}</div>
<div className="text-xs text-gray-500 mt-1">{text("字段：用券人姓名、證件號碼，不包含證件類型。證件號碼不得與本次文件或當前批次已有名單重複。")}</div></div>
<div className="flex gap-2"><RimoElement kind="el-button" size="small" plain={true} onClick={event => {
                      view.downloadAppendTemplateMock?.(event);
                    }}>{text("下載模板")}</RimoElement>
<RimoElement kind="el-button" size="small" type="primary" plain={true} onClick={_event => {
                      view.previewAppendImportMock(false);
                    }}>{text("模擬成功導入")}</RimoElement>
<RimoElement kind="el-button" size="small" type="danger" plain={true} onClick={_event => {
                      view.previewAppendImportMock(true);
                    }}>{text("模擬異常")}</RimoElement></div></div></div></RimoElement></RimoElement>
{view.appendImportPreviewReady ? <><div className="rounded-lg border border-blue-100 bg-blue-50 p-4"><RimoElement kind="el-alert" title={view.appendImportSummary.status === 'success' ? '導入成功' : '導入異常'} type={view.appendImportSummary.status === 'success' ? 'success' : 'error'} closable={false} showIcon={true} slots={{
                "default": _slot => <>{rimoText(view.appendImportSummary.message)}</>
              }}></RimoElement>
{view.appendImportSummary.status === 'success' ? <><div className="grid grid-cols-3 gap-3 mt-3 text-sm" data-rimo-grid="3"><div className="rounded bg-white border border-blue-100 p-3"><div className="text-xs text-gray-500">{text("本次名單行數")}</div>
<div className="font-semibold text-gray-900">{rimoText(view.appendImportSummary.total)}{text(" 行")}</div></div>
<div className="rounded bg-white border border-blue-100 p-3"><div className="text-xs text-gray-500">{text("已匹配會員")}</div>
<div className="font-semibold text-emerald-700">{rimoText(view.appendImportSummary.matched)}{text(" 行")}</div></div>
<div className="rounded bg-white border border-blue-100 p-3"><div className="text-xs text-gray-500">{text("待匹配會員")}</div>
<div className="font-semibold text-amber-700">{rimoText(view.appendImportSummary.pending)}{text(" 行")}</div></div></div></> : <><RimoElement kind="el-table" data={view.appendImportSummary.errors} size="small" className="mt-3" border={true}><RimoElement kind="el-table-column" prop="rowNo" label="行號" width="80"></RimoElement>
<RimoElement kind="el-table-column" prop="documentNo" label="證件號碼" width="150"></RimoElement>
<RimoElement kind="el-table-column" prop="reason" label="異常原因"></RimoElement></RimoElement></>}</div></> : null}</div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.voidTicketDialogVisible} onModelChange={value => {
      model.write(["voidTicketDialogVisible"], value);
    }} title="作廢租車券" width="560px" className="channel-ticket-batch-detail-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["voidTicketDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="danger" onClick={event => {
          view.saveVoidTicketMock?.(event);
        }}>{text("確認作廢")}</RimoElement></>
    }}>{() => <><div className="space-y-4"><div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">{text("\n                    作廢爲時間充裕時開發的可選能力；若本期排期不足，可不開放該入口。作廢後租車券不可恢復，如需補發請使用新增租車券。\n                ")}</div>
<RimoElement kind="el-form" labelWidth="110px"><RimoElement kind="el-form-item" label="租車券編號"><div className="text-sm text-gray-900">{rimoText(view.selectedTicket?.code || '-')}</div></RimoElement>
<RimoElement kind="el-form-item" label="當前狀態"><div className="flex items-center gap-2"><RimoElement kind="el-tag" type={view.getIssueStatusType(view.selectedTicket?.issueStatus)} effect="plain">{rimoText(view.selectedTicket?.issueStatus || '-')}</RimoElement>
<RimoElement kind="el-tag" type={view.getTicketStatusType(view.selectedTicket?.status)} effect="plain">{rimoText(view.selectedTicket?.status || '-')}</RimoElement></div></RimoElement>
<RimoElement kind="el-form-item" label="作廢原因" required={true}><RimoElement kind="el-input" modelValue={view.voidTicketForm.reason} onModelChange={value => {
                model.write(["voidTicketForm", "reason"], value);
              }} type="textarea" rows={4} placeholder="例如：名單錯誤、兌換碼外泄、活動名額調整"></RimoElement></RimoElement></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.statusDialogVisible} onModelChange={value => {
      model.write(["statusDialogVisible"], value);
    }} title={view.statusActionTitle} width="520px" className="channel-ticket-batch-detail-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["statusDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.saveStatusChangeMock?.(event);
        }}>{text("確認")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-form" labelWidth="100px"><RimoElement kind="el-form-item" label="當前狀態"><RimoElement kind="el-tag" type={view.currentBatch.status === '啓用' ? 'success' : view.currentBatch.status === '待導入名單' ? 'warning' : 'info'} effect="plain">{rimoText(view.currentBatch.status)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="操作後狀態"><RimoElement kind="el-tag" type={view.nextStatus === '啓用' ? 'success' : 'info'} effect="plain">{rimoText(view.nextStatus)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="原因 / 備註" required={true}><RimoElement kind="el-input" modelValue={view.statusForm.reason} onModelChange={value => {
              model.write(["statusForm", "reason"], value);
            }} type="textarea" rows={4} placeholder="請填寫本次啓用或停用原因"></RimoElement></RimoElement></RimoElement></>}</RimoElement></RimoRoot>;
}