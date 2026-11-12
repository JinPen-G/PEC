import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-branch-company-management.css';
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
      companyName: ''
    });
    const createForm = reactive({
      companyName: '',
      adminName: '',
      email: '',
      notifyAdmin: false,
      account: '',
      password: '',
      stationIds: []
    });
    const stationOptions = ref([{
      label: '八輪測試-寶龍用車點',
      value: 'baolong'
    }, {
      label: '八輪測試-啓迪用車點',
      value: 'qidi'
    }, {
      label: '八輪測試-人工智能用車點',
      value: 'ai'
    }, {
      label: '八輪測試-總部地下停車場',
      value: 'hq_b1'
    }]);
    const tableData = ref([{
      companyName: '寶龍分公司',
      departmentCount: 5,
      userCount: 42,
      parkingName: '八輪測試-寶龍用車點',
      sysUserName: '王怡君',
      account: 'baolong_admin',
      state: '啓用'
    }, {
      companyName: '啓迪分公司',
      departmentCount: 3,
      userCount: 23,
      parkingName: '八輪測試-啓迪用車點',
      sysUserName: '陳建宏',
      account: 'qidi_admin',
      state: '啓用'
    }, {
      companyName: '人工智能分公司',
      departmentCount: 2,
      userCount: 11,
      parkingName: '八輪測試-人工智能用車點',
      sysUserName: '林雅婷',
      account: 'ai_admin',
      state: '停用'
    }]);
    const refreshHandel = () => {
      searchForm.companyName = '';
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
      createForm.adminName = '';
      createForm.email = '';
      createForm.notifyAdmin = false;
      createForm.account = '';
      createForm.password = '';
      createForm.stationIds = [];
    };
    const openCreateDialog = () => {
      resetCreateForm();
      createDialogVisible.value = true;
    };
    const submitCreateDialog = () => {
      const requiredFields = [['分公司名稱', createForm.companyName], ['管理員姓名', createForm.adminName], ['管理員賬號', createForm.account], ['管理員密碼', createForm.password]];
      const missing = requiredFields.filter(([, value]) => !String(value || '').trim()).map(([label]) => label);
      if (!createForm.stationIds.length) {
        missing.push('用車據點');
      }
      if (missing.length) {
        feedback.ElMessage.warning(`請先完成：${missing.join('、')}`);
        return;
      }
      createDialogVisible.value = false;
      feedback.ElMessage.success('分公司已保存');
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
      stationOptions,
      openCreateDialog,
      submitCreateDialog,
      syncTableLayout,
      resetCreateForm
    };
  }
  return pageSetup();
}
export default function EnterpriseBranchCompanyManagementBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-branch-company-management" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="branch-company-page"><div className="branch-company-page__header mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("分公司管理")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("管理各分公司資料、部門規模、管理員賬號與啓停狀態。")}</p></div>
<RimoElement kind="el-button" type="primary" size="large" className="branch-company-page__add-button" onClick={event => {
            view.openCreateDialog?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text("\n                            新建分公司\n                        ")}</RimoElement></div>
<div className="branch-company-page__content-card" data-rimo-layout="list"><RimoElement kind="el-table" modelRef={model.ref("tableRef")} data={view.tableData} stripe={true} className="branch-company-table flex-1" style={rimoStyle("width: 100%")} scrollbarAlwaysOn={true} headerCellStyle={{
            backgroundColor: '#f9fafb',
            color: '#374151',
            fontWeight: 'bold'
          }} slots={{
            "toolbar": _slot => <><div className="branch-company-page__filters"><RimoElement kind="el-input" modelValue={view.searchForm.companyName} onModelChange={value => {
                  model.write(["searchForm", "companyName"], value);
                }} placeholder="分公司名稱" clearable={true} style={rimoStyle("width: 280px")}></RimoElement>
<RimoElement kind="el-tooltip" content="重置" placement="top"><RimoElement kind="el-button" circle={true} icon={view.Refresh} onClick={event => {
                    view.refreshHandel?.(event);
                  }}></RimoElement></RimoElement>
<RimoElement kind="el-button" type="primary" plain={true}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Download" /></RimoElement>
{text("\n                                    導出數據\n                                ")}</RimoElement>
<RimoElement kind="el-button" type="warning" plain={true}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Operation" /></RimoElement>
{text("\n                                    設置狀態\n                                ")}</RimoElement></div></>
          }}><RimoElement kind="el-table-column" type="selection" align="center" width="55"></RimoElement>
<RimoElement kind="el-table-column" minWidth="180" prop="companyName" align="center" label="分公司"></RimoElement>
<RimoElement kind="el-table-column" minWidth="120" prop="departmentCount" align="right" label="部門數" slots={{
              "default": ({
                row
              }) => <><span className="font-medium text-gray-700">{rimoText(row.departmentCount)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" minWidth="120" prop="userCount" align="right" label="員工數" slots={{
              "default": ({
                row
              }) => <><span className="font-medium text-gray-700">{rimoText(row.userCount)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" minWidth="180" prop="parkingName" align="center" label="用車據點"></RimoElement>
<RimoElement kind="el-table-column" minWidth="140" prop="sysUserName" align="center" label="管理員姓名"></RimoElement>
<RimoElement kind="el-table-column" minWidth="140" prop="account" align="center" label="管理員賬號"></RimoElement>
<RimoElement kind="el-table-column" minWidth="120" prop="state" align="center" label="狀態" slots={{
              "default": ({
                row
              }) => <><RimoElement kind="el-tag" size="small" round={true} type={row.state === '啓用' ? 'success' : 'info'} effect="plain">{rimoText(row.state)}</RimoElement></>
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
    }} title="新建分公司" width="720px" destroyOnClose={true} className="branch-company-management-overlay" slots={{
      "footer": _slot => <><div className="branch-company-dialog__footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["createDialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.submitCreateDialog?.(event);
          }}>{text("保存")}</RimoElement></div></>
    }}>{() => <><div className="branch-company-dialog__hint">{text("建立分公司資料並同時建立該分公司的管理員賬號。")}</div>
<RimoElement kind="el-form" labelPosition="top" model={view.createForm}><div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="分公司名稱" required={true}><RimoElement kind="el-input" modelValue={view.createForm.companyName} onModelChange={value => {
                model.write(["createForm", "companyName"], value);
              }} placeholder="請輸入"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="管理員姓名" required={true}><RimoElement kind="el-input" modelValue={view.createForm.adminName} onModelChange={value => {
                model.write(["createForm", "adminName"], value);
              }} placeholder="請輸入"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="Email"><RimoElement kind="el-input" modelValue={view.createForm.email} onModelChange={value => {
                model.write(["createForm", "email"], value);
              }} placeholder="請輸入"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="通知管理員"><div className="h-10 flex items-center"><RimoElement kind="el-checkbox" modelValue={view.createForm.notifyAdmin} onModelChange={value => {
                  model.write(["createForm", "notifyAdmin"], value);
                }}></RimoElement></div></RimoElement>
<RimoElement kind="el-form-item" label="管理員賬號" required={true}><RimoElement kind="el-input" modelValue={view.createForm.account} onModelChange={value => {
                model.write(["createForm", "account"], value);
              }} placeholder="請輸入"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="管理員密碼" required={true}><RimoElement kind="el-input" modelValue={view.createForm.password} onModelChange={value => {
                model.write(["createForm", "password"], value);
              }} type="password" showPassword={true} placeholder="請輸入"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="用車據點" required={true} className="col-span-2"><RimoElement kind="el-select" modelValue={view.createForm.stationIds} onModelChange={value => {
                model.write(["createForm", "stationIds"], value);
              }} multiple={true} collapseTags={true} collapseTagsTooltip={true} filterable={true} placeholder="請選擇" className="w-full">{rimoEntries(view.stationOptions).map(([site], _itemIndex) => <Fragment key={site.value}><RimoElement kind="el-option" key={site.value} label={site.label} value={site.value}></RimoElement></Fragment>)}</RimoElement></RimoElement></div></RimoElement></>}</RimoElement></RimoRoot>;
}