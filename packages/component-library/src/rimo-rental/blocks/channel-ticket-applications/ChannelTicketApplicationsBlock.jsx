import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './channel-ticket-applications.css';
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
      cell: ref
    } = model;
    const filters = reactive({
      keyword: '',
      enterprise: '',
      status: '',
      issueMode: ''
    });
    const pagination = reactive({
      page: 1,
      pageSize: 10
    });
    const activeStatusCard = ref('');
    const detailVisible = ref(false);
    const reviewVisible = ref(false);
    const currentApplication = ref(null);
    const reviewForm = reactive({
      result: 'APPROVE',
      stationTypes: [],
      stations: [],
      initialBatchStatus: '停用',
      comment: ''
    });
    const stationTypeOptions = [{
      label: '一般預約開放',
      value: '一般預約開放'
    }, {
      label: '旅行社團體專用',
      value: '旅行社團體專用'
    }, {
      label: '企業活動合作據點',
      value: '企業活動合作據點'
    }];
    const stationCatalog = [{
      label: '金城民生停車場',
      value: '金城民生停車場',
      type: '旅行社團體專用',
      vehicleCount: 10
    }, {
      label: '金湖機場停車場',
      value: '金湖機場停車場',
      type: '旅行社團體專用',
      vehicleCount: 6
    }, {
      label: '山外車站停車場',
      value: '山外車站停車場',
      type: '一般預約開放',
      vehicleCount: 12
    }, {
      label: '金門大學停車場',
      value: '金門大學停車場',
      type: '一般預約開放',
      vehicleCount: 6
    }, {
      label: '臺北信義企業停車場',
      value: '臺北信義企業停車場',
      type: '企業活動合作據點',
      vehicleCount: 9
    }];
    const relatedBatchMock = [{
      batchNo: 'GT-KM-20260720-001',
      remainingCount: 8,
      stations: ['金城民生停車場']
    }, {
      batchNo: 'GT-KM-20260722-002',
      remainingCount: 3,
      stations: ['金城民生停車場', '金湖機場停車場']
    }, {
      batchNo: 'GT-KM-20260724-003',
      remainingCount: 6,
      stations: ['山外車站停車場']
    }, {
      batchNo: 'GT-TP-20260726-001',
      remainingCount: 5,
      stations: ['臺北信義企業停車場']
    }];
    const getRelatedMaxOccupancy = (stations = []) => {
      const selectedStations = stationCatalog.filter(item => stations.includes(item.value));
      const relatedBatches = relatedBatchMock.map(batch => ({
        ...batch,
        availableStations: batch.stations.filter(station => stations.includes(station))
      })).filter(batch => batch.availableStations.length > 0);
      const batchCount = relatedBatches.length;
      const stationCount = selectedStations.length;
      const source = 0;
      const batchStart = 1;
      const stationStart = batchStart + batchCount;
      const sink = stationStart + stationCount;
      const capacity = Array.from({
        length: sink + 1
      }, () => Array(sink + 1).fill(0));
      relatedBatches.forEach((batch, batchIndex) => {
        capacity[source][batchStart + batchIndex] = batch.remainingCount;
        batch.availableStations.forEach(station => {
          const stationIndex = selectedStations.findIndex(item => item.value === station);
          if (stationIndex >= 0) capacity[batchStart + batchIndex][stationStart + stationIndex] = batch.remainingCount;
        });
      });
      selectedStations.forEach((station, stationIndex) => {
        capacity[stationStart + stationIndex][sink] = station.vehicleCount;
      });
      let maxOccupancy = 0;
      while (true) {
        const parent = Array(sink + 1).fill(-1);
        const queue = [source];
        parent[source] = source;
        for (let index = 0; index < queue.length && parent[sink] === -1; index += 1) {
          const current = queue[index];
          for (let next = 0; next <= sink; next += 1) {
            if (parent[next] === -1 && capacity[current][next] > 0) {
              parent[next] = current;
              queue.push(next);
            }
          }
        }
        if (parent[sink] === -1) break;
        let flow = Infinity;
        for (let node = sink; node !== source; node = parent[node]) {
          flow = Math.min(flow, capacity[parent[node]][node]);
        }
        for (let node = sink; node !== source; node = parent[node]) {
          capacity[parent[node]][node] -= flow;
          capacity[node][parent[node]] += flow;
        }
        maxOccupancy += flow;
      }
      return {
        relatedBatchCount: relatedBatches.length,
        relatedVoucherCount: relatedBatches.reduce((sum, batch) => sum + batch.remainingCount, 0),
        relatedMaxOccupancy: maxOccupancy
      };
    };
    const buildCapacityHint = (stations = [], currentDemand = 0) => {
      const normalizedDemand = Number(currentDemand || 0);
      const availableVehicleCount = stationCatalog.filter(item => stations.includes(item.value)).reduce((sum, item) => sum + item.vehicleCount, 0);
      const related = getRelatedMaxOccupancy(stations);
      const remainingVehicleCount = Math.max(availableVehicleCount - related.relatedMaxOccupancy, 0);
      const pending = stations.length === 0 || normalizedDemand <= 0;
      const hasRisk = !pending && normalizedDemand > remainingVehicleCount;
      return {
        currentDemand: normalizedDemand,
        availableVehicleCount,
        ...related,
        remainingVehicleCount,
        pending,
        hasRisk,
        tag: pending ? '待判斷' : hasRisk ? '存在庫存風險' : '未發現庫存風險'
      };
    };
    const applications = reactive([{
      id: 1,
      applicationNo: 'AP-KM-20260709-001',
      version: 1,
      name: '金門夏季企業體驗活動租車券',
      enterprise: '金門風獅爺旅行社',
      applicant: '王雅婷',
      issueMode: 'QUANTITY',
      totalCount: 20,
      matchedCount: 0,
      pendingMatchCount: 0,
      stationTypes: [],
      stations: [],
      pickupAt: '2026-07-25 09:00',
      returnAt: '2026-07-25 18:00',
      availableStartAt: '2026-07-10 00:00',
      availableEndAt: '2026-07-25 17:00',
      submittedAt: '2026-07-09 10:18',
      status: '待審批',
      remark: '企業暑期會員體驗活動，預計統一於活動日使用。'
    }, {
      id: 2,
      applicationNo: 'AP-KM-20260709-002',
      version: 2,
      name: '海峽科技員工家庭日租車券',
      enterprise: '海峽科技股份有限公司',
      applicant: '陳冠宇',
      issueMode: 'LIST',
      totalCount: 16,
      matchedCount: 11,
      pendingMatchCount: 5,
      stationTypes: [],
      stations: [],
      pickupAt: '2026-07-28 08:30',
      returnAt: '2026-07-28 17:30',
      availableStartAt: '2026-07-12 00:00',
      availableEndAt: '2026-07-28 16:30',
      submittedAt: '2026-07-09 09:42',
      status: '待審批',
      remark: '員工家庭日活動，由企業統一通知參與人員。'
    }, {
      id: 3,
      applicationNo: 'AP-KM-20260708-003',
      version: 1,
      name: '藍灣旅行社機場接駁團租車券',
      enterprise: '金門藍灣旅行社',
      applicant: '林淑芬',
      issueMode: 'LIST',
      totalCount: 12,
      matchedCount: 8,
      pendingMatchCount: 4,
      stationTypes: ['旅行社團體專用'],
      stations: ['金湖機場停車場'],
      pickupAt: '2026-07-20 09:00',
      returnAt: '2026-07-20 18:00',
      availableStartAt: '2026-07-09 08:50',
      availableEndAt: '2026-07-20 18:00',
      submittedAt: '2026-07-08 14:05',
      status: '已通過',
      remark: '機場接駁團體使用。',
      reviewedAt: '2026-07-09 08:50',
      reviewer: '營運管理員',
      reviewComment: '資料確認無誤，批次初始狀態爲停用。',
      generatedBatchNo: 'GT-KM-20260503-002',
      generatedBatchId: 2
    }, {
      id: 4,
      applicationNo: 'AP-KM-20260708-002',
      version: 1,
      name: '合作伙伴交流活動租車券',
      enterprise: '金門風獅爺旅行社',
      applicant: '王雅婷',
      issueMode: 'LIST',
      totalCount: 12,
      matchedCount: 9,
      pendingMatchCount: 3,
      stationTypes: [],
      stations: [],
      pickupAt: '2026-07-30 10:00',
      returnAt: '2026-07-30 17:00',
      availableStartAt: '2026-07-15 00:00',
      availableEndAt: '2026-07-30 16:00',
      submittedAt: '2026-07-08 11:26',
      status: '已駁回',
      remark: '合作伙伴交流活動。',
      reviewedAt: '2026-07-08 16:30',
      reviewer: '營運管理員',
      rejectReason: '所選據點未開放企業活動合作據點類型，請調整後重新提交。',
      reviewComment: '所選據點未開放企業活動合作據點類型，請調整後重新提交。'
    }, {
      id: 5,
      applicationNo: 'AP-KM-20260707-006',
      version: 1,
      name: '七月企業客戶體驗租車券',
      enterprise: '浯江商務服務有限公司',
      applicant: '李佩珊',
      issueMode: 'QUANTITY',
      totalCount: 10,
      matchedCount: 0,
      pendingMatchCount: 0,
      stationTypes: [],
      stations: [],
      pickupAt: '2026-07-18 09:00',
      returnAt: '2026-07-18 17:00',
      availableStartAt: '2026-07-08 00:00',
      availableEndAt: '2026-07-18 16:00',
      submittedAt: '2026-07-07 15:20',
      status: '已撤回',
      remark: '企業已撤回調整活動日期。'
    }]);
    const enterpriseOptions = computed(() => Array.from(new Set(applications.map(item => item.enterprise))));
    const reviewStationOptions = computed(() => {
      if (!reviewForm.stationTypes.length) return [];
      return stationCatalog.filter(item => reviewForm.stationTypes.includes(item.type));
    });
    const capacityHint = computed(() => {
      return buildCapacityHint(reviewForm.stations, currentApplication.value?.totalCount || 0);
    });
    const filteredApplications = computed(() => {
      const keyword = filters.keyword.trim().toLowerCase();
      return applications.filter(item => {
        const keywordMatch = !keyword || `${item.applicationNo} ${item.name}`.toLowerCase().includes(keyword);
        const enterpriseMatch = !filters.enterprise || item.enterprise === filters.enterprise;
        const statusMatch = !filters.status || item.status === filters.status;
        const issueModeMatch = !filters.issueMode || item.issueMode === filters.issueMode;
        return keywordMatch && enterpriseMatch && statusMatch && issueModeMatch;
      });
    });
    const pagedApplications = computed(() => {
      const start = (pagination.page - 1) * pagination.pageSize;
      return filteredApplications.value.slice(start, start + pagination.pageSize);
    });
    const stats = computed(() => applications.reduce((acc, item) => {
      if (item.status === '待審批') acc.pending += 1;
      if (item.status === '已通過') acc.approved += 1;
      if (item.status === '已駁回') acc.rejected += 1;
      if (item.status === '已撤回') acc.withdrawn += 1;
      return acc;
    }, {
      pending: 0,
      approved: 0,
      rejected: 0,
      withdrawn: 0
    }));
    const getIssueModeLabel = mode => mode === 'QUANTITY' ? '數量生成' : '名單發放';
    const getStatusType = status => {
      if (status === '已通過') return 'success';
      if (status === '已駁回') return 'danger';
      if (status === '待審批') return 'warning';
      return 'info';
    };
    const getApplicationCapacityHint = row => {
      return buildCapacityHint(row?.stations || [], row?.totalCount || 0);
    };
    const resetFilters = () => {
      filters.keyword = '';
      filters.enterprise = '';
      filters.status = '';
      filters.issueMode = '';
      activeStatusCard.value = '';
      pagination.page = 1;
    };
    const toggleStatusCard = status => {
      const nextStatus = activeStatusCard.value === status ? '' : status;
      activeStatusCard.value = nextStatus;
      filters.status = nextStatus;
      pagination.page = 1;
    };
    const syncStatusCard = status => {
      activeStatusCard.value = status || '';
      pagination.page = 1;
    };
    const openDetail = row => {
      currentApplication.value = row;
      detailVisible.value = true;
    };
    const openReview = row => {
      currentApplication.value = row;
      reviewForm.result = 'APPROVE';
      reviewForm.stationTypes = [];
      reviewForm.stations = [];
      reviewForm.initialBatchStatus = '停用';
      reviewForm.comment = '';
      detailVisible.value = false;
      reviewVisible.value = true;
    };
    const submitReview = () => {
      if (!currentApplication.value || currentApplication.value.status !== '待審批') return;
      if (reviewForm.result === 'APPROVE' && (!reviewForm.stationTypes.length || !reviewForm.stations.length)) {
        feedback.ElMessage.warning('審批通過前必須選擇適用據點類型和適用據點');
        return;
      }
      if (reviewForm.result === 'REJECT' && !reviewForm.comment.trim()) {
        feedback.ElMessage.warning('請填寫駁回原因');
        return;
      }
      const row = currentApplication.value;
      if (reviewForm.result === 'REJECT') {
        row.status = '已駁回';
        row.rejectReason = reviewForm.comment;
        row.reviewComment = reviewForm.comment;
        row.reviewedAt = '2026-07-09 11:30';
        row.reviewer = '營運管理員';
        reviewVisible.value = false;
        feedback.ElMessage.success('申報已駁回，企業可修改後重新提交');
        return;
      }
      feedback.ElMessageBox.confirm(`審批通過後將生成正式批次，初始狀態爲“${reviewForm.initialBatchStatus}”。`, '確認審批通過', {
        confirmButtonText: '確認通過',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.status = '已通過';
        row.reviewComment = reviewForm.comment || `審批通過，批次初始狀態爲${reviewForm.initialBatchStatus}。`;
        row.reviewedAt = '2026-07-09 11:30';
        row.reviewer = '營運管理員';
        row.stationTypes = [...reviewForm.stationTypes];
        row.stations = [...reviewForm.stations];
        row.availableStartAt = '2026-07-09 11:30';
        row.availableEndAt = row.returnAt;
        row.generatedBatchNo = `GT-KM-20260709-${String(row.id + 10).padStart(3, '0')}`;
        reviewVisible.value = false;
        feedback.ElMessage.success(`審批通過，已生成正式批次 ${row.generatedBatchNo}`);
      }).catch(() => {});
    };
    const openBatch = row => {
      window.location.href = `channel_ticket_batch_detail.html?id=${row.generatedBatchId || row.id}`;
    };
    const handleReviewStationTypeChange = () => {
      const availableValues = reviewStationOptions.value.map(item => item.value);
      reviewForm.stations = reviewForm.stations.filter(item => availableValues.includes(item));
    };
    return {
      filters,
      pagination,
      activeStatusCard,
      applications,
      enterpriseOptions,
      filteredApplications,
      pagedApplications,
      stats,
      detailVisible,
      reviewVisible,
      currentApplication,
      reviewForm,
      stationTypeOptions,
      reviewStationOptions,
      capacityHint,
      getIssueModeLabel,
      getStatusType,
      getApplicationCapacityHint,
      resetFilters,
      toggleStatusCard,
      syncStatusCard,
      openDetail,
      openReview,
      submitReview,
      openBatch,
      handleReviewStationTypeChange,
      stationCatalog,
      relatedBatchMock,
      getRelatedMaxOccupancy,
      buildCapacityHint
    };
  }
  return pageSetup();
}
export default function ChannelTicketApplicationsBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="channel-ticket-applications" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="mb-5" data-rimo-layout="heading"><h1 className="text-2xl font-bold text-gray-900">{text("租車券申報審批")}</h1>
<p className="text-sm text-gray-500 mt-1">{text("審覈合作通路企業線上提交的批次申報；審批通過後系統生成正式租車券批次。")}</p></div>
<div className="grid grid-cols-4 gap-4 mb-5"><button type="button" onClick={_event => {
          view.toggleStatusCard('待審批');
        }} className={rimoClass(["text-left bg-white rounded-lg border p-5 transition-all", rimoClass(view.activeStatusCard === '待審批' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]')])}><div className="text-sm text-gray-500">{text("待審批")}</div>
<div className="card-value text-amber-500 mt-1">{rimoText(view.stats.pending)}</div></button>
<button type="button" onClick={_event => {
          view.toggleStatusCard('已通過');
        }} className={rimoClass(["text-left bg-white rounded-lg border p-5 transition-all", rimoClass(view.activeStatusCard === '已通過' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]')])}><div className="text-sm text-gray-500">{text("已通過")}</div>
<div className="card-value text-emerald-600 mt-1">{rimoText(view.stats.approved)}</div></button>
<button type="button" onClick={_event => {
          view.toggleStatusCard('已駁回');
        }} className={rimoClass(["text-left bg-white rounded-lg border p-5 transition-all", rimoClass(view.activeStatusCard === '已駁回' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]')])}><div className="text-sm text-gray-500">{text("已駁回")}</div>
<div className="card-value text-red-500 mt-1">{rimoText(view.stats.rejected)}</div></button>
<button type="button" onClick={_event => {
          view.toggleStatusCard('已撤回');
        }} className={rimoClass(["text-left bg-white rounded-lg border p-5 transition-all", rimoClass(view.activeStatusCard === '已撤回' ? 'border-[color:var(--app-color-primary)] ring-2 ring-[color:var(--app-color-primary-light-8)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]')])}><div className="text-sm text-gray-500">{text("已撤回")}</div>
<div className="card-value text-gray-600 mt-1">{rimoText(view.stats.withdrawn)}</div></button></div>
<section className="bg-white rounded-lg border border-gray-200 overflow-hidden"><div className="channel-applications-filter-toolbar p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-3"><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
              model.write(["filters", "keyword"], value);
            }} clearable={true} prefixIcon="Search" placeholder="申報單號 / 批次名稱" style={rimoStyle("width: 230px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.enterprise} onModelChange={value => {
              model.write(["filters", "enterprise"], value);
            }} clearable={true} filterable={true} placeholder="申報企業" style={rimoStyle("width: 210px")}>{rimoEntries(view.enterpriseOptions).map(([item], _itemIndex) => <Fragment key={item}><RimoElement kind="el-option" key={item} label={item} value={item}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.status} onModelChange={value => {
              model.write(["filters", "status"], value);
            }} clearable={true} placeholder="申報狀態" style={rimoStyle("width: 140px")} onChange={event => {
              view.syncStatusCard?.(event);
            }}><RimoElement kind="el-option" label="待審批" value="待審批"></RimoElement>
<RimoElement kind="el-option" label="已通過" value="已通過"></RimoElement>
<RimoElement kind="el-option" label="已駁回" value="已駁回"></RimoElement>
<RimoElement kind="el-option" label="已撤回" value="已撤回"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.filters.issueMode} onModelChange={value => {
              model.write(["filters", "issueMode"], value);
            }} clearable={true} placeholder="發券方式" style={rimoStyle("width: 150px")}><RimoElement kind="el-option" label="名單發放" value="LIST"></RimoElement>
<RimoElement kind="el-option" label="數量生成" value="QUANTITY"></RimoElement></RimoElement>
<RimoElement kind="el-tooltip" content="重置篩選" placement="top"><RimoElement kind="el-button" circle={true} onClick={event => {
                view.resetFilters?.(event);
              }}><RimoElement kind="el-icon"><RimoIcon name="Refresh" /></RimoElement></RimoElement></RimoElement></div>
<span className="text-sm text-gray-500">{text("共 ")}{rimoText(view.filteredApplications.length)}{text(" 筆申報")}</span></div>
<RimoElement kind="el-table" data={view.pagedApplications} style={rimoStyle("width:100%")}><RimoElement kind="el-table-column" label="申報單編號" width="190" slots={{
            "default": ({
              row
            }) => <><div className="font-medium text-gray-800">{rimoText(row.applicationNo)}</div>
<div className="text-xs text-gray-500">{text("申報版本 V")}{rimoText(row.version)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="批次名稱 / 企業" minWidth="220" slots={{
            "default": ({
              row
            }) => <><div className="font-semibold text-gray-900">{rimoText(row.name)}</div>
<div className="text-xs text-gray-500 mt-1">{rimoText(row.enterprise)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="發券方式 / 數量" width="150" slots={{
            "default": ({
              row
            }) => <><div>{rimoText(view.getIssueModeLabel(row.issueMode))}</div>
<div className="text-xs text-gray-500 mt-1">{rimoText(row.totalCount)}{text(" 張")}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="據點配置" minWidth="190" slots={{
            "default": ({
              row
            }) => <>{row.stations.length ? <><><div>{rimoText(row.stationTypes.length)}{text(" 類據點 / ")}{rimoText(row.stations.length)}{text(" 個據點")}</div>
<RimoElement kind="el-tooltip" content={row.stations.join('、')} placement="top"><div className="text-xs text-gray-500 mt-1 truncate max-w-[220px]">{rimoText(row.stations.join('、'))}</div></RimoElement></></> : <><><div className="text-amber-600">{text("待審批配置")}</div>
<div className="text-xs text-gray-500 mt-1">{text("企業申報不含據點範圍")}</div></></>}</>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="固定取還車時間" width="180" slots={{
            "default": ({
              row
            }) => <><div>{rimoText(row.pickupAt)}</div>
<div className="text-xs text-gray-500">{rimoText(row.returnAt)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="提交時間 / 申報人" width="170" slots={{
            "default": ({
              row
            }) => <><div>{rimoText(row.submittedAt)}</div>
<div className="text-xs text-gray-500">{rimoText(row.applicant)}</div></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" width="100" align="center" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-tag" type={view.getStatusType(row.status)} effect="plain">{rimoText(row.status)}</RimoElement></>
          }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="145" align="right" fixed="right" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                view.openDetail(row);
              }}>{text("查看")}</RimoElement>
{row.status === '待審批' ? <><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                  view.openReview(row);
                }}>{text("審批")}</RimoElement></> : row.generatedBatchNo ? <><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                  view.openBatch(row);
                }}>{text("查看批次")}</RimoElement></> : null}</>
          }}></RimoElement></RimoElement>
<div className="px-4 py-3 border-t border-gray-100 flex justify-end"><RimoElement kind="el-pagination" currentPage={view.pagination.page} onCurrentPageChange={value => {
            model.write(["pagination", "page"], value);
          }} pageSize={view.pagination.pageSize} onPageSizeChange={value => {
            model.write(["pagination", "pageSize"], value);
          }} pageSizes={[10, 20, 50]} layout="total, sizes, prev, pager, next" total={view.filteredApplications.length}></RimoElement></div></section></div><RimoElement kind="el-dialog" modelValue={view.detailVisible} onModelChange={value => {
      model.write(["detailVisible"], value);
    }} title="批次申報詳情" width="1040px" top="4vh" className="channel-ticket-applications-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["detailVisible"], false);
        }}>{text("關閉")}</RimoElement>
{view.currentApplication?.status === '待審批' ? <><RimoElement kind="el-button" type="primary" onClick={_event => {
            view.openReview(view.currentApplication);
          }}>{text("進入審批")}</RimoElement></> : null}</>
    }}>{() => <>{view.currentApplication ? <><div><div className="flex items-center justify-between mb-4"><div><div className="text-lg font-semibold text-gray-900">{rimoText(view.currentApplication.name)}</div>
<div className="text-sm text-gray-500 mt-1">{rimoText(view.currentApplication.applicationNo)}{text(" · 申報版本 V")}{rimoText(view.currentApplication.version)}</div></div>
<RimoElement kind="el-tag" type={view.getStatusType(view.currentApplication.status)} size="large">{rimoText(view.currentApplication.status)}</RimoElement></div>
<RimoElement kind="el-descriptions" column={3} border={true}><RimoElement kind="el-descriptions-item" label="申報企業">{rimoText(view.currentApplication.enterprise)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="申報人">{rimoText(view.currentApplication.applicant)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="提交時間">{rimoText(view.currentApplication.submittedAt)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="適用服務">{text("分時租賃 / 同站租還")}</RimoElement>
<RimoElement kind="el-descriptions-item" label="發券方式">{rimoText(view.getIssueModeLabel(view.currentApplication.issueMode))}</RimoElement>
<RimoElement kind="el-descriptions-item" label="申報數量">{rimoText(view.currentApplication.totalCount)}{text(" 張")}</RimoElement>
<RimoElement kind="el-descriptions-item" label="時間規則">{text("固定取還車時間")}</RimoElement>
<RimoElement kind="el-descriptions-item" label="固定時長模式">{text("預留，未開放")}</RimoElement>
<RimoElement kind="el-descriptions-item" label="固定取車時間">{rimoText(view.currentApplication.pickupAt)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="固定還車時間">{rimoText(view.currentApplication.returnAt)}</RimoElement>
<RimoElement kind="el-descriptions-item" label="可用時間">{view.currentApplication.generatedBatchNo ? <><span>{text("\n                                    ")}{rimoText(view.currentApplication.availableStartAt)}{text(" 至 ")}{rimoText(view.currentApplication.availableEndAt)}{text("\n                                ")}</span></> : <><span className="text-gray-500">{text("審批通過後自動生成：正式批次建立時間至固定還車時間")}</span></>}</RimoElement>
<RimoElement kind="el-descriptions-item" label="營運據點配置" span={3}>{view.currentApplication.stations.length ? <><span>{text("\n                                    ")}{rimoText(view.currentApplication.stationTypes.join('、'))}{text(" / ")}{rimoText(view.currentApplication.stations.join('、'))}{text("\n                                ")}</span></> : <><span className="text-amber-600">{text("待審批時配置")}</span></>}</RimoElement>
<RimoElement kind="el-descriptions-item" label="申報說明" span={3}>{rimoText(view.currentApplication.remark || '-')}</RimoElement>
{view.currentApplication.issueMode === 'LIST' ? <><RimoElement kind="el-descriptions-item" label="名單校驗" span={3}><div>{text("導入 ")}{rimoText(view.currentApplication.totalCount)}{text(" 人，已匹配會員 ")}{rimoText(view.currentApplication.matchedCount)}{text(" 人，待匹配會員 ")}{rimoText(view.currentApplication.pendingMatchCount)}{text(" 人，無異常")}</div>
<div className="mt-1 text-xs text-gray-500">{text("名單字段爲姓名、證件號碼，不包含證件類型；同一批次證件號碼已完成唯一性校驗。")}</div></RimoElement></> : null}
{view.currentApplication.rejectReason ? <><RimoElement kind="el-descriptions-item" label="駁回原因" span={3}><span className="text-red-600">{rimoText(view.currentApplication.rejectReason)}</span></RimoElement></> : null}
{view.currentApplication.generatedBatchNo ? <><RimoElement kind="el-descriptions-item" label="生成批次" span={3}><RimoElement kind="el-link" type="primary" onClick={_event => {
                    view.openBatch(view.currentApplication);
                  }}>{rimoText(view.currentApplication.generatedBatchNo)}</RimoElement></RimoElement></> : null}</RimoElement>
{view.currentApplication.stations.length ? <><div className="mt-5 border border-amber-200 bg-amber-50 rounded-lg px-4 py-3"><div className="flex items-center gap-2"><div className="font-medium text-amber-800">{text("車輛庫存提醒")}</div>
<RimoElement kind="el-tag" size="small" type={view.getApplicationCapacityHint(view.currentApplication).pending ? 'info' : view.getApplicationCapacityHint(view.currentApplication).hasRisk ? 'warning' : 'success'} effect="plain">{text("\n                                    ")}{rimoText(view.getApplicationCapacityHint(view.currentApplication).tag)}{text("\n                                ")}</RimoElement></div>
<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700"><span>{text("當前批次 ")}
<b>{rimoText(view.getApplicationCapacityHint(view.currentApplication).currentDemand)}{text(" 張")}</b></span>
<span>{text("適用據點可用 ")}
<b>{rimoText(view.getApplicationCapacityHint(view.currentApplication).availableVehicleCount)}{text(" 臺")}</b></span>
<span>{text("其他相關批次最多佔用 ")}
<b>{rimoText(view.getApplicationCapacityHint(view.currentApplication).relatedMaxOccupancy)}{text(" 臺")}</b></span>
<span>{text("預計剩餘 ")}
<b>{rimoText(view.getApplicationCapacityHint(view.currentApplication).remainingVehicleCount)}{text(" 臺")}</b></span></div></div></> : null}
{view.currentApplication.reviewedAt ? <><div className="mt-5"><div className="font-semibold text-gray-800 mb-2">{text("審批記錄")}</div>
<RimoElement kind="el-table" data={[view.currentApplication]} size="small"><RimoElement kind="el-table-column" prop="reviewedAt" label="審批時間" width="170"></RimoElement>
<RimoElement kind="el-table-column" prop="reviewer" label="審批人" width="120"></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="審批結果" width="110"></RimoElement>
<RimoElement kind="el-table-column" prop="reviewComment" label="審批意見"></RimoElement></RimoElement></div></> : null}</div></> : null}</>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.reviewVisible} onModelChange={value => {
      model.write(["reviewVisible"], value);
    }} title="審批批次申報" width="780px" className="channel-ticket-applications-overlay" slots={{
      "footer": _slot => <><RimoElement kind="el-button" onClick={_event => {
          model.write(["reviewVisible"], false);
        }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type={view.reviewForm.result === 'REJECT' ? 'danger' : 'primary'} onClick={event => {
          view.submitReview?.(event);
        }}>{text("確認")}{rimoText(view.reviewForm.result === 'REJECT' ? '駁回' : '通過')}</RimoElement></>
    }}>{() => <><RimoElement kind="el-alert" title="營運端不能直接修改企業申報內容。資料有誤時請駁回，由企業修改後重新提交。" type="info" closable={false} className="mb-5"></RimoElement>
<RimoElement kind="el-form" labelWidth="126px"><RimoElement kind="el-form-item" label="申報單編號"><span>{rimoText(view.currentApplication?.applicationNo)}</span></RimoElement>
<RimoElement kind="el-form-item" label="審批結果"><RimoElement kind="el-radio-group" modelValue={view.reviewForm.result} onModelChange={value => {
              model.write(["reviewForm", "result"], value);
            }}><RimoElement kind="el-radio-button" label="APPROVE">{text("審批通過")}</RimoElement>
<RimoElement kind="el-radio-button" label="REJECT">{text("審批駁回")}</RimoElement></RimoElement></RimoElement>
{view.reviewForm.result === 'APPROVE' ? <><><RimoElement kind="el-form-item" label="適用據點類型" required={true}><RimoElement kind="el-select" modelValue={view.reviewForm.stationTypes} onModelChange={value => {
                  model.write(["reviewForm", "stationTypes"], value);
                }} multiple={true} collapseTags={true} placeholder="請選擇據點類型" style={rimoStyle("width:100%")} onChange={event => {
                  view.handleReviewStationTypeChange?.(event);
                }}>{rimoEntries(view.stationTypeOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-option" key={option.value} label={option.label} value={option.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="適用據點" required={true}><RimoElement kind="el-select" modelValue={view.reviewForm.stations} onModelChange={value => {
                  model.write(["reviewForm", "stations"], value);
                }} multiple={true} collapseTags={true} filterable={true} placeholder="請選擇該批次可使用的據點" style={rimoStyle("width:100%")}>{rimoEntries(view.reviewStationOptions).map(([option], _itemIndex) => <Fragment key={option.value}><RimoElement kind="el-option" key={option.value} label={option.label} value={option.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
{view.reviewForm.stations.length ? <><div className="ml-[126px] mb-5 border border-amber-200 bg-amber-50 rounded-lg px-4 py-3"><div className="flex items-center gap-2"><div className="font-medium text-amber-800">{text("車輛庫存提醒")}</div>
<RimoElement kind="el-tag" size="small" type={view.capacityHint.pending ? 'info' : view.capacityHint.hasRisk ? 'warning' : 'success'} effect="plain">{rimoText(view.capacityHint.tag)}</RimoElement></div>
<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700"><span>{text("當前批次 ")}
<b>{rimoText(view.capacityHint.currentDemand)}{text(" 張")}</b></span>
<span>{text("適用據點可用 ")}
<b>{rimoText(view.capacityHint.availableVehicleCount)}{text(" 臺")}</b></span>
<span>{text("其他相關批次最多佔用 ")}
<b>{rimoText(view.capacityHint.relatedMaxOccupancy)}{text(" 臺")}</b></span>
<span>{text("預計剩餘 ")}
<b>{rimoText(view.capacityHint.remainingVehicleCount)}{text(" 臺")}</b></span></div></div></> : null}</></> : null}
{view.reviewForm.result === 'APPROVE' ? <><RimoElement kind="el-form-item" label="批次初始狀態"><RimoElement kind="el-radio-group" modelValue={view.reviewForm.initialBatchStatus} onModelChange={value => {
                model.write(["reviewForm", "initialBatchStatus"], value);
              }}><RimoElement kind="el-radio" label="停用">{text("停用（默認）")}</RimoElement>
<RimoElement kind="el-radio" label="啓用">{text("啓用")}</RimoElement></RimoElement></RimoElement></> : null}
<RimoElement kind="el-form-item" label={view.reviewForm.result === 'REJECT' ? '駁回原因' : '審批意見'} required={view.reviewForm.result === 'REJECT'}><RimoElement kind="el-input" modelValue={view.reviewForm.comment} onModelChange={value => {
              model.write(["reviewForm", "comment"], value);
            }} type="textarea" rows={4} placeholder={view.reviewForm.result === 'REJECT' ? '請填寫明確的駁回原因' : '可填寫審批備註'}></RimoElement></RimoElement></RimoElement></>}</RimoElement></RimoRoot>;
}