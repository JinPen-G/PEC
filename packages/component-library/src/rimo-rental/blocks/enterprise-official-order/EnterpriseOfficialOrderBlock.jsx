import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, RimoTable, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-official-order.css';
function createPageState(model) {
  const _document = model.document;
  const _window = model.window;
  const _localStorage = model.storage;
  const _sessionStorage = model.storage;
  const _themeColor = () => model.theme();
  const _themeColorLight = level => model.theme(level);
  const _themeRGBA = alpha => model.themeAlpha(alpha);
  const _feedback = {
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
      watch: watch,
      onMount: onMounted,
      onDispose: onBeforeUnmount
    } = model;
    const {
      Platform,
      Odometer,
      Briefcase,
      Bell,
      Tickets,
      HomeFilled,
      Plus,
      Document,
      Search,
      Filter,
      Refresh,
      Download,
      Setting
    } = rimoIcons;
    const statusActive = ref(0);
    const searchPanelExpanded = ref(false);
    const filterToolbar = ref(null);
    const filterLayoutTier = ref(1);
    let filterResizeObserver = null;
    const updateFilterLayout = () => {
      const width = filterToolbar.value?.clientWidth || 0;
      if (width >= 1370) filterLayoutTier.value = 4;else if (width >= 1140) filterLayoutTier.value = 3;else if (width >= 980) filterLayoutTier.value = 2;else filterLayoutTier.value = 1;
    };
    onMounted(() => {
      filterResizeObserver = new ResizeObserver(updateFilterLayout);
      if (filterToolbar.value) filterResizeObserver.observe(filterToolbar.value);
      updateFilterLayout();
    });
    onBeforeUnmount(() => filterResizeObserver?.disconnect());
    const filters = ref({
      orderNumber: '',
      keyword: '',
      numberPlate: '',
      orderProgress: [],
      orderTime: [],
      memberPlan: [],
      pickupTime: [],
      actualPickupTime: [],
      returnTime: [],
      actualReturnTime: [],
      pickupSite: '',
      actualPickupSite: '',
      returnSite: '',
      actualReturnSite: '',
      model: [],
      vehicleType: []
    });
    const statusCards = [{
      label: '全部',
      count: 18,
      statuses: []
    }, {
      label: '預約中',
      count: 5,
      statuses: ['預約中', '取消申請中', '延時取車']
    }, {
      label: '執行中',
      count: 3,
      statuses: ['已取車', '逾時', '延時']
    }, {
      label: '已完成',
      count: 7,
      statuses: ['已完成', '未取車']
    }, {
      label: '已取消',
      count: 1,
      statuses: ['已取消']
    }, {
      label: '預約被拒',
      count: 1,
      statuses: ['預約被拒']
    }, {
      label: '待審批',
      count: 1,
      statuses: ['待審批']
    }];
    const orderProgressOptions = ['預約中', '取消申請中', '延時取車', '已取車', '逾時', '延時', '已完成', '未取車', '已取消', '預約被拒', '待審批'];
    const orderRows = [{
      orderNumber: 'OFF-20260612001',
      orderTime: '2026/06/12 09:12',
      userName: '王怡君',
      phone: '0912-345-678',
      carModel: 'Toyota Corolla Cross',
      numberPlate: 'XLY-8008',
      pickupTime: '2026/06/13 09:00',
      returnTime: '2026/06/13 18:00',
      actualPickupTime: '-',
      actualReturnTime: '-',
      pickupSite: '八輪測試-寶龍用車點',
      returnStation: '八輪測試-寶龍用車點',
      status: '預約中',
      statusType: 'tag-warning',
      customer: '客戶拜訪',
      canEdit: true
    }, {
      orderNumber: 'OFF-20260611018',
      orderTime: '2026/06/11 16:35',
      userName: '陳建宏',
      phone: '0988-120-776',
      carModel: 'Lexus ES 250',
      numberPlate: 'XLY-8001',
      pickupTime: '2026/06/12 08:30',
      returnTime: '2026/06/12 20:00',
      actualPickupTime: '2026/06/12 08:41',
      actualReturnTime: '-',
      pickupSite: '八輪測試-寶龍用車點',
      returnStation: '八輪測試-啓迪用車點',
      status: '已取車',
      statusType: 'tag-primary',
      customer: '跨區會議',
      canEdit: true
    }, {
      orderNumber: 'OFF-20260610009',
      orderTime: '2026/06/10 10:08',
      userName: '林雅婷',
      phone: '0922-886-301',
      carModel: 'Toyota Camry',
      numberPlate: 'XLY-8004',
      pickupTime: '2026/06/10 13:00',
      returnTime: '2026/06/10 17:00',
      actualPickupTime: '2026/06/10 12:56',
      actualReturnTime: '2026/06/10 16:48',
      pickupSite: '八輪測試-啓迪用車點',
      returnStation: '八輪測試-啓迪用車點',
      status: '已完成',
      statusType: 'tag-success',
      customer: '行政事務',
      canEdit: false
    }, {
      orderNumber: 'OFF-20260609027',
      orderTime: '2026/06/09 14:44',
      userName: '張志明',
      phone: '0935-768-220',
      carModel: 'Nissan X-Trail',
      numberPlate: 'XLY-8007',
      pickupTime: '2026/06/10 09:30',
      returnTime: '2026/06/10 18:30',
      actualPickupTime: '-',
      actualReturnTime: '-',
      pickupSite: '八輪測試-人工智能用車點',
      returnStation: '八輪測試-人工智能用車點',
      status: '預約被拒',
      statusType: 'tag-danger',
      customer: '外勤支援',
      canEdit: false
    }, {
      orderNumber: 'OFF-20260608014',
      orderTime: '2026/06/08 11:20',
      userName: '黃柏翰',
      phone: '0900-668-321',
      carModel: 'Honda CR-V',
      numberPlate: 'XLY-8010',
      pickupTime: '2026/06/09 10:00',
      returnTime: '2026/06/09 15:00',
      actualPickupTime: '-',
      actualReturnTime: '-',
      pickupSite: '八輪測試-啓迪用車點',
      returnStation: '八輪測試-寶龍用車點',
      status: '待審批',
      statusType: 'tag-info',
      customer: '主管審批',
      canEdit: true
    }];
    const normalizeStatuses = statuses => [...statuses].sort().join('|');
    const filteredOrderRows = computed(() => {
      if (filters.value.orderProgress.length === 0) return orderRows;
      return orderRows.filter(row => filters.value.orderProgress.includes(row.status));
    });
    watch(() => normalizeStatuses(filters.value.orderProgress), statusKey => {
      const matchedIndex = statusCards.findIndex(item => normalizeStatuses(item.statuses) === statusKey);
      statusActive.value = matchedIndex >= 0 ? matchedIndex : -1;
    }, {
      flush: 'sync'
    });
    const applyStatusCard = index => {
      if (index === 0) {
        filters.value.orderProgress = [];
        statusActive.value = 0;
        return;
      }
      if (statusActive.value === index) {
        filters.value.orderProgress = [];
        statusActive.value = 0;
        return;
      }
      filters.value.orderProgress = [...statusCards[index].statuses];
      statusActive.value = index;
    };
    return {
      statusActive,
      searchPanelExpanded,
      filterToolbar,
      filterLayoutTier,
      filters,
      statusCards,
      orderProgressOptions,
      orderRows,
      filteredOrderRows,
      applyStatusCard,
      Search,
      Filter,
      Refresh,
      Download,
      Setting,
      Platform,
      Odometer,
      Briefcase,
      Bell,
      Tickets,
      HomeFilled,
      Plus,
      Document,
      filterResizeObserver,
      updateFilterLayout,
      normalizeStatuses
    };
  }
  return pageSetup();
}
export default function EnterpriseOfficialOrderBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-official-order" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="official-order-page"><div className="official-page-header" data-rimo-layout="heading"><div><h1 className="official-page-title">{text("公務訂單管理")}</h1>
<p className="official-page-note">{text("管理公務車預約單，支持訂單查詢、狀態跟蹤及預約用車處理。")}</p></div>
<a href="official_order_add.html" className="official-action-button"><RimoElement kind="el-icon"><RimoIcon name="Plus" /></RimoElement>
<span>{text("新增訂單")}</span></a></div>
<div className="official-summary-panel"><div className="official-summary-head"><div className="official-summary-title">{text("狀態")}</div></div>
<div className="official-summary-grid">{rimoEntries(view.statusCards).map(([item, index], _itemIndex) => <Fragment key={item.label}><button key={item.label} type="button" className={rimoClass(["official-summary-card", rimoClass({
                'is-active': view.statusActive === index
              })])} onClick={_event => {
                view.applyStatusCard(index);
              }}><div className="official-summary-label">{rimoText(item.label)}</div>
<div className="official-summary-count">{rimoText(item.count)}</div></button></Fragment>)}</div></div>
<div className="official-list-panel"><div className="official-filter-panel"><div className="official-filter-bar"><div ref={model.ref("filterToolbar")} className="official-filter-row">{view.filterLayoutTier >= 2 ? <><div className="official-filter-field official-filter-field--sm"><RimoElement kind="el-input" modelValue={view.filters.orderNumber} onModelChange={value => {
                      model.write(["filters", "orderNumber"], value);
                    }} clearable={true} placeholder="訂單號"></RimoElement></div></> : null}
<div className="official-filter-field official-filter-field--wide"><RimoElement kind="el-input" modelValue={view.filters.keyword} onModelChange={value => {
                    model.write(["filters", "keyword"], value);
                  }} clearable={true} prefixIcon={view.Search} placeholder="姓名/Email/手機/身份"></RimoElement></div>
{view.filterLayoutTier >= 3 ? <><div className="official-filter-field official-filter-field--compact"><RimoElement kind="el-input" modelValue={view.filters.numberPlate} onModelChange={value => {
                      model.write(["filters", "numberPlate"], value);
                    }} clearable={true} placeholder="車牌號碼"></RimoElement></div></> : null}
<div className="official-filter-field official-filter-field--status"><RimoElement kind="el-select" modelValue={view.filters.orderProgress} onModelChange={value => {
                    model.write(["filters", "orderProgress"], value);
                  }} multiple={true} collapseTags={true} collapseTagsTooltip={true} clearable={true} placeholder="全部狀態">{rimoEntries(view.orderProgressOptions).map(([item], _itemIndex) => <Fragment key={item}><RimoElement kind="el-option" key={item} label={item} value={item}></RimoElement></Fragment>)}</RimoElement></div>
{view.filterLayoutTier >= 4 ? <><div className="official-filter-field official-filter-field--date"><RimoElement kind="el-date-picker" modelValue={view.filters.orderTime} onModelChange={value => {
                      model.write(["filters", "orderTime"], value);
                    }} type="datetimerange" startPlaceholder="開始時間" endPlaceholder="結束時間" format="YYYY/MM/DD HH:mm" valueFormat="YYYY/MM/DD HH:mm:ss"></RimoElement></div></> : null}
<div className="official-filter-actions"><RimoElement kind="el-button" type="primary" plain={true} className="official-more-filter-button" icon={view.Filter} onClick={_event => {
                    model.write(["searchPanelExpanded"], !view.searchPanelExpanded);
                  }}>{text("\n                                        ")}{rimoText(view.searchPanelExpanded ? '收起篩選' : '更多篩選')}{text("\n                                    ")}</RimoElement>
<RimoElement kind="el-button" circle={true} className="official-reset-button" icon={view.Refresh}></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true} className="official-export-button" icon={view.Download}>{text("\n                                        匯出資料\n                                    ")}</RimoElement>
<RimoElement kind="el-button" circle={true} className="official-column-button" icon={view.Setting}></RimoElement></div></div>
<div hidden={!view.searchPanelExpanded} className="official-advanced-panel"><div className="official-advanced-grid">{view.filterLayoutTier < 2 ? <><div className="official-advanced-control official-advanced-control--md"><RimoElement kind="el-input" modelValue={view.filters.orderNumber} onModelChange={value => {
                        model.write(["filters", "orderNumber"], value);
                      }} clearable={true} placeholder="訂單號"></RimoElement></div></> : null}
{view.filterLayoutTier < 3 ? <><div className="official-advanced-control official-advanced-control--md"><RimoElement kind="el-input" modelValue={view.filters.numberPlate} onModelChange={value => {
                        model.write(["filters", "numberPlate"], value);
                      }} clearable={true} placeholder="車牌號碼"></RimoElement></div></> : null}
{view.filterLayoutTier < 4 ? <><div className="official-advanced-control official-advanced-control--date"><RimoElement kind="el-date-picker" modelValue={view.filters.orderTime} onModelChange={value => {
                        model.write(["filters", "orderTime"], value);
                      }} type="datetimerange" startPlaceholder="開始時間" endPlaceholder="結束時間" format="YYYY/MM/DD HH:mm" valueFormat="YYYY/MM/DD HH:mm:ss"></RimoElement></div></> : null}
<div className="official-advanced-control official-advanced-control--md"><RimoElement kind="el-select" modelValue={view.filters.memberPlan} onModelChange={value => {
                      model.write(["filters", "memberPlan"], value);
                    }} multiple={true} collapseTags={true} collapseTagsTooltip={true} placeholder="會員方案"><RimoElement kind="el-option" label="企業員工方案" value="enterprise"></RimoElement>
<RimoElement kind="el-option" label="主管用車方案" value="manager"></RimoElement></RimoElement></div>
<div className="official-advanced-control official-advanced-control--date"><RimoElement kind="el-date-picker" modelValue={view.filters.pickupTime} onModelChange={value => {
                      model.write(["filters", "pickupTime"], value);
                    }} type="datetimerange" startPlaceholder="預約取車" endPlaceholder="預約還車"></RimoElement></div>
<div className="official-advanced-control official-advanced-control--date"><RimoElement kind="el-date-picker" modelValue={view.filters.actualPickupTime} onModelChange={value => {
                      model.write(["filters", "actualPickupTime"], value);
                    }} type="datetimerange" startPlaceholder="實際取車" endPlaceholder="實際取車"></RimoElement></div>
<div className="official-advanced-control official-advanced-control--date"><RimoElement kind="el-date-picker" modelValue={view.filters.returnTime} onModelChange={value => {
                      model.write(["filters", "returnTime"], value);
                    }} type="datetimerange" startPlaceholder="預約還車" endPlaceholder="預約還車"></RimoElement></div>
<div className="official-advanced-control official-advanced-control--date"><RimoElement kind="el-date-picker" modelValue={view.filters.actualReturnTime} onModelChange={value => {
                      model.write(["filters", "actualReturnTime"], value);
                    }} type="datetimerange" startPlaceholder="實際還車" endPlaceholder="實際還車"></RimoElement></div>
<div className="official-advanced-control official-advanced-control--md"><RimoElement kind="el-select" modelValue={view.filters.pickupSite} onModelChange={value => {
                      model.write(["filters", "pickupSite"], value);
                    }} filterable={true} clearable={true} placeholder="取車據點"><RimoElement kind="el-option" label="八輪測試-寶龍用車點" value="baolong"></RimoElement>
<RimoElement kind="el-option" label="八輪測試-啓迪用車點" value="qidi"></RimoElement></RimoElement></div>
<div className="official-advanced-control official-advanced-control--md"><RimoElement kind="el-select" modelValue={view.filters.actualPickupSite} onModelChange={value => {
                      model.write(["filters", "actualPickupSite"], value);
                    }} filterable={true} clearable={true} placeholder="實際取車點"><RimoElement kind="el-option" label="八輪測試-寶龍用車點" value="baolong"></RimoElement>
<RimoElement kind="el-option" label="八輪測試-人工智能用車點" value="ai"></RimoElement></RimoElement></div>
<div className="official-advanced-control official-advanced-control--md"><RimoElement kind="el-select" modelValue={view.filters.returnSite} onModelChange={value => {
                      model.write(["filters", "returnSite"], value);
                    }} filterable={true} clearable={true} placeholder="還車據點"><RimoElement kind="el-option" label="八輪測試-寶龍用車點" value="baolong"></RimoElement>
<RimoElement kind="el-option" label="八輪測試-啓迪用車點" value="qidi"></RimoElement></RimoElement></div>
<div className="official-advanced-control official-advanced-control--md"><RimoElement kind="el-select" modelValue={view.filters.actualReturnSite} onModelChange={value => {
                      model.write(["filters", "actualReturnSite"], value);
                    }} filterable={true} clearable={true} placeholder="實際還車點"><RimoElement kind="el-option" label="八輪測試-寶龍用車點" value="baolong"></RimoElement>
<RimoElement kind="el-option" label="八輪測試-人工智能用車點" value="ai"></RimoElement></RimoElement></div>
<div className="official-advanced-control official-advanced-control--xl"><RimoElement kind="el-select" modelValue={view.filters.model} onModelChange={value => {
                      model.write(["filters", "model"], value);
                    }} multiple={true} collapseTags={true} clearable={true} placeholder="車型"><RimoElement kind="el-option" label="Toyota Corolla Cross" value="cross"></RimoElement>
<RimoElement kind="el-option" label="Lexus ES 250" value="es250"></RimoElement></RimoElement></div>
<div className="official-advanced-control official-advanced-control--md"><RimoElement kind="el-select" modelValue={view.filters.vehicleType} onModelChange={value => {
                      model.write(["filters", "vehicleType"], value);
                    }} multiple={true} collapseTags={true} clearable={true} placeholder="車輛類型"><RimoElement kind="el-option" label="轎車" value="sedan"></RimoElement>
<RimoElement kind="el-option" label="SUV" value="suv"></RimoElement></RimoElement></div></div></div></div></div>
<div className="official-table-panel"><div className="table-scroll"><RimoTable className="official-order-table"><thead><tr><th style={rimoStyle("width: 190px;")}>{text("訂單號")}</th>
<th style={rimoStyle("width: 160px;")}>{text("用車人")}</th>
<th style={rimoStyle("width: 180px;")}>{text("車輛信息")}</th>
<th style={rimoStyle("width: 190px;")}>{text("預約取還車時間")}</th>
<th style={rimoStyle("width: 190px;")}>{text("實際取還車時間")}</th>
<th style={rimoStyle("width: 210px;")}>{text("預約取還車地點")}</th>
<th className="is-center" style={rimoStyle("width: 110px;")}>{text("狀態")}</th>
<th style={rimoStyle("width: 140px;")}>{text("目的地")}</th>
<th className="is-center" style={rimoStyle("width: 140px;")}>{text("操作")}</th></tr></thead>
<tbody>{rimoEntries(view.filteredOrderRows).map(([row], _itemIndex) => <Fragment key={row.orderNumber}><tr key={row.orderNumber}><td><div className="official-info-cell"><div className="official-info-primary official-info-link">{text("\n                                                    ")}{rimoText(row.orderNumber)}{text("\n                                                ")}</div>
<div className="official-meta-value official-mono">{rimoText(row.orderTime)}</div></div></td>
<td><div className="official-info-cell"><div className="official-info-primary">{rimoText(row.userName)}</div>
<div className="official-meta-value">{rimoText(row.phone)}</div></div></td>
<td><div className="official-info-cell"><div className="official-info-primary">{rimoText(row.carModel)}</div>
<div className="official-mono">{rimoText(row.numberPlate)}</div></div></td>
<td><div className="official-info-cell"><div className="official-meta-value official-mono">{rimoText(row.pickupTime)}</div>
<div className="official-meta-value official-mono">{rimoText(row.returnTime)}</div></div></td>
<td><div className="official-info-cell"><div className="official-meta-value official-mono">{rimoText(row.actualPickupTime)}</div>
<div className="official-meta-value official-mono">{rimoText(row.actualReturnTime)}</div></div></td>
<td><div className="official-info-cell"><div className="official-meta-value">{rimoText(row.pickupSite)}</div>
<div className="official-meta-value">{rimoText(row.returnStation)}</div></div></td>
<td className="is-center"><span className={rimoClass(["tag", rimoClass(row.statusType)])}>{rimoText(row.status)}</span></td>
<td><span className="official-meta-value">{rimoText(row.customer)}</span></td>
<td className="is-center"><div className="official-table-actions"><RimoElement kind="el-button" type="primary" link={true} size="small">{text("詳情")}</RimoElement>
{row.canEdit ? <><RimoElement kind="el-button" type="primary" plain={true} size="small">{text("編輯")}</RimoElement></> : null}</div></td></tr></Fragment>)}</tbody></RimoTable></div>
<div className="official-table-bottom"><div className="official-table-bottom-text">{text("共 18 條，每頁 10 條")}</div>
<RimoElement kind="el-pagination" layout="prev, pager, next" pageSize={10} total={18} currentPage={1}></RimoElement></div></div></div></div></div></RimoRoot>;
}