import { useRimoModel } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-employee-review.css';
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
    const Search = rimoIcons.Search;
    const RefreshRight = rimoIcons.RefreshRight;
    const currentUserRole = ref('HEADQUARTERS');
    const tableRef = ref(null);
    const searchForm = reactive({
      keyword: ''
    });
    const tableData = ref([{
      name: '張志明',
      idNumber: 'D456789012',
      email: 'ming.zhang@rimo.demo',
      phone: '0935-768-220',
      companyName: '寶龍分公司',
      departmentName: '業務部',
      rank: '一般員工',
      applyTime: '2026-06-20 14:30'
    }, {
      name: '黃柏翰',
      idNumber: 'E567890123',
      email: 'bohan.huang@rimo.demo',
      phone: '0900-668-321',
      companyName: '啓迪分公司',
      departmentName: '行政部',
      rank: '主管',
      applyTime: '2026-06-21 09:15'
    }, {
      name: '劉佳玲',
      idNumber: 'F667890123',
      email: 'jialing.liu@rimo.demo',
      phone: '0921-002-118',
      companyName: '人工智能分公司',
      departmentName: '研發部',
      rank: '一般員工',
      applyTime: '2026-06-21 16:45'
    }]);
    const refreshHandel = () => {
      searchForm.keyword = '';
      syncTableLayout();
    };
    const getNameInitial = name => name ? name.slice(0, 1) : '';
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
      Search,
      RefreshRight,
      currentUserRole,
      tableRef,
      searchForm,
      tableData,
      refreshHandel,
      getNameInitial,
      syncTableLayout
    };
  }
  return pageSetup();
}
export default function EnterpriseEmployeeReviewBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-employee-review" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="review-page"><div className="review-page__header mb-6"><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("員工申請審覈")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("審覈員工申請加入企業後的組織歸屬與職級資料。")}</p></div>
<div className="review-page__panel" data-rimo-layout="list"><RimoElement kind="el-table" modelRef={model.ref("tableRef")} data={view.tableData} stripe={true} style={rimoStyle("width: 100%")} className="review-table flex-1" scrollbarAlwaysOn={true} headerCellStyle={{
            backgroundColor: '#f9fafb',
            color: '#374151',
            fontWeight: 'bold'
          }} slots={{
            "toolbar": _slot => <><div className="review-page__filters"><RimoElement kind="el-input" modelValue={view.searchForm.keyword} onModelChange={value => {
                  model.write(["searchForm", "keyword"], value);
                }} prefixIcon={view.Search} clearable={true} placeholder="姓名/手機號/Email/身份證字號" style={rimoStyle("width: 240px")}></RimoElement>
<RimoElement kind="el-tooltip" content="重置" placement="top"><RimoElement kind="el-button" circle={true} plain={true} icon={view.RefreshRight} onClick={event => {
                    view.refreshHandel?.(event);
                  }}></RimoElement></RimoElement></div>
<div className="review-page__actions"><RimoElement kind="el-dropdown" trigger="click" slots={{
                  "dropdown": _slot => <><RimoElement kind="el-dropdown-menu"><RimoElement kind="el-dropdown-item">{text("批量通過")}</RimoElement>
<RimoElement kind="el-dropdown-item">{text("批量不通過")}</RimoElement></RimoElement></>
                }}><RimoElement kind="el-button" type="warning" plain={true}>{text("\n                                        批量設置\n                                        ")}
<RimoElement kind="el-icon" className="ml-1"><RimoIcon name="ArrowDown" /></RimoElement></RimoElement></RimoElement></div></>
          }}><RimoElement kind="el-table-column" type="selection" align="center" width="55"></RimoElement>
<RimoElement kind="el-table-column" minWidth="180" prop="name" label="姓名" slots={{
              "default": ({
                row
              }) => <><div className="flex items-center min-w-0"><span className="review-avatar">{rimoText(view.getNameInitial(row.name))}</span>
<span className="min-w-0 truncate font-medium text-gray-900" title={row.name}>{rimoText(row.name)}</span></div></>
            }}></RimoElement>
<RimoElement kind="el-table-column" minWidth="160" align="center" prop="idNumber" label="身份證字號"></RimoElement>
<RimoElement kind="el-table-column" minWidth="180" align="center" prop="email" label="Email"></RimoElement>
<RimoElement kind="el-table-column" minWidth="150" align="center" prop="phone" label="聯繫電話"></RimoElement>
<RimoElement kind="el-table-column" minWidth="180" align="center" prop="companyName" label="分公司"></RimoElement>
<RimoElement kind="el-table-column" minWidth="160" align="center" prop="departmentName" label="部門"></RimoElement>
<RimoElement kind="el-table-column" minWidth="120" align="center" prop="rank" label="職級" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tag" size="small" type="info" effect="plain">{rimoText(row.rank)}</RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" width="170" align="center" label="申請時間" slots={{
              "default": ({
                row
              }) => <><span className="text-gray-600 text-sm">{rimoText(row.applyTime)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="190" align="center" fixed="right" slots={{
              "default": _slot => <><div className="flex items-center justify-center gap-3"><RimoElement kind="el-button" link={true} type="primary">{text("審覈通過")}</RimoElement>
<RimoElement kind="el-button" link={true} type="danger">{text("審覈不通過")}</RimoElement></div></>
            }}></RimoElement></RimoElement></div></div></div></RimoRoot>;
}