import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-channel-ticket-batches.css';
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
      record: reactive,
      derived: computed,
      cell: ref,
      onMount: onMounted,
      onDispose: onBeforeUnmount
    } = model;
    const filters = reactive({
      keyword: '',
      recordType: '',
      status: '',
      metricScope: '',
      issueMode: '',
      station: '',
      pickupRange: []
    });
    const pagination = reactive({
      page: 1,
      pageSize: 10
    });
    const activeStatFilter = ref('');
    const moreFiltersVisible = ref(false);
    const filterToolbar = ref(null);
    const filterLayoutTier = ref(1);
    let filterResizeObserver = null;
    const updateFilterLayout = () => {
      const width = filterToolbar.value?.clientWidth || 0;
      if (width >= 1280) filterLayoutTier.value = 4;else if (width >= 1080) filterLayoutTier.value = 3;else if (width >= 860) filterLayoutTier.value = 2;else filterLayoutTier.value = 1;
    };
    onMounted(() => {
      filterResizeObserver = new ResizeObserver(updateFilterLayout);
      if (filterToolbar.value) filterResizeObserver.observe(filterToolbar.value);
      updateFilterLayout();
    });
    onBeforeUnmount(() => filterResizeObserver?.disconnect());
    const advancedFilterCount = computed(() => {
      return (filters.station ? 1 : 0) + (filters.pickupRange?.length ? 1 : 0);
    });
    const applicationDialogVisible = ref(false);
    const applicationDetailVisible = ref(false);
    const importDialogVisible = ref(false);
    const importPreviewReady = ref(false);
    const importHasError = ref(false);
    const importErrors = ref([]);
    const editingApplication = ref(null);
    const currentApplication = ref(null);
    const applicationForm = reactive({
      enterprise: '金門風獅爺旅行社',
      name: '',
      timeRuleType: 'FIXED_PERIOD',
      issueMode: 'LIST',
      pickupAt: '',
      returnAt: '',
      totalCount: 0,
      hasImportedList: false,
      matchedCount: 0,
      pendingMatchCount: 0,
      remark: ''
    });
    const batches = reactive([{
      id: 1,
      recordType: 'BATCH',
      recordNo: 'GT-KM-20260501-001',
      batchNo: 'GT-KM-20260501-001',
      name: '金門 5 月 A 團租車券',
      enterprise: '金門風獅爺旅行社',
      sourceLabel: '營運端代建',
      issueMode: 'LIST',
      stationTypes: ['旅行社團體專用'],
      stations: ['金城民生停車場'],
      pickupAt: '2026-05-01 09:00',
      returnAt: '2026-05-01 17:00',
      totalCount: 12,
      issuedCount: 9,
      pendingIssueCount: 3,
      usedCount: 4,
      status: '啓用'
    }, {
      id: 2,
      recordType: 'BATCH',
      recordNo: 'GT-KM-20260503-002',
      batchNo: 'GT-KM-20260503-002',
      name: '風獅爺員工眷屬體驗券',
      enterprise: '金門風獅爺旅行社',
      sourceLabel: '企業線上申報',
      issueMode: 'QUANTITY',
      stationTypes: ['一般預約開放'],
      stations: ['山外車站停車場'],
      pickupAt: '2026-05-03 13:30',
      returnAt: '2026-05-03 19:30',
      totalCount: 20,
      issuedCount: 6,
      pendingIssueCount: 14,
      usedCount: 2,
      status: '停用'
    }, {
      id: 4,
      recordType: 'BATCH',
      recordNo: 'GT-KM-20260508-004',
      batchNo: 'GT-KM-20260508-004',
      name: '金門環島假期待導入名單批次',
      enterprise: '金門風獅爺旅行社',
      sourceLabel: '營運端代建',
      issueMode: 'LIST',
      stationTypes: ['旅行社團體專用'],
      stations: ['金湖機場停車場'],
      pickupAt: '2026-05-08 10:00',
      returnAt: '2026-05-08 18:00',
      totalCount: 0,
      issuedCount: 0,
      pendingIssueCount: 0,
      usedCount: 0,
      status: '待導入名單'
    }, {
      id: 101,
      recordType: 'APPLICATION',
      recordNo: 'AP-KM-20260709-001',
      name: '金門夏季企業體驗活動租車券',
      enterprise: '金門風獅爺旅行社',
      sourceLabel: '企業線上申報',
      issueMode: 'QUANTITY',
      stationTypes: [],
      stations: [],
      pickupAt: '2026-07-25 09:00',
      returnAt: '2026-07-25 18:00',
      totalCount: 20,
      issuedCount: 0,
      pendingIssueCount: 0,
      usedCount: 0,
      status: '待審批',
      listSummary: '-',
      applicationVersion: 1,
      remark: '企業暑期會員體驗活動，預計統一於活動日使用。'
    }, {
      id: 102,
      recordType: 'APPLICATION',
      recordNo: 'AP-KM-20260708-002',
      name: '合作伙伴交流活動租車券',
      enterprise: '金門風獅爺旅行社',
      sourceLabel: '企業線上申報',
      issueMode: 'LIST',
      stationTypes: [],
      stations: [],
      pickupAt: '2026-07-30 10:00',
      returnAt: '2026-07-30 17:00',
      totalCount: 12,
      issuedCount: 0,
      pendingIssueCount: 0,
      usedCount: 0,
      status: '已駁回',
      listSummary: '名單 12 人',
      applicationVersion: 1,
      remark: '合作伙伴交流活動。',
      rejectReason: '當前申報時段暫無可配置車輛資源，請調整活動時間後重新提交。'
    }, {
      id: 103,
      recordType: 'APPLICATION',
      recordNo: '草稿',
      name: '八月合作企業參訪租車券',
      enterprise: '金門風獅爺旅行社',
      sourceLabel: '企業線上申報',
      issueMode: 'LIST',
      stationTypes: [],
      stations: [],
      pickupAt: '2026-08-08 09:30',
      returnAt: '2026-08-08 17:30',
      totalCount: 12,
      issuedCount: 0,
      pendingIssueCount: 0,
      usedCount: 0,
      status: '草稿',
      listSummary: '名單 12 人',
      applicationVersion: 1,
      remark: '資料尚未確認。'
    }]);
    const stationOptions = computed(() => Array.from(new Set(batches.flatMap(item => item.stations))));
    const filteredBatches = computed(() => {
      const keyword = filters.keyword.trim().toLowerCase();
      return batches.filter(item => {
        const keywordMatch = !keyword || `${item.recordNo} ${item.name}`.toLowerCase().includes(keyword);
        const recordTypeMatch = !filters.recordType || item.recordType === filters.recordType;
        const statusMatch = !filters.status || item.status === filters.status;
        const issueModeMatch = !filters.issueMode || item.issueMode === filters.issueMode;
        const stationMatch = !filters.station || item.stations.includes(filters.station);
        const pickupRangeMatch = (() => {
          if (!filters.pickupRange?.length) return true;
          const itemTs = new Date(item.pickupAt.replace(' ', 'T')).getTime();
          const startTs = new Date(filters.pickupRange[0]).getTime();
          const endTs = new Date(filters.pickupRange[1]).getTime();
          return itemTs >= startTs && itemTs <= endTs;
        })();
        const metricMatch = (() => {
          if (!filters.metricScope) return true;
          if (filters.metricScope === 'HAS_TICKETS') return item.recordType === 'BATCH' && item.totalCount > 0;
          if (filters.metricScope === 'ISSUED') return item.recordType === 'BATCH' && item.issuedCount > 0;
          if (filters.metricScope === 'USED') return item.recordType === 'BATCH' && item.usedCount > 0;
          return true;
        })();
        return keywordMatch && recordTypeMatch && statusMatch && metricMatch && issueModeMatch && stationMatch && pickupRangeMatch;
      });
    });
    const pagedBatches = computed(() => {
      const start = (pagination.page - 1) * pagination.pageSize;
      return filteredBatches.value.slice(start, start + pagination.pageSize);
    });
    const stats = computed(() => batches.reduce((acc, item) => {
      if (item.recordType === 'APPLICATION') {
        if (item.status === '待審批') acc.pendingApproval += 1;
        return acc;
      }
      acc.formalBatchCount += 1;
      acc.total += item.totalCount || 0;
      acc.issued += item.issuedCount || 0;
      acc.used += item.usedCount || 0;
      return acc;
    }, {
      formalBatchCount: 0,
      pendingApproval: 0,
      total: 0,
      issued: 0,
      used: 0
    }));
    const getIssueModeLabel = mode => mode === 'QUANTITY' ? '數量生成' : '名單發放';
    const formatIssueUsageSummary = batch => {
      const issueLabel = batch?.issueMode === 'QUANTITY' ? '已領取' : '已發放';
      return `${issueLabel} ${batch.issuedCount}，已使用 ${batch.usedCount}`;
    };
    const getBatchStatusType = status => {
      if (status === '啓用') return 'success';
      if (status === '待審批') return 'warning';
      if (status === '已駁回') return 'danger';
      if (status === '待導入名單') return 'warning';
      return 'info';
    };
    const openDetail = row => {
      window.location.href = `channel_ticket_batch_detail.html?id=${row.id}`;
    };
    const exportBatch = row => {
      feedback.ElMessage.success(`原型示意：導出 ${row.batchNo} 租車券列表`);
    };
    const exportCurrentEnterprise = () => {
      feedback.ElMessage.success('原型示意：導出當前企業正式批次');
    };
    const resetApplicationForm = () => {
      Object.assign(applicationForm, {
        enterprise: '金門風獅爺旅行社',
        name: '',
        timeRuleType: 'FIXED_PERIOD',
        issueMode: 'LIST',
        pickupAt: '',
        returnAt: '',
        totalCount: 0,
        hasImportedList: false,
        matchedCount: 0,
        pendingMatchCount: 0,
        remark: ''
      });
    };
    const openApplicationDialog = row => {
      editingApplication.value = row?.recordType === 'APPLICATION' ? row : null;
      if (!editingApplication.value) {
        resetApplicationForm();
      } else {
        Object.assign(applicationForm, {
          enterprise: row.enterprise,
          name: row.name,
          timeRuleType: row.timeRuleType || 'FIXED_PERIOD',
          issueMode: row.issueMode,
          pickupAt: row.pickupAt,
          returnAt: row.returnAt,
          totalCount: row.totalCount,
          hasImportedList: row.issueMode === 'LIST' && row.totalCount > 0,
          matchedCount: row.issueMode === 'LIST' ? 9 : 0,
          pendingMatchCount: row.issueMode === 'LIST' ? Math.max(0, row.totalCount - 9) : 0,
          remark: row.remark || ''
        });
      }
      applicationDialogVisible.value = true;
    };
    const validateApplication = forSubmit => {
      if (!applicationForm.name.trim()) {
        feedback.ElMessage.warning('請填寫批次名稱');
        return false;
      }
      if (!applicationForm.pickupAt || !applicationForm.returnAt) {
        feedback.ElMessage.warning('請完整填寫固定取車時間和固定還車時間');
        return false;
      }
      if (applicationForm.pickupAt >= applicationForm.returnAt) {
        feedback.ElMessage.warning('固定取車時間必須早於固定還車時間');
        return false;
      }
      if (forSubmit && applicationForm.issueMode === 'LIST' && !applicationForm.hasImportedList) {
        feedback.ElMessage.warning('名單發放申報提交前必須完成名單導入');
        return false;
      }
      if (forSubmit && applicationForm.issueMode === 'QUANTITY' && Number(applicationForm.totalCount) < 1) {
        feedback.ElMessage.warning('請填寫有效的租車券數量');
        return false;
      }
      return true;
    };
    const buildApplicationRecord = status => ({
      id: editingApplication.value?.id || Date.now(),
      recordType: 'APPLICATION',
      recordNo: status === '草稿' ? editingApplication.value?.recordNo || '草稿' : editingApplication.value?.recordNo?.startsWith('AP-') ? editingApplication.value.recordNo : `AP-KM-20260709-${String(batches.length + 1).padStart(3, '0')}`,
      name: applicationForm.name.trim() || '未命名批次申報',
      enterprise: applicationForm.enterprise,
      sourceLabel: '企業線上申報',
      timeRuleType: applicationForm.timeRuleType,
      issueMode: applicationForm.issueMode,
      stationTypes: [],
      stations: [],
      pickupAt: applicationForm.pickupAt,
      returnAt: applicationForm.returnAt,
      totalCount: Number(applicationForm.totalCount || 0),
      issuedCount: 0,
      pendingIssueCount: 0,
      usedCount: 0,
      status,
      listSummary: applicationForm.issueMode === 'LIST' ? `名單 ${applicationForm.totalCount} 人` : '-',
      applicationVersion: (editingApplication.value?.applicationVersion || 0) + (status === '待審批' ? 1 : 0),
      remark: applicationForm.remark,
      rejectReason: ''
    });
    const upsertApplication = status => {
      const record = buildApplicationRecord(status);
      const existingIndex = batches.findIndex(item => item.id === record.id);
      if (existingIndex >= 0) batches.splice(existingIndex, 1, record);else batches.unshift(record);
      applicationDialogVisible.value = false;
      pagination.page = 1;
    };
    const saveApplicationDraft = () => {
      upsertApplication('草稿');
      feedback.ElMessage.success('申報草稿已保存');
    };
    const submitApplication = () => {
      if (!validateApplication(true)) return;
      feedback.ElMessageBox.confirm('提交後申報將進入營運審批，審批前如需修改必須先撤回。', '確認提交審批', {
        confirmButtonText: '提交審批',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        upsertApplication('待審批');
        feedback.ElMessage.success('批次申報已提交，等待營運端審批');
      }).catch(() => {});
    };
    const openImportDialog = () => {
      importPreviewReady.value = false;
      importHasError.value = false;
      importErrors.value = [];
      importDialogVisible.value = true;
    };
    const simulateImport = hasError => {
      importPreviewReady.value = true;
      importHasError.value = hasError;
      importErrors.value = hasError ? [{
        rowNo: 4,
        documentNo: 'A123456789',
        reason: '與本次名單其他行重複'
      }, {
        rowNo: 7,
        documentNo: 'A12345678',
        reason: '證件號碼格式錯誤'
      }] : [];
      if (hasError) feedback.ElMessage.error('名單校驗失敗，請修正證件號碼後重新導入');else feedback.ElMessage.success('名單校驗通過');
    };
    const confirmImport = () => {
      applicationForm.totalCount = 12;
      applicationForm.hasImportedList = true;
      applicationForm.matchedCount = 9;
      applicationForm.pendingMatchCount = 3;
      importDialogVisible.value = false;
    };
    const openApplicationDetail = row => {
      currentApplication.value = row;
      applicationDetailVisible.value = true;
    };
    const withdrawApplication = row => {
      feedback.ElMessageBox.confirm('撤回後申報將恢復爲草稿，可繼續修改後重新提交。', '確認撤回申報', {
        confirmButtonText: '確認撤回',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.status = '草稿';
        feedback.ElMessage.success('申報已撤回並恢復爲草稿');
      }).catch(() => {});
    };
    const toggleStatFilter = key => {
      const nextKey = activeStatFilter.value === key ? '' : key;
      activeStatFilter.value = nextKey;
      filters.recordType = '';
      filters.status = '';
      filters.metricScope = '';
      if (nextKey === 'FORMAL') filters.recordType = 'BATCH';
      if (nextKey === 'PENDING_APPROVAL') {
        filters.recordType = 'APPLICATION';
        filters.status = '待審批';
      }
      if (['HAS_TICKETS', 'ISSUED', 'USED'].includes(nextKey)) {
        filters.recordType = 'BATCH';
        filters.metricScope = nextKey;
      }
      pagination.page = 1;
    };
    const syncCardFromFilters = () => {
      if (filters.recordType === 'BATCH' && !filters.status && !filters.metricScope) {
        activeStatFilter.value = 'FORMAL';
      } else if (filters.recordType === 'APPLICATION' && filters.status === '待審批' && !filters.metricScope) {
        activeStatFilter.value = 'PENDING_APPROVAL';
      } else if (filters.recordType === 'BATCH' && !filters.status && ['HAS_TICKETS', 'ISSUED', 'USED'].includes(filters.metricScope)) {
        activeStatFilter.value = filters.metricScope;
      } else {
        activeStatFilter.value = '';
      }
      pagination.page = 1;
    };
    const resetFilters = () => {
      filters.keyword = '';
      filters.recordType = '';
      filters.status = '';
      filters.metricScope = '';
      filters.issueMode = '';
      filters.station = '';
      filters.pickupRange = [];
      activeStatFilter.value = '';
      moreFiltersVisible.value = false;
      pagination.page = 1;
    };
    return {
      filters,
      filterToolbar,
      filterLayoutTier,
      pagination,
      activeStatFilter,
      moreFiltersVisible,
      advancedFilterCount,
      stationOptions,
      filteredBatches,
      pagedBatches,
      stats,
      applicationDialogVisible,
      applicationDetailVisible,
      importDialogVisible,
      importPreviewReady,
      importHasError,
      importErrors,
      editingApplication,
      currentApplication,
      applicationForm,
      getIssueModeLabel,
      formatIssueUsageSummary,
      getBatchStatusType,
      openDetail,
      exportBatch,
      exportCurrentEnterprise,
      resetFilters,
      openApplicationDialog,
      saveApplicationDraft,
      submitApplication,
      openImportDialog,
      simulateImport,
      confirmImport,
      openApplicationDetail,
      withdrawApplication,
      toggleStatFilter,
      syncCardFromFilters,
      filterResizeObserver,
      updateFilterLayout,
      batches,
      resetApplicationForm,
      validateApplication,
      buildApplicationRecord,
      upsertApplication
    };
  }
  return pageSetup();
}
export default function EnterpriseChannelTicketBatchesBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-channel-ticket-batches" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="flex justify-between items-end mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("合作通路租車券")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("統一查看本企業的批次申報與正式批次，也可在線提交新的租車券批次申報。")}</p></div>
<div className="flex gap-3"><RimoElement kind="el-button" type="primary" size="large" onClick={_event => {
            view.openApplicationDialog();
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text(" 申請批次\n                        ")}</RimoElement></div></div>
<div className="grid grid-cols-5 gap-4 mb-6"><button type="button" onClick={_event => {
          view.toggleStatFilter('FORMAL');
        }} className={rimoClass(["text-left bg-white rounded-xl shadow-sm border p-5 transition-all", rimoClass(view.activeStatFilter === 'FORMAL' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-100 hover:border-[color:var(--app-color-primary-light-7)]')])}><span className="text-sm text-gray-500 font-medium mb-1 block">{text("正式批次")}</span>
<span className="card-value text-gray-800">{rimoText(view.stats.formalBatchCount)}</span></button>
<button type="button" onClick={_event => {
          view.toggleStatFilter('PENDING_APPROVAL');
        }} className={rimoClass(["text-left bg-white rounded-xl shadow-sm border p-5 transition-all", rimoClass(view.activeStatFilter === 'PENDING_APPROVAL' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-100 hover:border-[color:var(--app-color-primary-light-7)]')])}><span className="text-sm text-gray-500 font-medium mb-1 block">{text("待審批申報")}</span>
<span className="card-value text-amber-500">{rimoText(view.stats.pendingApproval)}</span></button>
<button type="button" onClick={_event => {
          view.toggleStatFilter('HAS_TICKETS');
        }} className={rimoClass(["text-left bg-white rounded-xl shadow-sm border p-5 transition-all", rimoClass(view.activeStatFilter === 'HAS_TICKETS' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-100 hover:border-[color:var(--app-color-primary-light-7)]')])}><span className="text-sm text-gray-500 font-medium mb-1 block">{text("租車券總數")}</span>
<span className="card-value text-gray-800">{rimoText(view.stats.total)}</span></button>
<button type="button" onClick={_event => {
          view.toggleStatFilter('ISSUED');
        }} className={rimoClass(["text-left bg-white rounded-xl shadow-sm border p-5 transition-all", rimoClass(view.activeStatFilter === 'ISSUED' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-100 hover:border-[color:var(--app-color-primary-light-7)]')])}><span className="text-sm text-gray-500 font-medium mb-1 block">{text("已發放 / 已領取")}</span>
<span className="card-value text-emerald-600">{rimoText(view.stats.issued)}</span></button>
<button type="button" onClick={_event => {
          view.toggleStatFilter('USED');
        }} className={rimoClass(["text-left bg-white rounded-xl shadow-sm border p-5 transition-all", rimoClass(view.activeStatFilter === 'USED' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-100 hover:border-[color:var(--app-color-primary-light-7)]')])}><span className="text-sm text-gray-500 font-medium mb-1 block">{text("已使用")}</span>
<span className="card-value text-[color:var(--app-color-primary)]">{rimoText(view.stats.used)}</span></button></div>
<section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-4 border-b border-gray-100 bg-gray-50"><div ref={model.ref("filterToolbar")} className="adaptive-filter-toolbar flex flex-wrap gap-3 items-center justify-between"><div className="adaptive-filter-controls flex flex-wrap gap-3 items-center"><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
                model.write(["filters", "keyword"], value);
              }} placeholder="名稱 / 申報單號 / 批次編號" clearable={true} prefixIcon="Search" style={rimoStyle("width: 250px")}></RimoElement>
{view.filterLayoutTier >= 2 ? <><RimoElement kind="el-select" modelValue={view.filters.recordType} onModelChange={value => {
                  model.write(["filters", "recordType"], value);
                }} placeholder="記錄類型" clearable={true} style={rimoStyle("width: 140px")} onChange={event => {
                  view.syncCardFromFilters?.(event);
                }}><RimoElement kind="el-option" label="正式批次" value="BATCH"></RimoElement>
<RimoElement kind="el-option" label="批次申報" value="APPLICATION"></RimoElement></RimoElement></> : null}
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
                model.write(["filters", "status"], value);
              }} placeholder="狀態" clearable={true} style={rimoStyle("width: 140px")} onChange={event => {
                view.syncCardFromFilters?.(event);
              }}><RimoElement kind="el-option" label="草稿" value="草稿"></RimoElement>
<RimoElement kind="el-option" label="待審批" value="待審批"></RimoElement>
<RimoElement kind="el-option" label="已駁回" value="已駁回"></RimoElement>
<RimoElement kind="el-option" label="待導入名單" value="待導入名單"></RimoElement>
<RimoElement kind="el-option" label="啓用" value="啓用"></RimoElement>
<RimoElement kind="el-option" label="停用" value="停用"></RimoElement></RimoElement>
{view.filterLayoutTier >= 3 ? <><RimoElement kind="el-select" modelValue={view.filters.metricScope} onModelChange={value => {
                  model.write(["filters", "metricScope"], value);
                }} placeholder="數據範圍" clearable={true} style={rimoStyle("width: 160px")} onChange={event => {
                  view.syncCardFromFilters?.(event);
                }}><RimoElement kind="el-option" label="有租車券" value="HAS_TICKETS"></RimoElement>
<RimoElement kind="el-option" label="已有發放 / 領取" value="ISSUED"></RimoElement>
<RimoElement kind="el-option" label="已有使用" value="USED"></RimoElement></RimoElement></> : null}
{view.filterLayoutTier >= 4 ? <><RimoElement kind="el-select" modelValue={view.filters.issueMode} onModelChange={value => {
                  model.write(["filters", "issueMode"], value);
                }} placeholder="發券方式" clearable={true} style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="名單發放" value="LIST"></RimoElement>
<RimoElement kind="el-option" label="數量生成" value="QUANTITY"></RimoElement></RimoElement></> : null}
<RimoElement kind="el-button" type="primary" icon="Filter" plain={true} onClick={_event => {
                model.write(["moreFiltersVisible"], !view.moreFiltersVisible);
              }}>{text("\n                                    ")}{rimoText(view.moreFiltersVisible ? '收起篩選' : '更多篩選')}{text("\n                                ")}</RimoElement>
<RimoElement kind="el-tooltip" content="重置篩選" placement="top"><RimoElement kind="el-button" circle={true} onClick={event => {
                  view.resetFilters?.(event);
                }}><RimoElement kind="el-icon"><RimoIcon name="Refresh" /></RimoElement></RimoElement></RimoElement></div>
<span className="text-sm text-gray-500">{text("共 ")}{rimoText(view.filteredBatches.length)}{text(" 筆記錄")}</span></div>
{view.moreFiltersVisible ? <><div className="adaptive-filter-controls mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-3 items-center">{view.filterLayoutTier < 2 ? <><RimoElement kind="el-select" modelValue={view.filters.recordType} onModelChange={value => {
                  model.write(["filters", "recordType"], value);
                }} placeholder="記錄類型" clearable={true} style={rimoStyle("width: 140px")} onChange={event => {
                  view.syncCardFromFilters?.(event);
                }}><RimoElement kind="el-option" label="正式批次" value="BATCH"></RimoElement>
<RimoElement kind="el-option" label="批次申報" value="APPLICATION"></RimoElement></RimoElement></> : null}
{view.filterLayoutTier < 3 ? <><RimoElement kind="el-select" modelValue={view.filters.metricScope} onModelChange={value => {
                  model.write(["filters", "metricScope"], value);
                }} placeholder="數據範圍" clearable={true} style={rimoStyle("width: 160px")} onChange={event => {
                  view.syncCardFromFilters?.(event);
                }}><RimoElement kind="el-option" label="有租車券" value="HAS_TICKETS"></RimoElement>
<RimoElement kind="el-option" label="已有發放 / 領取" value="ISSUED"></RimoElement>
<RimoElement kind="el-option" label="已有使用" value="USED"></RimoElement></RimoElement></> : null}
{view.filterLayoutTier < 4 ? <><RimoElement kind="el-select" modelValue={view.filters.issueMode} onModelChange={value => {
                  model.write(["filters", "issueMode"], value);
                }} placeholder="發券方式" clearable={true} style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="名單發放" value="LIST"></RimoElement>
<RimoElement kind="el-option" label="數量生成" value="QUANTITY"></RimoElement></RimoElement></> : null}
<RimoElement kind="el-select" modelValue={view.filters.station} onModelChange={value => {
                model.write(["filters", "station"], value);
              }} placeholder="適用據點" clearable={true} filterable={true} style={rimoStyle("width: 190px")}>{rimoEntries(view.stationOptions).map(([station], _itemIndex) => <Fragment key={station}><RimoElement kind="el-option" key={station} label={station} value={station}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-date-picker" modelValue={view.filters.pickupRange} onModelChange={value => {
                model.write(["filters", "pickupRange"], value);
              }} type="datetimerange" rangeSeparator="至" startPlaceholder="取車開始" endPlaceholder="取車結束" style={rimoStyle("width: 360px")}></RimoElement></div></> : null}</div>
<RimoElement kind="el-table" data={view.pagedBatches} style={rimoStyle("width: 100%")}><RimoElement kind="el-table-column" label="編號" width="190" slots={{
            "default": ({
              row
            }) => <><div className="font-medium text-gray-800">{rimoText(row.recordNo)}</div>
<div className="text-xs text-gray-500">{rimoText(row.recordType === 'APPLICATION' ? '批次申報單' : '正式批次')}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="批次名稱" minWidth="210" slots={{
            "default": ({
              row
            }) => <><div className="font-semibold text-gray-900">{rimoText(row.name)}</div>
<div className="text-xs text-gray-500 mt-1">{rimoText(row.sourceLabel)}{text(" / ")}{rimoText(view.getIssueModeLabel(row.issueMode))}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="適用據點範圍" minWidth="180" slots={{
            "default": ({
              row
            }) => <>{row.recordType === 'BATCH' ? <><><div className="text-sm text-gray-800">{rimoText(row.stationTypes.length)}{text(" 類據點 / ")}{rimoText(row.stations.length)}{text(" 個據點")}</div>
<RimoElement kind="el-tooltip" content={row.stations.join('、')} placement="top"><div className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">{rimoText(row.stations.join('、'))}</div></RimoElement></></> : <><><div className="text-sm text-gray-500">{text("營運審批時配置")}</div>
<div className="text-xs text-gray-400 mt-1">{text("申報階段不展示據點資源")}</div></></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="固定取還車時間" width="180" slots={{
            "default": ({
              row
            }) => <><div>{rimoText(row.pickupAt)}</div>
<div className="text-xs text-gray-500">{rimoText(row.returnAt)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="數量 / 發放使用統計" width="210" slots={{
            "default": ({
              row
            }) => <>{row.recordType === 'BATCH' ? <><><div className="text-sm text-gray-900">{text("總數 ")}{rimoText(row.totalCount)}</div>
<div className="text-xs text-gray-500">{rimoText(view.formatIssueUsageSummary(row))}</div></></> : <><><div className="text-sm text-gray-900">{text("申報 ")}{rimoText(row.totalCount || 0)}{text(" 張")}</div>
<div className="text-xs text-gray-500">{rimoText(row.issueMode === 'LIST' ? row.listSummary : '數量生成')}</div></></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="110" align="center" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={view.getBatchStatusType(row.status)} effect="plain">{rimoText(row.status)}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="210" align="right" fixed="right" slots={{
            "default": ({
              row
            }) => <>{row.recordType === 'BATCH' ? <><><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                    view.openDetail(row);
                  }}>{text("查看詳情")}</RimoElement>
<RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                    view.exportBatch(row);
                  }}>{text("導出")}</RimoElement></></> : row.status === '待審批' ? <><><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                    view.openApplicationDetail(row);
                  }}>{text("查看")}</RimoElement>
<RimoElement kind="el-button" type="warning" link={true} onClick={_event => {
                    view.withdrawApplication(row);
                  }}>{text("撤回")}</RimoElement></></> : <><><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                    view.openApplicationDetail(row);
                  }}>{text("查看")}</RimoElement>
<RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                    view.openApplicationDialog(row);
                  }}>{rimoText(row.status === '已駁回' ? '修改重提' : '編輯')}</RimoElement></></>}</>
          }}></RimoElement></RimoElement>
<div className="px-4 py-3 border-t border-gray-100 flex justify-end"><RimoElement kind="el-pagination" currentPage={view.pagination.page} onCurrentPageChange={value => {
            model.write(["pagination", "page"], value);
          }} pageSize={view.pagination.pageSize} onPageSizeChange={value => {
            model.write(["pagination", "pageSize"], value);
          }} pageSizes={[10, 20, 50]} layout="total, sizes, prev, pager, next" total={view.filteredBatches.length}></RimoElement></div></section></div><RimoElement kind="el-dialog" modelValue={view.applicationDialogVisible} onModelChange={value => {
      model.write(["applicationDialogVisible"], value);
    }} title={view.editingApplication ? '編輯批次申報' : '申請租車券批次'} width="920px" top="4vh" className="channel-ticket-batches-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["applicationDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" onClick={event => {
          view.saveApplicationDraft?.(event);
        }}>{text("保存草稿")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
          view.submitApplication?.(event);
        }}>{text("提交審批")}</RimoElement></>
    }}>{() => <><RimoElement kind="el-alert" title="企業提交的是批次申報，營運端審批通過後纔會生成正式批次和租車券。" type="info" closable={false} className="mb-5"></RimoElement>
<RimoElement kind="el-form" labelWidth="118px"><div className="grid grid-cols-2 gap-x-8" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="申報企業"><RimoElement kind="el-input" modelValue={view.applicationForm.enterprise} onModelChange={value => {
                model.write(["applicationForm", "enterprise"], value);
              }} disabled={true}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="適用服務"><RimoElement kind="el-input" modelValue="分時租賃 / 同站租還" disabled={true}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="批次名稱" required={true}><RimoElement kind="el-input" modelValue={view.applicationForm.name} onModelChange={value => {
                model.write(["applicationForm", "name"], value);
              }} placeholder="請輸入活動或批次名稱"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="時間規則" className="col-span-2"><RimoElement kind="el-radio-group" modelValue={view.applicationForm.timeRuleType} onModelChange={value => {
                model.write(["applicationForm", "timeRuleType"], value);
              }}><RimoElement kind="el-radio-button" label="FIXED_PERIOD">{text("固定取還車時間")}</RimoElement>
<RimoElement kind="el-radio-button" label="FIXED_DURATION" disabled={true}>{text("固定租用時長（預留）")}</RimoElement></RimoElement>
<div className="w-full text-xs text-gray-500 mt-1">{text("固定租用時長用於金門後續迭代及臺灣市場擴展，本期不可選擇。")}</div></RimoElement>
<RimoElement kind="el-form-item" label="發券方式" required={true}><RimoElement kind="el-radio-group" modelValue={view.applicationForm.issueMode} onModelChange={value => {
                model.write(["applicationForm", "issueMode"], value);
              }}><RimoElement kind="el-radio-button" label="LIST">{text("名單發放")}</RimoElement>
<RimoElement kind="el-radio-button" label="QUANTITY">{text("數量生成")}</RimoElement></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="固定取車時間" required={true}><RimoElement kind="el-date-picker" modelValue={view.applicationForm.pickupAt} onModelChange={value => {
                model.write(["applicationForm", "pickupAt"], value);
              }} type="datetime" valueFormat="YYYY-MM-DD HH:mm" placeholder="選擇取車時間" style={rimoStyle("width:100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="固定還車時間" required={true}><RimoElement kind="el-date-picker" modelValue={view.applicationForm.returnAt} onModelChange={value => {
                model.write(["applicationForm", "returnAt"], value);
              }} type="datetime" valueFormat="YYYY-MM-DD HH:mm" placeholder="選擇還車時間" style={rimoStyle("width:100%")}></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="可用開始時間"><div className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2"><div className="text-sm text-gray-800">{text("正式批次建立時間")}</div>
<div className="text-xs text-gray-500 mt-1">{text("營運審批通過並建立正式批次後立即開始可用。")}</div></div></RimoElement>
<RimoElement kind="el-form-item" label="可用結束時間"><div className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2"><div className="text-sm text-gray-800">{rimoText(view.applicationForm.returnAt || '固定還車時間')}</div>
<div className="text-xs text-gray-500 mt-1">{text("系統默認等於本次申報的固定還車時間。")}</div></div></RimoElement></div>
<div className="border rounded-lg bg-gray-50 px-4 py-4 mb-4">{view.applicationForm.issueMode === 'LIST' ? <><div className="flex items-center justify-between"><div><div className="font-medium text-gray-800">{text("用券人名單")}</div>
{view.applicationForm.hasImportedList ? <><div className="text-sm text-gray-500 mt-1">{text("\n                                        已導入 ")}{rimoText(view.applicationForm.totalCount)}{text(" 人，已匹配會員 ")}{rimoText(view.applicationForm.matchedCount)}{text(" 人，待匹配會員 ")}{rimoText(view.applicationForm.pendingMatchCount)}{text(" 人\n                                    ")}</div></> : <><div className="text-sm text-amber-600 mt-1">{text("提交審批前必須完成名單導入和校驗。")}</div></>}</div>
<RimoElement kind="el-button" type="primary" plain={true} onClick={event => {
                  view.openImportDialog?.(event);
                }}>{text("導入名單")}</RimoElement></div></> : <><div className="flex items-center justify-between"><div><div className="font-medium text-gray-800">{text("租車券數量")}</div>
<div className="text-sm text-gray-500 mt-1">{text("審批通過後按申報數量生成租車券和兌換碼。")}</div></div>
<RimoElement kind="el-input-number" modelValue={view.applicationForm.totalCount} onModelChange={value => {
                  model.write(["applicationForm", "totalCount"], value);
                }} min={1} max={9999}></RimoElement></div></>}</div>
<RimoElement kind="el-form-item" label="申報說明"><RimoElement kind="el-input" modelValue={view.applicationForm.remark} onModelChange={value => {
              model.write(["applicationForm", "remark"], value);
            }} type="textarea" rows={3} placeholder="填寫活動背景、預計使用方式或需營運人員關注的事項"></RimoElement></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.importDialogVisible} onModelChange={value => {
      model.write(["importDialogVisible"], value);
    }} title="導入用券人名單" width="720px" className="channel-ticket-batches-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["importDialogVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" disabled={!view.importPreviewReady || view.importHasError} onClick={event => {
          view.confirmImport?.(event);
        }}>{text("確認導入")}</RimoElement></>
    }}>{() => <><div className="border border-dashed border-gray-300 rounded-lg p-6 text-center"><RimoElement kind="el-icon" className="text-3xl text-gray-400"><RimoIcon name="UploadFilled" /></RimoElement>
<div className="font-medium text-gray-700 mt-2">{text("選擇名單文件進行校驗")}</div>
<div className="text-sm text-gray-500 mt-1">{text("模板字段：姓名、證件號碼，不包含證件類型；同一批次證件號碼不得重複。")}</div>
<div className="mt-4 flex justify-center gap-3"><RimoElement kind="el-button">{text("下載模板")}</RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} onClick={_event => {
              view.simulateImport(false);
            }}>{text("模擬成功導入")}</RimoElement>
<RimoElement kind="el-button" type="danger" plain={true} onClick={_event => {
              view.simulateImport(true);
            }}>{text("模擬異常")}</RimoElement></div></div>
{view.importPreviewReady ? <><RimoElement kind="el-alert" title={view.importHasError ? '導入異常：存在證件號碼重複或格式錯誤。' : '導入成功：12 人，已匹配會員 9 人，待匹配會員 3 人。'} type={view.importHasError ? 'error' : 'success'} closable={false} className="mt-4"></RimoElement></> : null}
{view.importPreviewReady && view.importHasError ? <><RimoElement kind="el-table" data={view.importErrors} size="small" border={true} className="mt-3"><RimoElement kind="el-table-column" prop="rowNo" label="行號" width="80"></RimoElement>
<RimoElement kind="el-table-column" prop="documentNo" label="證件號碼" width="180"></RimoElement>
<RimoElement kind="el-table-column" prop="reason" label="異常原因"></RimoElement></RimoElement></> : null}</>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.applicationDetailVisible} onModelChange={value => {
      model.write(["applicationDetailVisible"], value);
    }} title="批次申報詳情" width="860px" className="channel-ticket-batches-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["applicationDetailVisible"], false);
        }}>{text("關閉")}</RimoElement></>
    }}>{() => <>{view.currentApplication ? <><RimoElement kind="el-descriptions" column={2} border={true}><RimoElement kind="el-descriptions-item" label="申報單編號">{rimoText(view.currentApplication.recordNo)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="申報狀態"><RimoElement kind="el-tag" type={view.getBatchStatusType(view.currentApplication.status)}>{rimoText(view.currentApplication.status)}</RimoElement></RimoElement>
<RimoElement kind="el-descriptions-item" label="批次名稱">{rimoText(view.currentApplication.name)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="發券方式">{rimoText(view.getIssueModeLabel(view.currentApplication.issueMode))}</RimoElement>
<RimoElement kind="el-descriptions-item" label="時間規則">{text("固定取還車時間")}</RimoElement>
<RimoElement kind="el-descriptions-item" label="固定時長模式">{text("預留，未開放")}</RimoElement>
<RimoElement kind="el-descriptions-item" label="固定取車時間">{rimoText(view.currentApplication.pickupAt)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="固定還車時間">{rimoText(view.currentApplication.returnAt)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="申報數量">{rimoText(view.currentApplication.totalCount)}{text(" 張")}</RimoElement>
<RimoElement kind="el-descriptions-item" label="申報版本">{text("V")}{rimoText(view.currentApplication.applicationVersion || 1)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="申報說明" span={2}>{rimoText(view.currentApplication.remark || '-')}</RimoElement>
{view.currentApplication.status === '已駁回' ? <><RimoElement kind="el-descriptions-item" label="駁回原因" span={2}><span className="text-red-600">{rimoText(view.currentApplication.rejectReason)}</span></RimoElement></> : null}</RimoElement></> : null}</>}</RimoElement></RimoRoot>;
}