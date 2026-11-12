import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoStyle, rimoText } from '../../lib/RimoElements.jsx';
import './enterprise-official-order-add.css';
function createPageState(model) {
  const _document = model.document;
  const _window = model.window;
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
    const {
      ElMessage: _ElMessage
    } = feedback;
    const addDays = (days, hour, minute = 0) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      date.setHours(hour, minute, 0, 0);
      return date;
    };
    const members = [{
      userId: 1,
      employeeNo: 'EMP-TPE-001',
      name: '王怡君',
      idNumber: 'A123456789',
      email: 'yijun.wang@rimo.demo',
      phone: '0912-345-678',
      branch: '臺北分公司',
      department: '業務部',
      supervisor: '陳經理'
    }, {
      userId: 2,
      employeeNo: 'EMP-TXG-014',
      name: '陳建宏',
      idNumber: 'B223456789',
      email: 'jason.chen@rimo.demo',
      phone: '0988-120-776',
      branch: '臺中分公司',
      department: '行政管理部',
      supervisor: '林處長'
    }, {
      userId: 3,
      employeeNo: 'EMP-KHH-023',
      name: '林雅婷',
      idNumber: 'C323456789',
      email: 'yating.lin@rimo.demo',
      phone: '0922-886-301',
      branch: '高雄分公司',
      department: '財務部',
      supervisor: '王主任'
    }];
    const siteOptions = [{
      label: '臺北總部－B2 公務車停車區',
      value: 'taipei_hq'
    }, {
      label: '新北汐止辦公區－一樓取車點',
      value: 'xizhi_office'
    }, {
      label: '桃園航空城廠區－行政大樓停車場',
      value: 'taoyuan_plant'
    }, {
      label: '臺中營運中心－地下停車場',
      value: 'taichung_center'
    }, {
      label: '高雄前鎮據點－訪客停車區',
      value: 'kaohsiung_qianzhen'
    }];
    const modelOptions = [{
      label: 'Toyota Corolla Cross',
      value: 'cross',
      vehicleTypeId: 'suv',
      vehicleTypeLabel: '休旅車',
      desc: '空間靈活，適合多人同行'
    }, {
      label: 'Lexus ES 250',
      value: 'es250',
      vehicleTypeId: 'sedan',
      vehicleTypeLabel: '商務轎車',
      desc: '商務接待與重要客戶拜訪'
    }, {
      label: 'Toyota Camry',
      value: 'camry',
      vehicleTypeId: 'sedan',
      vehicleTypeLabel: '中大型轎車',
      desc: '長途出差與跨廠區通勤'
    }];
    const vehicleOptions = [{
      label: 'RMO-3201',
      value: 'car-3201',
      modelId: 'cross',
      vehicleTypeId: 'suv',
      siteId: 'taipei_hq',
      status: '可預約'
    }, {
      label: 'RMO-3208',
      value: 'car-3208',
      modelId: 'es250',
      vehicleTypeId: 'sedan',
      siteId: 'taipei_hq',
      status: '可預約'
    }, {
      label: 'RMO-5216',
      value: 'car-5216',
      modelId: 'cross',
      vehicleTypeId: 'suv',
      siteId: 'xizhi_office',
      status: '可預約'
    }, {
      label: 'RMO-6612',
      value: 'car-6612',
      modelId: 'camry',
      vehicleTypeId: 'sedan',
      siteId: 'taoyuan_plant',
      status: '可預約'
    }, {
      label: 'RMO-7318',
      value: 'car-7318',
      modelId: 'cross',
      vehicleTypeId: 'suv',
      siteId: 'taichung_center',
      status: '可預約'
    }, {
      label: 'RMO-8026',
      value: 'car-8026',
      modelId: 'camry',
      vehicleTypeId: 'sedan',
      siteId: 'taichung_center',
      status: '預約中'
    }, {
      label: 'RMO-9125',
      value: 'car-9125',
      modelId: 'cross',
      vehicleTypeId: 'suv',
      siteId: 'kaohsiung_qianzhen',
      status: '可預約'
    }, {
      label: 'RMO-9150',
      value: 'car-9150',
      modelId: 'es250',
      vehicleTypeId: 'sedan',
      siteId: 'kaohsiung_qianzhen',
      status: '保養中'
    }];
    const memberVisible = ref(false);
    const memberKeyword = ref('');
    const memberSearchQuery = ref('');
    const employeeFilterBranch = ref('');
    const employeeFilterDepartment = ref('');
    const orderSuccessVisible = ref(false);
    const memberInfo = reactive({
      ...members[0]
    });
    const postForm = reactive({
      userId: members[0].userId,
      accountType: 1,
      pickupSiteId: 'taipei_hq',
      returnStationId: 'taipei_hq',
      carModelId: 'cross',
      vehicleId: 'car-3201',
      pickupTime: addDays(1, 9),
      returnTime: addDays(2, 18),
      vehicleTypeId: 'suv',
      carModel: 'Toyota Corolla Cross',
      passengerCount: 2,
      destination: '新北汐止辦公區',
      purpose: '跨據點專案會議與客戶拜訪'
    });
    const createdOrder = reactive({
      orderNo: '',
      statusText: '',
      approvalText: '',
      vehicle: '',
      leaseTerm: ''
    });
    const branchOptions = computed(() => [...new Set(members.map(item => item.branch))]);
    const departmentOptions = computed(() => {
      const scoped = employeeFilterBranch.value ? members.filter(item => item.branch === employeeFilterBranch.value) : members;
      return [...new Set(scoped.map(item => item.department))];
    });
    const filteredMembers = computed(() => {
      const keyword = memberKeyword.value.trim().toLowerCase();
      return members.filter(item => {
        if (employeeFilterBranch.value && item.branch !== employeeFilterBranch.value) return false;
        if (employeeFilterDepartment.value && item.department !== employeeFilterDepartment.value) return false;
        if (!keyword) return true;
        return [item.name, item.idNumber, item.email, item.phone, item.branch, item.department, item.employeeNo].some(value => String(value).toLowerCase().includes(keyword));
      });
    });
    const filterMember = query => {
      memberSearchQuery.value = (query || '').trim().toLowerCase();
    };
    const memberSelectOptions = computed(() => {
      const keyword = memberSearchQuery.value;
      if (!keyword) return members;
      return members.filter(item => [item.name, item.idNumber, item.phone, item.email, item.employeeNo].some(value => String(value || '').toLowerCase().includes(keyword)));
    });
    const filteredVehicleOptions = computed(() => vehicleOptions.filter(item => {
      if (postForm.pickupSiteId && item.siteId !== postForm.pickupSiteId) return false;
      if (postForm.carModelId && item.modelId !== postForm.carModelId) return false;
      return true;
    }));
    const selectedSiteLabel = computed(() => siteOptions.find(item => item.value === postForm.pickupSiteId)?.label || '');
    const selectedModelLabel = computed(() => modelOptions.find(item => item.value === postForm.carModelId)?.label || '');
    const selectedVehicleLabel = computed(() => vehicleOptions.find(item => item.value === postForm.vehicleId)?.label || '');
    const memberInitial = computed(() => memberInfo.name ? memberInfo.name.slice(0, 1) : '員');
    const formatDateTime = value => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const pad = num => String(num).padStart(2, '0');
      return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    const reservationTimeLabel = computed(() => {
      if (!postForm.pickupTime || !postForm.returnTime) return '未選擇';
      return `${formatDateTime(postForm.pickupTime)} 至 ${formatDateTime(postForm.returnTime)}`;
    });
    const leaseTermResult = computed(() => {
      if (!postForm.pickupTime || !postForm.returnTime) return '';
      const start = new Date(postForm.pickupTime);
      const end = new Date(postForm.returnTime);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return '';
      const minutes = Math.floor((end - start) / 60000);
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor(minutes % 1440 / 60);
      const mins = minutes % 60;
      const parts = [];
      if (days) parts.push(`${days}天`);
      if (hours) parts.push(`${hours}小時`);
      if (mins) parts.push(`${mins}分鐘`);
      return parts.join('') || '0分鐘';
    });
    const getModelAvailableCount = modelId => vehicleOptions.filter(item => {
      if (item.modelId !== modelId) return false;
      if (postForm.pickupSiteId && item.siteId !== postForm.pickupSiteId) return false;
      return item.status === '可預約';
    }).length;
    const requiredChecklist = computed(() => [{
      label: '用車員工',
      done: Boolean(postForm.userId)
    }, {
      label: '取車據點',
      done: Boolean(postForm.pickupSiteId)
    }, {
      label: '還車據點',
      done: Boolean(postForm.returnStationId)
    }, {
      label: '預定車款',
      done: Boolean(postForm.carModelId)
    }, {
      label: '車牌號',
      done: Boolean(postForm.vehicleId)
    }, {
      label: '預定日期（起）',
      done: Boolean(postForm.pickupTime)
    }, {
      label: '預定日期（止）',
      done: Boolean(postForm.returnTime)
    }, {
      label: '目的地',
      done: Boolean(postForm.destination.trim())
    }, {
      label: '用車事由',
      done: Boolean(postForm.purpose.trim())
    }]);
    const selectMember = member => {
      Object.assign(memberInfo, member);
      postForm.userId = member.userId;
      memberSearchQuery.value = '';
      memberVisible.value = false;
    };
    const selectMemberById = userId => {
      const member = members.find(item => item.userId === userId);
      if (member) {
        selectMember(member);
        return;
      }
      Object.assign(memberInfo, {
        userId: '',
        employeeNo: '',
        name: '',
        idNumber: '',
        email: '',
        phone: '',
        branch: '',
        department: '',
        supervisor: ''
      });
      postForm.userId = '';
    };
    const handlePickupSiteChange = value => {
      postForm.returnStationId = value;
      postForm.vehicleId = '';
      if (getModelAvailableCount(postForm.carModelId) === 0) {
        postForm.carModelId = '';
        postForm.carModel = '';
        postForm.vehicleTypeId = '';
      }
    };
    const selectModel = model => {
      if (getModelAvailableCount(model.value) === 0) {
        feedback.ElMessage.warning('當前據點沒有該車款的可預約車輛');
        return;
      }
      postForm.carModelId = model.value;
      postForm.carModel = model.label;
      postForm.vehicleTypeId = model.vehicleTypeId;
      postForm.vehicleId = '';
    };
    const handleVehicleChange = value => {
      const selected = vehicleOptions.find(item => item.value === value);
      postForm.vehicleTypeId = selected?.vehicleTypeId || postForm.vehicleTypeId;
    };
    const goBack = () => {
      if (history.length > 1) history.back();else feedback.ElMessage.info('當前爲獨立原型預覽');
    };
    const resetForNextOrder = () => {
      orderSuccessVisible.value = false;
      postForm.destination = '';
      postForm.purpose = '';
    };
    const submitOrder = () => {
      const missing = requiredChecklist.value.filter(item => !item.done).map(item => item.label);
      if (missing.length) {
        feedback.ElMessage.warning(`請先完成：${missing.join('、')}`);
        return;
      }
      const start = new Date(postForm.pickupTime);
      const end = new Date(postForm.returnTime);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        feedback.ElMessage.warning('預定日期（止）必須晚於預定日期（起）');
        return;
      }
      const selectedVehicle = vehicleOptions.find(item => item.value === postForm.vehicleId);
      if (!selectedVehicle || selectedVehicle.status !== '可預約') {
        feedback.ElMessage.warning('當前車輛不可預約，請重新選擇車牌號');
        return;
      }
      const now = new Date();
      const pad = num => String(num).padStart(2, '0');
      Object.assign(createdOrder, {
        orderNo: `OC-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${String(Date.now()).slice(-4)}`,
        statusText: '已預約',
        approvalText: '按企業設定判斷',
        vehicle: selectedVehicleLabel.value,
        leaseTerm: leaseTermResult.value
      });
      orderSuccessVisible.value = true;
    };
    return {
      memberVisible,
      memberKeyword,
      memberSearchQuery,
      employeeFilterBranch,
      employeeFilterDepartment,
      memberInfo,
      postForm,
      branchOptions,
      departmentOptions,
      siteOptions,
      modelOptions,
      filteredMembers,
      memberSelectOptions,
      filteredVehicleOptions,
      selectedSiteLabel,
      selectedModelLabel,
      selectedVehicleLabel,
      reservationTimeLabel,
      memberInitial,
      leaseTermResult,
      getModelAvailableCount,
      filterMember,
      selectMember,
      selectMemberById,
      handlePickupSiteChange,
      selectModel,
      handleVehicleChange,
      goBack,
      resetForNextOrder,
      submitOrder,
      orderSuccessVisible,
      createdOrder,
      ElMessage: feedback.ElMessage,
      addDays,
      members,
      vehicleOptions,
      formatDateTime,
      requiredChecklist
    };
  }
  return pageSetup();
}
export default function EnterpriseOfficialOrderAddBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="enterprise-official-order-add" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="official-add-page" data-rimo-layout="filters"><div className="official-back-row"><RimoElement kind="el-button" plain={true} onClick={event => {
            view.goBack?.(event);
          }}><RimoElement kind="el-icon" className="mr-1"><RimoIcon name="ArrowLeft" /></RimoElement>
{text("\n                  返回\n                ")}</RimoElement>
<RimoElement kind="el-tag" effect="plain" type="info">{text("公務車預約")}</RimoElement></div>
<div className="official-layout"><div className="official-main-column"><div className="official-top-grid"><RimoElement kind="el-card" shadow="never" bodyClass="!p-0" slots={{
                "header": _slot => <><div className="official-card-header"><RimoElement kind="el-icon"><RimoIcon name="User" /></RimoElement>
{text("\n                          員工資料\n                        ")}</div></>
              }}><div className="official-card-body"><div className="official-section-label"><span className="official-required">{text("*")}</span>
<strong>{text("用車員工")}</strong></div>
<div className="employee-search-row"><RimoElement kind="el-select" modelValue={view.postForm.userId} onModelChange={value => {
                      model.write(["postForm", "userId"], value);
                    }} filterable={true} clearable={true} filterMethod={view.filterMember} placeholder="搜索員工（姓名/證件號/手機號/郵箱）" className="flex-1 official-member-select" size="default" onChange={event => {
                      view.selectMemberById?.(event);
                    }} slots={{
                      "prefix": _slot => <><RimoElement kind="el-icon"><RimoIcon name="Search" /></RimoElement></>
                    }}>{rimoEntries(view.memberSelectOptions).map(([member], _itemIndex) => <Fragment key={member.userId}><RimoElement kind="el-option" key={member.userId} label={member.name + '（' + member.employeeNo + '）'} value={member.userId} className="official-member-option-item"><div className="official-member-option"><div className="official-member-option-main"><span className="official-member-option-name">{rimoText(member.name)}</span>
<span className="official-member-option-identity">{rimoText(member.employeeNo)}{text(" · ")}{rimoText(member.phone)}</span></div>
<div className="official-member-option-meta"><span className="official-member-option-identity">{rimoText(member.idNumber)}</span>
<span className="official-member-option-contact">{rimoText(member.email)}</span></div></div></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={_event => {
                      model.write(["memberVisible"], true);
                    }}>{text("選擇員工")}</RimoElement></div>
{view.memberInfo.name ? <><div className="employee-preview"><div className="flex min-w-0 items-center gap-3"><div className="employee-avatar">{rimoText(view.memberInitial)}</div>
<div className="min-w-0"><div className="employee-name">{rimoText(view.memberInfo.name)}</div>
<div className="employee-meta">{rimoText(view.memberInfo.phone)}{text(" · ")}{rimoText(view.memberInfo.email)}</div>
<div className="employee-meta">{rimoText(view.memberInfo.branch)}{text(" / ")}{rimoText(view.memberInfo.department)}</div></div></div>
<RimoElement kind="el-tag" size="small" effect="plain">{text("主管：")}{rimoText(view.memberInfo.supervisor)}</RimoElement></div></> : null}</div></RimoElement>
<RimoElement kind="el-card" shadow="never" bodyClass="!p-0" slots={{
                "header": _slot => <><div className="official-card-header"><RimoElement kind="el-icon"><RimoIcon name="Calendar" /></RimoElement>
{text("\n                          用車資料\n                        ")}</div></>
              }}><div className="official-card-body"><div className="official-form-grid"><div className="official-form-field"><div className="official-section-label"><span className="official-required">{text("*")}</span>
<strong>{text("取車據點")}</strong></div>
<RimoElement kind="el-select" modelValue={view.postForm.pickupSiteId} onModelChange={value => {
                        model.write(["postForm", "pickupSiteId"], value);
                      }} filterable={true} placeholder="選擇取車據點" className="w-full" size="default" onChange={event => {
                        view.handlePickupSiteChange?.(event);
                      }}>{rimoEntries(view.siteOptions).map(([site], _itemIndex) => <Fragment key={site.value}><RimoElement kind="el-option" key={site.value} label={site.label} value={site.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="official-form-field"><div className="official-section-label"><span className="official-required">{text("*")}</span>
<strong>{text("預定日期（起）")}</strong></div>
<RimoElement kind="el-date-picker" modelValue={view.postForm.pickupTime} onModelChange={value => {
                        model.write(["postForm", "pickupTime"], value);
                      }} type="datetime" placeholder="選擇取車時間" format="YYYY/MM/DD HH:mm" className="w-full" style={rimoStyle("width: 100%")} size="default"></RimoElement></div>
<div className="official-form-field"><div className="official-section-label"><span className="official-required">{text("*")}</span>
<strong>{text("還車據點")}</strong></div>
<RimoElement kind="el-select" modelValue={view.postForm.returnStationId} onModelChange={value => {
                        model.write(["postForm", "returnStationId"], value);
                      }} disabled={true} placeholder="自動回顯" className="w-full" size="default">{rimoEntries(view.siteOptions).map(([site], _itemIndex) => <Fragment key={site.value}><RimoElement kind="el-option" key={site.value} label={site.label} value={site.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="official-form-field"><div className="official-section-label"><span className="official-required">{text("*")}</span>
<strong>{text("預定日期（止）")}</strong></div>
<RimoElement kind="el-date-picker" modelValue={view.postForm.returnTime} onModelChange={value => {
                        model.write(["postForm", "returnTime"], value);
                      }} type="datetime" placeholder="選擇還車時間" format="YYYY/MM/DD HH:mm" className="w-full" style={rimoStyle("width: 100%")} size="default"></RimoElement></div></div>
<div className="duration-banner">{text("\n                          預計租期：")}
<strong>{rimoText(view.leaseTermResult || '請選擇完整時間')}</strong>
{text("，取還車據點保持一致。\n                        ")}</div></div></RimoElement></div>
<RimoElement kind="el-card" shadow="never" bodyClass="!p-0" slots={{
              "header": _slot => <><div className="official-card-header"><RimoElement kind="el-icon"><RimoIcon name="Van" /></RimoElement>
{text("\n                        選擇車款和車輛\n                      ")}</div></>
            }}><div className="official-card-body"><div className="vehicle-model-grid">{rimoEntries(view.modelOptions).map(([model], _itemIndex) => <Fragment key={model.value}><div key={model.value} className={rimoClass(["vehicle-model-card", rimoClass({
                      'is-selected': view.postForm.carModelId === model.value,
                      'is-disabled': view.getModelAvailableCount(model.value) === 0
                    })])} onClick={_event => {
                      view.selectModel(model);
                    }}><RimoElement kind="el-tag" className="vehicle-count" size="small" type={view.getModelAvailableCount(model.value) > 0 ? 'success' : 'danger'} effect="light">{text("\n                            ")}{rimoText(view.getModelAvailableCount(model.value) > 0 ? '剩' + view.getModelAvailableCount(model.value) : '無可用車')}{text("\n                          ")}</RimoElement>
<div className="vehicle-model-name">{rimoText(model.label)}</div>
<div className="vehicle-model-desc">{rimoText(model.desc)}</div>
<div className="mt-3 flex items-center justify-between"><span className="text-xs text-gray-400">{rimoText(model.vehicleTypeLabel)}</span>
<div className={rimoClass(["flex h-4 w-4 items-center justify-center rounded-full border", rimoClass(view.postForm.carModelId === model.value ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary)]' : 'border-gray-300')])}>{view.postForm.carModelId === model.value ? <><RimoElement kind="el-icon" className="scale-75 text-white"><RimoIcon name="Check" /></RimoElement></> : null}</div></div></div></Fragment>)}</div>
<div className="vehicle-select-row"><div><div className="official-section-label"><span className="official-required">{text("*")}</span>
<strong>{text("預定車款")}</strong></div>
<RimoElement kind="el-input" modelValue={view.selectedModelLabel} readOnly={true} placeholder="請從上方選擇車款"></RimoElement></div>
<div><div className="official-section-label"><span className="official-required">{text("*")}</span>
<strong>{text("車牌號")}</strong></div>
<RimoElement kind="el-select" modelValue={view.postForm.vehicleId} onModelChange={value => {
                      model.write(["postForm", "vehicleId"], value);
                    }} filterable={true} placeholder="選擇車牌號" className="w-full" onChange={event => {
                      view.handleVehicleChange?.(event);
                    }}>{rimoEntries(view.filteredVehicleOptions).map(([vehicle], _itemIndex) => <Fragment key={vehicle.value}><RimoElement kind="el-option" key={vehicle.value} label={vehicle.label} value={vehicle.value} disabled={vehicle.status !== '可預約'}><div className="flex items-center justify-between gap-3"><span>{rimoText(vehicle.label)}</span>
<RimoElement kind="el-tag" size="small" type={vehicle.status === '可預約' ? 'success' : 'warning'} effect="plain">{rimoText(vehicle.status)}</RimoElement></div></RimoElement></Fragment>)}</RimoElement></div></div></div></RimoElement>
<RimoElement kind="el-card" shadow="never" bodyClass="!p-0" slots={{
              "header": _slot => <><div className="official-card-header"><RimoElement kind="el-icon"><RimoIcon name="Document" /></RimoElement>
{text("\n                        用車說明\n                      ")}</div></>
            }}><div className="official-card-body"><div className="purpose-grid"><div><div className="official-section-label"><strong>{text("同行人數")}</strong></div>
<RimoElement kind="el-input-number" modelValue={view.postForm.passengerCount} onModelChange={value => {
                      model.write(["postForm", "passengerCount"], value);
                    }} min={1} max={8}></RimoElement></div>
<div><div className="official-section-label"><span className="official-required">{text("*")}</span>
<strong>{text("目的地")}</strong></div>
<RimoElement kind="el-input" modelValue={view.postForm.destination} onModelChange={value => {
                      model.write(["postForm", "destination"], value);
                    }} placeholder="例如：臺北客戶辦公室 / 桃園廠區"></RimoElement></div></div>
<div className="mt-3"><div className="official-section-label"><span className="official-required">{text("*")}</span>
<strong>{text("用車事由")}</strong></div>
<RimoElement kind="el-input" modelValue={view.postForm.purpose} onModelChange={value => {
                    model.write(["postForm", "purpose"], value);
                  }} type="textarea" rows={3} maxLength="80" showWordLimit={true} placeholder="例如：外部拜訪、跨廠區會議、接待用車"></RimoElement></div></div></RimoElement></div>
<div className="official-side-column"><div className="official-sticky"><RimoElement kind="el-card" shadow="hover" bodyClass="!p-0" className="!border-[color:var(--app-color-primary-light-8)]" slots={{
                "header": _slot => <><div className="official-card-header"><RimoElement kind="el-icon"><RimoIcon name="Tickets" /></RimoElement>
{text("\n                          預約摘要\n                        ")}</div></>
              }}><div className="official-card-body"><div className="summary-list"><div className="summary-row"><span className="summary-label">{text("用車員工")}</span>
<span className="summary-value">{rimoText(view.memberInfo.name || '未選擇')}</span></div>
<div className="summary-row"><span className="summary-label">{text("取還車據點")}</span>
<span className="summary-value">{rimoText(view.selectedSiteLabel || '未選擇')}</span></div>
<div className="summary-row"><span className="summary-label">{text("預定時間")}</span>
<span className="summary-value">{rimoText(view.reservationTimeLabel)}</span></div>
<div className="summary-row"><span className="summary-label">{text("預定車款")}</span>
<span className="summary-value">{rimoText(view.selectedModelLabel || '未選擇')}</span></div>
<div className="summary-row"><span className="summary-label">{text("車牌號")}</span>
<span className="summary-value">{rimoText(view.selectedVehicleLabel || '未選擇')}</span></div>
<div className="summary-row"><span className="summary-label">{text("預計租期")}</span>
<span className="summary-value text-[color:var(--app-color-primary)]">{rimoText(view.leaseTermResult || '未計算')}</span></div>
<div className="summary-row"><span className="summary-label">{text("目的地")}</span>
<span className="summary-value">{rimoText(view.postForm.destination || '未填寫')}</span></div></div>
<div className="approval-note">{text("\n                          提交後將依企業預約審批設定，自動判斷是否進入主管或管理員審覈。\n                        ")}</div>
<RimoElement kind="el-button" type="primary" className="submit-button" onClick={event => {
                    view.submitOrder?.(event);
                  }}>{text("\n                          建立公務車訂單\n                        ")}</RimoElement></div></RimoElement></div></div></div></div></div><RimoElement kind="el-dialog" modelValue={view.memberVisible} onModelChange={value => {
      model.write(["memberVisible"], value);
    }} title="選擇員工" width="960px" destroyOnClose={true} className="official-employee-dialog official-order-add-overlay">{() => <><div className="employee-dialog-note">{text("可先篩選分公司、部門，再搜索具體員工。")}</div>
<div className="employee-filter-bar"><RimoElement kind="el-select" modelValue={view.employeeFilterBranch} onModelChange={value => {
            model.write(["employeeFilterBranch"], value);
          }} clearable={true} placeholder="全部分公司">{rimoEntries(view.branchOptions).map(([branch], _itemIndex) => <Fragment key={branch}><RimoElement kind="el-option" key={branch} label={branch} value={branch}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-select" modelValue={view.employeeFilterDepartment} onModelChange={value => {
            model.write(["employeeFilterDepartment"], value);
          }} clearable={true} placeholder="全部部門">{rimoEntries(view.departmentOptions).map(([department], _itemIndex) => <Fragment key={department}><RimoElement kind="el-option" key={department} label={department} value={department}></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-input" modelValue={view.memberKeyword} onModelChange={value => {
            model.write(["memberKeyword"], value);
          }} prefixIcon={rimoIcons.Search} clearable={true} placeholder="搜索姓名 / 證件號 / 手機號 / Email"></RimoElement></div>
<RimoElement kind="el-table" data={view.filteredMembers} border={true} height="360" className="official-employee-table" tableLayout="fixed"><RimoElement kind="el-table-column" prop="employeeNo" label="員工編號" width="132"></RimoElement>
<RimoElement kind="el-table-column" prop="name" label="姓名" width="92"></RimoElement>
<RimoElement kind="el-table-column" prop="branch" label="分公司" width="118"></RimoElement>
<RimoElement kind="el-table-column" prop="department" label="部門" width="126"></RimoElement>
<RimoElement kind="el-table-column" prop="phone" label="手機號" width="132"></RimoElement>
<RimoElement kind="el-table-column" prop="email" label="Email" minWidth="180" showOverflowTooltip={true}></RimoElement>
<RimoElement kind="el-table-column" label="操作" width="72" fixed="right" slots={{
            "default": ({
              row
            }) => <><RimoElement kind="el-button" type="primary" link={true} onClick={_event => {
                view.selectMember(row);
              }}>{text("選擇")}</RimoElement></>
          }}></RimoElement></RimoElement></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.orderSuccessVisible} onModelChange={value => {
      model.write(["orderSuccessVisible"], value);
    }} title="公務車訂單已建立" width="520px" center={true} destroyOnClose={true} closeOnClickModal={false} className="official-order-add-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" className="flex-1" onClick={event => {
            view.resetForNextOrder?.(event);
          }}>{text("繼續建立")}</RimoElement>
<RimoElement kind="el-button" type="primary" className="flex-1" onClick={event => {
            view.goBack?.(event);
          }}>{text("返回訂單列表")}</RimoElement></div></>
    }}>{() => <><div className="space-y-4"><div className="text-center"><div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600"><RimoElement kind="el-icon" className="text-3xl"><RimoIcon name="CircleCheck" /></RimoElement></div>
<div className="text-lg font-bold text-gray-900">{rimoText(view.createdOrder.orderNo)}</div>
<div className="mt-1 text-xs text-gray-500">{text("訂單已寫入公務車訂單列表，並保留員工、車輛、據點與預定時間快照。")}</div></div>
<div className="grid grid-cols-2 gap-3" data-rimo-grid="2"><div className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="mb-1 text-xs text-gray-400">{text("訂單狀態")}</div>
<div className="font-bold text-gray-800">{rimoText(view.createdOrder.statusText)}</div></div>
<div className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="mb-1 text-xs text-gray-400">{text("審覈狀態")}</div>
<div className="font-bold text-gray-800">{rimoText(view.createdOrder.approvalText)}</div></div>
<div className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="mb-1 text-xs text-gray-400">{text("車輛")}</div>
<div className="font-bold text-gray-800">{rimoText(view.createdOrder.vehicle)}</div></div>
<div className="rounded-lg border border-gray-100 bg-gray-50 p-3"><div className="mb-1 text-xs text-gray-400">{text("租期")}</div>
<div className="font-bold text-gray-800">{rimoText(view.createdOrder.leaseTerm)}</div></div></div></div></>}</RimoElement></RimoRoot>;
}