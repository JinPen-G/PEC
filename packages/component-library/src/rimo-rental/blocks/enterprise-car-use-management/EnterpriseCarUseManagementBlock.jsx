import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-car-use-management.css';
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
      numberPlate: '',
      parameter: ''
    });
    const createForm = reactive({
      companyName: '',
      title: '',
      plates: [],
      targets: []
    });
    const tableData = ref([{
      companyName: '寶龍分公司',
      title: '主管專用車',
      plate: 'XLY-8008、XLY-8009',
      append: '王怡君、陳建宏、行政部'
    }, {
      companyName: '啓迪分公司',
      title: '運營值班車',
      plate: 'XLY-8004',
      append: '運營部'
    }, {
      companyName: '人工智能分公司',
      title: '外勤支援車',
      plate: 'XLY-8007、XLY-8010',
      append: '業務部、張志明'
    }]);
    const companyOptions = ref(['寶龍分公司', '啓迪分公司', '人工智能分公司']);
    const vehicleOptions = ref([{
      companyName: '寶龍分公司',
      label: 'XLY-8008',
      value: 'XLY-8008'
    }, {
      companyName: '寶龍分公司',
      label: 'XLY-8009',
      value: 'XLY-8009'
    }, {
      companyName: '啓迪分公司',
      label: 'XLY-8004',
      value: 'XLY-8004'
    }, {
      companyName: '人工智能分公司',
      label: 'XLY-8007',
      value: 'XLY-8007'
    }, {
      companyName: '人工智能分公司',
      label: 'XLY-8010',
      value: 'XLY-8010'
    }]);
    const targetOptions = ref([{
      companyName: '寶龍分公司',
      label: '部門',
      options: [{
        label: '行政部',
        value: 'dept:行政部'
      }, {
        label: '業務部',
        value: 'dept:業務部'
      }]
    }, {
      companyName: '寶龍分公司',
      label: '員工',
      options: [{
        label: '王怡君',
        value: 'user:王怡君'
      }, {
        label: '陳建宏',
        value: 'user:陳建宏'
      }]
    }, {
      companyName: '啓迪分公司',
      label: '部門',
      options: [{
        label: '運營部',
        value: 'dept:運營部'
      }]
    }, {
      companyName: '人工智能分公司',
      label: '部門',
      options: [{
        label: '業務部',
        value: 'dept:業務部@ai'
      }]
    }, {
      companyName: '人工智能分公司',
      label: '員工',
      options: [{
        label: '張志明',
        value: 'user:張志明'
      }]
    }]);
    const refreshHandel = () => {
      searchForm.numberPlate = '';
      searchForm.parameter = '';
      syncTableLayout();
    };
    const filteredVehicleOptions = model.derived(() => {
      if (!createForm.companyName) return [];
      return vehicleOptions.value.filter(item => item.companyName === createForm.companyName);
    });
    const filteredTargetOptions = model.derived(() => {
      if (!createForm.companyName) return [];
      return targetOptions.value.filter(item => item.companyName === createForm.companyName);
    });
    const syncTableLayout = () => {
      nextTick(() => {
        tableRef.value?.doLayout?.();
        window.setTimeout(() => tableRef.value?.doLayout?.(), 80);
      });
    };
    const resetCreateForm = () => {
      createForm.companyName = '';
      createForm.title = '';
      createForm.plates = [];
      createForm.targets = [];
    };
    const openCreateDialog = () => {
      resetCreateForm();
      createDialogVisible.value = true;
    };
    const handleCompanyChange = () => {
      createForm.plates = [];
      createForm.targets = [];
    };
    const submitCreateDialog = () => {
      const missing = [];
      if (!createForm.companyName) missing.push('分公司');
      if (!String(createForm.title || '').trim()) missing.push('標題');
      if (!createForm.plates.length) missing.push('車牌號');
      if (!createForm.targets.length) missing.push('限定使用人');
      if (missing.length) {
        feedback.ElMessage.warning(`請先完成：${missing.join('、')}`);
        return;
      }
      const resolveTargetLabel = value => {
        for (const group of targetOptions.value) {
          const matched = group.options.find(item => item.value === value);
          if (matched) return matched.label;
        }
        return value;
      };
      tableData.value.unshift({
        companyName: createForm.companyName,
        title: createForm.title.trim(),
        plate: createForm.plates.join('、'),
        append: createForm.targets.map(resolveTargetLabel).join('、')
      });
      createDialogVisible.value = false;
      feedback.ElMessage.success('用車設定已保存');
      syncTableLayout();
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
      filteredVehicleOptions,
      filteredTargetOptions,
      openCreateDialog,
      handleCompanyChange,
      submitCreateDialog,
      vehicleOptions,
      targetOptions,
      syncTableLayout,
      resetCreateForm
    };
  }
  return pageSetup();
}
export default function EnterpriseCarUseManagementBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-car-use-management" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="car-use-page"><div className="car-use-page__header mb-6" data-rimo-layout="heading"><div><h1 className="text-2xl font-bold text-gray-800 tracking-tight">{text("車輛使用範圍")}</h1>
<p className="text-gray-500 text-sm mt-1">{text("注意：添加到此列表的車輛將僅限使用人可見可用，其他車輛默認公用。")}</p></div>
<RimoElement kind="el-button" type="primary" size="large" className="car-use-page__add-button" onClick={event => {
            view.openCreateDialog?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="Plus" /></RimoElement>
{text("\n                            新增\n                        ")}</RimoElement></div>
<div className="car-use-page__content-card" data-rimo-layout="list"><RimoElement kind="el-table" modelRef={model.ref("tableRef")} data={view.tableData} stripe={true} style={rimoStyle("width: 100%")} className="car-use-table flex-1" scrollbarAlwaysOn={true} headerCellStyle={{
            backgroundColor: '#f9fafb',
            color: '#374151',
            fontWeight: 'bold'
          }} slots={{
            "toolbar": _slot => <><div className="car-use-page__filters"><RimoElement kind="el-input" modelValue={view.searchForm.numberPlate} onModelChange={value => {
                  model.write(["searchForm", "numberPlate"], value);
                }} placeholder="車牌號關鍵字輸入選擇" clearable={true} style={rimoStyle("width: 240px")}></RimoElement>
<RimoElement kind="el-input" modelValue={view.searchForm.parameter} onModelChange={value => {
                  model.write(["searchForm", "parameter"], value);
                }} placeholder="部門/員工" clearable={true} style={rimoStyle("width: 240px")}></RimoElement>
<RimoElement kind="el-tooltip" content="重置" placement="top"><RimoElement kind="el-button" circle={true} icon={view.Refresh} onClick={event => {
                    view.refreshHandel?.(event);
                  }}></RimoElement></RimoElement></div></>
          }}><RimoElement kind="el-table-column" type="index" label="序號" align="center" width="70"></RimoElement>
<RimoElement kind="el-table-column" minWidth="180" prop="companyName" align="center" label="分公司"></RimoElement>
<RimoElement kind="el-table-column" minWidth="180" prop="title" label="標題"></RimoElement>
<RimoElement kind="el-table-column" label="車牌號" minWidth="220" showOverflowTooltip={true} slots={{
              "default": ({
                row
              }) => <><span className="font-medium text-gray-900">{rimoText(row.plate)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" label="限定使用人" minWidth="240" showOverflowTooltip={true} slots={{
              "default": ({
                row
              }) => <><span className="text-gray-700">{rimoText(row.append)}</span></>
            }}></RimoElement>
<RimoElement kind="el-table-column" align="center" label="操作" width="170" slots={{
              "default": _slot => <><div className="flex items-center justify-center gap-3"><RimoElement kind="el-button" link={true} type="primary">{text("編輯")}</RimoElement>
<RimoElement kind="el-dropdown" trigger="click" slots={{
                    "dropdown": _slot => <><RimoElement kind="el-dropdown-menu"><RimoElement kind="el-dropdown-item" divided={true}><span className="text-red-500">{text("刪除")}</span></RimoElement></RimoElement></>
                  }}><RimoElement kind="el-button" link={true} type="info">{text("\n                                                更多")}
<RimoElement kind="el-icon" className="el-icon--right"><RimoIcon name="ArrowDown" /></RimoElement></RimoElement></RimoElement></div></>
            }}></RimoElement></RimoElement></div></div></div><RimoElement kind="el-dialog" modelValue={view.createDialogVisible} onModelChange={value => {
      model.write(["createDialogVisible"], value);
    }} title="新增用車設定" width="720px" destroyOnClose={true} className="car-use-management-overlay" slots={{
      "footer": _slot => <><div className="car-use-dialog__footer"><RimoElement kind="el-button" onClick={_event => {
            model.write(["createDialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.submitCreateDialog?.(event);
          }}>{text("保存")}</RimoElement></div></>
    }}>{() => <><div className="car-use-dialog__hint">{text("建立限定用車設定後，指定車輛僅會對被設定的員工或部門開放使用。")}</div>
<RimoElement kind="el-form" labelPosition="top" model={view.createForm}><div className="grid grid-cols-2 gap-4" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-form-item" label="分公司" required={true}><RimoElement kind="el-select" modelValue={view.createForm.companyName} onModelChange={value => {
                model.write(["createForm", "companyName"], value);
              }} placeholder="請選擇" className="w-full" onChange={event => {
                view.handleCompanyChange?.(event);
              }}>{rimoEntries(view.companyOptions).map(([company], _itemIndex) => <Fragment key={company}><RimoElement kind="el-option" key={company} label={company} value={company}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="標題" required={true}><RimoElement kind="el-input" modelValue={view.createForm.title} onModelChange={value => {
                model.write(["createForm", "title"], value);
              }} placeholder="請輸入"></RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="車牌號" required={true} className="col-span-2"><RimoElement kind="el-select" modelValue={view.createForm.plates} onModelChange={value => {
                model.write(["createForm", "plates"], value);
              }} multiple={true} collapseTags={true} collapseTagsTooltip={true} filterable={true} placeholder="請選擇車牌號" className="w-full">{rimoEntries(view.filteredVehicleOptions).map(([plate], _itemIndex) => <Fragment key={plate.value}><RimoElement kind="el-option" key={plate.value} label={plate.label} value={plate.value}></RimoElement></Fragment>)}</RimoElement></RimoElement>
<RimoElement kind="el-form-item" label="限定使用人" required={true} className="col-span-2"><RimoElement kind="el-select" modelValue={view.createForm.targets} onModelChange={value => {
                model.write(["createForm", "targets"], value);
              }} multiple={true} collapseTags={true} collapseTagsTooltip={true} filterable={true} placeholder="請選擇員工或部門" className="w-full">{rimoEntries(view.filteredTargetOptions).map(([group], _itemIndex) => <Fragment key={group.label}><RimoElement kind="el-option-group" key={group.label} label={group.label}>{rimoEntries(group.options).map(([item], _itemIndex) => <Fragment key={item.value}><RimoElement kind="el-option" key={item.value} label={item.label} value={item.value}></RimoElement></Fragment>)}</RimoElement></Fragment>)}</RimoElement></RimoElement></div></RimoElement></>}</RimoElement></RimoRoot>;
}