import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-official-car-bill.css';
function createPageState(model) {
  const _document = model.document;
  const window = model.window;
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
      record: reactive,
      cell: ref,
      nextTick: nextTick,
      onMount: onMounted,
      onDispose: onBeforeUnmount
    } = model;
    const Refresh = rimoIcons.Refresh;
    const currentUserRole = ref('HEADQUARTERS');
    const tableRef = ref(null);
    const searchForm = reactive({
      billRange: ''
    });
    const tableData = ref([{
      billDate: '2026/06/01',
      contractNo: 'CT-2026-0601',
      type: '續費',
      contractCars: 8,
      period: '2026/06/01 - 2026/06/30',
      total: '128,000',
      status: '待確認',
      paidCars: 0,
      paidAmount: '0',
      actions: ['確認']
    }, {
      billDate: '2026/05/01',
      contractNo: 'CT-2026-0501',
      type: '新增',
      contractCars: 6,
      period: '2026/05/01 - 2026/05/31',
      total: '96,000',
      status: '待匯款',
      paidCars: 0,
      paidAmount: '0',
      actions: ['詳情', '匯款']
    }, {
      billDate: '2026/04/01',
      contractNo: 'CT-2026-0401',
      type: '續費',
      contractCars: 6,
      period: '2026/04/01 - 2026/04/30',
      total: '96,000',
      status: '已繳費',
      paidCars: 6,
      paidAmount: '96,000',
      actions: ['詳情', '匯款明細']
    }, {
      billDate: '2026/03/01',
      contractNo: 'CT-2026-0301',
      type: '續費',
      contractCars: 5,
      period: '2026/03/01 - 2026/03/31',
      total: '80,000',
      status: '已過期',
      paidCars: 5,
      paidAmount: '80,000',
      actions: ['詳情']
    }]);
    const statusPalette = status => {
      const map = {
        待確認: {
          text: '#2563eb',
          background: '#dbeafe'
        },
        待匯款: {
          text: '#d97706',
          background: '#fef3c7'
        },
        已繳費: {
          text: '#059669',
          background: '#d1fae5'
        },
        已過期: {
          text: '#dc2626',
          background: '#fee2e2'
        }
      };
      return map[status] || {
        text: '#6b7280',
        background: '#f3f4f6'
      };
    };
    const refreshHandel = () => {
      searchForm.billRange = '';
      syncTableLayout();
    };
    const syncTableLayout = () => {
      nextTick(() => {
        tableRef.value?.doLayout?.();
        window.setTimeout(() => tableRef.value?.doLayout?.(), 80);
      });
    };
    onMounted(() => {
      syncTableLayout();
      window.addEventListener('resize', syncTableLayout);
    });
    onBeforeUnmount(() => window.removeEventListener('resize', syncTableLayout));
    return {
      Refresh,
      currentUserRole,
      tableRef,
      searchForm,
      tableData,
      statusPalette,
      refreshHandel,
      syncTableLayout
    };
  }
  return pageSetup();
}
export default function EnterpriseOfficialCarBillBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-official-car-bill" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="company-bill-page"><div className="company-bill-page__header mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("公務車賬單")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("查看各賬期賬單狀態、付款進度與匯款明細。")}</p></div></div>
<div className="company-bill-page__content-card" data-rimo-layout="list"><RimoElement kind="el-table" modelRef={model.ref("tableRef")} data={view.tableData} stripe={true} className="company-bill-table flex-1" style={rimoStyle("width: 100%")} scrollbarAlwaysOn={true} headerCellStyle={{
            backgroundColor: '#f9fafb',
            color: '#374151',
            fontWeight: 'bold'
          }} slots={{
            "toolbar": _slot => <><div className="company-bill-page__filters"><div className="company-bill-page__date-picker"><RimoElement kind="el-date-picker" modelValue={view.searchForm.billRange} onModelChange={value => {
                    model.write(["searchForm", "billRange"], value);
                  }} type="daterange" rangeSeparator="-" startPlaceholder="賬單期起" endPlaceholder="賬單期止" style={rimoStyle("width: 100%")}></RimoElement></div>
<RimoElement kind="el-tooltip" content="重置" placement="top"><RimoElement kind="el-button" circle={true} icon={view.Refresh} onClick={event => {
                    view.refreshHandel?.(event);
                  }}></RimoElement></RimoElement>
<RimoElement kind="el-button" plain={true} className="company-bill-page__history-button"><RimoElement kind="el-icon"><RimoIcon name="Clock" /></RimoElement>
<span>{text("歷史賬單")}</span></RimoElement></div>
<div className="company-bill-page__summary">{text("總數量 ")}{rimoText(view.tableData.length)}</div></>
          }}><RimoElement kind="el-table-column" prop="billDate" label="賬單日期" minWidth="120" align="center"></RimoElement>
<RimoElement kind="el-table-column" prop="contractNo" label="合約號" minWidth="150" align="center"></RimoElement>
<RimoElement kind="el-table-column" prop="type" label="類型" minWidth="100" align="center" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tag" size="small" effect="plain" type="info">{rimoText(row.type)}</RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="contractCars" label="合約車數" minWidth="110" align="right" slots={{
              "default": ({
                row
              }) => <><span className="font-medium text-gray-700">{rimoText(row.contractCars)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="period" label="有效期" minWidth="210" align="center"></RimoElement>
<RimoElement kind="el-table-column" prop="total" label="賬單合計NT$" minWidth="140" align="right" slots={{
              "default": ({
                row
              }) => <><span className="font-semibold text-gray-900">{rimoText(row.total)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="status" label="狀態" minWidth="120" align="center" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tag" round={true} size="small" effect="light" className="company-bill-page__status-tag" style={rimoStyle({
                  color: view.statusPalette(row.status).text,
                  backgroundColor: view.statusPalette(row.status).background,
                  borderColor: view.statusPalette(row.status).background
                })}>{text("\n                                        ")}{rimoText(row.status)}{text("\n                                    ")}</RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="paidCars" label="繳費車數" minWidth="110" align="right" slots={{
              "default": ({
                row
              }) => <><span className="font-medium text-gray-700">{rimoText(row.paidCars)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" prop="paidAmount" label="繳費金額" minWidth="130" align="right" slots={{
              "default": ({
                row
              }) => <><span className="font-medium text-gray-700">{rimoText(row.paidAmount)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="220" align="center" slots={{
              "default": ({
                row
              }) => <><div className="company-bill-page__action-group">{rimoEntries(row.actions).map(([action], _itemIndex) => <Fragment key={action}><RimoElement kind="el-button" key={action} link={true} type="primary">{text("\n                                            ")}{rimoText(action)}{text("\n                                        ")}</RimoElement></Fragment>)}</div></>
            }}></RimoElement></RimoElement></div></div></div></RimoRoot>;
}