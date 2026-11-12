import { Fragment } from 'react';
import { useRimoModel, rimoEntries } from '../../lib/rimo-model.js';
import { RimoRoot, RimoIcon, rimoIcons, useRimoEnvironment } from '../../lib/RimoEnvironment.jsx';
import { RimoElement, rimoClass, rimoText } from '../../lib/RimoElements.jsx';
import './new-order-one-way.css';
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
      derived: computed,
      watch: watch
    } = model;
    const {
      ElMessage: _ElMessage
    } = feedback;
    const isSameStation = false;
    const reservationType = ref('personal');
    const customers = ref([{
      id: 1,
      name: '王小明',
      idNumber: 'A123456789',
      phone: '0912-345-678',
      email: 'xiaoming@example.com',
      levelType: 'warning',
      levelName: '金牌會員',
      zBalance: 3500,
      enterprise: {
        id: 'ent_001',
        name: '谷歌信息技術有限公司'
      }
    }, {
      id: 2,
      name: '李大壯',
      idNumber: 'B223456789',
      phone: '0988-111-222',
      email: 'dazhuang@example.com',
      levelType: 'info',
      levelName: '普通會員',
      zBalance: 200
    }, {
      id: 3,
      name: '張曉華',
      idNumber: 'C323456789',
      phone: '0933-444-555',
      email: 'xiaohua@example.com',
      levelType: 'danger',
      levelName: '黑鑽會員',
      zBalance: 12000,
      enterprise: {
        id: 'ent_002',
        name: '微軟中國'
      }
    }]);
    const customerSearchQuery = ref('');
    const filterCustomer = query => {
      customerSearchQuery.value = (query || '').trim().toLowerCase();
    };
    const filteredCustomers = computed(() => {
      const query = customerSearchQuery.value;
      if (!query) return customers.value;
      return customers.value.filter(customer => [customer.name, customer.idNumber, customer.phone, customer.email].some(value => String(value || '').toLowerCase().includes(query)));
    });
    const selectedCustomerId = ref(null);
    const currentCustomer = computed(() => customers.value.find(item => item.id === selectedCustomerId.value));
    const stations = ref([{
      value: 'taipei_main',
      label: '臺北總站'
    }, {
      value: 'taipei_station',
      label: '臺北車站據點'
    }, {
      value: 'banqiao',
      label: '板橋據點'
    }, {
      value: 'taoyuan',
      label: '桃園據點'
    }]);
    const defaultPickupTime = () => {
      const value = new Date();
      value.setDate(value.getDate() + 1);
      value.setHours(9, 0, 0, 0);
      return value;
    };
    const defaultReturnTime = () => {
      const value = defaultPickupTime();
      value.setDate(value.getDate() + 1);
      return value;
    };
    const rentalData = reactive({
      pickupLocation: 'taipei_main',
      returnLocation: 'taipei_main',
      pickupTime: isSameStation ? defaultPickupTime() : null,
      returnTime: isSameStation ? defaultReturnTime() : null
    });
    const vehicleModels = ref([{
      id: 'yaris',
      name: 'Toyota Yaris',
      desc: '小型掀背｜省油靈活',
      price: 1200,
      available: 5,
      deposit: 5000,
      plates: ['RBC-1201', 'RBC-1208', 'RBC-1215']
    }, {
      id: 'altis',
      name: 'Toyota Altis',
      desc: '舒適轎車｜適合日常與商務',
      price: 1600,
      available: 3,
      deposit: 6000,
      plates: ['RDA-3302', 'RDA-3310']
    }, {
      id: 'rav4',
      name: 'Toyota RAV4',
      desc: '中型 SUV｜空間充足',
      price: 2300,
      available: 2,
      deposit: 8000,
      plates: ['RAV-5208', 'RAV-5216']
    }, {
      id: 'model3',
      name: 'Tesla Model 3',
      desc: '純電轎車｜科技座艙',
      price: 2800,
      available: 1,
      deposit: 10000,
      plates: ['EVC-7788']
    }]);
    const selectedVehicleModelId = ref(null);
    const selectedVehicleModel = computed(() => vehicleModels.value.find(item => item.id === selectedVehicleModelId.value));
    const selectedPlateNo = ref('');
    const availablePlates = computed(() => selectedVehicleModel.value ? selectedVehicleModel.value.plates : []);
    const insurancePlans = ref([{
      id: 'basic',
      name: '基礎安心方案',
      dailyPrice: 150
    }, {
      id: 'standard',
      name: '安心保障方案',
      dailyPrice: 250
    }, {
      id: 'premium',
      name: '全方位保障方案',
      dailyPrice: 400
    }]);
    const insuranceEnabled = ref(false);
    const selectedInsuranceId = ref('basic');
    const selectedInsurance = computed(() => insurancePlans.value.find(item => item.id === selectedInsuranceId.value));
    const marketingPlans = ref([{
      id: 'personal_weekday',
      name: '個人會員平日優惠',
      rate: 0.9,
      scope: 'personal'
    }, {
      id: 'personal_gold',
      name: '金牌會員專享折扣',
      rate: 0.85,
      scope: 'personal',
      levels: ['金牌會員', '黑鑽會員']
    }, {
      id: 'enterprise_staff',
      name: '企業員工用車方案',
      rate: 0.82,
      scope: 'enterprise'
    }]);
    const selectedMarketingPlanId = ref('none');
    const availableMarketingPlans = computed(() => {
      if (!currentCustomer.value) return [];
      const scope = reservationType.value === 'enterprise' ? 'enterprise' : 'personal';
      return marketingPlans.value.filter(plan => plan.scope === scope && (!plan.levels || plan.levels.includes(currentCustomer.value.levelName)));
    });
    const selectedMarketingPlan = computed(() => availableMarketingPlans.value.find(item => item.id === selectedMarketingPlanId.value));
    const parkingBenefits = ref([{
      id: 'parking_100',
      name: '停車費折抵 100',
      amount: 100
    }, {
      id: 'parking_200',
      name: '停車費折抵 200',
      amount: 200
    }]);
    const selectedParkingBenefitId = ref('parking_100');
    const selectedParkingBenefit = computed(() => parkingBenefits.value.find(item => item.id === selectedParkingBenefitId.value));
    const discountCodes = ref([{
      id: 'discount_spring_100',
      code: 'SPRING100',
      name: '春季出行優惠',
      discountType: '固定金額折抵',
      estimatedAmount: 100,
      amount: 100
    }, {
      id: 'discount_weekday_10',
      code: 'WEEKDAY10',
      name: '平日租金優惠',
      discountType: '租金 10% 折抵',
      estimatedAmount: 120,
      amount: 120
    }]);
    const selectedDiscountCodeId = ref(null);
    const availableDiscountCodes = computed(() => currentCustomer.value ? discountCodes.value : []);
    const selectedDiscountCode = computed(() => availableDiscountCodes.value.find(item => item.id === selectedDiscountCodeId.value));
    const redeemDialogVisible = ref(false);
    const redeemDialogType = ref('discount');
    const redeemDialogInput = ref('');
    const zPointsUsed = ref(0);
    const successVisible = ref(false);
    const createdOrderNo = ref('');
    const rentalDurationHours = computed(() => {
      if (!isSameStation || !rentalData.pickupTime || !rentalData.returnTime) return 24;
      const diff = new Date(rentalData.returnTime).getTime() - new Date(rentalData.pickupTime).getTime();
      return Math.max(0, diff / 3600000);
    });
    const rentalDays = computed(() => Math.max(1, Math.ceil(rentalDurationHours.value / 24)));
    const rentalDurationLabel = computed(() => {
      if (!isSameStation) return '按實際使用計費';
      if (rentalDurationHours.value <= 0) return '0小時';
      const days = Math.floor(rentalDurationHours.value / 24);
      const hours = Math.round(rentalDurationHours.value % 24);
      return `${days > 0 ? days + '天' : ''}${hours > 0 ? hours + '小時' : ''}` || '1天';
    });
    const rentalBillingLabel = computed(() => isSameStation ? `${rentalDays.value}天` : '基礎費用');
    const baseRentalTotal = computed(() => selectedVehicleModel.value ? selectedVehicleModel.value.price * (isSameStation ? rentalDays.value : 1) : 0);
    const insuranceFee = computed(() => insuranceEnabled.value && selectedInsurance.value ? selectedInsurance.value.dailyPrice * (isSameStation ? rentalDays.value : 1) : 0);
    const marketingDiscountAmount = computed(() => selectedMarketingPlan.value ? Math.round(baseRentalTotal.value * (1 - selectedMarketingPlan.value.rate)) : 0);
    const parkingBenefitAmount = computed(() => !isSameStation && selectedParkingBenefit.value ? selectedParkingBenefit.value.amount : 0);
    const discountCodeAmount = computed(() => selectedDiscountCode.value ? selectedDiscountCode.value.amount : 0);
    const zPointsAmount = computed(() => Math.floor(zPointsUsed.value / 10));
    const finalTotal = computed(() => Math.max(0, baseRentalTotal.value + insuranceFee.value - marketingDiscountAmount.value - parkingBenefitAmount.value - discountCodeAmount.value - zPointsAmount.value));
    const preAuthAmount = computed(() => selectedVehicleModel.value ? selectedVehicleModel.value.deposit : 0);
    const handleCustomerSelect = () => {
      customerSearchQuery.value = '';
      reservationType.value = 'personal';
      selectedMarketingPlanId.value = 'none';
      selectedDiscountCodeId.value = null;
      zPointsUsed.value = 0;
    };
    const syncReturnLocation = () => {
      if (isSameStation) rentalData.returnLocation = rentalData.pickupLocation;
    };
    const selectVehicleModel = vehicle => {
      if (vehicle.available <= 0) return;
      selectedVehicleModelId.value = vehicle.id;
      selectedPlateNo.value = '';
    };
    const openRedeemDialog = type => {
      if (!currentCustomer.value) return feedback.ElMessage.warning('請先選擇客戶');
      redeemDialogType.value = type;
      redeemDialogInput.value = '';
      redeemDialogVisible.value = true;
    };
    const confirmRedeem = () => {
      const code = redeemDialogInput.value.trim().toUpperCase();
      if (!code) return feedback.ElMessage.warning('請輸入兌換碼');
      if (redeemDialogType.value === 'discount') {
        const matched = availableDiscountCodes.value.find(item => item.code === code);
        if (!matched) return feedback.ElMessage.warning('兌換碼無效或當前客戶不可用');
        selectedDiscountCodeId.value = matched.id;
        feedback.ElMessage.success('折扣碼已套用');
      } else {
        const zPointsByCode = {
          Z500: 500,
          Z1000: 1000,
          Z3000: 3000
        };
        const points = zPointsByCode[code];
        if (!points) return feedback.ElMessage.warning('Z 遊金兌換碼無效');
        zPointsUsed.value = Math.min(currentCustomer.value.zBalance, points);
        feedback.ElMessage.success(`已兌換 ${zPointsUsed.value} Z 遊金`);
      }
      redeemDialogVisible.value = false;
    };
    const submitOrder = () => {
      if (!currentCustomer.value) return feedback.ElMessage.warning('請選擇客戶');
      if (!rentalData.pickupLocation) return feedback.ElMessage.warning('請選擇取車據點');
      if (isSameStation && (!rentalData.pickupTime || !rentalData.returnTime)) return feedback.ElMessage.warning('請選擇取還車時間');
      if (isSameStation && rentalDurationHours.value <= 0) return feedback.ElMessage.warning('還車時間必須晚於取車時間');
      if (!selectedVehicleModel.value) return feedback.ElMessage.warning('請選擇預定車款');
      if (!selectedPlateNo.value) return feedback.ElMessage.warning('請選擇車輛');
      if (insuranceEnabled.value && !selectedInsurance.value) return feedback.ElMessage.warning('請選擇保險方案');
      createdOrderNo.value = `${isSameStation ? 'SSR' : 'OWR'}-${Date.now().toString().slice(-8)}`;
      successVisible.value = true;
    };
    const goBack = () => feedback.ElMessage.info('返回訂單列表');
    watch(reservationType, () => {
      selectedMarketingPlanId.value = 'none';
      if (reservationType.value === 'enterprise' && !currentCustomer.value?.enterprise) reservationType.value = 'personal';
    });
    return {
      reservationType,
      customers,
      filteredCustomers,
      selectedCustomerId,
      currentCustomer,
      filterCustomer,
      stations,
      rentalData,
      vehicleModels,
      selectedVehicleModelId,
      selectedVehicleModel,
      selectedPlateNo,
      availablePlates,
      insurancePlans,
      insuranceEnabled,
      selectedInsuranceId,
      selectedInsurance,
      insuranceFee,
      selectedMarketingPlanId,
      availableMarketingPlans,
      parkingBenefits,
      selectedParkingBenefitId,
      availableDiscountCodes,
      selectedDiscountCodeId,
      selectedDiscountCode,
      zPointsUsed,
      zPointsAmount,
      redeemDialogVisible,
      redeemDialogType,
      redeemDialogInput,
      rentalDurationLabel,
      rentalBillingLabel,
      baseRentalTotal,
      marketingDiscountAmount,
      parkingBenefitAmount,
      discountCodeAmount,
      finalTotal,
      preAuthAmount,
      successVisible,
      createdOrderNo,
      handleCustomerSelect,
      syncReturnLocation,
      selectVehicleModel,
      openRedeemDialog,
      confirmRedeem,
      submitOrder,
      goBack,
      ArrowLeft: rimoIcons.ArrowLeft,
      ElMessage: feedback.ElMessage,
      isSameStation,
      customerSearchQuery,
      defaultPickupTime,
      defaultReturnTime,
      marketingPlans,
      selectedMarketingPlan,
      selectedParkingBenefit,
      discountCodes,
      rentalDurationHours,
      rentalDays
    };
  }
  return pageSetup();
}
export default function NewOrderOneWayBlock() {
  const model = useRimoModel(createPageState);
  const view = model.view;
  const {
    text
  } = useRimoEnvironment();
  return <RimoRoot model={model} pageKey="new-order-one-way" assets={{}}><div data-business-content="" data-rimo-layout="page"><div className="w-full mx-auto"><div className="mb-4 flex items-center justify-between"><RimoElement kind="el-button" onClick={event => {
            view.goBack?.(event);
          }} icon={view.ArrowLeft} plain={true}>{text("返回")}</RimoElement>
<RimoElement kind="el-tag" effect="plain" type="info">{text("甲租乙還")}</RimoElement></div>
<div className="grid grid-cols-12 gap-5 items-start new-order-layout" data-rimo-grid="12" data-rimo-layout="form-grid"><div className="col-span-9 space-y-4 new-order-main-column"><div className="grid grid-cols-2 gap-4 new-order-intro-grid" data-rimo-grid="2" data-rimo-layout="form-grid"><RimoElement kind="el-card" shadow="never" className="!border-gray-200 !rounded-lg h-full flex flex-col" bodyClass="!p-4 flex-1" slots={{
                "header": _slot => <><div className="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="User" /></RimoElement>
{text(" 客戶信息\n                                                ")}</div></>
              }}><div className="block"><RimoElement kind="el-form" labelPosition="top" size="default"><RimoElement kind="el-select" modelValue={view.selectedCustomerId} onModelChange={value => {
                      model.write(["selectedCustomerId"], value);
                    }} placeholder="搜索客戶（姓名/證件號/手機號/郵箱）" filterable={true} clearable={true} filterMethod={view.filterCustomer} className="w-full mb-3" onChange={event => {
                      view.handleCustomerSelect?.(event);
                    }}>{rimoEntries(view.filteredCustomers).map(([c], _itemIndex) => <Fragment key={c.id}><RimoElement kind="el-option" key={c.id} className="customer-option" label={c.name + ' (' + c.phone + ')'} value={c.id}><div className="customer-option-content flex flex-col gap-0.5"><div className="flex items-center justify-between gap-4 text-sm leading-5"><span className="font-medium text-slate-800">{rimoText(c.name)}</span>
<span className="text-xs text-gray-500">{rimoText(c.phone)}</span></div>
<div className="flex items-center justify-between gap-4 text-xs leading-4 text-gray-400"><span>{rimoText(c.idNumber)}</span>
<span>{rimoText(c.email)}</span></div></div></RimoElement></Fragment>)}</RimoElement>
{view.currentCustomer ? <><div className="space-y-3"><div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100"><div><div className="font-bold text-gray-900 text-sm">{rimoText(view.currentCustomer.name)}</div>
<div className="text-xs text-gray-500">{rimoText(view.currentCustomer.phone)}</div></div>
<div className="text-right"><RimoElement kind="el-tag" size="small" type={view.currentCustomer.levelType} effect="plain">{rimoText(view.currentCustomer.levelName)}</RimoElement></div></div>
<div className="bg-gray-100 p-1 rounded-lg grid grid-cols-2 gap-1 border border-gray-200" data-rimo-grid="2" data-rimo-layout="summary"><div onClick={_event => {
                            model.write(["reservationType"], 'personal');
                          }} className={rimoClass(["cursor-pointer text-center py-1.5 text-xs font-bold rounded-md transition-all duration-200", rimoClass(view.reservationType === 'personal' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700')])} data-rimo-layout="stat">{text("\n                                                                個人預訂\n                                                            ")}</div>
<div onClick={_event => {
                            view.currentCustomer.enterprise && model.write(["reservationType"], 'enterprise');
                          }} className={rimoClass(["cursor-pointer text-center py-1.5 text-xs font-bold rounded-md transition-all duration-200 relative select-none", rimoClass([view.reservationType === 'enterprise' ? 'bg-white text-[color:var(--app-color-primary)] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700', !view.currentCustomer.enterprise ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'])])} data-rimo-layout="stat">{text("\n                                                                企業預訂\n                                                            ")}</div></div>
{view.reservationType === 'enterprise' && view.currentCustomer.enterprise ? <><div className="text-xs text-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)] p-2 rounded text-center flex items-center justify-center gap-1 border border-[color:var(--app-color-primary-light-8)]"><RimoElement kind="el-icon"><RimoIcon name="OfficeBuilding" /></RimoElement>
{text(" ")}{rimoText(view.currentCustomer.enterprise.name)}{text("\n                                                        ")}</div></> : null}</div></> : <><div className="text-xs text-gray-400 text-center py-4 border border-dashed rounded bg-gray-50">{text("\n                                                        請先選擇客戶\n                                                    ")}</div></>}</RimoElement></div></RimoElement>
<RimoElement kind="el-card" shadow="never" className="!border-gray-200 !rounded-lg h-full flex flex-col" bodyClass="!p-0 flex-1" slots={{
                "header": _slot => <><div className="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Calendar" /></RimoElement>
{text(" 用車信息\n                                                ")}</div></>
              }}><div className="p-4 space-y-3"><div><div className="text-xs text-gray-500 mb-1"><span className="text-red-500">{text("*")}</span>
{text(" 取車據點")}</div>
<RimoElement kind="el-select" modelValue={view.rentalData.pickupLocation} onModelChange={value => {
                      model.write(["rentalData", "pickupLocation"], value);
                    }} className="w-full" size="default">{rimoEntries(view.stations).map(([station], _itemIndex) => <Fragment key={station.value}><RimoElement kind="el-option" key={station.value} label={station.label} value={station.value}></RimoElement></Fragment>)}</RimoElement></div>
<div className="text-xs bg-[color:var(--app-color-primary-light-9)] text-[color:var(--app-color-primary-hover)] px-3 py-2 rounded border border-[color:var(--app-color-primary-light-8)]">{text("\n                                                    甲租乙還訂單按取車據點選擇可用車款與車輛，還車據點將在還車時確認。\n                                                ")}</div></div></RimoElement></div>
<RimoElement kind="el-card" shadow="never" className="!border-gray-200 !rounded-lg" bodyClass="!p-0" slots={{
              "header": _slot => <><div className="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Van" /></RimoElement>
{text(" 選擇車款和車輛\n                                            ")}</div></>
            }}><div className="p-4"><div className="grid grid-cols-4 gap-3 new-order-vehicle-grid" data-rimo-grid="4">{rimoEntries(view.vehicleModels).map(([vehicle], _itemIndex) => <Fragment key={vehicle.id}><div key={vehicle.id} onClick={_event => {
                      view.selectVehicleModel(vehicle);
                    }} className={rimoClass(["cursor-pointer border rounded-lg p-3 relative hover:shadow-md transition-all duration-200 group bg-white", rimoClass([view.selectedVehicleModelId === vehicle.id ? 'border-[color:var(--app-color-primary)] bg-[color:var(--app-color-primary-light-9)]' : 'border-gray-200 hover:border-[color:var(--app-color-primary-light-7)]', vehicle.available <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-50 hover:shadow-none hover:border-gray-200' : ''])])}><div className="flex justify-between items-start mb-1"><div className="font-bold text-gray-800 text-sm truncate pr-2">{rimoText(vehicle.name)}</div>
<RimoElement kind="el-tag" size="small" type={vehicle.available > 0 ? 'success' : 'danger'} effect="light" className="!px-1 !h-5 !text-[10px]">{text("\n                                                            ")}{rimoText(vehicle.available > 0 ? '剩' + vehicle.available : '無庫存')}{text("\n                                                        ")}</RimoElement></div>
<div className="text-xs text-gray-500 truncate mb-2" title={vehicle.desc}>{rimoText(vehicle.desc)}</div>
<div className="flex items-end justify-between"><div className="text-[color:var(--app-color-primary)] font-bold">{rimoText(vehicle.price)}
<span className="text-xs font-normal text-gray-400">{text("/天")}</span></div>
<div className={rimoClass(["w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center transition-colors", rimoClass({
                          'bg-[color:var(--app-color-primary)] border-[color:var(--app-color-primary)]': view.selectedVehicleModelId === vehicle.id
                        })])}>{view.selectedVehicleModelId === vehicle.id ? <><RimoElement kind="el-icon" className="text-white text-xs scale-75"><RimoIcon name="Check" /></RimoElement></> : null}</div></div></div></Fragment>)}</div>
<div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 new-order-vehicle-fields" data-rimo-grid="2" data-rimo-layout="form-grid"><div><div className="text-xs text-gray-500 mb-1"><span className="text-red-500">{text("*")}</span>
{text(" 預定車款")}</div>
<RimoElement kind="el-input" modelValue={view.selectedVehicleModel ? view.selectedVehicleModel.name : ''} placeholder="請從上方選擇車款" disabled={true}></RimoElement></div>
<div><div className="text-xs text-gray-500 mb-1"><span className="text-red-500">{text("*")}</span>
{text(" 車輛")}</div>
<RimoElement kind="el-select" modelValue={view.selectedPlateNo} onModelChange={value => {
                      model.write(["selectedPlateNo"], value);
                    }} placeholder="選擇車輛（車牌號）" className="w-full" disabled={!view.selectedVehicleModel}>{rimoEntries(view.availablePlates).map(([plate], _itemIndex) => <Fragment key={plate}><RimoElement kind="el-option" key={plate} label={plate} value={plate}></RimoElement></Fragment>)}</RimoElement></div></div></div></RimoElement>
<RimoElement kind="el-card" shadow="never" className="!border-gray-200 !rounded-lg" bodyClass="!p-0" slots={{
              "header": _slot => <><div className="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Goods" /></RimoElement>
{text(" 額外服務\n                                            ")}</div></>
            }}><div className="p-0"><div className="grid grid-cols-2 divide-x divide-gray-100" data-rimo-grid="2"><div className={rimoClass(["col-span-2 p-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100", rimoClass({
                    'bg-[color:var(--app-color-primary-light-9)]': view.insuranceEnabled
                  })])}><div className="flex items-center gap-3"><RimoElement kind="el-checkbox" modelValue={view.insuranceEnabled} onModelChange={value => {
                        model.write(["insuranceEnabled"], value);
                      }} size="default"><span className="text-sm text-gray-700 font-medium">{text("保險方案")}</span></RimoElement>
<span className="text-xs text-gray-400">{text("啓用後選擇保險方案")}</span></div>
<div className="flex items-center gap-3 min-w-[360px] justify-end" data-rimo-layout="field-row"><RimoElement kind="el-select" modelValue={view.selectedInsuranceId} onModelChange={value => {
                        model.write(["selectedInsuranceId"], value);
                      }} placeholder="選擇保險方案" size="default" className="!w-56" disabled={!view.insuranceEnabled}>{rimoEntries(view.insurancePlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.id}></RimoElement></Fragment>)}</RimoElement>
<div className="text-gray-900 font-bold text-sm w-20 text-right">{rimoText(view.insuranceEnabled ? view.insuranceFee : 0)}</div></div></div></div></div></RimoElement></div>
<div className="col-span-3 new-order-summary-column"><div className="sticky-summary space-y-4"><RimoElement kind="el-card" shadow="hover" className="!border-[color:var(--app-color-primary-light-8)] !rounded-lg" bodyClass="!p-0" slots={{
                "header": _slot => <><div className="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-[color:var(--app-color-primary-light-9)] bg-[color:var(--app-color-primary-light-9)]"><RimoElement kind="el-icon" className="text-[color:var(--app-color-primary)]"><RimoIcon name="Ticket" /></RimoElement>
{text(" 優惠與折扣\n                                                ")}</div></>
              }}><div className="p-4 space-y-4"><div className="space-y-1"><div className="text-xs font-bold text-gray-600">{text("行銷優惠方案")}</div>
<RimoElement kind="el-select" modelValue={view.selectedMarketingPlanId} onModelChange={value => {
                      model.write(["selectedMarketingPlanId"], value);
                    }} size="default" className="w-full" disabled={!view.currentCustomer}><RimoElement kind="el-option" label="不使用方案" value="none"></RimoElement>
{rimoEntries(view.availableMarketingPlans).map(([plan], _itemIndex) => <Fragment key={plan.id}><RimoElement kind="el-option" key={plan.id} label={plan.name} value={plan.id}></RimoElement></Fragment>)}</RimoElement>
<div className="text-[11px] text-gray-400 leading-4">{rimoText(view.currentCustomer ? '當前展示客戶可用方案' : '選擇客戶後展示可用方案')}</div></div>
<div className="space-y-1"><div className="text-xs font-bold text-gray-600">{text("停車優惠")}</div>
<RimoElement kind="el-input" modelValue={view.selectedParkingBenefit ? `系統自動返回：${view.selectedParkingBenefit.name}` : '系統自動返回，無停車優惠'} size="default" disabled={true}></RimoElement></div>
<div className="space-y-2"><div className="text-xs font-bold text-gray-600">{text("折扣碼")}</div>
<div className="flex items-center gap-2" data-rimo-layout="field-row"><RimoElement kind="el-select" modelValue={view.selectedDiscountCodeId} onModelChange={value => {
                        model.write(["selectedDiscountCodeId"], value);
                      }} placeholder="選擇可用折扣碼" size="default" className="flex-1" disabled={!view.currentCustomer}>{rimoEntries(view.availableDiscountCodes).map(([code], _itemIndex) => <Fragment key={code.id}><RimoElement kind="el-option" key={code.id} label={code.name} value={code.id}><div className="flex flex-col gap-0.5 py-1"><div className="flex justify-between items-center text-sm"><span className="font-medium">{rimoText(code.name)}</span>
<span className="text-gray-400 text-xs">{rimoText(code.code)}</span></div>
<div className="flex justify-between text-[11px] text-gray-500"><span>{rimoText(code.discountType)}</span>
<span className="text-green-600">{text("預計優惠 ")}{rimoText(code.estimatedAmount)}</span></div></div></RimoElement></Fragment>)}</RimoElement>
<RimoElement kind="el-button" onClick={_event => {
                        view.openRedeemDialog('discount');
                      }} size="default" plain={true} className="shrink-0 !px-4" disabled={!view.currentCustomer}>{text("兌換")}</RimoElement></div>
{view.selectedDiscountCode ? <><div className="text-[11px] text-green-600">{text("\n                                                        ")}{rimoText(view.selectedDiscountCode.discountType)}{text("，預計優惠 ")}{rimoText(view.selectedDiscountCode.estimatedAmount)}</div></> : null}</div>
<div className="space-y-1"><div className="flex justify-between items-center"><div className="text-xs text-gray-600 font-bold">{text("Z遊金 ")}
<span className="font-normal text-gray-400">{text("(餘")}{rimoText(view.currentCustomer ? view.currentCustomer.zBalance : 0)}{text(")")}</span></div></div>
<div className="flex items-center gap-2" data-rimo-layout="field-row"><RimoElement kind="el-input-number" modelValue={view.zPointsUsed} onModelChange={value => {
                        model.write(["zPointsUsed"], value);
                      }} min={0} max={view.currentCustomer ? view.currentCustomer.zBalance : 0} step={100} size="default" className="!w-full" disabled={!view.currentCustomer} controlsPosition="right"></RimoElement>
<RimoElement kind="el-button" onClick={_event => {
                        view.openRedeemDialog('zpoints');
                      }} size="default" plain={true} className="!px-4" disabled={!view.currentCustomer}>{text("兌換")}</RimoElement></div></div></div></RimoElement>
<RimoElement kind="el-card" shadow="hover" className="!border-[color:var(--app-color-primary-light-8)] !bg-slate-50/50 !rounded-lg" bodyClass="!p-0" slots={{
                "header": _slot => <><div className="font-bold text-gray-900 text-base px-4 h-[45px] flex items-center border-b border-[color:var(--app-color-primary-light-8)]">{text("\n                                                    費用明細")}</div></>
              }}><div className="p-4"><div className="space-y-2 text-sm"><div className="flex justify-between text-gray-600"><span>{text("預計租金")}</span>
<span className="font-medium">{rimoText(view.baseRentalTotal)}</span></div>
{view.insuranceFee > 0 ? <><div className="flex justify-between text-gray-600"><span>{rimoText(view.selectedInsurance ? view.selectedInsurance.name : '保險方案')}</span>
<span className="font-medium">{rimoText(view.insuranceFee)}</span></div></> : null}
{view.marketingDiscountAmount > 0 || view.discountCodeAmount > 0 || view.zPointsAmount > 0 || view.parkingBenefitAmount > 0 ? <><div className="border-t border-dashed border-gray-200 my-2 pt-2 space-y-1">{view.marketingDiscountAmount > 0 ? <><div className="flex justify-between text-green-600 text-xs"><span>{text("行銷優惠方案")}</span>
<span>{text("- ")}{rimoText(view.marketingDiscountAmount)}</span></div></> : null}
{view.parkingBenefitAmount > 0 ? <><div className="flex justify-between text-green-600 text-xs"><span>{text("停車優惠")}</span>
<span>{text("- ")}{rimoText(view.parkingBenefitAmount)}</span></div></> : null}
{view.discountCodeAmount > 0 ? <><div className="flex justify-between text-green-600 text-xs"><span>{text("折扣碼")}</span>
<span>{text("- ")}{rimoText(view.discountCodeAmount)}</span></div></> : null}
{view.zPointsAmount > 0 ? <><div className="flex justify-between text-orange-500 text-xs"><span>{text("Z遊金")}</span>
<span>{text("- ")}{rimoText(view.zPointsAmount)}</span></div></> : null}</div></> : null}</div>
<div className="border-t border-gray-200 mt-4 pt-3"><div className="flex justify-between items-baseline"><span className="text-gray-600 text-sm">{text("預估總金額")}</span>
<span className="text-2xl font-bold text-[color:var(--app-color-primary)]">{rimoText(view.finalTotal)}</span></div>
<div className="mt-2 flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-2 py-1.5 rounded border border-blue-100"><span>{text("預授權金額")}</span>
<span className="font-bold">{rimoText(view.preAuthAmount)}</span></div></div>
<RimoElement kind="el-button" type="primary" size="large" className="w-full mt-4 !rounded-lg !h-10 !text-base !font-bold shadow-lg shadow-[color:var(--app-color-primary-shadow)]" onClick={event => {
                    view.submitOrder?.(event);
                  }}>{text("創建訂單")}</RimoElement></div></RimoElement></div></div></div></div></div><RimoElement kind="el-dialog" modelValue={view.redeemDialogVisible} onModelChange={value => {
      model.write(["redeemDialogVisible"], value);
    }} title={view.redeemDialogType === 'discount' ? '兌換折扣碼' : '兌換 Z 遊金'} width="440px" className="new-order-one-way-overlay" closeOnClickModal={false} slots={{
      "footer": _slot => <><div className="flex justify-end gap-2"><RimoElement kind="el-button" onClick={_event => {
            model.write(["redeemDialogVisible"], false);
          }}>{text("取消")}</RimoElement>
<RimoElement kind="el-button" type="primary" onClick={event => {
            view.confirmRedeem?.(event);
          }}>{text("確認兌換")}</RimoElement></div></>
    }}>{() => <><div className="space-y-3"><div className="text-sm text-gray-600">{rimoText(view.redeemDialogType === 'discount' ? '請輸入客戶可用的折扣碼，兌換成功後會自動套用。' : '請輸入 Z 遊金兌換碼，兌換成功後會帶入本次抵扣。')}</div>
<RimoElement kind="el-input" modelValue={view.redeemDialogInput} onModelChange={value => {
            model.write(["redeemDialogInput"], value);
          }} placeholder="輸入兌換碼" clearable={true} onKeyUp={event => {
            if (event.key !== 'Enter') return;
            view.confirmRedeem?.(event);
          }}></RimoElement></div></>}</RimoElement>
<RimoElement kind="el-dialog" modelValue={view.successVisible} onModelChange={value => {
      model.write(["successVisible"], value);
    }} title="訂單創建成功" width="500px" center={true} closeOnClickModal={false} className="new-order-one-way-overlay" slots={{
      "footer": _slot => <><div className="flex gap-3"><RimoElement kind="el-button" className="flex-1" onClick={_event => {
            model.write(["successVisible"], false);
          }}>{text("繼續編輯")}</RimoElement>
<RimoElement kind="el-button" type="primary" className="flex-1" onClick={event => {
            view.goBack?.(event);
          }}>{text("返回訂單列表")}</RimoElement></div></>
    }}>{() => <><div className="text-center py-4"><div className="mx-auto w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3"><RimoElement kind="el-icon" className="text-3xl"><RimoIcon name="CircleCheck" /></RimoElement></div>
<div className="font-bold text-gray-900 text-lg">{rimoText(view.createdOrderNo)}</div>
<div className="text-xs text-gray-500 mt-1">{text("訂單資料已依當前頁面內容建立。")}</div></div></>}</RimoElement></RimoRoot>;
}