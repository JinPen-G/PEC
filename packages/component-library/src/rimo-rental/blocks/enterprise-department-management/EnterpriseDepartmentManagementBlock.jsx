import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-department-management.css';
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
      cell: ref,
      nextTick: nextTick,
      onMount: onMounted,
      onDispose: onBeforeUnmount
    } = model;
    const Refresh = rimoIcons.Refresh;
    const currentUserRole = ref('HEADQUARTERS');
    const tableRef = ref(null);
    const createDialogVisible = ref(false);
    const searchForm = reactive({
      departmentName: ''
    });
    const createForm = reactive({
      companyName: '',
      departmentName: ''
    });
    const tableData = ref([{
      companyName: '寶龍分公司',
      departmentName: '行政部',
      userCount: 18,
      vehicles: 2,
      status: '啓用'
    }, {
      companyName: '寶龍分公司',
      departmentName: '業務部',
      userCount: 24,
      vehicles: 3,
      status: '啓用'
    }, {
      companyName: '啓迪分公司',
      departmentName: '運營部',
      userCount: 9,
      vehicles: 1,
      status: '停用'
    }]);
    const companyOptions = ref(['寶龍分公司', '啓迪分公司', '人工智能分公司']);
    const refreshHandel = () => {
      searchForm.departmentName = '';
      syncTableLayout();
    };
    const syncTableLayout = () => {
      nextTick(() => {
        tableRef.value?.doLayout?.();
        window.setTimeout(() => tableRef.value?.doLayout?.(), 80);
      });
    };
    const resetCreateForm = () => {
      createForm.companyName = '';
      createForm.departmentName = '';
    };
    const openCreateDialog = () => {
      resetCreateForm();
      createDialogVisible.value = true;
    };
    const submitCreateDialog = () => {
      const missing = [];
      if (!createForm.companyName) missing.push('分公司');
      if (!String(createForm.departmentName || '').trim()) missing.push('部門名稱');
      if (missing.length) {
        feedback.ElMessage.warning(`請先完成：${missing.join('、')}`);
        return;
      }
      createDialogVisible.value = false;
      feedback.ElMessage.success('部門已保存');
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
      refreshHandel,
      createDialogVisible,
      createForm,
      companyOptions,
      openCreateDialog,
      submitCreateDialog,
      syncTableLayout,
      resetCreateForm
    };
  }
  return pageSetup();
}
export default function EnterpriseDepartmentManagementBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-department-management" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="department-page"><div className="department-page__header mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("部門管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理分公司下的部門資料、成員規模、可用車數與啓停狀態。")}</p></div>
<RimoElement kind="el-button" type="primary" size="large" className="department-page__add-button" onClick={event => {
            view.openCreateDialog?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text("\n                            新建部門\n                        ")}</RimoElement></div>
<div className="department-page__content-card" data-rimo-layout="list"><RimoElement kind="el-table" modelRef={model.ref("tableRef")} data={view.tableData} stripe={true} className="department-table flex-1" style={rimoStyle("width: 100%")} scrollbarAlwaysOn={true} headerCellStyle={{
            backgroundColor: '#f9fafb',
            color: '#374151',
            fontWeight: 'bold'
          }} slots={{
            "toolbar": _slot => <><div className="department-page__filters"><RimoElement kind="el-input" modelValue={view.searchForm.departmentName} onModelChange={value => {
                  model.write(["searchForm", "departmentName"], value);
                }} placeholder="部門名稱" clearable={true} style={rimoStyle("width: 280px")}></RimoElement>
<RimoElement kind="el-tooltip" content="重置" placement="top"><RimoElement kind="el-button" circle={true} icon={view.Refresh} onClick={event => {
                    view.refreshHandel?.(event);
                  }}></RimoElement></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text("\n                                    導出數據\n                                ")}</RimoElement>
<RimoElement kind="el-button" type="warning" plain={true}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Operation" /></RimoElement>
{text("\n                                    設置狀態\n                                ")}</RimoElement></div></>
          }}><RimoElement kind="el-table-column" type="selection" align="center" width="55"></RimoElement>
<RimoElement kind="el-table-column" minWidth="180" prop="companyName" align="center" label="分公司"></RimoElement>
<RimoElement kind="el-table-column" minWidth="180" prop="departmentName" align="center" label="部門名稱"></RimoElement>
<RimoElement kind="el-table-column" minWidth="120" prop="userCount" align="right" label="成員數量" slots={{
              "default": ({
                row
              }) => <><span className="font-medium text-gray-700">{rimoText(row.userCount)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" minWidth="120" prop="vehicles" align="right" label="可用車數" slots={{
              "default": ({
                row
              }) => <><span className="font-medium text-gray-700">{rimoText(row.vehicles)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" minWidth="120" prop="status" align="center" label="狀態" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tag" size="small" round={true} type={row.status === '啓用' ? 'success' : 'danger'} effect="light">{rimoText(row.status)}</RimoElement></>
            }}></RimoElement>
<RimoElement kind="el-table-column" width="190" align="center" label="操作" slots={{
              "default": _slot => <><div className="flex items-center justify-center gap-3"><RimoElement kind="el-button" link={true} type="primary">{text("編輯")}</RimoElement>
<RimoElement kind="el-dropdown" trigger="click" slots={{
                    "dropdown": _slot => <><RimoElement kind="el-dropdown-menu"><RimoElement kind="el-dropdown-item">{text("設置狀態")}</RimoElement>
<RimoElement kind="el-dropdown-item" divided={true}><span className="text-red-500">{text("刪除")}</span></RimoElement></RimoElement></>
                  }}><RimoElement kind="el-button" link={true} type="info">{text("\n                                                更多")}
<RimoElement kind="el-icon" className="el-icon--right"><RimoIcon name="ArrowDown" /></RimoElement></RimoElement></RimoElement></div></>
            }}></RimoElement></RimoElement></div></div></div><RimoElement kind="el-dialog" modelValue={view.createDialogVisible} onModelChange={value => {
      model.write(["createDialogVisible"], value);
    }} title="新建部門" width="640px" destroyOnClose={true} className="department-management-overlay" slots={{
      "footer": _slot => <><div className="department-dialog__footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["createDialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.submitCreateDialog?.(event);
          }}>{text("保存")}</RimoElement></div></>
    }}>{() => <><div className="department-dialog__hint">{text("建立分公司下的新部門資料。")}</div>
<RimoElement kind="el-form" labelPosition="top" model={view.createForm}><div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="分公司" required={true}><RimoElement kind="el-select" modelValue={view.createForm.companyName} onModelChange={value => {
                model.write(["createForm", "companyName"], value);
              }} placeholder="請選擇" className="w-full">{rimoEntries(view.companyOptions).map(([company], _itemIndex) => <Fragment key={company}><RimoElement kind="el-option" key={company} label={company} value={company}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<div></div>
<RimoElement kind="el-form-item" label="部門名稱" required={true} className="col-span-2"><RimoElement kind="el-input" modelValue={view.createForm.departmentName} onModelChange={value => {
                model.write(["createForm", "departmentName"], value);
              }} placeholder="請輸入"></RimoElement></RimoElement></div></RimoElement></>}</RimoElement></RimoRoot>;
}