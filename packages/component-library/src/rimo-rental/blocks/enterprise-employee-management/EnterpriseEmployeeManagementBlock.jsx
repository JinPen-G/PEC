import { useRimoModel } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-employee-management.css';
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
    const Search = rimoIcons.Search;
    const currentUserRole = ref('HEADQUARTERS');
    const tableRef = ref(null);
    const multipleSelection = ref([]);
    const searchForm = reactive({
      keyword: '',
      employedStatus: '',
      status: ''
    });
    const organizationTreeData = [{
      id: 'all',
      label: '全部組織',
      level: 'company',
      children: [{
        id: 'baolong',
        label: '寶龍分公司',
        level: 'company',
        children: [{
          id: 'baolong-sales',
          label: '業務部',
          level: 'department'
        }, {
          id: 'baolong-admin',
          label: '行政部',
          level: 'department'
        }, {
          id: 'baolong-station',
          label: '八輪測試-寶龍用車點',
          level: 'station'
        }]
      }, {
        id: 'qidi',
        label: '啓迪分公司',
        level: 'company',
        children: [{
          id: 'qidi-admin',
          label: '行政部',
          level: 'department'
        }, {
          id: 'qidi-station',
          label: '八輪測試-啓迪用車點',
          level: 'station'
        }]
      }]
    }];
    const tableData = ref([{
      name: '王怡君',
      account: 'yijun.wang',
      idNumber: 'A123456789',
      email: 'yijun.wang@rimo.demo',
      phone: '0912-345-678',
      companyName: '寶龍分公司',
      departmentName: '業務部',
      rank: '主管',
      joinTime: '2024-03-15',
      rentalsNumber: 12,
      rentalAmount: 'NT$ 36,000',
      employedStatus: '在職',
      status: '啓用'
    }, {
      name: '陳建宏',
      account: 'jason.chen',
      idNumber: 'B223456789',
      email: 'jason.chen@rimo.demo',
      phone: '0988-120-776',
      companyName: '啓迪分公司',
      departmentName: '行政部',
      rank: '一般員工',
      joinTime: '2024-06-01',
      rentalsNumber: 8,
      rentalAmount: 'NT$ 18,200',
      employedStatus: '在職',
      status: '啓用'
    }, {
      name: '林雅婷',
      account: 'yating.lin',
      idNumber: 'C323456789',
      email: 'yating.lin@rimo.demo',
      phone: '0922-886-301',
      companyName: '寶龍分公司',
      departmentName: '財務部',
      rank: '一般員工',
      joinTime: '2025-01-10',
      rentalsNumber: 4,
      rentalAmount: 'NT$ 9,600',
      employedStatus: '在職',
      status: '停用'
    }, {
      name: '黃柏翰',
      account: 'bohan.huang',
      idNumber: 'D423456789',
      email: 'bohan.huang@rimo.demo',
      phone: '0900-668-321',
      companyName: '人工智能分公司',
      departmentName: '研發部',
      rank: '主管',
      joinTime: '2025-09-20',
      rentalsNumber: 2,
      rentalAmount: 'NT$ 5,200',
      employedStatus: '離職',
      status: '停用'
    }]);
    const rentalsNumber = 26;
    const rentalAmount = 'NT$ 69,000';
    const refreshHandel = () => {
      searchForm.keyword = '';
      searchForm.employedStatus = '';
      searchForm.status = '';
      syncTableLayout();
    };
    const handleSelectionChange = rows => {
      multipleSelection.value = rows;
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
      Refresh,
      Search,
      currentUserRole,
      tableRef,
      multipleSelection,
      searchForm,
      organizationTreeData,
      tableData,
      rentalsNumber,
      rentalAmount,
      refreshHandel,
      handleSelectionChange,
      getNameInitial,
      syncTableLayout
    };
  }
  return pageSetup();
}
export default function EnterpriseEmployeeManagementBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-employee-management" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="employee-page"><div className="employee-page__header mb-6"><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("員工管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理員工資料、所屬組織、賬號狀態與用車記錄。")}</p></div>
<div className="employee-layout"><div className="employee-org-panel custom-scroll"><div className="mb-3 flex items-center justify-between"><div><div className="text-sm font-bold text-gray-800">{text("組織架構")}</div>
<div className="mt-1 text-xs text-gray-400">{text("分公司 / 部門 / 據點")}</div></div>
<RimoElement kind="el-button" circle={true} plain={true} size="small"><RimoElement kind="el-icon"><RimoIcon name="Refresh" /></RimoElement></RimoElement></div>
<div className="rounded-xl border border-gray-100 bg-gray-50/70 p-2"><RimoElement kind="el-tree" data={view.organizationTreeData} className="employee-org-tree" nodeKey="id" defaultExpandAll={true} highlightCurrent={true} currentNodeKey={'all'} slots={{
                "default": ({
                  data
                }) => <><div className="flex items-center w-full py-1"><span className="employee-tree-icon mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md">{data.level === 'company' ? <><RimoElement kind="el-icon"><RimoIcon name="House" /></RimoElement></> : data.level === 'department' ? <><RimoElement kind="el-icon"><RimoIcon name="Connection" /></RimoElement></> : <><RimoElement kind="el-icon"><RimoIcon name="Location" /></RimoElement></>}</span>
<span className="truncate text-[13px]">{rimoText(data.label)}</span></div></>
              }}></RimoElement></div></div>
<div className="employee-table-panel" data-rimo-layout="list"><RimoElement kind="el-table" modelRef={model.ref("tableRef")} data={view.tableData} stripe={true} className="employee-table flex-1" style={rimoStyle("width: 100%")} scrollbarAlwaysOn={true} headerCellStyle={{
              backgroundColor: '#f9fafb',
              color: '#374151',
              fontWeight: 'bold'
            }} onSelectionChange={event => {
              view.handleSelectionChange?.(event);
            }} slots={{
              "toolbar": _slot => <><div className="employee-toolbar__filters"><RimoElement kind="el-input" modelValue={view.searchForm.keyword} onModelChange={value => {
                    model.write(["searchForm", "keyword"], value);
                  }} prefixIcon={view.Search} placeholder="姓名/手機號/Email/身份證字號" clearable={true} style={rimoStyle("width: 240px")}></RimoElement>
<RimoElement kind="el-select" modelValue={view.searchForm.employedStatus} onModelChange={value => {
                    model.write(["searchForm", "employedStatus"], value);
                  }} clearable={true} placeholder="在職狀態" style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="在職" value="employed"></RimoElement>
<RimoElement kind="el-option" label="離職" value="left"></RimoElement></RimoElement>
<RimoElement kind="el-select" modelValue={view.searchForm.status} onModelChange={value => {
                    model.write(["searchForm", "status"], value);
                  }} clearable={true} placeholder="狀態" style={rimoStyle("width: 140px")}><RimoElement kind="el-option" label="啓用" value="enabled"></RimoElement>
<RimoElement kind="el-option" label="停用" value="disabled"></RimoElement></RimoElement>
<RimoElement kind="el-tooltip" content="重置" placement="top"><RimoElement kind="el-button" circle={true} plain={true} icon={view.Refresh} onClick={event => {
                      view.refreshHandel?.(event);
                    }}></RimoElement></RimoElement>
<RimoElement kind="el-dropdown" trigger="click" slots={{
                    "dropdown": _slot => <><RimoElement kind="el-dropdown-menu"><RimoElement kind="el-dropdown-item">{text("批量刪除")}</RimoElement>
<RimoElement kind="el-dropdown-item">{text("批量離職")}</RimoElement></RimoElement></>
                  }}><RimoElement kind="el-button" type="warning" plain={true}>{text("\n                                            批量設置\n                                            ")}
<RimoElement kind="el-icon" className="ml-1"><RimoIcon name="ArrowDown" /></RimoElement></RimoElement></RimoElement>
{view.multipleSelection.length ? <><span className="text-sm text-gray-500">{text("\n                                        已選擇\n                                        ")}
<span className="font-semibold text-[color:var(--app-color-primary)]">{rimoText(view.multipleSelection.length)}</span></span></> : null}</div>
<div className="search-result-summary"><span>{text("租用次數：")}{rimoText(view.rentalsNumber)}</span>
<span className="ml-4">{text("租用金額：")}{rimoText(view.rentalAmount)}</span></div></>
            }}><RimoElement kind="el-table-column" type="selection" width="52" align="center"></RimoElement>
<RimoElement kind="el-table-column" label="員工資料" minWidth="220" fixed="left" slots={{
                "default": ({
                  row
                }) => <><div className="flex items-center min-w-0"><span className="employee-avatar">{rimoText(view.getNameInitial(row.name))}</span>
<div className="min-w-0"><div className="flex items-center gap-2"><span className="truncate font-semibold text-gray-900" title={row.name}>{rimoText(row.name)}</span>
<RimoElement kind="el-tag" size="small" type="info" effect="plain">{rimoText(row.rank)}</RimoElement></div>
<div className="mt-1 truncate text-xs text-gray-400" title={row.idNumber}>{rimoText(row.idNumber)}</div></div></div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="聯繫方式" minWidth="180" slots={{
                "default": ({
                  row
                }) => <><div className="space-y-1 text-sm"><div className="truncate text-gray-700" title={row.phone}>{rimoText(row.phone)}</div>
<div className="truncate text-gray-500" title={row.email}>{rimoText(row.email)}</div></div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="組織歸屬" minWidth="130" slots={{
                "default": ({
                  row
                }) => <><div className="space-y-1 text-sm"><div className="font-medium text-gray-800">{rimoText(row.companyName)}</div>
<div className="text-gray-500">{rimoText(row.departmentName)}</div></div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="用車統計" minWidth="110" align="right" slots={{
                "default": ({
                  row
                }) => <><div className="space-y-1"><div className="font-semibold text-gray-800">{rimoText(row.rentalsNumber)}{text(" 次")}</div>
<div className="text-sm text-gray-500">{rimoText(row.rentalAmount)}</div></div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="狀態" minWidth="100" align="center" slots={{
                "default": ({
                  row
                }) => <><div className="flex flex-col items-center gap-1"><RimoElement kind="el-tag" size="small" type={row.employedStatus === '在職' ? 'success' : 'info'} effect="plain">{rimoText(row.employedStatus)}</RimoElement>
<RimoElement kind="el-tag" size="small" type={row.status === '啓用' ? 'success' : 'danger'} effect="plain">{text("賬號")}{rimoText(row.status)}</RimoElement></div></>
              }}></RimoElement>
<RimoElement kind="el-table-column" width="110" align="center" label="加入時間" slots={{
                "default": ({
                  row
                }) => <><span className="text-gray-600 text-sm">{rimoText(row.joinTime)}</span></>
              }}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="190" align="right" fixed="right" slots={{
                "default": _slot => <><div className="flex items-center justify-end gap-2"><RimoElement kind="el-button" type="primary" link={true} size="small">{text("訂單記錄")}</RimoElement>
<RimoElement kind="el-button" type="primary" link={true} size="small">{text("編輯")}</RimoElement>
<RimoElement kind="el-button" type="primary" link={true} size="small">{text("設置狀態")}</RimoElement></div></>
              }}></RimoElement></RimoElement></div></div></div></div></RimoRoot>;
}